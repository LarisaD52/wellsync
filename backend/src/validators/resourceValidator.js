// src/validators/resourceValidator.js
import { body, query, param, validationResult } from "express-validator";

// ── Reusable validation result handler ───────────────────────────────────────
export function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

// ── Resource body validators ──────────────────────────────────────────────────
export const validateResourceBody = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 3, max: 200 }).withMessage("Name must be between 3 and 200 characters"),

  body("unlockCondition")
    .trim()
    .notEmpty().withMessage("Unlock condition is required")
    .isLength({ min: 3, max: 200 }).withMessage("Unlock condition must be between 3 and 200 characters"),

  body("rating")
    .notEmpty().withMessage("Rating is required")
    .isFloat({ min: 0, max: 5 }).withMessage("Rating must be between 0 and 5"),

  body("views")
    .optional()
    .isInt({ min: 0 }).withMessage("Views must be a non-negative integer"),

  body("department")
    .trim()
    .notEmpty().withMessage("Department is required")
    .isIn(["IT", "Sales", "HR", "Management", "Toate"])
    .withMessage("Department must be one of: IT, Sales, HR, Management, Toate"),

  body("type")
    .trim()
    .notEmpty().withMessage("Type is required")
    .isIn(["Video", "Quiz", "Course", "Event"])
    .withMessage("Type must be one of: Video, Quiz, Course, Event"),

  body("dateAdded")
    .optional()
    .isISO8601().withMessage("Date must be a valid ISO date (YYYY-MM-DD)"),

  handleValidation,
];

// ── Pagination validators ─────────────────────────────────────────────────────
export const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 }).withMessage("Page must be a positive integer"),

  query("pageSize")
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage("Page size must be between 1 and 100"),

  query("department")
    .optional()
    .isIn(["IT", "Sales", "HR", "Management", "Toate"])
    .withMessage("Invalid department filter"),

  query("type")
    .optional()
    .isIn(["Video", "Quiz", "Course", "Event"])
    .withMessage("Invalid type filter"),

  query("sortBy")
    .optional()
    .isIn(["name", "rating", "views", "dateAdded"])
    .withMessage("sortBy must be one of: name, rating, views, dateAdded"),

  query("order")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("order must be asc or desc"),

  handleValidation,
];

// ── ID param validator ────────────────────────────────────────────────────────
export const validateId = [
  param("id")
    .isInt({ min: 1 }).withMessage("ID must be a positive integer"),
  handleValidation,
];
