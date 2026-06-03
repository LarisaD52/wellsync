// src/controllers/authController.js
// Silver Challenge: JWT tokens, all roles, password recovery, OAuth

import { createHash, randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import prisma from "../db.js";
import { sessions, generateSessionId, generateJWT, verifyJWT } from "../middleware/auth.js";
import { logAction } from "../middleware/logger.js";

const JWT_SECRET = process.env.JWT_SECRET || "wellsync-jwt-secret-change-in-prod";

function hashPassword(password) {
  return createHash("sha256").update(password).digest("hex");
}

// ── POST /api/auth/login ──────────────────────────────────────────────────────
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
        department: true,
      },
    });

    if (!user || !user.isActive) {
      await logAction(req, "FAILED_LOGIN", { email, reason: "User not found or inactive" });
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const hash = hashPassword(password);
    if (hash !== user.passwordHash) {
      await logAction(req, "FAILED_LOGIN", { email, reason: "Wrong password" });
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const sessionId = generateSessionId();
    const sessionData = {
      sessionId,
      userId:      user.id,
      email:       user.email,
      fullName:    user.fullName,
      groupId:     user.role.name,   // "ADMIN" | "MANAGER" | "USER"
      department:  user.department?.name ?? null,
      permissions: user.role.permissions.map(rp => rp.permission.name),
      lastActivity: Date.now(),
    };
    sessions.set(sessionId, sessionData);

    // Generate JWT
    const token = generateJWT(sessionData);

    req.session = sessionData;
    await logAction(req, "LOGIN", { email });

    return res.json({
      sessionId,
      token,           // JWT for Silver
      user: {
        id:          user.id,
        email:       user.email,
        fullName:    user.fullName,
        role:        user.role.name,
        department:  user.department?.name ?? null,
        permissions: sessionData.permissions,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
export async function logout(req, res) {
  const sessionId = req.headers["x-session-id"];
  if (sessionId) {
    await logAction(req, "LOGOUT", {});
    sessions.delete(sessionId);
  }
  return res.json({ message: "Logged out successfully" });
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
export async function register(req, res) {
  try {
    const { email, fullName, password, department } = req.body;

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const userRole = await prisma.role.findUnique({ where: { name: "USER" } });
    const dept = department
      ? await prisma.department.findUnique({ where: { name: department } })
      : null;

    const user = await prisma.user.create({
      data: {
        email:        email.toLowerCase(),
        fullName,
        passwordHash: hashPassword(password),
        roleId:       userRole.id,
        departmentId: dept?.id ?? null,
      },
      include: { role: true, department: true },
    });

    await logAction(req, "REGISTER", { email });

    return res.status(201).json({
      id:         user.id,
      email:      user.email,
      fullName:   user.fullName,
      role:       user.role.name,
      department: user.department?.name ?? null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
export async function me(req, res) {
  return res.json(req.session);
}

// ── POST /api/auth/forgot-password ────────────────────────────────────────────
// Generates a reset token and (in prod) sends email; here returns token in response
// for demo purposes (or use nodemailer if SMTP is configured)
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // Always return 200 to avoid email enumeration
    if (!user) {
      return res.json({ message: "If that email exists, a reset link was sent." });
    }

    // Invalidate old tokens
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data:  { used: true },
    });

    // Generate new token (valid 1 hour)
    const rawToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token: rawToken, expiresAt },
    });

    await logAction(req, "PASSWORD_RESET_REQUEST", { email });

    // In production: send email via nodemailer
    // For now: return token in response (demo / lab environment)
    const resetUrl = `${process.env.FRONTEND_URL || "https://localhost:5173"}/reset-password?token=${rawToken}`;

    if (process.env.SMTP_HOST) {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.default.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transporter.sendMail({
        from:    process.env.SMTP_FROM || "noreply@wellsync.com",
        to:      email,
        subject: "WellSync — Password Reset",
        html:    `<p>Click the link below to reset your password (valid 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
      });
      return res.json({ message: "If that email exists, a reset link was sent." });
    }

    // Demo mode: return reset URL directly
    return res.json({
      message:  "Password reset token generated (demo mode — no SMTP configured).",
      resetUrl,
      token:    rawToken, // visible for testing
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ── POST /api/auth/reset-password ─────────────────────────────────────────────
export async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 4) {
      return res.status(400).json({ error: "Token and new password (min 4 chars) required" });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!resetToken || resetToken.used || new Date() > resetToken.expiresAt) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    await prisma.user.update({
      where: { id: resetToken.userId },
      data:  { passwordHash: hashPassword(newPassword) },
    });

    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data:  { used: true },
    });

    // Invalidate all active sessions for this user
    for (const [sid, session] of sessions.entries()) {
      if (session.userId === resetToken.userId) sessions.delete(sid);
    }

    await logAction(req, "PASSWORD_RESET_SUCCESS", { userId: resetToken.userId });
    return res.json({ message: "Password reset successfully. Please login again." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ── GET /api/auth/google ──────────────────────────────────────────────────────
// Initiates Google OAuth flow
export async function googleAuthStart(req, res) {
  const clientId    = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || "https://localhost:3001/api/auth/google/callback";

  if (!clientId) {
    return res.status(501).json({ error: "Google OAuth not configured (set GOOGLE_CLIENT_ID in .env)" });
  }

  const scope  = encodeURIComponent("openid email profile");
  const state  = randomBytes(16).toString("hex");
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}`;

  res.redirect(authUrl);
}

// ── GET /api/auth/google/callback ─────────────────────────────────────────────
export async function googleAuthCallback(req, res) {
  try {
    const { code } = req.query;
    const clientId     = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri  = process.env.GOOGLE_REDIRECT_URI || "https://localhost:3001/api/auth/google/callback";
    const frontendUrl  = process.env.FRONTEND_URL || "https://localhost:5173";

    if (!clientId || !clientSecret) {
      return res.status(501).json({ error: "Google OAuth not configured" });
    }

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.id_token) {
      return res.redirect(`${frontendUrl}/login?error=google_failed`);
    }

    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = await userInfoRes.json();
    const { sub: providerId, email, name: fullName } = googleUser;

    let user;

    // Find or create OAuth account
    let oauthAccount = await prisma.oAuthAccount.findUnique({
      where: { provider_providerId: { provider: "google", providerId } },
    });

    if (oauthAccount) {
      user = await prisma.user.findUnique({
        where: { id: oauthAccount.userId },
        include: { role: { include: { permissions: { include: { permission: true } } } }, department: true },
      });
    } else {
      const userRole = await prisma.role.findUnique({ where: { name: "USER" } });
      const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

      if (existingUser) {
        user = await prisma.user.findUnique({
          where: { id: existingUser.id },
          include: { role: { include: { permissions: { include: { permission: true } } } }, department: true },
        });
      } else {
        user = await prisma.user.create({
          data: { email: email.toLowerCase(), fullName: fullName || email, passwordHash: hashPassword(randomBytes(32).toString("hex")), roleId: userRole.id, isActive: true },
          include: { role: { include: { permissions: { include: { permission: true } } } }, department: true },
        });
      }

      // Create OAuthAccount only if it doesn't exist
      const existingOAuth = await prisma.oAuthAccount.findFirst({
        where: { userId: user.id, provider: "google" }
      });
      if (!existingOAuth) {
        await prisma.oAuthAccount.create({
          data: { userId: user.id, provider: "google", providerId, email: email.toLowerCase() },
        });
      }
    }

    if (!user || !user.isActive) {
      return res.redirect(`${frontendUrl}/login?error=account_inactive`);
    }

    const sessionId = generateSessionId();
    const sessionData = {
      sessionId,
      userId:       user.id,
      email:        user.email,
      fullName:     user.fullName,
      groupId:      user.role.name,
      department:   user.department?.name ?? null,
      permissions:  user.role.permissions.map(rp => rp.permission.name),
      lastActivity: Date.now(),
      authMethod:   "google",
    };
    sessions.set(sessionId, sessionData);
    const token = generateJWT(sessionData);

    await logAction(req, "LOGIN_GOOGLE", { email });

    res.redirect(`${frontendUrl}/oauth-callback?sessionId=${sessionId}&token=${token}&role=${user.role.name}`);
  } catch (err) {
    console.error("[Google OAuth]", err);
    const frontendUrl = process.env.FRONTEND_URL || "https://localhost:5173";
    res.redirect(`${frontendUrl}/login?error=google_failed`);
  }
}

// ── POST /api/auth/refresh ────────────────────────────────────────────────────
// Refresh JWT token using sessionId (session must still be active)
export async function refreshToken(req, res) {
  try {
    const sessionId = req.headers["x-session-id"] || req.body?.sessionId;
    if (!sessionId || !sessions.has(sessionId)) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    const session = sessions.get(sessionId);
    if (Date.now() - session.lastActivity > 15 * 60 * 1000) {
      sessions.delete(sessionId);
      return res.status(401).json({ error: "Session expired due to inactivity" });
    }

    session.lastActivity = Date.now();
    const newToken = generateJWT(session);
    return res.json({ token: newToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}


// ── In-memory OTP store ───────────────────────────────────────────────────────
const otpStore = new Map(); // email -> { otp, expiresAt }

// ── POST /api/auth/otp/generate ──────────────────────────────────────────────
export async function generateOTP(req, res) {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
        department: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Invalid email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minute
    otpStore.set(email.toLowerCase(), { otp, expiresAt, userId: user.id });

    console.log(`\n🔐 OTP pentru ${email}: ${otp}\n`);

    return res.json({ message: "OTP generated. Check server terminal." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ── POST /api/auth/otp/verify ─────────────────────────────────────────────────
export async function verifyOTP(req, res) {
  try {
    const { email, otp } = req.body;
    const record = otpStore.get(email.toLowerCase());

    if (!record) {
      return res.status(401).json({ error: "No OTP generated for this email" });
    }
    if (Date.now() > record.expiresAt) {
      otpStore.delete(email.toLowerCase());
      return res.status(401).json({ error: "OTP expired" });
    }
    if (record.otp !== otp) {
      return res.status(401).json({ error: "Invalid OTP" });
    }

    otpStore.delete(email.toLowerCase());

    const user = await prisma.user.findUnique({
      where: { id: record.userId },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
        department: true,
      },
    });

    const sessionId = generateSessionId();
    const sessionData = {
      sessionId,
      userId:      user.id,
      email:       user.email,
      fullName:    user.fullName,
      groupId:     user.role.name,
      department:  user.department?.name ?? null,
      permissions: user.role.permissions.map(rp => rp.permission.name),
      lastActivity: Date.now(),
      authMethod:  "otp",
    };
    sessions.set(sessionId, sessionData);
    const token = generateJWT(sessionData);

    return res.json({
      sessionId,
      token,
      user: {
        id:          user.id,
        email:       user.email,
        fullName:    user.fullName,
        role:        user.role.name,
        permissions: sessionData.permissions,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}