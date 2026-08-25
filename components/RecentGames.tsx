"use client";

import { ChevronRight, Trophy } from "lucide-react";
import { useI18n } from "./I18nProvider";

const matches = [
  { opponent: "Alexey_88", stake: 500, result: "Win", time: "10 min ago", initial: "A" },
  { opponent: "Marina", stake: 100, result: "Loss", time: "35 min ago", initial: "M" },
  { opponent: "Sergey777", stake: 1000, result: "Win", time: "1 h ago", initial: "S" },
];

export function RecentGames({ desktop = false }: { desktop?: boolean }) {
  const { tr } = useI18n();
  return (
    <section className={`border border-white/10 bg-[#111820] shadow-panel ${desktop ? "rounded-[22px] p-5" : "rounded-[18px] p-4"}`}>
      <div className={`${desktop ? "mb-4" : "mb-2"} flex items-center justify-between`}>
        <h2 className={`${desktop ? "text-[20px]" : "text-[18px]"} font-semibold`}>{tr("Recent Games")}</h2>
        <button className={`${desktop ? "text-[13px]" : "text-[13px]"} flex items-center gap-1 font-medium text-[#F5C344]`}>View All <ChevronRight className="h-4 w-4" /></button>
      </div>
      <div className={`overflow-hidden border border-white/[0.06] bg-black/5 ${desktop ? "rounded-[16px]" : "rounded-[14px]"}`}>
        {matches.map((m, i) => (
          <div key={m.opponent} className={`grid items-center gap-3 px-3 ${desktop ? "min-h-[72px] grid-cols-[42px_1.2fr_.7fr_.9fr_.8fr_18px] px-4" : "min-h-[64px] grid-cols-[38px_1.1fr_.65fr_.8fr_16px]"} ${i !== matches.length - 1 ? "border-b border-white/[0.07]" : ""}`}>
            <div className={`grid place-items-center rounded-full bg-gradient-to-br from-zinc-500 to-zinc-800 font-bold ${desktop ? "h-9 w-9 text-[12px]" : "h-8 w-8 text-xs"}`}>{m.initial}</div>
            <div className={`truncate ${desktop ? "text-[14px] font-medium" : "text-[14px]"}`}>{m.opponent}</div>
            <div className="whitespace-nowrap text-[13px]">{m.stake.toLocaleString("en-US")} <span className="text-[#F5C344]">D</span></div>
            <div className={`flex items-center gap-1 text-[13px] font-medium ${m.result === "Win" ? "text-[#46D495]" : "text-[#F05B52]"}`}>{m.result}{m.result === "Win" && <Trophy className="h-3.5 w-3.5" />}</div>
            {desktop ? <div className="text-[12px] text-[#7e858e]">{m.time}</div> : <div className="min-w-0"><div className="truncate text-[10px] text-[#7e858e]">{m.time}</div></div>}
            <ChevronRight className="h-4 w-4 text-white/50" />
          </div>
        ))}
      </div>
    </section>
  );
}