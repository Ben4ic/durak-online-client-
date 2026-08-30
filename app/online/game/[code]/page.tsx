"use client";

import { ArrowLeft, Crown, LoaderCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useI18n } from "@/components/I18nProvider";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlayingCard, SuitIcon, isRedSuit } from "@/components/PlayingCard";

type Suit = "♠" | "♥" | "♦" | "♣";
type Card = { id: string; suit: Suit; rank: string };
type Pair = { attack: Card; defense?: Card };
type State = {
  code: string;
  status: "waiting" | "active" | "finished";
  me: { id: string; username: string };
  opponent: { id: string; username: string } | null;
  hand: Card[];
  opponentCardCount: number;
  deckCount: number;
  deckSize?: number;
  trump: Suit | null;
  table: Pair[];
  attackerId: string | null;
  defenderId: string | null;
  maxAttacks: number;
  message: string;
  winnerId: string | null;
  revision: number;
};

const ranks = ["6","7","8","9","10","J","Q","K","A"];

function beats(defense: Card, attack: Card, trump: Suit) {
  if (defense.suit === attack.suit) return ranks.indexOf(defense.rank) > ranks.indexOf(attack.rank);
  return defense.suit === trump && attack.suit !== trump;
}

// NOTE: card visuals now live in one shared place — components/PlayingCard.tsx
// (used here AND in the bot-game page). This used to be a third independent
// copy of the same rendering logic with its own slightly-different card
// sizes and raw Unicode suit glyphs; that duplication was itself a source
// of visual bugs (inconsistent look between the two game modes, no shared
// fix path). These are thin wrappers so nothing else in this file needs to
// change its call sites.
function GameCard({
  card,
  back = false,
  selected = false,
  disabled = false,
  compact = false,
  onClick,
}: {
  card?: Card;
  back?: boolean;
  selected?: boolean;
  disabled?: boolean;
  compact?: boolean;
  onClick?: () => void;
}) {
  const width = compact ? 57 : 80;
  if (back) {
    return (
      <PlayingCard faceDown width={width} className="shrink-0">
        <Crown className="h-5 w-5 text-[#F5C344]/55" />
      </PlayingCard>
    );
  }
  return (
    <PlayingCard
      card={card}
      width={width}
      selected={selected}
      disabled={disabled}
      onClick={onClick}
      className="shrink-0"
    />
  );
}

function TrumpDeck({ suit, count }: { suit: Suit | null; count: number }) {
  if (!suit) return null;
  const red = isRedSuit(suit);
  const color = red ? "#C72F3A" : "#151A20";
  return (
    <div className="relative h-[76px] w-[106px] shrink-0">
      {count > 0 && (
        <div className="absolute bottom-[2px] left-0 h-[45px] w-[76px] rounded-[8px] border border-black/10 bg-[#F7F5EE] shadow-lg">
          <div className="absolute left-2 top-2">
            <SuitIcon suit={suit} size={22} color={color} />
          </div>
        </div>
      )}
      {count > 0 && (
        <div className="absolute right-0 top-0">
          <GameCard back compact />
        </div>
      )}
      <div className="absolute bottom-0 right-0 rounded-full border border-white/10 bg-black/65 px-2 py-0.5 text-[9px] font-semibold text-white/80">{count}</div>
    </div>
  );
}

export default function OnlineGamePage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const { tr } = useI18n();
  const code = String(params.code || "").toUpperCase();

  const [state, setState] = useState<State | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [connected, setConnected] = useState(true);
  const tokenRef = useRef("");
  const latestRevision = useRef(-1);
  const pollBusy = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem(`durak-room-token:${code}`) || "";
    if (!token) {
      router.replace(`/online?room=${code}`);
      return;
    }
    tokenRef.current = token;
  }, [code, router]);

  const applyState = useCallback((next: State) => {
    // Same defensive principle as the lobby page: never let a malformed
    // response (backend hiccup, wrong shape) replace good state with
    // something `.map()` calls further down will crash on. If it doesn't
    // look like a real game state, just skip this update — the next poll
    // will retry.
    if (!next || (next.status !== "waiting" && (!Array.isArray(next.hand) || !Array.isArray(next.table)))) return;
    const rev = next.revision ?? 0;
    if (rev < latestRevision.current) return;
    latestRevision.current = rev;
    setState(next);
  }, []);

  const refresh = useCallback(async () => {
    if (!tokenRef.current || pollBusy.current) return;
    pollBusy.current = true;
    try {
      const r = await fetch(`/api/online/room?code=${code}&t=${Date.now()}`, {
        cache: "no-store",
        headers: { "x-player-token": tokenRef.current },
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "CONNECTION_ERROR");
      applyState(data);
      setConnected(true);
      setError("");
    } catch (e: any) {
      setConnected(false);
      setError((e?.message || "CONNECTION_ERROR").replaceAll("_", " "));
    } finally {
      pollBusy.current = false;
    }
  }, [applyState, code]);

  useEffect(() => {
    const start = setTimeout(refresh, 60);
    const timer = setInterval(refresh, 500);
    const visible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", visible);
    return () => {
      clearTimeout(start);
      clearInterval(timer);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [refresh]);

  const role = useMemo(() => {
    if (!state) return "";
    if (state.attackerId === state.me.id) return "attacker";
    if (state.defenderId === state.me.id) return "defender";
    return "";
  }, [state]);

  const ranksOnTable = useMemo(() => {
    if (!state?.table.length) return null;
    return new Set(state.table.flatMap(p => [p.attack.rank, p.defense?.rank].filter(Boolean) as string[]));
  }, [state]);

  function legal(card: Card) {
    if (!state || state.status !== "active" || busy) return false;

    if (role === "attacker") {
      if (state.table.some(p => !p.defense)) return false;
      if (state.table.length >= state.maxAttacks) return false;
      return !ranksOnTable || ranksOnTable.has(card.rank);
    }

    if (role === "defender") {
      const pair = state.table.find(p => !p.defense);
      return !!pair && !!state.trump && beats(card, pair.attack, state.trump);
    }

    return false;
  }

  async function action(type: "play" | "done" | "take") {
    if (!state || busy || !tokenRef.current) return;
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/online/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-player-token": tokenRef.current,
        },
        body: JSON.stringify({
          code,
          action: type,
          cardId: type === "play" ? selected : undefined,
          revision: state.revision,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "INVALID_MOVE");
      applyState(data);
      setSelected(null);
      setConnected(true);
    } catch (e: any) {
      setError((e?.message || "INVALID_MOVE").replaceAll("_", " "));
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function leave() {
    if (tokenRef.current) {
      await fetch("/api/online/leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-player-token": tokenRef.current,
        },
        body: JSON.stringify({ code }),
      }).catch(() => {});
      localStorage.removeItem(`durak-room-token:${code}`);
    }
    router.replace("/online");
  }

  const allDefended = !!state?.table.length && state.table.every(p => !!p.defense);
  const canDone = !!state && state.status === "active" && role === "attacker" && allDefended && !busy;
  const canTake = !!state && state.status === "active" && role === "defender" && state.table.some(p => !p.defense) && !busy;
  const selectedLegal = !!state?.hand.find(c => c.id === selected && legal(c));

  if (!state) {
    return (
      <main className="grid h-[100dvh] place-items-center overflow-hidden bg-[#071017] text-white">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-[#F5C344]" />
          {error && <div className="mt-3 text-xs text-red-300">{error}</div>}
        </div>
      </main>
    );
  }

  if (state.status === "waiting") {
    return (
      <main className="grid h-[100dvh] place-items-center overflow-hidden bg-[#071017] text-white">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-[#70E6B0]" />
          <div className="mt-4 text-lg font-semibold">{tr("Waiting for opponent")}</div>
          <div className="mt-1 font-mono text-[#F5C344]">{state.code}</div>
        </div>
      </main>
    );
  }

  const won = state.status === "finished" && state.winnerId === state.me.id;
  const draw = state.winnerId === "draw";

  return (
    <main className="h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_50%_18%,rgba(40,116,89,.23),transparent_34%),#071017] text-white">
      <div className="mx-auto flex h-full max-w-[1200px] flex-col px-2 pb-[calc(92px+env(safe-area-inset-bottom))] pt-1.5 md:px-6 md:py-5">
        <header className="flex h-[44px] shrink-0 items-center justify-between gap-2 md:h-[58px]">
          <button onClick={leave} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[.04] md:h-10 md:w-10">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 text-center">
            <div className="truncate text-[12px] font-semibold md:text-base">{tr("Classic Durak · Online")}</div>
            <div className="flex items-center justify-center gap-1 text-[9px] text-white/40 md:text-xs">
              <span>{state.code}</span><span>·</span><SuitIcon suit={state.trump || "♠"} size={9} color="#F5C344" /><span>·</span><span>{state.deckCount}{state.deckSize ? `/${state.deckSize}` : ""}</span>
              <span className={`ml-1 flex items-center gap-1 rounded-full px-1.5 py-0.5 ${connected ? "bg-[#46D495]/10 text-[#70E6B0]" : "bg-red-400/10 text-red-300"}`}>
                {connected ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
              </span>
            </div>
          </div>
          <button onClick={refresh} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[.04] md:h-10 md:w-10">
            <RefreshCw className="h-4 w-4" />
          </button>
        </header>

        <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[18px] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(48,130,98,.22),transparent_44%),linear-gradient(180deg,#10231F,#091313)] px-2.5 py-2 md:rounded-[26px] md:p-6">
          <div className="flex h-[34px] shrink-0 items-center justify-between">
            <div>
              <div className="text-[12px] font-semibold md:text-base">{state.opponent?.username || "Opponent"}</div>
              <div className="text-[9px] text-white/35 md:text-xs">{state.opponentCardCount} cards</div>
            </div>
            <div className="rounded-full border border-[#F5C344]/20 bg-[#F5C344]/10 px-2.5 py-1 text-[10px] font-semibold text-[#F5C344]">
              {role === "attacker" ? tr("You attack") : tr("You defend")}
            </div>
          </div>

          <div className="relative flex h-[70px] shrink-0 items-start justify-center md:h-[126px]">
            <div className="flex -space-x-5 pt-1 md:-space-x-6">
              {Array.from({ length: state.opponentCardCount }).map((_, i) => <GameCard key={i} back compact />)}
            </div>
            <div className="absolute right-0 top-0 origin-top-right scale-[.76] md:scale-100">
              <TrumpDeck suit={state.trump} count={state.deckCount} />
            </div>
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden">
            <div className="absolute inset-0 grid grid-cols-3 place-items-center gap-1 md:grid-cols-6 md:px-6">
              {Array.from({ length: 6 }).map((_, i) => {
                const pair = state.table[i];
                return (
                  <div key={i} className="relative h-[84px] w-[60px] md:h-[138px] md:w-[96px]">
                    {pair?.attack && <div className="absolute left-0 top-2 rotate-[-5deg]"><GameCard card={pair.attack} compact /></div>}
                    {pair?.defense && <div className="absolute left-[13px] top-0 rotate-[6deg]"><GameCard card={pair.defense} compact /></div>}
                  </div>
                );
              })}
              {!state.table.length && <div className="pointer-events-none absolute inset-0 grid place-items-center text-[11px] text-white/18">{tr("Table is clear")}</div>}
            </div>
          </div>

          <div className="mb-1 shrink-0 rounded-lg border border-white/10 bg-black/15 px-2 py-1.5 text-center text-[10px] text-white/60 md:text-sm">
            {state.status === "finished" ? (draw ? tr("Draw") : won ? tr("You win!") : `${state.opponent?.username || "Opponent"} wins`) : state.message}
          </div>
          {error && <div className="mb-1 shrink-0 text-center text-[9px] text-red-300">{error}</div>}

          <div className="h-[82px] shrink-0 overflow-x-auto overflow-y-hidden pt-2 md:h-[132px]">
            <div className="mx-auto flex w-max -space-x-1 px-4">
              {state.hand.map((card) => {
                const ok = legal(card);
                return <GameCard key={card.id} card={card} compact disabled={!ok} selected={selected === card.id} onClick={() => ok && setSelected(selected === card.id ? null : card.id)} />;
              })}
            </div>
          </div>

          <div className="grid h-[38px] shrink-0 grid-cols-3 gap-1.5 md:mx-auto md:h-[52px] md:w-[620px]">
            <button disabled={!canTake} onClick={() => action("take")} className="rounded-lg border border-white/10 bg-white/[.05] text-[10px] font-semibold disabled:opacity-20 md:text-sm">{tr("Take")}</button>
            <button disabled={!selectedLegal} onClick={() => action("play")} className="rounded-lg bg-[#F5C344] text-[10px] font-extrabold text-[#111820] disabled:opacity-25 md:text-sm">{busy ? "..." : tr("Play card")}</button>
            <button disabled={!canDone} onClick={() => action("done")} className="rounded-lg border border-white/10 bg-white/[.05] text-[10px] font-semibold disabled:opacity-20 md:text-sm">{tr("Done")}</button>
          </div>
        </section>
      </div>
    </main>
  );
}
