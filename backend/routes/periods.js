import express from "express";
import PeriodController from "../controllers/PeriodController.js";

const router = express.Router();

router.get("/", PeriodController.getAllPeriods);
router.get("/search", PeriodController.search);
router.get("/:id/name", PeriodController.getPeriodNameById);
router.get("/:id", PeriodController.getPeriodById);

export default router;
