"use client";

import { ChevronRight, Trophy, Users } from "lucide-react";
import { useI18n } from "./I18nProvider";

export function ActionCards({ desktop = false }: { desktop?: boolean }) {
  const { tr } = useI18n();
  return (
    <div className={`grid grid-cols-2 ${desktop ? "gap-4" : "gap-2.5"}`}>
      <button onClick={() => console.log("private game")} className={`flex items-center border border-[#48D1A0]/25 bg-gradient-to-br from-[#0d2d2b] to-[#111820] text-left shadow-panel ${desktop ? "h-[118px] rounded-[20px] px-5" : "h-[96px] rounded-[18px] px-4"}`}>
        <Users className={`${desktop ? "mr-4 h-8 w-8" : "mr-3 h-7 w-7"} text-[#48D1A0]`} />
        <div className="flex-1">
          <div className={`${desktop ? "text-[18px]" : "text-[16px]"} font-semibold leading-tight`}>{tr("Play with Friend")}</div>
          {desktop && <div className="mt-1 text-[11px] text-[#8F969F]">Create a private table</div>}
        </div>
        <ChevronRight className="h-5 w-5 text-white/70" />
      </button>
      <button onClick={() => console.log("tournament")} className={`flex items-center border border-[#9474FF]/25 bg-gradient-to-br from-[#24203b] to-[#111820] text-left shadow-panel ${desktop ? "h-[118px] rounded-[20px] px-5" : "h-[96px] rounded-[18px] px-4"}`}>
        <Trophy className={`${desktop ? "mr-4 h-8 w-8" : "mr-3 h-7 w-7"} text-[#9474FF]`} />
        <div className="flex-1">
          <div className={`${desktop ? "text-[18px]" : "text-[16px]"} font-semibold`}>{tr("Tournaments")}</div>
          {desktop && <div className="mt-1 text-[11px] text-[#8F969F]">Compete for leaderboard points</div>}
        </div>
        <ChevronRight className="h-5 w-5 text-white/70" />
      </button>
    </div>
  );
}