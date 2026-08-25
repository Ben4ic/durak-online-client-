"use client";

import { ResponsiveShell } from "@/components/ResponsiveShell";
import { Panel, SectionTitle } from "@/components/Ui";
import { Clock3, Coins, Trophy, Users } from "lucide-react";
import { useI18n } from "@/components/I18nProvider";

const events = [
  ["Friday Cup", "64 players", "5 000 D", "Starts in 01:42:18"],
  ["Night League", "32 players", "2 400 D", "Starts in 04:15:09"],
  ["Weekend Major", "128 players", "12 000 D", "Saturday 20:00"],
];

export default function TournamentsPage() {
  const { tr } = useI18n();
  return (
    <ResponsiveShell title={tr("Tournaments")}>
      <div className="grid gap-4 lg:grid-cols-3">
        {events.map(([name, players, prize, time], i) => (
          <Panel key={name} className={i === 0 ? "border-[#F5C344]/25" : ""}>
            <div className="flex items-center justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#9474FF]/10"><Trophy className="h-5 w-5 text-[#A58BFF]" /></div>
              <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-white/45">{i === 0 ? "Open" : "Upcoming"}</span>
            </div>
            <h3 className="mt-5 text-xl font-semibold">{name}</h3>
            <div className="mt-4 space-y-2 text-sm text-white/55">
              <div className="flex items-center gap-2"><Users className="h-4 w-4" />{players}</div>
              <div className="flex items-center gap-2"><Coins className="h-4 w-4 text-[#F5C344]" />Prize pool {prize}</div>
              <div className="flex items-center gap-2"><Clock3 className="h-4 w-4" />{time}</div>
            </div>
            <button className="mt-5 w-full rounded-xl bg-[#F5C344] py-3 font-bold text-[#111820]">{tr("Join tournament")}</button>
          </Panel>
        ))}
      </div>
    </ResponsiveShell>
  );
}