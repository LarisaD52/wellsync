// src/routes/authRoutes.js
import { Router } from "express";
import { body } from "express-validator";
import {
  login, logout, register, me,
  forgotPassword, resetPassword,
  googleAuthStart, googleAuthCallback,
  refreshToken,
  generateOTP, verifyOTP,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { handleValidation } from "../validators/resourceValidator.js";

const router = Router();

// ── Standard auth ─────────────────────────────────────────────────────────────
router.post("/login",
  body("email").isEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password required"),
  handleValidation,
  login
);

router.post("/logout", logout);

router.post("/register",
  body("email").isEmail().withMessage("Valid email required"),
  body("fullName").trim().notEmpty().isLength({ min: 2 }).withMessage("Full name required (min 2 chars)"),
  body("password").isLength({ min: 4 }).withMessage("Password must be at least 4 characters"),
  body("department").optional().isIn(["IT", "Sales", "HR", "Management", "Toate"]),
  handleValidation,
  register
);

router.get("/me", requireAuth, me);
router.post("/refresh", refreshToken);

// ── Password recovery ─────────────────────────────────────────────────────────
router.post("/forgot-password",
  body("email").isEmail().withMessage("Valid email required"),
  handleValidation,
  forgotPassword
);

router.post("/reset-password",
  body("token").notEmpty().withMessage("Token required"),
  body("newPassword").isLength({ min: 4 }).withMessage("Password must be at least 4 characters"),
  handleValidation,
  resetPassword
);

// ── Google OAuth ──────────────────────────────────────────────────────────────
router.get("/google",          googleAuthStart);
router.get("/google/callback", googleAuthCallback);

// ── OTP authentication ────────────────────────────────────────────────────────
router.post("/otp/generate",
  body("email").isEmail().withMessage("Valid email required"),
  handleValidation,
  generateOTP
);

router.post("/otp/verify",
  body("email").isEmail().withMessage("Valid email required"),
  body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
  handleValidation,
  verifyOTP
);

export default router;