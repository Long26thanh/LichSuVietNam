import express from "express";
import LocationTypeController from "../controllers/LocationTypeController.js";

const router = express.Router();

router.get("/", LocationTypeController.getAllLocationTypes);
router.post("/", LocationTypeController.createLocationType);
router.put("/:id", LocationTypeController.updateLocationType);
router.delete("/:id", LocationTypeController.deleteLocationType);

export default router;
