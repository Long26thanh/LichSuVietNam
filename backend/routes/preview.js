import express from "express";
import { requireAdmin } from "../middlewares/auth.js";
import PeriodController from "../controllers/PeriodController.js";
import LocationController from "../controllers/LocationController.js";
import FigureController from "../controllers/FigureController.js";
import EventController from "../controllers/EventController.js";
import ArticleController from "../controllers/ArticleController.js";

const router = express.Router();

router.get("/periods/:id", requireAdmin, PeriodController.getById);
router.get("/locations/:id", requireAdmin, LocationController.getById);
router.get("/figures/:id", requireAdmin, FigureController.getById);
router.get("/events/:id", requireAdmin, EventController.getById);
router.get("/articles/:id", requireAdmin, ArticleController.getById);

export default router;
