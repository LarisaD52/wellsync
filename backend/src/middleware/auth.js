// src/middleware/auth.js
// Silver Challenge: JWT tokens + role-based permissions + inactivity sessions

import { createHash, randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import prisma from "../db.js";

const SESSION_TTL_MS  = 1* 60 * 1000;           
const JWT_SECRET      = process.env.JWT_SECRET || "wellsync-jwt-secret-change-in-prod";
const JWT_EXPIRES_IN  = "2h";

export const sessions = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (now - session.lastActivity > SESSION_TTL_MS) {
      console.log(`[auth] Session expired for ${session.email}`);
      sessions.delete(id);
    }
  }
}, 60_000);

export function generateSessionId() {
  return createHash("sha256").update(randomBytes(32).toString("hex") + Date.now()).digest("hex");
}

export function generateJWT(sessionData) {
  return jwt.sign(
    {
      sessionId:   sessionData.sessionId,
      userId:      sessionData.userId,
      email:       sessionData.email,
      role:        sessionData.groupId,
      permissions: sessionData.permissions,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyJWT(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function requireAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const payload = verifyJWT(token);
    if (!payload) {
      return res.status(401).json({ error: "Invalid or expired JWT token" });
    }
    // JWT is valid — also check session store for inactivity
    const session = sessions.get(payload.sessionId);
    if (session) {
      if (Date.now() - session.lastActivity > SESSION_TTL_MS) {
        sessions.delete(payload.sessionId);
        return res.status(401).json({ error: "Session expired due to inactivity" });
      }
      session.lastActivity = Date.now();
      req.session = session;
    } else {
      // JWT valid but no session (e.g. server restart) — use JWT payload
      req.session = {
        userId:      payload.userId,
        email:       payload.email,
        groupId:     payload.role,
        permissions: payload.permissions || [],
        lastActivity: Date.now(),
      };
    }
    return next();
  }

  // 2. Fall back to x-session-id header
  const sessionId = req.headers["x-session-id"];
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ error: "Unauthorized — please login" });
  }

  const session = sessions.get(sessionId);
  if (Date.now() - session.lastActivity > SESSION_TTL_MS) {
    sessions.delete(sessionId);
    return res.status(401).json({ error: "Session expired due to inactivity" });
  }

  session.lastActivity = Date.now();
  req.session = session;
  next();
}

// ── requireAdmin: only ADMIN role ─────────────────────────────────────────────
export function requireAdmin(req, res, next) {
  if (!req.session || req.session.groupId !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden — admin access required" });
  }
  next();
}

export function requireManager(req, res, next) {
  if (!req.session || !["ADMIN", "MANAGER"].includes(req.session.groupId)) {
    return res.status(403).json({ error: "Forbidden — manager access required" });
  }
  next();
}

export function requirePermission(permissionName) {
  return async (req, res, next) => {
    if (!req.session) return res.status(401).json({ error: "Unauthorized" });

    // Fast path: check permissions array cached in session
    if (req.session.permissions && req.session.permissions.includes(permissionName)) {
      return next();
    }

    // Slow path: check DB (for edge cases)
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });
    const hasPermission = user?.role?.permissions?.some(
      rp => rp.permission.name === permissionName
    );
    if (!hasPermission) {
      return res.status(403).json({ error: `Forbidden — requires permission: ${permissionName}` });
    }
    next();
  };
}
