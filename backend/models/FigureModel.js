import { query } from "../config/db.js";

class Figure {
    constructor(figureData) {
        this.id = figureData?.MaNhanVat;
        this.name = figureData?.HoTen;
        this.birth_year = figureData?.NamSinh;
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

        const result = await query(
            `SELECT * FROM "NhanVat" ${whereClause} ORDER BY "HoTen" ASC LIMIT $${index} OFFSET $${
                index + 1
            }`,
            [...values, limit, offset]
        );
        return result.rows.map((row) => new Figure(row));
    }

    static async getById(id) {
        const result = await query(
            `SELECT * FROM "NhanVat" WHERE "MaNhanVat" = $1`,
            [id]
        );
        const row = result.rows[0];
        return row ? new Figure(row) : null;
    }
}

export default Figure;
