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

// Lấy thống kê Dashboard chi tiết theo ngày/tháng/năm
router.get(
    "/dashboard",
    authenticateToken,
    requireAdmin,
    StatsController.getDashboardStats
);

// Lấy thống kê theo tháng trong năm
router.get(
    "/monthly",
    authenticateToken,
    requireAdmin,
    StatsController.getMonthlyStats
);

// Lấy thống kê theo ngày trong tháng
router.get(
    "/daily",
    authenticateToken,
    requireAdmin,
    StatsController.getDailyStats
);

// Lấy danh sách chi tiết các bài viết/nội dung theo tháng
router.get(
    "/monthly-details",
    authenticateToken,
    requireAdmin,
    StatsController.getMonthlyDetailedContent
);

export default router;
