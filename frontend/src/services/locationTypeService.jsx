import axios from "axios";
import config from "../config";

const API_URL = "/api/location-types";

const apiClient = axios.create({
    baseURL: config.serverUrl + API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

class LocationTypeService {
    async getAllTypes() {
        const response = await apiClient.get("/");
        return response.data;
    }

    async createType(data) {
        const response = await apiClient.post("/", data);
        return response.data;
    }

    async updateType(id, data) {
        try {
            const response = await apiClient.put(`/${id}`, data);
            return response.data;
        } catch (error) {
            console.error(
                "Error updating location type:",
                error.response || error
            );
            throw error;
        }
    }

    async deleteType(id) {
        const response = await apiClient.delete(`/${id}`);
        return response.data;
    }
}

export default new LocationTypeService();
