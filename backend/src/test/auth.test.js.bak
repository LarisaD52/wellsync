// src/test/auth.test.js
import request from "supertest";
import { app, server } from "../index.js";
import { sessions } from "../middleware/auth.js";
import prisma from "../db.js";

describe("Auth API", () => {
  let testSessionId = null;
  const testEmail   = `test_${Date.now()}@wellsync.com`;
  const testPass    = "test1234";

  describe("POST /api/auth/register", () => {
    it("registers a new user successfully", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: testEmail, fullName: "Test User", password: testPass, department: "IT" });
      expect(res.statusCode).toBe(201);
      expect(res.body.email).toBe(testEmail);
      expect(res.body.role).toBe("USER");
    });

    it("rejects duplicate email", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: testEmail, fullName: "Test User", password: testPass });
      expect(res.statusCode).toBe(409);
    });

    it("rejects missing email", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ fullName: "No Email", password: "pass1234" });
      expect(res.statusCode).toBe(400);
    });

    it("rejects short password", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: `short_${Date.now()}@test.com`, fullName: "Short", password: "12" });
      expect(res.statusCode).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("logs in with valid credentials and returns sessionId", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: testEmail, password: testPass });
      expect(res.statusCode).toBe(200);
      expect(res.body.sessionId).toBeDefined();
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(testEmail);
      expect(res.body.user.role).toBe("USER");
      testSessionId = res.body.sessionId;
    });

    it("stores the session in memory with lastActivity", () => {
      expect(sessions.has(testSessionId)).toBe(true);
      const session = sessions.get(testSessionId);
      expect(session.email).toBe(testEmail);
      expect(session.lastActivity).toBeDefined();
    });

    it("rejects wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: testEmail, password: "wrongpassword" });
      expect(res.statusCode).toBe(401);
    });

    it("rejects non-existent email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nobody@wellsync.com", password: "anything" });
      expect(res.statusCode).toBe(401);
    });

    it("rejects invalid email format", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "not-an-email", password: "pass1234" });
      expect(res.statusCode).toBe(400);
    });
  });

  describe("GET /api/auth/me", () => {
    it("returns session info for authenticated user", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("x-session-id", testSessionId);
      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe(testEmail);
    });

    it("returns 401 without session header", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.statusCode).toBe(401);
    });

    it("returns 401 with invalid session id", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("x-session-id", "totally-fake-session-id");
      expect(res.statusCode).toBe(401);
    });
  });

  describe("Session inactivity timeout", () => {
    it("expires a session with old lastActivity timestamp", async () => {
      const session = sessions.get(testSessionId);
      if (session) {
        session.lastActivity = Date.now() - 20 * 60 * 1000;
        sessions.set(testSessionId, session);
      }
      const res = await request(app)
        .get("/api/auth/me")
        .set("x-session-id", testSessionId);
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toMatch(/expired/i);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("logs out and removes session from memory", async () => {
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: testEmail, password: testPass });
      const sid = loginRes.body.sessionId;
      expect(sessions.has(sid)).toBe(true);

      const res = await request(app)
        .post("/api/auth/logout")
        .set("x-session-id", sid);
      expect(res.statusCode).toBe(200);
      expect(sessions.has(sid)).toBe(false);
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { contains: "test_" } } });
    await prisma.$disconnect();
    server.close();
  });
});
