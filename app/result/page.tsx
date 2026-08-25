"use client";

import { Coins, Crown, RotateCcw, Trophy } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useI18n } from "@/components/I18nProvider";

function Result() {
  const router = useRouter();
  const { tr } = useI18n();
  const params = useSearchParams();
  const stake = Number(params.get("stake") || 500);
  const won = params.get("outcome") !== "loss";
  return (
    <main className="grid min-h-dvh place-items-center bg-[radial-gradient(circle_at_center,rgba(245,195,68,.10),transparent_30%),#071017] p-5 text-white">
      <div className="w-full max-w-[470px] rounded-[28px] border border-white/10 bg-[#101820]/95 p-7 text-center shadow-[0_30px_90px_rgba(0,0,0,.35)]">
        <div className={`mx-auto grid h-20 w-20 place-items-center rounded-full ${won ? "bg-[#F5C344]/10 text-[#F5C344]" : "bg-[#F05B52]/10 text-[#F05B52]"}`}>
          {won ? <Trophy className="h-9 w-9" /> : <Crown className="h-9 w-9 rotate-180" />}
        </div>
        <h1 className="mt-5 text-3xl font-semibold">{won ? tr("Victory!") : tr("Defeat")}</h1>
        <p className="mt-2 text-sm text-white/40">Classic Durak · Game #839201</p>
        <div className="mt-6 rounded-2xl bg-white/[0.04] p-5">
          <div className="text-xs text-white/40">{won ? tr("You received") : tr("Result")}</div>
          <div className={`mt-1 text-3xl font-semibold ${won ? "text-[#46D495]" : "text-[#F05B52]"}`}>{won ? `+${Math.round(stake * 1.9)} D` : `-${stake} D`}</div>
          <div className="mt-2 text-xs text-white/35">{won ? `Pot ${stake * 2} D · platform fee ${Math.round(stake * .1)} D` : tr("Better luck next game")}</div>
        </div>
        <button onClick={() => router.push(`/matchmaking?stake=${stake}`)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5C344] py-3 font-bold text-[#111820]"><RotateCcw className="h-4 w-4" /> Rematch</button>
        <button onClick={() => router.push("/")} className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 font-semibold text-white/60">{tr("Back to lobby")}</button>
      </div>
    </main>
  );
}
export default function Page(){ return <Suspense><Result /></Suspense> }