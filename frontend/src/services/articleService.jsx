import axios from "axios";
import config from "../config";

const API_URL = "/api/articles";
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

class ArticleService {
    async getAllArticles({
        page = 1,
        limit = 12,
        search = "",
        status = "",
        signal,
    } = {}) {
        const params = {};
        if (page) params.page = page;
        if (limit) params.limit = limit;
        if (search) params.search = search;
        if (status) params.status = status;
        const response = await apiClient.get("/", { params, signal });
        return response.data;
    }
    async getArticleById(id) {
        const response = await apiClient.get(`/${id}`);
        return response.data;
    }
    async createArticle(articleData) {
        const response = await apiClient.post("/", articleData);
        return response.data;
    }

    async updateArticle(id, articleData) {
        const response = await apiClient.put(`/${id}`, articleData);
        return response.data;
    }

    async deleteArticle(id) {
        const response = await apiClient.delete(`/${id}`);
        return response.data;
    }

    async getPublishedArticles({
        page = 1,
        limit = 12,
        search = "",
        signal,
    } = {}) {
        const params = {};
        if (page) params.page = page;
        if (limit) params.limit = limit;
        if (search) params.search = search;
        const response = await apiClient.get("/published", { params, signal });
        return response.data;
    }

    async getPublishedArticleById(id) {
        const response = await apiClient.get(`/published/${id}`);
        return response.data;
    }

    async getUserArticles({
        page = 1,
        limit = 10,
        search = "",
        status = "",
        signal,
    } = {}) {
        const params = {};
        if (page) params.page = page;
        if (limit) params.limit = limit;
        if (search) params.search = search;
        if (status) params.status = status;
        const response = await apiClient.get("/my-articles", {
            params,
            signal,
        });
        return response.data;
    }
}

export default new ArticleService();
