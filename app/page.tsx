import { ActionCards } from "@/components/ActionCards";
import { AppHeader } from "@/components/AppHeader";
import { BalanceCard } from "@/components/BalanceCard";
import { BottomNavigation } from "@/components/BottomNavigation";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { DesktopRightPanel } from "@/components/DesktopRightPanel";
import { InfoCards } from "@/components/InfoCards";
import { QuickGame } from "@/components/QuickGame";
import { RecentGames } from "@/components/RecentGames";

export default function HomePage() {
  return (
    <main className="min-h-dvh w-full overflow-x-hidden bg-transparent">
      {/* Mobile */}
      <section className="relative mx-auto min-h-dvh w-full max-w-[430px] pb-[94px] md:hidden">
        <div className="pointer-events-none absolute right-[-24px] top-[88px] z-0 rotate-[13deg] text-[98px] font-serif text-white/[0.025]">K♠</div>
        <AppHeader />
        <div className="relative z-10 space-y-3 px-4">
          <BalanceCard />
          <QuickGame />
          <ActionCards />
          <InfoCards />
          <RecentGames />
        </div>
        <BottomNavigation />
      </section>

      {/* Desktop */}
      <section className="hidden min-h-dvh md:grid md:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)] md:bg-[radial-gradient(circle_at_70%_4%,rgba(245,195,68,.08),transparent_24%),linear-gradient(180deg,#071017_0%,#080d12_35%,#05090d_100%)]">
        <DesktopSidebar />
        <div className="min-w-0 p-5 lg:p-7 xl:p-8">
          <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="min-w-0 space-y-5">
              <AppHeader desktop />
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,.85fr)]">
                <BalanceCard desktop />
                <InfoCards desktop />
              </div>
              <QuickGame desktop />
              <ActionCards desktop />
              <RecentGames desktop />
            </div>
            <DesktopRightPanel />
          </div>
        </div>
      </section>
    </main>
  );
}
