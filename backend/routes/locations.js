import express from "express";
import LocationController from "../controllers/LocationController.js";

const router = express.Router();

router.get("/", LocationController.getAllLocations);
router.get("/:id", LocationController.getLocationById);
router.get("/:id/name", LocationController.getLocationNameById);

export default router;
