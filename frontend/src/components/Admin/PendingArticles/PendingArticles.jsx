import React, { useState, useEffect } from "react";
import { articleService } from "@/services";
import "./PendingArticles.css";

const PendingArticles = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);

    useEffect(() => {
        loadPendingArticles();
    }, []);

    const loadPendingArticles = async () => {
        setLoading(true);
        try {
            const response = await articleService.getAllArticles();
            if (response.success) {
                // Lọc các bài viết có trạng thái "Chờ duyệt"
                const pending = response.data.filter(
                    (article) => article.status === "Chờ duyệt"
                );
                setArticles(pending);
            }
        } catch (error) {
            console.error("Error loading pending articles:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (articleId) => {
        if (!window.confirm("Bạn có chắc muốn duyệt bài viết này?")) {
            return;
        }

        setProcessing(articleId);
        try {
            const response = await articleService.updateArticle(articleId, {
                status: "Đã xuất bản",
            });

            if (response.success) {
                // Xóa bài viết khỏi danh sách chờ duyệt
                setArticles((prev) => prev.filter((a) => a.id !== articleId));
                alert("Đã duyệt bài viết thành công!");
            }
        } catch (error) {
            console.error("Error approving article:", error);
            alert("Có lỗi xảy ra khi duyệt bài viết");
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (articleId) => {
        const reason = window.prompt("Lý do từ chối (không bắt buộc):");
        if (reason === null) return; // User cancelled

        setProcessing(articleId);
        try {
            const response = await articleService.updateArticle(articleId, {
                status: "Bị từ chối",
                rejectionReason: reason || "Không đạt yêu cầu",
            });

            if (response.success) {
                // Xóa bài viết khỏi danh sách chờ duyệt
                setArticles((prev) => prev.filter((a) => a.id !== articleId));
                alert("Đã từ chối bài viết!");
            }
        } catch (error) {
            console.error("Error rejecting article:", error);
            alert("Có lỗi xảy ra khi từ chối bài viết");
        } finally {
            setProcessing(null);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const truncateText = (text, maxLength = 100) => {
        if (!text) return "";
        return text.length > maxLength
            ? text.substring(0, maxLength) + "..."
            : text;
    };

    if (loading) {
        return (
            <div className="pending-articles-card">
                <div className="card-header">
                    <h3>⏳ Bài viết chờ duyệt</h3>
                </div>
                <div className="card-body loading">
                    <p>Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pending-articles-card">
            <div className="card-header">
                <h3>⏳ Bài viết chờ duyệt</h3>
                <span className="badge">{articles.length}</span>
            </div>
            <div className="card-body">
                {articles.length === 0 ? (
                    <div className="empty-state">
                        <p>✅ Không có bài viết chờ duyệt</p>
                    </div>
                ) : (
                    <div className="articles-list">
                        {articles.map((article) => (
                            <div key={article.id} className="article-item">
                                {article.coverImage && (
                                    <div className="article-thumbnail">
                                        <img
                                            src={article.coverImage}
                                            alt={article.title}
                                        />
                                    </div>
                                )}
                                <div className="article-info">
                                    <h4 className="article-title">
                                        {article.title}
                                    </h4>
                                    <p className="article-excerpt">
                                        {truncateText(
                                            article.excerpt || article.content
                                        )}
                                    </p>
                                    <div className="article-meta">
                                        <span className="author">
                                            👤{" "}
                                            {article.authorName || "Người dùng"}
                                        </span>
                                        <span className="date">
                                            📅 {formatDate(article.createdAt)}
                                        </span>
                                    </div>
                                    <div className="article-actions">
                                        <button
                                            className="btn-approve"
                                            onClick={() =>
                                                handleApprove(article.id)
                                            }
                                            disabled={processing === article.id}
                                        >
                                            {processing === article.id
                                                ? "⏳"
                                                : "✓"}{" "}
                                            Duyệt
                                        </button>
                                        <button
                                            className="btn-reject"
                                            onClick={() =>
                                                handleReject(article.id)
                                            }
                                            disabled={processing === article.id}
                                        >
                                            {processing === article.id
                                                ? "⏳"
                                                : "✗"}{" "}
                                            Từ chối
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PendingArticles;
