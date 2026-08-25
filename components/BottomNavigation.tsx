"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock3, Home, Layers3, User } from "lucide-react";
import { useI18n } from "./I18nProvider";

const nav = [
  { label: "Home", Icon: Home, href: "/" },
  { label: "Games", Icon: Layers3, href: "/games" },
  { label: "History", Icon: Clock3, href: "/history" },
  { label: "Profile", Icon: User, href: "/profile" },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const { tr } = useI18n();

  return (
    <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 border-t border-white/[0.08] bg-[#111820]/95 px-2 pt-2 backdrop-blur-xl" style={{ paddingBottom: "calc(8px + env(safe-area-inset-bottom))" }}>
      <div className="grid h-[66px] grid-cols-4">
        {nav.map(({ label, Icon, href }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={label} href={href} className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium ${active ? "text-[#F5C344]" : "text-[#8F969F]"}`}>
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              {tr(label)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
