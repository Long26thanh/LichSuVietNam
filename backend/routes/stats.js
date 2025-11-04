import express from "express";
import StatsController from "../controllers/StatsController.js";
import { authenticateToken, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Lấy thống kê tổng quan cho admin dashboard
// Chỉ admin và sa mới được truy cập
router.get(
    "/admin",
    authenticateToken,
    requireAdmin,
    StatsController.getAdminStats
);

// Lấy thống kê theo khoảng thời gian
router.get(
    "/date-range",
    authenticateToken,
    requireAdmin,
    StatsController.getStatsByDateRange
);

export default router;
