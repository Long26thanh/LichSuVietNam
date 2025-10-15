import axios from "axios";
import config from "../config";

const API_URL = "/api/auth";
const USER_API_URL = "/api/users";

// Tạo instance axios với cấu hình cơ bản
const apiClient = axios.create({
    baseURL: config.serverUrl + API_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        authorization: localStorage.getItem("auth_token")
            ? `Bearer ${localStorage.getItem("auth_token")}`
            : "",
    },
});

// Tạo instance axios cho user API
const userApiClient = axios.create({
    baseURL: config.serverUrl + USER_API_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        authorization: localStorage.getItem("auth_token")
            ? `Bearer ${localStorage.getItem("auth_token")}`
            : "",
    },
});

const testApiConnectivity = async () => {
    try {
        const response = await axios.get(config.serverUrl, {
            timeout: 5000,
        });
        return response.status === 200;
    } catch (error) {
        console.error("Kết nối API thất bại:", error);
        return false;
    }
};

class AuthService {
    constructor() {
        // Session cho user thường (đọc cả key mới và cũ để backward compatible)
        this.userToken = localStorage.getItem("auth_token") || null;
        this.userRefreshToken = localStorage.getItem("refresh_token") || null;
        this.userUser =
            JSON.parse(localStorage.getItem("user") || "null") || null;

        // Session cho admin
        this.adminToken = localStorage.getItem("admin_auth_token") || null;
        this.adminRefreshToken =
            localStorage.getItem("admin_refresh_token") || null;
        this.adminUser = JSON.parse(localStorage.getItem("admin_user")) || null;

        // Session hiện tại
        this.currentSessionType =
            localStorage.getItem("session_type") || "user";

        // Con trỏ tiện dụng trỏ tới session hiện tại để interceptor sử dụng
        const current = this.getCurrentSession();
        this.token = current.token || null;
        this.refreshToken = current.refreshToken || null;
        this.user = current.user || null;
        this.tokenRefreshPromise = null;
        this.validationInProgress = false;
        this.lastValidationTime = null;
        this.validationCacheDuration = 30000;
        this.tokenExpiresAt = null;
        this.lastActivityRefreshTime = 0;

        this.setupInterceptors();
        this.initializeActivityRefresh();
    }

    // Lưu thông tin đăng nhập
    saveAuthInfo(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem("auth_token", token);
        localStorage.setItem("user", JSON.stringify(user));
    }

    // Xóa thông tin đăng nhập
    clearAuthInfo() {
        this.token = null;
        this.user = null;
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
    }

    setupInterceptors() {
        // Thêm interceptor để tự động thêm token vào header cho apiClient
        apiClient.interceptors.request.use(
            (config) => {
                if (this.token) {
                    config.headers["Authorization"] = `Bearer ${this.token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Thêm interceptor để tự động thêm token vào header cho userApiClient
        userApiClient.interceptors.request.use(
            (config) => {
                if (this.token) {
                    config.headers["Authorization"] = `Bearer ${this.token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Thêm interceptor để xử lý lỗi 401 và tự động refresh token cho apiClient
        apiClient.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        await this.refreshToken();
                        // Thêm token mới vào header và thử lại request
                        originalRequest.headers[
                            "Authorization"
                        ] = `Bearer ${this.token}`;
                        return apiClient(originalRequest);
                    } catch (refreshError) {
                        console.error("Token refresh failed:", refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        // Thêm interceptor để xử lý lỗi 401 và tự động refresh token cho userApiClient
        userApiClient.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        await this.refreshToken();
                        // Thêm token mới vào header và thử lại request
                        originalRequest.headers[
                            "Authorization"
                        ] = `Bearer ${this.token}`;
                        return userApiClient(originalRequest);
                    } catch (refreshError) {
                        console.error("Token refresh failed:", refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    // ===========================
    // Các hàm liên quan đến session type
    // ===========================

    // Lấy thông tin session hiện tại
    getCurrentSession() {
        if (this.currentSessionType === "admin") {
            return {
                token: this.adminToken,
                refreshToken: this.adminRefreshToken,
                user: this.adminUser,
                type: "admin",
            };
        } else {
            return {
                token: this.userToken,
                refreshToken: this.userRefreshToken,
                user: this.userUser,
                type: "user",
            };
        }
    }

    // Chuyển đổi session
    switchToSession(type) {
        this.currentSessionType = type;
        localStorage.setItem("session_type", type);

        // Đồng bộ con trỏ token/user hiện tại và interceptor
        const currentSession = this.getCurrentSession();
        this.token = currentSession.token || null;
        this.refreshToken = currentSession.refreshToken || null;
        this.user = currentSession.user || null;
        this.updateInterceptors(currentSession.token);
    }

    // Cập nhật interceptor với token hiện tại
    updateInterceptors(token) {
        // Cập nhật header cho cả hai client
        if (token) {
            apiClient.defaults.headers.common[
                "Authorization"
            ] = `Bearer ${token}`;
            userApiClient.defaults.headers.common[
                "Authorization"
            ] = `Bearer ${token}`;
        } else {
            delete apiClient.defaults.headers.common["Authorization"];
            delete userApiClient.defaults.headers.common["Authorization"];
        }
    }

    // Lấy loại phiên hiện tại
    getCurrentSessionType() {
        return this.currentSessionType;
    }

    // Thiết lập loại phiên (chỉ chuyển đổi, không mất dữ liệu)
    setSessionType(type) {
        this.switchToSession(type);
    }

    // Tự động chuyển đổi session type dựa trên route
    autoSwitchSessionType(currentPath) {
        const isAdminRoute = currentPath.startsWith("/admin");

        if (isAdminRoute && this.currentSessionType !== "admin") {
            // Đang ở trang admin nhưng session type là user
            console.log("Auto switching to admin session for admin route");
            this.switchToSession("admin");
        } else if (!isAdminRoute && this.currentSessionType !== "user") {
            // Đang ở trang thường nhưng session type là admin
            console.log("Auto switching to user session for user route");
            this.switchToSession("user");
        }
    }

    // Kiểm tra xem có phiên admin không
    isAdminSessionActive() {
        return (
            this.currentSessionType === "admin" &&
            this.adminToken &&
            this.adminUser
        );
    }

    // Kiểm tra xem có phiên user không
    isUserSessionActive() {
        return (
            this.currentSessionType === "user" &&
            this.userToken &&
            this.userUser
        );
    }

    // ===========================
    // Các hàm liên quan đến session
    // ===========================

    // Lấy thông tin user hiện tại
    async me() {
        try {
            if (!this.token) {
                throw new Error("No active session");
            }

            const response = await userApiClient.get("/me");

            if (response.data.success) {
                // Cập nhật thông tin user trong localStorage nếu có thay đổi
                const userData = response.data.data;
                if (JSON.stringify(this.user) !== JSON.stringify(userData)) {
                    this.user = userData;
                    localStorage.setItem("user", JSON.stringify(userData));
                }
            }

            return response.data;
        } catch (error) {
            console.error("Error fetching user info:", error);
            throw error;
        }
    }

    // Hàm validate session
    async validateSession() {
        try {
            const currentSession = this.getCurrentSession();

            // Tránh gọi nhiều lần liên tiếp trong thời gian ngắn
            if (this.validationInProgress) {
                return currentSession.user;
            }

            // Nếu đã xác thực gần đây, trả về kết quả đã lưu
            if (
                this.lastValidationTime &&
                Date.now() - this.lastValidationTime <
                    this.validationCacheDuration
            ) {
                return currentSession.user;
            }
            this.validationInProgress = true;

            const isBackendAvailable = await testApiConnectivity();
            // Nếu backend không khả dụng, trả về user đã lưu (nếu có)
            if (!isBackendAvailable) {
                console.log("Backend API không khả dụng");
                if (currentSession.token && currentSession.user) {
                    this.lastValidationTime = Date.now();
                    return currentSession.user;
                }
                this.lastValidationTime = Date.now();
                return null;
            }

            if (currentSession.token) {
                try {
                    const timestamp = Date.now();
                    const response = await userApiClient.get(
                        `/me?t=${timestamp}`,
                        {
                            timeout: 3000,
                        }
                    );
                    const data = response.data;

                    if (data.success && data.data) {
                        // Cập nhật user trong session hiện tại
                        if (this.currentSessionType === "admin") {
                            this.adminUser = data.data;
                            localStorage.setItem(
                                "admin_user",
                                JSON.stringify(this.adminUser)
                            );
                        } else {
                            this.userUser = data.data;
                            localStorage.setItem(
                                "user",
                                JSON.stringify(this.userUser)
                            );
                        }
                        this.lastValidationTime = Date.now();
                        this.validationInProgress = false;
                        return data.data;
                    }
                } catch (err) {
                    console.error("Session validation error:", err);
                    // If token is expired, try to refresh
                    if (
                        err.response?.status === 401 &&
                        currentSession.refreshToken
                    ) {
                        try {
                            await this.refreshToken();
                            this.validationInProgress = false;
                            return currentSession.user;
                        } catch (refreshError) {
                            console.error(
                                "Token refresh during validation failed:",
                                refreshError
                            );
                        }
                    }
                    this.validationInProgress = false;
                    this.lastValidationTime = Date.now();
                    return null;
                }
            }

            if (currentSession.token && currentSession.user) {
                this.lastValidationTime = Date.now();
                this.validationInProgress = false;
                return currentSession.user;
            }
        } catch (error) {
            console.error("Session validation error:", error);
            return false;
        }
    }

    // ===========================
    // Các hàm liên quan đến token
    // ===========================

    // Lấy token hiện tại
    getToken() {
        // Trả về token của session hiện tại, đồng bộ với con trỏ this.token
        const current = this.getCurrentSession();
        this.token = current.token || null;
        return this.token;
    }

    // Hàm refresh token
    async refreshToken() {
        // Nếu đã có một lần refresh đang diễn ra, chờ nó hoàn thành
        if (this.tokenRefreshPromise) {
            return this.tokenRefreshPromise;
        }

        this.tokenRefreshPromise = this._performTokenRefresh();

        try {
            const result = await this.tokenRefreshPromise;
            return result;
        } finally {
            this.tokenRefreshPromise = null;
        }
    }

    // Thực hiện refresh token
    async _performTokenRefresh() {
        try {
            if (!this.refreshToken) {
                throw new Error("Không có refresh token");
            }

            const response = await apiClient.post("/refresh-token", {
                refreshToken: this.refreshToken,
            });

            const data = response.data;

            if (!data.success) {
                throw new Error(data.message || "Token refresh thất bại");
            }

            // Cập nhật token mới
            this.token = data.tokens.accessToken;
            this.refreshToken = data.tokens.refreshToken;

            // Ghi theo session hiện tại (admin/user) để các service khác đọc đúng
            if (this.currentSessionType === "admin") {
                this.adminToken = this.token;
                this.adminRefreshToken = this.refreshToken;
                localStorage.setItem("admin_auth_token", this.token);
                localStorage.setItem("admin_refresh_token", this.refreshToken);
            } else {
                this.userToken = this.token;
                this.userRefreshToken = this.refreshToken;
                localStorage.setItem("auth_token", this.token);
                localStorage.setItem("refresh_token", this.refreshToken);
            }

            // Đồng bộ interceptor với token mới
            this.updateInterceptors(this.token);

            // Lên lịch refresh token tiếp theo
            this.scheduleTokenRefresh(data.expiresIn);
            return data;
        } catch (error) {
            console.error("AuthService: Token refresh error", error);
            // Nếu refresh token cũng hết hạn, đăng xuất
            if (error.response?.status === 401) {
                this.logout();
            }
            throw error;
        }
    }

    scheduleTokenRefresh = (expiresIn) => {
        // Lên lịch refresh token trước khi nó hết hạn
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }

        // Refresh token trước 5 phút (300000 ms) so với thời gian hết hạn
        const refreshTime = Math.max(expiresIn - 300000, 60000); // Minimum 1 minute
        console.log(
            `Scheduling token refresh in ${refreshTime / 1000} seconds`
        );

        // Lưu thời điểm hết hạn để dùng khi có tương tác
        this.tokenExpiresAt = Date.now() + (typeof expiresIn === "number" ? expiresIn : 0);

        this.refreshTimer = setTimeout(async () => {
            try {
                console.log("Attempting automatic token refresh...");
                await this.refreshToken();
            } catch (error) {
                console.error("Automatic token refresh failed:", error);
            }
        }, refreshTime);
    };

    // Tự động refresh khi có tương tác nếu sắp hết hạn
    initializeActivityRefresh() {
        const activityHandler = () => this.maybeRefreshOnActivity();
        [
            "click",
            "keydown",
            "mousemove",
            "scroll",
            "touchstart",
            "visibilitychange",
        ].forEach((evt) => window.addEventListener(evt, activityHandler));
    }

    maybeRefreshOnActivity() {
        // Debounce để tránh gọi liên tục: tối đa 1 lần mỗi 60s
        const now = Date.now();
        if (now - this.lastActivityRefreshTime < 60000) return;
        this.lastActivityRefreshTime = now;

        // Chỉ xử lý nếu có token và có thời điểm hết hạn
        if (!this.token || !this.tokenExpiresAt) return;

        // Nếu token còn < 6 phút sẽ hết hạn, refresh ngay
        const timeLeft = this.tokenExpiresAt - now;
        if (timeLeft <= 360000) {
            this.refreshToken().catch((e) =>
                console.error("Activity-triggered refresh failed:", e)
            );
        }
    }

    // ===========================
    // Các hàm liên quan đến authentication
    // ===========================

    isAuthenticated = async () => {
        const currentSession = this.getCurrentSession();
        const hasToken = !!currentSession.token;
        const hasUser = !!currentSession.user;
        const result = hasToken && hasUser;
        console.log(
            "AuthService: isAuthenticated =",
            hasToken,
            hasUser,
            "=>",
            result,
            "session type:",
            this.currentSessionType
        );
        return result;
    };

    // Hàm Đăng ký
    async register(userData) {
        try {
            const response = await apiClient.post("/register", userData);
            return response.data;
        } catch (error) {
            console.error("Registration error:", error);
            const errorMessage =
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Đăng ký thất bại";
            throw new Error(errorMessage);
        }
    }

    // Hàm đăng nhập với phân biệt admin/user
    async login(credentials, sessionType = "user") {
        try {
            const response = await apiClient.post("/login", credentials);
            const data = response.data;

            const token = data?.tokens?.accessToken;
            const refreshToken = data?.tokens?.refreshToken;
            const user = data?.user;

            // Lưu vào session tương ứng
            if (sessionType === "admin") {
                this.adminToken = token;
                this.adminRefreshToken = refreshToken;
                this.adminUser = user;
                localStorage.setItem("admin_auth_token", token);
                localStorage.setItem("admin_refresh_token", refreshToken);
                localStorage.setItem("admin_user", JSON.stringify(user));
            } else {
                this.userToken = token;
                this.userRefreshToken = refreshToken;
                this.userUser = user;
                localStorage.setItem("auth_token", token);
                localStorage.setItem("refresh_token", refreshToken);
                localStorage.setItem("user", JSON.stringify(user));
            }

            // Chuyển sang session vừa đăng nhập
            this.switchToSession(sessionType);

            if (data.expiresIn) {
                this.scheduleTokenRefresh(data.expiresIn);
            } else {
                this.scheduleTokenRefresh(60 * 60 * 1000); // Default 1 hour
            }

            return data;
        } catch (error) {
            console.error("Login error:", error);
            const errorMessage =
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Đăng nhập thất bại";
            throw new Error(errorMessage);
        }
    }

    // Hàm đăng nhập admin (wrapper cho login với sessionType admin)
    async adminLogin(credentials) {
        return this.login(credentials, "admin");
    }

    // Hàm đăng nhập user (wrapper cho login với sessionType user)
    async userLogin(credentials) {
        return this.login(credentials, "user");
    }

    // Hàm đăng xuất session hiện tại
    async logout() {
        try {
            const currentSession = this.getCurrentSession();
            if (currentSession.token) {
                await apiClient.post("/logout");
            }
        } catch (error) {
            console.error("Logout error:", error);
        }

        // Xóa session hiện tại
        if (this.currentSessionType === "admin") {
            this.adminToken = null;
            this.adminRefreshToken = null;
            this.adminUser = null;
            localStorage.removeItem("admin_auth_token");
            localStorage.removeItem("admin_refresh_token");
            localStorage.removeItem("admin_user");
        } else {
            this.userToken = null;
            this.userRefreshToken = null;
            this.userUser = null;
            localStorage.removeItem("auth_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user");
        }

        // Chuyển về session còn lại hoặc user
        if (this.currentSessionType === "admin" && this.userToken) {
            this.switchToSession("user");
        } else if (this.currentSessionType === "user" && this.adminToken) {
            this.switchToSession("admin");
        } else {
            this.currentSessionType = "user";
            localStorage.setItem("session_type", "user");
            this.updateInterceptors(null);
        }

        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
        this.lastValidationTime = null;
    }

    // ===========================
    // Các hàm liên quan đến user
    // ===========================

    // Lấy thông tin user từ server
    getUser = async () => {
        const response = await apiClient.get(`/me`);
        return response.data;
    };
    // Lấy thông tin user đã lưu trong bộ nhớ (không gọi API)
    getUserCached = () => {
        return this.user;
    };
}

const authService = new AuthService();
export default authService;
