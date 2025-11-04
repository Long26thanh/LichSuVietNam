import { query } from "../config/db.js";
import bcrypt from "bcryptjs";

class User {
    constructor(userData) {
        this.id = userData?.id;
        this.username = userData?.username;
        this.email = userData?.email;
        this.phone = userData?.phone;
        this.birthday = userData?.birthday;
        this.address = userData?.address;
        this.password_hash = userData?.password_hash;
        this.full_name = userData?.full_name;
        this.avatar_url = userData?.avatar_url;
        this.role = userData?.role || "user";
        // Preserve explicit false; only default to true when undefined/null
        this.is_active =
            userData?.is_active === undefined || userData?.is_active === null
                ? true
                : userData.is_active;
        this.bio = userData?.bio;
        this.created_at = userData?.created_at;
        this.updated_at = userData?.updated_at;
        this.last_login = userData?.last_login;
    }

    static async getAll(options = {}) {
        const {
            page = 1,
            limit = 20,
            role = null,
            is_active = undefined,
            search = null,
            currentUserRole = null, // Thêm role của người dùng hiện tại
        } = options;
        const offset = (page - 1) * limit;
        const conditions = [];
        const values = [];
        let index = 1;

        // Nếu không phải SA, không cho phép xem tài khoản SA
        if (currentUserRole !== "sa") {
            conditions.push(`role != 'sa'`);
        }

        // Xây dựng điều kiện truy vấn dựa trên các tham số
        if (role) {
            conditions.push(`role = $${index}`);
            values.push(role);
            index++;
        }

        if (is_active !== undefined && is_active !== null) {
            conditions.push(`is_active = $${index}`);
            values.push(is_active);
            index++;
        }
        if (search) {
            conditions.push(
                `(username ILIKE $${index} OR email ILIKE $${index} OR full_name ILIKE $${index})`
            );
            values.push(`%${search}%`);
            index++;
        }

        const whereClause =
            conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
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
            values.slice(0, -2)
        );

        return {
            data: result.rows.map((row) => new User(row).getPublicProfile()),
            pagination: {
                total: countResult.rows[0].total,
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                totalPages: Math.ceil(countResult.rows[0].total / limit),
            },
        };
    }

    static async create(userData) {
        try {
            const {
                username,
                email,
                phone = null,
                birthday = null,
                address = null,
                password,
                full_name = null,
                avatar_url = null,
                role = "user",
                is_active = true,
                bio = null,
            } = userData;

            // Convert empty birthday string to null
            const processedBirthday = birthday === "" ? null : birthday;

            // Hash mật khẩu
            const password_hash = await bcrypt.hash(password, 10);

            // Chèn người dùng mới vào cơ sở dữ liệu
            const result = await query(
                `
                INSERT INTO users (username, email, phone, birthday, address, password_hash, full_name, avatar_url, role, is_active, bio)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING *
            `,
                [
                    username,
                    email,
                    phone,
                    processedBirthday,
                    address,
                    password_hash,
                    full_name,
                    avatar_url,
                    role,
                    is_active,
                    bio,
                ]
            );

            return new User(result.rows[0]);
        } catch (error) {
            throw new Error(`Lỗi khi tạo người dùng: ${error.message}`);
        }
    }
    // Cập nhật thông tin người dùng
    async update(updateData) {
        try {
            const fields = [];
            const values = [];
            let index = 1;

            // Tự động hash mật khẩu nếu được cập nhật
            if (updateData.password) {
                updateData.password_hash = await bcrypt.hash(
                    updateData.password,
                    10
                );
                delete updateData.password;
            }

            // Duyệt qua các trường trong updateData để xây dựng câu truy vấn
            for (const [key, value] of Object.entries(updateData)) {
                if (value !== undefined && key !== "id") {
                    // Convert empty birthday string to null
                    const processedValue =
                        key === "birthday" && value === "" ? null : value;
                    fields.push(`${key} = $${index}`);
                    values.push(processedValue);
                    index++;
                }
            }

            // Thực hiện truy vấn cập nhật
            const result = await query(
                `
                UPDATE users
                SET ${fields.join(", ")}
                WHERE id = $${index}
                RETURNING *
            `,
                [...values, this.id]
            );

            // Cập nhật thông tin người dùng trong đối tượng
            Object.assign(this, result.rows[0]);
            return this;
        } catch (error) {
            throw new Error(`Lỗi khi cập nhật người dùng: ${error.message}`);
        }
    }

    // Xóa người dùng theo ID
    static async delete(id) {
        try {
            const result = await query(
                `DELETE FROM users WHERE id = $1 RETURNING *`,
                [id]
            );
            return result.rows[0] ? new User(result.rows[0]) : null;
        } catch (error) {
            throw new Error(`Lỗi khi xóa người dùng: ${error.message}`);
        }
    }

    // Cập nhật thời gian đăng nhập cuối cùng
    async updateLastLogin() {
        try {
            await this.update({ last_login: new Date() });
        } catch (error) {
            throw new Error(`Lỗi khi cập nhật last login: ${error.message}`);
        }
        return this;
    }

    // Lấy hồ sơ công khai của người dùng (không bao gồm thông tin nhạy cảm)
    getPublicProfile() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            phone: this.phone,
            birthday: this.birthday,
            address: this.address,
            full_name: this.full_name,
            avatar_url: this.avatar_url,
            role: this.role,
            is_active: this.is_active,
            bio: this.bio,
            created_at: this.created_at,
            last_login: this.last_login,
        };
    }

    // So sánh mật khẩu đã cho với mật khẩu đã băm
    async comparePassword(password) {
        try {
            return await bcrypt.compare(password, this.password_hash);
        } catch (error) {
            throw new Error(`Lỗi khi kiểm tra password: ${error.message}`);
        }
    }

    // Chuyển đổi đối tượng User thành JSON, loại bỏ password_hash
    toJSON() {
        const userObj = { ...this };
        delete userObj.password_hash;
        return userObj;
    }

    // Tìm người dùng theo username
    static async findByUsername(username) {
        const res = await query("SELECT * FROM users WHERE username = $1", [
            username,
        ]);
        return res.rows[0] ? new User(res.rows[0]) : null;
    }

    // Tìm người dùng theo ID
    static async findById(id) {
        try {
            const res = await query("SELECT * FROM users WHERE id = $1", [id]);
            return res.rows[0] ? new User(res.rows[0]) : null;
        } catch (error) {
            console.error("Lỗi khi tìm user theo ID:", error);
            return null;
        }
    }

    // Tìm người dùng theo email
    static async findByEmail(email) {
        try {
            const res = await query("SELECT * FROM users WHERE email = $1", [
                email,
            ]);
            return res.rows[0] ? new User(res.rows[0]) : null;
        } catch (error) {
            console.error("Lỗi khi tìm user theo email:", error);
            return null;
        }
    }

    // Thống kê methods
    static async count() {
        try {
            const result = await query(`SELECT COUNT(*) as count FROM users`);
            return parseInt(result.rows[0].count, 10);
        } catch (error) {
            console.error("Error counting users:", error);
            throw error;
        }
    }

    static async getStatsByDateRange(startDate, endDate) {
        try {
            const result = await query(
                `SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as count,
                    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
                    COUNT(CASE WHEN role = 'user' THEN 1 END) as user_count
                FROM users
                WHERE created_at BETWEEN $1 AND $2
                GROUP BY DATE(created_at)
                ORDER BY date ASC`,
                [startDate, endDate]
            );
            return result.rows;
        } catch (error) {
            console.error("Error getting user stats by date range:", error);
            throw error;
        }
    }
}

export default User;
