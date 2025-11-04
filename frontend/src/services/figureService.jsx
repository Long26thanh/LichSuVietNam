import axios from "axios";
import config from "../config";

const API_URL = "/api/figures";
const apiClient = axios.create({
    baseURL: config.serverUrl + API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

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

class FigureService {
    async getAllFigures({ page = 1, limit = 12, search = "", signal } = {}) {
        try {
            const response = await apiClient.get("/", {
                params: { page, limit, search },
                signal,
            });
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách nhân vật", error);
            throw error;
        }
    }

    async getFigureById(id) {
        try {
            const response = await apiClient.get(`/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết nhân vật", error);
            throw error;
        }
    }

    async createFigure(figureData) {
        try {
            const response = await apiClient.post("/", figureData);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo nhân vật", error);
            throw error;
        }
    }

    async updateFigure(id, figureData) {
        try {
            const response = await apiClient.put(`/${id}`, figureData);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật nhân vật", error);
            throw error;
        }
    }

    async deleteFigure(id) {
        try {
            const response = await apiClient.delete(`/${id}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi xóa nhân vật", error);
            throw error;
        }
    }
}
export default new FigureService();
