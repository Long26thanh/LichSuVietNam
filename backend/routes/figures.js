import express from "express";
import FigureController from "../controllers/FigureController.js";
import { authenticateToken, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Admin routes
router.post("/", authenticateToken, requireAdmin, FigureController.create);
router.put("/:id", authenticateToken, requireAdmin, FigureController.update);
router.delete("/:id", authenticateToken, requireAdmin, FigureController.delete);

// Public routes
router.get("/", FigureController.getAll);
router.get("/:id", FigureController.getById);

export default router;