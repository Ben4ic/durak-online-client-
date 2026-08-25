import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import {
  OnlineGame,
  PlayerSlot,
  applyOnlineAction,
  publicOnlineState,
  startOnlineGame,
} from "./multiplayerDurak";

type PlayerSecret = { playerId: string; secret: string };
type StoredRoom = OnlineGame & { access: PlayerSecret[]; publicRoom: boolean };
type Store = { rooms: StoredRoom[] };

const storePath = path.join(process.cwd(), "data", "simple-online.json");
let lock = Promise.resolve();

async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(storePath, "utf8");
    const parsed = JSON.parse(raw);
    return { rooms: Array.isArray(parsed.rooms) ? parsed.rooms : [] };
  } catch (e: any) {
    if (e?.code !== "ENOENT") throw e;
    return { rooms: [] };
  }
}

async function writeStore(store: Store) {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  const tmp = `${storePath}.${process.pid}.${Date.now()}.${crypto.randomBytes(4).toString("hex")}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(store, null, 2), "utf8");
  await fs.rename(tmp, storePath);
}

async function mutate<T>(fn: (store: Store) => T | Promise<T>): Promise<T> {
  let release!: () => void;
  const prev = lock;
  lock = new Promise<void>((resolve) => (release = resolve));
  await prev;
  try {
    const store = await readStore();
    // cleanup abandoned waiting rooms after 2h, finished games after 12h
    const now = Date.now();
    store.rooms = store.rooms.filter((r) => {
      const age = now - new Date(r.updatedAt || r.createdAt).getTime();
      return r.status === "finished" ? age < 12 * 60 * 60 * 1000 : age < 2 * 60 * 60 * 1000;
    });
    const result = await fn(store);
    await writeStore(store);
    return result;
  } finally {
    release();
  }
}

function code() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let x = "";
  for (let i = 0; i < 6; i++) x += chars[crypto.randomInt(chars.length)];
  return x;
}

function player(name: string): { slot: PlayerSlot; secret: string } {
  return {
    slot: {
      id: crypto.randomUUID(),
      username: (name || "Player").trim().slice(0, 24) || "Player",
    },
    secret: crypto.randomBytes(24).toString("hex"),
  };
}

function baseRoom(slot: PlayerSlot, secret: string, roomCode: string): StoredRoom {
  const now = new Date().toISOString();
  return {
    code: roomCode,
    status: "waiting",
    players: [slot],
    deck: [],
    hands: { [slot.id]: [] },
    table: [],
    maxAttacks: 6,
    message: "Waiting for opponent",
    createdAt: now,
    updatedAt: now,
    revision: 0,
    access: [{ playerId: slot.id, secret }],
    publicRoom: true,
  };
}

function auth(room: StoredRoom, secret: string) {
  const entry = room.access.find((a) => a.secret === secret);
  if (!entry) throw new Error("INVALID_PLAYER_TOKEN");
  return entry.playerId;
}

export async function createSimpleRoom(username: string) {
  return mutate((store) => {
    let roomCode = code();
    while (store.rooms.some((r) => r.code === roomCode)) roomCode = code();
    const p = player(username);
    const room = baseRoom(p.slot, p.secret, roomCode);
    store.rooms.push(room);
    return {
      room: publicOnlineState(room, p.slot.id),
      playerToken: p.secret,
    };
  });
}

export async function joinSimpleRoom(roomCodeInput: string, username: string) {
  return mutate((store) => {
    const roomCode = roomCodeInput.trim().toUpperCase();
    const idx = store.rooms.findIndex((r) => r.code === roomCode);
    if (idx < 0) throw new Error("ROOM_NOT_FOUND");

    let room = store.rooms[idx];

    if (room.status !== "waiting" || room.players.length >= 2) {
      throw new Error("ROOM_NOT_AVAILABLE");
    }

    const p = player(username);
    room.players.push(p.slot);
    room.hands[p.slot.id] = [];
    room.access.push({ playerId: p.slot.id, secret: p.secret });
    room = Object.assign(startOnlineGame(room), {
      access: room.access,
      publicRoom: room.publicRoom,
    }) as StoredRoom;

    store.rooms[idx] = room;
    return {
      room: publicOnlineState(room, p.slot.id),
      playerToken: p.secret,
    };
  });
}

export async function getSimpleRoom(roomCodeInput: string, secret: string) {
  const store = await readStore();
  const roomCode = roomCodeInput.trim().toUpperCase();
  const room = store.rooms.find((r) => r.code === roomCode);
  if (!room) throw new Error("ROOM_NOT_FOUND");
  const playerId = auth(room, secret);
  return publicOnlineState(room, playerId);
}

export async function simpleAction(
  roomCodeInput: string,
  secret: string,
  action: "play" | "done" | "take",
  cardId?: string,
  expectedRevision?: number
) {
  return mutate((store) => {
    const roomCode = roomCodeInput.trim().toUpperCase();
    const idx = store.rooms.findIndex((r) => r.code === roomCode);
    if (idx < 0) throw new Error("ROOM_NOT_FOUND");

    const room = store.rooms[idx];
    const playerId = auth(room, secret);

    if (
      typeof expectedRevision === "number" &&
      (room.revision || 0) !== expectedRevision
    ) {
      // Return current state instead of breaking the client.
      return publicOnlineState(room, playerId);
    }

    const next = applyOnlineAction(room, playerId, action, cardId);
    const stored = Object.assign(next, {
      access: room.access,
      publicRoom: room.publicRoom,
    }) as StoredRoom;
    store.rooms[idx] = stored;
    return publicOnlineState(stored, playerId);
  });
}

export async function listSimpleRooms() {
  const store = await readStore();
  return store.rooms
    .filter((r) => r.publicRoom && r.status === "waiting" && r.players.length === 1)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .map((r) => ({
      code: r.code,
      host: r.players[0]?.username || "Player",
      players: r.players.length,
      capacity: 2,
    }));
}

export async function quickSimpleRoom(username: string) {
  return mutate((store) => {
    const waiting = store.rooms.find(
      (r) => r.publicRoom && r.status === "waiting" && r.players.length === 1
    );

    if (waiting) {
      const p = player(username);
      const idx = store.rooms.findIndex((r) => r.code === waiting.code);
      waiting.players.push(p.slot);
      waiting.hands[p.slot.id] = [];
      waiting.access.push({ playerId: p.slot.id, secret: p.secret });

      const started = Object.assign(startOnlineGame(waiting), {
        access: waiting.access,
        publicRoom: waiting.publicRoom,
      }) as StoredRoom;
      store.rooms[idx] = started;

      return {
        room: publicOnlineState(started, p.slot.id),
        playerToken: p.secret,
      };
    }

    let roomCode = code();
    while (store.rooms.some((r) => r.code === roomCode)) roomCode = code();
    const p = player(username);
    const room = baseRoom(p.slot, p.secret, roomCode);
    store.rooms.push(room);
    return {
      room: publicOnlineState(room, p.slot.id),
      playerToken: p.secret,
    };
  });
}

export async function leaveSimpleRoom(roomCodeInput: string, secret: string) {
  return mutate((store) => {
    const roomCode = roomCodeInput.trim().toUpperCase();
    const idx = store.rooms.findIndex((r) => r.code === roomCode);
    if (idx < 0) return { ok: true };

    const room = store.rooms[idx];
    const playerId = auth(room, secret);

    if (room.status === "waiting") {
      store.rooms.splice(idx, 1);
      return { ok: true };
    }

    if (room.status === "active") {
      const opponent = room.players.find((p) => p.id !== playerId);
      room.status = "finished";
      room.winnerId = opponent?.id || "draw";
      room.message = opponent ? `${opponent.username} wins` : "Game ended";
      room.updatedAt = new Date().toISOString();
      room.revision = (room.revision || 0) + 1;
      store.rooms[idx] = room;
    }
    return { ok: true };
  });
}
