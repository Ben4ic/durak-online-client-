import { NextResponse } from "next/server";
import { loginUser } from "@/lib/auth";
export async function POST(req: Request) {
  try { const { email, password } = await req.json(); const { user, token } = await loginUser(email, password); const res = NextResponse.json({ user }); res.cookies.set("durak_session", token, { httpOnly:true, sameSite:"lax", secure:process.env.NODE_ENV==="production", path:"/", maxAge:60*60*24*30 }); return res; }
  catch { return NextResponse.json({ error: "Invalid email or password" }, { status: 401 }); }
}
