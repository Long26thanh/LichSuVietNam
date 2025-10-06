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
        this.location_type = locationData?.LoaiDiaDanh;
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
            conditions.push(`"LoaiDiaDanh" = $${index}`);
            values.push(type);
            index++;
        }
        const whereClause = conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

        const result = await query(
            `SELECT * 
            FROM "DiaDanh" 
            ${whereClause} 
            ORDER BY "TenDiaDanh" ASC 
            LIMIT $${index} OFFSET $${index + 1}`,
            [...values, limit, offset]
        );
        return result.rows.map((row) => new Location(row));
    }

    static async getById(id) {
        const result = await query(
            `SELECT * FROM "DiaDanh" WHERE "MaDiaDanh" = $1`,
            [id]
        );
        const row = result.rows[0];
        return row ? new Location(row) : null;
    }

    static async getLocationNameById(id) {
        const result = await query(
            `SELECT "TenDiaDanh" FROM "DiaDanh" WHERE "MaDiaDanh" = $1`,
            [id]
        );
        return result.rows[0]?.TenDiaDanh || null;
    }
}

export default Location;
