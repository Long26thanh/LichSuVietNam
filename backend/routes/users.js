import express from "express";
import UserController from "../controllers/UserController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", authenticateToken, UserController.getAllUsers);
router.get("/me", authenticateToken, UserController.getProfile);
router.put("/me", authenticateToken, UserController.updateProfile);
router.get("/me/stats", authenticateToken, UserController.getUserStats);

export default router;
