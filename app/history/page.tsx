"use client";

import { ResponsiveShell } from "@/components/ResponsiveShell";
import { Panel, SectionTitle, Stat } from "@/components/Ui";
import { useI18n } from "@/components/I18nProvider";

const games = [
  ["#839201", "Max_77", "500 D", "Win", "+475 D", "10 min ago"],
  ["#839172", "Marina", "100 D", "Loss", "-100 D", "35 min ago"],
  ["#839101", "Sergey777", "1 000 D", "Win", "+950 D", "1 h ago"],
  ["#838920", "IvanK", "500 D", "Win", "+475 D", "Yesterday"],
  ["#838833", "Anton33", "500 D", "Loss", "-500 D", "Yesterday"],
];

export default function HistoryPage() {
  const { tr } = useI18n();
  return (
    <ResponsiveShell title={tr("Game History")}>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Games" value="247" />
        <Stat label="Wins" value="151" />
        <Stat label="Win rate" value="61.1%" accent />
        <Stat label="Net result" value="+8 450 D" accent />
      </div>
      <Panel>
        <SectionTitle>{tr("Recent matches")}</SectionTitle>
        <div className="divide-y divide-white/[0.07]">
          {games.map(([id, opponent, stake, result, amount, time]) => (
            <div key={id} className="grid grid-cols-[1fr_auto] gap-3 py-4 md:grid-cols-[110px_1fr_110px_100px_110px_120px] md:items-center">
              <div className="text-xs text-white/35">{id}</div>
              <div className="font-medium">{opponent}</div>
              <div className="text-sm text-white/55">{stake}</div>
              <div className={`text-sm font-semibold ${result === "Win" ? "text-[#46D495]" : "text-[#F05B52]"}`}>{result}</div>
              <div className={`text-sm font-semibold ${amount.startsWith("+") ? "text-[#46D495]" : "text-[#F05B52]"}`}>{amount}</div>
              <div className="text-xs text-white/35">{time}</div>
            </div>
          ))}
        </div>
      </Panel>
    </ResponsiveShell>
  );
}