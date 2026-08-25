"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock3, Crown, Home, Layers3, LogOut, Settings, Trophy, User, Users, WalletCards } from "lucide-react";
import { useI18n } from "./I18nProvider";

const nav = [
  { label: "Home", Icon: Home, href: "/" },
  { label: "Games", Icon: Layers3, href: "/games" },
  { label: "Tournaments", Icon: Trophy, href: "/tournaments" },
  { label: "History", Icon: Clock3, href: "/history" },
  { label: "Friends", Icon: Users, href: "/friends" },
  { label: "Wallet", Icon: WalletCards, href: "/wallet" },
  { label: "Profile", Icon: User, href: "/profile" },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const { tr } = useI18n();

  return (
    <aside className="sticky top-0 flex h-dvh flex-col border-r border-white/[0.07] bg-[#0b1117]/95 px-4 py-6 backdrop-blur-xl xl:px-5">
      <Link href="/" className="flex items-center gap-3 px-2">
        <div className="grid h-10 w-10 place-items-center rounded-[13px] border border-[#F5C344]/25 bg-[#F5C344]/10">
          <Crown className="h-6 w-6 text-[#F5C344]" strokeWidth={2.2} />
        </div>
        <div>
          <div className="font-serif text-[22px] font-semibold leading-none">Durak</div>
          <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F5C344]">Online</div>
        </div>
      </Link>

      <nav className="mt-10 space-y-1.5">
        {nav.map(({ label, Icon, href }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={label}
              href={href}
              className={`flex h-12 w-full items-center gap-3 rounded-[14px] px-3 text-left text-[14px] font-semibold transition ${
                active
                  ? "border border-[#F5C344]/20 bg-[#F5C344]/10 text-[#F5C344]"
                  : "border border-transparent text-[#929aa4] hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={2.1} />
              {tr(label)}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 border-t border-white/[0.07] pt-4">
        <Link href="/settings" className="flex h-11 w-full items-center gap-3 rounded-[13px] px-3 text-[13px] font-medium text-[#8F969F] hover:bg-white/[0.04] hover:text-white">
          <Settings className="h-[18px] w-[18px]" /> {tr("Settings")}
        </Link>
        <Link href="/auth" className="flex h-11 w-full items-center gap-3 rounded-[13px] px-3 text-[13px] font-medium text-[#8F969F] hover:bg-white/[0.04] hover:text-white">
          <LogOut className="h-[18px] w-[18px]" /> {tr("Log out")}
        </Link>
      </div>
    </aside>
  );
}
