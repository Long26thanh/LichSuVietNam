import axios from "axios";
import config from "../config";

const API_URL = "/api/comments";
const apiClient = axios.create({
    baseURL: config.serverUrl + API_URL,
    timeout: 10000,
});

// Interceptor để thêm token vào header
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

const commentService = {
    // Lấy danh sách bình luận
    getComments: async (
        pageType,
        pageId,
        page = 1,
        limit = 10,
        parentId = null
    ) => {
        try {
            const params = {
                pageType,
                pageId,
                page,
                limit,
            };

            if (parentId) {
                params.parentId = parentId;
            }

            const response = await apiClient.get("", { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Lấy các replies của một bình luận
    getReplies: async (commentId) => {
        try {
            const response = await apiClient.get(`/${commentId}/replies`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Tạo bình luận mới
    createComment: async (commentData) => {
        try {
            const response = await apiClient.post("", commentData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Cập nhật bình luận
    updateComment: async (commentId, content) => {
        try {
            const response = await apiClient.put(`/${commentId}`, {
                content,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Xóa bình luận
    deleteComment: async (commentId) => {
        try {
            const response = await apiClient.delete(`/${commentId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Đếm số lượng bình luận
    countComments: async (pageType, pageId) => {
        try {
            const response = await apiClient.get("/count", {
                params: { pageType, pageId },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};

export default commentService;
