import express from "express";
import ViewController from "../controllers/ViewController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

// Ghi nhận lượt xem (có thể gọi với hoặc không có authentication)
router.post("/record", ViewController.recordView);

// Lấy thống kê lượt xem theo thời gian (phải đặt trước route động)
router.get("/:loaiTrang/:id/stats", ViewController.getViewStats);

// Lấy số lượt xem cho nhiều items cùng lúc
router.post("/:loaiTrang/multiple", ViewController.getMultipleViewCounts);

// Lấy số lượt xem cho một item hoặc toàn bộ loại trang
router.get("/:loaiTrang/:id", ViewController.getViewCount);
router.get("/:loaiTrang", ViewController.getViewCount);

export default router;
