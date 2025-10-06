import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import { getServerConfig } from "../config/env.js";

// Middleware xác thực token
export const authenticateToken = async (req, res, next) => {
    try {
        // Lấy token từ header Authorization
        const authHeader = req.headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Không tìm thấy token hoặc định dạng token không đúng",
                code: "NO_TOKEN",
            });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token không hợp lệ",
                code: "INVALID_TOKEN",
            });
        }

        // Xác thực token
        const { jwtSecret } = getServerConfig();
        const decoded = jwt.verify(token, jwtSecret);

        // Gắn thông tin user vào request
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Người dùng không tồn tại",
            });
        }

        if (user.is_active !== true) {
            return res.status(403).json({
                success: false,
                message: "Tài khoản đã bị vô hiệu hóa",
            });
        }

        // Gắn thông tin user vào request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Token không hợp lệ",
            });
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token đã hết hạn",
            });
        }

        console.error("Lỗi xác thực token:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server xác thực",
        });
    }
};

// Middleware kiểm tra quyền admin
export const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Vui lòng đăng nhập",
        });
    }
    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Không có quyền truy cập",
        });
    }
    next();
};

// Middleware kiểm tra quyền super admin
export const requireSuperAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Vui lòng đăng nhập",
        });
    }
    if (req.user.role !== "sa") {
        return res.status(403).json({
            success: false,
            message: "Không có quyền truy cập",
        });
    }
    next();
};

// Middleware kiểm tra quyền owner hoặc admin
export const requireOwnerOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Vui lòng đăng nhập",
        });
    }
    const ownerUserId = parseInt(req.params.id || req.params.userId, 10);
    const requesterUserId = req.user.id;
    const isAdmin = req.user.role === "admin" || req.user.role === "sa";
    if (requesterUserId !== ownerUserId && !isAdmin) {
        return res.status(403).json({
            success: false,
            message: "Không có quyền truy cập",
        });
    }
    next();
};

// Middleware tùy chọn xác thực (nếu có token thì xác thực, không có thì bỏ qua)
export const optionalAuth = async (req, res, next) => {
    try {
        let token = req.cookies?.accessToken;
        if (!token) {
            const authHeader = req.headers["authorization"];
            token = authHeader && authHeader.split(" ")[1];
        }
        if (!token) {
            req.user = null;
            return next();
        }
        const { jwtSecret } = getServerConfig();
        const decoded = jwt.verify(token, jwtSecret);
        const user = await User.findById(decoded.id);

        if (user && user.is_active === true) {
            req.user = user;
        } else {
            req.user = null;
        }
    } catch (error) {
        req.user = null;
        next();
    }
};

export const generateTokens = (userId) => {
    const { jwtSecret, jwtRefresh } = getServerConfig();
    const accessToken = jwt.sign({ id: userId }, jwtSecret, {
        expiresIn: "1h", // Increased from 15m to 1h
    });
    const refreshToken = jwt.sign({ id: userId, type: "refresh" }, jwtRefresh, {
        expiresIn: "30d", // Increased from 7d to 30d
    });

    return { accessToken, refreshToken };
};

export const setTokensCookie = (res, tokens) => {
    const isProduction = getServerConfig().nodeEnv;
    res.cookie("accessToken", tokens.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "Lax",
        maxAge: 60 * 60 * 1000, // 1 hour
        path: "/",
    });
    res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "Lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: "/",
    });
};
