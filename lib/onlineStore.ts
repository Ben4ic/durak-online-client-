import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { OnlineGame, PlayerSlot, applyOnlineAction, publicOnlineState, startOnlineGame } from "./multiplayerDurak";

type Store = { rooms: OnlineGame[]; quickQueue: string[] };
const storePath = path.join(process.cwd(), "data", "online-games.json");

let lock = Promise.resolve();

async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(storePath, "utf8");
    const parsed = JSON.parse(raw);
    return { rooms: parsed.rooms || [], quickQueue: parsed.quickQueue || [] };
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      const empty: Store = { rooms: [], quickQueue: [] };
      await writeStore(empty);
      return empty;
    }
    // Never erase live rooms because of a transient read/parse problem.
    throw error;
  }
}

async function writeStore(store: Store) {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  const tmp = `${storePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(store, null, 2), "utf8");
  await fs.rename(tmp, storePath);
}

async function mutate<T>(fn: (store: Store) => Promise<T> | T): Promise<T> {
  let release!: () => void;
  const previous = lock;
  lock = new Promise<void>((r) => (release = r));
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

function roomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[crypto.randomInt(0, chars.length)];
  return out;
}

function baseRoom(player: PlayerSlot, code = roomCode()): OnlineGame {
  const now = new Date().toISOString();
  return {
    code,
    status: "waiting",
    players: [player],
    deck: [],
    hands: { [player.id]: [] },
    table: [],
    maxAttacks: 6,
    message: "Waiting for opponent",
    createdAt: now,
    updatedAt: now,
    revision: 0,
  };
}

export async function createRoom(player: PlayerSlot) {
  return mutate((store) => {
    let code = roomCode();
    while (store.rooms.some((r) => r.code === code)) code = roomCode();
    const room = baseRoom(player, code);
    store.rooms.push(room);
    return publicOnlineState(room, player.id);
  });
}

export async function joinRoom(codeInput: string, player: PlayerSlot) {
  return mutate((store) => {
    const code = codeInput.trim().toUpperCase();
    const idx = store.rooms.findIndex((r) => r.code === code);
    if (idx < 0) throw new Error("ROOM_NOT_FOUND");
    let room = store.rooms[idx];
    if (room.players.some((p) => p.id === player.id)) return publicOnlineState(room, player.id);
    if (room.players.length >= 2) throw new Error("ROOM_FULL");
    if (room.status !== "waiting") throw new Error("ROOM_ALREADY_STARTED");
    room.players.push(player);
    room.hands[player.id] = [];
    room = startOnlineGame(room);
    store.rooms[idx] = room;
    store.quickQueue = store.quickQueue.filter((c) => c !== code);
    return publicOnlineState(room, player.id);
  });
}

export async function getRoom(codeInput: string, userId: string) {
  const store = await readStore();
  const room = store.rooms.find((r) => r.code === codeInput.trim().toUpperCase());
  if (!room) throw new Error("ROOM_NOT_FOUND");
  return publicOnlineState(room, userId);
}

export async function roomAction(codeInput: string, userId: string, action: "play" | "done" | "take", cardId?: string) {
  return mutate((store) => {
    const code = codeInput.trim().toUpperCase();
    const idx = store.rooms.findIndex((r) => r.code === code);
    if (idx < 0) throw new Error("ROOM_NOT_FOUND");
    const room = applyOnlineAction(store.rooms[idx], userId, action, cardId);
    store.rooms[idx] = room;
    return publicOnlineState(room, userId);
  });
}

export async function quickMatch(player: PlayerSlot) {
  return mutate((store) => {
    store.quickQueue = store.quickQueue.filter((code) => {
      const room = store.rooms.find((r) => r.code === code);
      return room && room.status === "waiting" && room.players.length === 1;
    });

    const candidateCode = store.quickQueue.find((code) => {
      const room = store.rooms.find((r) => r.code === code);
      return room && room.players[0].id !== player.id;
    });

    if (candidateCode) {
      const idx = store.rooms.findIndex((r) => r.code === candidateCode);
      let room = store.rooms[idx];
      room.players.push(player);
      room.hands[player.id] = [];
      room = startOnlineGame(room);
      store.rooms[idx] = room;
      store.quickQueue = store.quickQueue.filter((c) => c !== candidateCode);
      return publicOnlineState(room, player.id);
    }

    const existing = store.rooms.find((r) => r.status === "waiting" && r.players[0]?.id === player.id);
    if (existing) {
      if (!store.quickQueue.includes(existing.code)) store.quickQueue.push(existing.code);
      return publicOnlineState(existing, player.id);
    }

    let code = roomCode();
    while (store.rooms.some((r) => r.code === code)) code = roomCode();
    const room = baseRoom(player, code);
    store.rooms.push(room);
    store.quickQueue.push(code);
    return publicOnlineState(room, player.id);
  });
}


function isStaleRoom(room: OnlineGame, maxAgeMs = 1000 * 60 * 60 * 6) {
  const updated = new Date(room.updatedAt || room.createdAt).getTime();
  return Date.now() - updated > maxAgeMs;
}

function publicRoomSummary(room: OnlineGame) {
  return {
    code: room.code,
    status: room.status,
    host: room.players[0]?.username || "Unknown",
    players: room.players.length,
    capacity: 2,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
  };
}

export async function listPublicRooms() {
  return mutate((store) => {
    store.rooms = store.rooms.filter((room) => !isStaleRoom(room));
    store.quickQueue = store.quickQueue.filter((code) =>
      store.rooms.some((room) => room.code === code && room.status === "waiting")
    );

    return store.rooms
      .filter((room) => room.status === "waiting" && room.players.length === 1)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .map(publicRoomSummary);
  });
}

export async function leaveRoom(codeInput: string, userId: string) {
  return mutate((store) => {
    const code = codeInput.trim().toUpperCase();
    const idx = store.rooms.findIndex((r) => r.code === code);
    if (idx < 0) return { ok: true };

    const room = store.rooms[idx];
    if (!room.players.some((p) => p.id === userId)) return { ok: true };

    if (room.status === "waiting") {
      store.rooms.splice(idx, 1);
      store.quickQueue = store.quickQueue.filter((c) => c !== code);
      return { ok: true };
    }

    if (room.status === "active") {
      const opponent = room.players.find((p) => p.id !== userId);
      room.status = "finished";
      room.winnerId = opponent?.id;
      room.message = opponent ? `${opponent.username} wins by forfeit` : "Game ended";
      room.updatedAt = new Date().toISOString();
      room.revision = (room.revision || 0) + 1;
      store.rooms[idx] = room;
      return { ok: true };
    }

    return { ok: true };
  });
}

export async function rejoinRoom(codeInput: string, userId: string) {
  const store = await readStore();
  const code = codeInput.trim().toUpperCase();
  const room = store.rooms.find((r) => r.code === code);
  if (!room) throw new Error("ROOM_NOT_FOUND");
  if (!room.players.some((p) => p.id === userId)) throw new Error("NOT_IN_GAME");
  return publicOnlineState(room, userId);
}


export async function roomActionWithRevision(
  codeInput: string,
  userId: string,
  action: "play" | "done" | "take",
  cardId?: string,
  expectedRevision?: number
) {
  return mutate((store) => {
    const code = codeInput.trim().toUpperCase();
    const idx = store.rooms.findIndex((r) => r.code === code);
    if (idx < 0) throw new Error("ROOM_NOT_FOUND");

    const current = store.rooms[idx];
    if (
      typeof expectedRevision === "number" &&
      expectedRevision >= 0 &&
      (current.revision || 0) !== expectedRevision
    ) {
      throw new Error("STATE_CHANGED");
    }

    const room = applyOnlineAction(current, userId, action, cardId);
    store.rooms[idx] = room;
    return publicOnlineState(room, userId);
  });
}
