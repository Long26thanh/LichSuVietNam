import express from "express";
import UserController from "../controllers/UserController.js";
import { authenticateToken, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Admin routes
router.post("/", authenticateToken, requireAdmin, UserController.create);
router.get("/", authenticateToken, requireAdmin, UserController.getAll);
router.get( "/username/:username", authenticateToken, requireAdmin, UserController.getUserByUsername);
router.get("/email/:email", authenticateToken, requireAdmin, UserController.getUserByEmail);
router.put("/:id", authenticateToken, requireAdmin, UserController.update);
router.delete("/:id", authenticateToken, requireAdmin, UserController.delete);

// User routes
router.get("/me", authenticateToken, UserController.getProfile);
router.put("/me", authenticateToken, UserController.update);
router.get("/me/stats", authenticateToken, UserController.getUserStats);

// Public routes
router.get("/:id", UserController.getUserById);

export default router;
