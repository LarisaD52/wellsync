// src/test/silver.test.js
import request from "supertest";
import { app, server } from "../index.js";
import { sessions, verifyJWT } from "../middleware/auth.js";
import prisma from "../db.js";

const EMAIL_USER    = "user@wellsync.com";
const EMAIL_MANAGER = "manager@wellsync.com";
const EMAIL_ADMIN   = "admin@wellsync.com";
const PASS_USER     = "user123";
const PASS_MANAGER  = "manager123";
const PASS_ADMIN    = "admin123";

describe("Silver — JWT tokens per role", () => {
  let userToken, managerToken, adminToken;
  let userSessionId, managerSessionId, adminSessionId;

  beforeAll(async () => {
    const [uRes, mRes, aRes] = await Promise.all([
      request(app).post("/api/auth/login").send({ email: EMAIL_USER,    password: PASS_USER }),
      request(app).post("/api/auth/login").send({ email: EMAIL_MANAGER, password: PASS_MANAGER }),
      request(app).post("/api/auth/login").send({ email: EMAIL_ADMIN,   password: PASS_ADMIN }),
    ]);
    userToken        = uRes.body.token;
    managerToken     = mRes.body.token;
    adminToken       = aRes.body.token;
    userSessionId    = uRes.body.sessionId;
    managerSessionId = mRes.body.sessionId;
    adminSessionId   = aRes.body.sessionId;
  });

  describe("JWT structure", () => {
    it("login returns a JWT token for USER", () => {
      expect(typeof userToken).toBe("string");
      expect(userToken.split(".").length).toBe(3);
    });

    it("USER JWT payload contains correct role and permissions", () => {
      const payload = verifyJWT(userToken);
      expect(payload.role).toBe("USER");
      expect(payload.permissions).toContain("READ_RESOURCES");
      expect(payload.permissions).not.toContain("DELETE_RESOURCE");
    });

    it("MANAGER JWT contains manager-specific permissions", () => {
      const payload = verifyJWT(managerToken);
      expect(payload.role).toBe("MANAGER");
      expect(payload.permissions).toContain("APPROVE_RESOURCE");
      expect(payload.permissions).toContain("CREATE_RESOURCE");
      expect(payload.permissions).not.toContain("MANAGE_USERS");
    });

    it("ADMIN JWT contains all permissions", () => {
      const payload = verifyJWT(adminToken);
      expect(payload.role).toBe("ADMIN");
      expect(payload.permissions).toContain("MANAGE_USERS");
      expect(payload.permissions).toContain("DELETE_RESOURCE");
      expect(payload.permissions).toContain("VIEW_LOGS");
    });
  });

  describe("Bearer token authentication", () => {
    it("accepts Bearer JWT on /api/auth/me", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
    });

    it("rejects invalid Bearer token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer this.is.fake");
      expect(res.statusCode).toBe(401);
    });

    it("accepts x-session-id as fallback", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("x-session-id", userSessionId);
      expect(res.statusCode).toBe(200);
    });
  });

  describe("Role-based permission enforcement", () => {
    it("USER can read resources", async () => {
      const res = await request(app)
        .get("/api/resources")
        .set("x-session-id", userSessionId);
      expect(res.statusCode).toBe(200);
    });

    it("USER cannot delete resources", async () => {
      const res = await request(app)
        .delete("/api/resources/1")
        .set("x-session-id", userSessionId);
      expect(res.statusCode).toBe(403);
    });

    it("USER cannot access admin logs", async () => {
      const res = await request(app)
        .get("/api/logs")
        .set("x-session-id", userSessionId);
      expect(res.statusCode).toBe(403);
    });

    it("MANAGER can create resources (auth passes)", async () => {
      const res = await request(app)
        .post("/api/resources")
        .set("x-session-id", managerSessionId)
        .send({ name: "Test", department: "IT", type: "Video", unlockCondition: "Test", rating: 4.0, views: 0, dateAdded: "2026-01-01" });
      expect([201, 400, 422]).toContain(res.statusCode);
      expect(res.statusCode).not.toBe(403);
    });

    it("MANAGER cannot access admin logs", async () => {
      const res = await request(app)
        .get("/api/logs")
        .set("x-session-id", managerSessionId);
      expect(res.statusCode).toBe(403);
    });

    it("ADMIN can access logs", async () => {
      const res = await request(app)
        .get("/api/logs")
        .set("x-session-id", adminSessionId);
      expect(res.statusCode).toBe(200);
    });
  });

  describe("Token refresh", () => {
    it("can refresh JWT using sessionId", async () => {
      const res = await request(app)
        .post("/api/auth/refresh")
        .set("x-session-id", userSessionId);
      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
      const payload = verifyJWT(res.body.token);
      expect(payload.role).toBe("USER");
    });
  });

  afterAll(async () => {
    [userSessionId, managerSessionId, adminSessionId].forEach(sid => sessions.delete(sid));
    server.close();
  });
});

describe("Silver — Password recovery", () => {
  const testEmail = `reset_${Date.now()}@wellsync.com`;
  let resetToken;

  beforeAll(async () => {
    await request(app).post("/api/auth/register")
      .send({ email: testEmail, fullName: "Reset Test", password: "oldpass" });
  });

  it("forgot-password returns 200 for existing email", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: testEmail });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBeDefined();
    if (res.body.token) resetToken = res.body.token;
  });

  it("forgot-password returns 200 for non-existent email (no enumeration)", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "nobody_xyz@nowhere.com" });
    expect(res.statusCode).toBe(200);
  });

  it("reset-password changes the password with valid token", async () => {
    if (!resetToken) return;
    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ token: resetToken, newPassword: "newpass123" });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/reset/i);
  });

  it("can login with new password after reset", async () => {
    if (!resetToken) return;
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testEmail, password: "newpass123" });
    expect(res.statusCode).toBe(200);
  });

  it("reset-password rejects invalid token", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ token: "fake-token-xyz", newPassword: "newpass" });
    expect(res.statusCode).toBe(400);
  });

  it("reset-password rejects used token", async () => {
    if (!resetToken) return;
    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ token: resetToken, newPassword: "anotherpass" });
    expect(res.statusCode).toBe(400);
  });

  afterAll(async () => {
    const user = await prisma.user.findUnique({ where: { email: testEmail } });
    if (user) {
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { email: testEmail } });
    }
    await prisma.$disconnect();
    server.close();
  });
});
