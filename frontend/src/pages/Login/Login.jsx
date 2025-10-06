import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components";
import { useAuth } from "@/contexts/AuthContext";
import config from "@/config";
import "./Login.css";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        user,
        isAuthenticated,
        userLogin,
        logout,
        isLoading: authLoading,
        error: authError,
        sessionType,
        isAdminSession,
    } = useAuth();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Kiểm tra nếu đã đăng nhập thì chuyển hướng
    useEffect(() => {
        const checkAuth = async () => {
            if (isAuthenticated && user) {
                navigate(config.routes.home, { replace: true });
                return;
            }
            setIsCheckingAuth(false);
        };

        checkAuth();
    }, [isAuthenticated, user, navigate, logout, sessionType, isAdminSession]);

    // Xử lý message từ register
    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message);

            if (location.state.username) {
                setFormData((prev) => ({
                    ...prev,
                    username: location.state.username,
                }));
            }
            // Xóa trang thái khỏi history để tránh hiển thị lại thông báo
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value,
        }));
        if (error) setError("");
        if (successMessage) setSuccessMessage("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccessMessage("");
        try {
            console.log("Attempting user login with:", formData);
            const result = await userLogin({
                username: formData.username,
                password: formData.password,
            });
            setSuccessMessage("Đăng nhập thành công!");

            // Kiểm tra kết quả đăng nhập
            if (result.user && result.user.role === "admin") {
                // Admin đăng nhập với phiên user, chuyển về home
                navigate(config.routes.home, { replace: true });
            } else {
                // User thường luôn chuyển về trang home
                navigate(config.routes.home, { replace: true });
            }
        } catch (error) {
            setError("Đăng nhập không thành công");
            console.error("Login error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Hiển thị loading khi đang kiểm tra authentication
    if (isCheckingAuth) {
        return (
            <div className="login-page">
                <div className="login-container">
                    <div className="login-content">
                        <div className="login-header">
                            <Link to="/" className="login-logo">
                                <img src="/logo.svg" alt="Logo" />
                                <h1>Lịch Sử Việt Nam</h1>
                            </Link>
                            <p>Đang kiểm tra trạng thái đăng nhập...</p>
                        </div>
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-content">
                    <div className="login-header">
                        <Link to="/" className="login-logo">
                            <img src="/logo.svg" alt="Logo" />
                            <h1>Lịch Sử Việt Nam</h1>
                        </Link>
                        <p>Đăng nhập để khám phá lịch sử Việt Nam</p>
                    </div>
                    <form className="login-form" onSubmit={handleSubmit}>
                        <h2>Đăng nhập</h2>

                        {successMessage && (
                            <p className="success-message">
                                <span className="success-icon">&#10003;</span>
                                {successMessage}
                            </p>
                        )}

                        {error && (
                            <p className="error-message">
                                <span className="error-icon">&#9888;</span>
                                {error}
                            </p>
                        )}
                        <div className="form-group">
                            <label htmlFor="username">Tên đăng nhập</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                placeholder="Nhập tên đăng nhập của bạn"
                                required
                                autoComplete="username"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Mật khẩu</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Nhập mật khẩu của bạn"
                                required
                                autoComplete="current-password"
                            />
                        </div>
                        {/* <div className="form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleInputChange}
                                />
                                Ghi nhớ tôi
                            </label>
                        </div> */}
                        <Button
                            type="submit"
                            disabled={authLoading}
                            loading={authLoading}
                            fullWidth
                        >
                            {authLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                        </Button>

                        <div className="register-link">
                            <p>Chưa có tài khoản?</p>
                            <Link to={config.routes.register}>
                                Đăng ký ngay
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
export default Login;
