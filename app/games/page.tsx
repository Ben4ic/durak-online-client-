"use client";

import { ResponsiveShell } from "@/components/ResponsiveShell";
import { Bot, Globe2, Sparkles, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/I18nProvider";

export default function GamesPage() {
  const router = useRouter();
  const { tr } = useI18n();

  return (
    <ResponsiveShell title={tr("Choose Game Mode")}>
      <div className="grid gap-4 lg:grid-cols-2">
        <button
          onClick={() => router.push("/game")}
          className="group min-h-[280px] rounded-[24px] border border-[#9474FF]/20 bg-[radial-gradient(circle_at_80%_10%,rgba(148,116,255,.18),transparent_35%),#111820] p-6 text-left shadow-[0_20px_60px_rgba(0,0,0,.22)] transition hover:-translate-y-0.5 hover:border-[#9474FF]/35"
        >
          <div className="flex items-start justify-between">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#9474FF]/15">
              <Bot className="h-7 w-7 text-[#A58BFF]" />
            </div>
            <span className="rounded-full border border-[#9474FF]/20 bg-[#9474FF]/10 px-3 py-1 text-xs font-semibold text-[#B7A6FF]">{tr("Instant")}</span>
          </div>
          <h2 className="mt-7 text-2xl font-semibold">{tr("Play vs Bot")}</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-white/45">{tr("Practice a complete game against the built-in bot. No second player is needed.")}</p>
          <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-[#B7A6FF]"><Sparkles className="h-4 w-4" /> Start training game</div>
        </button>

        <button
          onClick={() => router.push("/online")}
          className="group min-h-[280px] rounded-[24px] border border-[#46D495]/20 bg-[radial-gradient(circle_at_80%_10%,rgba(70,212,149,.15),transparent_35%),#111820] p-6 text-left shadow-[0_20px_60px_rgba(0,0,0,.22)] transition hover:-translate-y-0.5 hover:border-[#46D495]/35"
        >
          <div className="flex items-start justify-between">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#46D495]/10">
              <Globe2 className="h-7 w-7 text-[#70E6B0]" />
            </div>
            <span className="rounded-full border border-[#46D495]/20 bg-[#46D495]/10 px-3 py-1 text-xs font-semibold text-[#70E6B0]">{tr("2 Players")}</span>
          </div>
          <h2 className="mt-7 text-2xl font-semibold">{tr("Play Online")}</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-white/45">{tr("Play against another registered player. Use quick match or create a private room with a code.")}</p>
          <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-[#70E6B0]"><Users className="h-4 w-4" /> Find a real opponent</div>
        </button>
      </div>
    </ResponsiveShell>
  );
}
