import express from "express";
import FigureController from "../controllers/FigureController.js";

const router = express.Router();
router.get("/", FigureController.getAllFigures);
router.get("/:id", FigureController.getFigureById);

export default router;
