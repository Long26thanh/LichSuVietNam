import { query } from "../config/db.js";

class Figure {
    constructor(figureData) {
        this.id = figureData?.MaNhanVat;
        this.name = figureData?.HoTen;
        this.birth_date = figureData?.NgaySinh;
        this.birth_month = figureData?.ThangSinh;
        this.birth_year = figureData?.NamSinh;
        this.death_date = figureData?.NgayMat;
        this.death_month = figureData?.ThangMat;
        this.death_year = figureData?.NamMat;
        this.title = figureData?.ChucDanh;
        this.period_id = figureData?.MaThoiKy;
        this.birth_place_id = figureData?.MaNoiSinh;
        this.death_place_id = figureData?.MaNoiMat;
        this.biography = figureData?.TieuSu;
        this.achievements = figureData?.ThanhTuu;
        this.created_at = figureData?.NgayTao;
        this.updated_at = figureData?.NgayCapNhat;
    }

    static async getAll(options = {}) {
        const { page = 1, limit = 20, search = "" } = options;

        const offset = (page - 1) * limit;
        const conditions = [];
        const values = [];
        let index = 1;

        if (search) {
            conditions.push(`"HoTen" ILIKE $${index}`);
            values.push(`%${search}%`);
            index++;
        }

        const whereClause = conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

        // Đếm tổng số bản ghi
        const countResult = await query(
            `SELECT COUNT(*) AS total FROM "NhanVat" ${whereClause}`,
            values.slice(0, index - 1)
        );

        // Lấy dữ liệu phân trang
        const result = await query(
            `SELECT * FROM "NhanVat" ${whereClause} ORDER BY "HoTen" ASC LIMIT $${index} OFFSET $${
                index + 1
            }`,
            [...values, limit, offset]
        );

        return {
            data: result.rows.map((row) => new Figure(row)),
            pagination: {
                total: parseInt(countResult.rows[0].total),
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(countResult.rows[0].total / limit),
            },
        };
    }

    static async getById(id) {
        const result = await query(
            `SELECT * FROM "NhanVat" WHERE "MaNhanVat" = $1`,
            [id]
        );
        const row = result.rows[0];
        return row ? new Figure(row) : null;
    }

    static async create(figureData) {
        const result = await query(
            `INSERT INTO "NhanVat" 
            ("HoTen", "NgaySinh", "ThangSinh", "NamSinh", "NgayMat", "ThangMat", "NamMat", 
             "ChucDanh", "MaThoiKy", "MaNoiSinh", "MaNoiMat", "TieuSu", "ThanhTuu", "NgayTao", "NgayCapNhat")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
            RETURNING *`,
            [
                figureData.name,
                figureData.birth_date,
                figureData.birth_month,
                figureData.birth_year,
                figureData.death_date,
                figureData.death_month,
                figureData.death_year,
                figureData.title,
                figureData.period_id,
                figureData.birth_place_id,
                figureData.death_place_id,
                figureData.biography,
                figureData.achievements,
            ]
        );

        return new Figure(result.rows[0]);
    }

    async update(figureData) {
        const result = await query(
            `UPDATE "NhanVat"
            SET "HoTen" = $1, 
                "NgaySinh" = $2, "ThangSinh" = $3, "NamSinh" = $4,
                "NgayMat" = $5, "ThangMat" = $6, "NamMat" = $7,
                "ChucDanh" = $8, "MaThoiKy" = $9, 
                "MaNoiSinh" = $10, "MaNoiMat" = $11,
                "TieuSu" = $12, "ThanhTuu" = $13, "NgayCapNhat" = NOW()
            WHERE "MaNhanVat" = $14
            RETURNING *`,
            [
                figureData.name,
                figureData.birth_date,
                figureData.birth_month,
                figureData.birth_year,
                figureData.death_date,
                figureData.death_month,
                figureData.death_year,
                figureData.title,
                figureData.period_id,
                figureData.birth_place_id,
                figureData.death_place_id,
                figureData.biography,
                figureData.achievements,
                this.id,
            ]
        );

        return result.rows[0] ? new Figure(result.rows[0]) : null;
    }

    static async delete(id) {
        const result = await query(
            `DELETE FROM "NhanVat" WHERE "MaNhanVat" = $1 RETURNING *`,
            [id]
        );
        await query(`DELETE FROM "NhanVat_SuKien" WHERE "MaNhanVat" = $1;`, [
            id,
        ]);
        return result.rows[0] ? new Figure(result.rows[0]) : null;
    }

    // Thống kê methods
    static async count() {
        try {
            const result = await query(
                `SELECT COUNT(*) as count FROM "NhanVat"`
            );
            return parseInt(result.rows[0].count, 10);
        } catch (error) {
            console.error("Error counting figures:", error);
            throw error;
        }
    }

    // Lấy danh sách nhân vật theo khoảng thời gian
    static async getByDateRange(startDate, endDate) {
        try {
            const result = await query(
                `SELECT 
                    nv."MaNhanVat" as id,
                    nv."HoTen" as name,
                    nv."ChucDanh" as title,
                    nv."NgayTao" as created_date,
                    COALESCE(COUNT(DISTINCT lx."MaLuotXem"), 0) as view_count,
                    COALESCE(COUNT(DISTINCT bl."MaBinhLuan"), 0) as comment_count
                FROM "NhanVat" nv
                LEFT JOIN "LuotXem" lx ON nv."MaNhanVat" = lx."MaNhanVat" AND lx."LoaiTrang" = 'Nhân vật'
                LEFT JOIN "BinhLuan" bl ON nv."MaNhanVat" = bl."MaNhanVat" AND bl."LoaiTrang" = 'Nhân vật'
                WHERE nv."NgayTao" >= $1 AND nv."NgayTao" <= $2
                GROUP BY nv."MaNhanVat", nv."HoTen", nv."ChucDanh", nv."NgayTao"
                ORDER BY nv."NgayTao" DESC`,
                [startDate, endDate]
            );
            return result.rows;
        } catch (error) {
            console.error("Error getting figures by date range:", error);
            throw error;
        }
    }
}

export default Figure;
