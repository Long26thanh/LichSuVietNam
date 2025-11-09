import { createApiClient } from "./apiClient";

const API_URL = "/api/stats";

// Tạo instance axios với cấu hình cơ bản
const apiClient = createApiClient(API_URL);

// Lấy thống kê tổng quan cho admin
export const getAdminStats = async () => {
    try {
        const response = await apiClient.get("/admin");
        return response.data;
    } catch (error) {
        console.error("Error getting admin stats:", error);
        throw error;
    }
};

// Lấy thống kê theo khoảng thời gian
export const getStatsByDateRange = async (startDate, endDate, type) => {
    try {
        const response = await apiClient.get("/date-range", {
            params: {
                startDate,
                endDate,
                type,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error getting stats by date range:", error);
        throw error;
    }
};

// Lấy thống kê Dashboard chi tiết theo ngày/tháng/năm
export const getDashboardStats = async (period = "month", startDate = null, endDate = null) => {
    try {
        const params = { period };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await apiClient.get("/dashboard", { params });
        return response.data;
    } catch (error) {
        console.error("Error getting dashboard stats:", error);
        throw error;
    }
};

// Lấy thống kê theo tháng trong năm
export const getMonthlyStats = async (year = new Date().getFullYear()) => {
    try {
        const response = await apiClient.get("/monthly", {
            params: { year },
        });
        return response.data;
    } catch (error) {
        console.error("Error getting monthly stats:", error);
        throw error;
    }
};

// Lấy thống kê theo ngày trong tháng
export const getDailyStats = async (year, month) => {
    try {
        const response = await apiClient.get("/daily", {
            params: { year, month },
        });
        return response.data;
    } catch (error) {
        console.error("Error getting daily stats:", error);
        throw error;
    }
};

// Lấy danh sách chi tiết các bài viết/nội dung theo tháng
export const getMonthlyDetailedContent = async (year, month, type = 'all') => {
    try {
        const response = await apiClient.get("/monthly-details", {
            params: { year, month, type },
        });
        return response.data;
    } catch (error) {
        console.error("Error getting monthly detailed content:", error);
        throw error;
    }
};

const statsService = {
    getAdminStats,
    getStatsByDateRange,
    getDashboardStats,
    getMonthlyStats,
    getDailyStats,
    getMonthlyDetailedContent,
};

export default statsService;
