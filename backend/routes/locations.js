import express from "express";
import LocationController from "../controllers/LocationController.js";
import { authenticateToken, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Admin routes
router.post("/", authenticateToken, requireAdmin, LocationController.create);
router.put("/:id", authenticateToken, requireAdmin, LocationController.update);
router.delete("/:id", authenticateToken, requireAdmin, LocationController.delete);

// Public routes
router.get("/", LocationController.getAll);
router.get("/:id", LocationController.getById);
router.get("/:id/name", LocationController.getNameById);

export default router;
