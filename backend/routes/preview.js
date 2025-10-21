import express from "express";
import { requireAdmin } from "../middlewares/auth.js";
import PeriodController from "../controllers/PeriodController.js";

const router = express.Router();

router.get("/periods/:id", requireAdmin, PeriodController.getPeriodById);

export default router;
