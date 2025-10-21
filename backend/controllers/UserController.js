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
            const { page = 1, limit = 10, q, role, status } = req.query;

            // Lấy role của người dùng hiện tại từ req.user (đã được set bởi middleware auth)
            if (!req.user || !req.user.role) {
                return res.status(401).json({
                    success: false,
                    message: "Không tìm thấy thông tin xác thực người dùng",
                });
            }

            const options = {
                page,
                limit,
                search: q,
                role,
                // Map status query to boolean is_active. Accept both "inactive" and "blocked" as false for compatibility
                is_active:
                    status === "active"
                        ? true
                        : ["inactive", "blocked", "disabled"].includes(
                              status || ""
                          )
                        ? false
                        : undefined,
                currentUserRole: req.user.role, // Truyền role của người dùng hiện tại
            };
            const result = await User.getAllUsers(options);
            return res.json({
                success: true,
                message: "Lấy danh sách người dùng thành công",
                data: result,
            });
        } catch (error) {
            console.error("Lỗi lấy danh sách người dùng:", error);
            return res.status(500).json({
                success: false,
                error: "Lỗi server",
                message: error.message,
            });
        }
    }

    // [GET] /users/:id - Lấy thông tin người dùng theo ID
    async getUserById(req, res) {
        try {
            const userId = req.params.id;
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy người dùng",
                });
            }

            // Loại bỏ password_hash và các thông tin nhạy cảm
            const { password_hash, ...userInfo } = user;

            return res.status(200).json({
                success: true,
                data: userInfo,
            });
        } catch (error) {
            console.error("Lỗi khi lấy thông tin người dùng theo ID:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy thông tin người dùng",
            });
        }
    }

    // [GET] /users/username/:username - Lấy thông tin người dùng theo username
    async getUserByUsername(req, res) {
        try {
            const username = req.params.username;
            const user = await User.findByUsername(username);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy người dùng",
                });
            }

            // Loại bỏ password_hash và các thông tin nhạy cảm
            const { password_hash, ...userInfo } = user;

            return res.status(200).json({
                success: true,
                data: userInfo,
            });
        } catch (error) {
            console.error(
                "Lỗi khi lấy thông tin người dùng theo username:",
                error
            );
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy thông tin người dùng",
            });
        }
    }

    // [GET] /users/email/:email - Lấy thông tin người dùng theo email
    async getUserByEmail(req, res) {
        try {
            const email = req.params.email;
            const user = await User.findByEmail(email);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy người dùng",
                });
            }

            // Loại bỏ password_hash và các thông tin nhạy cảm
            const { password_hash, ...userInfo } = user;

            return res.status(200).json({
                success: true,
                data: userInfo,
            });
        } catch (error) {
            console.error(
                "Lỗi khi lấy thông tin người dùng theo email:",
                error
            );
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy thông tin người dùng",
            });
        }
    }

    // [POST] /users - Tạo người dùng mới
    async create(req, res) {
        try {
            const {
                username,
                email,
                phone,
                birthday,
                address,
                password,
                full_name,
                avatar_url,
                role,
                is_active,
                bio,
            } = req.body;

            // Kiểm tra các trường bắt buộc
            if (!username || !email || !password || !full_name) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng cung cấp đầy đủ thông tin",
                });
            }

            // Convert empty birthday string to null
            const processedBirthday = birthday === "" ? null : birthday;

            // Kiểm tra xem username hoặc email đã tồn tại chưa
            const existingUserByUsername = await User.findByUsername(username);
            if (existingUserByUsername) {
                return res.status(400).json({
                    success: false,
                    message: "Tên đăng nhập đã được sử dụng",
                });
            }

            const existingUserByEmail = await User.findByEmail(email);
            if (existingUserByEmail) {
                return res.status(400).json({
                    success: false,
                    message: "Email đã được sử dụng",
                });
            }

            // Tạo người dùng mới
            const newUser = await User.create({
                username,
                email,
                phone,
                birthday: processedBirthday,
                address,
                password,
                full_name,
                avatar_url,
                role: role || "user",
                is_active: is_active !== undefined ? is_active : true,
                bio,
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
                message: "Lỗi server khi tạo người dùng",
                error: error.message,
            });
        }
    }

    // [PUT] /users/me - Cập nhật thông tin người dùng hiện tại
    async update(req, res) {
        try {
            const userId = req.params?.id || req.user?.id || req.body.id;
            const updateData = req.body;
            console.log("Update data received:", updateData);

            // Loại bỏ các trường không được phép cập nhật
            delete updateData.id;
            delete updateData.created_at;

            // Kiểm tra xem người dùng có tồn tại không
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Người dùng không tồn tại",
                });
            }

            // Cập nhật người dùng
            const updatedUser = await user.update(updateData);

            // Trả về thông tin người dùng đã được cập nhật (loại bỏ các trường nhạy cảm)
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
                is_active: updatedUser.is_active,
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

    // [DELETE] /users/:id - Xóa người dùng theo ID
    async delete(req, res) {
        try {
            const userId = req.params.id;

            // Kiểm tra xem người dùng có tồn tại không
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Người dùng không tồn tại",
                });
            }

            // Xóa người dùng
            await User.delete(userId);

            res.json({
                success: true,
                message: "Xóa người dùng thành công",
            });
        } catch (error) {
            console.error("Lỗi xóa người dùng:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi xóa người dùng",
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
