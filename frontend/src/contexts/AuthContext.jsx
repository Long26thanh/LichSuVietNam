import React, { createContext, useContext, useReducer, useEffect } from "react";
import authService from "@/services/authService";
import axios from "axios";

// Tạo context
const AuthContext = createContext();

// Custom hook để sử dụng context
// Khởi tạo state từ localStorage để tránh flash
const getInitialState = () => {
    try {
        let sessionType = localStorage.getItem("session_type") || "user";
        if (sessionType !== "user" && sessionType !== "admin") {
            sessionType = "user";
        }

        if (sessionType === "user") {
            // Hỗ trợ cả bộ key cũ (auth_token, user) và mới (user_auth_token, user_user)
            const token =
                localStorage.getItem("auth_token");
            const userStr =
                localStorage.getItem("user");
            if (token && userStr) {
                const user = JSON.parse(userStr);
                return {
                    user,
                    token,
                    isAuthenticated: true,
                    isAdminAuthenticated: false,
                    isLoading: true,
                    error: null,
                    sessionType,
                };
            }
        }

        if (sessionType === "admin") {
            const token = localStorage.getItem("admin_auth_token");
            const userStr = localStorage.getItem("admin_user");
            if (token && userStr) {
                const user = JSON.parse(userStr);
                return {
                    user,
                    token,
                    isAuthenticated: true,
                    isAdminAuthenticated: true,
                    isLoading: true,
                    error: null,
                    sessionType,
                };
            }
        }
    } catch (error) {
        console.error("Error reading from localStorage:", error);
    }

    return {
        user: null,
        token: null,
        isAuthenticated: false,
        isAdminAuthenticated: false,
        isLoading: true,
        error: null,
        sessionType: "user",
    };
};

const initialState = getInitialState();

const AUTH_ACTIONS = {
    LOGIN_START: "LOGIN_START",
    LOGIN_SUCCESS: "LOGIN_SUCCESS",
    LOGIN_FAILURE: "LOGIN_FAILURE",
    LOGOUT: "LOGOUT",
    SET_USER: "SET_USER",
    SET_LOADING: "SET_LOADING",
    CLEAR_ERROR: "CLEAR_ERROR",
    INIT_AUTH: "INIT_AUTH",
    REFRESH_TOKEN_SUCCESS: "REFRESH_TOKEN_SUCCESS",
    REFRESH_TOKEN_FAILURE: "REFRESH_TOKEN_FAILURE",
    UPDATE_USER: "UPDATE_USER",
    SET_SESSION_TYPE: "SET_SESSION_TYPE",
};

function authReducer(state, action) {
    switch (action.type) {
        case AUTH_ACTIONS.LOGIN_START:
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case AUTH_ACTIONS.LOGIN_SUCCESS:
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                isAdminAuthenticated:
                    (action.payload.sessionType || "user") === "admin",
                isLoading: false,
                error: null,
                sessionType: action.payload.sessionType || "user",
            };
        case AUTH_ACTIONS.LOGIN_FAILURE:
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isAdminAuthenticated: false,
                isLoading: false,
                error: action.payload,
            };
        case AUTH_ACTIONS.LOGOUT:
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isAdminAuthenticated: false,
                error: null,
                sessionType: "user",
            };
        case AUTH_ACTIONS.SET_USER:
            return {
                ...state,
                user: action.payload,
                isAuthenticated: !!action.payload,
                isAdminAuthenticated:
                    state.sessionType === "admin" && !!action.payload,
            };
        case AUTH_ACTIONS.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload,
            };
        case AUTH_ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null,
            };
        case AUTH_ACTIONS.INIT_AUTH:
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: action.payload.isAuthenticated,
                isAdminAuthenticated:
                    (action.payload.sessionType || "user") === "admin" &&
                    !!action.payload.isAuthenticated,
                isLoading: false,
                sessionType: action.payload.sessionType || "user",
            };
        case AUTH_ACTIONS.REFRESH_TOKEN_SUCCESS:
            return {
                ...state,
                token: action.payload.token,
                isAuthenticated: true,
                isAdminAuthenticated:
                    state.sessionType === "admin" ? true : state.isAdminAuthenticated,
                error: null,
            };
        case AUTH_ACTIONS.REFRESH_TOKEN_FAILURE:
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isAdminAuthenticated: false,
                error: action.payload,
            };
        case AUTH_ACTIONS.UPDATE_USER:
            return {
                ...state,
                user: { ...state.user, ...action.payload },
            };
        case AUTH_ACTIONS.SET_SESSION_TYPE:
            return {
                ...state,
                sessionType: action.payload,
                isAdminAuthenticated:
                    action.payload === "admin" ? state.isAuthenticated : false,
            };
        default:
            return state;
    }
}

export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialState);
    const [isInitialized, setIsInitialized] = React.useState(false);

    // Khởi tạo authentication khi component được mount
    useEffect(() => {
        // Tránh gọi lại nếu đã khởi tạo
        if (isInitialized) {
            return;
        }

        // Khởi tạo authentication
        const initAuth = async () => {
            try {
                // Xác định token theo session hiện tại
                const activeSessionType =
                    localStorage.getItem("session_type") || "user";
                const token =
                    activeSessionType === "admin"
                        ? localStorage.getItem("admin_auth_token")
                        : localStorage.getItem("auth_token");
                if (!token) {
                    dispatch({
                        type: AUTH_ACTIONS.INIT_AUTH,
                        payload: {
                            user: null,
                            token: null,
                            isAuthenticated: false,
                            isAdminAuthenticated: false,
                            sessionType: activeSessionType,
                        },
                    });
                    return;
                }

                // Nếu đã có user trong initial state, chỉ cần validate với server
                if (state.user && state.isAuthenticated) {
                    try {
                        // Validate session với server
                        const user = await authService.validateSession();
                        if (user) {
                            // Server confirm user hợp lệ, cập nhật thông tin mới nhất
                            const currentSession = authService.getCurrentSession();
                            dispatch({
                                type: AUTH_ACTIONS.INIT_AUTH,
                                payload: {
                                    user,
                                    token: currentSession.token,
                                    isAuthenticated: true,
                                    isAdminAuthenticated: currentSession.type === "admin",
                                    sessionType: currentSession.type,
                                },
                            });
                        } else {
                            // Server không confirm, giữ user từ cache
                            dispatch({
                                type: AUTH_ACTIONS.SET_LOADING,
                                payload: false,
                            });
                        }
                    } catch (error) {
                        console.error("Validation error:", error);
                        // Nếu có lỗi, giữ user từ cache
                        dispatch({
                            type: AUTH_ACTIONS.SET_LOADING,
                            payload: false,
                        });
                    }
                } else {
                    // Không có user trong initial state, thử lấy từ server
                    try {
                        const user = await authService.validateSession();
                        if (user) {
                            dispatch({
                                type: AUTH_ACTIONS.INIT_AUTH,
                                payload: {
                                    user,
                                    token: authService.getToken(),
                                    isAuthenticated: true,
                                    sessionType:
                                        authService.getCurrentSessionType(),
                                },
                            });
                        } else {
                            dispatch({
                                type: AUTH_ACTIONS.INIT_AUTH,
                                payload: {
                                    user: null,
                                    token: null,
                                    isAuthenticated: false,
                                    sessionType: activeSessionType,
                                },
                            });
                        }
                    } catch (error) {
                        console.error("Lỗi khởi tạo authentication:", error);
                        dispatch({
                            type: AUTH_ACTIONS.INIT_AUTH,
                            payload: {
                                user: null,
                                token: null,
                                isAuthenticated: false,
                                sessionType: activeSessionType,
                            },
                        });
                    }
                }
            } finally {
                setIsInitialized(true);
            }
        };

        initAuth();
    }, [isInitialized]);

    const login = async (credentials, sessionType = "user") => {
        dispatch({ type: AUTH_ACTIONS.LOGIN_START });
        try {
            const result = await authService.login(credentials, sessionType);
            dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: {
                    user: result.user,
                    token: result.tokens?.accessToken,
                    sessionType: authService.getCurrentSessionType(),
                },
            });
            return result;
        } catch (error) {
            dispatch({
                type: AUTH_ACTIONS.LOGIN_FAILURE,
                payload: error.message,
            });
            throw error;
        }
    };

    // Hàm đăng nhập admin
    const adminLogin = async (credentials) => {
        return login(credentials, "admin");
    };

    // Hàm đăng nhập user
    const userLogin = async (credentials) => {
        return login(credentials, "user");
    };

    // Hàm chuyển đổi session type và đồng bộ lại user/token theo session hiện tại
    const switchSessionType = (newSessionType) => {
        authService.setSessionType(newSessionType);
        const currentSession = authService.getCurrentSession();
        const isAuth = !!(currentSession && currentSession.token && currentSession.user);
        dispatch({
            type: AUTH_ACTIONS.INIT_AUTH,
            payload: {
                user: currentSession?.user || null,
                token: currentSession?.token || null,
                isAuthenticated: isAuth,
                sessionType: currentSession?.type || newSessionType,
            },
        });
    };

    const logout = async () => {
        try {
            await authService.logout();
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
        } catch (error) {
            console.error("Logout error:", error);
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
    };

    const value = {
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isAdminAuthenticated: state.isAdminAuthenticated,
        isLoading: state.isLoading,
        error: state.error,
        sessionType: state.sessionType,
        isAdminSession: state.sessionType === "admin",

        login,
        adminLogin,
        userLogin,
        logout,
        switchSessionType,

        authService,
    };
    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth phải được sử dụng trong AuthProvider");
    }
    return context;
};
export default AuthContext;
