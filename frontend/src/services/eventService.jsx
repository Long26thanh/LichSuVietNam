import axios from "axios";
import config from "../config";

const API_URL = "/api/events";

const apiClient = axios.create({
    baseURL: config.serverUrl + API_URL,
    timeout: 10000,
});

class EventService {
    async getAllEvents({ page = 1, limit = 12, search = "", signal } = {}) {
        const params = {};
        if (page) params.page = page;
        if (limit) params.limit = limit;
        if (search) params.search = search;
        const response = await apiClient.get("/", { params, signal });
        return response.data;
    }

    async getEventById(id) {
        const response = await apiClient.get(`/${id}`);
        return response.data;
    }
}

export default new EventService();


