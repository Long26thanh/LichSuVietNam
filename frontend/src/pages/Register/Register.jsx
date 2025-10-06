import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import config from "@/config";
import "./Register.css";

function Register() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Kiểm tra nếu đã đăng nhập thì chuyển hướng
    useEffect(() => {
        const checkAuth = async () => {
            if (isAuthenticated && user) {
                // Đã đăng nhập, chuyển hướng dựa trên role
                if (user.role === 'admin') {
                    // Nếu là admin, chuyển đến admin dashboard
                    navigate(config.routes.adminDashboard, { replace: true });
                } else {
                    // Nếu là user thường, chuyển đến trang chủ
                    navigate(config.routes.home, { replace: true });
                }
                return;
            }
            setIsCheckingAuth(false);
        };

        checkAuth();
    }, [isAuthenticated, user, navigate]);

    // Add class to body when component mounts
    useEffect(() => {
        if (!isCheckingAuth) {
            document.body.classList.add('register-open');
        }
        
        // Cleanup function to remove class when component unmounts
        return () => {
            document.body.classList.remove('register-open');
        };
    }, [isCheckingAuth]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = "Họ và tên là bắt buộc";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = "Email là bắt buộc";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Email không hợp lệ";
        }

        if (!formData.password) {
            newErrors.password = "Mật khẩu là bắt buộc";
        } else if (formData.password.length < 6) {
            newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu không khớp";
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            // Giả lập API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            alert(`Đăng ký thành công cho ${formData.fullName}!`);

            // Reset form
            setFormData({
                fullName: "",
                email: "",
                password: "",
                confirmPassword: "",
            });
        } catch (error) {
            console.error("Lỗi đăng ký:", error);
            alert("Có lỗi xảy ra khi đăng ký. Vui lòng thử lại!");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Hiển thị loading khi đang kiểm tra authentication
    if (isCheckingAuth) {
        return (
            <div className="register-page">
                <div className="register-container">
                    <div className="register-header">
                        <h1>Đang kiểm tra trạng thái đăng nhập...</h1>
                        <p>Vui lòng chờ trong giây lát</p>
                    </div>
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="register-page">
            <div className="register-container">
                <div className="register-header">
                    <h1>Đăng ký tài khoản</h1>
                    <p>Tạo tài khoản mới để khám phá lịch sử Việt Nam</p>
                </div>

                <form className="register-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="fullName" className="form-label">
                            Họ và tên *
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className={`form-input ${
                                errors.fullName ? "input-error" : ""
                            }`}
                            placeholder="Nhập họ và tên của bạn"
                            autoComplete="name"
                        />
                        {errors.fullName && (
                            <span className="error-message">
                                {errors.fullName}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`form-input ${
                                errors.email ? "input-error" : ""
                            }`}
                            placeholder="Nhập địa chỉ email"
                            autoComplete="email"
                        />
                        {errors.email && (
                            <span className="error-message">
                                {errors.email}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Mật khẩu *
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`form-input ${
                                errors.password ? "input-error" : ""
                            }`}
                            placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                            autoComplete="new-password"
                        />
                        {errors.password && (
                            <span className="error-message">
                                {errors.password}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">
                            Xác nhận mật khẩu *
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`form-input ${
                                errors.confirmPassword ? "input-error" : ""
                            }`}
                            placeholder="Nhập lại mật khẩu"
                            autoComplete="new-password"
                        />
                        {errors.confirmPassword && (
                            <span className="error-message">
                                {errors.confirmPassword}
                            </span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
                    </button>

                    <div className="form-footer">
                        <p>
                            Đã có tài khoản?{" "}
                            <a href="/login" className="login-link">
                                Đăng nhập
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;
