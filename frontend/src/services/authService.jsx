import axios from "axios";
import config from "../config";
import { createApiClient } from "./apiClient";
import { setAuthServiceInstance } from "./apiClient";

const API_URL = "/api/auth";
const USER_API_URL = "/api/users";

// Tạo instance axios với cấu hình cơ bản
const apiClient = createApiClient(API_URL);

// Tạo instance axios cho user API
const userApiClient = createApiClient(USER_API_URL);

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
        // Session cho user thường
        this.userToken = localStorage.getItem("auth_token") || null;
        this.userUser =
            JSON.parse(localStorage.getItem("user") || "null") || null;

        // Session cho admin
        this.adminToken = localStorage.getItem("admin_auth_token") || null;
        this.adminUser = JSON.parse(localStorage.getItem("admin_user")) || null;

        // Session hiện tại
        this.currentSessionType =
            localStorage.getItem("session_type") || "user";

        // Con trỏ tiện dụng trỏ tới session hiện tại
        const current = this.getCurrentSession();
        this.token = current.token || null;
        this.user = current.user || null;
        this.tokenRefreshPromise = null;
        this.validationInProgress = false;
        this.lastValidationTime = null;
        this.validationCacheDuration = 30000;
        this.tokenExpiresAt = null;
        this.lastActivityRefreshTime = 0;
        
        // Thời gian refresh token trước khi hết hạn (3 phút)
        this.refreshThreshold = 3 * 60 * 1000;
        
        // Thời gian giữa các lần check khi có activity (30 giây)
        this.activityCheckInterval = 30 * 1000;
        
        // Flag để tránh nhiều refresh cùng lúc
        this.isRefreshing = false;

        this.setupInterceptors();
        this.initializeActivityRefresh();
        this.startPeriodicTokenCheck();
        
        // Set this instance vào apiClient để các service khác có thể dùng
        setAuthServiceInstance(this);
    }

    // Decode JWT token để lấy thông tin expiration
    decodeToken(token) {
        try {
            if (!token) return null;
            const base64Url = token.split('.')[1];
            if (!base64Url) return null;
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }

    // Kiểm tra token có hết hạn không
    isTokenExpired(token) {
        const decoded = this.decodeToken(token);
        if (!decoded || !decoded.exp) return true;
        
        // exp trong JWT là timestamp tính bằng giây
        const expirationTime = decoded.exp * 1000;
        const currentTime = Date.now();
        
        // Token hết hạn nếu thời gian hiện tại >= thời gian hết hạn
        return currentTime >= expirationTime;
    }

    // Kiểm tra token sắp hết hạn (trong vòng refreshThreshold)
    isTokenExpiringSoon(token) {
        const decoded = this.decodeToken(token);
        if (!decoded || !decoded.exp) return true;
        
        const expirationTime = decoded.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiry = expirationTime - currentTime;
        
        // Token sắp hết hạn nếu còn ít hơn refreshThreshold (10 phút)
        return timeUntilExpiry > 0 && timeUntilExpiry <= this.refreshThreshold;
    }

    // Lấy thời gian còn lại của token (milliseconds)
    getTokenTimeRemaining(token) {
        const decoded = this.decodeToken(token);
        if (!decoded || !decoded.exp) return 0;
        
        const expirationTime = decoded.exp * 1000;
        const currentTime = Date.now();
        
        return Math.max(0, expirationTime - currentTime);
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

    // Xóa tokens của session hiện tại
    clearCurrentSessionTokens() {
        if (this.currentSessionType === "admin") {
            this.adminToken = null;
            localStorage.removeItem("admin_auth_token");
            localStorage.removeItem("admin_user");
        } else {
            this.userToken = null;
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user");
        }
        this.token = null;
        this.user = null;
    }

    setupInterceptors() {
        // Interceptor cho apiClient
        apiClient.interceptors.request.use(
            async (config) => {
                // Kiểm tra và refresh token nếu cần trước khi gửi request
                await this.checkAndRefreshToken();
                
                if (this.token) {
                    config.headers["Authorization"] = `Bearer ${this.token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Interceptor cho userApiClient
        userApiClient.interceptors.request.use(
            async (config) => {
                // Kiểm tra và refresh token nếu cần trước khi gửi request
                await this.checkAndRefreshToken();
                
                if (this.token) {
                    config.headers["Authorization"] = `Bearer ${this.token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor cho apiClient - xử lý lỗi 401
        apiClient.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                // Bỏ qua refresh token nếu có flag _skipAuthRefresh
                if (originalRequest._skipAuthRefresh) {
                    return Promise.reject(error);
                }

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    
                    try {
                        // Thử refresh token
                        await this.refreshToken();
                        
                        // Retry request với token mới
                        originalRequest.headers["Authorization"] = `Bearer ${this.token}`;
                        return apiClient(originalRequest);
                    } catch (refreshError) {
                        console.error("Token refresh failed on 401:", refreshError);
                        // Nếu refresh thất bại, logout
                        this.handleTokenExpiration();
                        return Promise.reject(refreshError);
                    }
                }
                
                return Promise.reject(error);
            }
        );

        // Response interceptor cho userApiClient - xử lý lỗi 401
        userApiClient.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                // Bỏ qua refresh token nếu có flag _skipAuthRefresh
                if (originalRequest._skipAuthRefresh) {
                    return Promise.reject(error);
                }

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    
                    try {
                        // Thử refresh token
                        await this.refreshToken();
                        
                        // Retry request với token mới
                        originalRequest.headers["Authorization"] = `Bearer ${this.token}`;
                        return userApiClient(originalRequest);
                    } catch (refreshError) {
                        console.error("Token refresh failed on 401:", refreshError);
                        // Nếu refresh thất bại, logout
                        this.handleTokenExpiration();
                        return Promise.reject(refreshError);
                    }
                }
                
                return Promise.reject(error);
            }
        );
    }

    // Hàm kiểm tra và refresh token nếu cần
    async checkAndRefreshToken() {
        // Không có token thì bỏ qua
        if (!this.token) {
            return;
        }

        // Đang refresh rồi thì đợi
        if (this.isRefreshing) {
            // Đợi refresh hoàn thành
            await this.tokenRefreshPromise;
            return;
        }

        const timeRemaining = this.getTokenTimeRemaining(this.token);
        
        // Log thời gian còn lại (cho debug)
        const minutesRemaining = Math.floor(timeRemaining / 60000);
        if (minutesRemaining <= 15) {
            console.log(`Access token expires in ${minutesRemaining} minutes`);
        }

        // Access token đã hết hạn hoàn toàn
        if (timeRemaining <= 0) {
            console.warn('Access token has completely expired');
            // Thử refresh - backend sẽ kiểm tra refresh token trong cookie
            console.log('Attempting to refresh expired access token...');
            try {
                await this.refreshToken();
                return;
            } catch (error) {
                console.error('Failed to refresh expired token:', error);
                // Nếu refresh thất bại (refresh token hết hạn), backend sẽ trả 401
                // và handleTokenExpiration sẽ được gọi trong catch block của refreshToken
                throw error;
            }
        }
        
        // Access token sắp hết hạn (còn < 3 phút) → refresh ngay
        if (timeRemaining <= this.refreshThreshold) {
            console.log('Access token expiring soon, refreshing...');
            try {
                await this.refreshToken();
            } catch (error) {
                console.error('Failed to refresh expiring token:', error);
                // Lỗi sẽ được xử lý trong refreshToken()
                throw error;
            }
        }
    }

    // Xử lý khi token hết hạn hoàn toàn
    handleTokenExpiration() {
        console.log('Handling token expiration - logging out');
        this.clearCurrentSessionTokens();
        
        // Redirect về trang login
        const isAdmin = this.currentSessionType === 'admin';
        window.location.href = isAdmin ? '/admin/login' : '/login';
    }

    // ===========================
    // Các hàm liên quan đến session type
    // ===========================

    // Lấy thông tin session hiện tại
    getCurrentSession() {
        if (this.currentSessionType === "admin") {
            return {
                token: this.adminToken,
                user: this.adminUser,
                type: "admin",
            };
        } else {
            return {
                token: this.userToken,
                user: this.userUser,
                type: "user",
            };
        }
    }

    // Chuyển đổi session
    switchToSession(type) {
        this.currentSessionType = type;
        localStorage.setItem("session_type", type);

        // Đồng bộ con trỏ token/user hiện tại
        const currentSession = this.getCurrentSession();
        this.token = currentSession.token || null;
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
            this.switchToSession("admin");
        } else if (!isAdminRoute && this.currentSessionType !== "user") {
            // Đang ở trang thường nhưng session type là admin
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
        // Nếu đang refresh, đợi promise hiện tại
        if (this.tokenRefreshPromise) {
            return this.tokenRefreshPromise;
        }

        this.isRefreshing = true;
        
        this.tokenRefreshPromise = new Promise(async (resolve, reject) => {
            try {
                console.log('Refreshing access token...');

                // Gọi API refresh - refresh token tự động gửi qua cookie
                // Không cần gửi refreshToken trong body nữa
                const response = await axios.post(
                    config.serverUrl + API_URL + "/refresh-token",
                    {}, // Empty body - refresh token ở trong cookie
                    {
                        withCredentials: true, // Quan trọng: gửi cookie
                        _skipAuthRefresh: true, // Flag để bỏ qua interceptor
                    }
                );

                const { accessToken: newToken } = response.data.tokens;

                console.log('Access token refreshed successfully');

                // Chỉ update access token, refresh token vẫn ở trong cookie
                if (this.currentSessionType === "admin") {
                    this.adminToken = newToken;
                    localStorage.setItem("admin_auth_token", newToken);
                } else {
                    this.userToken = newToken;
                    localStorage.setItem("auth_token", newToken);
                }

                // Update current pointer
                this.token = newToken;

                // Update interceptors with new token
                this.updateInterceptors(newToken);

                // Update token expiration time
                const decoded = this.decodeToken(newToken);
                if (decoded && decoded.exp) {
                    this.tokenExpiresAt = decoded.exp * 1000;
                }

                resolve(newToken);
            } catch (error) {
                console.error("Token refresh failed:", error);
                
                // Chỉ clear tokens nếu refresh thất bại vì token không hợp lệ
                // Không clear nếu chỉ là lỗi network
                if (error.response?.status === 401 || error.response?.status === 403) {
                    console.log('Refresh token invalid or expired, clearing session and logging out');
                    this.clearCurrentSessionTokens();
                    
                    // Redirect về trang login ngay
                    const isAdmin = this.currentSessionType === 'admin';
                    window.location.href = isAdmin ? '/admin/login' : '/login';
                }
                
                reject(error);
            } finally {
                this.isRefreshing = false;
                this.tokenRefreshPromise = null;
            }
        });

        return this.tokenRefreshPromise;
    }
    // ===========================
    // Các hàm liên quan đến authentication
    // ===========================

    scheduleTokenRefresh = (expiresIn) => {
        // Lên lịch refresh token trước khi nó hết hạn
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }

        // Refresh token trước 5 phút (300000 ms) so với thời gian hết hạn
        const refreshTime = Math.max(expiresIn - 300000, 60000); // Minimum 1 minute

        // Lưu thời điểm hết hạn để dùng khi có tương tác
        this.tokenExpiresAt =
            Date.now() + (typeof expiresIn === "number" ? expiresIn : 0);

        this.refreshTimer = setTimeout(async () => {
            try {
                await this.refreshToken();
            } catch (error) {
                console.error("Automatic token refresh failed:", error);
            }
        }, refreshTime);
    };

    // Tự động refresh khi có tương tác nếu sắp hết hạn
    initializeActivityRefresh() {
        const activityHandler = () => this.maybeRefreshOnActivity();
        
        // Các sự kiện cho thấy user đang active
        const activityEvents = [
            "mousedown",
            "keydown", 
            "scroll",
            "touchstart",
            "click",
            "mousemove"
        ];
        
        activityEvents.forEach((evt) => 
            window.addEventListener(evt, activityHandler, { passive: true })
        );
        
        // Visibility change - khi user quay lại tab
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.maybeRefreshOnActivity();
            }
        });
    }

    maybeRefreshOnActivity() {
        const now = Date.now();
        
        // Debounce: chỉ check tối đa mỗi 30 giây
        if (now - this.lastActivityRefreshTime < this.activityCheckInterval) {
            return;
        }
        
        this.lastActivityRefreshTime = now;

        // Không có token thì bỏ qua
        if (!this.token) {
            return;
        }

        const timeRemaining = this.getTokenTimeRemaining(this.token);
        
        // Nếu access token hết hạn hoàn toàn
        if (timeRemaining <= 0) {
            console.warn('Access token expired on activity check');
            // Thử refresh - backend sẽ kiểm tra refresh token cookie
            console.log('Attempting to refresh...');
            this.refreshToken().catch((e) => {
                console.error("Activity-triggered refresh failed:", e);
                // Error đã được xử lý trong refreshToken()
            });
            return;
        }
        
        // Nếu access token còn ít hơn 3 phút, refresh ngay
        if (timeRemaining <= this.refreshThreshold) {
            console.log(`Activity detected with ${Math.floor(timeRemaining / 60000)} minutes remaining, refreshing...`);
            this.refreshToken().catch((e) => {
                console.error("Activity-triggered refresh failed:", e);
            });
        }
    }

    // Kiểm tra định kỳ token (mỗi 1 phút)
    startPeriodicTokenCheck() {
        // Clear existing interval nếu có
        if (this.tokenCheckInterval) {
            clearInterval(this.tokenCheckInterval);
        }

        this.tokenCheckInterval = setInterval(() => {
            if (!this.token) {
                return;
            }

            const timeRemaining = this.getTokenTimeRemaining(this.token);
            const minutesRemaining = Math.floor(timeRemaining / 60000);
            
            // Log để debug
            if (minutesRemaining <= 15) {
                console.log(`Periodic check: Access token expires in ${minutesRemaining} minutes`);
            }

            // Access token hết hạn
            if (timeRemaining <= 0) {
                console.warn('Access token expired on periodic check');
                // Thử refresh - backend sẽ kiểm tra refresh token cookie
                console.log('Attempting to refresh...');
                this.refreshToken().catch((e) => {
                    console.error("Periodic refresh failed:", e);
                    // Error đã được xử lý trong refreshToken()
                });
                return;
            }

            // Access token sắp hết hạn - refresh
            if (timeRemaining <= this.refreshThreshold && !this.isRefreshing) {
                console.log('Periodic check: Access token expiring soon, refreshing...');
                this.refreshToken().catch((e) => {
                    console.error("Periodic refresh failed:", e);
                });
            }
        }, 1 * 60 * 1000); // Check mỗi 1 phút
    }

    // ===========================
    // Các hàm liên quan đến authentication
    // ===========================

    isAuthenticated = async () => {
        const currentSession = this.getCurrentSession();
        const hasToken = !!currentSession.token;
        const hasUser = !!currentSession.user;
        const result = hasToken && hasUser;
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
            const response = await apiClient.post("/login", credentials, {
                withCredentials: true, // Quan trọng: để nhận cookie từ server
            });
            const data = response.data;

            const token = data?.tokens?.accessToken;
            // Refresh token không còn trong response, nó đã được lưu vào cookie
            const user = data?.user;

            // Lưu vào session tương ứng (chỉ access token)
            if (sessionType === "admin") {
                this.adminToken = token;
                this.adminUser = user;
                localStorage.setItem("admin_auth_token", token);
                localStorage.setItem("admin_user", JSON.stringify(user));
            } else {
                this.userToken = token;
                this.userUser = user;
                localStorage.setItem("auth_token", token);
                localStorage.setItem("user", JSON.stringify(user));
            }

            // Chuyển sang session vừa đăng nhập
            this.switchToSession(sessionType);

            // Set token expiration time từ decoded token
            const decoded = this.decodeToken(token);
            if (decoded && decoded.exp) {
                this.tokenExpiresAt = decoded.exp * 1000;
                console.log(`Access token expires at: ${new Date(this.tokenExpiresAt).toLocaleString()}`);
            }

            // Schedule automatic refresh nếu có expiresIn
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
            // Chỉ gọi API logout nếu có token hợp lệ
            const currentSession = this.getCurrentSession();
            if (currentSession.token) {
                // Thêm flag để interceptor không retry
                await apiClient.post(
                    "/logout",
                    {},
                    {
                        withCredentials: true, // Quan trọng: để xóa cookie
                        _skipAuthRefresh: true, // Custom flag để bỏ qua refresh token
                    }
                );
            }
        } catch (error) {
            // Bỏ qua lỗi logout API, vẫn xóa local session
        }

        // Luôn xóa session local dù API có lỗi hay không
        if (this.currentSessionType === "admin") {
            this.adminToken = null;
            this.adminUser = null;
            localStorage.removeItem("admin_auth_token");
            localStorage.removeItem("admin_user");
        } else {
            this.userToken = null;
            this.userUser = null;
            localStorage.removeItem("auth_token");
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
