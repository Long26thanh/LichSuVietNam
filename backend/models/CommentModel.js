import { query } from "../config/db.js";

class Comment {
    constructor(commentData) {
        this.id = commentData?.MaBinhLuan;
        this.parent_id = commentData?.MaBinhLuanCha;
        this.page_type = commentData?.LoaiTrang;
        this.article_id = commentData?.MaBaiViet;
        this.figure_id = commentData?.MaNhanVat;
        this.period_id = commentData?.MaThoiKy;
        this.event_id = commentData?.MaSuKien;
        this.location_id = commentData?.MaDiaDanh;
        this.content = commentData?.NoiDung;
        this.user_id = commentData?.user_id;
        this.ip_address = commentData?.ip_address;
        this.comment_at = commentData?.comment_at;
    }

    // Lấy tất cả bình luận theo loại trang và ID với phân trang
    static async getByPageTypeAndId(
        pageType,
        pageId,
        parentId = null,
        page = 1,
        limit = 10
    ) {
        try {
            const columnMap = {
                "Bài viết": "MaBaiViet",
                "Nhân vật": "MaNhanVat",
                "Thời kỳ": "MaThoiKy",
                "Sự kiện": "MaSuKien",
                "Địa danh": "MaDiaDanh",
            };

            const column = columnMap[pageType];
            if (!column) {
                throw new Error("Invalid page type");
            }

            const offset = (page - 1) * limit;
            const parentCondition =
                parentId === null
                    ? '"MaBinhLuanCha" IS NULL'
                    : `"MaBinhLuanCha" = $3`;

            // Query để đếm tổng số comments
            const countQuery = `
                SELECT COUNT(*) as total
                FROM "BinhLuan" bl
                WHERE bl."LoaiTrang" = $1 
                    AND bl."${column}" = $2 
                    AND ${parentCondition}
            `;

            const countValues =
                parentId === null
                    ? [pageType, pageId]
                    : [pageType, pageId, parentId];

            const countResult = await query(countQuery, countValues);
            const total = parseInt(countResult.rows[0].total);

            // Query để lấy comments với phân trang
            const queryText = `
                SELECT 
                    "MaBinhLuan",
                    "MaBinhLuanCha",
                    "LoaiTrang",
                    "MaBaiViet",
                    "MaNhanVat",
                    "MaThoiKy",
                    "MaSuKien",
                    "MaDiaDanh",
                    "NoiDung",
                    user_id,
                    ip_address,
                    comment_at
                FROM "BinhLuan"
                WHERE "LoaiTrang" = $1 
                    AND "${column}" = $2 
                    AND ${parentCondition}
                ORDER BY comment_at DESC
                LIMIT $${parentId === null ? 3 : 4} OFFSET $${
                parentId === null ? 4 : 5
            }
            `;

            const values =
                parentId === null
                    ? [pageType, pageId, limit, offset]
                    : [pageType, pageId, parentId, limit, offset];

            const result = await query(queryText, values);

            return {
                comments: result.rows.map((row) => new Comment(row)),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasMore: page * limit < total,
                },
            };
        } catch (error) {
            console.error("Error fetching comments:", error);
            throw error;
        }
    }

    // Lấy các replies của một bình luận
    static async getReplies(commentId) {
        try {
            const queryText = `
                SELECT 
                    "MaBinhLuan",
                    "MaBinhLuanCha",
                    "LoaiTrang",
                    "MaBaiViet",
                    "MaNhanVat",
                    "MaThoiKy",
                    "MaSuKien",
                    "MaDiaDanh",
                    "NoiDung",
                    user_id,
                    ip_address,
                    comment_at
                FROM "BinhLuan"
                WHERE "MaBinhLuanCha" = $1
                ORDER BY comment_at ASC
            `;

            const result = await query(queryText, [commentId]);
            return result.rows.map((row) => new Comment(row));
        } catch (error) {
            console.error("Error fetching replies:", error);
            throw error;
        }
    }

    // Đếm số lượng replies của một comment
    static async getReplyCount(commentId) {
        try {
            const queryText = `
                SELECT COUNT(*) as count
                FROM "BinhLuan"
                WHERE "MaBinhLuanCha" = $1
            `;

            const result = await query(queryText, [commentId]);
            return parseInt(result.rows[0].count) || 0;
        } catch (error) {
            console.error("Error counting replies:", error);
            throw error;
        }
    }

    // Tạo bình luận mới
    static async create(commentData) {
        try {
            const columnMap = {
                "Bài viết": "MaBaiViet",
                "Nhân vật": "MaNhanVat",
                "Thời kỳ": "MaThoiKy",
                "Sự kiện": "MaSuKien",
                "Địa danh": "MaDiaDanh",
            };

            const column = columnMap[commentData.page_type];
            if (!column) {
                throw new Error("Invalid page type");
            }

            const queryText = `
                INSERT INTO "BinhLuan" (
                    "MaBinhLuanCha",
                    "LoaiTrang",
                    "${column}",
                    "NoiDung",
                    user_id,
                    ip_address
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING 
                    "MaBinhLuan",
                    "MaBinhLuanCha",
                    "LoaiTrang",
                    "${column}" as page_id,
                    "NoiDung",
                    user_id,
                    ip_address,
                    comment_at
            `;

            const values = [
                commentData.parent_id || null,
                commentData.page_type,
                commentData.page_id,
                commentData.content,
                commentData.user_id,
                commentData.ip_address,
            ];

            const result = await query(queryText, values);
            return new Comment(result.rows[0]);
        } catch (error) {
            console.error("Error creating comment:", error);
            throw error;
        }
    }

    // Xóa bình luận
    static async delete(commentId, userId) {
        try {
            // Kiểm tra quyền sở hữu
            const checkQuery = `
                SELECT user_id FROM "BinhLuan" WHERE "MaBinhLuan" = $1
            `;
            const checkResult = await query(checkQuery, [commentId]);

            if (checkResult.rows.length === 0) {
                throw new Error("Comment not found");
            }

            if (checkResult.rows[0].user_id !== userId) {
                throw new Error("Unauthorized");
            }

            // Xóa tất cả replies trước
            await query('DELETE FROM "BinhLuan" WHERE "MaBinhLuanCha" = $1', [
                commentId,
            ]);

            // Xóa bình luận chính
            const deleteQuery = `
                DELETE FROM "BinhLuan" WHERE "MaBinhLuan" = $1
            `;
            await query(deleteQuery, [commentId]);

            return true;
        } catch (error) {
            console.error("Error deleting comment:", error);
            throw error;
        }
    }

    // Cập nhật bình luận
    static async update(commentId, userId, content) {
        try {
            // Kiểm tra quyền sở hữu
            const checkQuery = `
                SELECT user_id FROM "BinhLuan" WHERE "MaBinhLuan" = $1
            `;
            const checkResult = await query(checkQuery, [commentId]);

            if (checkResult.rows.length === 0) {
                throw new Error("Comment not found");
            }

            if (checkResult.rows[0].user_id !== userId) {
                throw new Error("Unauthorized");
            }

            const updateQuery = `
                UPDATE "BinhLuan" 
                SET "NoiDung" = $1 
                WHERE "MaBinhLuan" = $2
                RETURNING *
            `;

            const result = await query(updateQuery, [content, commentId]);
            return new Comment(result.rows[0]);
        } catch (error) {
            console.error("Error updating comment:", error);
            throw error;
        }
    }

    // Đếm số lượng bình luận
    static async countByPageTypeAndId(pageType, pageId) {
        try {
            const columnMap = {
                "Bài viết": "MaBaiViet",
                "Nhân vật": "MaNhanVat",
                "Thời kỳ": "MaThoiKy",
                "Sự kiện": "MaSuKien",
                "Địa danh": "MaDiaDanh",
            };

            const column = columnMap[pageType];
            if (!column) {
                throw new Error("Invalid page type");
            }

            const queryText = `
                SELECT COUNT(*) as total
                FROM "BinhLuan"
                WHERE "LoaiTrang" = $1 AND "${column}" = $2
            `;

            const result = await query(queryText, [pageType, pageId]);
            return parseInt(result.rows[0].total);
        } catch (error) {
            console.error("Error counting comments:", error);
            throw error;
        }
    }

    static async countReplyById(commentId) {
        try {
            const queryText = `
                SELECT COUNT(*) as reply_count
                FROM "BinhLuan"
                WHERE "MaBinhLuanCha" = $1
            `;
            const result = await query(queryText, [commentId]);
            return parseInt(result.rows[0].reply_count);
        } catch (error) {
            console.error("Error counting replies:", error);
            throw error;
        }
    }

    // Đếm số lượng comment cho nhiều items cùng lúc
    static async getMultipleCommentCounts(pageType, ids) {
        try {
            if (!ids || ids.length === 0) {
                return {};
            }

            const columnMap = {
                "Bài viết": "MaBaiViet",
                "Nhân vật": "MaNhanVat",
                "Thời kỳ": "MaThoiKy",
                "Sự kiện": "MaSuKien",
                "Địa danh": "MaDiaDanh",
            };

            const column = columnMap[pageType];
            if (!column) {
                throw new Error("Invalid page type");
            }

            const queryText = `
                SELECT "${column}" as id, COUNT(*) as count
                FROM "BinhLuan"
                WHERE "LoaiTrang" = $1 AND "${column}" = ANY($2)
                GROUP BY "${column}"
            `;

            const result = await query(queryText, [pageType, ids]);

            // Chuyển đổi kết quả thành object với key là id
            const counts = {};
            result.rows.forEach((row) => {
                counts[row.id] = parseInt(row.count);
            });

            return counts;
        } catch (error) {
            console.error("Error getting multiple comment counts:", error);
            throw error;
        }
    }

    // Thống kê methods
    static async getTotalComments() {
        try {
            const result = await query(
                `SELECT COUNT(*) as count FROM "BinhLuan"`
            );
            return parseInt(result.rows[0].count, 10);
        } catch (error) {
            console.error("Error getting total comments:", error);
            throw error;
        }
    }

    static async getStatsByDateRange(startDate, endDate) {
        try {
            const result = await query(
                `SELECT 
                    DATE("comment_at") as date,
                    COUNT(*) as count,
                    COUNT(DISTINCT "user_id") as unique_users
                FROM "BinhLuan"
                WHERE "comment_at" BETWEEN $1 AND $2
                GROUP BY DATE("comment_at")
                ORDER BY date ASC`,
                [startDate, endDate]
            );
            return result.rows;
        } catch (error) {
            console.error("Error getting comment stats by date range:", error);
            throw error;
        }
    }

    // Thống kê chi tiết bình luận theo ngày/tháng/năm
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
                    TO_CHAR("comment_at", '${dateFormat}') as period,
                    COUNT(*) as total,
                    COUNT(DISTINCT "user_id") as unique_users,
                    COUNT(CASE WHEN "LoaiTrang" = 'Bài viết' THEN 1 END) as article_comments
                FROM "BinhLuan"
                WHERE "comment_at" BETWEEN $1 AND $2
                GROUP BY period
                ORDER BY period ASC`,
                [startDate, endDate]
            );
            return result.rows;
        } catch (error) {
            console.error("Error getting detailed comment stats by period:", error);
            throw error;
        }
    }

    // Đếm bình luận trong khoảng thời gian
    static async countByDateRange(startDate, endDate) {
        try {
            const result = await query(
                `SELECT COUNT(*) as count FROM "BinhLuan" 
                WHERE "comment_at" BETWEEN $1 AND $2`,
                [startDate, endDate]
            );
            return parseInt(result.rows[0].count, 10);
        } catch (error) {
            console.error("Error counting comments by date range:", error);
            throw error;
        }
    }
}
export default Comment;
