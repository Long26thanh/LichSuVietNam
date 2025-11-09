import axios from "axios";
import config from "../config";

/**
 * Shared Axios Instance với auto token refresh
 * Tất cả services nên dùng instance này thay vì tạo riêng
 */

let authServiceInstance = null;

// Hàm để set AuthService instance (được gọi từ authService.jsx)
export const setAuthServiceInstance = (instance) => {
    authServiceInstance = instance;
};

// Tạo shared axios instance
export const createApiClient = (baseURL) => {
    const client = axios.create({
        baseURL: config.serverUrl + baseURL,
        timeout: 30000, // Tăng timeout lên 30s cho request lớn
        withCredentials: true,
        headers: {
            "Content-Type": "application/json",
        },
    });

    // Request interceptor - thêm token và check refresh
    client.interceptors.request.use(
        async (requestConfig) => {
            // Bỏ qua nếu có flag _skipAuthRefresh
            if (requestConfig._skipAuthRefresh) {
                return requestConfig;
            }

            // Nếu có authService instance, check và refresh token
            if (authServiceInstance) {
                try {
                    // Check và refresh token nếu cần
                    await authServiceInstance.checkAndRefreshToken();
                    
                    // Lấy token mới nhất từ authService (đảm bảo đồng bộ)
                    const token = authServiceInstance.getToken();
                    
                    // Thêm token vào header
                    if (token) {
                        requestConfig.headers["Authorization"] = `Bearer ${token}`;
                    }
                } catch (error) {
                    console.error("Token check failed in request interceptor:", error);
                    // Nếu check/refresh thất bại, vẫn thử lấy token hiện tại
                    const token = authServiceInstance.getToken();
                    if (token) {
                        requestConfig.headers["Authorization"] = `Bearer ${token}`;
                    }
                }
            } else {
                // Fallback: Lấy token từ localStorage nếu chưa có authService
                const sessionType = localStorage.getItem("session_type") || "user";
                const token = sessionType === "admin"
                    ? localStorage.getItem("admin_auth_token")
                    : localStorage.getItem("auth_token");
                
                if (token) {
                    requestConfig.headers["Authorization"] = `Bearer ${token}`;
                }
            }

            return requestConfig;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor - xử lý lỗi 401 và retry
    client.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            // Bỏ qua refresh token nếu có flag _skipAuthRefresh
            if (originalRequest._skipAuthRefresh) {
                return Promise.reject(error);
            }

            // Xử lý lỗi 401 - Unauthorized
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                console.log('Got 401, attempting token refresh...');

                // Nếu có authService, thử refresh token
                if (authServiceInstance) {
                    try {
                        // Refresh token
                        await authServiceInstance.refreshToken();
                        
                        console.log('Token refreshed, retrying request...');

                        // Lấy token mới từ authService (đảm bảo đồng bộ)
                        const newToken = authServiceInstance.getToken();

                        // Retry request với token mới
                        if (newToken) {
                            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                            return client(originalRequest);
                        }
                    } catch (refreshError) {
                        console.error("Token refresh failed on 401:", refreshError);
                        
                        // Nếu refresh thất bại, logout
                        if (authServiceInstance.handleTokenExpiration) {
                            authServiceInstance.handleTokenExpiration();
                        }
                        
                        return Promise.reject(refreshError);
                    }
                } else {
                    console.warn('AuthService instance not available for token refresh');
                }
            }

            return Promise.reject(error);
        }
    );

    return client;
};

// Export convenience function
export const getToken = () => {
    const sessionType = localStorage.getItem("session_type") || "user";
    return sessionType === "admin"
        ? localStorage.getItem("admin_auth_token")
        : localStorage.getItem("auth_token");
};
