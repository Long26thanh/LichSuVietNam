import express from "express";
import PeriodController from "../controllers/PeriodController.js";

const router = express.Router();

router.get("/", PeriodController.getAllPeriods);
router.post("/", PeriodController.createPeriod);
router.put("/:id", PeriodController.updatePeriod);
router.get("/search", PeriodController.search);
router.get("/:id/name", PeriodController.getPeriodNameById);
router.get("/:id", PeriodController.getPeriodById);
router.delete("/:id", PeriodController.deletePeriod);

export default router;
