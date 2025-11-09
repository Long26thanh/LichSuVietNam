import express from "express";
import LocationController from "../controllers/LocationController.js";
import { authenticateToken, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Public routes - specific paths MUST come before parameterized routes
router.get("/", LocationController.getAll);
router.get("/:id/name", LocationController.getNameById);
router.get("/:id", LocationController.getById);

// Admin routes
router.post("/", authenticateToken, requireAdmin, LocationController.create);
router.put("/:id", authenticateToken, requireAdmin, LocationController.update);
router.delete("/:id", authenticateToken, requireAdmin, LocationController.delete);

export default router;
