import { query } from "../config/db.js";

class Period {
    constructor(periodData) {
        this.id = periodData?.MaThoiKy;
        this.name = periodData?.TenThoiKy;
        this.description = periodData?.MoTa;
        this.summary = periodData?.TomTat;
        this.start_year = periodData?.NamBatDau;
        this.end_year = periodData?.NamKetThuc;
        this.created_at = periodData?.NgayTao;
        this.updated_at = periodData?.NgayCapNhat;
    }

    // Lấy thông tin tất cả các thời kỳ
    static async getAll() {
        const result = await query(
            'SELECT * FROM "ThoiKy" ORDER BY "NamBatDau" ASC'
        );
        return result.rows.map((row) => new Period(row));
    }

    // Lấy thông tin thời kỳ theo ID
    static async getPeriodNameById(id) {
        const result = await query(
            `SELECT "TenThoiKy" FROM "ThoiKy" WHERE "MaThoiKy" = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0].TenThoiKy;
    }

    static async getPeriodById(id) {
        const result = await query(
            `SELECT * FROM "ThoiKy" WHERE "MaThoiKy" = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return null;
        }
        return new Period(result.rows[0]);
    }

    static async getByYearRange(startYear, endYear) {
        const result = await query(
            `SELECT * FROM "ThoiKy" WHERE "NamBatDau" >= $1 AND "NamKetThuc" <= $2 ORDER BY "NamBatDau" ASC`,
            [startYear, endYear]
        );
        return result.rows.map((row) => new Period(row));
    }

    // Tạo mới thời kỳ
    static async create(periodData) {
        const result = await query(
            `
            INSERT INTO "ThoiKy" ("TenThoiKy", "MoTa", "TomTat", "NamBatDau", "NamKetThuc", "NgayTao", "NgayCapNhat")
            VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
            RETURNING *
        `,
            [
                periodData.name,
                periodData.description,
                periodData.summary,
                periodData.start_year,
                periodData.end_year,
            ]
        );
        return new Period(result.rows[0]);
    }

    // Cập nhật thời kỳ
    async update(updateData) {
        const result = await query(
            `
            UPDATE "ThoiKy"
            SET "TenThoiKy" = $1,
                "MoTa" = $2,
                "TomTat" = $3,
                "NamBatDau" = $4,
                "NamKetThuc" = $5,
                "NgayCapNhat" = NOW()
            WHERE "MaThoiKy" = $6
            RETURNING *
        `,
            [
                updateData.name,
                updateData.description,
                updateData.summary,
                updateData.start_year,
                updateData.end_year,
                this.id,
            ]
        );
        return new Period(result.rows[0]);
    }

    // Xóa thời kỳ
    static async delete(id) {
        try {
            const result = await query(
                `DELETE FROM "ThoiKy" WHERE "MaThoiKy" = $1 RETURNING *`,
                [id]
            );
            return result.rows.length > 0;
        } catch (error) {
            console.error("Error deleting period:", error);
            throw error;
        }
    }

    // Tìm kiếm thời kỳ theo tên
    static async searchByName(name) {
        const result = await query(
            `SELECT * FROM "ThoiKy" WHERE "TenThoiKy" ILIKE $1 ORDER BY "NamBatDau" ASC`,
            [`%${name}%`]
        );
        return result.rows.map((row) => new Period(row));
    }
}

export default Period;
