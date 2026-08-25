"use client";

import { ResponsiveShell } from "@/components/ResponsiveShell";
import { Panel, SectionTitle, Stat } from "@/components/Ui";
import { Crown, Medal, Settings, ShieldCheck, Trophy } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";

export default function ProfilePage() {
  const { tr } = useI18n();
  return (
    <ResponsiveShell title={tr("Profile")}>
      <Panel className="overflow-hidden">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border-2 border-[#F5C344]/25 bg-gradient-to-br from-[#3A4652] to-[#111820] text-2xl font-bold">P</div>
          <div className="flex-1">
            <div className="text-2xl font-semibold">Player</div>
            <div className="mt-1 text-sm text-white/40">{tr("Member since August 2026")}</div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#F5C344]/20 bg-[#F5C344]/10 px-3 py-1.5 text-sm font-semibold text-[#F5C344]"><Crown className="h-4 w-4" /> Gold · 1240</div>
          </div>
          <Link href="/settings" className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04]"><Settings className="h-5 w-5 text-white/55" /></Link>
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Games played" value="247" />
        <Stat label="Wins" value="151" />
        <Stat label="Win rate" value="61.1%" accent />
        <Stat label="Best streak" value="9" />
      </div>

      <Panel>
        <SectionTitle>{tr("Achievements")}</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          {[["First 100 Wins", Trophy], ["Gold League", Medal], ["Verified Player", ShieldCheck]].map(([label, Icon]: any) => (
            <div key={label} className="rounded-2xl bg-white/[0.035] p-4">
              <Icon className="h-6 w-6 text-[#F5C344]" />
              <div className="mt-3 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </Panel>
    </ResponsiveShell>
  );
}