const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
  pingInterval: 25000,
  pingTimeout: 20000
});

const rooms = new Map();
const PORT = process.env.PORT || 3000;
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeCode() {
  let code;
  do {
    code = Array.from({length: 5}, () => CODE_CHARS[crypto.randomInt(CODE_CHARS.length)]).join("");
  } while (rooms.has(code));
  return code;
}
function roomInfo(room) {
  return { code: room.code, count: room.players.size,
    players: Object.fromEntries([...room.players.entries()].map(([id,p]) => [id,p])) };
}
function leaveRoom(socket) {
  const code = socket.data.room;
  if (!code) return;
  const room = rooms.get(code);
  if (room) {
    room.players.delete(socket.id);
    socket.leave(code);
    io.to(code).emit("player-left", {id: socket.id});
    if (room.players.size === 0) rooms.delete(code);
    else io.to(code).emit("room-update", roomInfo(room));
  }
  socket.data.room = null;
}

app.use(express.static("public"));
app.get("/health", (_req,res) => res.json({ok:true, service:"LEZ Online Server"}));

io.on("connection", socket => {
  socket.on("create-room", ({name} = {}) => {
    leaveRoom(socket);
    const code = makeCode();
    const room = {code, players:new Map(), started:false};
    room.players.set(socket.id, {name:String(name || "Jugador").slice(0,20)});
    rooms.set(code, room);
    socket.join(code);
    socket.data.room = code;
    socket.emit("room-created", roomInfo(room));
  });

  socket.on("join-room", ({code,name} = {}) => {
    const normalized = String(code || "").toUpperCase().trim();
    const room = rooms.get(normalized);
    if (!room) return socket.emit("room-error", {message:"No existe esa sala."});
    if (room.players.size >= 2) return socket.emit("room-error", {message:"La sala está llena."});
    if (room.started) return socket.emit("room-error", {message:"La partida ya comenzó."});
    leaveRoom(socket);
    room.players.set(socket.id, {name:String(name || "Jugador").slice(0,20)});
    socket.join(normalized);
    socket.data.room = normalized;
    socket.emit("room-joined", roomInfo(room));
    io.to(normalized).emit("room-update", roomInfo(room));
  });

  socket.on("player-state", ({code,player} = {}) => {
    const room = rooms.get(String(code || ""));
    if (!room || socket.data.room !== room.code || !room.players.has(socket.id)) return;
    if (!player || !Number.isFinite(player.x) || !Number.isFinite(player.y)) return;
    const safe = {
      x: Math.max(0,Math.min(10000,player.x)),
      y: Math.max(0,Math.min(10000,player.y)),
      hp: Math.max(0,Math.min(100,Number(player.hp)||0)),
      color: "#5eead4",
      name: String(player.name || "Jugador").slice(0,20)
    };
    room.players.set(socket.id, safe);
    socket.to(room.code).emit("player-state", {id:socket.id, player:safe});
  });

  socket.on("start-game", ({code} = {}) => {
    const room = rooms.get(String(code || ""));
    if (!room || socket.data.room !== room.code) return;
    if (room.players.size < 2) return socket.emit("room-error", {message:"Espera a que entre otro jugador."});
    room.started = true;
    io.to(room.code).emit("game-started");
  });

  socket.on("leave-room", () => leaveRoom(socket));
  socket.on("disconnect", () => leaveRoom(socket));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`LEZ Online listo en el puerto ${PORT}`);
});
