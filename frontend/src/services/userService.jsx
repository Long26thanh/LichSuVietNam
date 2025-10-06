import axios from "axios";
import config from "../config";

const API_URL = "/api/users";

const apiClient = axios.create({
    baseURL: config.serverUrl + API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add interceptor to include auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("auth_token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

class UserService {
    /**
     * Get current user profile
     * GET /api/users/me
     */
    async getCurrentUser() {
        try {
            const localUser = JSON.parse(localStorage.getItem("user"));

            try {
                const response = await apiClient.get("/me");

                if (response.data.success) {
                    // Cập nhật localStorage nếu dữ liệu từ server khác với local
                    const serverUser = response.data.data;
                    if (
                        JSON.stringify(localUser) !== JSON.stringify(serverUser)
                    ) {
                        localStorage.setItem(
                            "user",
                            JSON.stringify(serverUser)
                        );
                    }
                    return {
                        success: true,
                        user: serverUser,
                    };
                }
                return {
                    success: false,
                    message:
                        response.data.message ||
                        "Không thể lấy thông tin người dùng",
                };
            } catch (error) {
                console.error(
                    "Error fetching current user from server:",
                    error
                );
                // Nếu có dữ liệu local, trả về dữ liệu đó trong trường hợp lỗi
                if (localUser) {
                    return {
                        success: true,
                        user: localUser,
                        isOfflineData: true,
                    };
                }
                throw error;
            }
        } catch (error) {
            console.error("Error in getCurrentUser:", error);
            return {
                success: false,
                message: "Có lỗi xảy ra khi lấy thông tin người dùng",
                error: error.message,
            };
        }
    }

    /**
     * Update current user profile
     * PUT /api/users/me
     */
    async updateCurrentUser(userData) {
        try {
            const response = await apiClient.put("/me", userData);
            return response.data;
        } catch (error) {
            console.error("Error updating user profile:", error);
            throw error;
        }
    }

    /**
     * Upload user avatar
     * POST /api/users/me/avatar
     */
    async uploadAvatar(file) {
        try {
            const formData = new FormData();
            formData.append("avatar", file);

            const response = await apiClient.post("/me/avatar", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error uploading avatar:", error);
            throw error;
        }
    }

    /**
     * Get user statistics
     * GET /api/users/me/stats
     */
    async getUserStats() {
        try {
            const response = await apiClient.get("/me/stats");
            return response.data;
        } catch (error) {
            console.error("Error fetching user stats:", error);
            // Return default stats if API fails
            return {
                success: true,
                data: {
                    saved_posts: 0,
                    favorite_events: 0,
                    favorite_figures: 0,
                    visited_locations: 0,
                },
            };
        }
    }

    /**
     * Change user password
     * PUT /api/users/me/password
     */
    async changePassword(passwordData) {
        try {
            const response = await apiClient.put("/me/password", passwordData);
            return response.data;
        } catch (error) {
            console.error("Error changing password:", error);
            throw error;
        }
    }

    // =========================
    // Admin user management APIs
    // =========================
    async listUsers({ page = 1, limit = 10, q = '', role = '', status = '' } = {}) {
        try {
            const response = await apiClient.get('/', {
                params: { page, limit, q, role, status }
            });
            return response.data;
        } catch (error) {
            console.error('Error listing users:', error);
            return { success: false, message: 'Không thể tải danh sách người dùng' };
        }
    }

    async getUserById(userId) {
        try {
            const response = await apiClient.get(`/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user by id:', error);
            return { success: false, message: 'Không thể tải thông tin người dùng' };
        }
    }

    async createUser(data) {
        try {
            const response = await apiClient.post('/', data);
            return response.data;
        } catch (error) {
            console.error('Error creating user:', error);
            return { success: false, message: 'Không thể tạo người dùng' };
        }
    }

    async updateUser(userId, data) {
        try {
            const response = await apiClient.put(`/${userId}`, data);
            return response.data;
        } catch (error) {
            console.error('Error updating user:', error);
            return { success: false, message: 'Không thể cập nhật người dùng' };
        }
    }

    async deleteUser(userId) {
        try {
            const response = await apiClient.delete(`/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting user:', error);
            return { success: false, message: 'Không thể xóa người dùng' };
        }
    }

    async updateUserStatus(userId, status) {
        try {
            const response = await apiClient.patch(`/${userId}/status`, { status });
            return response.data;
        } catch (error) {
            console.error('Error updating user status:', error);
            return { success: false, message: 'Không thể cập nhật trạng thái' };
        }
    }

    async updateUserRole(userId, role) {
        try {
            const response = await apiClient.patch(`/${userId}/role`, { role });
            return response.data;
        } catch (error) {
            console.error('Error updating user role:', error);
            return { success: false, message: 'Không thể cập nhật vai trò' };
        }
    }
}

export default new UserService();
