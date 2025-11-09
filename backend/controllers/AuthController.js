import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import { generateTokens, generateAccessToken } from "../middlewares/auth.js";
import { getServerConfig } from "../config/env.js";

// [Post] /auth/login - Đăng nhập
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp đầy đủ thông tin đăng nhập",
            });
        }

        const user = await User.findByUsername(username);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Tên đăng nhập hoặc mật khẩu không đúng",
            });
        }

        if (user.is_active !== true) {
            return res.status(403).json({
                success: false,
                message: "Tài khoản đã bị vô hiệu hóa",
            });
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Tên đăng nhập hoặc mật khẩu không đúng",
            });
        }

        const tokens = generateTokens(user.id);

        // Lưu refresh token vào HTTP-only cookie (bảo mật hơn)
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,  // Không thể truy cập từ JavaScript
            secure: process.env.NODE_ENV === 'production', // HTTPS only trong production
            sameSite: 'strict', // CSRF protection
            maxAge: tokens.refreshToken.expiresIn,
            path: '/',
        });

        await user.updateLastLogin();
        
        // Chỉ trả về access token, refresh token đã lưu trong cookie
        res.json({
            success: true,
            message: "Đăng nhập thành công",
            user: user.getPublicProfile(),
            tokens: {
                accessToken: tokens.accessToken,
                // Không gửi refreshToken trong response body
            },
        });
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi đăng nhập",
        });
    }
};

// [Post] /auth/logout - Đăng xuất 
export const logout = async (req, res) => {
    try {
        // Xóa refresh token cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
        });
        
        return res.json({
            success: true,
            message: "Đăng xuất thành công",
        });
    } catch (error) {
        console.error("Lỗi đăng xuất:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi đăng xuất",
        });
    }
};

// [Post] /auth/register - Đăng ký
export const register = async (req, res) => {
    try {
        const { username, email, password, full_name } = req.body;

        // Kiểm tra các trường bắt buộc
        if (!username || !email || !password || !full_name) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp đầy đủ thông tin",
            });
        }

        // Tạo người dùng mới
        const newUser = await User.create({
            username,
            email,
            password,
            full_name,
        });
        return res.status(201).json({
            success: true,
            message: "Tạo người dùng thành công",
            data: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                full_name: newUser.full_name,
                role: newUser.role,
                is_active: newUser.is_active,
                created_at: newUser.created_at,
            },
        });
    } catch (error) {
        console.error("Lỗi khi tạo người dùng:", error);
        return res.status(500).json({
            success: false,
            error: "Lỗi server",
            message: error.message,
        });
    }
};

export const refreshToken = (req, res) => {
    try {
        // Lấy refresh token từ cookie (không từ body nữa)
        const refreshToken = req.cookies.refreshToken;
        
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token không tìm thấy",
            });
        }

        // Verify refresh token
        const { jwtRefresh } = getServerConfig();
        const decoded = jwt.verify(refreshToken, jwtRefresh);
        
        if (!decoded || !decoded.id || decoded.type !== "refresh") {
            return res.status(401).json({
                success: false,
                message: "Refresh token không hợp lệ",
            });
        }

        // Tạo mới chỉ access token, giữ nguyên refresh token trong cookie
        const accessToken = generateAccessToken(decoded.id);
        
        return res.json({
            success: true,
            message: "Làm mới token thành công",
            tokens: {
                accessToken,
                // Refresh token vẫn ở trong cookie, không cần gửi lại
            },
        });
    } catch (error) {
        console.error("Lỗi làm mới token:", error);
        
        if (error.name === "TokenExpiredError") {
            // Xóa cookie khi token hết hạn
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
            });
            
            return res.status(401).json({
                success: false,
                message: "Refresh token đã hết hạn",
            });
        }
        
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Refresh token không hợp lệ",
            });
        }
        
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi làm mới token",
        });
    }
};
