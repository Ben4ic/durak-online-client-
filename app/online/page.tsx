"use client";

import { ResponsiveShell } from "@/components/ResponsiveShell";
import { Check, Copy, ExternalLink, Globe2, LoaderCircle, LogIn, Plus, RefreshCw, Search, Share2, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/I18nProvider";

type Room = { code: string; host: string; players: number; capacity: number };
type Waiting = { code: string; status: "waiting" | "active" | "finished" };

function tokenKey(code: string) {
  return `durak-room-token:${code.toUpperCase()}`;
}

function OnlineLobby() {
  const router = useRouter();
  const params = useSearchParams();
  const { tr } = useI18n();

  const [username, setUsername] = useState("Player");
  const [code, setCode] = useState(params.get("room")?.toUpperCase() || "");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [waiting, setWaiting] = useState<Waiting | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"id" | "link" | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(async (r) => {
      if (!r.ok) return;
      const data = await r.json();
      if (data?.user?.username) setUsername(data.user.username);
    }).catch(() => {});
  }, []);

  async function loadRooms() {
    try {
      const r = await fetch(`/api/online/public?t=${Date.now()}`, { cache: "no-store" });
      if (r.ok) setRooms(await r.json());
    } catch {}
  }

  useEffect(() => {
    loadRooms();
    const t = setInterval(loadRooms, 1200);
    return () => clearInterval(t);
  }, []);

  function saveJoin(data: any) {
    const room = data.room;
    const token = data.playerToken;
    if (!room?.code || !token) throw new Error("BAD_SERVER_RESPONSE");
    localStorage.setItem(tokenKey(room.code), token);
    return room;
  }

  async function post(path: string, body: any = {}) {
    setBusy(true);
    setError("");
    try {
      const r = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "REQUEST_FAILED");
      return data;
    } catch (e: any) {
      setError((e?.message || "REQUEST_FAILED").replaceAll("_", " "));
      return null;
    } finally {
      setBusy(false);
    }
  }


  async function copyText(text: string, type: "id" | "link") {
    setError("");
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        ta.style.top = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        ta.setSelectionRange(0, ta.value.length);
        const ok = document.execCommand("copy");
        ta.remove();
        if (!ok) throw new Error("COPY_FAILED");
      }
      setCopied(type);
      window.setTimeout(() => setCopied(null), 1400);
    } catch {
      setError(type === "id" ? "Не удалось скопировать ID. Зажмите код и скопируйте вручную." : "Не удалось скопировать ссылку. Используйте кнопку Share.");
    }
  }

  async function shareInvite() {
    if (!waiting?.code || !invite) return;
    setError("");
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Durak Online",
          text: `Join my room: ${waiting.code}`,
          url: invite,
        });
        return;
      }
      await copyText(invite, "link");
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        await copyText(invite, "link");
      }
    }
  }

  async function createRoom() {
    const data = await post("/api/online/create", { username });
    if (!data) return;
    const room = saveJoin(data);
    setWaiting(room);
    loadRooms();
  }

  async function quick() {
    const data = await post("/api/online/quick", { username });
    if (!data) return;
    const room = saveJoin(data);
    if (room.status === "active") router.push(`/online/game/${room.code}`);
    else setWaiting(room);
  }

  async function join(roomCode = code) {
    const normalized = roomCode.trim().toUpperCase();
    if (normalized.length !== 6) {
      setError("Enter 6-character room ID");
      return;
    }
    const data = await post("/api/online/join", { code: normalized, username });
    if (!data) return;
    const room = saveJoin(data);
    router.push(`/online/game/${room.code}`);
  }

  useEffect(() => {
    if (!waiting?.code || waiting.status !== "waiting") return;
    const token = localStorage.getItem(tokenKey(waiting.code));
    if (!token) return;

    const t = setInterval(async () => {
      try {
        const r = await fetch(`/api/online/room?code=${waiting.code}&t=${Date.now()}`, {
          cache: "no-store",
          headers: { "x-player-token": token },
        });
        if (!r.ok) return;
        const room = await r.json();
        setWaiting(room);
        if (room.status === "active") router.push(`/online/game/${room.code}`);
      } catch {}
    }, 600);

    return () => clearInterval(t);
  }, [waiting?.code, waiting?.status, router]);

  async function cancel() {
    if (!waiting?.code) return;
    const token = localStorage.getItem(tokenKey(waiting.code)) || "";
    await fetch("/api/online/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-player-token": token },
      body: JSON.stringify({ code: waiting.code }),
    }).catch(() => {});
    localStorage.removeItem(tokenKey(waiting.code));
    setWaiting(null);
    loadRooms();
  }

  const invite = useMemo(() => {
    if (typeof window === "undefined" || !waiting?.code) return "";
    return `${window.location.origin}/online?room=${waiting.code}`;
  }, [waiting?.code]);

  if (waiting) {
    return (
      <ResponsiveShell title={tr("Online Match")}>
        <div className="mx-auto max-w-[640px] rounded-[24px] border border-[#46D495]/20 bg-[#111820] p-5 text-center">
          <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-[#70E6B0]" />
          <h2 className="mt-4 text-xl font-semibold">{tr("Waiting for opponent")}</h2>
          <div className="mx-auto mt-5 flex max-w-[330px] items-center justify-between rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
            <button
              onClick={() => copyText(waiting.code, "id")}
              className="select-all font-mono text-xl font-bold tracking-[.20em]"
              title="Tap to copy"
            >
              {waiting.code}
            </button>
            <button
              onClick={() => copyText(waiting.code, "id")}
              className="grid h-10 w-10 place-items-center rounded-xl bg-white/[.05]"
              aria-label="Copy room ID"
            >
              {copied === "id" ? <Check className="h-5 w-5 text-[#70E6B0]" /> : <Copy className="h-5 w-5 text-[#F5C344]" />}
            </button>
          </div>
          <div className="mx-auto mt-3 max-w-[500px] rounded-xl border border-white/10 bg-white/[.03] p-2">
            <div className="select-all truncate px-2 py-1.5 text-left text-xs text-white/40">{invite}</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                onClick={() => copyText(invite, "link")}
                className="flex h-10 items-center justify-center gap-2 rounded-lg bg-white/[.06] px-3 text-xs font-semibold"
              >
                {copied === "link" ? <Check className="h-4 w-4 text-[#70E6B0]" /> : <Copy className="h-4 w-4" />}
                {copied === "link" ? "Copied" : tr("Copy link")}
              </button>
              <button
                onClick={shareInvite}
                className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#F5C344] px-3 text-xs font-bold text-[#111820]"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>
          {error && <div className="mt-3 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs text-red-300">{error}</div>}
          <button onClick={cancel} className="mt-5 rounded-xl border border-white/10 px-5 py-2.5 text-sm text-white/55">{tr("Cancel room")}</button>
        </div>
      </ResponsiveShell>
    );
  }

  return (
    <ResponsiveShell title={tr("Play Online")}>
      <div className="rounded-[20px] border border-white/10 bg-[#111820] p-4">
        <label className="mb-2 block text-xs text-white/40">Player name</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} maxLength={24}
          className="h-11 w-full rounded-xl border border-white/10 bg-white/[.04] px-3 outline-none" />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <button disabled={busy} onClick={quick} className="rounded-[20px] border border-[#46D495]/20 bg-[#46D495]/10 p-5 text-left disabled:opacity-50">
          <Search className="h-6 w-6 text-[#70E6B0]" />
          <div className="mt-4 font-semibold">{tr("Quick Match")}</div>
          <div className="mt-1 text-xs leading-5 text-white/40">Find a waiting player automatically.</div>
        </button>
        <button disabled={busy} onClick={createRoom} className="rounded-[20px] border border-[#F5C344]/20 bg-[#F5C344]/[.06] p-5 text-left disabled:opacity-50">
          <Plus className="h-6 w-6 text-[#F5C344]" />
          <div className="mt-4 font-semibold">{tr("Create Room")}</div>
          <div className="mt-1 text-xs leading-5 text-white/40">Create ID and wait for your friend.</div>
        </button>
        <div className="rounded-[20px] border border-white/10 bg-[#111820] p-5">
          <LogIn className="h-6 w-6 text-white/65" />
          <div className="mt-4 font-semibold">{tr("Join by ID")}</div>
          <div className="mt-3 flex gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={6}
              placeholder={tr("ROOM ID")}
              className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[.04] px-3 font-mono uppercase outline-none" />
            <button disabled={busy} onClick={() => join()} className="rounded-xl bg-[#F5C344] px-4 font-bold text-[#111820]">{tr("Join")}</button>
          </div>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300">{error}</div>}

      <div className="rounded-[20px] border border-white/10 bg-[#111820] p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="font-semibold">{tr("Public Lobby")}</div>
            <div className="text-xs text-white/35">{tr("Rooms waiting for a second player")}</div>
          </div>
          <button onClick={loadRooms} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10"><RefreshCw className="h-4 w-4" /></button>
        </div>
        <div className="space-y-2">
          {rooms.map((room) => (
            <div key={room.code} className="flex items-center gap-3 rounded-xl border border-white/[.07] bg-white/[.025] p-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{room.host}</div>
                <div className="text-[11px] text-white/35">{room.code} · {room.players}/{room.capacity}</div>
              </div>
              <button disabled={busy} onClick={() => join(room.code)} className="flex items-center gap-1.5 rounded-lg bg-[#F5C344] px-3 py-2 text-xs font-bold text-[#111820]">
                <ExternalLink className="h-3.5 w-3.5" /> {tr("Join")}
              </button>
            </div>
          ))}
          {!rooms.length && <div className="py-8 text-center text-sm text-white/25">{tr("No public rooms are waiting right now.")}</div>}
        </div>
      </div>
    </ResponsiveShell>
  );
}

export default function Page() {
  return <Suspense><OnlineLobby /></Suspense>;
}
