// src/controllers/logsController.js
// GOLD CHALLENGE: view action logs and suspicious users
import prisma from "../db.js";

// ── GET /api/logs ─────────────────────────────────────────────────────────────
export async function getLogs(req, res) {
  try {
    const page     = parseInt(req.query.page)     || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const userId   = req.query.userId ? parseInt(req.query.userId) : undefined;
    const action   = req.query.action;
    const suspicious = req.query.suspicious === "true" ? true : undefined;

    const where = {};
    if (userId)     where.userId       = userId;
    if (action)     where.action       = action;
    if (suspicious !== undefined) where.isSuspicious = suspicious;

    const [total, logs] = await Promise.all([
      prisma.actionLog.count({ where }),
      prisma.actionLog.findMany({
        where,
        include: { user: { select: { email: true, fullName: true } } },
        orderBy: { timestamp: "desc" },
        skip:  (page - 1) * pageSize,
        take:  pageSize,
      }),
    ]);

    return res.json({
      data: logs.map(l => ({
        id:          l.id,
        userId:      l.userId,
        userEmail:   l.user?.email ?? null,
        userFullName: l.user?.fullName ?? null,
        groupId:     l.groupId,
        action:      l.action,
        actionInfo:  l.actionInfo ? JSON.parse(l.actionInfo) : null,
        ipAddress:   l.ipAddress,
        isSuspicious: l.isSuspicious,
        timestamp:   l.timestamp,
      })),
      pagination: {
        page, pageSize, total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ── GET /api/logs/suspicious ──────────────────────────────────────────────────
export async function getSuspiciousUsers(req, res) {
  try {
    const users = await prisma.suspiciousUser.findMany({
      where: { isResolved: false },
      orderBy: { flaggedAt: "desc" },
    });
    return res.json({ data: users, total: users.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ── PUT /api/logs/suspicious/:userId/resolve ──────────────────────────────────
export async function resolveSuspiciousUser(req, res) {
  try {
    const userId = parseInt(req.params.userId);
    const updated = await prisma.suspiciousUser.update({
      where:  { userId },
      data:   { isResolved: true, resolvedAt: new Date() },
    });
    return res.json(updated);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Suspicious user not found" });
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
