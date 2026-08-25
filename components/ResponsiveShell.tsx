"use client";

import { ReactNode } from "react";
import { BottomNavigation } from "./BottomNavigation";
import { DesktopSidebar } from "./DesktopSidebar";
import { AppHeader } from "./AppHeader";

export function ResponsiveShell({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <main className="min-h-dvh text-white">
      <section className="mx-auto min-h-dvh w-full max-w-[430px] pb-[86px] md:hidden">
        <AppHeader />
        <div className="space-y-3 px-3.5">
          {title && <h1 className="pt-1 text-2xl font-semibold">{title}</h1>}
          {children}
        </div>
        <BottomNavigation />
      </section>

      <section className="hidden min-h-dvh md:grid md:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
        <DesktopSidebar />
        <div className="min-w-0 bg-[radial-gradient(circle_at_75%_5%,rgba(245,195,68,.07),transparent_23%),linear-gradient(180deg,#071017_0%,#080d12_45%,#05090d_100%)] p-6 lg:p-8">
          <div className="mx-auto max-w-[1320px]">
            <AppHeader desktop />
            {title && <h1 className="mb-5 mt-2 text-3xl font-semibold">{title}</h1>}
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
