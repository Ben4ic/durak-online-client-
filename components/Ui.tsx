import { ReactNode } from "react";

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[20px] border border-white/10 bg-[#111820]/95 p-4 shadow-[0_16px_50px_rgba(0,0,0,.18)] md:p-5 ${className}`}>{children}</div>;
}

export function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl bg-white/[0.035] p-4">
      <div className="text-xs text-white/40">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${accent ? "text-[#F5C344]" : "text-white"}`}>{value}</div>
    </div>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold">{children}</h2>{right}</div>;
}
