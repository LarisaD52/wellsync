// src/routes/logsRoutes.js
import { Router } from "express";
import { getLogs, getSuspiciousUsers, resolveSuspiciousUser } from "../controllers/logsController.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// All logs routes require admin
router.use(requireAuth, requireAdmin);

router.get("/",                              getLogs);
router.get("/suspicious",                   getSuspiciousUsers);
router.put("/suspicious/:userId/resolve",   resolveSuspiciousUser);

export default router;
