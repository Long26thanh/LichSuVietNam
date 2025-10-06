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

    static async getById(id) {
        const result = await query(
            `SELECT * FROM "ThoiKy" WHERE "MaThoiKy" = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return null;
        }
        return new Period(result.rows[0]);
    }

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

    static async getByYearRange(startYear, endYear) {
        const result = await query(
            `SELECT * FROM "ThoiKy" WHERE "NamBatDau" >= $1 AND "NamKetThuc" <= $2 ORDER BY "NamBatDau" ASC`,
            [startYear, endYear]
        );
        return result.rows.map((row) => new Period(row));
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
