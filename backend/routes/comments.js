import express from "express";
import CommentController from "../controllers/CommentController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

// Lấy danh sách bình luận (public)
router.get("/", CommentController.getComments);

// Đếm số lượng bình luận (public) - PHẢI ĐẶT TRƯỚC /:commentId
router.get("/count", CommentController.countComments);

// Lấy các replies của một bình luận (public)
router.get("/:commentId/replies", CommentController.getReplies);

// Tạo bình luận mới (cần đăng nhập)
router.post("/", authenticateToken, CommentController.createComment);

// Cập nhật bình luận (cần đăng nhập)
router.put("/:commentId", authenticateToken, CommentController.updateComment);

// Xóa bình luận (cần đăng nhập)
router.delete(
    "/:commentId",
    authenticateToken,
    CommentController.deleteComment
);

export default router;
