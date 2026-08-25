"use client";

import { ResponsiveShell } from "@/components/ResponsiveShell";
import { Panel, SectionTitle } from "@/components/Ui";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/I18nProvider";

function Toggle({ on, setOn }: { on: boolean; setOn: (v: boolean) => void }) {
  return <button onClick={() => setOn(!on)} className={`relative h-7 w-12 rounded-full transition ${on ? "bg-[#F5C344]" : "bg-white/10"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${on ? "left-6" : "left-1"}`} /></button>;
}

export default function SettingsPage() {
  const router = useRouter();
  const { tr } = useI18n();
  const [sound, setSound] = useState(true);
  const [moves, setMoves] = useState(true);
  const [invites, setInvites] = useState(false);

  return (
    <ResponsiveShell title={tr("Settings")}>
      <Panel>
        <SectionTitle>{tr("Game")}</SectionTitle>
        <div className="divide-y divide-white/[0.07]">
          {[["Game sounds", sound, setSound], ["Move notifications", moves, setMoves], ["Friend invites", invites, setInvites]].map(([label, value, setter]: any) => (
            <div key={label} className="flex items-center justify-between py-4"><span className="text-sm">{label}</span><Toggle on={value} setOn={setter} /></div>
          ))}
        </div>
      </Panel>
      <Panel>
        <SectionTitle>{tr("Account")}</SectionTitle>
        <div className="space-y-3">
          <button className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-left text-sm">{tr("Change username")}</button>
          <button className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-left text-sm">{tr("Security")}</button>
          <button onClick={async()=>{await fetch("/api/auth/logout",{method:"POST"});router.replace("/auth")}} className="w-full rounded-xl border border-[#F05B52]/15 bg-[#F05B52]/[0.05] p-3 text-left text-sm text-[#F05B52]">{tr("Log out")}</button>
        </div>
      </Panel>
    </ResponsiveShell>
  );
}