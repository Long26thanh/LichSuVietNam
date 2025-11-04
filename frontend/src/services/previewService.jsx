import axios from "axios";
import config from "../config";
const API_URL = "/api/preview";

const apiClient = axios.create({
    baseURL: config.serverUrl + API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

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
