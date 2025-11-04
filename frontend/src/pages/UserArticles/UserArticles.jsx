import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button, ConfirmDialog, ArticleForm } from "@/components";
import articleService from "@/services/articleService";
import "./UserArticles.css";

const UserArticles = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [articles, setArticles] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [articleToDelete, setArticleToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Stats không đổi khi lọc
    const [stats, setStats] = useState({
        total: 0,
        published: 0,
        pending: 0,
        draft: 0,
        rejected: 0,
    });

    const totalPages = Math.max(1, Math.ceil(total / limit));

    // Load stats một lần khi component mount
    useEffect(() => {
        const loadStats = async () => {
            if (!user) return;

            try {
                const res = await articleService.getUserArticles({
                    page: 1,
                    limit: 9999, // Lấy tất cả để tính stats
                });

                if (res?.success) {
                    const allArticles = res.data || [];
                    setStats({
                        total: allArticles.length,
                        published: allArticles.filter(
                            (a) => a.status === "Đã xuất bản"
                        ).length,
                        pending: allArticles.filter(
                            (a) => a.status === "Chờ duyệt"
                        ).length,
                        draft: allArticles.filter(
                            (a) => a.status === "Bản nháp"
                        ).length,
                        rejected: allArticles.filter(
                            (a) => a.status === "Bị từ chối"
                        ).length,
                    });
                }
            } catch (e) {
                console.error("Error loading stats:", e);
            }
        };
        loadStats();
    }, [user]);

    // Load user's articles với filter
    useEffect(() => {
        const loadArticles = async () => {
            if (!user) return;

            setLoading(true);
            setError("");
            try {
                const res = await articleService.getUserArticles({
                    page,
                    limit,
                    search: searchTerm,
                    status: statusFilter,
                });

                if (res?.success) {
                    setArticles(res.data || []);
                    setTotal(res.pagination?.total || 0);
                } else {
                    setError(
                        res?.message || "Không thể tải danh sách bài viết"
                    );
                }
            } catch (e) {
                console.error("Error loading articles:", e);
                setError("Có lỗi xảy ra khi tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };
        loadArticles();
    }, [page, limit, searchTerm, statusFilter, user]);

    const refreshStats = async () => {
        try {
            const res = await articleService.getUserArticles({
                page: 1,
                limit: 9999,
            });
            if (res?.success) {
                const allArticles = res.data || [];
                setStats({
                    total: allArticles.length,
                    published: allArticles.filter(
                        (a) => a.status === "Đã xuất bản"
                    ).length,
                    pending: allArticles.filter((a) => a.status === "Chờ duyệt")
                        .length,
                    draft: allArticles.filter((a) => a.status === "Bản nháp")
                        .length,
                    rejected: allArticles.filter(
                        (a) => a.status === "Bị từ chối"
                    ).length,
                });
            }
        } catch (e) {
            console.error("Error refreshing stats:", e);
        }
    };

    const handleCreateArticle = async (formData) => {
        setFormLoading(true);
        try {
            const response = await articleService.createArticle(formData);

            if (response.success) {
                alert("Tạo bài viết thành công!");
                setIsFormOpen(false);
                setPage(1);
                // Refresh list và stats
                const res = await articleService.getUserArticles({
                    page: 1,
                    limit,
                });
                if (res?.success) {
                    setArticles(res.data || []);
                    setTotal(res.pagination?.total || 0);
                }
                refreshStats();
            } else {
                alert(response.message || "Có lỗi xảy ra khi tạo bài viết");
            }
        } catch (error) {
            console.error("Error creating article:", error);
            alert("Có lỗi xảy ra khi tạo bài viết");
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdateArticle = async (formData) => {
        if (!editingArticle) return;

        setFormLoading(true);
        try {
            const response = await articleService.updateArticle(
                editingArticle.id,
                formData
            );

            if (response.success) {
                alert("Cập nhật bài viết thành công!");
                setIsFormOpen(false);
                setEditingArticle(null);
                // Refresh list và stats
                const res = await articleService.getUserArticles({
                    page,
                    limit,
                    search: searchTerm,
                    status: statusFilter,
                });
                if (res?.success) {
                    setArticles(res.data || []);
                    setTotal(res.pagination?.total || 0);
                }
                refreshStats();
            } else {
                alert(
                    response.message || "Có lỗi xảy ra khi cập nhật bài viết"
                );
            }
        } catch (error) {
            console.error("Error updating article:", error);
            alert("Có lỗi xảy ra khi cập nhật bài viết");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteArticle = async () => {
        if (!articleToDelete) return;

        setDeleteLoading(true);
        try {
            const response = await articleService.deleteArticle(
                articleToDelete.id
            );

            if (response.success) {
                alert("Xóa bài viết thành công!");
                setIsDeleteDialogOpen(false);
                setArticleToDelete(null);
                // Refresh list và stats
                const res = await articleService.getUserArticles({
                    page,
                    limit,
                    search: searchTerm,
                    status: statusFilter,
                });
                if (res?.success) {
                    setArticles(res.data || []);
                    setTotal(res.pagination?.total || 0);
                }
                refreshStats();
            } else {
                alert(response.message || "Có lỗi xảy ra khi xóa bài viết");
            }
        } catch (error) {
            console.error("Error deleting article:", error);
            alert("Có lỗi xảy ra khi xóa bài viết");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleEdit = (article) => {
        setEditingArticle(article);
        setIsFormOpen(true);
    };

    const handleDelete = (article) => {
        setArticleToDelete(article);
        setIsDeleteDialogOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingArticle(null);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN");
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            "Bản nháp": { label: "Bản nháp", class: "status-draft" },
            "Chờ duyệt": { label: "Chờ duyệt", class: "status-pending" },
            "Đã xuất bản": { label: "Đã xuất bản", class: "status-published" },
            "Bị từ chối": { label: "Bị từ chối", class: "status-rejected" },
        };
        const statusInfo = statusMap[status] || {
            label: status,
            class: "status-default",
        };
        return (
            <span className={`status-badge ${statusInfo.class}`}>
                {statusInfo.label}
            </span>
        );
    };

    if (!user) {
        return (
            <div className="user-articles-page">
                <div className="error-message">
                    Vui lòng đăng nhập để quản lý bài viết
                </div>
            </div>
        );
    }

    return (
        <div className="user-articles-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <h1 className="page-title">Bài viết của tôi</h1>
                    <p className="page-description">
                        Quản lý các bài viết bạn đã tạo
                    </p>
                </div>
                <Button
                    onClick={() => setIsFormOpen(true)}
                    variant="primary"
                    className="create-btn"
                >
                    + Tạo bài viết mới
                </Button>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Tìm kiếm bài viết..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <Button type="submit" variant="primary">
                        Tìm kiếm
                    </Button>
                </form>

                <select
                    name="status"
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                    }}
                    className="status-filter"
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="Bản nháp">Bản nháp</option>
                    <option value="Chờ duyệt">Chờ duyệt</option>
                    <option value="Đã xuất bản">Đã xuất bản</option>
                    <option value="Bị từ chối">Bị từ chối</option>
                </select>
            </div>

            {/* Stats */}
            <div className="stats-section">
                <div className="stat-card">
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Tổng bài viết</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.published}</div>
                    <div className="stat-label">Đã xuất bản</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.pending}</div>
                    <div className="stat-label">Chờ duyệt</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.draft}</div>
                    <div className="stat-label">Bản nháp</div>
                </div>
            </div>

            {/* Articles List */}
            <div className="articles-container">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Đang tải...</p>
                    </div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : articles.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📝</div>
                        <h3>Chưa có bài viết nào</h3>
                        <p>Hãy tạo bài viết đầu tiên của bạn!</p>
                        <Button
                            onClick={() => setIsFormOpen(true)}
                            variant="primary"
                        >
                            Tạo bài viết mới
                        </Button>
                    </div>
                ) : (
                    <div className="articles-grid">
                        {articles.map((article) => (
                            <div key={article.id} className="article-card">
                                <div className="article-image">
                                    {article.coverImage ? (
                                        <img
                                            src={article.coverImage}
                                            alt={article.title}
                                            onError={(e) => {
                                                e.target.src =
                                                    "https://via.placeholder.com/400x250/667eea/ffffff?text=No+Image";
                                            }}
                                        />
                                    ) : (
                                        <div className="placeholder-image">
                                            <span>📰</span>
                                        </div>
                                    )}
                                </div>
                                <div className="article-content">
                                    <div className="article-header">
                                        <h3 className="article-title">
                                            {article.title}
                                        </h3>
                                        {getStatusBadge(article.status)}
                                    </div>

                                    <div className="article-meta">
                                        <span className="meta-item">
                                            📅 {formatDate(article.createdAt)}
                                        </span>
                                        {article.publishedAt && (
                                            <span className="meta-item">
                                                🌐{" "}
                                                {formatDate(
                                                    article.publishedAt
                                                )}
                                            </span>
                                        )}
                                    </div>

                                    <div className="article-actions">
                                        <Button
                                            onClick={() =>
                                                navigate(`/news/${article.id}`)
                                            }
                                            variant="secondary"
                                            size="small"
                                        >
                                            Xem
                                        </Button>
                                        <Button
                                            onClick={() => handleEdit(article)}
                                            variant="primary"
                                            size="small"
                                        >
                                            Sửa
                                        </Button>
                                        <Button
                                            onClick={() =>
                                                handleDelete(article)
                                            }
                                            variant="danger"
                                            size="small"
                                        >
                                            Xóa
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!loading && articles.length > 0 && totalPages > 1 && (
                <div className="pagination">
                    <Button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        variant="secondary"
                    >
                        ← Trước
                    </Button>
                    <span className="page-info">
                        Trang {page} / {totalPages}
                    </span>
                    <Button
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                        variant="secondary"
                    >
                        Sau →
                    </Button>
                </div>
            )}

            {/* Article Form Modal */}
            {isFormOpen && (
                <div className="modal-overlay" onClick={handleCloseForm}>
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ArticleForm
                            title={
                                editingArticle
                                    ? "Sửa bài viết"
                                    : "Thêm bài viết mới"
                            }
                            mode={editingArticle ? "edit" : "create"}
                            initialValues={editingArticle}
                            onSubmit={
                                editingArticle
                                    ? handleUpdateArticle
                                    : handleCreateArticle
                            }
                            onCancel={handleCloseForm}
                            loading={formLoading}
                            hideStatus={true}
                            defaultStatus="Chờ duyệt"
                            autoSubmitDraft={true}
                        />
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setArticleToDelete(null);
                }}
                onConfirm={handleDeleteArticle}
                title="Xác nhận xóa"
                message={`Bạn có chắc chắn muốn xóa bài viết "${articleToDelete?.title}"?`}
                loading={deleteLoading}
            />
        </div>
    );
};

export default UserArticles;
