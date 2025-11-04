import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { validateUsername, validateEmail, validatePassword } from "@/utils";
import { authService, userService } from "@/services";
import config from "@/config";
import "./Register.css";

function Register() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, login } = useAuth();
    const [formData, setFormData] = useState({
        username: "",
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
                if (user.role === "user") {
                    // Nếu là user thường, chuyển đến trang chủ
                    navigate(config.routes.home, { replace: true });
                }
                return;
            }
            setIsCheckingAuth(false);
        };

        checkAuth();
    }, [isAuthenticated, user, navigate]);

    // Thêm class vào body khi component mount
    useEffect(() => {
        if (!isCheckingAuth) {
            document.body.classList.add("register-open");
        }

        // Dọn dẹp class khi component unmount
        return () => {
            document.body.classList.remove("register-open");
        };
    }, [isCheckingAuth]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Xóa lỗi khi người dùng sửa input
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        const { username, email, password, confirmPassword } = formData;
        if (!validateUsername(username)) {
            newErrors.username =
                "Tên người dùng chỉ chứa chữ cái, số, gạch dưới và từ 3-30 ký tự";
        }

        if (!validateEmail(email)) {
            newErrors.email = "Vui lòng nhập email hợp lệ";
        }

        if (!validatePassword(password)) {
            newErrors.password =
                "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số";
        }

        if (confirmPassword !== password) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }

        if (confirmPassword.trim() === "") {
            newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
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

        // Kiểm tra tồn tại username/email trên server (async)
        try {
            const [usernameRes, emailRes] = await Promise.all([
                userService.getUserByUsername(formData.username),
                userService.getUserByEmail(formData.email),
            ]);

            if (usernameRes && usernameRes.success && usernameRes.data) {
                setErrors({ username: "Tên người dùng đã tồn tại" });
                return;
            }

            if (emailRes && emailRes.success && emailRes.data) {
                setErrors({ email: "Email đã được sử dụng" });
                return;
            }
        } catch (err) {
            console.error("Error checking username/email existence:", err);
            // Nếu có lỗi khi gọi API, tiếp tục và để backend trả lỗi chính xác
        }

        setIsSubmitting(true);
        try {
            await authService.register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                full_name: formData.username,
            });

            // Sử dụng login từ AuthContext thay vì trực tiếp từ authService
            await login(
                {
                    username: formData.username,
                    password: formData.password,
                },
                "user"
            );

            navigate(config.routes.home, { replace: true });
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
                        <label htmlFor="username" className="form-label">
                            Tên người dùng *
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={`form-input ${
                                errors.username ? "input-error" : ""
                            }`}
                            placeholder="Nhập tên người dùng của bạn"
                            autoComplete="name"
                        />
                        {errors.username && (
                            <span className="error-message">
                                {errors.username}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email *
                        </label>
                        <input
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
