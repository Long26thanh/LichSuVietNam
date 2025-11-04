import React, { useState, useEffect } from "react";
import { commentService, userService } from "../../services";
import { useAuth } from "../../contexts/AuthContext";
import "./CommentSection.css";

const CommentSection = ({ pageType, pageId }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [replyTo, setReplyTo] = useState(null);
    const [replyContent, setReplyContent] = useState("");
    const [editingComment, setEditingComment] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [totalComments, setTotalComments] = useState(0);
    const [expandedReplies, setExpandedReplies] = useState({});
    const [loadingReplies, setLoadingReplies] = useState({});
    const [usersCache, setUsersCache] = useState({}); // Cache thông tin users

    const COMMENTS_PER_PAGE = 10;

    // Lấy thông tin user từ cache hoặc API
    const getUserInfo = async (userId) => {
        if (usersCache[userId]) {
            return usersCache[userId];
        }

        try {
            const response = await userService.getUserById(userId);
            if (response.success) {
                const userInfo = {
                    username: response.data.username,
                    full_name: response.data.full_name,
                    avatar_url: response.data.avatar_url,
                };
                setUsersCache((prev) => ({ ...prev, [userId]: userInfo }));
                return userInfo;
            }
        } catch (error) {
            console.error("Error loading user info:", error);
        }

        return null;
    };

    // Load comments
    const loadComments = async (pageNum = 1, append = false) => {
        try {
            setLoading(true);
            const response = await commentService.getComments(
                pageType,
                pageId,
                pageNum,
                COMMENTS_PER_PAGE
            );

            if (response.success) {
                // Load user info cho tất cả comments
                const commentsWithUsers = await Promise.all(
                    response.data.map(async (comment) => {
                        const userInfo = await getUserInfo(comment.user_id);
                        return { ...comment, userInfo };
                    })
                );

                if (append) {
                    setComments((prev) => [...prev, ...commentsWithUsers]);
                } else {
                    setComments(commentsWithUsers);
                }
                setHasMore(response.pagination.hasMore);
                setTotalComments(response.pagination.total);
                setPage(pageNum);
            }
        } catch (error) {
            console.error("Error loading comments:", error);
        } finally {
            setLoading(false);
        }
    };

    // Load replies for a comment
    const loadReplies = async (commentId) => {
        try {
            setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));
            const response = await commentService.getReplies(commentId);

            if (response.success) {
                // Load user info cho tất cả replies
                const repliesWithUsers = await Promise.all(
                    response.data.map(async (reply) => {
                        const userInfo = await getUserInfo(reply.user_id);
                        return { ...reply, userInfo };
                    })
                );

                setExpandedReplies((prev) => ({
                    ...prev,
                    [commentId]: repliesWithUsers,
                }));
            }
        } catch (error) {
            console.error("Error loading replies:", error);
            alert("Không thể tải phản hồi. Vui lòng thử lại!");
        } finally {
            setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
        }
    };

    // Toggle replies
    const toggleReplies = (commentId) => {
        if (expandedReplies[commentId]) {
            setExpandedReplies((prev) => {
                const newState = { ...prev };
                delete newState[commentId];
                return newState;
            });
        } else {
            loadReplies(commentId);
        }
    };

    // Load more comments
    const loadMoreComments = () => {
        loadComments(page + 1, true);
    };

    // Submit new comment
    const handleSubmitComment = async (e) => {
        e.preventDefault();

        if (!user) {
            alert("Bạn cần đăng nhập để bình luận!");
            return;
        }

        if (!newComment.trim()) {
            alert("Vui lòng nhập nội dung bình luận!");
            return;
        }

        try {
            setSubmitting(true);
            const response = await commentService.createComment({
                pageType,
                pageId,
                content: newComment.trim(),
            });

            if (response.success) {
                setNewComment("");
                // Reload comments to show new comment
                loadComments(1, false);
            }
        } catch (error) {
            console.error("Error submitting comment:", error);
            alert(
                error.message || "Không thể gửi bình luận. Vui lòng thử lại!"
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Submit reply
    const handleSubmitReply = async (e, parentId) => {
        e.preventDefault();

        if (!user) {
            alert("Bạn cần đăng nhập để trả lời!");
            return;
        }

        if (!replyContent.trim()) {
            alert("Vui lòng nhập nội dung phản hồi!");
            return;
        }

        try {
            setSubmitting(true);
            const response = await commentService.createComment({
                pageType,
                pageId,
                parentId,
                content: replyContent.trim(),
            });

            if (response.success) {
                setReplyContent("");
                setReplyTo(null);
                // Reload replies for this comment
                loadReplies(parentId);
                // Update comment count
                loadComments(1, false);
            }
        } catch (error) {
            console.error("Error submitting reply:", error);
            alert(error.message || "Không thể gửi phản hồi. Vui lòng thử lại!");
        } finally {
            setSubmitting(false);
        }
    };

    // Update comment
    const handleUpdateComment = async (commentId) => {
        if (!editContent.trim()) {
            alert("Vui lòng nhập nội dung bình luận!");
            return;
        }

        try {
            setSubmitting(true);
            const response = await commentService.updateComment(
                commentId,
                editContent.trim()
            );

            if (response.success) {
                setEditingComment(null);
                setEditContent("");
                // Reload comments
                loadComments(page, false);
            }
        } catch (error) {
            console.error("Error updating comment:", error);
            alert(
                error.message ||
                    "Không thể cập nhật bình luận. Vui lòng thử lại!"
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Delete comment
    const handleDeleteComment = async (commentId) => {
        if (!confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
            return;
        }

        try {
            const response = await commentService.deleteComment(commentId);

            if (response.success) {
                // Reload comments
                loadComments(1, false);
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
            alert(
                error.message || "Không thể xóa bình luận. Vui lòng thử lại!"
            );
        }
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // seconds

        if (diff < 60) return "Vừa xong";
        if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;

        return date.toLocaleDateString("vi-VN");
    };

    // Load initial comments
    useEffect(() => {
        loadComments(1, false);
    }, [pageType, pageId]);

    // Render single comment
    const renderComment = (comment, isReply = false) => (
        <div
            key={comment.id}
            className={`comment-item ${isReply ? "comment-reply" : ""}`}
        >
            <div className="comment-avatar">
                {comment.userInfo?.avatar_url ? (
                    <img
                        src={comment.userInfo.avatar_url}
                        alt={comment.userInfo.username}
                    />
                ) : (
                    <div className="avatar-placeholder">
                        {comment.userInfo?.username?.charAt(0).toUpperCase() ||
                            comment.userInfo?.full_name
                                ?.charAt(0)
                                .toUpperCase() ||
                            "U"}
                    </div>
                )}
            </div>

            <div className="comment-content">
                <div className="comment-header">
                    <span className="comment-author">
                        {comment.userInfo?.full_name ||
                            comment.userInfo?.username ||
                            "Người dùng"}
                    </span>
                    <span className="comment-time">
                        {formatDate(comment.comment_at)}
                    </span>
                </div>

                {editingComment === comment.id ? (
                    <div className="comment-edit-form">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            maxLength={1000}
                            rows={3}
                            placeholder="Nhập nội dung bình luận..."
                        />
                        <div className="comment-edit-actions">
                            <button
                                onClick={() => handleUpdateComment(comment.id)}
                                disabled={submitting}
                                className="btn-save"
                            >
                                {submitting ? "Đang lưu..." : "Lưu"}
                            </button>
                            <button
                                onClick={() => {
                                    setEditingComment(null);
                                    setEditContent("");
                                }}
                                className="btn-cancel"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="comment-text">{comment.content}</p>
                )}

                <div className="comment-actions">
                    {user && (
                        <button
                            onClick={() => setReplyTo(comment.id)}
                            className="btn-reply"
                        >
                            Trả lời
                        </button>
                    )}

                    {user && user.id === comment.user_id && (
                        <>
                            <button
                                onClick={() => {
                                    setEditingComment(comment.id);
                                    setEditContent(comment.content);
                                }}
                                className="btn-edit"
                            >
                                Sửa
                            </button>
                            <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="btn-delete"
                            >
                                Xóa
                            </button>
                        </>
                    )}
                </div>

                {/* View replies button */}
                {comment.reply_count && comment.reply_count > 0 && (
                    <button
                        onClick={() => toggleReplies(comment.id)}
                        className="btn-view-replies"
                    >
                        {expandedReplies[comment.id]
                            ? "Ẩn phản hồi"
                            : `Xem ${comment.reply_count} phản hồi`}
                    </button>
                )}

                {/* Reply form */}
                {replyTo === comment.id && (
                    <form
                        onSubmit={(e) => handleSubmitReply(e, comment.id)}
                        className="reply-form"
                    >
                        <div className="comment-form-avatar">
                            {user?.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt={user.username}
                                />
                            ) : (
                                <div className="avatar-placeholder">
                                    {user?.username?.[0]?.toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="reply-form-content">
                            <textarea
                                value={replyContent}
                                onChange={(e) =>
                                    setReplyContent(e.target.value)
                                }
                                maxLength={1000}
                                rows={2}
                                placeholder="Viết phản hồi..."
                                autoFocus
                            />
                            <div className="reply-form-actions">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn-submit"
                                >
                                    {submitting ? "Đang gửi..." : "Gửi"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setReplyTo(null);
                                        setReplyContent("");
                                    }}
                                    className="btn-cancel"
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {/* Replies */}
                {expandedReplies[comment.id] && (
                    <div className="comment-replies">
                        {loadingReplies[comment.id] ? (
                            <div className="loading-replies">
                                Đang tải phản hồi...
                            </div>
                        ) : (
                            expandedReplies[comment.id].map((reply) =>
                                renderComment(reply, true)
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="comment-section">
            <div className="comment-section-header">
                <h3>Bình luận ({totalComments})</h3>
            </div>

            {/* New comment form */}
            {user ? (
                <form onSubmit={handleSubmitComment} className="comment-form">
                    <div className="comment-form-avatar">
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.username} />
                        ) : (
                            <div className="avatar-placeholder">
                                {user.username?.charAt(0).toUpperCase() ||
                                    user.full_name?.charAt(0).toUpperCase() ||
                                    "U"}
                            </div>
                        )}
                    </div>
                    <div className="comment-form-input">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            maxLength={1000}
                            rows={3}
                            placeholder="Viết bình luận của bạn..."
                        />
                        <div className="comment-form-footer">
                            <span className="char-count">
                                {newComment.length}/1000
                            </span>
                            <button
                                type="submit"
                                disabled={submitting || !newComment.trim()}
                            >
                                {submitting ? "Đang gửi..." : "Gửi bình luận"}
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="comment-login-prompt">
                    <p>
                        Bạn cần <a href="/login">đăng nhập</a> để bình luận
                    </p>
                </div>
            )}

            {/* Comments list */}
            <div className="comments-list">
                {loading && comments.length === 0 ? (
                    <div className="loading-comments">
                        Đang tải bình luận...
                    </div>
                ) : comments.length === 0 ? (
                    <div className="no-comments">
                        Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                    </div>
                ) : (
                    <>
                        {comments.map((comment) => renderComment(comment))}

                        {hasMore && (
                            <div className="load-more-container">
                                <button
                                    onClick={loadMoreComments}
                                    disabled={loading}
                                    className="btn-load-more"
                                >
                                    {loading
                                        ? "Đang tải..."
                                        : "Xem thêm bình luận"}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CommentSection;
