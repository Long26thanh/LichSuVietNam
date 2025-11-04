import express from "express";
import ArticleController from "../controllers/ArticleController.js";
import { authenticateToken, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Admin routes
router.get("/", authenticateToken, requireAdmin, ArticleController.getAll);
router.get("/:id", authenticateToken, requireAdmin, ArticleController.getById);

// User routes
router.post("/", authenticateToken, ArticleController.create);
router.put("/:id", authenticateToken, ArticleController.update);
router.delete("/:id", authenticateToken, ArticleController.delete);
router.get("/my-articles", authenticateToken, ArticleController.getByAuthor);

// Public routes
router.get("/published", ArticleController.getPublished);
router.get("/published/:id", ArticleController.getPublishedById);

export default router;
