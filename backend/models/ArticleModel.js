import { query } from "../config/db.js";

class Article {
    constructor(articleData) {
        this.id = articleData?.MaBaiViet;
        this.title = articleData?.TieuDe;
        this.content = articleData?.NoiDung;
        this.coverImage = articleData?.AnhBia;
        this.authorId = articleData?.MaTacGia;
        this.authorName = articleData?.TacGia; 
        this.status = articleData?.TrangThai;
        this.publishedAt = articleData?.NgayXuatBan;
        this.scheduledPublishAt = articleData?.NgayXuatBanDuKien; // Thêm trường lên lịch
        this.createdAt = articleData?.NgayTao;
        this.updatedAt = articleData?.NgayCapNhat;
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
        // Xử lý ngày xuất bản
        let publishedAt = null;
        let scheduledPublishAt = articleData.scheduledPublishAt || null;
        
        // Nếu status là 'Đã xuất bản', set ngay
        if (articleData.status === "Đã xuất bản") {
            publishedAt = new Date();
            scheduledPublishAt = null; // Clear scheduled date
        }
        // Nếu có lên lịch, set status là "Lên lịch"
        else if (scheduledPublishAt) {
            articleData.status = "Lên lịch";
        }

        const result = await query(
            `INSERT INTO "BaiViet" ("TieuDe", "NoiDung", "AnhBia", "MaTacGia", "TrangThai", "NgayXuatBan", "NgayXuatBanDuKien", "NgayTao", "NgayCapNhat")
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            RETURNING *`,
            [
                articleData.title,
                articleData.content,
                articleData.coverImage || null,
                articleData.authorId || null,
                articleData.status,
                publishedAt,
                scheduledPublishAt,
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

        // Xử lý ngày xuất bản và lên lịch
        let publishedAt = currentArticle.NgayXuatBan;
        let scheduledPublishAt = currentArticle.NgayXuatBanDuKien;
        
        // Nếu status thay đổi thành 'Đã xuất bản'
        if (articleData.status === "Đã xuất bản" && currentArticle.TrangThai !== "Đã xuất bản") {
            publishedAt = articleData.publishedAt || new Date();
            scheduledPublishAt = null; // Clear scheduled date
        }
        // Nếu có scheduledPublishAt mới
        else if (articleData.hasOwnProperty("scheduledPublishAt")) {
            scheduledPublishAt = articleData.scheduledPublishAt;
            // Nếu set lên lịch, đổi status sang "Lên lịch"
            if (scheduledPublishAt && articleData.status !== "Đã xuất bản") {
                articleData.status = "Lên lịch";
            }
        }
        // Nếu có publishedAt được set explicitly
        else if (articleData.hasOwnProperty("publishedAt")) {
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
                "NgayXuatBanDuKien" = $6,
                "NgayCapNhat" = NOW()
            WHERE "MaBaiViet" = $7
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
                scheduledPublishAt,
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

    // Đếm tổng số nội dung đã xuất bản từ tất cả các loại (Bài viết, Nhân vật, Thời kỳ, Sự kiện, Địa danh)
    static async countAllPublishedContent() {
        try {
            const result = await query(
                `SELECT 
                    (SELECT COUNT(*) FROM "BaiViet") +
                    (SELECT COUNT(*) FROM "NhanVat") +
                    (SELECT COUNT(*) FROM "ThoiKy") +
                    (SELECT COUNT(*) FROM "SuKien") +
                    (SELECT COUNT(*) FROM "DiaDanh") as count`
            );
            return parseInt(result.rows[0].count, 10);
        } catch (error) {
            console.error("Error counting all published content:", error);
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

    // Lấy thống kê tất cả nội dung đã xuất bản gần đây (Bài viết, Nhân vật, Thời kỳ, Sự kiện, Địa danh)
    static async getRecentAllContentStats(days = 7) {
        try {
            const result = await query(
                `SELECT 
                    DATE(created_date) as date,
                    SUM(count) as count
                FROM (
                    SELECT "NgayTao" as created_date, 1 as count
                    FROM "BaiViet"
                    WHERE "NgayTao" >= NOW() - INTERVAL '${days} days'
                    
                    UNION ALL
                    
                    SELECT "NgayTao" as created_date, 1 as count
                    FROM "NhanVat"
                    WHERE "NgayTao" >= NOW() - INTERVAL '${days} days'
                    
                    UNION ALL
                    
                    SELECT "NgayTao" as created_date, 1 as count
                    FROM "ThoiKy"
                    WHERE "NgayTao" >= NOW() - INTERVAL '${days} days'
                    
                    UNION ALL
                    
                    SELECT "NgayTao" as created_date, 1 as count
                    FROM "SuKien"
                    WHERE "NgayTao" >= NOW() - INTERVAL '${days} days'
                    
                    UNION ALL
                    
                    SELECT "NgayTao" as created_date, 1 as count
                    FROM "DiaDanh"
                    WHERE "NgayTao" >= NOW() - INTERVAL '${days} days'
                ) as all_content
                GROUP BY DATE(created_date)
                ORDER BY date DESC`
            );
            return result.rows;
        } catch (error) {
            console.error("Error getting recent all content stats:", error);
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
                WHERE bv."TrangThai" = 'Đã xuất bản'
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
                    COUNT(CASE WHEN "TrangThai" = 'Đã xuất bản' THEN 1 END) as approved,
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

    // Thống kê chi tiết theo ngày/tháng/năm
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
                    TO_CHAR("NgayTao", '${dateFormat}') as period,
                    COUNT(*) as total,
                    COUNT(CASE WHEN "TrangThai" = 'Đã xuất bản' THEN 1 END) as published,
                    COUNT(CASE WHEN "TrangThai" = 'Chờ duyệt' THEN 1 END) as pending,
                    COUNT(CASE WHEN "TrangThai" = 'Từ chối' THEN 1 END) as rejected
                FROM "BaiViet"
                WHERE "NgayTao" BETWEEN $1 AND $2
                GROUP BY period
                ORDER BY period ASC`,
                [startDate, endDate]
            );
            return result.rows;
        } catch (error) {
            console.error("Error getting detailed stats by period:", error);
            throw error;
        }
    }

    // Đếm số bài viết theo trạng thái trong khoảng thời gian
    static async countByDateRange(startDate, endDate, status = null) {
        try {
            let queryStr = `SELECT COUNT(*) as count FROM "BaiViet" 
                WHERE "NgayTao" BETWEEN $1 AND $2`;
            const params = [startDate, endDate];

            if (status) {
                queryStr += ` AND "TrangThai" = $3`;
                params.push(status);
            }

            const result = await query(queryStr, params);
            return parseInt(result.rows[0].count, 10);
        } catch (error) {
            console.error("Error counting articles by date range:", error);
            throw error;
        }
    }

    // Đếm tổng số tất cả nội dung đã xuất bản theo khoảng thời gian (Bài viết, Nhân vật, Thời kỳ, Sự kiện, Địa danh)
    static async countAllContentByDateRange(startDate, endDate) {
        try {
            const result = await query(
                `SELECT 
                    (SELECT COUNT(*) FROM "BaiViet" WHERE "NgayTao" BETWEEN $1 AND $2) +
                    (SELECT COUNT(*) FROM "NhanVat" WHERE "NgayTao" BETWEEN $1 AND $2) +
                    (SELECT COUNT(*) FROM "ThoiKy" WHERE "NgayTao" BETWEEN $1 AND $2) +
                    (SELECT COUNT(*) FROM "SuKien" WHERE "NgayTao" BETWEEN $1 AND $2) +
                    (SELECT COUNT(*) FROM "DiaDanh" WHERE "NgayTao" BETWEEN $1 AND $2) as count`,
                [startDate, endDate]
            );
            return parseInt(result.rows[0].count, 10);
        } catch (error) {
            console.error("Error counting all content by date range:", error);
            throw error;
        }
    }

    // Lấy thống kê chi tiết của tất cả nội dung theo khoảng thời gian (Bài viết, Nhân vật, Thời kỳ, Sự kiện, Địa danh)
    static async getAllContentDetailedStatsByPeriod(startDate, endDate, period = "day") {
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
                    period,
                    SUM(total_count) as total,
                    SUM(published_count) as published,
                    SUM(pending_count) as pending
                FROM (
                    -- Bài viết có trạng thái
                    SELECT 
                        TO_CHAR("NgayTao", '${dateFormat}') as period, 
                        COUNT(*) as total_count,
                        COUNT(CASE WHEN "TrangThai" = 'Đã xuất bản' THEN 1 END) as published_count,
                        COUNT(CASE WHEN "TrangThai" = 'Chờ duyệt' THEN 1 END) as pending_count
                    FROM "BaiViet"
                    WHERE "NgayTao" BETWEEN $1 AND $2
                    GROUP BY period
                    
                    UNION ALL
                    
                    -- Nhân vật (đã được tạo = đã xuất bản, không có trạng thái chờ duyệt)
                    SELECT 
                        TO_CHAR("NgayTao", '${dateFormat}') as period, 
                        COUNT(*) as total_count,
                        COUNT(*) as published_count,
                        0 as pending_count
                    FROM "NhanVat"
                    WHERE "NgayTao" BETWEEN $1 AND $2
                    GROUP BY period
                    
                    UNION ALL
                    
                    -- Thời kỳ (đã được tạo = đã xuất bản, không có trạng thái chờ duyệt)
                    SELECT 
                        TO_CHAR("NgayTao", '${dateFormat}') as period, 
                        COUNT(*) as total_count,
                        COUNT(*) as published_count,
                        0 as pending_count
                    FROM "ThoiKy"
                    WHERE "NgayTao" BETWEEN $1 AND $2
                    GROUP BY period
                    
                    UNION ALL
                    
                    -- Sự kiện (đã được tạo = đã xuất bản, không có trạng thái chờ duyệt)
                    SELECT 
                        TO_CHAR("NgayTao", '${dateFormat}') as period, 
                        COUNT(*) as total_count,
                        COUNT(*) as published_count,
                        0 as pending_count
                    FROM "SuKien"
                    WHERE "NgayTao" BETWEEN $1 AND $2
                    GROUP BY period
                    
                    UNION ALL
                    
                    -- Địa danh (đã được tạo = đã xuất bản, không có trạng thái chờ duyệt)
                    SELECT 
                        TO_CHAR("NgayTao", '${dateFormat}') as period, 
                        COUNT(*) as total_count,
                        COUNT(*) as published_count,
                        0 as pending_count
                    FROM "DiaDanh"
                    WHERE "NgayTao" BETWEEN $1 AND $2
                    GROUP BY period
                ) as all_content
                GROUP BY period
                ORDER BY period ASC`,
                [startDate, endDate]
            );
            return result.rows;
        } catch (error) {
            console.error("Error getting all content detailed stats by period:", error);
            throw error;
        }
    }

    // Lấy top bài viết có lượt xem cao nhất trong khoảng thời gian
    static async getTopViewedByPeriod(startDate, endDate, limit = 10) {
        try {
            const result = await query(
                `SELECT 
                    bv."MaBaiViet" as id,
                    bv."TieuDe" as title,
                    bv."AnhBia" as cover_image,
                    u.full_name as author,
                    COALESCE(COUNT(lx."MaLuotXem"), 0) as view_count
                FROM "BaiViet" bv
                LEFT JOIN users u ON bv."MaTacGia" = u.id
                LEFT JOIN "LuotXem" lx ON bv."MaBaiViet" = lx."MaBaiViet"
                    AND lx."LoaiTrang" = 'Bài viết'
                    AND lx."viewed_at" BETWEEN $1 AND $2
                WHERE bv."TrangThai" = 'Đã xuất bản'
                GROUP BY bv."MaBaiViet", bv."TieuDe", bv."AnhBia", u.full_name
                HAVING COUNT(lx."MaLuotXem") > 0
                ORDER BY view_count DESC
                LIMIT $3`,
                [startDate, endDate, limit]
            );
            
            // Nếu không có bài viết nào có lượt xem trong period, lấy top bài viết có lượt xem tổng thể
            if (result.rows.length === 0) {
                const fallbackResult = await query(
                    `SELECT 
                        bv."MaBaiViet" as id,
                        bv."TieuDe" as title,
                        bv."AnhBia" as cover_image,
                        u.full_name as author,
                        COALESCE(COUNT(lx."MaLuotXem"), 0) as view_count
                    FROM "BaiViet" bv
                    LEFT JOIN users u ON bv."MaTacGia" = u.id
                    LEFT JOIN "LuotXem" lx ON bv."MaBaiViet" = lx."MaBaiViet"
                        AND lx."LoaiTrang" = 'Bài viết'
                    WHERE bv."TrangThai" = 'Đã xuất bản'
                    GROUP BY bv."MaBaiViet", bv."TieuDe", bv."AnhBia", u.full_name
                    ORDER BY view_count DESC
                    LIMIT $1`,
                    [limit]
                );
                return fallbackResult.rows;
            }
            
            return result.rows;
        } catch (error) {
            console.error("Error getting top viewed articles by period:", error);
            throw error;
        }
    }

    // Lấy top bài viết có nhiều bình luận nhất trong khoảng thời gian
    static async getTopCommentedByPeriod(startDate, endDate, limit = 10) {
        try {
            const result = await query(
                `SELECT 
                    bv."MaBaiViet" as id,
                    bv."TieuDe" as title,
                    bv."AnhBia" as cover_image,
                    u.full_name as author,
                    COALESCE(COUNT(bl."MaBinhLuan"), 0) as comment_count
                FROM "BaiViet" bv
                LEFT JOIN users u ON bv."MaTacGia" = u.id
                LEFT JOIN "BinhLuan" bl ON bv."MaBaiViet" = bl."MaBaiViet"
                    AND bl."LoaiTrang" = 'Bài viết'
                    AND bl."comment_at" BETWEEN $1 AND $2
                WHERE bv."TrangThai" = 'Đã xuất bản'
                GROUP BY bv."MaBaiViet", bv."TieuDe", bv."AnhBia", u.full_name
                HAVING COUNT(bl."MaBinhLuan") > 0
                ORDER BY comment_count DESC
                LIMIT $3`,
                [startDate, endDate, limit]
            );
            
            // Nếu không có bài viết nào có bình luận trong period, lấy top bài viết có bình luận tổng thể
            if (result.rows.length === 0) {
                const fallbackResult = await query(
                    `SELECT 
                        bv."MaBaiViet" as id,
                        bv."TieuDe" as title,
                        bv."AnhBia" as cover_image,
                        u.full_name as author,
                        COALESCE(COUNT(bl."MaBinhLuan"), 0) as comment_count
                    FROM "BaiViet" bv
                    LEFT JOIN users u ON bv."MaTacGia" = u.id
                    LEFT JOIN "BinhLuan" bl ON bv."MaBaiViet" = bl."MaBaiViet"
                        AND bl."LoaiTrang" = 'Bài viết'
                    WHERE bv."TrangThai" = 'Đã xuất bản'
                    GROUP BY bv."MaBaiViet", bv."TieuDe", bv."AnhBia", u.full_name
                    ORDER BY comment_count DESC
                    LIMIT $1`,
                    [limit]
                );
                return fallbackResult.rows;
            }
            
            return result.rows;
        } catch (error) {
            console.error("Error getting top commented articles by period:", error);
            throw error;
        }
    }

    // Lấy top content có lượt xem cao nhất (bao gồm tất cả loại trang)
    static async getTopViewedAllContent(limit = 10) {
        try {
            const result = await query(
                `SELECT * FROM (
                    -- Bài viết
                    SELECT 
                        'article' as content_type,
                        bv."MaBaiViet" as id,
                        bv."TieuDe" as title,
                        bv."AnhBia" as cover_image,
                        'Bài viết' as page_type,
                        u.full_name as author,
                        COALESCE(COUNT(lx."MaLuotXem"), 0) as view_count
                    FROM "BaiViet" bv
                    LEFT JOIN users u ON bv."MaTacGia" = u.id
                    LEFT JOIN "LuotXem" lx ON bv."MaBaiViet" = lx."MaBaiViet" AND lx."LoaiTrang" = 'Bài viết'
                    WHERE bv."TrangThai" = 'Đã xuất bản'
                    GROUP BY bv."MaBaiViet", bv."TieuDe", bv."AnhBia", u.full_name

                    UNION ALL

                    -- Nhân vật
                    SELECT 
                        'figure' as content_type,
                        nv."MaNhanVat" as id,
                        nv."HoTen" as title,
                        NULL as cover_image,
                        'Nhân vật' as page_type,
                        NULL as author,
                        COALESCE(COUNT(lx."MaLuotXem"), 0) as view_count
                    FROM "NhanVat" nv
                    LEFT JOIN "LuotXem" lx ON nv."MaNhanVat" = lx."MaNhanVat" AND lx."LoaiTrang" = 'Nhân vật'
                    GROUP BY nv."MaNhanVat", nv."HoTen"

                    UNION ALL

                    -- Thời kỳ
                    SELECT 
                        'period' as content_type,
                        tk."MaThoiKy" as id,
                        tk."TenThoiKy" as title,
                        NULL as cover_image,
                        'Thời kỳ' as page_type,
                        NULL as author,
                        COALESCE(COUNT(lx."MaLuotXem"), 0) as view_count
                    FROM "ThoiKy" tk
                    LEFT JOIN "LuotXem" lx ON tk."MaThoiKy" = lx."MaThoiKy" AND lx."LoaiTrang" = 'Thời kỳ'
                    GROUP BY tk."MaThoiKy", tk."TenThoiKy"

                    UNION ALL

                    -- Sự kiện
                    SELECT 
                        'event' as content_type,
                        sk."MaSuKien" as id,
                        sk."TenSuKien" as title,
                        NULL as cover_image,
                        'Sự kiện' as page_type,
                        NULL as author,
                        COALESCE(COUNT(lx."MaLuotXem"), 0) as view_count
                    FROM "SuKien" sk
                    LEFT JOIN "LuotXem" lx ON sk."MaSuKien" = lx."MaSuKien" AND lx."LoaiTrang" = 'Sự kiện'
                    GROUP BY sk."MaSuKien", sk."TenSuKien"

                    UNION ALL

                    -- Địa danh
                    SELECT 
                        'location' as content_type,
                        dd."MaDiaDanh" as id,
                        dd."TenDiaDanh" as title,
                        NULL as cover_image,
                        'Địa danh' as page_type,
                        NULL as author,
                        COALESCE(COUNT(lx."MaLuotXem"), 0) as view_count
                    FROM "DiaDanh" dd
                    LEFT JOIN "LuotXem" lx ON dd."MaDiaDanh" = lx."MaDiaDanh" AND lx."LoaiTrang" = 'Địa danh'
                    GROUP BY dd."MaDiaDanh", dd."TenDiaDanh"
                ) AS all_content
                ORDER BY view_count DESC
                LIMIT $1`,
                [limit]
            );
            return result.rows;
        } catch (error) {
            console.error("Error getting top viewed all content:", error);
            throw error;
        }
    }

    // Lấy top content có nhiều bình luận nhất (bao gồm tất cả loại trang)
    static async getTopCommentedAllContent(limit = 10) {
        try {
            const result = await query(
                `SELECT * FROM (
                    -- Bài viết
                    SELECT 
                        'article' as content_type,
                        bv."MaBaiViet" as id,
                        bv."TieuDe" as title,
                        bv."AnhBia" as cover_image,
                        'Bài viết' as page_type,
                        u.full_name as author,
                        COALESCE(COUNT(bl."MaBinhLuan"), 0) as comment_count
                    FROM "BaiViet" bv
                    LEFT JOIN users u ON bv."MaTacGia" = u.id
                    LEFT JOIN "BinhLuan" bl ON bv."MaBaiViet" = bl."MaBaiViet" AND bl."LoaiTrang" = 'Bài viết'
                    WHERE bv."TrangThai" = 'Đã xuất bản'
                    GROUP BY bv."MaBaiViet", bv."TieuDe", bv."AnhBia", u.full_name

                    UNION ALL

                    -- Nhân vật
                    SELECT 
                        'figure' as content_type,
                        nv."MaNhanVat" as id,
                        nv."HoTen" as title,
                        NULL as cover_image,
                        'Nhân vật' as page_type,
                        NULL as author,
                        COALESCE(COUNT(bl."MaBinhLuan"), 0) as comment_count
                    FROM "NhanVat" nv
                    LEFT JOIN "BinhLuan" bl ON nv."MaNhanVat" = bl."MaNhanVat" AND bl."LoaiTrang" = 'Nhân vật'
                    GROUP BY nv."MaNhanVat", nv."HoTen"

                    UNION ALL

                    -- Thời kỳ
                    SELECT 
                        'period' as content_type,
                        tk."MaThoiKy" as id,
                        tk."TenThoiKy" as title,
                        NULL as cover_image,
                        'Thời kỳ' as page_type,
                        NULL as author,
                        COALESCE(COUNT(bl."MaBinhLuan"), 0) as comment_count
                    FROM "ThoiKy" tk
                    LEFT JOIN "BinhLuan" bl ON tk."MaThoiKy" = bl."MaThoiKy" AND bl."LoaiTrang" = 'Thời kỳ'
                    GROUP BY tk."MaThoiKy", tk."TenThoiKy"

                    UNION ALL

                    -- Sự kiện
                    SELECT 
                        'event' as content_type,
                        sk."MaSuKien" as id,
                        sk."TenSuKien" as title,
                        NULL as cover_image,
                        'Sự kiện' as page_type,
                        NULL as author,
                        COALESCE(COUNT(bl."MaBinhLuan"), 0) as comment_count
                    FROM "SuKien" sk
                    LEFT JOIN "BinhLuan" bl ON sk."MaSuKien" = bl."MaSuKien" AND bl."LoaiTrang" = 'Sự kiện'
                    GROUP BY sk."MaSuKien", sk."TenSuKien"

                    UNION ALL

                    -- Địa danh
                    SELECT 
                        'location' as content_type,
                        dd."MaDiaDanh" as id,
                        dd."TenDiaDanh" as title,
                        NULL as cover_image,
                        'Địa danh' as page_type,
                        NULL as author,
                        COALESCE(COUNT(bl."MaBinhLuan"), 0) as comment_count
                    FROM "DiaDanh" dd
                    LEFT JOIN "BinhLuan" bl ON dd."MaDiaDanh" = bl."MaDiaDanh" AND bl."LoaiTrang" = 'Địa danh'
                    GROUP BY dd."MaDiaDanh", dd."TenDiaDanh"
                ) AS all_content
                ORDER BY comment_count DESC
                LIMIT $1`,
                [limit]
            );
            return result.rows;
        } catch (error) {
            console.error("Error getting top commented all content:", error);
            throw error;
        }
    }

    // Tự động xuất bản các bài đã lên lịch (gọi bởi cron job)
    static async publishScheduledArticles() {
        try {
            const result = await query(
                `UPDATE "BaiViet"
                SET "TrangThai" = 'Đã xuất bản',
                    "NgayXuatBan" = NOW(),
                    "NgayXuatBanDuKien" = NULL,
                    "NgayCapNhat" = NOW()
                WHERE "TrangThai" = 'Lên lịch'
                    AND "NgayXuatBanDuKien" <= NOW()
                RETURNING "MaBaiViet", "TieuDe"`,
                []
            );
            
            return result.rows; // Trả về danh sách bài viết đã được publish
        } catch (error) {
            console.error("Error publishing scheduled articles:", error);
            throw error;
        }
    }

    // Lấy các bài đã lên lịch
    static async getScheduledArticles() {
        try {
            const result = await query(
                `SELECT 
                    bv.*,
                    u.full_name AS "TacGia"
                FROM "BaiViet" bv
                LEFT JOIN users u ON bv."MaTacGia" = u.id
                WHERE bv."TrangThai" = 'Lên lịch'
                    AND bv."NgayXuatBanDuKien" IS NOT NULL
                ORDER BY bv."NgayXuatBanDuKien" ASC`,
                []
            );
            
            return result.rows.map(row => new Article(row));
        } catch (error) {
            console.error("Error getting scheduled articles:", error);
            throw error;
        }
    }

    // Lấy danh sách bài viết theo khoảng thời gian
    static async getByDateRange(startDate, endDate, status = 'Đã xuất bản') {
        try {
            const result = await query(
                `SELECT 
                    bv."MaBaiViet" as id,
                    bv."TieuDe" as title,
                    bv."AnhBia" as cover_image,
                    bv."NgayXuatBan" as published_date,
                    u.full_name as author,
                    COALESCE(COUNT(DISTINCT lx."MaLuotXem"), 0) as view_count,
                    COALESCE(COUNT(DISTINCT bl."MaBinhLuan"), 0) as comment_count
                FROM "BaiViet" bv
                LEFT JOIN users u ON bv."MaTacGia" = u.id
                LEFT JOIN "LuotXem" lx ON bv."MaBaiViet" = lx."MaBaiViet" AND lx."LoaiTrang" = 'Bài viết'
                LEFT JOIN "BinhLuan" bl ON bv."MaBaiViet" = bl."MaBaiViet" AND bl."LoaiTrang" = 'Bài viết'
                WHERE bv."TrangThai" = $1
                    AND bv."NgayXuatBan" >= $2
                    AND bv."NgayXuatBan" <= $3
                GROUP BY bv."MaBaiViet", bv."TieuDe", bv."AnhBia", bv."NgayXuatBan", u.full_name
                ORDER BY bv."NgayXuatBan" DESC`,
                [status, startDate, endDate]
            );
            return result.rows;
        } catch (error) {
            console.error("Error getting articles by date range:", error);
            throw error;
        }
    }

    // Lấy top content có lượt xem cao nhất theo khoảng thời gian
    static async getTopViewedAllContentByDateRange(startDate, endDate, limit = 50) {
        try {
            const result = await query(
                `SELECT * FROM (
                    -- Bài viết
                    SELECT 
                        'article' as content_type,
                        bv."MaBaiViet" as id,
                        bv."TieuDe" as title,
                        bv."AnhBia" as cover_image,
                        'Bài viết' as page_type,
                        u.full_name as author,
                        bv."NgayXuatBan" as created_date,
                        COALESCE(COUNT(lx."MaLuotXem"), 0) as view_count
                    FROM "BaiViet" bv
                    LEFT JOIN users u ON bv."MaTacGia" = u.id
                    LEFT JOIN "LuotXem" lx ON bv."MaBaiViet" = lx."MaBaiViet" AND lx."LoaiTrang" = 'Bài viết'
                        AND lx.viewed_at >= $1 AND lx.viewed_at <= $2
                    WHERE bv."TrangThai" = 'Đã xuất bản'
                    GROUP BY bv."MaBaiViet", bv."TieuDe", bv."AnhBia", u.full_name, bv."NgayXuatBan"

                    UNION ALL

                    -- Nhân vật
                    SELECT 
                        'figure' as content_type,
                        nv."MaNhanVat" as id,
                        nv."HoTen" as title,
                        NULL as cover_image,
                        'Nhân vật' as page_type,
                        'Admin' as author,
                        nv."NgayTao" as created_date,
                        COALESCE(COUNT(lx."MaLuotXem"), 0) as view_count
                    FROM "NhanVat" nv
                    LEFT JOIN "LuotXem" lx ON nv."MaNhanVat" = lx."MaNhanVat" AND lx."LoaiTrang" = 'Nhân vật'
                        AND lx.viewed_at >= $1 AND lx.viewed_at <= $2
                    GROUP BY nv."MaNhanVat", nv."HoTen", nv."NgayTao"

                    UNION ALL

                    -- Thời kỳ
                    SELECT 
                        'period' as content_type,
                        tk."MaThoiKy" as id,
                        tk."TenThoiKy" as title,
                        NULL as cover_image,
                        'Thời kỳ' as page_type,
                        'Admin' as author,
                        tk."NgayTao" as created_date,
                        COALESCE(COUNT(lx."MaLuotXem"), 0) as view_count
                    FROM "ThoiKy" tk
                    LEFT JOIN "LuotXem" lx ON tk."MaThoiKy" = lx."MaThoiKy" AND lx."LoaiTrang" = 'Thời kỳ'
                        AND lx.viewed_at >= $1 AND lx.viewed_at <= $2
                    GROUP BY tk."MaThoiKy", tk."TenThoiKy", tk."NgayTao"

                    UNION ALL

                    -- Sự kiện
                    SELECT 
                        'event' as content_type,
                        sk."MaSuKien" as id,
                        sk."TenSuKien" as title,
                        NULL as cover_image,
                        'Sự kiện' as page_type,
                        'Admin' as author,
                        sk."NgayTao" as created_date,
                        COALESCE(COUNT(lx."MaLuotXem"), 0) as view_count
                    FROM "SuKien" sk
                    LEFT JOIN "LuotXem" lx ON sk."MaSuKien" = lx."MaSuKien" AND lx."LoaiTrang" = 'Sự kiện'
                        AND lx.viewed_at >= $1 AND lx.viewed_at <= $2
                    GROUP BY sk."MaSuKien", sk."TenSuKien", sk."NgayTao"

                    UNION ALL

                    -- Địa danh
                    SELECT 
                        'location' as content_type,
                        dd."MaDiaDanh" as id,
                        dd."TenDiaDanh" as title,
                        NULL as cover_image,
                        'Địa danh' as page_type,
                        'Admin' as author,
                        dd."NgayTao" as created_date,
                        COALESCE(COUNT(lx."MaLuotXem"), 0) as view_count
                    FROM "DiaDanh" dd
                    LEFT JOIN "LuotXem" lx ON dd."MaDiaDanh" = lx."MaDiaDanh" AND lx."LoaiTrang" = 'Địa danh'
                        AND lx.viewed_at >= $1 AND lx.viewed_at <= $2
                    GROUP BY dd."MaDiaDanh", dd."TenDiaDanh", dd."NgayTao"
                ) AS all_content
                WHERE view_count > 0
                ORDER BY view_count DESC
                LIMIT $3`,
                [startDate, endDate, limit]
            );
            return result.rows;
        } catch (error) {
            console.error("Error getting top viewed content by date range:", error);
            throw error;
        }
    }

    // Lấy top content có nhiều bình luận nhất theo khoảng thời gian
    static async getTopCommentedAllContentByDateRange(startDate, endDate, limit = 50) {
        try {
            const result = await query(
                `SELECT * FROM (
                    -- Bài viết
                    SELECT 
                        'article' as content_type,
                        bv."MaBaiViet" as id,
                        bv."TieuDe" as title,
                        bv."AnhBia" as cover_image,
                        'Bài viết' as page_type,
                        u.full_name as author,
                        bv."NgayXuatBan" as created_date,
                        COALESCE(COUNT(bl."MaBinhLuan"), 0) as comment_count
                    FROM "BaiViet" bv
                    LEFT JOIN users u ON bv."MaTacGia" = u.id
                    LEFT JOIN "BinhLuan" bl ON bv."MaBaiViet" = bl."MaBaiViet" AND bl."LoaiTrang" = 'Bài viết'
                        AND bl.comment_at >= $1 AND bl.comment_at <= $2
                    WHERE bv."TrangThai" = 'Đã xuất bản'
                    GROUP BY bv."MaBaiViet", bv."TieuDe", bv."AnhBia", u.full_name, bv."NgayXuatBan"

                    UNION ALL

                    -- Nhân vật
                    SELECT 
                        'figure' as content_type,
                        nv."MaNhanVat" as id,
                        nv."HoTen" as title,
                        NULL as cover_image,
                        'Nhân vật' as page_type,
                        'Admin' as author,
                        nv."NgayTao" as created_date,
                        COALESCE(COUNT(bl."MaBinhLuan"), 0) as comment_count
                    FROM "NhanVat" nv
                    LEFT JOIN "BinhLuan" bl ON nv."MaNhanVat" = bl."MaNhanVat" AND bl."LoaiTrang" = 'Nhân vật'
                        AND bl.comment_at >= $1 AND bl.comment_at <= $2
                    GROUP BY nv."MaNhanVat", nv."HoTen", nv."NgayTao"

                    UNION ALL

                    -- Thời kỳ
                    SELECT 
                        'period' as content_type,
                        tk."MaThoiKy" as id,
                        tk."TenThoiKy" as title,
                        NULL as cover_image,
                        'Thời kỳ' as page_type,
                        'Admin' as author,
                        tk."NgayTao" as created_date,
                        COALESCE(COUNT(bl."MaBinhLuan"), 0) as comment_count
                    FROM "ThoiKy" tk
                    LEFT JOIN "BinhLuan" bl ON tk."MaThoiKy" = bl."MaThoiKy" AND bl."LoaiTrang" = 'Thời kỳ'
                        AND bl.comment_at >= $1 AND bl.comment_at <= $2
                    GROUP BY tk."MaThoiKy", tk."TenThoiKy", tk."NgayTao"

                    UNION ALL

                    -- Sự kiện
                    SELECT 
                        'event' as content_type,
                        sk."MaSuKien" as id,
                        sk."TenSuKien" as title,
                        NULL as cover_image,
                        'Sự kiện' as page_type,
                        'Admin' as author,
                        sk."NgayTao" as created_date,
                        COALESCE(COUNT(bl."MaBinhLuan"), 0) as comment_count
                    FROM "SuKien" sk
                    LEFT JOIN "BinhLuan" bl ON sk."MaSuKien" = bl."MaSuKien" AND bl."LoaiTrang" = 'Sự kiện'
                        AND bl.comment_at >= $1 AND bl.comment_at <= $2
                    GROUP BY sk."MaSuKien", sk."TenSuKien", sk."NgayTao"

                    UNION ALL

                    -- Địa danh
                    SELECT 
                        'location' as content_type,
                        dd."MaDiaDanh" as id,
                        dd."TenDiaDanh" as title,
                        NULL as cover_image,
                        'Địa danh' as page_type,
                        'Admin' as author,
                        dd."NgayTao" as created_date,
                        COALESCE(COUNT(bl."MaBinhLuan"), 0) as comment_count
                    FROM "DiaDanh" dd
                    LEFT JOIN "BinhLuan" bl ON dd."MaDiaDanh" = bl."MaDiaDanh" AND bl."LoaiTrang" = 'Địa danh'
                        AND bl.comment_at >= $1 AND bl.comment_at <= $2
                    GROUP BY dd."MaDiaDanh", dd."TenDiaDanh", dd."NgayTao"
                ) AS all_content
                WHERE comment_count > 0
                ORDER BY comment_count DESC
                LIMIT $3`,
                [startDate, endDate, limit]
            );
            return result.rows;
        } catch (error) {
            console.error("Error getting top commented content by date range:", error);
            throw error;
        }
    }
}
export default Article;
