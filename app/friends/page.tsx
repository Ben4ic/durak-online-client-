"use client";

import { ResponsiveShell } from "@/components/ResponsiveShell";
import { Panel, SectionTitle } from "@/components/Ui";
import { Copy, Search, Swords, UserPlus } from "lucide-react";
import { useI18n } from "@/components/I18nProvider";

const friends = [
  ["Max_77", "Online", "1386"],
  ["Sergey777", "In game", "1274"],
  ["Alexey_88", "Online", "1198"],
  ["Marina", "Offline", "1321"],
];

export default function FriendsPage() {
  const { tr } = useI18n();
  return (
    <ResponsiveShell title={tr("Friends")}>
      <Panel>
        <div className="flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3">
            <Search className="h-4 w-4 text-white/35" />
            <input className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-white/25" placeholder={tr("Search player")} />
          </div>
          <button className="grid h-11 w-11 place-items-center rounded-xl bg-[#F5C344] text-[#111820]"><UserPlus className="h-5 w-5" /></button>
        </div>
      </Panel>

      <Panel>
        <SectionTitle>Friends <span className="ml-1 text-sm font-normal text-white/35">4</span></SectionTitle>
        <div className="space-y-2">
          {friends.map(([name, status, rating]) => (
            <div key={name} className="flex items-center gap-3 rounded-2xl bg-white/[0.035] p-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#333D48] to-[#151B22] font-semibold">{name[0]}</div>
              <div className="min-w-0 flex-1"><div className="font-medium">{name}</div><div className={`text-xs ${status === "Online" ? "text-[#46D495]" : "text-white/35"}`}>{status} · Rating {rating}</div></div>
              <button className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04]"><Swords className="h-4 w-4 text-[#F5C344]" /></button>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <SectionTitle>{tr("Your invite code")}</SectionTitle>
        <div className="flex items-center justify-between rounded-xl bg-white/[0.04] p-4">
          <span className="font-mono text-lg tracking-[.15em]">DURAK-8K2P</span>
          <button className="text-[#F5C344]"><Copy className="h-5 w-5" /></button>
        </div>
      </Panel>
    </ResponsiveShell>
  );
}