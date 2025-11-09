import { createApiClient } from "./apiClient";

const API_URL = "/api/periods";

const apiClient = createApiClient(API_URL);

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

    // Tạo thời kỳ mới
    async createPeriod(periodData) {
        const response = await apiClient.post("/", periodData);
        return response.data;
    }

    // Cập nhật thời kỳ
    async updatePeriod(id, periodData) {
        const response = await apiClient.put(`/${id}`, periodData);
        return response.data;
    }

    // Xóa thời kỳ
    async deletePeriod(id) {
        const response = await apiClient.delete(`/${id}`);
        return response.data;
    }
}

export default new PeriodService();
