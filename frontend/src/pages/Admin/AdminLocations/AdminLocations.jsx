import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, LocationForm, ConfirmDialog } from "@/components";
import locationService from "@/services/locationService";
import "./AdminLocations.css";

const defaultFilters = { q: "" };

const AdminLocations = () => {
    const navigate = useNavigate();
    const [locations, setLocations] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filters, setFilters] = useState(defaultFilters);
    const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [locationToDelete, setLocationToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

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
        setEditingLocation(null);
    };

    // Load data from API
    useEffect(() => {
        const loadLocations = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await locationService.getAllLocations({
                    page,
                    limit,
                    search: appliedFilters.q, // Sử dụng giá trị tìm kiếm
                });

                if (res?.success) {
                    setLocations(res.data || []);
                    setTotal(res.pagination?.total || 0);
                } else {
                    console.error("API response error:", res);
                    setError(
                        res?.message || "Không thể tải danh sách địa điểm"
                    );
                }
            } catch (e) {
                console.error("Error loading locations:", e);
                setError("Có lỗi xảy ra khi tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };
        loadLocations();
    }, [page, limit, refreshKey, appliedFilters.q]); // Thêm appliedFilters.q vào dependencies

    const handleCreateLocation = async (formData) => {
        setFormLoading(true);
        try {
            const response = await locationService.createLocation(formData);
            if (response.success) {
                setIsFormOpen(false);
                handleRefresh();
            } else {
                setError(response.message || "Tạo địa điểm thất bại");
            }
        } catch (err) {
            console.error("Lỗi khi tạo địa điểm:", err);
            setError("Có lỗi xảy ra khi tạo địa điểm");
        } finally {
            setFormLoading(false);
        }
    };

    const handleEditClick = (location) => {
        setEditingLocation(location);
        setIsFormOpen(true);
    };

    const handleUpdateLocation = async (formData) => {
        if (!editingLocation) return;

        setFormLoading(true);
        try {
            const response = await locationService.updateLocation(
                editingLocation.id,
                formData
            );
            if (response.success) {
                setIsFormOpen(false);
                setEditingLocation(null);
                handleRefresh();
            } else {
                setError(response.message || "Cập nhật địa điểm thất bại");
            }
        } catch (err) {
            console.error("Lỗi khi cập nhật địa điểm:", err);
            setError("Có lỗi xảy ra khi cập nhật địa điểm");
        } finally {
            setFormLoading(false);
        }
    };

    const handleFormSubmit = (formData) => {
        if (editingLocation) {
            handleUpdateLocation(formData);
        } else {
            handleCreateLocation(formData);
        }
    };

    const handleDeleteClick = (location) => {
        setLocationToDelete(location);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!locationToDelete) return;

        setDeleteLoading(true);
        try {
            const response = await locationService.deleteLocation(
                locationToDelete.id
            );
            if (response.success) {
                setIsDeleteDialogOpen(false);
                setLocationToDelete(null);
                handleRefresh();
            } else {
                setError(response.message || "Xóa địa điểm thất bại");
            }
        } catch (err) {
            console.error("Lỗi khi xóa địa điểm:", err);
            setError("Có lỗi xảy ra khi xóa địa điểm");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteDialogOpen(false);
        setLocationToDelete(null);
    };

    return (
        <div className="locations-management">
            <div className="page-header">
                <h1>Quản lý địa điểm</h1>
                <p>Quản lý các địa điểm lịch sử trong hệ thống</p>
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <LocationForm
                            title={
                                editingLocation
                                    ? "Chỉnh sửa địa điểm"
                                    : "Thêm địa điểm mới"
                            }
                            mode={editingLocation ? "edit" : "create"}
                            initialData={editingLocation}
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
                        placeholder="Tìm theo tên địa điểm, mô tả... (nhấn Enter hoặc nút Tìm kiếm)"
                    />
                    <Button onClick={handleSearch}>Tìm kiếm</Button>
                </div>
                <div className="actions">
                    <Button
                        className="primary"
                        onClick={() => setIsFormOpen(true)}
                    >
                        Thêm địa điểm
                    </Button>
                </div>
            </div>

            <div className="page-content">
                {error && <div className="error-box">{error}</div>}
                {loading ? (
                    <div className="loading">Đang tải...</div>
                ) : (
                    <div className="table-wrapper">
                        <table className="locations-table">
                            <thead>
                                <tr>
                                    <th>Tên địa điểm</th>
                                    <th>Vị trí</th>
                                    <th>Tóm tắt</th>
                                    <th>Ngày tạo</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {locations.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="5"
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
                                                    : "Không có dữ liệu địa điểm"}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    locations.map((location) => (
                                        <tr key={location.id}>
                                            <td>
                                                <div className="location-info">
                                                    <div className="location-name">
                                                        {location.name ||
                                                            "Không có tên"}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="location-position">
                                                    <span className="latitude">
                                                        {location.latitude}° N
                                                    </span>
                                                    <span className="separator">
                                                        {", "}
                                                    </span>
                                                    <span className="longitude">
                                                        {location.longitude}° E
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="summary-cell">
                                                <div className="location-summary">
                                                    {location.summary ||
                                                        "Không có tóm tắt"}
                                                </div>
                                            </td>
                                            <td>
                                                {location.created_at
                                                    ? new Date(
                                                          location.created_at
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
                                                        handleEditClick(
                                                            location
                                                        )
                                                    }
                                                >
                                                    Sửa
                                                </Button>
                                                <Button
                                                    variant="view"
                                                    size="small"
                                                    onClick={() =>
                                                        navigate(
                                                            `/admin/preview/locations/${location.id}`
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
                                                            location
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
                title="Xóa địa điểm"
                message={`Bạn có chắc chắn muốn xóa địa điểm "${locationToDelete?.name}"? Hành động này không thể hoàn tác.`}
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

export default AdminLocations;
