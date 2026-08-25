import { NextResponse } from "next/server";
import { createSessionForUser, registerUser } from "@/lib/auth";
export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();
    if (!username || username.trim().length < 3) return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
    if (!/^\S+@\S+\.\S+$/.test(email || "")) return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
    if (!password || password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    const user = await registerUser(username, email, password); const token = await createSessionForUser(user.id);
    const res = NextResponse.json({ user }); res.cookies.set("durak_session", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60*60*24*30 }); return res;
  } catch (e:any) {
    if (e.message === "EMAIL_EXISTS") return NextResponse.json({ error: "This email is already registered" }, { status: 409 });
    if (e.message === "USERNAME_EXISTS") return NextResponse.json({ error: "This username is already taken" }, { status: 409 });
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
