import express from "express";
import PeriodController from "../controllers/PeriodController.js";
import { authenticateToken, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Public routes - specific paths MUST come before parameterized routes
router.get("/", PeriodController.getAll);
router.get("/search", PeriodController.search);
router.get("/:id/name", PeriodController.getNameById);
router.get("/:id", PeriodController.getById);

// Admin routes
router.post("/", authenticateToken, requireAdmin, PeriodController.create);
router.put("/:id", authenticateToken, requireAdmin, PeriodController.update);
router.delete("/:id", authenticateToken, requireAdmin, PeriodController.delete);

export default router;
