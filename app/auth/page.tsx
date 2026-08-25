"use client";
import { Crown, Mail, LockKeyhole, User } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/I18nProvider";

export default function AuthPage() {
  const router = useRouter();
  const { tr } = useI18n(); const [mode,setMode]=useState<"login"|"register">("login"); const [loading,setLoading]=useState(false); const [error,setError]=useState("");
  const [username,setUsername]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  async function submit(e:FormEvent){e.preventDefault();setError("");setLoading(true);try{const res=await fetch(`/api/auth/${mode}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username,email,password})});const data=await res.json();if(!res.ok) throw new Error(data.error||"Request failed");router.replace("/");router.refresh();}catch(e:any){setError(e.message)}finally{setLoading(false)}}
  return <main className="grid min-h-dvh place-items-center bg-[radial-gradient(circle_at_50%_0%,rgba(245,195,68,.10),transparent_30%),#071017] p-5 text-white">
    <div className="w-full max-w-[430px]">
      <div className="mb-8 flex justify-center"><div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#F5C344]/20 bg-[#F5C344]/10"><Crown className="h-7 w-7 text-[#F5C344]" /></div><div><div className="font-serif text-2xl font-semibold">Durak</div><div className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#F5C344]">Online</div></div></div></div>
      <form onSubmit={submit} className="rounded-[26px] border border-white/10 bg-[#101820]/95 p-6 shadow-[0_28px_90px_rgba(0,0,0,.3)]">
        <h1 className="text-2xl font-semibold">{mode==="login"?"Welcome back":"Create account"}</h1><p className="mt-2 text-sm text-white/40">{mode==="login"?"Sign in to continue.":"Create your player profile."}</p>
        <div className="mt-6 space-y-3">
          {mode==="register" && <div className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3"><User className="h-4 w-4 text-white/30"/><input value={username} onChange={e=>setUsername(e.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder={tr("Username")} autoComplete="username"/></div>}
          <div className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3"><Mail className="h-4 w-4 text-white/30"/><input value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder={tr("Email")} type="email" autoComplete="email"/></div>
          <div className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3"><LockKeyhole className="h-4 w-4 text-white/30"/><input value={password} onChange={e=>setPassword(e.target.value)} type="password" className="w-full bg-transparent text-sm outline-none" placeholder={tr("Password")} autoComplete={mode==="login"?"current-password":"new-password"}/></div>
          {error && <div className="rounded-xl border border-[#F05B52]/20 bg-[#F05B52]/10 px-3 py-2.5 text-sm text-[#ff8a84]">{error}</div>}
          <button disabled={loading} className="h-12 w-full rounded-xl bg-[#F5C344] font-bold text-[#111820] disabled:opacity-60">{loading?"Please wait...":mode==="login"?"Sign in":"Create account"}</button>
        </div>
        <button type="button" onClick={()=>{setMode(mode==="login"?"register":"login");setError("")}} className="mt-4 w-full text-center text-sm text-white/45">{mode==="login"?"No account? Create one":"Already have an account? Sign in"}</button>
      </form>
    </div>
  </main>
}