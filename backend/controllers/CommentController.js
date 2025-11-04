import Comment from "../models/CommentModel.js";

class CommentController {
    // Lấy danh sách bình luận
    static async getComments(req, res) {
        try {
            const {
                pageType,
                pageId,
                parentId,
                page = 1,
                limit = 10,
            } = req.query;

            if (!pageType || !pageId) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin loại trang và ID",
                });
            }

            const result = await Comment.getByPageTypeAndId(
                pageType,
                parseInt(pageId),
                parentId ? parseInt(parentId) : null,
                parseInt(page),
                parseInt(limit)
            );

            // Thêm reply_count cho từng comment
            const commentsWithReplyCount = await Promise.all(
                result.comments.map(async (comment) => {
                    const reply_count = await Comment.getReplyCount(comment.id);
                    return { ...comment, reply_count };
                })
            );

            return res.status(200).json({
                success: true,
                data: commentsWithReplyCount,
                pagination: result.pagination,
            });
        } catch (error) {
            console.error("Error fetching comments:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi khi lấy danh sách bình luận",
            });
        }
    }

    // Lấy các replies của một bình luận
    static async getReplies(req, res) {
        try {
            const { commentId } = req.params;

            if (!commentId) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu ID bình luận",
                });
            }

            const replies = await Comment.getReplies(parseInt(commentId));

            // Thêm reply_count cho từng reply
            const repliesWithReplyCount = await Promise.all(
                replies.map(async (reply) => {
                    const reply_count = await Comment.getReplyCount(reply.id);
                    return { ...reply, reply_count };
                })
            );

            return res.status(200).json({
                success: true,
                data: repliesWithReplyCount,
            });
        } catch (error) {
            console.error("Error fetching replies:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi khi lấy các phản hồi",
            });
        }
    }

    // Tạo bình luận mới
    static async createComment(req, res) {
        try {
            const { pageType, pageId, parentId, content } = req.body;
            const userId = req.user.id;
            const ipAddress = req.ip || req.connection.remoteAddress;

            // Validate input
            if (!pageType || !pageId || !content) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin bắt buộc",
                });
            }

            if (content.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Nội dung bình luận không được để trống",
                });
            }

            if (content.length > 1000) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Nội dung bình luận không được vượt quá 1000 ký tự",
                });
            }

            const commentData = {
                page_type: pageType,
                page_id: parseInt(pageId),
                parent_id: parentId ? parseInt(parentId) : null,
                content: content.trim(),
                user_id: userId,
                ip_address: ipAddress,
            };

            const newComment = await Comment.create(commentData);

            return res.status(201).json({
                success: true,
                message: "Tạo bình luận thành công",
                data: newComment,
            });
        } catch (error) {
            console.error("Error creating comment:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi khi tạo bình luận",
            });
        }
    }

    // Cập nhật bình luận
    static async updateComment(req, res) {
        try {
            const { commentId } = req.params;
            const { content } = req.body;
            const userId = req.user.id;

            if (!content || content.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Nội dung bình luận không được để trống",
                });
            }

            if (content.length > 1000) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Nội dung bình luận không được vượt quá 1000 ký tự",
                });
            }

            const updatedComment = await Comment.update(
                parseInt(commentId),
                userId,
                content.trim()
            );

            return res.status(200).json({
                success: true,
                message: "Cập nhật bình luận thành công",
                data: updatedComment,
            });
        } catch (error) {
            if (error.message === "Comment not found") {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy bình luận",
                });
            }
            if (error.message === "Unauthorized") {
                return res.status(403).json({
                    success: false,
                    message: "Bạn không có quyền cập nhật bình luận này",
                });
            }
            console.error("Error updating comment:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi khi cập nhật bình luận",
            });
        }
    }

    // Xóa bình luận
    static async deleteComment(req, res) {
        try {
            const { commentId } = req.params;
            const userId = req.user.id;

            await Comment.delete(parseInt(commentId), userId);

            return res.status(200).json({
                success: true,
                message: "Xóa bình luận thành công",
            });
        } catch (error) {
            if (error.message === "Comment not found") {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy bình luận",
                });
            }
            if (error.message === "Unauthorized") {
                return res.status(403).json({
                    success: false,
                    message: "Bạn không có quyền xóa bình luận này",
                });
            }
            console.error("Error deleting comment:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi khi xóa bình luận",
            });
        }
    }

    // Đếm số lượng bình luận
    static async countComments(req, res) {
        try {
            const { pageType, pageId } = req.query;

            if (!pageType || !pageId) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu thông tin loại trang và ID",
                });
            }

            const count = await Comment.countByPageTypeAndId(
                pageType,
                parseInt(pageId)
            );

            return res.status(200).json({
                success: true,
                data: { count },
            });
        } catch (error) {
            console.error("Error counting comments:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi khi đếm số lượng bình luận",
            });
        }
    }

    static async countReplies(req, res) {
        try {
            const { commentId } = req.params;

            const count = await Comment.countReplyById(parseInt(commentId));

            return res.status(200).json({
                success: true,
                data: { count },
            });
        } catch (error) {
            console.error("Error counting replies:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi khi đếm số lượng replies",
            });
        }
    }
}

export default CommentController;
