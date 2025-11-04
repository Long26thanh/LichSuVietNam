import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import articleService from "@/services/articleService";
import { recordWebsiteView, recordArticleView } from "@/services/viewService";
import { useAuth } from "@/contexts/AuthContext";
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

    useEffect(() => {
        if (item) return;
        const fetchDetail = async () => {
            try {
                setLoading(true);

                // Kiểm tra xem có phải admin session không
                const isAdmin =
                    isAdminSession &&
                    (user?.role === "admin" || user?.role === "sa");

                // Thử lấy bài viết đã xuất bản trước
                const res = await articleService.getPublishedArticleById(id);

                if (res?.success && res.data) {
                    setItem(res.data);
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
    }, [id, item, user, isAdminSession]);

    // Ghi nhận lượt xem
    useEffect(() => {
        if (item && item.id) {
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
                    <img src={item.coverImage} alt={item.title} />
                </div>
            )}

            <main className="article-detail-content">
                <section className="article-section">
                    <div
                        className="section-content"
                        dangerouslySetInnerHTML={{ __html: item.content }}
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
