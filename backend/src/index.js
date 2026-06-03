// src/index.js
import express from "express";
import cors from "cors";
import { createServer as createHttpServer } from "http";
import { createServer as createHttpsServer } from "https";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Server as SocketServer } from "socket.io";
import mongoose from "mongoose";
import { sessions } from "./middleware/auth.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import logsRoutes from "./routes/logsRoutes.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app  = express();
const PORT = process.env.PORT || 3001;

// ── HTTPS setup (self-signed cert) ───────────────────────────────────────────
const CERT_DIR  = join(__dirname, "../certs");
const KEY_FILE  = join(CERT_DIR, "server.key");
const CERT_FILE = join(CERT_DIR, "server.crt");

let server;
let protocol = "http";

if (existsSync(KEY_FILE) && existsSync(CERT_FILE)) {
  try {
    const credentials = {
      key:  readFileSync(KEY_FILE),
      cert: readFileSync(CERT_FILE),
    };
    server = createHttpsServer(credentials, app);
    protocol = "https";
    console.log("🔒 HTTPS enabled (self-signed certificate)");
  } catch (err) {
    console.warn("⚠️  Could not load TLS certs, falling back to HTTP:", err.message);
    server = createHttpServer(app);
  }
} else {
  console.warn("⚠️  No certs found at ./certs/ — running on HTTP.");
  console.warn("   Run: npm run gen:certs  to generate a self-signed certificate.");
  server = createHttpServer(app);
}

// ── MongoDB / Chat ────────────────────────────────────────────────────────────
const ChatMessage = mongoose.model("ChatMessage", new mongoose.Schema({
  userId:    { type: Number, default: null },
  userName:  { type: String, default: "Anonymous" },
  role:      { type: String, default: "USER" },
  text:      { type: String, required: true },
  type:      { type: String, default: "message" },
  timestamp: { type: Date, default: Date.now },
}));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB conectat (NoSQL chat)"))
  .catch(err => console.error("❌ MongoDB eroare:", err.message));

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-session-id"],
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), protocol });
});

app.use("/api/auth",      authRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/logs",      logsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = new SocketServer(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", async (socket) => {
  const sessionId     = socket.handshake.auth?.sessionId;
  const session       = sessions.get(sessionId);
  const handshakeName = socket.handshake.auth?.userName;
  const userName      = session?.fullName ?? session?.email ?? handshakeName ?? "Anonymous";
  const groupId       = session?.groupId ?? socket.handshake.auth?.role ?? "USER";

  console.log(`[chat] ${userName} connected`);

  try {
    const history = await ChatMessage.find()
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();
    socket.emit("chat:history", history.reverse().map(m => ({
      type:      m.type,
      userId:    m.userId,
      userName:  m.userName,
      role:      m.role,
      text:      m.text,
      timestamp: m.timestamp,
    })));
  } catch (err) {
    console.error("[chat] MongoDB read error:", err.message);
  }

  socket.broadcast.emit("chat:message", {
    type: "system", text: `${userName} joined the chat`,
    timestamp: new Date().toISOString(),
  });

  socket.on("chat:send", async (text) => {
    if (!text || typeof text !== "string" || !text.trim()) return;
    const message = {
      type:      "message",
      userId:    session?.userId ?? null,
      userName,
      role:      groupId,
      text:      text.trim().slice(0, 500),
      timestamp: new Date().toISOString(),
    };
    try {
      await ChatMessage.create(message);
    } catch (err) {
      console.error("[chat] MongoDB write error:", err.message);
    }
    io.emit("chat:message", message);
  });

  socket.on("disconnect", () => {
    console.log(`[chat] ${userName} disconnected`);
    socket.broadcast.emit("chat:message", {
      type: "system", text: `${userName} left the chat`,
      timestamp: new Date().toISOString(),
    });
  });
});

// ── Start ──────────────────────────────────────────────────────────────────────
server.listen(PORT, "0.0.0.0", () => {
  console.log(`\n✅ WellSync API running on ${protocol}://0.0.0.0:${PORT}`);
  console.log(`   Health:    ${protocol}://localhost:${PORT}/api/health`);
  console.log(`   Auth:      ${protocol}://localhost:${PORT}/api/auth/login`);
  console.log(`   Resources: ${protocol}://localhost:${PORT}/api/resources`);
  console.log(`   Logs:      ${protocol}://localhost:${PORT}/api/logs`);
  console.log(`   Chat:      ws://localhost:${PORT} (Socket.io + MongoDB)\n`);
});

export { app, server };
