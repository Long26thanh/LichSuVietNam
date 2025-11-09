import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import articleService from "@/services/articleService";
import { recordWebsiteView, recordArticleView } from "@/services/viewService";
import { useAuth } from "@/contexts/AuthContext";
import { convertImagesToAbsoluteUrls } from "@/utils";
import config from "@/config";
import NotFound from "@/pages/404/404";
import routes from "@/config/routes";
import { CommentSection } from "@/components";
import "./ArticleDetail.css";

const ArticleDetail = () => {
    const { id } = useParams();
    const nav = useNavigate();
    const { state } = useLocation();
    const { user, isAdminSession } = useAuth();
    const [item, setItem] = useState(state?.article || null);
    const [loading, setLoading] = useState(!state?.article);
    const [error, setError] = useState(null);
    const viewRecorded = useRef(false); // Để chỉ ghi nhận view 1 lần

    useEffect(() => {
        // Luôn fetch dữ liệu mới khi id thay đổi hoặc component mount
        // State chỉ dùng để hiển thị tạm thời, nhưng vẫn cập nhật từ server
        const fetchDetail = async () => {
            try {
                // Chỉ hiển thị loading nếu chưa có dữ liệu tạm từ state
                if (!item) setLoading(true);

                // Kiểm tra xem có phải admin session không
                const isAdmin =
                    isAdminSession &&
                    (user?.role === "admin" || user?.role === "sa");

                // Thử lấy bài viết đã xuất bản trước
                const res = await articleService.getPublishedArticleById(id);

                if (res?.success && res.data) {
                    setItem(res.data);
                    setError(null);
                } else {
                    // Nếu không phải bài đã xuất bản, kiểm tra quyền xem
                    if (user) {
                        try {
                            const allRes = await articleService.getArticleById(
                                id
                            );
                            if (allRes?.success && allRes.data) {
                                const article = allRes.data;
                                // Kiểm tra quyền: admin (trong session admin) hoặc tác giả
                                if (isAdmin || article.authorId === user?.id) {
                                    setItem(article);
                                    setError(null);
                                } else {
                                    setError("404");
                                }
                            } else {
                                setError("404");
                            }
                        } catch (err) {
                            setError("404");
                        }
                    } else {
                        setError("404");
                    }
                }
            } catch (e) {
                if (e.response?.status === 403 || e.response?.status === 404) {
                    // Nếu lỗi 403/404, kiểm tra quyền xem
                    const isAdmin =
                        isAdminSession &&
                        (user?.role === "admin" || user?.role === "sa");
                    if (user) {
                        try {
                            const allRes = await articleService.getArticleById(
                                id
                            );
                            if (allRes?.success && allRes.data) {
                                const article = allRes.data;
                                // Kiểm tra quyền: admin (trong session admin) hoặc tác giả
                                if (isAdmin || article.authorId === user?.id) {
                                    setItem(article);
                                } else {
                                    setError("404");
                                }
                            } else {
                                setError("404");
                            }
                        } catch (err) {
                            setError("404");
                        }
                    } else {
                        setError("404");
                    }
                } else {
                    setError("404");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id, user, isAdminSession]); // Bỏ 'item' khỏi dependencies để tránh vòng lặp vô hạn

    // Ghi nhận lượt xem - chỉ 1 lần
    useEffect(() => {
        if (item && item.id && !viewRecorded.current) {
            viewRecorded.current = true;
            // Ghi nhận lượt xem website
            recordWebsiteView();
            // Ghi nhận lượt xem bài viết
            recordArticleView(item.id);
        }
    }, [item]);

    const [processing, setProcessing] = useState(false);

    const handleBack = () => nav(-1);

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const handleApprove = async () => {
        if (!window.confirm("Bạn có chắc muốn duyệt bài viết này?")) return;

        setProcessing(true);
        try {
            const res = await articleService.updateArticle(id, {
                status: "Đã xuất bản",
                publishedAt: new Date().toISOString(),
            });

            if (res.success) {
                alert("Đã duyệt bài viết thành công!");
                setItem({
                    ...item,
                    status: "Đã xuất bản",
                    publishedAt: new Date().toISOString(),
                });
                nav(-1); // Quay lại trang trước
            } else {
                alert("Có lỗi xảy ra khi duyệt bài viết");
            }
        } catch (error) {
            console.error("Error approving article:", error);
            alert("Có lỗi xảy ra khi duyệt bài viết");
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (
            !window.confirm(
                "Bạn có chắc muốn từ chối bài viết này? Bài viết sẽ được chuyển về bản nháp."
            )
        )
            return;

        setProcessing(true);
        try {
            // Từ chối sẽ chuyển về bản nháp và xóa ngày xuất bản
            const res = await articleService.updateArticle(id, {
                status: "Bản nháp",
                publishedAt: null,
            });

            if (res.success) {
                alert("Đã từ chối bài viết và chuyển về bản nháp!");
                setItem({
                    ...item,
                    status: "Bản nháp",
                    publishedAt: null,
                });
                nav(-1); // Quay lại trang trước
            } else {
                alert("Có lỗi xảy ra khi từ chối bài viết");
            }
        } catch (error) {
            console.error("Error rejecting article:", error);
            alert("Có lỗi xảy ra khi từ chối bài viết");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="article-detail-page">Đang tải...</div>;
    if (error === "404") return <NotFound />;
    if (error) return <div className="article-detail-page">{error}</div>;
    if (!item)
        return <div className="article-detail-page">Không có dữ liệu</div>;

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

    // Kiểm tra xem có hiển thị nút duyệt/từ chối không
    const isAdmin =
        isAdminSession && (user?.role === "admin" || user?.role === "sa");
    const isPending = item.status === "Chờ duyệt";
    const showApprovalButtons = isAdmin && isPending;

    return (
        <div className="article-detail-page">
            <div className="article-header-actions">
                {showApprovalButtons && (
                    <div className="approval-buttons">
                        <button
                            className="btn-approve"
                            onClick={handleApprove}
                            disabled={processing}
                        >
                            {processing ? "⏳ Đang xử lý..." : "✓ Duyệt bài"}
                        </button>
                        <button
                            className="btn-reject"
                            onClick={handleReject}
                            disabled={processing}
                        >
                            {processing ? "⏳ Đang xử lý..." : "✗ Từ chối"}
                        </button>
                    </div>
                )}
            </div>

            {isPending && (
                <div className="status-banner pending">
                    ⏳ Bài viết đang chờ duyệt
                </div>
            )}

            <header className="article-detail-header">
                <h1 className="article-name">{item.title}</h1>
                <div className="article-meta">
                    {item.authorName && (
                        <span className="article-author">
                            Tác giả: {item.authorName}
                        </span>
                    )}
                    {item.publishedAt && (
                        <span className="article-date">
                            {formatDate(item.publishedAt)}
                        </span>
                    )}
                </div>
            </header>

            {item.coverImage && (
                <div className="article-cover-image">
                    <img src={getImageUrl(item.coverImage)} alt={item.title} />
                </div>
            )}

            <main className="article-detail-content">
                <section className="article-section">
                    <div
                        className="section-content"
                        dangerouslySetInnerHTML={{ __html: convertImagesToAbsoluteUrls(item.content) }}
                    />
                </section>

                {/* Related content sections */}
                {(item.relations?.figures?.length > 0 ||
                    item.relations?.events?.length > 0 ||
                    item.relations?.periods?.length > 0 ||
                    item.relations?.locations?.length > 0) && (
                    <>
                        {item.relations?.figures?.length > 0 && (
                            <section className="article-section">
                                <h2 className="section-title">
                                    Nhân vật liên quan
                                </h2>
                                <ul className="related-list">
                                    {item.relations.figures.map((figure) => (
                                        <li
                                            key={figure.id}
                                            className="related-item"
                                        >
                                            <Link
                                                to={routes.figureDetail.replace(
                                                    ":id",
                                                    figure.id
                                                )}
                                                className="related-link"
                                            >
                                                {figure.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {item.relations?.events?.length > 0 && (
                            <section className="article-section">
                                <h2 className="section-title">
                                    Sự kiện liên quan
                                </h2>
                                <ul className="related-list">
                                    {item.relations.events.map((event) => (
                                        <li
                                            key={event.id}
                                            className="related-item"
                                        >
                                            <Link
                                                to={routes.eventDetail.replace(
                                                    ":id",
                                                    event.id
                                                )}
                                                className="related-link"
                                            >
                                                {event.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {item.relations?.periods?.length > 0 && (
                            <section className="article-section">
                                <h2 className="section-title">
                                    Thời kỳ liên quan
                                </h2>
                                <ul className="related-list">
                                    {item.relations.periods.map((period) => (
                                        <li
                                            key={period.id}
                                            className="related-item"
                                        >
                                            <Link
                                                to={routes.periodDetail.replace(
                                                    ":id",
                                                    period.id
                                                )}
                                                className="related-link"
                                            >
                                                {period.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {item.relations?.locations?.length > 0 && (
                            <section className="article-section">
                                <h2 className="section-title">
                                    Địa danh liên quan
                                </h2>
                                <ul className="related-list">
                                    {item.relations.locations.map(
                                        (location) => (
                                            <li
                                                key={location.id}
                                                className="related-item"
                                            >
                                                <Link
                                                    to={routes.locationDetail.replace(
                                                        ":id",
                                                        location.id
                                                    )}
                                                    className="related-link"
                                                >
                                                    {location.name}
                                                </Link>
                                            </li>
                                        )
                                    )}
                                </ul>
                            </section>
                        )}
                    </>
                )}
            </main>

            {/* Comment Section */}
            {item.status === "Đã xuất bản" && (
                <CommentSection pageType="Bài viết" pageId={item.id} />
            )}
        </div>
    );
};

export default ArticleDetail;
