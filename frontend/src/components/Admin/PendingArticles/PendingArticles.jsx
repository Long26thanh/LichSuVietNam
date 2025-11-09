import React, { useState, useEffect } from "react";
import { articleService } from "@/services";
import config from "@/config";
import styles from "./PendingArticles.module.css";
import * as icons from "@/assets/icons";

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

    // Helper function to get full image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        
        // If already a full URL (http/https) or data URL, return as is
        if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
            return imagePath;
        }
        
        // If it's a relative path, prepend server URL
        if (imagePath.startsWith('/assets/images/')) {
            return `${config.serverUrl}${imagePath}`;
        }
        
        return imagePath;
    };

    if (loading) {
        return (
            <div className={styles["pending-articles-card"]}>
                <div className={styles["card-header"]}>
                    <h3>
                        <img src={icons.clock} alt="" className={styles["title-icon"]} />
                        Bài viết chờ duyệt
                    </h3>
                </div>
                <div className={`${styles["card-body"]} ${styles["loading"]}`}>
                    <p>Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles["pending-articles-card"]}>
            <div className={styles["card-header"]}>
                <h3>
                    <img src={icons.clock} alt="" className={styles["title-icon"]} />
                    Bài viết chờ duyệt
                </h3>
                <span className={styles["badge"]}>{articles.length}</span>
            </div>
            <div className={styles["card-body"]}>
                {articles.length === 0 ? (
                    <div className={styles["empty-state"]}>
                        <img src={icons.checkCircle} alt="" className={styles["empty-icon"]} />
                        <p>Không có bài viết chờ duyệt</p>
                    </div>
                ) : (
                    <div className={styles["articles-list"]}>
                        {articles.map((article) => (
                            <div key={article.id} className={styles["article-item"]}>
                                {article.coverImage && (
                                    <div className={styles["article-thumbnail"]}>
                                        <img
                                            src={getImageUrl(article.coverImage)}
                                            alt={article.title}
                                        />
                                    </div>
                                )}
                                <div className={styles["article-info"]}>
                                    <h4 className={styles["article-title"]}>
                                        {article.title}
                                    </h4>
                                    <p className={styles["article-excerpt"]}>
                                        {truncateText(
                                            article.excerpt || article.content
                                        )}
                                    </p>
                                    <div className={styles["article-meta"]}>
                                        <span className={styles["author"]}>
                                            <img src={icons.user} alt="User" className={styles["meta-icon"]} />
                                            {article.authorName || "Người dùng"}
                                        </span>
                                        <span className={styles["date"]}>
                                            <img src={icons.clock} alt="Time" className={styles["meta-icon"]} />
                                            {formatDate(article.createdAt)}
                                        </span>
                                    </div>
                                    <div className={styles["article-actions"]}>
                                        <button
                                            className={styles["btn-approve"]}
                                            onClick={() =>
                                                handleApprove(article.id)
                                            }
                                            disabled={processing === article.id}
                                        >
                                            {processing === article.id ? (
                                                <img src={icons.clock} alt="Processing" className={styles["btn-icon"]} />
                                            ) : (
                                                <img src={icons.check} alt="Approve" className={styles["btn-icon"]} />
                                            )}
                                            Duyệt
                                        </button>
                                        <button
                                            className={styles["btn-reject"]}
                                            onClick={() =>
                                                handleReject(article.id)
                                            }
                                            disabled={processing === article.id}
                                        >
                                            {processing === article.id ? (
                                                <img src={icons.clock} alt="Processing" className={styles["btn-icon"]} />
                                            ) : (
                                                <img src={icons.closeIcon} alt="Reject" className={styles["btn-icon"]} />
                                            )}
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
