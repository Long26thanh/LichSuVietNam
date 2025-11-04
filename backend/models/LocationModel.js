import { query } from "../config/db.js";

class Location {
    constructor(locationData) {
        this.id = locationData?.MaDiaDanh;
        this.name = locationData?.TenDiaDanh;
        this.ancient_name = locationData?.TenCo;
        this.modern_name = locationData?.TenHienDai;
        this.description = locationData?.MoTa;
        this.detail = locationData?.ChiTiet;
        this.latitude = locationData?.ViDo;
        this.longitude = locationData?.KinhDo;
        this.location_type_id = locationData?.LoaiDiaDanh;
        this.created_at = locationData?.NgayTao;
        this.updated_at = locationData?.NgayCapNhat;
    }

    // Lấy thông tin tất cả các địa điểm
    static async getAll(options = {}) {
        const { page = 1, limit = 20, search = null, type = "" } = options;
        const offset = (page - 1) * limit;
        const conditions = [];
        const values = [];
        let index = 1;

        if (search) {
            conditions.push(
                `("TenDiaDanh" ILIKE $${index} OR "TenCo" ILIKE $${index} OR "TenHienDai" ILIKE $${index} OR "MoTa" ILIKE $${index})`
            );
            values.push(`%${search}%`);
            index++;
        }

        if (type) {
            conditions.push(`"MaLoaiDiaDanh" = $${index}`);
            values.push(type);
            index++;
        }
        const whereClause = conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

        // Đếm tổng số bản ghi
        const countResult = await query(
            `SELECT COUNT(*) AS total FROM "DiaDanh" ${whereClause}`,
            values.slice(0, index - 1)
        );

        // Lấy dữ liệu phân trang
        const result = await query(
            `SELECT * 
            FROM "DiaDanh" 
            ${whereClause} 
            ORDER BY "TenDiaDanh" ASC 
            LIMIT $${index} OFFSET $${index + 1}`,
            [...values, limit, offset]
        );

        return {
            data: result.rows.map((row) => new Location(row)),
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
            `SELECT * FROM "DiaDanh" WHERE "MaDiaDanh" = $1`,
            [id]
        );
        const row = result.rows[0];
        return row ? new Location(row) : null;
    }

    static async getNameById(id) {
        const result = await query(
            `SELECT "TenDiaDanh" FROM "DiaDanh" WHERE "MaDiaDanh" = $1`,
            [id]
        );
        return result.rows[0]?.TenDiaDanh || null;
    }

    static async create(locationData) {
        // Xử lý latitude và longitude - chuyển chuỗi rỗng thành null
        const latitude =
            locationData.latitude === "" ||
            locationData.latitude === null ||
            locationData.latitude === undefined
                ? null
                : parseFloat(locationData.latitude);
        const longitude =
            locationData.longitude === "" ||
            locationData.longitude === null ||
            locationData.longitude === undefined
                ? null
                : parseFloat(locationData.longitude);

        const result = await query(
            `INSERT INTO "DiaDanh" ("TenDiaDanh", "TenCo", "TenHienDai", "MoTa", "ChiTiet", "ViDo", "KinhDo", "MaLoaiDiaDanh")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [
                locationData.name,
                locationData.ancient_name || null,
                locationData.modern_name || null,
                locationData.description || null,
                locationData.detail || null,
                latitude,
                longitude,
                locationData.location_type || null,
            ]
        );
        return new Location(result.rows[0]);
    }

    static async update(id, locationData) {
        // Xử lý latitude và longitude - chuyển chuỗi rỗng thành null
        const latitude =
            locationData.latitude === "" ||
            locationData.latitude === null ||
            locationData.latitude === undefined
                ? null
                : parseFloat(locationData.latitude);
        const longitude =
            locationData.longitude === "" ||
            locationData.longitude === null ||
            locationData.longitude === undefined
                ? null
                : parseFloat(locationData.longitude);

        const result = await query(
            `UPDATE "DiaDanh" 
            SET "TenDiaDanh" = $1, 
                "TenCo" = $2, 
                "TenHienDai" = $3, 
                "MoTa" = $4, 
                "ChiTiet" = $5, 
                "ViDo" = $6, 
                "KinhDo" = $7, 
                "MaLoaiDiaDanh" = $8,
                "NgayCapNhat" = CURRENT_TIMESTAMP
            WHERE "MaDiaDanh" = $9
            RETURNING *`,
            [
                locationData.name,
                locationData.ancient_name || null,
                locationData.modern_name || null,
                locationData.description || null,
                locationData.detail || null,
                latitude,
                longitude,
                locationData.location_type || null,
                this.id,
            ]
        );

        return result.rows[0] ? new Location(result.rows[0]) : null;
    }

    static async delete(id) {
        const result = await query(
            `DELETE FROM "DiaDanh" WHERE "MaDiaDanh" = $1 RETURNING *`,
            [id]
        );
        return result.rows.length > 0;
    }

    // Thống kê methods
    static async count() {
        try {
            const result = await query(
                `SELECT COUNT(*) as count FROM "DiaDanh"`
            );
            return parseInt(result.rows[0].count, 10);
        } catch (error) {
            console.error("Error counting locations:", error);
            throw error;
        }
    }
}

export default Location;
