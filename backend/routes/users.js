import express from "express";
import UserController from "../controllers/UserController.js";
import { authenticateToken } from "../middlewares/auth.js";
import { requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", authenticateToken, requireAdmin, UserController.getAllUsers);
router.get("/me", authenticateToken, UserController.getProfile);
router.put("/me", authenticateToken, UserController.update);
router.get("/me/stats", authenticateToken, UserController.getUserStats);
router.get("/:id", authenticateToken, requireAdmin, UserController.getUserById);
router.put("/:id", authenticateToken, requireAdmin, UserController.update);
router.delete("/:id", authenticateToken, requireAdmin, UserController.delete);
router.get(
    "/username/:username",
    authenticateToken,
    requireAdmin,
    UserController.getUserByUsername
);
router.get(
    "/email/:email",
    authenticateToken,
    requireAdmin,
    UserController.getUserByEmail
);
router.post("/create", authenticateToken, requireAdmin, UserController.create);

export default router;
