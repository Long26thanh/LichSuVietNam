import { query } from "../config/db.js";

class ViewModel {
    // Ghi nhận lượt xem
    static async recordView({
        loaiTrang,
        maBaiViet,
        maNhanVat,
        maThoiKy,
        maSuKien,
        maDiaDanh,
        userId,
        ipAddress,
    }) {
        try {
            // (debug logs removed)

            const sql = `
                INSERT INTO "LuotXem" 
                ("LoaiTrang", "MaBaiViet", "MaNhanVat", "MaThoiKy", "MaSuKien", "MaDiaDanh", "user_id", "ip_address")
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `;

            const values = [
                loaiTrang,
                maBaiViet || null,
                maNhanVat || null,
                maThoiKy || null,
                maSuKien || null,
                maDiaDanh || null,
                userId || null,
                ipAddress || null,
            ];

            const result = await query(sql, values);
            
            // result returned
            
            return result.rows[0];
        } catch (error) {
            // Nếu trigger bỏ qua (trả về NULL), không coi là lỗi
            if (error.message.includes("null value")) {
                // Trigger skipped duplicate view; swallow silently
                return null;
            }
            console.error('Error recording view:', error);
            throw error;
        }
    }

    // Lấy tổng số lượt xem theo loại trang
    static async getViewCount(loaiTrang, id) {
        try {
            let idColumn;
            switch (loaiTrang) {
                case "Bài viết":
                    idColumn = "MaBaiViet";
                    break;
                case "Nhân vật":
                    idColumn = "MaNhanVat";
                    break;
                case "Thời kỳ":
                    idColumn = "MaThoiKy";
                    break;
                case "Sự kiện":
                    idColumn = "MaSuKien";
                    break;
                case "Địa danh":
                    idColumn = "MaDiaDanh";
                    break;
                case "Website":
                    // Đếm tất cả lượt xem website
                    const websiteSql = `SELECT COUNT(*) as count FROM "LuotXem" WHERE "LoaiTrang" = 'Website'`;
                    const websiteResult = await query(websiteSql);
                    return parseInt(websiteResult.rows[0].count);
                default:
                    return 0;
            }

            const sql = `
                SELECT COUNT(*) as count 
                FROM "LuotXem" 
                WHERE "LoaiTrang" = $1 AND "${idColumn}" = $2
            `;

            const result = await query(sql, [loaiTrang, id]);
            return parseInt(result.rows[0].count);
        } catch (error) {
            throw error;
        }
    }

    // Lấy lượt xem cho nhiều items cùng lúc (tối ưu cho danh sách)
    static async getMultipleViewCounts(loaiTrang, ids) {
        try {
            let idColumn;
            switch (loaiTrang) {
                case "Bài viết":
                    idColumn = "MaBaiViet";
                    break;
                case "Nhân vật":
                    idColumn = "MaNhanVat";
                    break;
                case "Thời kỳ":
                    idColumn = "MaThoiKy";
                    break;
                case "Sự kiện":
                    idColumn = "MaSuKien";
                    break;
                case "Địa danh":
                    idColumn = "MaDiaDanh";
                    break;
                default:
                    return {};
            }

            const sql = `
                SELECT "${idColumn}" as id, COUNT(*) as count 
                FROM "LuotXem" 
                WHERE "LoaiTrang" = $1 AND "${idColumn}" = ANY($2)
                GROUP BY "${idColumn}"
            `;

            const result = await query(sql, [loaiTrang, ids]);

            // Chuyển đổi thành object {id: count}
            const viewCounts = {};
            result.rows.forEach((row) => {
                viewCounts[row.id] = parseInt(row.count);
            });

            return viewCounts;
        } catch (error) {
            throw error;
        }
    }

    // Lấy thống kê lượt xem theo thời gian
    static async getViewStats(loaiTrang, id, days = 7) {
        try {
            let idColumn;
            let whereClause = `"LoaiTrang" = $1`;
            let values = [loaiTrang];

            if (loaiTrang !== "Website") {
                switch (loaiTrang) {
                    case "Bài viết":
                        idColumn = "MaBaiViet";
                        break;
                    case "Nhân vật":
                        idColumn = "MaNhanVat";
                        break;
                    case "Thời kỳ":
                        idColumn = "MaThoiKy";
                        break;
                    case "Sự kiện":
                        idColumn = "MaSuKien";
                        break;
                    case "Địa danh":
                        idColumn = "MaDiaDanh";
                        break;
                }
                whereClause += ` AND "${idColumn}" = $2`;
                values.push(id);
            }

            const sql = `
                SELECT 
                    DATE("viewed_at") as date,
                    COUNT(*) as count
                FROM "LuotXem"
                WHERE ${whereClause}
                    AND "viewed_at" >= CURRENT_DATE - INTERVAL '${days} days'
                GROUP BY DATE("viewed_at")
                ORDER BY date DESC
            `;

            const result = await query(sql, values);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Thống kê methods
    static async getTotalViews() {
        try {
            const result = await query(
                `SELECT COUNT(*) as count FROM "LuotXem"`
            );
            return parseInt(result.rows[0].count, 10);
        } catch (error) {
            console.error("Error getting total views:", error);
            throw error;
        }
    }

    // Đếm lượt truy cập website (chỉ LoaiTrang = 'Website')
    static async getWebsiteVisits() {
        try {
            const result = await query(
                `SELECT COUNT(*) as count FROM "LuotXem" WHERE "LoaiTrang" = 'Website'`
            );
            return parseInt(result.rows[0].count, 10);
        } catch (error) {
            console.error("Error getting website visits:", error);
            throw error;
        }
    }

    static async getStatsByDateRange(startDate, endDate) {
        try {
            const result = await query(
                `SELECT 
                    DATE("viewed_at") as date,
                    COUNT(*) as count,
                    COUNT(DISTINCT "ip_address") as unique_visitors
                FROM "LuotXem"
                WHERE "viewed_at" BETWEEN $1 AND $2
                GROUP BY DATE("viewed_at")
                ORDER BY date ASC`,
                [startDate, endDate]
            );
            return result.rows;
        } catch (error) {
            console.error("Error getting view stats by date range:", error);
            throw error;
        }
    }

    // Thống kê chi tiết lượt xem theo ngày/tháng/năm
    static async getDetailedStatsByPeriod(startDate, endDate, period = "day") {
        try {
            let dateFormat;
            switch (period) {
                case "day":
                    dateFormat = "YYYY-MM-DD";
                    break;
                case "week":
                    dateFormat = "IYYY-IW";
                    break;
                case "month":
                    dateFormat = "YYYY-MM";
                    break;
                case "year":
                    dateFormat = "YYYY";
                    break;
                default:
                    dateFormat = "YYYY-MM-DD";
            }

            const result = await query(
                `SELECT 
                    TO_CHAR("viewed_at", '${dateFormat}') as period,
                    COUNT(*) as total,
                    COUNT(DISTINCT "ip_address") as unique_visitors,
                    COUNT(CASE WHEN "LoaiTrang" = 'Bài viết' THEN 1 END) as article_views,
                    COUNT(CASE WHEN "LoaiTrang" = 'Website' THEN 1 END) as website_views
                FROM "LuotXem"
                WHERE "viewed_at" BETWEEN $1 AND $2
                GROUP BY period
                ORDER BY period ASC`,
                [startDate, endDate]
            );
            return result.rows;
        } catch (error) {
            console.error("Error getting detailed view stats by period:", error);
            throw error;
        }
    }

    // Đếm lượt xem trong khoảng thời gian
    static async countByDateRange(startDate, endDate) {
        try {
            const result = await query(
                `SELECT COUNT(*) as count FROM "LuotXem" 
                WHERE "viewed_at" BETWEEN $1 AND $2`,
                [startDate, endDate]
            );
            return parseInt(result.rows[0].count, 10);
        } catch (error) {
            console.error("Error counting views by date range:", error);
            throw error;
        }
    }
}

export default ViewModel;
