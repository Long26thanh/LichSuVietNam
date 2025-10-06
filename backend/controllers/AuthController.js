import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import { generateTokens } from "../middlewares/auth.js";
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

        await user.updateLastLogin();
        res.json({
            success: true,
            message: "Đăng nhập thành công",
            user: user.getPublicProfile(),
            tokens,
            expiresIn: 60 * 60 * 1000, // 1 hour in milliseconds
        });
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi đăng nhập",
        });
    }
};

// [Post] /auth/refresh-token - Làm mới token
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token không được cung cấp",
            });
        }

        const { jwtRefresh } = getServerConfig();
        
        try {
            const decoded = jwt.verify(refreshToken, jwtRefresh);
            
            if (decoded.type !== "refresh") {
                return res.status(401).json({
                    success: false,
                    message: "Token không hợp lệ",
                });
            }

            // Kiểm tra user còn tồn tại và active
            const user = await User.findById(decoded.id);
            if (!user || user.is_active !== true) {
                return res.status(401).json({
                    success: false,
                    message: "Người dùng không tồn tại hoặc đã bị vô hiệu hóa",
                });
            }

            // Tạo token mới
            const tokens = generateTokens(user.id);
            
            res.json({
                success: true,
                message: "Làm mới token thành công",
                tokens,
                expiresIn: 60 * 60 * 1000, // 1 hour in milliseconds
            });
        } catch (tokenError) {
            return res.status(401).json({
                success: false,
                message: "Refresh token không hợp lệ hoặc đã hết hạn",
            });
        }
    } catch (error) {
        console.error("Lỗi làm mới token:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi làm mới token",
        });
    }
};

export const logout = async (req, res) => {
    try {
        // Clear cookies if using cookie-based auth
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        
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
