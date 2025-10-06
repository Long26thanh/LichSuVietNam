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
        this.is_active = userData?.is_active || true;
        this.bio = userData?.bio;
        this.created_at = userData?.created_at;
        this.updated_at = userData?.updated_at;
        this.last_login = userData?.last_login;
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
                    fields.push(`${key} = $${index}`);
                    values.push(value);
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
}

export default User;
