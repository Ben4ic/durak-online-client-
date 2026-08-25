"use client";

import { ChevronRight, Crown, Gift } from "lucide-react";
import { useI18n } from "./I18nProvider";

export function InfoCards({ desktop = false }: { desktop?: boolean }) {
  const { tr } = useI18n();
  return (
    <div className={`grid grid-cols-2 ${desktop ? "h-full gap-3" : "gap-2.5"}`}>
      <section className={`relative flex overflow-hidden border border-white/10 bg-[#111820] shadow-panel ${desktop ? "min-h-[166px] rounded-[22px] p-5" : "h-[118px] rounded-[18px] p-4"}`}>
        <div className="z-10">
          <div className={`${desktop ? "text-[12px] uppercase tracking-[0.12em]" : "text-[13px]"} text-[#8F969F]`}>{tr("Rating")}</div>
          <div className={`${desktop ? "mt-3 text-[36px]" : "mt-1 text-[31px]"} font-serif leading-none`}>1240</div>
          <div className={`${desktop ? "mt-3 text-[15px]" : "mt-2 text-[14px]"} font-bold text-[#F5C344]`}>Gold</div>
        </div>
        <div className={`absolute grid place-items-center rounded-full border border-[#F5C344]/30 bg-gradient-to-br from-[#6b4a12] to-[#1b1a14] ${desktop ? "bottom-4 right-4 h-20 w-20" : "bottom-2 right-2 h-16 w-16"}`}>
          <Crown className={`${desktop ? "h-9 w-9" : "h-8 w-8"} text-[#F5C344]`} />
        </div>
      </section>
      <section className={`relative flex items-center overflow-hidden border border-white/10 bg-[#111820] shadow-panel ${desktop ? "min-h-[166px] rounded-[22px] p-5" : "h-[118px] rounded-[18px] p-4"}`}>
        <div className={`z-10 ${desktop ? "max-w-[150px]" : "max-w-[104px]"}`}>
          <div className={`${desktop ? "text-[12px] uppercase tracking-[0.10em]" : "text-[12px] leading-tight"} text-[#8F969F]`}>{tr("Daily Reward")}</div>
          <div className={`${desktop ? "mt-4 text-[17px]" : "mt-3 text-[15px]"} font-semibold leading-tight`}>{tr("Claim Bonus")}</div>
        </div>
        <Gift className={`absolute text-[#F5C344] ${desktop ? "right-7 top-10 h-12 w-12" : "right-6 top-8 h-10 w-10"}`} strokeWidth={1.7} />
        <ChevronRight className="absolute bottom-4 right-3 h-4 w-4 text-white/60" />
      </section>
    </div>
  );
}