# Durak Online — Two Game Modes

This build focuses on gameplay and registration only. No real-money system is connected.

## Modes

1. **Play vs Bot**
   - Full local game against the built-in bot.
   - Works immediately after login.

2. **Play Online**
   - Two registered users can play the same room.
   - Quick Match queue.
   - Private room code.
   - Game state is synchronized through the local Next.js server.
   - Server validates attacks, defenses, taking cards, ending rounds, draw order, trump rules and winner state.

## How to test Online mode on one Mac

Use two separate browser sessions so each session can have a different account:
- normal Chrome window;
- Chrome Incognito, Safari, Firefox, etc.

Register two different users.

Player A:
- Games → Play Online → Create Room

Player B:
- Games → Play Online → enter Player A's room code

Or both players can use **Quick Match**.

## Run

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

For another device on the same Wi-Fi, open the Mac's local network IP with port 3000 if the firewall/network allows it.

## Current scope

Included:
- registration/login/session;
- bot mode;
- online PvP room mode;
- quick matchmaking;
- private room codes;
- hidden opponent cards;
- server-side move validation;
- 36-card deck;
- trump;
- attack/defense;
- Take / Done;
- refill to six;
- win detection.

Not included yet:
- money/payments;
- production database;
- production WebSocket infrastructure;
- reconnect grace-period logic;
- ratings persistence;
- tournaments backend;
- anti-cheat telemetry.


## Smooth interaction update

The bot game now includes:
- physical card flight from the player's hand to the table;
- bot cards flying from the opponent hand area to the table;
- slower, variable bot decision timing (roughly 1.05–1.90 seconds before movement);
- deck-to-hand draw animations;
- table-to-hand animation when taking cards;
- table-to-discard animation when a round is completed;
- visible stacked deck with the trump card under it;
- smoother hover, select, press and hand-settle motion;
- temporary action locking during animations to prevent double-click state bugs.


## Polished gameplay animation pass

Changes:
- removed duplicated/layered draw overlays in player and bot hands;
- new cards animate using the actual rendered card elements (deck → final hand position);
- initial six-card deal is animated for both player and bot;
- player and bot played cards use a single temporary flight card and the source card is hidden while flying;
- bot response timing is slower and variable;
- trump card is explicitly face-up underneath the deck and labelled;
- deck stack is visibly separated from the trump card;
- smoother hover/select/press motion;
- quick emoji reactions;
- bot emoji reactions;
- small in-game practice chat panel with canned bot replies.

The bot chat is UI-only. Online PvP chat synchronization is not implemented yet.


## Critical gameplay fix
- fixed React development StrictMode issue that could leave the table permanently in `Dealing...`;
- attack/defense controls unlock after the initial deal;
- trump card renderer no longer rotates a full playing-card component, preventing clipping/deformation artifacts;
- face-up trump card is now drawn as a dedicated horizontal card underneath the deck.


## Stable motion / LAN testing update

Gameplay fixes:
- table now uses six permanent card slots, so existing cards never re-center or jump when a new attack is added;
- attack and defense flight animations target the exact final slot;
- hand reordering uses FLIP animation after every play/draw, so remaining cards slide smoothly instead of teleporting;
- Web Animations are cancelled after completion so they no longer leave persistent transform layers that interfere with later movement;
- trump card is a dedicated landscape card with upright rank/suit;
- deck and trump are visually separated.

### Test Online mode from a phone on the same Wi-Fi

`npm run dev` now starts Next.js on `0.0.0.0`, so other devices on your local network can connect.

On the Mac, run:

```bash
npm run dev
```

In another Terminal window:

```bash
zsh scripts/show-lan.sh
```

It prints something like:

```text
Open on phone: http://192.168.1.23:3000
```

Open that exact address on the phone while the phone and Mac are on the same Wi-Fi.

Create/register one account on the Mac and a different account on the phone. Then:
- go to Games → Play Online;
- Player 1 creates a private room;
- Player 2 enters the six-character room code;
- or both use Quick Match.

If macOS asks whether Node/Terminal may accept incoming connections, allow it.

For players outside your Wi-Fi, localhost/LAN is not enough; the server must be deployed to a public host or exposed through a secure tunnel.


## Online lobby / room IDs / invite links

Online mode now includes:
- Quick Match queue;
- Public Lobby with visible waiting rooms;
- Create Room;
- Join by six-character Room ID;
- direct invite URL (`/online?room=ABC123`);
- automatic public lobby refresh;
- room cleanup for stale waiting rooms;
- room leave/cancel handling;
- active-game forfeit handling when a player leaves;
- reconnect indicator during temporary polling failures;
- players can re-open the same active room while logged into the same account.

### Important deployment note

Room IDs and public lobby solve how players find each other. They do **not** by themselves make a server publicly reachable.

While the project runs on your Mac, outside players cannot connect unless:
1. they are on the same local network and use your Mac's LAN address; or
2. you expose/deploy the Next.js server to a public internet address.

For real remote testing, deploy this project to a public Node-compatible host. After deployment, the exact same lobby / room ID / invite-link flow works over the public site URL.


## Languages

The interface now has a persistent language switcher:
- EN — English
- RU — Russian
- UA — Ukrainian

The selected language is saved in `localStorage` and remains selected after refresh/restart.
Core lobby, navigation, game modes, online lobby, bot game, online game, profile, history, friends, settings, wallet, auth and tournament UI are localized.


## Online stability / mobile height fix

- online polling now rejects stale responses by game revision;
- overlapping refresh responses no longer overwrite a newer action;
- game actions carry an expected revision, so simultaneous conflicting actions return `STATE_CHANGED` instead of corrupting the room;
- controls now enable only when the selected action/card is legal;
- the online mobile table is a fixed `100dvh` game viewport and no longer grows into a long scrolling page;
- opponent hand, deck, table, player hand and controls have dedicated compact mobile zones;
- mobile cards use smaller dimensions while desktop remains larger;
- polling pauses while an action is being submitted and resumes afterward.


## Mobile UI + online persistence fix

Mobile:
- bot and online game now use the small Safari viewport (`100svh`);
- extra bottom reserve keeps the hand/buttons above Safari's bottom browser controls;
- opponent cards are compact on phone and remain full-size on desktop;
- the deck is scaled down on phone;
- table slots are compact and fixed;
- player hand is kept inside a dedicated mobile-height zone.

Online stability:
- user/session JSON writes and room JSON writes are atomic (`tmp` + rename);
- a transient read can no longer erase all users/rooms;
- auth writes are serialized, so registering/logging in from Mac and phone simultaneously cannot overwrite the other account;
- existing room revision protection remains enabled.

Recommended local online test:
1. Start on Mac with `npm run dev`.
2. Run `zsh scripts/show-lan.sh`.
3. Open the printed IP on the phone (same Wi-Fi).
4. Register Account A on Mac and Account B on phone.
5. On Mac: Games → Play Online → Create Room.
6. On phone: Games → Play Online → Join by ID.
7. Keep both browsers on the game screen and make alternating moves.


## iPhone viewport fix

The prior screenshot showed desktop-sized card geometry leaking into the mobile layout.
This build adds an explicit Next.js viewport (`width=device-width`, `viewport-fit=cover`)
and hard max-767px card sizing, plus a larger bottom reserve for Safari's floating toolbar.


## Online v2 — independent room tokens

The Online mode no longer depends on browser auth cookies for room synchronization.

Each device receives a unique room token when it creates or joins a room. The token is
stored in localStorage on that device and sent explicitly with every room poll and move.

This avoids the most common Mac/phone LAN failures:
- localhost vs 192.168.x.x cookie differences;
- auth session replacement;
- stale browser auth;
- room access becoming unauthorized after a second device logs in.

Online v2:
- Create Room
- Join by 6-character ID
- Public Lobby
- Quick Match
- 500ms live polling
- unique per-device player token
- reconnect from the same device
- server-authoritative move validation
- revision protection
- atomic room file writes


## Mobile invite sharing fix

On iPhone over a local HTTP address (`192.168.x.x`), the modern Clipboard API may be unavailable because the page is not a secure HTTPS context.

The room screen now:
- copies Room ID with secure clipboard when available;
- falls back to `document.execCommand("copy")` on local HTTP;
- lets users tap the Room ID itself to copy;
- provides a native iOS/Android `Share` button via Web Share API;
- falls back to copy when Web Share is unavailable;
- shows a visual copied confirmation.
