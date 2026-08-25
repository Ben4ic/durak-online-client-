"use client";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
export function AuthGate({ children }: { children: ReactNode }) {
  const path = usePathname(); const router = useRouter(); const [ready,setReady] = useState(path === "/auth");
  useEffect(() => {
    if (path === "/auth") { setReady(true); return; }
    let active=true; fetch("/api/auth/me", { cache:"no-store" }).then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(() => active && setReady(true)).catch(() => active && router.replace("/auth")); return () => { active=false; };
  }, [path, router]);
  if (!ready) return <main className="grid min-h-dvh place-items-center bg-[#071017] text-white"><div className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-[#F5C344]" /></main>;
  return <>{children}</>;
}
