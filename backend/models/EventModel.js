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
        return result.rows.map((row) => new Event(row));
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
}

export default Event;
