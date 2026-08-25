import { cookies } from "next/headers";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export type PublicUser = { id: string; username: string; email: string; createdAt: string };
type UserRecord = PublicUser & { passwordHash: string; salt: string };
type SessionRecord = { token: string; userId: string; createdAt: string };
type Store = { users: UserRecord[]; sessions: SessionRecord[] };

const storePath = path.join(process.cwd(), "data", "users.json");
let authLock = Promise.resolve();

async function mutateAuth<T>(fn: (store: Store) => T | Promise<T>): Promise<T> {
  let release!: () => void;
  const previous = authLock;
  authLock = new Promise<void>((resolve) => (release = resolve));
  await previous;
  try {
    const store = await readStore();
    const result = await fn(store);
    await writeStore(store);
    return result;
  } finally {
    release();
  }
}

async function readStore(): Promise<Store> {
  try {
    return JSON.parse(await fs.readFile(storePath, "utf8"));
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      const empty: Store = { users: [], sessions: [] };
      await writeStore(empty);
      return empty;
    }
    throw error;
  }
}
async function writeStore(store: Store) {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  const tmp = `${storePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(store, null, 2), "utf8");
  await fs.rename(tmp, storePath);
}
function hashPassword(password: string, salt: string) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}
function cleanUser(u: UserRecord): PublicUser { return { id: u.id, username: u.username, email: u.email, createdAt: u.createdAt }; }

export async function registerUser(username: string, email: string, password: string) {
  return mutateAuth((store) => {
    const normalized = email.trim().toLowerCase();
    if (store.users.some(u => u.email === normalized)) throw new Error("EMAIL_EXISTS");
    if (store.users.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) throw new Error("USERNAME_EXISTS");
    const salt = crypto.randomBytes(16).toString("hex");
    const user: UserRecord = {
      id: crypto.randomUUID(),
      username: username.trim(),
      email: normalized,
      passwordHash: hashPassword(password, salt),
      salt,
      createdAt: new Date().toISOString()
    };
    store.users.push(user);
    return cleanUser(user);
  });
}
export async function loginUser(email: string, password: string) {
  return mutateAuth((store) => {
    const user = store.users.find(u => u.email === email.trim().toLowerCase());
    if (!user || !crypto.timingSafeEqual(
      Buffer.from(user.passwordHash, "hex"),
      Buffer.from(hashPassword(password, user.salt), "hex")
    )) throw new Error("INVALID_CREDENTIALS");
    const token = crypto.randomBytes(32).toString("hex");
    store.sessions = store.sessions.filter(s => s.userId !== user.id);
    store.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
    return { user: cleanUser(user), token };
  });
}
export async function createSessionForUser(userId: string) {
  return mutateAuth((store) => {
    const token = crypto.randomBytes(32).toString("hex");
    store.sessions = store.sessions.filter(s => s.userId !== userId);
    store.sessions.push({ token, userId, createdAt: new Date().toISOString() });
    return token;
  });
}
export async function getCurrentUser(): Promise<PublicUser | null> {
  const token = (await cookies()).get("durak_session")?.value; if (!token) return null;
  const store = await readStore(); const session = store.sessions.find(s => s.token === token); if (!session) return null;
  const user = store.users.find(u => u.id === session.userId); return user ? cleanUser(user) : null;
}
export async function deleteCurrentSession() {
  const token = (await cookies()).get("durak_session")?.value;
  if (!token) return;
  await mutateAuth((store) => {
    store.sessions = store.sessions.filter(s => s.token !== token);
  });
}
