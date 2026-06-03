// src/routes/resourceRoutes.js
import { Router } from "express";
import {
  getResources, getResourceById, createResource,
  updateResource, deleteResource, getStats,
} from "../controllers/resourceController.js";
import {
  validateResourceBody, validatePagination, validateId,
} from "../validators/resourceValidator.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import { autoLog } from "../middleware/logger.js";

const router = Router();

// All resource routes require auth
router.use(requireAuth);

// Statistics (before /:id)
router.get("/stats", requirePermission("VIEW_STATS"), getStats);

// CRUD with permission checks + auto-logging
router.get("/",
  requirePermission("READ_RESOURCES"),
  validatePagination,
  autoLog("READ_RESOURCES"),
  getResources
);

router.get("/:id",
  requirePermission("READ_RESOURCES"),
  validateId,
  autoLog("READ_RESOURCE"),
  getResourceById
);

router.post("/",
  requirePermission("CREATE_RESOURCE"),
  validateResourceBody,
  autoLog("CREATE_RESOURCE"),
  createResource
);

router.put("/:id",
  requirePermission("UPDATE_RESOURCE"),
  validateId,
  validateResourceBody,
  autoLog("UPDATE_RESOURCE"),
  updateResource
);

router.delete("/:id",
  requirePermission("DELETE_RESOURCE"),
  validateId,
  autoLog("DELETE_RESOURCE"),
  deleteResource
);

export default router;
