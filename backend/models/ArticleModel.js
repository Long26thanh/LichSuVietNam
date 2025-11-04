import { query } from "../config/db.js";

class Article {
    constructor(articleData) {
        this.id = articleData?.MaBaiViet;
        this.title = articleData?.TieuDe;
        this.content = articleData?.NoiDung;
        this.coverImage = articleData?.AnhBia;
        this.authorId = articleData?.MaTacGia;
        this.authorName = articleData?.TacGia; // Tên tác giả từ JOIN
        this.status = articleData?.TrangThai;
        this.publishedAt = articleData?.NgayXuatBan;
        this.createdAt = articleData?.NgayTao;
        this.updatedAt = articleData?.NgayCapNhat;
        // Xử lý các quan hệ
        this.relations = {
            figures: articleData?.NhanVat || [],
            periods: articleData?.ThoiKy || [],
            events: articleData?.SuKien || [],
            locations: articleData?.DiaDanh || [],
        };
    }

    static async getAll(options = {}) {
        const { page = 1, limit = 20, search = "", status = "" } = options;
        const offset = (page - 1) * limit;
        const conditions = [];
        const values = [];
        let index = 1;
        if (search) {
            conditions.push(`"BaiViet"."TieuDe" ILIKE $${index}`);
            values.push(`%${search}%`);
            index++;
        }
        if (status) {
            conditions.push(`"BaiViet"."TrangThai" = $${index}`);
            values.push(status);
            index++;
        }
        const whereClause = conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";
        // Đếm tổng số bản ghi
        const countResult = await query(
            `SELECT COUNT(DISTINCT "BaiViet"."MaBaiViet") AS total FROM "BaiViet" ${whereClause}`,
            values.slice(0, index - 1)
        );
        // Lấy dữ liệu phân trang với các quan hệ
        const result = await query(
            `SELECT "BaiViet".*,
            users.full_name AS "TacGia",
            JSON_AGG(
                DISTINCT JSONB_BUILD_OBJECT(
                    'id', "NhanVat"."MaNhanVat",
                    'name', "NhanVat"."HoTen"
                )
            ) FILTER (WHERE "NhanVat"."MaNhanVat" IS NOT NULL) AS "NhanVat",
            JSON_AGG(
                DISTINCT JSONB_BUILD_OBJECT(
                    'id', "ThoiKy"."MaThoiKy",
                    'name', "ThoiKy"."TenThoiKy"
                )
            ) FILTER (WHERE "ThoiKy"."MaThoiKy" IS NOT NULL) AS "ThoiKy",
            JSON_AGG(
                DISTINCT JSONB_BUILD_OBJECT(
                    'id', "SuKien"."MaSuKien",
                    'name', "SuKien"."TenSuKien"
                )
            ) FILTER (WHERE "SuKien"."MaSuKien" IS NOT NULL) AS "SuKien",
            JSON_AGG(
                DISTINCT JSONB_BUILD_OBJECT(
                    'id', "DiaDanh"."MaDiaDanh",
                    'name', "DiaDanh"."TenDiaDanh"
                )
            ) FILTER (WHERE "DiaDanh"."MaDiaDanh" IS NOT NULL) AS "DiaDanh"
            FROM "BaiViet"
            LEFT JOIN users ON "BaiViet"."MaTacGia" = users.id
            LEFT JOIN "BaiViet_NhanVat" ON "BaiViet"."MaBaiViet" = "BaiViet_NhanVat"."MaBaiViet"
            LEFT JOIN "NhanVat" ON "BaiViet_NhanVat"."MaNhanVat" = "NhanVat"."MaNhanVat"
            LEFT JOIN "BaiViet_ThoiKy" ON "BaiViet"."MaBaiViet" = "BaiViet_ThoiKy"."MaBaiViet"
            LEFT JOIN "ThoiKy" ON "BaiViet_ThoiKy"."MaThoiKy" = "ThoiKy"."MaThoiKy"
            LEFT JOIN "BaiViet_SuKien" ON "BaiViet"."MaBaiViet" = "BaiViet_SuKien"."MaBaiViet"
            LEFT JOIN "SuKien" ON "BaiViet_SuKien"."MaSuKien" = "SuKien"."MaSuKien"
            LEFT JOIN "BaiViet_DiaDanh" ON "BaiViet"."MaBaiViet" = "BaiViet_DiaDanh"."MaBaiViet"
            LEFT JOIN "DiaDanh" ON "BaiViet_DiaDanh"."MaDiaDanh" = "DiaDanh"."MaDiaDanh"
            ${whereClause}
            GROUP BY "BaiViet"."MaBaiViet", users.full_name
            ORDER BY "BaiViet"."TieuDe" ASC 
            LIMIT $${index} OFFSET $${index + 1}`,
            [...values, limit, offset]
        );
        return {
            data: result.rows.map((row) => new Article(row)),
            pagination: {
                total: parseInt(countResult.rows[0].total),
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(countResult.rows[0].total / limit),
            },
        };
    }

    // Hàm lấy bài viết theo authorId
    static async getByAuthor(authorId, options = {}) {
        const { page = 1, limit = 20, search = "", status = "" } = options;
        const offset = (page - 1) * limit;
        const conditions = [`"BaiViet"."MaTacGia" = $1`];
        const values = [authorId];
        let index = 2;

        if (search) {
            conditions.push(`"BaiViet"."TieuDe" ILIKE $${index}`);
            values.push(`%${search}%`);
            index++;
        }

        if (status) {
            conditions.push(`"BaiViet"."TrangThai" = $${index}`);
            values.push(status);
            index++;
        }

        const whereClause = `WHERE ${conditions.join(" AND ")}`;

        // Đếm tổng số bản ghi của author
        const countResult = await query(
            `SELECT COUNT(DISTINCT "BaiViet"."MaBaiViet") AS total FROM "BaiViet" ${whereClause}`,
            values.slice(0, index - 1)
        );

        // Lấy dữ liệu phân trang với các quan hệ
        const result = await query(
            `SELECT "BaiViet".*,
            users.full_name AS "TacGia",
            JSON_AGG(
                DISTINCT JSONB_BUILD_OBJECT(
                    'id', "NhanVat"."MaNhanVat",
                    'name', "NhanVat"."HoTen"
                )
            ) FILTER (WHERE "NhanVat"."MaNhanVat" IS NOT NULL) AS "NhanVat",
            JSON_AGG(
                DISTINCT JSONB_BUILD_OBJECT(
                    'id', "ThoiKy"."MaThoiKy",
                    'name', "ThoiKy"."TenThoiKy"
                )
            ) FILTER (WHERE "ThoiKy"."MaThoiKy" IS NOT NULL) AS "ThoiKy",
            JSON_AGG(
                DISTINCT JSONB_BUILD_OBJECT(
                    'id', "SuKien"."MaSuKien",
                    'name', "SuKien"."TenSuKien"
                )
            ) FILTER (WHERE "SuKien"."MaSuKien" IS NOT NULL) AS "SuKien",
            JSON_AGG(
                DISTINCT JSONB_BUILD_OBJECT(
                    'id', "DiaDanh"."MaDiaDanh",
                    'name', "DiaDanh"."TenDiaDanh"
                )
            ) FILTER (WHERE "DiaDanh"."MaDiaDanh" IS NOT NULL) AS "DiaDanh"
            FROM "BaiViet"
            LEFT JOIN users ON "BaiViet"."MaTacGia" = users.id
            LEFT JOIN "BaiViet_NhanVat" ON "BaiViet"."MaBaiViet" = "BaiViet_NhanVat"."MaBaiViet"
            LEFT JOIN "NhanVat" ON "BaiViet_NhanVat"."MaNhanVat" = "NhanVat"."MaNhanVat"
            LEFT JOIN "BaiViet_ThoiKy" ON "BaiViet"."MaBaiViet" = "BaiViet_ThoiKy"."MaBaiViet"
            LEFT JOIN "ThoiKy" ON "BaiViet_ThoiKy"."MaThoiKy" = "ThoiKy"."MaThoiKy"
            LEFT JOIN "BaiViet_SuKien" ON "BaiViet"."MaBaiViet" = "BaiViet_SuKien"."MaBaiViet"
            LEFT JOIN "SuKien" ON "BaiViet_SuKien"."MaSuKien" = "SuKien"."MaSuKien"
            LEFT JOIN "BaiViet_DiaDanh" ON "BaiViet"."MaBaiViet" = "BaiViet_DiaDanh"."MaBaiViet"
            LEFT JOIN "DiaDanh" ON "BaiViet_DiaDanh"."MaDiaDanh" = "DiaDanh"."MaDiaDanh"
            ${whereClause}
            GROUP BY "BaiViet"."MaBaiViet", users.full_name
            ORDER BY "BaiViet"."NgayTao" DESC, "BaiViet"."TieuDe" ASC 
            LIMIT $${index} OFFSET $${index + 1}`,
            [...values, limit, offset]
        );

        return {
            data: result.rows.map((row) => new Article(row)),
            pagination: {
                total: parseInt(countResult.rows[0].total),
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(countResult.rows[0].total / limit),
            },
        };
    }

    // Hàm lấy chỉ các bài viết đã xuất bản (public)
    static async getPublished(options = {}) {
        const { page = 1, limit = 20, search = "" } = options;
        const offset = (page - 1) * limit;
        const conditions = [`"BaiViet"."TrangThai" = 'Đã xuất bản'`];
        const values = [];
        let index = 1;

        if (search) {
            conditions.push(`"BaiViet"."TieuDe" ILIKE $${index}`);
            values.push(`%${search}%`);
            index++;
        }

        const whereClause = `WHERE ${conditions.join(" AND ")}`;

        // Đếm tổng số bản ghi đã xuất bản
        const countResult = await query(
            `SELECT COUNT(DISTINCT "BaiViet"."MaBaiViet") AS total FROM "BaiViet" ${whereClause}`,
            values.slice(0, index - 1)
        );

        // Lấy dữ liệu phân trang với các quan hệ (chỉ bài viết đã xuất bản)
        const result = await query(
            `SELECT "BaiViet".*,
            users.full_name AS "TacGia",
            JSON_AGG(
                DISTINCT JSONB_BUILD_OBJECT(
                    'id', "NhanVat"."MaNhanVat",
                    'name', "NhanVat"."HoTen"
                )
            ) FILTER (WHERE "NhanVat"."MaNhanVat" IS NOT NULL) AS "NhanVat",
            JSON_AGG(
                DISTINCT JSONB_BUILD_OBJECT(
                    'id', "ThoiKy"."MaThoiKy",
                    'name', "ThoiKy"."TenThoiKy"
                )
            ) FILTER (WHERE "ThoiKy"."MaThoiKy" IS NOT NULL) AS "ThoiKy",
            JSON_AGG(
                DISTINCT JSONB_BUILD_OBJECT(
                    'id', "SuKien"."MaSuKien",
                    'name', "SuKien"."TenSuKien"
                )
            ) FILTER (WHERE "SuKien"."MaSuKien" IS NOT NULL) AS "SuKien",
            JSON_AGG(
                DISTINCT JSONB_BUILD_OBJECT(
                    'id', "DiaDanh"."MaDiaDanh",
                    'name', "DiaDanh"."TenDiaDanh"
                )
            ) FILTER (WHERE "DiaDanh"."MaDiaDanh" IS NOT NULL) AS "DiaDanh"
            FROM "BaiViet"
            LEFT JOIN users ON "BaiViet"."MaTacGia" = users.id
            LEFT JOIN "BaiViet_NhanVat" ON "BaiViet"."MaBaiViet" = "BaiViet_NhanVat"."MaBaiViet"
            LEFT JOIN "NhanVat" ON "BaiViet_NhanVat"."MaNhanVat" = "NhanVat"."MaNhanVat"
            LEFT JOIN "BaiViet_ThoiKy" ON "BaiViet"."MaBaiViet" = "BaiViet_ThoiKy"."MaBaiViet"
            LEFT JOIN "ThoiKy" ON "BaiViet_ThoiKy"."MaThoiKy" = "ThoiKy"."MaThoiKy"
            LEFT JOIN "BaiViet_SuKien" ON "BaiViet"."MaBaiViet" = "BaiViet_SuKien"."MaBaiViet"
            LEFT JOIN "SuKien" ON "BaiViet_SuKien"."MaSuKien" = "SuKien"."MaSuKien"
            LEFT JOIN "BaiViet_DiaDanh" ON "BaiViet"."MaBaiViet" = "BaiViet_DiaDanh"."MaBaiViet"
            LEFT JOIN "DiaDanh" ON "BaiViet_DiaDanh"."MaDiaDanh" = "DiaDanh"."MaDiaDanh"
            ${whereClause}
            GROUP BY "BaiViet"."MaBaiViet", users.full_name
            ORDER BY "BaiViet"."NgayXuatBan" DESC, "BaiViet"."TieuDe" ASC 
            LIMIT $${index} OFFSET $${index + 1}`,
            [...values, limit, offset]
        );

        return {
            data: result.rows.map((row) => new Article(row)),
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
            `SELECT "BaiViet".*,
            users.full_name AS "TacGia",
            JSON_AGG(
                DISTINCT JSONB_BUILD_OBJECT(
                    'id', "NhanVat"."MaNhanVat",
                    'name', "NhanVat"."HoTen"
                )
            ) FILTER (WHERE "NhanVat"."MaNhanVat" IS NOT NULL) AS "NhanVat",
            JSON_AGG(
                DISTINCT JSONB_BUILD_OBJECT(
                    'id', "ThoiKy"."MaThoiKy",
                    'name', "ThoiKy"."TenThoiKy"
                )
            ) FILTER (WHERE "ThoiKy"."MaThoiKy" IS NOT NULL) AS "ThoiKy",
            JSON_AGG(
                DISTINCT JSONB_BUILD_OBJECT(
                    'id', "SuKien"."MaSuKien",
                    'name', "SuKien"."TenSuKien"
                )
            ) FILTER (WHERE "SuKien"."MaSuKien" IS NOT NULL) AS "SuKien",
            JSON_AGG(
                DISTINCT JSONB_BUILD_OBJECT(
                    'id', "DiaDanh"."MaDiaDanh",
                    'name', "DiaDanh"."TenDiaDanh"
                )
            ) FILTER (WHERE "DiaDanh"."MaDiaDanh" IS NOT NULL) AS "DiaDanh"
            FROM "BaiViet"
            LEFT JOIN users ON "BaiViet"."MaTacGia" = users.id
            LEFT JOIN "BaiViet_NhanVat" ON "BaiViet"."MaBaiViet" = "BaiViet_NhanVat"."MaBaiViet"
            LEFT JOIN "NhanVat" ON "BaiViet_NhanVat"."MaNhanVat" = "NhanVat"."MaNhanVat"
            LEFT JOIN "BaiViet_ThoiKy" ON "BaiViet"."MaBaiViet" = "BaiViet_ThoiKy"."MaBaiViet"
            LEFT JOIN "ThoiKy" ON "BaiViet_ThoiKy"."MaThoiKy" = "ThoiKy"."MaThoiKy"
            LEFT JOIN "BaiViet_SuKien" ON "BaiViet"."MaBaiViet" = "BaiViet_SuKien"."MaBaiViet"
            LEFT JOIN "SuKien" ON "BaiViet_SuKien"."MaSuKien" = "SuKien"."MaSuKien"
            LEFT JOIN "BaiViet_DiaDanh" ON "BaiViet"."MaBaiViet" = "BaiViet_DiaDanh"."MaBaiViet"
            LEFT JOIN "DiaDanh" ON "BaiViet_DiaDanh"."MaDiaDanh" = "DiaDanh"."MaDiaDanh"
            WHERE "BaiViet"."MaBaiViet" = $1
            GROUP BY "BaiViet"."MaBaiViet", users.full_name`,
            [id]
        );
        const row = result.rows[0];
        return row ? new Article(row) : null;
    }

    static async create(articleData) {
        // Tự động set NgayXuatBan nếu status là 'Đã xuất bản'
        const publishedAt =
            articleData.status === "Đã xuất bản"
                ? new Date()
                : articleData.published_at || null;

        const result = await query(
            `INSERT INTO "BaiViet" ("TieuDe", "NoiDung", "AnhBia", "MaTacGia", "TrangThai", "NgayXuatBan", "NgayTao", "NgayCapNhat")
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            RETURNING *`,
            [
                articleData.title,
                articleData.content,
                articleData.coverImage || null,
                articleData.authorId || null,
                articleData.status,
                publishedAt,
            ]
        );
        // Xử lý các quan hệ
        const articleId = result.rows[0].MaBaiViet;
        if (
            articleData.related_figures &&
            articleData.related_figures.length > 0
        ) {
            for (const figureId of articleData.related_figures) {
                await query(
                    `INSERT INTO "BaiViet_NhanVat" ("MaBaiViet", "MaNhanVat")
                    VALUES ($1, $2)`,
                    [articleId, figureId]
                );
            }
        }
        if (
            articleData.related_periods &&
            articleData.related_periods.length > 0
        ) {
            for (const periodId of articleData.related_periods) {
                await query(
                    `INSERT INTO "BaiViet_ThoiKy" ("MaBaiViet", "MaThoiKy")
                    VALUES ($1, $2)`,
                    [articleId, periodId]
                );
            }
        }
        if (
            articleData.related_events &&
            articleData.related_events.length > 0
        ) {
            for (const eventId of articleData.related_events) {
                await query(
                    `INSERT INTO "BaiViet_SuKien" ("MaBaiViet", "MaSuKien")
                    VALUES ($1, $2)`,
                    [articleId, eventId]
                );
            }
        }
        if (
            articleData.related_locations &&
            articleData.related_locations.length > 0
        ) {
            for (const locationId of articleData.related_locations) {
                await query(
                    `INSERT INTO "BaiViet_DiaDanh" ("MaBaiViet", "MaDiaDanh")
                    VALUES ($1, $2)`,
                    [articleId, locationId]
                );
            }
        }
        return new Article(result.rows[0]);
    }

    async update(articleData) {
        // Lấy dữ liệu hiện tại
        const current = await query(
            `SELECT * FROM "BaiViet" WHERE "MaBaiViet" = $1`,
            [this.id]
        );

        if (!current.rows || current.rows.length === 0) {
            throw new Error("Article not found");
        }

        const currentArticle = current.rows[0];

        // Tự động set NgayXuatBan nếu status là 'Đã xuất bản'
        let publishedAt = currentArticle.NgayXuatBan;
        if (articleData.status === "Đã xuất bản") {
            publishedAt = articleData.publishedAt || new Date();
        } else if (articleData.hasOwnProperty("publishedAt")) {
            publishedAt = articleData.publishedAt;
        }

        // Chỉ update những trường được cung cấp
        const result = await query(
            `UPDATE "BaiViet"
            SET "TieuDe" = $1,
                "NoiDung" = $2,
                "AnhBia" = $3,
                "TrangThai" = $4,
                "NgayXuatBan" = $5,
                "NgayCapNhat" = NOW()
            WHERE "MaBaiViet" = $6
            RETURNING *`,
            [
                articleData.title !== undefined
                    ? articleData.title
                    : currentArticle.TieuDe,
                articleData.content !== undefined
                    ? articleData.content
                    : currentArticle.NoiDung,
                articleData.coverImage !== undefined
                    ? articleData.coverImage || null
                    : currentArticle.AnhBia,
                articleData.status !== undefined
                    ? articleData.status
                    : currentArticle.TrangThai,
                publishedAt,
                this.id,
            ]
        );

        const articleId = this.id;

        // Chỉ cập nhật quan hệ nếu có dữ liệu được gửi lên
        if (articleData.hasOwnProperty("related_figures")) {
            // Cập nhật quan hệ nhân vật
            await query(
                `DELETE FROM "BaiViet_NhanVat" WHERE "MaBaiViet" = $1`,
                [articleId]
            );
            if (
                articleData.related_figures &&
                articleData.related_figures.length > 0
            ) {
                for (const figureId of articleData.related_figures) {
                    await query(
                        `INSERT INTO "BaiViet_NhanVat" ("MaBaiViet", "MaNhanVat")
                        VALUES ($1, $2)`,
                        [articleId, figureId]
                    );
                }
            }
        }

        if (articleData.hasOwnProperty("related_periods")) {
            // Cập nhật quan hệ thời kỳ
            await query(`DELETE FROM "BaiViet_ThoiKy" WHERE "MaBaiViet" = $1`, [
                articleId,
            ]);
            if (
                articleData.related_periods &&
                articleData.related_periods.length > 0
            ) {
                for (const periodId of articleData.related_periods) {
                    await query(
                        `INSERT INTO "BaiViet_ThoiKy" ("MaBaiViet", "MaThoiKy")
                        VALUES ($1, $2)`,
                        [articleId, periodId]
                    );
                }
            }
        }

        if (articleData.hasOwnProperty("related_events")) {
            // Cập nhật quan hệ sự kiện
            await query(`DELETE FROM "BaiViet_SuKien" WHERE "MaBaiViet" = $1`, [
                articleId,
            ]);
            if (
                articleData.related_events &&
                articleData.related_events.length > 0
            ) {
                for (const eventId of articleData.related_events) {
                    await query(
                        `INSERT INTO "BaiViet_SuKien" ("MaBaiViet", "MaSuKien")
                        VALUES ($1, $2)`,
                        [articleId, eventId]
                    );
                }
            }
        }

        if (articleData.hasOwnProperty("related_locations")) {
            // Cập nhật quan hệ địa danh
            await query(
                `DELETE FROM "BaiViet_DiaDanh" WHERE "MaBaiViet" = $1`,
                [articleId]
            );
            if (
                articleData.related_locations &&
                articleData.related_locations.length > 0
            ) {
                for (const locationId of articleData.related_locations) {
                    await query(
                        `INSERT INTO "BaiViet_DiaDanh" ("MaBaiViet", "MaDiaDanh")
                        VALUES ($1, $2)`,
                        [articleId, locationId]
                    );
                }
            }
        }

        return new Article(result.rows[0]);
    }

    static async delete(id) {
        try {
            // Xóa các quan hệ trong junction tables
            await query(
                `DELETE FROM "BaiViet_NhanVat" WHERE "MaBaiViet" = $1`,
                [id]
            );
            await query(`DELETE FROM "BaiViet_ThoiKy" WHERE "MaBaiViet" = $1`, [
                id,
            ]);
            await query(`DELETE FROM "BaiViet_SuKien" WHERE "MaBaiViet" = $1`, [
                id,
            ]);
            await query(
                `DELETE FROM "BaiViet_DiaDanh" WHERE "MaBaiViet" = $1`,
                [id]
            );

            // Xóa bài viết chính
            const result = await query(
                `DELETE FROM "BaiViet" WHERE "MaBaiViet" = $1 RETURNING *`,
                [id]
            );

            return result.rows.length > 0;
        } catch (error) {
            console.error("Error deleting article:", error);
            throw error;
        }
    }

    // Thống kê methods
    static async count() {
        try {
            const result = await query(
                `SELECT COUNT(*) as count FROM "BaiViet"`
            );
            return parseInt(result.rows[0].count, 10);
        } catch (error) {
            console.error("Error counting articles:", error);
            throw error;
        }
    }

    static async countByStatus(status) {
        try {
            const result = await query(
                `SELECT COUNT(*) as count FROM "BaiViet" WHERE "TrangThai" = $1`,
                [status]
            );
            return parseInt(result.rows[0].count, 10);
        } catch (error) {
            console.error("Error counting articles by status:", error);
            throw error;
        }
    }

    static async getRecentStats(days = 7) {
        try {
            const result = await query(
                `SELECT 
                    DATE("NgayTao") as date,
                    COUNT(*) as count
                FROM "BaiViet"
                WHERE "NgayTao" >= NOW() - INTERVAL '${days} days'
                GROUP BY DATE("NgayTao")
                ORDER BY date DESC`
            );
            return result.rows;
        } catch (error) {
            console.error("Error getting recent article stats:", error);
            throw error;
        }
    }

    static async getTopViewed(limit = 5) {
        try {
            const result = await query(
                `SELECT 
                    bv."MaBaiViet" as id,
                    bv."TieuDe" as title,
                    bv."AnhBia" as cover_image,
                    COALESCE(COUNT(lx."MaLuotXem"), 0) as view_count
                FROM "BaiViet" bv
                LEFT JOIN "LuotXem" lx ON bv."MaBaiViet" = lx."MaBaiViet"
                    AND lx."LoaiTrang" = 'Bài viết'
                WHERE bv."TrangThai" = 'Đã duyệt'
                GROUP BY bv."MaBaiViet", bv."TieuDe", bv."AnhBia"
                ORDER BY view_count DESC
                LIMIT $1`,
                [limit]
            );
            return result.rows;
        } catch (error) {
            console.error("Error getting top viewed articles:", error);
            throw error;
        }
    }

    static async getTopCommented(limit = 5) {
        try {
            const result = await query(
                `SELECT 
                    bv."MaBaiViet" as id,
                    bv."TieuDe" as title,
                    bv."AnhBia" as cover_image,
                    COUNT(bl."MaBinhLuan") as comment_count
                FROM "BaiViet" bv
                LEFT JOIN "BinhLuan" bl ON bv."MaBaiViet" = bl."MaBaiViet"
                    AND bl."LoaiTrang" = 'Bài viết'
                GROUP BY bv."MaBaiViet", bv."TieuDe", bv."AnhBia"
                ORDER BY comment_count DESC
                LIMIT $1`,
                [limit]
            );
            return result.rows;
        } catch (error) {
            console.error("Error getting top commented articles:", error);
            throw error;
        }
    }

    static async getStatsByDateRange(startDate, endDate) {
        try {
            const result = await query(
                `SELECT 
                    DATE("NgayTao") as date,
                    COUNT(*) as count,
                    COUNT(CASE WHEN "TrangThai" = 'Đã duyệt' THEN 1 END) as approved,
                    COUNT(CASE WHEN "TrangThai" = 'Chờ duyệt' THEN 1 END) as pending,
                    COUNT(CASE WHEN "TrangThai" = 'Từ chối' THEN 1 END) as rejected
                FROM "BaiViet"
                WHERE "NgayTao" BETWEEN $1 AND $2
                GROUP BY DATE("NgayTao")
                ORDER BY date ASC`,
                [startDate, endDate]
            );
            return result.rows;
        } catch (error) {
            console.error("Error getting article stats by date range:", error);
            throw error;
        }
    }
}
export default Article;
