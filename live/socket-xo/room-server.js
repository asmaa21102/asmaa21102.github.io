// Browser version of live-apps/socket-xo/server.py: the same referee (rooms of two, turns,
// move checks, scores, rematches, emoji) running in a SharedWorker, so every tab of the site
// on this device talks to one "server". Each tab connects through a MessagePort (ws-shim.js).
const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const MAX_ROOMS = 500;
const EMOJI = new Set(["👋", "👏", "😄", "😮", "🔥", "🤝"]);

function winner(board) {
  for (const [a, b, c] of LINES) if (board[a] && board[a] === board[b] && board[a] === board[c]) return [board[a], [a, b, c]];
  if (board.every(Boolean)) return ["draw", []];
  return [null, []];
}

class Room {
  constructor(code) {
    this.code = code;
    this.players = {}; // symbol -> { conn, name }
    this.scores = { X: 0, O: 0, draw: 0 };
    this.starter = "X";
    this.reset();
  }
  reset() {
    this.board = Array(9).fill("");
    this.turn = this.starter;
    this.result = null;
    this.line = [];
    this.rematch = new Set();
  }
  state(symbol) {
    return {
      type: "state", room: this.code, you: symbol, board: this.board, turn: this.turn, result: this.result, line: this.line,
      scores: this.scores, players: Object.fromEntries(Object.entries(this.players).map(([s, p]) => [s, p.name])), rematch: [...this.rematch].sort(),
    };
  }
  broadcast(event = null) {
    for (const [symbol, p] of Object.entries(this.players)) p.conn.send({ ...this.state(symbol), ...(event ? { event } : {}) });
  }
}

const rooms = new Map();
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O / I, like the server
function newCode() {
  for (;;) {
    const code = Array.from(crypto.getRandomValues(new Uint8Array(5)), (b) => ALPHABET[b % ALPHABET.length]).join("");
    if (!rooms.has(code)) return code;
  }
}
const cleanName = (value, fallback) => String(value ?? "").split(/\s+/).filter(Boolean).join(" ").slice(0, 20) || fallback;

// One connection = one tab's socket.
class Conn {
  constructor(port, id) {
    this.port = port;
    this.id = id;
    this.room = null;
    this.symbol = null;
    this.seen = Date.now();
  }
  send(msg) {
    this.port.postMessage({ id: this.id, kind: "message", data: JSON.stringify(msg) });
  }
  receive(raw) {
    if (raw.length > 2000) return;
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }
    const kind = msg.type;
    if (kind === "join" && !this.room) {
      let code = String(msg.room || "").toUpperCase().slice(0, 8);
      if (code && !rooms.has(code)) return this.send({ type: "error", code: "no_room" });
      if (!code) {
        if (rooms.size >= MAX_ROOMS) return this.send({ type: "error", code: "busy" });
        code = newCode();
        rooms.set(code, new Room(code));
      }
      const r = rooms.get(code);
      const free = ["X", "O"].filter((s) => !(s in r.players));
      if (!free.length) return this.send({ type: "error", code: "full" });
      this.room = r;
      this.symbol = free[0];
      r.players[this.symbol] = { conn: this, name: cleanName(msg.name, `Oyuncu ${this.symbol}`) };
      r.broadcast("joined");
    } else if (kind === "move" && this.room) {
      const room = this.room, i = msg.cell;
      // The referee: right turn, both players present, empty cell, game not over.
      if (Number.isInteger(i) && i >= 0 && i < 9 && room.result === null && room.turn === this.symbol && Object.keys(room.players).length === 2 && !room.board[i]) {
        room.board[i] = this.symbol;
        [room.result, room.line] = winner(room.board);
        if (room.result) room.scores[room.result] += 1;
        else room.turn = this.symbol === "X" ? "O" : "X";
        room.broadcast("move");
      }
    } else if (kind === "rematch" && this.room && this.room.result) {
      const room = this.room;
      room.rematch.add(this.symbol);
      if (room.rematch.size === 2 && Object.keys(room.players).length === 2) {
        room.starter = room.starter === "X" ? "O" : "X"; // players take turns starting
        room.reset();
        room.broadcast("rematch");
      } else room.broadcast();
    } else if (kind === "emoji" && this.room && EMOJI.has(msg.emoji)) {
      for (const [s, p] of Object.entries(this.room.players)) if (s !== this.symbol) p.conn.send({ type: "emoji", emoji: msg.emoji });
    }
  }
  close() {
    const room = this.room;
    if (room && room.players[this.symbol]?.conn === this) {
      delete room.players[this.symbol];
      if (Object.keys(room.players).length) {
        room.reset();
        room.scores = { X: 0, O: 0, draw: 0 };
        room.broadcast("left");
      } else rooms.delete(room.code);
    }
    this.room = null;
  }
}

const conns = new Map(); // "port#id" -> Conn
function attach(port) {
  const key = (id) => `${port.__n}#${id}`;
  port.onmessage = (e) => {
    const { id, kind, data } = e.data;
    if (kind === "open") {
      const c = new Conn(port, id);
      conns.set(key(id), c);
      port.postMessage({ id, kind: "open" });
    } else if (kind === "send") conns.get(key(id))?.receive(String(data));
    else if (kind === "close") { conns.get(key(id))?.close(); conns.delete(key(id)); }
    else if (kind === "ping") for (const c of conns.values()) if (c.port === port) c.seen = Date.now();
  };
  port.start?.();
}

// A tab that closes without saying goodbye stops pinging; its seats are freed.
setInterval(() => {
  const now = Date.now();
  for (const [k, c] of conns) if (now - c.seen > 12000) { c.close(); conns.delete(k); }
}, 3000);

let n = 0;
if (typeof SharedWorkerGlobalScope !== "undefined" && self instanceof SharedWorkerGlobalScope) {
  self.onconnect = (e) => { const port = e.ports[0]; port.__n = ++n; attach(port); };
} else {
  // Fallback (no SharedWorker): a dedicated worker, so only this tab plays.
  self.__n = ++n;
  attach(self);
}
