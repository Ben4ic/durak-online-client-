"use client";

import { useEffect, useState } from "react";

// One canonical place that decides "how big is a card right now". Both game
// pages read from this instead of each hard-coding their own mobile/desktop
// pixel numbers — that duplication is exactly how the box size and the
// font size inside it used to drift apart (see PlayingCard.tsx comment).
export function useCardWidth(base: { mobile: number; desktop: number }) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isDesktop ? base.desktop : base.mobile;
}
