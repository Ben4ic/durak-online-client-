"use client";

import { Coins, LoaderCircle, ShieldCheck, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";

function Matchmaking() {
  const router = useRouter();
  const { tr } = useI18n();
  const params = useSearchParams();
  const stake = Number(params.get("stake") || 500);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const tick = setInterval(() => setSeconds((v) => v + 1), 1000);
    const go = setTimeout(() => router.push(`/game?stake=${stake}`), 2800);
    return () => { clearInterval(tick); clearTimeout(go); };
  }, [router, stake]);

  return (
    <main className="grid min-h-dvh place-items-center bg-[radial-gradient(circle_at_center,rgba(48,132,99,.20),transparent_34%),#071017] p-5 text-white">
      <div className="w-full max-w-[460px] rounded-[28px] border border-white/10 bg-[#101820]/95 p-7 text-center shadow-[0_30px_90px_rgba(0,0,0,.35)]">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-[#F5C344]/20 bg-[#F5C344]/10">
          <LoaderCircle className="h-9 w-9 animate-spin text-[#F5C344]" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold">{tr("Finding opponent")}</h1>
        <p className="mt-2 text-sm text-white/45">{tr("Searching for a player with a similar rating...")}</p>

        <div className="mt-6 grid grid-cols-2 gap-3 text-left">
          <div className="rounded-2xl bg-white/[0.04] p-4"><div className="text-xs text-white/40">{tr("Stake")}</div><div className="mt-1 flex items-center gap-1.5 text-lg font-semibold"><Coins className="h-4 w-4 text-[#F5C344]" />{stake} D</div></div>
          <div className="rounded-2xl bg-white/[0.04] p-4"><div className="text-xs text-white/40">{tr("Search time")}</div><div className="mt-1 text-lg font-semibold">00:{String(seconds).padStart(2, "0")}</div></div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-[#46D495]/20 bg-[#46D495]/[0.05] p-3 text-xs text-[#70E6B0]"><ShieldCheck className="h-4 w-4" /> Secure match queue</div>
        <button onClick={() => router.push("/")} className="mt-6 w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 text-sm font-semibold text-white/65">{tr("Cancel search")}</button>
      </div>
    </main>
  );
}

export default function Page() {
  return <Suspense><Matchmaking /></Suspense>;
}