"use client";

import { ChevronRight, Circle, Gift, Medal, ShieldCheck, Users } from "lucide-react";
import { useI18n } from "./I18nProvider";

const friends = [
  { name: "Alexey_88", rating: "1384", state: "In lobby" },
  { name: "Marina", rating: "1210", state: "Playing" },
  { name: "Sergey777", rating: "1492", state: "Online" },
];

export function DesktopRightPanel() {
  const { tr } = useI18n();
  return (
    <aside className="hidden space-y-5 xl:block">
      <section className="rounded-[22px] border border-white/[0.08] bg-[#111820]/90 p-5 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="relative grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-gradient-to-br from-[#39424c] to-[#171d23] text-sm font-bold">P
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#111820] bg-[#46D495]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[16px] font-semibold">Player</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-[#8F969F]"><ShieldCheck className="h-3.5 w-3.5 text-[#46D495]" /> Verified account</div>
          </div>
          <ChevronRight className="h-5 w-5 text-white/40" />
        </div>
      </section>

      <section className="rounded-[22px] border border-[#F5C344]/15 bg-gradient-to-br from-[#1b1a14] to-[#111820] p-5 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[12px] uppercase tracking-[0.13em] text-[#8F969F]">{tr("Daily Reward")}</div>
            <div className="mt-2 text-[20px] font-bold">Come back daily</div>
            <div className="mt-1 max-w-[220px] text-[12px] leading-5 text-[#8F969F]">Claim your reward and keep the streak alive.</div>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-[15px] border border-[#F5C344]/20 bg-[#F5C344]/10"><Gift className="h-6 w-6 text-[#F5C344]" /></div>
        </div>
        <button className="mt-5 h-11 w-full rounded-[13px] bg-[#F5C344] text-[14px] font-extrabold text-[#111820] transition hover:brightness-105">{tr("Claim Bonus")}</button>
      </section>

      <section className="rounded-[22px] border border-white/[0.08] bg-[#111820]/90 p-5 shadow-panel">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[16px] font-semibold"><Users className="h-5 w-5 text-[#48D1A0]" /> Friends Online</div>
          <span className="rounded-full bg-[#46D495]/10 px-2 py-1 text-[11px] font-bold text-[#46D495]">3</span>
        </div>
        <div className="mt-4 space-y-2">
          {friends.map((f) => (
            <button key={f.name} className="flex w-full items-center gap-3 rounded-[14px] border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-left hover:bg-white/[0.04]">
              <div className="relative grid h-9 w-9 place-items-center rounded-full bg-[#27313a] text-[11px] font-bold">{f.name.slice(0,1)}<Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-[#46D495] text-[#46D495]" /></div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold">{f.name}</div>
                <div className="mt-0.5 text-[10px] text-[#7f8791]">{f.state}</div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-[#F5C344]"><Medal className="h-3.5 w-3.5" /> {f.rating}</div>
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}