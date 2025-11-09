import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, ConfirmDialog, ArticleForm } from "@/components";
import articleService from "@/services/articleService";
import { myArticles } from "@/assets/icons";
import "../AdminCommon.css";
import "./AdminArticles.css";

const defaultFilters = { q: "", status: "" };

const AdminArticles = () => {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filters, setFilters] = useState(defaultFilters);
    const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [articleToDelete, setArticleToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(total / limit)),
        [total, limit]
    );

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));

        // Nếu thay đổi status, tự động apply filter
        if (name === "status") {
            setAppliedFilters((prev) => ({ ...prev, status: value }));
            setPage(1);
        }
    };

    const handleSearch = () => {
        setAppliedFilters(filters);
        setPage(1);
        handleRefresh();
    };

    const handleRefresh = () => {
        setRefreshKey((k) => k + 1);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingArticle(null);
    };

    // Load data from API
    useEffect(() => {
        const loadArticles = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await articleService.getAllArticles({
                    page,
                    limit,
                    search: appliedFilters.q,
                    status: appliedFilters.status,
                });

                if (res?.success) {
                    const articlesData = res.data || [];
                    setArticles(articlesData);
                    setTotal(res.pagination?.total || 0);
                } else {
                    console.error("API response error:", res);
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
    }, [page, limit, refreshKey, appliedFilters.q, appliedFilters.status]);

    const handleCreateArticle = async (formData) => {
        setFormLoading(true);
        try {
            const response = await articleService.createArticle(formData);

            if (response.success) {
                alert("Tạo bài viết thành công!");
                setIsFormOpen(false);
                handleRefresh();
            } else {
                const errorMsg = response.message || "Tạo bài viết thất bại";
                console.error("Create failed:", errorMsg);
                setError(errorMsg);
                alert(errorMsg);
            }
        } catch (err) {
            console.error("Lỗi khi tạo bài viết:", err);
            console.error("Error details:", err.response?.data);
            const errorMsg =
                err.response?.data?.message || "Có lỗi xảy ra khi tạo bài viết";
            setError(errorMsg);
            alert(errorMsg);
        } finally {
            setFormLoading(false);
        }
    };

    const handleEditClick = (article) => {
        setEditingArticle(article);
        setIsFormOpen(true);
    };

    const handleUpdateArticle = async (formData, silent = false) => {
        if (!editingArticle) return;

        setFormLoading(true);
        try {
            const response = await articleService.updateArticle(
                editingArticle.id,
                formData
            );

            if (response.success) {
                if (!silent) {
                    alert("Cập nhật bài viết thành công!");
                    setIsFormOpen(false);
                    setEditingArticle(null);
                }
                handleRefresh();
                return true;
            } else {
                const errorMsg =
                    response.message || "Cập nhật bài viết thất bại";
                console.error("Update failed:", errorMsg);
                if (!silent) {
                    setError(errorMsg);
                    alert(errorMsg);
                }
                return false;
            }
        } catch (err) {
            console.error("Lỗi khi cập nhật bài viết:", err);
            console.error("Error details:", err.response?.data);
            const errorMsg =
                err.response?.data?.message ||
                "Có lỗi xảy ra khi cập nhật bài viết";
            if (!silent) {
                setError(errorMsg);
                alert(errorMsg);
            }
            return false;
        } finally {
            setFormLoading(false);
        }
    };

    const handleFormSubmit = (formData, silent = false) => {
        if (editingArticle) {
            return handleUpdateArticle(formData, silent);
        } else {
            handleCreateArticle(formData);
        }
    };

    const handleDeleteClick = (article) => {
        setArticleToDelete(article);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!articleToDelete) return;

        setDeleteLoading(true);
        try {
            const response = await articleService.deleteArticle(
                articleToDelete.id
            );

            if (response.success) {
                setIsDeleteDialogOpen(false);
                setArticleToDelete(null);
                handleRefresh();
            } else {
                setError(response.message || "Xóa bài viết thất bại");
            }
        } catch (err) {
            console.error("Error deleting article:", err);
            setError("Có lỗi xảy ra khi xóa bài viết");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteDialogOpen(false);
        setArticleToDelete(null);
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            "Bản nháp": { text: "Bản nháp", class: "status-draft" },
            "Chờ duyệt": { text: "Chờ duyệt", class: "status-pending" },
            "Đã xuất bản": { text: "Đã xuất bản", class: "status-published" },
            "Lưu trữ": { text: "Lưu trữ", class: "status-archived" },
        };
        const statusInfo = statusMap[status] || statusMap["Bản nháp"];
        return (
            <span className={`status-badge ${statusInfo.class}`}>
                {statusInfo.text}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN");
    };

    return (
        <div className="articles-management">
            <div className="admin-page-header articles">
                <h1>
                    <img src={myArticles} alt="" className="header-icon" />
                    Quản lý bài viết
                </h1>
                <p>Quản lý các bài viết trong hệ thống</p>
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <ArticleForm
                            title={
                                editingArticle
                                    ? "Chỉnh sửa bài viết"
                                    : "Thêm bài viết mới"
                            }
                            mode={editingArticle ? "edit" : "create"}
                            initialValues={editingArticle}
                            onSubmit={handleFormSubmit}
                            onCancel={handleCloseForm}
                            loading={formLoading}
                        />
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={isDeleteDialogOpen}
                title="Xác nhận xóa bài viết"
                message={`Bạn có chắc chắn muốn xóa bài viết "${articleToDelete?.title}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                cancelText="Hủy"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                loading={deleteLoading}
                danger={true}
            />

            <div className="toolbar">
                <div className="filters">
                    <input
                        type="text"
                        name="q"
                        value={filters.q}
                        onChange={handleFilterChange}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSearch();
                            }
                        }}
                        placeholder="Tìm theo tiêu đề bài viết..."
                    />
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="status-filter"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="Bản nháp">Bản nháp</option>
                        <option value="Chờ duyệt">Chờ duyệt</option>
                        <option value="Đã xuất bản">Đã xuất bản</option>
                        <option value="Lưu trữ">Lưu trữ</option>
                    </select>
                    <Button onClick={handleSearch}>Tìm kiếm</Button>
                </div>
                <div className="actions">
                    <Button
                        className="primary"
                        onClick={() => setIsFormOpen(true)}
                    >
                        Thêm bài viết
                    </Button>
                </div>
            </div>

            <div className="page-content">
                {error && <div className="error-box">{error}</div>}
                {loading ? (
                    <div className="loading">Đang tải...</div>
                ) : (
                    <div className="table-wrapper">
                        <table className="articles-table">
                            <thead>
                                <tr>
                                    <th>Tiêu đề</th>
                                    <th>Tác giả</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày xuất bản</th>
                                    <th>Quan hệ</th>
                                    <th>Ngày tạo</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {articles.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            style={{
                                                textAlign: "center",
                                                padding: "40px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    color: "#666",
                                                    fontSize: "16px",
                                                }}
                                            >
                                                {loading
                                                    ? "Đang tải..."
                                                    : "Không có dữ liệu bài viết"}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    articles.map((article) => (
                                        <tr key={article.id}>
                                            <td>
                                                <div className="article-info">
                                                    <div className="article-title">
                                                        {article.title}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="center-content">
                                                <span className="author-name">
                                                    {article.authorName || "—"}
                                                </span>
                                            </td>
                                            <td className="center-content">
                                                {getStatusBadge(article.status)}
                                            </td>
                                            <td className="center-content">
                                                {formatDate(
                                                    article.publishedAt
                                                )}
                                            </td>
                                            <td className="center-content">
                                                <div className="relations-summary">
                                                    {article.relations?.figures
                                                        ?.length > 0 && (
                                                        <span className="relation-badge">
                                                            {
                                                                article
                                                                    .relations
                                                                    .figures
                                                                    .length
                                                            }{" "}
                                                            nhân vật
                                                        </span>
                                                    )}
                                                    {article.relations?.periods
                                                        ?.length > 0 && (
                                                        <span className="relation-badge">
                                                            {
                                                                article
                                                                    .relations
                                                                    .periods
                                                                    .length
                                                            }{" "}
                                                            thời kỳ
                                                        </span>
                                                    )}
                                                    {article.relations?.events
                                                        ?.length > 0 && (
                                                        <span className="relation-badge">
                                                            {
                                                                article
                                                                    .relations
                                                                    .events
                                                                    .length
                                                            }{" "}
                                                            sự kiện
                                                        </span>
                                                    )}
                                                    {article.relations
                                                        ?.locations?.length >
                                                        0 && (
                                                        <span className="relation-badge">
                                                            {
                                                                article
                                                                    .relations
                                                                    .locations
                                                                    .length
                                                            }{" "}
                                                            địa danh
                                                        </span>
                                                    )}
                                                    {!article.relations?.figures
                                                        ?.length &&
                                                        !article.relations
                                                            ?.periods?.length &&
                                                        !article.relations
                                                            ?.events?.length &&
                                                        !article.relations
                                                            ?.locations
                                                            ?.length &&
                                                        "—"}
                                                </div>
                                            </td>
                                            <td className="center-content">
                                                {formatDate(article.createdAt)}
                                            </td>
                                            <td className="row-actions">
                                                <Button
                                                    size="small"
                                                    variant="edit"
                                                    onClick={() =>
                                                        handleEditClick(article)
                                                    }
                                                >
                                                    Sửa
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="view"
                                                    onClick={() =>
                                                        navigate(
                                                            `/admin/preview/articles/${article.id}`
                                                        )
                                                    }
                                                >
                                                    Xem trước
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="delete"
                                                    onClick={() =>
                                                        handleDeleteClick(
                                                            article
                                                        )
                                                    }
                                                >
                                                    Xóa
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="pagination">
                <div className="page-info">
                    Trang {page}/{totalPages} • Tổng {total}
                </div>
                <div className="page-controls">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Trước
                    </button>
                    <select
                        value={page}
                        onChange={(e) => setPage(parseInt(e.target.value, 10))}
                    >
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {i + 1}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                    >
                        Sau
                    </button>
                    <select
                        value={limit}
                        onChange={(e) => {
                            setLimit(parseInt(e.target.value, 10));
                            setPage(1);
                        }}
                    >
                        {[10, 20, 50].map((n) => (
                            <option key={n} value={n}>
                                {n}/trang
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default AdminArticles;
