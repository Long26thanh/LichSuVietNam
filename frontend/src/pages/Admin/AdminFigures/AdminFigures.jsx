import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, ConfirmDialog, FigureForm } from "@/components";
import figureService from "@/services/figureService";
import periodService from "@/services/periodService";
import { formatShortDateRange } from "@/utils/dateUtils";
import "./AdminFigures.css";

const defaultFilters = { q: "" };

const AdminFigures = () => {
    const navigate = useNavigate();
    const [figures, setFigures] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filters, setFilters] = useState(defaultFilters);
    const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingFigure, setEditingFigure] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [figureToDelete, setFigureToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [periodNames, setPeriodNames] = useState({});

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(total / limit)),
        [total, limit]
    );

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
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
        setEditingFigure(null);
    };

    // Load data from API
    useEffect(() => {
        const loadFigures = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await figureService.getAllFigures({
                    page,
                    limit,
                    search: appliedFilters.q,
                });

                if (res?.success) {
                    const figuresData = res.data || [];
                    setFigures(figuresData);
                    setTotal(res.pagination?.total || 0);

                    // Fetch period names for all figures with period_id
                    const periodIds = [
                        ...new Set(
                            figuresData
                                .filter((f) => f.period_id)
                                .map((f) => f.period_id)
                        ),
                    ];

                    const names = {};
                    await Promise.all(
                        periodIds.map(async (periodId) => {
                            try {
                                const periodRes =
                                    await periodService.getPeriodNameById(
                                        periodId
                                    );
                                if (periodRes?.success) {
                                    names[periodId] = periodRes.data.name;
                                }
                            } catch (err) {
                                console.error(
                                    `Error fetching period name for ${periodId}:`,
                                    err
                                );
                            }
                        })
                    );
                    setPeriodNames(names);
                } else {
                    console.error("API response error:", res);
                    setError(
                        res?.message || "Không thể tải danh sách nhân vật"
                    );
                }
            } catch (e) {
                console.error("Error loading figures:", e);
                setError("Có lỗi xảy ra khi tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };
        loadFigures();
    }, [page, limit, refreshKey, appliedFilters.q]);

    const handleCreateFigure = async (formData) => {
        setFormLoading(true);
        try {
            const response = await figureService.createFigure(formData);
            if (response.success) {
                setIsFormOpen(false);
                handleRefresh();
            } else {
                setError(response.message || "Tạo nhân vật thất bại");
            }
        } catch (err) {
            console.error("Lỗi khi tạo nhân vật:", err);
            setError("Có lỗi xảy ra khi tạo nhân vật");
        } finally {
            setFormLoading(false);
        }
    };

    const handleEditClick = (figure) => {
        setEditingFigure(figure);
        setIsFormOpen(true);
    };

    const handleUpdateFigure = async (formData) => {
        if (!editingFigure) return;

        setFormLoading(true);
        try {
            const response = await figureService.updateFigure(
                editingFigure.id,
                formData
            );
            if (response.success) {
                setIsFormOpen(false);
                setEditingFigure(null);
                handleRefresh();
            } else {
                setError(response.message || "Cập nhật nhân vật thất bại");
            }
        } catch (err) {
            console.error("Lỗi khi cập nhật nhân vật:", err);
            setError("Có lỗi xảy ra khi cập nhật nhân vật");
        } finally {
            setFormLoading(false);
        }
    };

    const handleFormSubmit = (formData) => {
        if (editingFigure) {
            handleUpdateFigure(formData);
        } else {
            handleCreateFigure(formData);
        }
    };

    const handleDeleteClick = (figure) => {
        setFigureToDelete(figure);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!figureToDelete) return;

        setDeleteLoading(true);
        try {
            const response = await figureService.deleteFigure(
                figureToDelete.id
            );
            if (response.success) {
                setIsDeleteDialogOpen(false);
                setFigureToDelete(null);
                handleRefresh();
            } else {
                setError(response.message || "Xóa nhân vật thất bại");
            }
        } catch (err) {
            console.error("Lỗi khi xóa nhân vật:", err);
            setError("Có lỗi xảy ra khi xóa nhân vật");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteDialogOpen(false);
        setFigureToDelete(null);
    };

    return (
        <div className="figures-management">
            <div className="page-header">
                <h1>Quản lý nhân vật</h1>
                <p>Quản lý các nhân vật lịch sử trong hệ thống</p>
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <FigureForm
                            title={
                                editingFigure
                                    ? "Chỉnh sửa nhân vật"
                                    : "Thêm nhân vật mới"
                            }
                            mode={editingFigure ? "edit" : "create"}
                            initialData={editingFigure}
                            onSubmit={handleFormSubmit}
                            onCancel={handleCloseForm}
                            isLoading={formLoading}
                        />
                    </div>
                </div>
            )}

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
                        placeholder="Tìm theo tên nhân vật, chức danh... (nhấn Enter hoặc nút Tìm kiếm)"
                    />
                    <Button onClick={handleSearch}>Tìm kiếm</Button>
                </div>
                <div className="actions">
                    <Button
                        className="primary"
                        onClick={() => setIsFormOpen(true)}
                    >
                        Thêm nhân vật
                    </Button>
                </div>
            </div>

            <div className="page-content">
                {error && <div className="error-box">{error}</div>}
                {loading ? (
                    <div className="loading">Đang tải...</div>
                ) : (
                    <div className="table-wrapper">
                        <table className="figures-table">
                            <thead>
                                <tr>
                                    <th>Tên nhân vật</th>
                                    <th>Năm sinh - Năm mất</th>
                                    <th>Chức danh</th>
                                    <th>Thời kỳ</th>
                                    <th>Ngày tạo</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {figures.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="6"
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
                                                    : "Không có dữ liệu nhân vật"}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    figures.map((figure) => (
                                        <tr key={figure.id}>
                                            <td>
                                                <div className="figure-info">
                                                    <div className="figure-name">
                                                        {figure.name ||
                                                            "Không có tên"}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="center-content">
                                                <div className="figure-years">
                                                    {formatShortDateRange(
                                                        {
                                                            day: figure.birth_date,
                                                            month: figure.birth_month,
                                                            year: figure.birth_year,
                                                        },
                                                        {
                                                            day: figure.death_date,
                                                            month: figure.death_month,
                                                            year: figure.death_year,
                                                        }
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="figure-title">
                                                    {figure.title ||
                                                        "Không có chức danh"}
                                                </div>
                                            </td>
                                            <td className="center-content">
                                                <div className="figure-period">
                                                    {figure.period_id
                                                        ? periodNames[
                                                              figure.period_id
                                                          ] || "Đang tải..."
                                                        : "—"}
                                                </div>
                                            </td>
                                            <td className="center-content">
                                                {figure.created_at
                                                    ? new Date(
                                                          figure.created_at
                                                      ).toLocaleDateString(
                                                          "vi-VN"
                                                      )
                                                    : "—"}
                                            </td>
                                            <td className="row-actions">
                                                <Button
                                                    variant="edit"
                                                    size="small"
                                                    onClick={() =>
                                                        handleEditClick(figure)
                                                    }
                                                >
                                                    Sửa
                                                </Button>
                                                <Button
                                                    variant="view"
                                                    size="small"
                                                    onClick={() =>
                                                        navigate(
                                                            `/admin/preview/figures/${figure.id}`
                                                        )
                                                    }
                                                >
                                                    Xem trước
                                                </Button>
                                                <Button
                                                    variant="delete"
                                                    size="small"
                                                    onClick={() =>
                                                        handleDeleteClick(
                                                            figure
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

            <ConfirmDialog
                open={isDeleteDialogOpen}
                title="Xóa nhân vật"
                message={`Bạn có chắc chắn muốn xóa nhân vật "${figureToDelete?.name}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                cancelText="Hủy"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                loading={deleteLoading}
                danger={true}
            />
        </div>
    );
};

export default AdminFigures;
