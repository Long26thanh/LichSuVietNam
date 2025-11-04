import axios from "axios";
import config from "../config";

const API_URL = "/api/stats";

// Tạo instance axios với cấu hình cơ bản
const apiClient = axios.create({
    baseURL: config.serverUrl + API_URL,
    timeout: 10000,
});

// Interceptor để tự động thêm token vào header
apiClient.interceptors.request.use(
    (config) => {
        let token = null;
        if (localStorage.getItem("session_type") === "admin") {
            token = localStorage.getItem("admin_auth_token");
        } else {
            token = localStorage.getItem("auth_token");
        }
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

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

const statsService = {
    getAdminStats,
    getStatsByDateRange,
};

export default statsService;
