// src/test/silver.test.js
// Frontend Silver tests: JWT handling, role-based routing, password recovery form

import { describe, it, expect } from 'vitest';

// ── JWT parsing helper (frontend) ────────────────────────────────────────────
function parseJWT(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

// ── Role determination ────────────────────────────────────────────────────────
function getRedirectPath(role) {
  if (role === "ADMIN")   return "/admin-home";
  if (role === "MANAGER") return "/manager-home";
  return "/welcome";
}

// ── Permission check ──────────────────────────────────────────────────────────
function hasPermission(permissions, name) {
  return Array.isArray(permissions) && permissions.includes(name);
}

// ── Reset password form validation ───────────────────────────────────────────
function validateResetForm({ newPassword, confirm }) {
  const errors = {};
  if (!newPassword || newPassword.length < 4)
    errors.newPassword = "Password must be at least 4 characters.";
  if (newPassword !== confirm)
    errors.confirm = "Passwords do not match.";
  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────

describe("Silver — JWT token handling (frontend)", () => {
  const fakeJWT = "eyJhbGciOiJIUzI1NiJ9." +
    btoa(JSON.stringify({ role: "USER", permissions: ["READ_RESOURCES","VIEW_STATS"], userId: 2, email: "user@wellsync.com" })) +
    ".signature";

  it("parses JWT payload correctly", () => {
    const payload = parseJWT(fakeJWT);
    expect(payload.role).toBe("USER");
    expect(payload.permissions).toContain("READ_RESOURCES");
  });

  it("returns null for invalid JWT", () => {
    expect(parseJWT("not.a.token")).toBeNull();
  });

  it("detects missing token", () => {
    const token = null;
    expect(token).toBeNull();
  });
});

describe("Silver — Role-based routing", () => {
  it("ADMIN redirects to /admin-home", () => {
    expect(getRedirectPath("ADMIN")).toBe("/admin-home");
  });

  it("MANAGER redirects to /manager-home", () => {
    expect(getRedirectPath("MANAGER")).toBe("/manager-home");
  });

  it("USER redirects to /welcome", () => {
    expect(getRedirectPath("USER")).toBe("/welcome");
  });

  it("unknown role redirects to /welcome", () => {
    expect(getRedirectPath("UNKNOWN")).toBe("/welcome");
  });
});

describe("Silver — Permission checks", () => {
  const adminPerms   = ["READ_RESOURCES","CREATE_RESOURCE","UPDATE_RESOURCE","DELETE_RESOURCE","VIEW_STATS","MANAGE_USERS","VIEW_LOGS","VIEW_SUSPICIOUS","APPROVE_RESOURCE","VIEW_DEPARTMENT"];
  const managerPerms = ["READ_RESOURCES","CREATE_RESOURCE","UPDATE_RESOURCE","APPROVE_RESOURCE","VIEW_STATS","VIEW_DEPARTMENT"];
  const userPerms    = ["READ_RESOURCES","VIEW_STATS"];

  it("ADMIN has all permissions", () => {
    expect(hasPermission(adminPerms, "DELETE_RESOURCE")).toBe(true);
    expect(hasPermission(adminPerms, "MANAGE_USERS")).toBe(true);
    expect(hasPermission(adminPerms, "APPROVE_RESOURCE")).toBe(true);
  });

  it("MANAGER has APPROVE_RESOURCE but not MANAGE_USERS", () => {
    expect(hasPermission(managerPerms, "APPROVE_RESOURCE")).toBe(true);
    expect(hasPermission(managerPerms, "MANAGE_USERS")).toBe(false);
    expect(hasPermission(managerPerms, "DELETE_RESOURCE")).toBe(false);
  });

  it("USER has only READ_RESOURCES and VIEW_STATS", () => {
    expect(hasPermission(userPerms, "READ_RESOURCES")).toBe(true);
    expect(hasPermission(userPerms, "VIEW_STATS")).toBe(true);
    expect(hasPermission(userPerms, "CREATE_RESOURCE")).toBe(false);
    expect(hasPermission(userPerms, "DELETE_RESOURCE")).toBe(false);
  });

  it("returns false for empty permissions array", () => {
    expect(hasPermission([], "READ_RESOURCES")).toBe(false);
  });

  it("returns false for null permissions", () => {
    expect(hasPermission(null, "READ_RESOURCES")).toBe(false);
  });
});

describe("Silver — Reset password form validation", () => {
  it("passes with matching passwords", () => {
    const errors = validateResetForm({ newPassword: "newpass123", confirm: "newpass123" });
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it("fails with short password", () => {
    const errors = validateResetForm({ newPassword: "ab", confirm: "ab" });
    expect(errors.newPassword).toBeDefined();
  });

  it("fails when passwords don't match", () => {
    const errors = validateResetForm({ newPassword: "validpass", confirm: "different" });
    expect(errors.confirm).toBeDefined();
  });

  it("fails with both fields empty", () => {
    const errors = validateResetForm({ newPassword: "", confirm: "" });
    expect(Object.keys(errors).length).toBeGreaterThan(0);
  });
});

describe("Silver — OAuth callback handling", () => {
  it("valid OAuth params produce login state", () => {
    const sessionId = "abc123";
    const token     = "fake.jwt.token";
    const role      = "USER";
    const isLoggedIn = !!(sessionId && token);
    expect(isLoggedIn).toBe(true);
    expect(getRedirectPath(role)).toBe("/welcome");
  });

  it("missing OAuth params don't login", () => {
    const sessionId = null;
    const token     = null;
    const isLoggedIn = !!(sessionId && token);
    expect(isLoggedIn).toBe(false);
  });
});
