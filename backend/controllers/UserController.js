import User from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/db.js";
class UserController {
    // [GET] /api/me - Lấy thông tin người dùng hiện tại
    async getProfile(req, res) {
        try {
            // Kiểm tra xem có user trong request không
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: "Không tìm thấy thông tin xác thực",
                });
            }

            const userId = req.user.id;
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy thông tin người dùng",
                });
            }

            // Loại bỏ password_hash và các thông tin nhạy cảm
            const { password_hash, ...userInfo } = user;

            return res.status(200).json({
                success: true,
                data: userInfo,
            });
        } catch (error) {
            console.error("Lỗi khi lấy thông tin người dùng:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy thông tin người dùng",
            });
        }
    }

    // [Get] /users - Lấy danh sách người dùng với phân trang và lọc
    async getAllUsers(req, res) {
        try {
            const { page = 1, limit = 10, role, is_active, search } = req.query;
            const offset = (page - 1) * limit;
            const conditions = [];
            const values = [];
            let index = 1;

            // Xây dựng điều kiện truy vấn dựa trên các tham số
            if (role) {
                conditions.push(`role = $${index}`);
                values.push(role);
                index++;
            }
            // is_active có thể là true, false hoặc undefined
            if (is_active !== undefined) {
                conditions.push(`is_active = $${index}`);
                values.push(is_active === "true" || is_active === true);
                index++;
            }
            // Tìm kiếm theo username, email hoặc full_name
            if (search) {
                conditions.push(
                    `(username ILIKE $${index} OR email ILIKE $${index} OR full_name ILIKE $${index})`
                );
                values.push(`%${search}%`);
                index++;
            }
            const whereClause =
                conditions.length > 0
                    ? `WHERE ${conditions.join(" AND ")}`
                    : "";
            values.push(limit, offset);
            const result = await query(
                `
                SELECT id, username, email, full_name, avatar_url, role, is_active, bio, created_at, updated_at, last_login
                FROM users
                ${whereClause}
                ORDER BY created_at DESC
                LIMIT $${index} OFFSET $${index + 1}
            `,
                values
            );
            const countResult = await query(
                `
                SELECT COUNT(*) AS total
                FROM users
                ${whereClause}
            `,
                values.slice(0, -2) // Loại bỏ limit và offset
            );
            return res.json({
                success: true,
                data: result.rows.map((row) =>
                    new User(row).getPublicProfile()
                ),
                pagination: {
                    total: countResult.rows[0].total,
                    page: parseInt(page, 10),
                    limit: parseInt(limit, 10),
                    totalPages: Math.ceil(countResult.rows[0].total / limit),
                },
            });
        } catch (error) {
            console.error("Lỗi lấy danh sách người dùng:", error);
            return res.status(500).json({ error: "Lỗi server" });
        }
    }
    // // [Get] /users/me - Lấy thông tin người dùng hiện tại
    // async getProfile(req, res) {
    //     try {
    //         const user = req.user;
    //         if (!user) {
    //             return res.status(404).json({
    //                 success: false,
    //                 message: "Người dùng không tồn tại",
    //             });
    //         }

    //         const userResponse = {
    //             id: user.id,
    //             username: user.username,
    //             email: user.email,
    //             full_name: user.full_name,
    //             role: user.role,
    //             avatar_url: user.avatar_url,
    //             last_login: user.last_login,
    //         };

    //         // Kiểm tra nếu có token trong header Authorization
    //         let accessToken = null;
    //         const authHeader = req.headers["authorization"];
    //         if (authHeader && authHeader.startsWith("Bearer ")) {
    //             accessToken = authHeader.split(" ")[1];
    //         }

    //         const response = {
    //             success: true,
    //             message: "Lấy thông tin người dùng thành công",
    //             user: userResponse,
    //         };

    //         // Nếu có token, thêm vào phản hồi
    //         if (accessToken) {
    //             response.accessToken = accessToken;
    //         }

    //         res.json(response);
    //     } catch (error) {
    //         console.error("Lỗi lấy thông tin người dùng:", error);
    //         return res.status(500).json({
    //             success: false,
    //             message: "Lỗi server",
    //             error: error.message,
    //         });
    //     }
    // }

    // [PUT] /users/me - Cập nhật thông tin người dùng hiện tại
    async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const updateData = req.body;

            // Remove sensitive fields that shouldn't be updated via this endpoint
            delete updateData.id;
            delete updateData.password;
            delete updateData.password_hash;
            delete updateData.role;
            delete updateData.created_at;
            delete updateData.updated_at;

            // Add updated_at timestamp
            updateData.updated_at = new Date();

            // Find user and update
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Người dùng không tồn tại",
                });
            }

            // Update user data
            const updatedUser = await user.update(updateData);

            // Return updated user info (without sensitive data)
            const userResponse = {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                full_name: updatedUser.full_name,
                avatar_url: updatedUser.avatar_url,
                bio: updatedUser.bio,
                phone: updatedUser.phone,
                location: updatedUser.location,
                birth_date: updatedUser.birth_date,
                role: updatedUser.role,
                updated_at: updatedUser.updated_at,
            };

            res.json({
                success: true,
                message: "Cập nhật thông tin thành công",
                user: userResponse,
            });
        } catch (error) {
            console.error("Lỗi cập nhật thông tin người dùng:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi cập nhật thông tin",
                error: error.message,
            });
        }
    }

    // [GET] /users/me/stats - Lấy thống kê người dùng
    async getUserStats(req, res) {
        try {
            const userId = req.user.id;

            // For now, return mock data. In the future, you can implement real statistics
            const stats = {
                saved_posts: 0,
                favorite_events: 0,
                favorite_figures: 0,
                visited_locations: 0,
            };

            res.json({
                success: true,
                message: "Lấy thống kê thành công",
                data: stats,
            });
        } catch (error) {
            console.error("Lỗi lấy thống kê người dùng:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy thống kê",
                error: error.message,
            });
        }
    }
}

export default new UserController();
