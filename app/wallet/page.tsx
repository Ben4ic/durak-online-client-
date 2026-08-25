"use client";

import { ResponsiveShell } from "@/components/ResponsiveShell";
import { Panel, SectionTitle, Stat } from "@/components/Ui";
import { ArrowDownToLine, ArrowUpFromLine, Coins, CreditCard, History, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/components/I18nProvider";

export default function WalletPage() {
  const { tr } = useI18n();
  const [tab, setTab] = useState<"deposit" | "withdraw">("deposit");
  return (
    <ResponsiveShell title={tr("Wallet")}>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Panel className="border-[#F5C344]/20 bg-[linear-gradient(135deg,#182028,#111820)]">
          <div className="text-sm text-white/45">{tr("Available balance")}</div>
          <div className="mt-2 text-4xl font-semibold">12 450 <span className="text-[#F5C344]">D</span></div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Stat label="Locked" value="0 D" />
            <Stat label="Bonus" value="450 D" />
          </div>
        </Panel>

        <Panel>
          <div className="grid grid-cols-2 rounded-xl bg-white/[0.04] p-1">
            <button onClick={() => setTab("deposit")} className={`rounded-lg py-2.5 text-sm font-semibold ${tab === "deposit" ? "bg-[#F5C344] text-[#111820]" : "text-white/45"}`}>{tr("Deposit")}</button>
            <button onClick={() => setTab("withdraw")} className={`rounded-lg py-2.5 text-sm font-semibold ${tab === "withdraw" ? "bg-[#F5C344] text-[#111820]" : "text-white/45"}`}>{tr("Withdraw")}</button>
          </div>
          <div className="mt-4">
            <label className="text-xs text-white/40">{tr("Amount")}</label>
            <div className="mt-2 flex h-12 items-center rounded-xl border border-white/10 bg-white/[0.035] px-3"><input className="w-full bg-transparent outline-none" placeholder="0.00" /><span className="font-semibold text-[#F5C344]">D</span></div>
            <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5C344] py-3 font-bold text-[#111820]">{tab === "deposit" ? <ArrowDownToLine className="h-4 w-4" /> : <ArrowUpFromLine className="h-4 w-4" />}{tab === "deposit" ? "Continue deposit" : "Continue withdrawal"}</button>
            <p className="mt-3 text-xs leading-5 text-white/35">{tr("Prototype only. No payment provider or real-money transaction is connected.")}</p>
          </div>
        </Panel>
      </div>

      <Panel>
        <SectionTitle>{tr("Transactions")}</SectionTitle>
        <div className="divide-y divide-white/[0.07] text-sm">
          {[
            ["Game win", "+950 D", "Today, 15:31"],
            ["Game entry", "-500 D", "Today, 15:26"],
            ["Bonus", "+100 D", "Today, 09:00"],
            ["Game loss", "-100 D", "Yesterday"],
          ].map(([name, amount, date]) => (
            <div key={name + date} className="flex items-center gap-3 py-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.04]"><History className="h-4 w-4 text-white/40" /></div>
              <div className="flex-1"><div className="font-medium">{name}</div><div className="text-xs text-white/35">{date}</div></div>
              <div className={`font-semibold ${amount.startsWith("+") ? "text-[#46D495]" : "text-white/70"}`}>{amount}</div>
            </div>
          ))}
        </div>
      </Panel>
    </ResponsiveShell>
  );
}