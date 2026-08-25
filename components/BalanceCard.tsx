"use client";

import { ArrowDownToLine, ArrowUpFromLine, WalletCards } from "lucide-react";
import { useI18n } from "./I18nProvider";

export function BalanceCard({ desktop = false }: { desktop?: boolean }) {
  const { tr } = useI18n();
  return (
    <section className={`relative overflow-hidden border border-[#F5C344]/25 bg-gradient-to-br from-[#1a222a] to-[#111820] shadow-panel ${desktop ? "min-h-[166px] rounded-[22px] p-6" : "rounded-[18px] p-[18px]"}`}>
      <div className={`absolute rotate-12 font-serif text-white/[0.035] ${desktop ? "-right-4 -top-16 text-[150px]" : "-right-9 -top-10 text-[86px]"}`}>A♠</div>
      <div className={`${desktop ? "text-[13px] uppercase tracking-[0.12em]" : "text-[14px]"} text-[#9AA1AA]`}>{tr("Balance")}</div>
      <div className={`mt-1 flex ${desktop ? "items-end" : "items-center"} justify-between gap-4`}>
        <div>
          <div className={`font-serif leading-none tracking-[0.01em] text-white ${desktop ? "mt-2 text-[50px]" : "text-[42px]"}`}>
            12 450 <span className="text-[#F5C344]">D</span>
          </div>
          {desktop && <div className="mt-3 text-[12px] text-[#8F969F]">Available balance</div>}
        </div>
        {desktop ? (
          <div className="flex gap-2">
            <button className="flex h-10 items-center gap-2 rounded-[12px] border border-white/[0.08] bg-white/[0.04] px-3 text-[12px] font-semibold text-white"><ArrowDownToLine className="h-4 w-4 text-[#46D495]" /> Deposit</button>
            <button className="flex h-10 items-center gap-2 rounded-[12px] border border-white/[0.08] bg-white/[0.04] px-3 text-[12px] font-semibold text-white"><ArrowUpFromLine className="h-4 w-4 text-[#F5C344]" /> Withdraw</button>
          </div>
        ) : (
          <button aria-label="Wallet" className="grid h-12 w-12 place-items-center rounded-[14px] border border-white/[0.06] bg-white/[0.035] text-[#A5ABB3] shadow-inner">
            <WalletCards className="h-6 w-6" />
          </button>
        )}
      </div>
    </section>
  );
}