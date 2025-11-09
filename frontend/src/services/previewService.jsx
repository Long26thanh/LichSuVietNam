import { createApiClient } from "./apiClient";

const API_URL = "/api/preview";

const apiClient = createApiClient(API_URL);

class PreviewService {
    async previewPeriod(id) {
        const response = await apiClient.get(`/periods/${id}`);
        return response.data;
    }

    async previewLocation(id) {
        const response = await apiClient.get(`/locations/${id}`);
        return response.data;
    }

    async previewFigure(id) {
        const response = await apiClient.get(`/figures/${id}`);
        return response.data;
    }
}

export default new PreviewService();
