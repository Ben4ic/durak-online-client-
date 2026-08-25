"use client";

import { Coins, Swords, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "./I18nProvider";

const stakes = [100, 500, 1000];

export function QuickGame({ desktop = false }: { desktop?: boolean }) {
  const { tr } = useI18n();
  const [selected, setSelected] = useState(500);
  const router = useRouter();

  return (
    <section className={`border border-white/10 bg-[#111820]/95 shadow-panel ${desktop ? "rounded-[22px] p-6" : "rounded-[18px] p-4"}`}>
      <div className={`flex items-center gap-2 font-semibold ${desktop ? "mb-5 text-[20px]" : "mb-4 text-[18px]"}`}>
        <Zap className="h-5 w-5 fill-white/80 text-white/80" /> Quick Game
      </div>
      <div className={`grid grid-cols-3 ${desktop ? "gap-3" : "gap-2"}`}>
        {stakes.map((stake) => {
          const active = stake === selected;
          return (
            <button
              key={stake}
              onClick={() => setSelected(stake)}
              className={`flex flex-col items-center justify-center border bg-[#202830] transition active:scale-[0.99] ${desktop ? "h-[98px] rounded-[16px]" : "h-[76px] rounded-[14px]"} ${active ? "border-[#F5C344]/70 ring-1 ring-[#F5C344]/15" : "border-white/10"}`}
            >
              <div className={`font-semibold text-white ${desktop ? "text-[23px]" : "text-[19px]"}`}>
                {stake.toLocaleString("en-US")} <span className="text-[#F5C344]">D</span>
              </div>
              <Coins className={`${desktop ? "mt-2 h-6 w-6" : "mt-1.5 h-5 w-5"} text-[#F5C344]`} />
            </button>
          );
        })}
      </div>
      <button
        onClick={() => router.push("/games")}
        className={`flex w-full items-center justify-center gap-3 bg-gradient-to-r from-[#F1B92F] to-[#FFD662] font-extrabold text-[#111820] shadow-[0_8px_24px_rgba(245,195,68,.18)] transition hover:brightness-105 active:scale-[0.99] ${desktop ? "mt-4 h-[62px] rounded-[16px] text-[21px]" : "mt-3 h-[58px] rounded-[14px] text-[20px]"}`}
      >
        <Swords className="h-5 w-5" strokeWidth={2.3} /> Choose Mode
      </button>
    </section>
  );
}