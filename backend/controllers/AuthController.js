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
        });
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi đăng nhập",
        });
    }
};

// [Post] /auth/logout - Đăng xuất (không yêu cầu token hợp lệ)
export const logout = async (req, res) => {
    try {
        // Logout luôn thành công, không cần verify token
        // Vì mục đích là xóa session ở client, dù token hết hạn hay không
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
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Token không hợp lệ",
            });
        }
        const token = authHeader.split(" ")[1];
        const { jwtSecret } = getServerConfig();
        const decoded = jwt.verify(token, jwtSecret);
        if (!decoded || !decoded.userId) {
            return res.status(401).json({
                success: false,
                message: "Token không hợp lệ",
            });
        }
        const tokens = generateTokens(decoded.userId);
        return res.json({
            success: true,
            message: "Làm mới token thành công",
            tokens,
        });
    } catch (error) {
        console.error("Lỗi làm mới token:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi làm mới token",
        });
    }
};
