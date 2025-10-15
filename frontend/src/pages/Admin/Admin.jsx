import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services";
import { useNavigate } from "react-router-dom";
import config from "@/config";
import "./Admin.css";

function Admin() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    const {
        user,
        isAuthenticated,
        adminLogin,
        logout,
        sessionType,
        isAdminSession,
    } = useAuth();
    const navigate = useNavigate();

    // Kiểm tra nếu đã đăng nhập và có quyền admin
    useEffect(() => {
        authService.s;
        const checkAuth = async () => {
            try {
                if (isAuthenticated && user) {
                    // Kiểm tra cả role và session type
                    // Role "sa" được xử lý như "admin"
                    const isAdminRole =
                        user.role === "admin" || user.role === "sa";
                    if (
                        isAdminRole &&
                        isAdminSession &&
                        sessionType === "admin"
                    ) {
                        // Đã đăng nhập với quyền admin/sa và đúng phiên admin, chuyển đến dashboard
                        navigate(config.routes.adminDashboard, {
                            replace: true,
                        });
                        return;
                    }
                }
            } catch (error) {
                console.error("Error in checkAuth:", error);
            } finally {
                setIsCheckingAuth(false);
            }
        };

        checkAuth();
    }, [isAuthenticated, user, navigate, logout, sessionType, isAdminSession]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await adminLogin(formData);
            // Kiểm tra nếu user có quyền admin/sa và đã đăng nhập thành công với phiên admin
            const isAdminRole =
                result.user &&
                (result.user.role === "admin" || result.user.role === "sa");
            if (isAdminRole) {
                navigate(config.routes.adminDashboard);
            } else {
                setError("Bạn không có quyền truy cập trang quản trị");
                // Logout nếu không phải admin/sa
                await logout();
            }
        } catch (error) {
            console.error("Admin login error:", error);
            setError(error.message || "Đăng nhập thất bại");
        } finally {
            setLoading(false);
        }
    };

    // Hiển thị loading khi đang kiểm tra authentication
    if (isCheckingAuth) {
        return (
            <div className="admin-login-container">
                <div className="admin-login-content">
                    <div className="admin-login-header">
                        <div className="admin-logo">
                            <h1>🏛️</h1>
                            <h2>Admin Panel</h2>
                        </div>
                        <p>Đang kiểm tra quyền truy cập...</p>
                    </div>
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-login-container">
            <div className="admin-login-content">
                <div className="admin-login-header">
                    <div className="admin-logo">
                        <h1>🏛️</h1>
                        <h2>Admin Panel</h2>
                    </div>
                    <p>Đăng nhập vào hệ thống quản trị</p>
                </div>

                <form className="admin-login-form" onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="username">Tên đăng nhập</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Nhập tên đăng nhập"
                            required
                            autoComplete="username"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Nhập mật khẩu"
                            required
                            autoComplete="current-password"
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="admin-login-button"
                        disabled={loading}
                    >
                        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>
                </form>

                <div className="admin-login-footer">
                    <p>© 2024 Lịch sử Việt Nam. All rights reserved.</p>
                    <a href="/" className="back-to-site">
                        ← Quay về trang chủ
                    </a>
                </div>
            </div>
        </div>
    );
}

export default Admin;
