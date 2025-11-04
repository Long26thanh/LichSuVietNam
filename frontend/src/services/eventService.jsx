import axios from "axios";
import config from "../config";

const API_URL = "/api/events";

const apiClient = axios.create({
    baseURL: config.serverUrl + API_URL,
    timeout: 10000,
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

    async createEvent(eventData) {
        const response = await apiClient.post("/", eventData);
        return response.data;
    }

    async updateEvent(id, eventData) {
        const response = await apiClient.put(`/${id}`, eventData);
        return response.data;
    }

    async deleteEvent(id) {
        const response = await apiClient.delete(`/${id}`);
        return response.data;
    }
}

export default new EventService();
