import axios from "axios";
import config from "../config";

const API_URL = "/api/figures";
const apiClient = axios.create({
    baseURL: config.serverUrl + API_URL,
    timeout: 10000,
});

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
}
export default new FigureService();
