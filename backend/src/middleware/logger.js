// src/middleware/logger.js
// GOLD CHALLENGE: logs every user action to the database
import prisma from "../db.js";

// Suspicious behavior thresholds
const SUSPICIOUS_THRESHOLDS = {
  DELETE_RESOURCE: { count: 5, windowMs: 60_000, reason: "Too many deletions in 1 minute" },
  CREATE_RESOURCE: { count: 20, windowMs: 60_000, reason: "Too many creations in 1 minute" },
  FAILED_LOGIN:    { count: 5, windowMs: 300_000, reason: "Too many failed login attempts" },
};

// In-memory counter for suspicious behavior detection
const actionCounters = new Map(); // key: `${userId}:${action}` -> [timestamps]

function isRateLimited(userId, action) {
  const threshold = SUSPICIOUS_THRESHOLDS[action];
  if (!threshold) return false;

  const key = `${userId}:${action}`;
  const now = Date.now();
  const timestamps = (actionCounters.get(key) || []).filter(t => now - t < threshold.windowMs);
  timestamps.push(now);
  actionCounters.set(key, timestamps);

  return timestamps.length >= threshold.count;
}

// ── logAction: call this to log an action ─────────────────────────────────────
export async function logAction(req, action, actionInfo = null) {
  const session = req.session;
  const userId  = session?.userId ?? null;
  const groupId = session?.groupId ?? "ANONYMOUS";
  const ip      = req.ip || req.connection?.remoteAddress || "unknown";

  let isSuspicious = false;

  // Check for suspicious behavior
  if (userId && SUSPICIOUS_THRESHOLDS[action]) {
    isSuspicious = isRateLimited(userId, action);

    if (isSuspicious) {
      const reason = SUSPICIOUS_THRESHOLDS[action].reason;
      // Add to suspicious_users table (upsert)
      try {
        await prisma.suspiciousUser.upsert({
          where:  { userId },
          update: { reason, flaggedAt: new Date(), isResolved: false, resolvedAt: null },
          create: {
            userId,
            email:  session?.email ?? "unknown",
            reason,
          },
        });
      } catch (_) { /* ignore if user doesn't exist */ }
    }
  }

  // Write log to DB (fire and forget — don't block request)
  prisma.actionLog.create({
    data: {
      userId,
      groupId,
      action,
      actionInfo: actionInfo ? JSON.stringify(actionInfo) : null,
      ipAddress: ip,
      isSuspicious,
    },
  }).catch(err => console.error("[logger] Failed to write log:", err));
}

// ── Middleware: auto-log based on route ───────────────────────────────────────
export function autoLog(action) {
  return async (req, res, next) => {
    res.on("finish", () => {
      if (res.statusCode < 500) {
        logAction(req, action, {
          method: req.method,
          path:   req.path,
          params: req.params,
          status: res.statusCode,
        });
      }
    });
    next();
  };
}
