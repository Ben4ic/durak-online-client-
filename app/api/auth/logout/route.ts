import { NextResponse } from "next/server";
import { deleteCurrentSession } from "@/lib/auth";
export async function POST() { await deleteCurrentSession(); const res = NextResponse.json({ ok:true }); res.cookies.set("durak_session", "", { path:"/", maxAge:0 }); return res; }
