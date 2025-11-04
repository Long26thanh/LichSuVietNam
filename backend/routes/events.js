import express from "express";
import EventController from "../controllers/EventController.js";
import { authenticateToken, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Admin routes
router.post("/", authenticateToken, requireAdmin, EventController.create);
router.put("/:id", authenticateToken, requireAdmin, EventController.update);
router.delete("/:id", authenticateToken, requireAdmin, EventController.delete);

// Public routes
router.get("/", EventController.getAll);
router.get("/:id", EventController.getById);

export default router;
