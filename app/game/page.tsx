"use client";

import {
  ArrowLeft,
  Crown,
  MessageCircle,
  RotateCcw,
  Send,
  SmilePlus,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/I18nProvider";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Card as GameCard,
  GameState,
  botStep,
  newGame,
  playerDone,
  playerPlay,
  playerTake,
  restartGame,
} from "@/lib/durak";

type Flight = {
  id: string;
  card: GameCard;
  from: DOMRect;
  to: DOMRect;
  rotate: number;
  duration: number;
};

type ChatItem = {
  id: string;
  side: "player" | "bot";
  text: string;
  emoji?: boolean;
};

const QUICK_REACTIONS = ["👍", "😎", "😂", "🔥", "👏", "🤝"];

function FaceCard({
  card,
  selected = false,
  onClick,
  hidden = false,
  nodeRef,
}: {
  card: GameCard;
  selected?: boolean;
  onClick?: () => void;
  hidden?: boolean;
  nodeRef?: (node: HTMLButtonElement | null) => void;
}) {
  const red = card.suit === "♥" || card.suit === "♦";

  return (
    <button
      ref={nodeRef}
      onClick={onClick}
      className={`game-card relative h-[90px] w-[62px] shrink-0 rounded-[10px] border bg-[#F7F5EE] p-1.5 text-left md:h-[128px] md:w-[88px] md:rounded-[13px] md:p-2.5 ${
        selected
          ? "selected-card border-[#F5C344] ring-2 ring-[#F5C344]/30"
          : "border-black/10"
      } ${hidden ? "invisible" : ""}`}
    >
      <div className={`text-[15px] font-black leading-none md:text-xl ${red ? "text-[#C72F3A]" : "text-[#151A20]"}`}>
        {card.rank}
      </div>
      <div className={`mt-0.5 text-[20px] leading-none md:mt-1 md:text-3xl ${red ? "text-[#C72F3A]" : "text-[#151A20]"}`}>
        {card.suit}
      </div>
      <div className={`absolute bottom-1 right-1.5 text-[27px] leading-none md:bottom-1.5 md:right-2 md:text-4xl ${red ? "text-[#C72F3A]" : "text-[#151A20]"}`}>
        {card.suit}
      </div>
    </button>
  );
}

function CardBack({
  hidden = false,
  nodeRef,
}: {
  hidden?: boolean;
  nodeRef?: (node: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={nodeRef}
      className={`game-card card-back relative h-[82px] w-[57px] shrink-0 rounded-[9px] md:h-[112px] md:w-[78px] md:rounded-xl ${
        hidden ? "invisible" : ""
      }`}
    >
      <div className="card-back-pattern" />
      <Crown className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-[#F5C344]/65" />
    </div>
  );
}

function FlyingCard({ flight, onDone }: { flight: Flight; onDone: () => void }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const dx = flight.to.left + flight.to.width / 2 - (flight.from.left + flight.from.width / 2);
    const dy = flight.to.top + flight.to.height / 2 - (flight.from.top + flight.from.height / 2);

    const anim = el.animate(
      [
        { transform: "translate3d(0,0,0) rotate(0deg) scale(1)", opacity: 1 },
        {
          transform: `translate3d(${dx}px,${dy}px,0) rotate(${flight.rotate}deg) scale(.94)`,
          opacity: 1,
        },
      ],
      {
        duration: flight.duration,
        easing: "cubic-bezier(.18,.86,.2,1)",
        fill: "forwards",
      }
    );

    anim.onfinish = onDone;
    return () => anim.cancel();
  }, [flight, onDone]);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed z-[120]"
      style={{
        left: flight.from.left,
        top: flight.from.top,
        width: flight.from.width,
        height: flight.from.height,
        transformOrigin: "center",
        filter: "drop-shadow(0 18px 25px rgba(0,0,0,.42))",
      }}
    >
      <div
        style={{
          transform: `scale(${flight.from.width / 88})`,
          transformOrigin: "top left",
        }}
      >
        <FaceCard card={flight.card} />
      </div>
    </div>
  );
}

function MiniTrump({ card }: { card: GameCard }) {
  const red = card.suit === "♥" || card.suit === "♦";
  return (
    <div className="relative h-[78px] w-[118px] overflow-hidden rounded-[11px] border border-black/10 bg-[#F7F5EE] shadow-[0_10px_22px_rgba(0,0,0,.30)]">
      <div className={`absolute left-3 top-2 text-[20px] font-black leading-none ${red ? "text-[#C72F3A]" : "text-[#151A20]"}`}>
        {card.rank}
      </div>
      <div className={`absolute left-3 top-[35px] text-[28px] leading-none ${red ? "text-[#C72F3A]" : "text-[#151A20]"}`}>
        {card.suit}
      </div>
      <div className="absolute bottom-2 right-3 text-[11px] font-bold uppercase tracking-[.10em] text-black/35">
        trump
      </div>
    </div>
  );
}

function Deck({
  game,
  deckAnchorRef,
}: {
  game: GameState;
  deckAnchorRef: (node: HTMLDivElement | null) => void;
}) {
  const trumpCard = game.deck[game.deck.length - 1] || ({
    id: "trump-placeholder",
    suit: game.trump,
    rank: "A",
  } as GameCard);

  return (
    <div className="relative h-[158px] w-[194px] shrink-0">
      {game.deck.length > 0 ? (
        <>
          {/* Face-up trump card under the deck. No CSS rotation, so it cannot deform. */}
          <div className="absolute left-[2px] top-[60px]">
            <MiniTrump card={trumpCard} />
          </div>

          <div
            ref={deckAnchorRef}
            className="absolute left-[94px] top-[13px] h-[112px] w-[78px]"
          >
            <div className="absolute left-[-7px] top-[7px] rotate-[-4deg] opacity-70">
              <CardBack />
            </div>
            <div className="absolute left-[-3px] top-[3px] rotate-[-1deg] opacity-88">
              <CardBack />
            </div>
            <div className="absolute left-0 top-0 rotate-[2deg]">
              <CardBack />
            </div>
          </div>

          <div className="absolute bottom-[0px] right-[1px] rounded-full border border-white/10 bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white/85">
            {game.deck.length} cards
          </div>
          <div className="absolute bottom-[0px] left-[3px] rounded-full border border-[#F5C344]/20 bg-[#F5C344]/10 px-2.5 py-1 text-[11px] font-semibold text-[#F5C344]">
            Trump {game.trump}
          </div>
        </>
      ) : (
        <div className="absolute inset-0 grid place-items-center rounded-2xl border border-dashed border-white/10 text-xs text-white/25">
          Deck empty
        </div>
      )}
    </div>
  );
}

function centerRect(el: HTMLElement | null, width = 88, height = 128) {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return new DOMRect(
    r.left + r.width / 2 - width / 2,
    r.top + r.height / 2 - height / 2,
    width,
    height
  );
}

export default function GamePage() {
  const router = useRouter();
  const { tr } = useI18n();

  const [game, setGame] = useState<GameState>(() => newGame());
  const [selected, setSelected] = useState<string | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [locked, setLocked] = useState(true);
  const [hiddenPlayerCard, setHiddenPlayerCard] = useState<string | null>(null);
  const [hiddenBotCard, setHiddenBotCard] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [reactionOpen, setReactionOpen] = useState(false);
  const [reaction, setReaction] = useState<{ side: "player" | "bot"; text: string } | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chat, setChat] = useState<ChatItem[]>([
    { id: "hello", side: "bot", text: "Good luck! 👋" },
  ]);

  const playerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const botRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const tableRef = useRef<HTMLDivElement | null>(null);
  const attackSlotRefs = useRef<Array<HTMLDivElement | null>>([]);
  const defenseSlotRefs = useRef<Array<HTMLDivElement | null>>([]);
  const deckAnchorRef = useRef<HTMLDivElement | null>(null);
  const botTimerRef = useRef<number | null>(null);
  const reactionTimerRef = useRef<number | null>(null);

  const selectedCard = useMemo(
    () => game.player.find((c) => c.id === selected) || null,
    [game.player, selected]
  );

  function animateFromRect(el: HTMLElement, from: DOMRect, delay = 0, rotate = 0) {
    const finalRect = el.getBoundingClientRect();
    const dx = from.left + from.width / 2 - (finalRect.left + finalRect.width / 2);
    const dy = from.top + from.height / 2 - (finalRect.top + finalRect.height / 2);

    const anim = el.animate(
      [
        { transform: `translate3d(${dx}px,${dy}px,0) rotate(${rotate}deg) scale(.88)`, opacity: .35 },
        { transform: "translate3d(0,0,0) rotate(0deg) scale(1)", opacity: 1 },
      ],
      {
        duration: 520,
        delay,
        easing: "cubic-bezier(.16,.86,.2,1)",
        fill: "both",
      }
    );
    anim.onfinish = () => anim.cancel(); // release transform so hover/select CSS never fights WAAPI
  }

  function animateElementFromDeck(el: HTMLElement, delay: number, rotate: number) {
    const deckRect = centerRect(deckAnchorRef.current, el.offsetWidth, el.offsetHeight);
    if (!deckRect) return;
    animateFromRect(el, deckRect, delay, rotate);
  }

  function captureHandRects() {
    const rects = new Map<string, DOMRect>();
    Object.entries(playerRefs.current).forEach(([id, el]) => {
      if (el) rects.set(id, el.getBoundingClientRect());
    });
    Object.entries(botRefs.current).forEach(([id, el]) => {
      if (el) rects.set(id, el.getBoundingClientRect());
    });
    return rects;
  }

  function animateHandsTransition(beforeRects: Map<string, DOMRect>, after: GameState) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        let newIndex = 0;

        after.player.forEach((c) => {
          const el = playerRefs.current[c.id];
          if (!el) return;
          const previous = beforeRects.get(c.id);
          if (previous) animateFromRect(el, previous, 0, 0);
          else {
            animateElementFromDeck(el, newIndex * 85, -8 + newIndex * 2);
            newIndex++;
          }
        });

        after.bot.forEach((c) => {
          const el = botRefs.current[c.id];
          if (!el) return;
          const previous = beforeRects.get(c.id);
          if (previous) animateFromRect(el, previous, 0, 0);
          else {
            animateElementFromDeck(el, newIndex * 85, 8 - newIndex * 2);
            newIndex++;
          }
        });
      });
    });
  }

  function slotRect(index: number, kind: "attack" | "defense") {
    const el = kind === "attack" ? attackSlotRefs.current[index] : defenseSlotRefs.current[index];
    return centerRect(el || null);
  }

  function showReaction(side: "player" | "bot", text: string) {
    setReaction({ side, text });
    if (reactionTimerRef.current) window.clearTimeout(reactionTimerRef.current);
    reactionTimerRef.current = window.setTimeout(() => setReaction(null), 1800);
  }

  function botReactSometimes() {
    if (Math.random() > 0.48) return;
    const options = ["😎", "🤔", "👏", "😂", "🔥", "👍"];
    const emoji = options[Math.floor(Math.random() * options.length)];
    window.setTimeout(() => {
      showReaction("bot", emoji);
      setChat((x) => [
        ...x,
        { id: `bot-react-${Date.now()}`, side: "bot", text: emoji, emoji: true },
      ]);
    }, 650 + Math.random() * 700);
  }

  // Initial deal. This effect is intentionally StrictMode-safe:
  // the first development pass can be cleaned up, then the second pass runs normally.
  useEffect(() => {
    setLocked(true);

    const dealTimer = window.setTimeout(() => {
      game.player.forEach((c, i) => {
        const el = playerRefs.current[c.id];
        if (el) animateElementFromDeck(el, i * 90, -14 + i * 4);
      });

      game.bot.forEach((c, i) => {
        const el = botRefs.current[c.id];
        if (el) animateElementFromDeck(el, (game.player.length + i) * 90, 14 - i * 4);
      });
    }, 180);

    const unlockTimer = window.setTimeout(() => {
      setLocked(false);
    }, 1450);

    return () => {
      window.clearTimeout(dealTimer);
      window.clearTimeout(unlockTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bot AI turn. The game state stays unchanged until the flying card lands.
  useEffect(() => {
    if (!game.botThinking || game.winner || locked || flight) return;

    if (botTimerRef.current) window.clearTimeout(botTimerRef.current);
    botTimerRef.current = window.setTimeout(() => {
      const before = game;
      const after = botStep(before);

      const beforeTableIds = new Set(
        before.table.flatMap((p) => [p.attack.id, p.defense?.id].filter(Boolean))
      );

      const addedCard =
        after.table
          .flatMap((p) => [p.attack, p.defense].filter(Boolean) as GameCard[])
          .find((c) => !beforeTableIds.has(c.id)) || null;

      const removedBot = before.bot.find((c) => !after.bot.some((x) => x.id === c.id)) || null;

      if (addedCard && removedBot) {
        const sourceEl = botRefs.current[removedBot.id];
        const from = sourceEl?.getBoundingClientRect() || centerRect(sourceEl);

        let pairIndex = 0;
        let targetKind: "attack" | "defense" = "attack";
        after.table.forEach((pair, index) => {
          if (pair.attack.id === addedCard.id) {
            pairIndex = index;
            targetKind = "attack";
          }
          if (pair.defense?.id === addedCard.id) {
            pairIndex = index;
            targetKind = "defense";
          }
        });
        const to = slotRect(pairIndex, targetKind);

        if (from && to) {
          setLocked(true);
          setHiddenBotCard(removedBot.id);
          setFlight({
            id: `bot-${addedCard.id}-${Date.now()}`,
            card: addedCard,
            from,
            to,
            rotate: game.attacker === "bot" ? 7 : -7,
            duration: 590,
          });
          return;
        }
      }

      // No card flight: bot took, ended round, or changed phase.
      const beforeRects = captureHandRects();
      setGame(after);
      animateHandsTransition(beforeRects, after);
      botReactSometimes();
    }, 1150 + Math.floor(Math.random() * 900));

    return () => {
      if (botTimerRef.current) window.clearTimeout(botTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.botThinking, game.winner, locked, flight, game.table.length, game.attacker]);

  function finishFlight() {
    if (!flight) return;

    const before = game;
    const isBotFlight = flight.id.startsWith("bot-");

    if (isBotFlight) {
      const beforeRects = captureHandRects();
      const after = botStep(before);
      setGame(after);
      setHiddenBotCard(null);
      setFlight(null);
      setLocked(false);
      animateHandsTransition(beforeRects, after);
      botReactSometimes();
      return;
    }

    if (flight.id.startsWith("player-")) {
      const cardId = hiddenPlayerCard;
      if (!cardId) {
        setFlight(null);
        setLocked(false);
        return;
      }
      const beforeRects = captureHandRects();
      const after = playerPlay(before, cardId);
      setGame(after);
      setHiddenPlayerCard(null);
      setSelected(null);
      setFlight(null);
      setLocked(false);
      animateHandsTransition(beforeRects, after);
    }
  }

  function playSelected() {
    if (!selectedCard || locked || game.botThinking || game.winner || flight) return;

    const from = playerRefs.current[selectedCard.id]?.getBoundingClientRect();
    let targetIndex = 0;
    let targetKind: "attack" | "defense" = "attack";
    if (game.attacker === "player") {
      targetIndex = game.table.length;
      targetKind = "attack";
    } else {
      targetIndex = Math.max(0, game.table.findIndex((p) => !p.defense));
      targetKind = "defense";
    }
    const to = slotRect(targetIndex, targetKind);
    if (!from || !to) return;

    setLocked(true);
    setHiddenPlayerCard(selectedCard.id);
    setFlight({
      id: `player-${selectedCard.id}-${Date.now()}`,
      card: selectedCard,
      from,
      to,
      rotate: game.attacker === "player" ? -7 : 8,
      duration: 560,
    });
  }

  function take() {
    if (locked || game.botThinking || flight) return;
    const before = game;
    const after = playerTake(before);

    // If move was invalid, just show engine message.
    if (after.table.length === before.table.length && after.player.length === before.player.length) {
      setGame(after);
      return;
    }

    setLocked(true);

    const tableCards = before.table.flatMap((p) =>
      p.defense ? [p.attack, p.defense] : [p.attack]
    );
    const playerTarget = document.getElementById("player-hand-anchor");
    const tableRect = centerRect(tableRef.current);
    const targetRect = centerRect(playerTarget);

    if (tableRect && targetRect) {
      tableCards.slice(0, 8).forEach((card, i) => {
        const ghost = document.createElement("div");
        ghost.className = "take-ghost";
        ghost.style.left = `${tableRect.left + (i % 4) * 9}px`;
        ghost.style.top = `${tableRect.top + Math.floor(i / 4) * 8}px`;
        document.body.appendChild(ghost);

        const dx = targetRect.left - (tableRect.left + (i % 4) * 9) + i * 9;
        const dy = targetRect.top - (tableRect.top + Math.floor(i / 4) * 8);

        ghost.animate(
          [
            { transform: `translate3d(0,0,0) rotate(${i * 2 - 6}deg) scale(1)`, opacity: 1 },
            { transform: `translate3d(${dx}px,${dy}px,0) rotate(${i * 3 - 5}deg) scale(.78)`, opacity: .96 },
          ],
          {
            duration: 500,
            delay: i * 45,
            easing: "cubic-bezier(.18,.86,.2,1)",
            fill: "forwards",
          }
        ).onfinish = () => ghost.remove();
      });
    }

    const beforeRects = captureHandRects();
    window.setTimeout(() => {
      setGame(after);
      setLocked(false);
      animateHandsTransition(beforeRects, after);
    }, 560);
  }

  function done() {
    if (locked || game.botThinking || flight) return;
    const before = game;
    const after = playerDone(before);

    if (after.table.length === before.table.length) {
      setGame(after);
      return;
    }

    setLocked(true);
    const tableNode = tableRef.current;
    if (tableNode) {
      tableNode.animate(
        [
          { transform: "translate3d(0,0,0) scale(1)", opacity: 1 },
          { transform: "translate3d(150px,-20px,0) scale(.82) rotate(6deg)", opacity: 0 },
        ],
        {
          duration: 420,
          easing: "cubic-bezier(.3,.7,.25,1)",
        }
      );
    }

    const beforeRects = captureHandRects();
    window.setTimeout(() => {
      setGame(after);
      setLocked(false);
      animateHandsTransition(beforeRects, after);
    }, 420);
  }

  function restart() {
    if (locked || flight) return;
    const next = restartGame();
    setSelected(null);
    setHiddenPlayerCard(null);
    setHiddenBotCard(null);
    setFlight(null);
    setGame(next);
    setLocked(true);

    window.setTimeout(() => {
      next.player.forEach((c, i) => {
        const el = playerRefs.current[c.id];
        if (el) animateElementFromDeck(el, i * 90, -12 + i * 4);
      });
      next.bot.forEach((c, i) => {
        const el = botRefs.current[c.id];
        if (el) animateElementFromDeck(el, (next.player.length + i) * 90, 12 - i * 4);
      });
      window.setTimeout(() => setLocked(false), 1100);
    }, 120);
  }

  function sendReaction(emoji: string) {
    showReaction("player", emoji);
    setReactionOpen(false);
    setChat((x) => [
      ...x,
      { id: `p-${Date.now()}`, side: "player", text: emoji, emoji: true },
    ]);
    botReactSometimes();
  }

  function sendChat() {
    const text = chatInput.trim();
    if (!text) return;
    setChat((x) => [...x, { id: `p-${Date.now()}`, side: "player", text }]);
    setChatInput("");
    window.setTimeout(() => {
      const replies = ["Nice move.", "Let's see 😏", "Good one!", "Hmm...", "Your turn 😄"];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      setChat((x) => [...x, { id: `b-${Date.now()}`, side: "bot", text: reply }]);
    }, 900 + Math.random() * 700);
  }

  return (
    <main className="h-[100dvh] min-h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_50%_20%,rgba(40,116,89,.23),transparent_34%),#071017] p-2 text-white md:min-h-dvh md:h-auto md:overflow-visible md:p-6">
      {flight && <FlyingCard flight={flight} onDone={finishFlight} />}

      <div className="mx-auto flex h-full max-w-[1200px] flex-col md:block md:h-auto">
        <header className="mb-1 flex h-[46px] shrink-0 items-center justify-between md:mb-4 md:h-auto">
          <button
            onClick={() => router.push("/")}
            className="ui-button grid h-9 w-9 place-items-center rounded-[10px] border border-white/10 bg-white/[0.04] md:h-11 md:w-11 md:rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="text-center">
            <div className="text-[12px] font-semibold md:text-base">{tr("Classic Durak · 1v1 vs Bot")}</div>
            <div className="text-[9px] text-white/40 md:text-xs">
              Trump <span className="text-[#F5C344]">{game.trump}</span> · Deck {game.deck.length}
            </div>
          </div>

          <button
            onClick={restart}
            className="ui-button grid h-9 w-9 place-items-center rounded-[10px] border border-white/10 bg-white/[0.04] md:h-11 md:w-11 md:rounded-xl"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </header>

        <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[20px] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(48,130,98,.22),transparent_44%),linear-gradient(180deg,#10231F,#091313)] px-2.5 pb-[calc(108px+env(safe-area-inset-bottom))] pt-2 md:min-h-[calc(100dvh-96px)] md:flex-none md:rounded-[26px] md:p-7">
          <div className="flex items-start justify-between">
            <div className="relative">
              <div className="text-[13px] font-semibold md:text-base">{tr("Bot")}</div>
              <div className="text-[9px] text-white/40 md:text-xs">{game.bot.length} cards</div>

              {reaction?.side === "bot" && (
                <div className="reaction-bubble absolute left-[70px] top-[-8px] z-40">
                  {reaction.text}
                </div>
              )}
            </div>

            <div className="flex items-start gap-3">
              <div
                className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-all md:px-3 md:py-1.5 md:text-xs ${
                  game.botThinking
                    ? "border-[#9474FF]/25 bg-[#9474FF]/10 text-[#B8A7FF]"
                    : "border-[#F5C344]/20 bg-[#F5C344]/10 text-[#F5C344]"
                }`}
              >
                {locked && !game.botThinking
                  ? tr("Dealing...")
                  : game.botThinking
                  ? tr("Bot thinking...")
                  : game.attacker === "player"
                  ? tr("Your attack")
                  : tr("Your defense")}
              </div>

              <div className="hidden md:block">
                <Deck game={game} deckAnchorRef={(n) => (deckAnchorRef.current = n)} />
              </div>
            </div>
          </div>

          <div className="relative mt-0.5 h-[76px] shrink-0 md:mt-4 md:min-h-[158px] md:h-auto">
            <div className="flex justify-center pr-[72px] md:pr-0">
              <div className="flex -space-x-5 md:-space-x-8">
                {game.bot.map((c, i) => (
                  <div
                    key={c.id}
                    className="hand-wrapper"
                    style={{
                      transform: `rotate(${(i - (game.bot.length - 1) / 2) * 1.15}deg)`,
                      zIndex: i + 1,
                    }}
                  >
                    <CardBack
                      hidden={hiddenBotCard === c.id}
                      nodeRef={(n) => {
                        botRefs.current[c.id] = n;
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute right-[-62px] top-[-44px] origin-top-right scale-[.40] md:hidden">
              <Deck game={game} deckAnchorRef={(n) => (deckAnchorRef.current = n)} />
            </div>
          </div>

          <div ref={tableRef} className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden py-1 md:min-h-[250px] md:py-6">
            <div className="relative grid w-full max-w-[720px] grid-cols-3 place-items-center gap-x-1 gap-y-1 px-0.5 md:grid-cols-6 md:gap-x-0 md:gap-y-5 md:px-2">
              {Array.from({ length: 6 }).map((_, index) => {
                const pair = game.table[index];
                return (
                  <div key={`slot-${index}`} className="relative h-[98px] w-[70px] md:h-[150px] md:w-[106px]">
                    <div
                      ref={(n) => { attackSlotRefs.current[index] = n; }}
                      className="absolute left-[3px] top-[12px] h-[90px] w-[62px] md:left-[5px] md:top-[18px] md:h-[128px] md:w-[88px]"
                    >
                      {pair?.attack && (
                        <div style={{ transform: `rotate(${-5 + index * .7}deg)` }}>
                          <FaceCard card={pair.attack} />
                        </div>
                      )}
                    </div>
                    <div
                      ref={(n) => { defenseSlotRefs.current[index] = n; }}
                      className="absolute left-[15px] top-[1px] h-[90px] w-[62px] md:left-[24px] md:top-[2px] md:h-[128px] md:w-[88px]"
                    >
                      {pair?.defense && (
                        <div style={{ transform: `rotate(${6 - index * .55}deg)` }}>
                          <FaceCard card={pair.defense} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {!game.table.length && (
                <div className="table-empty pointer-events-none absolute inset-0 grid place-items-center text-sm text-white/25">
                  Table is clear
                </div>
              )}
            </div>
          </div>

          <div
            className={`mb-1 shrink-0 rounded-lg border px-2.5 py-1.5 text-center text-[10px] transition-all md:mb-4 md:rounded-xl md:px-4 md:py-3 md:text-sm ${
              game.botThinking
                ? "border-[#9474FF]/20 bg-[#9474FF]/[0.07] text-[#C8BEFF]"
                : "border-white/10 bg-black/15 text-white/65"
            }`}
          >
            {game.winner
              ? game.winner === "player"
                ? tr("You win!")
                : game.winner === "bot"
                ? tr("Bot wins")
                : tr("Draw")
              : game.message}
          </div>

          <div
            id="player-hand-anchor"
            className="relative h-[86px] shrink-0 justify-center overflow-x-auto overflow-y-hidden pb-0 pt-2 md:flex md:h-auto md:overflow-y-visible md:pb-3 md:pt-5"
          >
            {reaction?.side === "player" && (
              <div className="reaction-bubble absolute bottom-[135px] right-4 z-40">
                {reaction.text}
              </div>
            )}

            <div className="mx-auto flex w-max -space-x-4 px-4 md:-space-x-5 md:px-6">
              {game.player.map((c, i) => (
                <div
                  key={c.id}
                  className="hand-wrapper"
                  style={{
                    transform: `rotate(${(i - (game.player.length - 1) / 2) * 1.15}deg)`,
                    zIndex: i + 1,
                  }}
                >
                  <FaceCard
                    card={c}
                    hidden={hiddenPlayerCard === c.id}
                    selected={selected === c.id}
                    nodeRef={(n) => {
                      playerRefs.current[c.id] = n;
                    }}
                    onClick={() => {
                      if (!game.botThinking && !locked && !flight) {
                        setSelected(selected === c.id ? null : c.id);
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-0.5 grid h-[38px] shrink-0 grid-cols-3 gap-1.5 md:mx-auto md:mt-3 md:h-auto md:w-[620px] md:gap-3">
            <button
              disabled={game.attacker !== "bot" || !!game.winner || game.botThinking || locked || !!flight}
              onClick={take}
              className="ui-button h-[38px] rounded-[10px] text-[10px] md:h-12 md:rounded-xl md:text-sm border border-white/10 bg-white/[0.05] text-sm font-semibold disabled:opacity-30"
            >
              Take
            </button>

            <button
              disabled={!selectedCard || !!game.winner || game.botThinking || locked || !!flight}
              onClick={playSelected}
              className="ui-button h-[38px] rounded-[10px] text-[10px] md:h-12 md:rounded-xl md:text-sm bg-gradient-to-r from-[#F1B92F] to-[#FFD662] text-sm font-extrabold text-[#111820] disabled:opacity-35"
            >
              Play card
            </button>

            <button
              disabled={game.attacker !== "player" || !!game.winner || game.botThinking || locked || !!flight}
              onClick={done}
              className="ui-button h-[38px] rounded-[10px] text-[10px] md:h-12 md:rounded-xl md:text-sm border border-white/10 bg-white/[0.05] text-sm font-semibold disabled:opacity-30"
            >
              Done
            </button>
          </div>

          {game.winner && (
            <button
              onClick={restart}
              className="ui-button mx-auto mt-4 rounded-xl bg-[#F5C344] px-8 py-3 font-bold text-[#111820]"
            >
              New game
            </button>
          )}

          {/* Reactions + chat */}
          <div className="absolute bottom-[calc(116px+env(safe-area-inset-bottom))] right-2.5 z-50 flex flex-col items-end gap-2 md:bottom-6 md:right-6">
            {reactionOpen && (
              <div className="emoji-panel flex gap-1 rounded-2xl border border-white/10 bg-[#111820]/95 p-2 shadow-2xl backdrop-blur-xl">
                {QUICK_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => sendReaction(emoji)}
                    className="emoji-button grid h-10 w-10 place-items-center rounded-xl text-xl hover:bg-white/[0.06]"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setReactionOpen((v) => !v);
                  setChatOpen(false);
                }}
                className="ui-button grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-[#111820]/95 shadow-xl"
              >
                <SmilePlus className="h-5 w-5 text-[#F5C344]" />
              </button>

              <button
                onClick={() => {
                  setChatOpen((v) => !v);
                  setReactionOpen(false);
                }}
                className="ui-button grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-[#111820]/95 shadow-xl"
              >
                <MessageCircle className="h-5 w-5 text-white/70" />
              </button>
            </div>
          </div>

          {chatOpen && (
            <div className="chat-panel absolute bottom-[calc(166px+env(safe-area-inset-bottom))] right-2.5 z-50 flex h-[270px] w-[286px] flex-col overflow-hidden rounded-[20px] border border-white/10 bg-[#0D151C]/97 shadow-[0_30px_80px_rgba(0,0,0,.45)] backdrop-blur-xl md:bottom-[64px] md:right-[70px]">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
                <div>
                  <div className="text-sm font-semibold">{tr("Game chat")}</div>
                  <div className="text-[10px] text-white/35">{tr("Bot practice chat")}</div>
                </div>
                <button onClick={() => setChatOpen(false)} className="text-white/40 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto p-3">
                {chat.map((item) => (
                  <div
                    key={item.id}
                    className={`flex ${item.side === "player" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm ${
                        item.emoji ? "text-xl" : ""
                      } ${
                        item.side === "player"
                          ? "rounded-br-md bg-[#F5C344] text-[#111820]"
                          : "rounded-bl-md bg-white/[0.07] text-white/80"
                      }`}
                    >
                      {item.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 border-t border-white/[0.07] p-3">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendChat();
                  }}
                  placeholder={tr("Message...")}
                  className="h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm outline-none placeholder:text-white/25"
                />
                <button
                  onClick={sendChat}
                  className="ui-button grid h-10 w-10 place-items-center rounded-xl bg-[#F5C344] text-[#111820]"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
