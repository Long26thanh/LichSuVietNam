import axios from "axios";
import config from "../config";

const API_URL = "/api/periods";

const apiClient = axios.create({
    baseURL: config.serverUrl + API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

class PeriodService {
    // Lấy tất cả các thời kỳ
    async getAllPeriods() {
        const response = await apiClient.get("/");
        return response.data;
    }
    // Lấy thông tin chi tiết một thời kỳ theo ID
    async getPeriodById(id) {
        const response = await apiClient.get(`/${id}`);
        return response.data;
    }
    // Lấy tên thời kỳ theo ID
    async getPeriodNameById(id) {
        const response = await apiClient.get(`/${id}/name`);
        return response.data;
    }
    // Tìm kiếm thời kỳ
    async searchPeriods(queryParams) {
        const response = await apiClient.get("/search", {
            params: queryParams,
        });
        return response.data;
    }
}

export default new PeriodService();
