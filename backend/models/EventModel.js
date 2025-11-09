import { query } from "../config/db.js";

class Event {
    constructor(eventData) {
        this.id = eventData?.MaSuKien;
        this.name = eventData?.TenSuKien;
        this.startDate = eventData?.NgayBatDau;
        this.startMonth = eventData?.ThangBatDau;
        this.startYear = eventData?.NamBatDau;
        this.endDate = eventData?.NgayKetThuc;
        this.endMonth = eventData?.ThangKetThuc;
        this.endYear = eventData?.NamKetThuc;
        this.description = eventData?.MoTa;
        this.summary = eventData?.TomTat;
        this.locationId = eventData?.MaDiaDanh;
        this.periodId = eventData?.MaThoiKy;
        this.significance = eventData?.YNghia;
        this.created_at = eventData?.NgayTao;
        this.updated_at = eventData?.NgayCapNhat;
        this.related_figures = eventData?.NhanVatLienQuan || [];
    }

    static async getAll(options = {}) {
        const { page = 1, limit = 20, search = "" } = options;
        const offset = (page - 1) * limit;
        const conditions = [];
        const values = [];
        let index = 1;
        if (search) {
            conditions.push(`"TenSuKien" ILIKE $${index}`);
            values.push(`%${search}%`);
            index++;
        }

        const joinClause = `LEFT JOIN "NhanVat_SuKien" 
        ON "SuKien"."MaSuKien" = "NhanVat_SuKien"."MaSuKien" 
        LEFT JOIN "NhanVat" 
        ON "NhanVat_SuKien"."MaNhanVat" = "NhanVat"."MaNhanVat"`;

        const whereClause = conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

        // Đếm tổng số bản ghi
        const countResult = await query(
            `SELECT COUNT(DISTINCT "SuKien"."MaSuKien") AS total FROM "SuKien" ${whereClause}`,
            values.slice(0, index - 1)
        );

        // Lấy dữ liệu phân trang
        const result = await query(
            `SELECT "SuKien".*, 
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id', "NhanVat"."MaNhanVat",
                    'name', "NhanVat"."HoTen"
                )
            ) FILTER (WHERE "NhanVat"."MaNhanVat" IS NOT NULL) AS "NhanVatLienQuan"
            FROM "SuKien"
            ${joinClause}
            ${whereClause}
            GROUP BY "SuKien"."MaSuKien"
            ORDER BY "TenSuKien" ASC 
            LIMIT $${index} OFFSET $${index + 1}`,
            [...values, limit, offset]
        );

        return {
            data: result.rows.map((row) => new Event(row)),
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
            `SELECT "SuKien".*, 
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id', "NhanVat"."MaNhanVat",
                    'name', "NhanVat"."HoTen"
                )
            ) FILTER (WHERE "NhanVat"."MaNhanVat" IS NOT NULL) AS "NhanVatLienQuan"
            FROM "SuKien"
            LEFT JOIN "NhanVat_SuKien" 
            ON "SuKien"."MaSuKien" = "NhanVat_SuKien"."MaSuKien" 
            LEFT JOIN "NhanVat" 
            ON "NhanVat_SuKien"."MaNhanVat" = "NhanVat"."MaNhanVat"
            WHERE "SuKien"."MaSuKien" = $1
            GROUP BY "SuKien"."MaSuKien"`,
            [id]
        );
        const row = result.rows[0];
        return row ? new Event(row) : null;
    }

    static async create(eventData) {
        const result = await query(
            `INSERT INTO "SuKien"
            ("TenSuKien", "NgayBatDau", "ThangBatDau", "NamBatDau", 
            "NgayKetThuc", "ThangKetThuc", "NamKetThuc", "MoTa",
            "TomTat", "MaDiaDanh", "MaThoiKy", "YNghia")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *;`,
            [
                eventData.name,
                eventData.start_date,
                eventData.start_month,
                eventData.start_year,
                eventData.end_date,
                eventData.end_month,
                eventData.end_year,
                eventData.description,
                eventData.summary,
                eventData.location_id,
                eventData.period_id,
                eventData.significance,
            ]
        );
        const related_figures = eventData.related_figures || [];
        for (const figureId of related_figures) {
            await query(
                `INSERT INTO "NhanVat_SuKien" ("MaNhanVat", "MaSuKien")
                VALUES ($1, $2);`,
                [figureId, result.rows[0].MaSuKien]
            );
        }
        return new Event(result.rows[0]);
    }

    async update(eventData) {
        const result = await query(
            `UPDATE "SuKien"
            SET "TenSuKien" = $1,
                "NgayBatDau" = $2,
                "ThangBatDau" = $3,
                "NamBatDau" = $4,
                "NgayKetThuc" = $5,
                "ThangKetThuc" = $6,
                "NamKetThuc" = $7,
                "MoTa" = $8,
                "TomTat" = $9,
                "MaDiaDanh" = $10,
                "MaThoiKy" = $11,
                "YNghia" = $12,
                "NgayCapNhat" = CURRENT_TIMESTAMP
            WHERE "MaSuKien" = $13
            RETURNING *;`,
            [
                eventData.name,
                eventData.start_date,
                eventData.start_month,
                eventData.start_year,
                eventData.end_date,
                eventData.end_month,
                eventData.end_year,
                eventData.description,
                eventData.summary,
                eventData.location_id,
                eventData.period_id,
                eventData.significance,
                this.id,
            ]
        );
        // Cập nhật các nhân vật liên quan
        if (eventData.related_figures) {
            // Xóa các liên kết cũ
            await query(`DELETE FROM "NhanVat_SuKien" WHERE "MaSuKien" = $1;`, [
                this.id,
            ]);
            // Thêm các liên kết mới
            for (const figureId of eventData.related_figures) {
                await query(
                    `INSERT INTO "NhanVat_SuKien" ("MaNhanVat", "MaSuKien")
                    VALUES ($1, $2);`,
                    [figureId, this.id]
                );
            }
        }
        return new Event(result.rows[0]);
    }

    async delete() {
        await query(`DELETE FROM "NhanVat_SuKien" WHERE "MaSuKien" = $1;`, [
            this.id,
        ]);
        await query(`DELETE FROM "SuKien" WHERE "MaSuKien" = $1;`, [this.id]);
        return true;
    }

    // Thống kê methods
    static async count() {
        try {
            const result = await query(
                `SELECT COUNT(*) as count FROM "SuKien"`
            );
            return parseInt(result.rows[0].count, 10);
        } catch (error) {
            console.error("Error counting events:", error);
            throw error;
        }
    }

    // Lấy danh sách sự kiện theo khoảng thời gian
    static async getByDateRange(startDate, endDate) {
        try {
            const result = await query(
                `SELECT 
                    sk."MaSuKien" as id,
                    sk."TenSuKien" as name,
                    sk."NgayTao" as created_date,
                    COALESCE(COUNT(DISTINCT lx."MaLuotXem"), 0) as view_count,
                    COALESCE(COUNT(DISTINCT bl."MaBinhLuan"), 0) as comment_count
                FROM "SuKien" sk
                LEFT JOIN "LuotXem" lx ON sk."MaSuKien" = lx."MaSuKien" AND lx."LoaiTrang" = 'Sự kiện'
                LEFT JOIN "BinhLuan" bl ON sk."MaSuKien" = bl."MaSuKien" AND bl."LoaiTrang" = 'Sự kiện'
                WHERE sk."NgayTao" >= $1 AND sk."NgayTao" <= $2
                GROUP BY sk."MaSuKien", sk."TenSuKien", sk."NgayTao"
                ORDER BY sk."NgayTao" DESC`,
                [startDate, endDate]
            );
            return result.rows;
        } catch (error) {
            console.error("Error getting events by date range:", error);
            throw error;
        }
    }
}

export default Event;
