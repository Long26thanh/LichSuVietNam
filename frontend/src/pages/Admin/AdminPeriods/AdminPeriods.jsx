import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, PeriodForm, ConfirmDialog } from "@/components";
import periodService from "@/services/periodService";
import "./AdminPeriods.css";

const defaultFilters = { q: "" };

const AdminPeriods = () => {
    const navigate = useNavigate();
    const [periods, setPeriods] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filters, setFilters] = useState(defaultFilters);
    const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
    const [refreshKey, setRefreshKey] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [editingPeriod, setEditingPeriod] = useState(null);
    const [deletingPeriod, setDeletingPeriod] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(total / limit)),
        [total, limit]
    );

    // Load data from API
    useEffect(() => {
        const loadPeriods = async () => {
            setLoading(true);
            setError("");
            try {
                let res;
                if (appliedFilters.q) {
                    // Sử dụng search API nếu có tìm kiếm
                    res = await periodService.searchPeriods({
                        q: appliedFilters.q,
                    });
                } else {
                    // Lấy tất cả periods
                    res = await periodService.getAllPeriods();
                }

                if (res?.success) {
                    const allPeriods = res.data || [];
                    setTotal(allPeriods.length);

                    // Client-side pagination
                    const start = (page - 1) * limit;
                    const end = start + limit;
                    const paginatedPeriods = allPeriods.slice(start, end);
                    setPeriods(paginatedPeriods);
                } else {
                    console.error("API response error:", res);
                    setError(res?.message || "Không thể tải danh sách thời kỳ");
                }
            } catch (e) {
                setError("Có lỗi xảy ra khi tải dữ liệu");
                console.error("Error loading periods:", e);
            } finally {
                setLoading(false);
            }
        };
        loadPeriods();
    }, [page, limit, appliedFilters, refreshKey]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const handleSearch = () => {
        setAppliedFilters(filters);
        setPage(1);
    };

    const handleRefresh = () => {
        setRefreshKey((k) => k + 1);
    };

    const handleEdit = (period) => {
        setEditingPeriod(period);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingPeriod(null);
    };

    const openDeletePeriod = (period) => {
        setDeletingPeriod(period);
        setShowDeleteConfirm(true);
    };

    const closeDeletePeriod = () => {
        setShowDeleteConfirm(false);
        setDeletingPeriod(null);
    };

    const handleConfirmDelete = async () => {
        if (!deletingPeriod) return;

        try {
            const res = await periodService.deletePeriod(deletingPeriod.id);
            if (res.success) {
                closeDeletePeriod();
                handleRefresh();
            } else {
                throw new Error(res.message || "Không thể xóa thời kỳ");
            }
        } catch (error) {
            console.error("Error deleting period:", error);
            alert(error.message || "Có lỗi xảy ra khi xóa thời kỳ");
        }
    };

    const formatYear = (year) => {
        if (year < 0) {
            return `${Math.abs(year)} TCN`;
        }
        return year.toString();
    };

    return (
        <div className="periods-management">
            <div className="page-header">
                <h1>Quản lý thời kỳ</h1>
                <p>Quản lý các thời kỳ lịch sử trong hệ thống</p>
            </div>

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
                        placeholder="Tìm theo tên thời kỳ, mô tả... (nhấn Enter hoặc nút Tìm kiếm)"
                    />
                    <Button onClick={handleSearch}>Tìm kiếm</Button>
                </div>
                <div className="actions">
                    <Button
                        className="primary"
                        onClick={() => setShowForm(true)}
                    >
                        Thêm thời kỳ
                    </Button>
                </div>
            </div>

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <PeriodForm
                            mode={editingPeriod ? "edit" : "create"}
                            initialValues={editingPeriod}
                            onSubmit={async (formData) => {
                                setFormLoading(true);
                                try {
                                    let res;
                                    if (editingPeriod) {
                                        // Cập nhật thời kỳ
                                        res = await periodService.updatePeriod(
                                            editingPeriod.id,
                                            formData
                                        );
                                        if (res.success) {
                                            handleCloseForm();
                                            handleRefresh();
                                        } else {
                                            throw new Error(
                                                res.message ||
                                                    "Không thể cập nhật thời kỳ"
                                            );
                                        }
                                    } else {
                                        // Tạo thời kỳ mới
                                        res = await periodService.createPeriod(
                                            formData
                                        );
                                        if (res.success) {
                                            handleCloseForm();
                                            handleRefresh();
                                        } else {
                                            throw new Error(
                                                res.message ||
                                                    "Không thể tạo thời kỳ"
                                            );
                                        }
                                    }
                                } catch (error) {
                                    console.error(
                                        `Error ${
                                            editingPeriod
                                                ? "updating"
                                                : "creating"
                                        } period:`,
                                        error
                                    );
                                    alert(
                                        error.message ||
                                            `Có lỗi xảy ra khi ${
                                                editingPeriod
                                                    ? "cập nhật"
                                                    : "tạo"
                                            } thời kỳ`
                                    );
                                } finally {
                                    setFormLoading(false);
                                }
                            }}
                            onCancel={handleCloseForm}
                            loading={formLoading}
                            title={
                                editingPeriod
                                    ? "Chỉnh sửa thời kỳ"
                                    : "Thêm thời kỳ mới"
                            }
                        />
                    </div>
                </div>
            )}

            <div className="page-content">
                {error && <div className="error-box">{error}</div>}
                {loading ? (
                    <div className="loading">Đang tải...</div>
                ) : (
                    <div className="table-wrapper">
                        <table className="periods-table">
                            <thead>
                                <tr>
                                    <th>Tên thời kỳ</th>
                                    <th>Thời gian</th>
                                    <th>Tóm tắt</th>
                                    <th>Ngày tạo</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {periods.length === 0 ? (
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
                                                    : "Không có dữ liệu thời kỳ"}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    periods.map((period) => (
                                        <tr key={period.id}>
                                            <td>
                                                <div className="period-info">
                                                    <div className="period-name">
                                                        {period.name ||
                                                            "Không có tên"}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="period-dates">
                                                    <span className="start-year">
                                                        {formatYear(
                                                            period.start_year
                                                        )}
                                                    </span>
                                                    <span className="separator">
                                                        →
                                                    </span>
                                                    <span className="end-year">
                                                        {formatYear(
                                                            period.end_year
                                                        )}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="summary-cell">
                                                <div className="period-summary">
                                                    {period.summary ||
                                                        "Không có tóm tắt"}
                                                </div>
                                            </td>
                                            <td>
                                                {period.created_at
                                                    ? new Date(
                                                          period.created_at
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
                                                        handleEdit(period)
                                                    }
                                                >
                                                    Sửa
                                                </Button>
                                                <Button
                                                    variant="view"
                                                    size="small"
                                                    onClick={() =>
                                                        navigate(
                                                            `/admin/preview/periods/${period.id}`
                                                        )
                                                    }
                                                >
                                                    Xem trước
                                                </Button>
                                                <Button
                                                    variant="delete"
                                                    size="small"
                                                    onClick={() =>
                                                        openDeletePeriod(period)
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
                open={showDeleteConfirm}
                title="Xác nhận xóa"
                message={`Bạn có chắc chắn muốn xóa thời kỳ "${deletingPeriod?.name}"? Hành động này không thể hoàn tác.`}
                onCancel={closeDeletePeriod}
                onConfirm={handleConfirmDelete}
                confirmText="Xóa"
                cancelText="Hủy"
                danger
            />
        </div>
    );
};

export default AdminPeriods;
