import Article from "../models/ArticleModel.js";
import ViewModel from "../models/ViewModel.js";
import Comment from "../models/CommentModel.js";

class ArticleController {
    static async getAll(req, res) {
        try {
            const { page, limit, search, status } = req.query;
            const result = await Article.getAll({
                page,
                limit,
                search,
                status,
            });
            return res.status(200).json({
                success: true,
                data: result.data,
                pagination: result.pagination,
            });
        } catch (error) {
            console.error("Error fetching articles:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi nội bộ máy chủ",
            });
        }
    }

    static async getByAuthor(req, res) {
        try {
            const authorId = req.user.id; // Lấy ID từ user đã đăng nhập
            const { page, limit, search, status } = req.query;

            const result = await Article.getByAuthor(authorId, {
                page,
                limit,
                search,
                status,
            });

            return res.status(200).json({
                success: true,
                data: result.data,
                pagination: result.pagination,
            });
        } catch (error) {
            console.error("Error fetching user articles:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi nội bộ máy chủ",
            });
        }
    }

    static async getPublished(req, res) {
        try {
            const { page, limit, search } = req.query;
            const result = await Article.getPublished({
                page,
                limit,
                search,
            });

            // Lấy view counts và comment counts cho tất cả articles
            const articleIds = result.data.map((article) => article.id);
            const viewCounts = await ViewModel.getMultipleViewCounts(
                "Bài viết",
                articleIds
            );
            const commentCounts = await Comment.getMultipleCommentCounts(
                "Bài viết",
                articleIds
            );

            // Thêm viewCount và commentCount vào mỗi article
            const articlesWithViews = result.data.map((article) => ({
                ...article,
                viewCount: viewCounts[article.id] || 0,
                commentCount: commentCounts[article.id] || 0,
            }));

            return res.status(200).json({
                success: true,
                data: articlesWithViews,
                pagination: result.pagination,
            });
        } catch (error) {
            console.error("Error fetching published articles:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi nội bộ máy chủ",
            });
        }
    }

    static async getPublishedById(req, res) {
        try {
            const { id } = req.params;
            const article = await Article.getById(id);
            if (!article) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy bài viết",
                });
            }
            // Chỉ cho phép xem bài viết đã xuất bản
            if (article.status !== "Đã xuất bản") {
                return res.status(403).json({
                    success: false,
                    message: "Bài viết chưa được xuất bản",
                });
            }

            // Lấy view count và comment count
            const viewCount = await ViewModel.getViewCount("Bài viết", id);
            const commentCount = await Comment.countByPageTypeAndId(
                "Bài viết",
                id
            );

            return res.status(200).json({
                success: true,
                data: {
                    ...article,
                    viewCount,
                    commentCount,
                },
            });
        } catch (error) {
            console.error("Error fetching published article:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi nội bộ máy chủ",
            });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const article = await Article.getById(id);
            if (!article) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy bài viết",
                });
            }
            return res.status(200).json({
                success: true,
                data: article,
            });
        } catch (error) {
            console.error("Error fetching article:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    static async create(req, res) {
        try {
            const articleData = {
                ...req.body,
                authorId: req.user.id, // Lấy authorId từ user đã đăng nhập
            };

            // Nếu không phải admin, set status mặc định là "Nháp"
            if (req.user.role !== "admin" && !articleData.status) {
                articleData.status = "Nháp";
            }

            const newArticle = await Article.create(articleData);
            return res.status(201).json({
                success: true,
                data: newArticle,
            });
        } catch (error) {
            console.error("Error creating article:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const articleData = req.body;

            // Kiểm tra quyền sở hữu bài viết (trừ admin và sa)
            if (req.user.role !== "admin" && req.user.role !== "sa") {
                const existingArticle = await Article.getById(id);
                if (!existingArticle) {
                    return res.status(404).json({
                        success: false,
                        message: "Không tìm thấy bài viết",
                    });
                }
                if (existingArticle.authorId !== req.user.id) {
                    return res.status(403).json({
                        success: false,
                        message: "Bạn không có quyền sửa bài viết này",
                    });
                }
            }

            const article = new Article({ MaBaiViet: id });
            const updatedArticle = await article.update(articleData);
            return res.status(200).json({
                success: true,
                data: updatedArticle,
            });
        } catch (error) {
            console.error("Error updating article:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: "ID bài viết không hợp lệ",
                });
            }

            // Kiểm tra quyền sở hữu bài viết (trừ admin)
            if (req.user.role !== "admin") {
                const existingArticle = await Article.getById(id);
                if (!existingArticle) {
                    return res.status(404).json({
                        success: false,
                        message: "Không tìm thấy bài viết",
                    });
                }
                if (existingArticle.authorId !== req.user.id) {
                    return res.status(403).json({
                        success: false,
                        message: "Bạn không có quyền xóa bài viết này",
                    });
                }
            }

            const deleted = await Article.delete(id);

            if (deleted) {
                return res.status(200).json({
                    success: true,
                    message: "Xóa bài viết thành công",
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy bài viết",
                });
            }
        } catch (error) {
            console.error("Error deleting article:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi khi xóa bài viết",
                error: error.message,
            });
        }
    }
}

export default ArticleController;
