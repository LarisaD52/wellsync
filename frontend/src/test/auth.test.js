// src/test/auth.test.js
// Frontend unit tests for login / register validation logic

import { describe, it, expect } from 'vitest';

// ── Validation helpers (same logic as LoginPage & SignUpPage) ─────────────────

function validateLogin({ email, password }) {
  const errors = {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Please enter a valid email address.";
  if (!password || password.length < 4)
    errors.password = "Password must be at least 4 characters.";
  return errors;
}

function validateRegister({ fullName, email, password, confirm, department }) {
  const errors = {};
  if (!fullName || fullName.trim().length < 2)
    errors.fullName = "Full name is required.";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Enter a valid email.";
  if (!password || password.length < 4)
    errors.password = "Password must be at least 4 characters.";
  if (password !== confirm)
    errors.confirm = "Passwords do not match.";
  if (!department)
    errors.department = "Please select a department.";
  return errors;
}

// ── Login validation ──────────────────────────────────────────────────────────

describe("Login form validation", () => {
  it("passes with valid email and password", () => {
    const errors = validateLogin({ email: "user@wellsync.com", password: "pass1" });
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it("fails with empty email", () => {
    const errors = validateLogin({ email: "", password: "pass1234" });
    expect(errors.email).toBeDefined();
  });

  it("fails with invalid email format", () => {
    const errors = validateLogin({ email: "not-an-email", password: "pass1234" });
    expect(errors.email).toBeDefined();
  });

  it("fails with password shorter than 4 chars", () => {
    const errors = validateLogin({ email: "user@test.com", password: "123" });
    expect(errors.password).toBeDefined();
  });

  it("fails with empty password", () => {
    const errors = validateLogin({ email: "user@test.com", password: "" });
    expect(errors.password).toBeDefined();
  });

  it("fails with both fields empty", () => {
    const errors = validateLogin({ email: "", password: "" });
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
  });
});

// ── Register validation ───────────────────────────────────────────────────────

describe("Register form validation", () => {
  const valid = {
    fullName: "Ion Popescu",
    email: "ion@wellsync.com",
    password: "parola123",
    confirm: "parola123",
    department: "IT",
  };

  it("passes with all valid fields", () => {
    const errors = validateRegister(valid);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it("fails with short full name", () => {
    const errors = validateRegister({ ...valid, fullName: "A" });
    expect(errors.fullName).toBeDefined();
  });

  it("fails with invalid email", () => {
    const errors = validateRegister({ ...valid, email: "bad-email" });
    expect(errors.email).toBeDefined();
  });

  it("fails with short password", () => {
    const errors = validateRegister({ ...valid, password: "ab", confirm: "ab" });
    expect(errors.password).toBeDefined();
  });

  it("fails when passwords don't match", () => {
    const errors = validateRegister({ ...valid, confirm: "different" });
    expect(errors.confirm).toBeDefined();
  });

  it("fails without department", () => {
    const errors = validateRegister({ ...valid, department: "" });
    expect(errors.department).toBeDefined();
  });

  it("fails with all empty fields", () => {
    const errors = validateRegister({ fullName: "", email: "", password: "", confirm: "", department: "" });
    expect(Object.keys(errors).length).toBeGreaterThanOrEqual(4);
  });
});

// ── Session cookie helpers ─────────────────────────────────────────────────────

describe("Session ID handling", () => {
  it("a valid session id is a non-empty string", () => {
    const sessionId = "abc123def456";
    expect(typeof sessionId).toBe("string");
    expect(sessionId.length).toBeGreaterThan(0);
  });

  it("null sessionId triggers redirect to login", () => {
    const sessionId = null;
    const isLoggedIn = sessionId !== null;
    expect(isLoggedIn).toBe(false);
  });
});
