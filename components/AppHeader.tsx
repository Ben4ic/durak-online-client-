"use client";

import { Bell, Crown } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "./I18nProvider";

export function AppHeader({ desktop = false }: { desktop?: boolean }) {
  const { tr } = useI18n();

  if (desktop) {
    return (
      <header className="flex min-h-[72px] items-center justify-between rounded-[20px] border border-white/[0.06] bg-[#0d141b]/65 px-5 py-4 backdrop-blur-xl">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8F969F]">{tr("Lobby")}</div>
          <h1 className="mt-1 text-[26px] font-bold tracking-[-0.02em] text-white">{tr("Welcome back, Player")}</h1>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button className="grid h-11 w-11 place-items-center rounded-[13px] border border-white/[0.08] bg-white/[0.03] text-[#A9B0B8]"><Bell className="h-5 w-5" /></button>
          <div className="relative h-11 w-11 rounded-full border border-white/20 bg-gradient-to-br from-zinc-500 to-zinc-900 p-[2px] shadow-lg">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#1b2229] text-sm font-bold">P</div>
            <span className="absolute -right-0.5 bottom-0 h-3 w-3 rounded-full border-2 border-[#0b1116] bg-[#46D495]" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="relative z-10 flex min-h-[72px] items-center justify-between gap-2 px-4 pt-2">
      <div className="flex min-w-0 items-center gap-2">
        <Crown className="h-7 w-7 shrink-0 text-[#F5C344]" strokeWidth={2.2} />
        <h1 className="truncate font-serif text-[27px] font-semibold tracking-[-0.02em] text-white">Durak Online</h1>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <LanguageSwitcher compact />
        <div className="relative h-10 w-10 rounded-full border border-white/25 bg-gradient-to-br from-zinc-500 to-zinc-900 p-[2px] shadow-lg">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[#1b2229] text-sm font-bold">P</div>
          <span className="absolute -right-0.5 bottom-0 h-3 w-3 rounded-full border-2 border-[#0b1116] bg-[#46D495]" />
        </div>
      </div>
    </header>
  );
}
