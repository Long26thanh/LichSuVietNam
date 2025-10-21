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
    async getPeriodById(id) {
        const response = await apiClient.get(`/periods/${id}`);
        return response.data;
    }
}

export default new PreviewService();
