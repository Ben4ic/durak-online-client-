"use client";

import React from "react";

// ===== Shared playing card component =====
//
// Why this file exists: card rendering used to be copy-pasted 3 times
// (bot game, online game, flying-card animation), each slightly different.
// That duplication is exactly how the two visual bugs happened:
//
// 1. "Blurry during animation" — the bot game's flying-card animation took
//    a fixed-size card element and squashed it with a CSS
//    `transform: scale(0.7123...)` to make it fit the origin slot. Scaling
//    TEXT with a non-integer CSS transform is a well-known browser blur
//    trigger (the text gets rasterized then resampled). Fix: this
//    component takes an explicit pixel `width` and renders natively at
//    that size — no scale-transform is ever needed to resize it.
//
// 2. "Smeared/cramped on mobile" — a separate mobile CSS override forcibly
//    shrank the card's width/height with `!important`, but the rank/suit
//    font sizes were still the ones tuned for the bigger desktop card, so
//    text overlapped/overflowed the smaller box. Fix: every measurement
//    here (padding, font sizes, corner offsets) is computed as a fraction
//    of the same `width` prop, so box and content can never drift apart.
//
// Suits are drawn as inline SVG paths instead of the Unicode glyphs
// (♠ ♥ ♦ ♣) the old code relied on. Unicode suit glyphs are drawn by
// whatever font the OS/browser happens to substitute for them, which
// varies a lot in weight/hinting across devices — that inconsistency is
// part of why suits could look "off" even outside the animation bug.
// A vector path always renders crisp at any size/DPI, with no font
// fallback involved.

export type Suit = "♠" | "♥" | "♦" | "♣";
export type PlayingCardData = { id: string; suit: Suit; rank: string };

const RED_SUITS: Suit[] = ["♥", "♦"];
export function isRedSuit(suit: Suit) {
  return RED_SUITS.includes(suit);
}

// Simple, crisp geometric suit icons (24x24 viewBox). Playing-card suit
// symbols are centuries-old generic glyphs, not anyone's protected IP.
const SUIT_PATHS: Record<Suit, string> = {
  "♠":
    "M12 2.5C9.2 6.3 4 10 4 14.2A5 5 0 0 0 12.6 17.6C12.2 19.6 11.2 21 9 22H15C12.8 21 11.8 19.6 11.4 17.6A5 5 0 0 0 20 14.2C20 10 14.8 6.3 12 2.5Z",
  "♥":
    "M12 21.5S3.5 16.4 2 11.8C0.9 8.5 3 5 6.5 5C8.7 5 10.7 6.3 12 8.1C13.3 6.3 15.3 5 17.5 5C21 5 23.1 8.5 22 11.8C20.5 16.4 12 21.5 12 21.5Z",
  "♦": "M12 2L21 12L12 22L3 12Z",
  "♣":
    "M12 3.2A3.8 3.8 0 0 0 8.2 7A3.8 3.8 0 0 0 3.6 12A3.8 3.8 0 0 0 8.9 15.6C8.4 18.6 7.2 20.4 5 21.5H19C16.8 20.4 15.6 18.6 15.1 15.6A3.8 3.8 0 0 0 20.4 12A3.8 3.8 0 0 0 15.8 7A3.8 3.8 0 0 0 12 3.2Z",
};

export function SuitIcon({ suit, size, color }: { suit: Suit; size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ display: "block", flexShrink: 0 }}
      aria-hidden
    >
      <path d={SUIT_PATHS[suit]} fill={color} />
    </svg>
  );
}

export const FACE_BG = "#F7F5EE";
export const INK_BLACK = "#151A20";
export const INK_RED = "#C72F3A";
export const GOLD = "#F5C344";

type PlayingCardProps = {
  card?: PlayingCardData;
  width: number; // the ONLY size input — height/fonts/paddings all derive from this
  faceDown?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
  nodeRef?: (node: HTMLButtonElement | HTMLDivElement | null) => void;
  children?: React.ReactNode; // overlay content (e.g. a face-down deck icon)
};

// Standard poker-card aspect ratio.
const ASPECT = 1.4;

export function PlayingCard({
  card,
  width,
  faceDown = false,
  selected = false,
  disabled = false,
  onClick,
  style,
  className = "",
  nodeRef,
  children,
}: PlayingCardProps) {
  const height = Math.round(width * ASPECT);
  const radius = Math.max(6, Math.round(width * 0.15));
  const pad = Math.max(3, Math.round(width * 0.09));
  const rankSize = Math.round(width * 0.22);
  const cornerSuitSize = Math.round(width * 0.16);
  const centerSuitSize = Math.round(width * 0.5);

  const baseStyle: React.CSSProperties = {
    width,
    height,
    borderRadius: radius,
    position: "relative",
    flexShrink: 0,
    textAlign: "left",
    // Crisp text under any parent transform (translate/rotate is fine;
    // we just never scale this element itself for sizing purposes).
    backfaceVisibility: "hidden",
    WebkitFontSmoothing: "antialiased",
    textRendering: "optimizeLegibility",
    transition: "transform 200ms ease, box-shadow 200ms ease, filter 200ms ease",
    ...style,
  };

  if (faceDown) {
    return (
      <div
        ref={nodeRef as (n: HTMLDivElement | null) => void}
        className={className}
        style={{
          ...baseStyle,
          overflow: "hidden",
          border: "1px solid rgba(245,195,68,.34)",
          background:
            "radial-gradient(circle at 50% 50%, rgba(245,195,68,.12), transparent 38%), linear-gradient(145deg,#202832,#0d141b)",
          boxShadow: "0 12px 26px rgba(0,0,0,.30)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: Math.round(width * 0.09),
            borderRadius: Math.max(4, radius - 3),
            border: "1px solid rgba(245,195,68,.17)",
          }}
        />
        {children && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {children}
          </div>
        )}
      </div>
    );
  }

  if (!card) return null;
  const red = isRedSuit(card.suit);
  const color = red ? INK_RED : INK_BLACK;

  return (
    <button
      ref={nodeRef as (n: HTMLButtonElement | null) => void}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        ...baseStyle,
        padding: pad,
        background: FACE_BG,
        border: selected ? `1px solid ${GOLD}` : "1px solid rgba(0,0,0,.10)",
        boxShadow: selected
          ? `0 20px 38px rgba(0,0,0,.38), 0 0 0 1px rgba(245,195,68,.38)`
          : "0 12px 26px rgba(0,0,0,.30)",
        // Only set `transform` inline for the selected state. Leaving it
        // unset otherwise (instead of "none") lets the CSS :hover/:active
        // rules on the "game-card" class (see globals.css) still apply —
        // an inline style always wins over a stylesheet rule, so setting
        // "none" here would have silently killed the hover-lift animation.
        ...(selected ? { transform: "translateY(-16%) scale(1.04)" } : {}),
        opacity: disabled ? 0.4 : 1,
        filter: disabled ? "grayscale(.25)" : "none",
        cursor: disabled ? "not-allowed" : onClick ? "pointer" : "default",
      }}
    >
      {/* Top-left index: rank + small suit pip, like a real card's corner mark */}
      <div style={{ position: "absolute", top: pad, left: pad, textAlign: "center" }}>
        <div style={{ fontSize: rankSize, fontWeight: 800, lineHeight: 1, color }}>{card.rank}</div>
        <div style={{ marginTop: Math.round(width * 0.02), display: "flex", justifyContent: "center" }}>
          <SuitIcon suit={card.suit} size={cornerSuitSize} color={color} />
        </div>
      </div>

      {/* Big centered suit pip — the card's main "face" */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SuitIcon suit={card.suit} size={centerSuitSize} color={color} />
      </div>

      {/* Bottom-right index: same mark, rotated 180° — so it reads right-way-up
          from the other side, exactly like a physical card. Kept clearly apart
          from the top-left mark and the center pip (that overlap is what made
          cards look like they had "two suits crammed in one spot" before). */}
      <div
        style={{
          position: "absolute",
          bottom: pad,
          right: pad,
          textAlign: "center",
          transform: "rotate(180deg)",
        }}
      >
        <div style={{ fontSize: rankSize, fontWeight: 800, lineHeight: 1, color }}>{card.rank}</div>
        <div style={{ marginTop: Math.round(width * 0.02), display: "flex", justifyContent: "center" }}>
          <SuitIcon suit={card.suit} size={cornerSuitSize} color={color} />
        </div>
      </div>
    </button>
  );
}

export default PlayingCard;
