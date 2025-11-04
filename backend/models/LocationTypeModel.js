import { query } from "../config/db.js";

class LocationType {
    constructor(locationTypeData) {
        this.id = locationTypeData?.MaLoai;
        this.name = locationTypeData?.TenLoai;
    }
    // Lấy thông tin tất cả các loại địa danh
    static async getAll() {
        const result = await query(
            'SELECT * FROM "LoaiDiaDanh" ORDER BY "TenLoai" ASC'
        );
        return result.rows.map((row) => new LocationType(row));
    }

    static async create(locationTypeData) {
        try {
            const result = await query(
                `
                INSERT INTO "LoaiDiaDanh" ("TenLoai")
                VALUES ($1)
                RETURNING *;
            `,
                [locationTypeData.name]
            );
            return new LocationType(result.rows[0]);
        } catch (error) {
            throw new Error(`Lỗi khi tạo loại địa danh: ${error.message}`);
        }
    }

    async update(locationTypeData) {
        try {
            const result = await query(
                `
                UPDATE "LoaiDiaDanh"
                SET "TenLoai" = $1
                WHERE "MaLoai" = $2
                RETURNING *;
            `,
                [locationTypeData.name, this.id]
            );
            return new LocationType(result.rows[0]);
        } catch (error) {
            throw new Error(`Lỗi khi cập nhật loại địa danh: ${error.message}`);
        }
    }

    async delete() {
        try {
            // Đặt MaLoai của các địa danh về NULL trước khi xóa
            await query(
                `
                UPDATE "DiaDanh"
                SET "MaLoaiDiaDanh" = NULL
                WHERE "MaLoaiDiaDanh" = $1;
            `,
                [this.id]
            );

            // Sau đó xóa loại địa danh
            await query(
                `
                DELETE FROM "LoaiDiaDanh"
                WHERE "MaLoai" = $1;
            `,
                [this.id]
            );
            return true;
        } catch (error) {
            throw new Error(`Lỗi khi xóa loại địa danh: ${error.message}`);
        }
    }
}

export default LocationType;
