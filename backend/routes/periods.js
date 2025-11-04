import express from "express";
import PeriodController from "../controllers/PeriodController.js";
import { authenticateToken, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Admin routes
router.post("/", authenticateToken, requireAdmin, PeriodController.create);
router.put("/:id", authenticateToken, requireAdmin, PeriodController.update);
router.delete("/:id", authenticateToken, requireAdmin, PeriodController.delete);

// Public routes
router.get("/", PeriodController.getAll);
router.get("/:id", PeriodController.getById);
router.get("/search", PeriodController.search);
router.get("/:id/name", PeriodController.getNameById);

export default router;
