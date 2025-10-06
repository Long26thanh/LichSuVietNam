import axios from "axios";
import config from "../config";

const API_URL = "/api/locations";

const apiClient = axios.create({
    baseURL: config.serverUrl + API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});
class LocationService {
    // Lấy danh sách địa danh với phân trang, tìm kiếm, lọc loại
    async getAllLocations({
        page = 1,
        limit = 12,
        search = "",
        type = "",
        signal,
    } = {}) {
        const params = {};
        if (page) params.page = page;
        if (limit) params.limit = limit;
        if (search) params.search = search;
        if (type && type !== "all") params.type = type;

        const response = await apiClient.get("/", { params, signal });
        return response.data;
    }

    async getLocationById(id) {
        const response = await apiClient.get(`/${id}`);
        console.log(response.data);
        return response.data;
    }

    async getLocationNameById(id) {
        const response = await apiClient.get(`/${id}/name`);
        return response.data;
    }
}

export default new LocationService();
