import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, ConfirmDialog, EventForm } from "@/components";
import eventService from "@/services/eventService";
import periodService from "@/services/periodService";
import locationService from "@/services/locationService";
import { formatShortDateRange } from "@/utils/dateUtils";
import { eventsStat } from "@/assets/icons";
import "../AdminCommon.css";
import "./AdminEvents.css";

const defaultFilters = { q: "" };

const AdminEvents = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filters, setFilters] = useState(defaultFilters);
    const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [periodNames, setPeriodNames] = useState({});
    const [locationNames, setLocationNames] = useState({});

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
        setEditingEvent(null);
    };

    // Load data from API
    useEffect(() => {
        const loadEvents = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await eventService.getAllEvents({
                    page,
                    limit,
                    search: appliedFilters.q,
                });

                if (res?.success) {
                    const eventsData = res.data || [];
                    setEvents(eventsData);
                    setTotal(res.pagination?.total || 0);

                    // Fetch period and location names
                    const periodIds = [
                        ...new Set(
                            eventsData
                                .filter((e) => e.periodId)
                                .map((e) => e.periodId)
                        ),
                    ];
                    const locationIds = [
                        ...new Set(
                            eventsData
                                .filter((e) => e.locationId)
                                .map((e) => e.locationId)
                        ),
                    ];

                    const pNames = {};
                    const lNames = {};

                    await Promise.all([
                        ...periodIds.map(async (periodId) => {
                            try {
                                const periodRes =
                                    await periodService.getPeriodNameById(
                                        periodId
                                    );
                                if (periodRes?.success) {
                                    pNames[periodId] = periodRes.data.name;
                                }
                            } catch (err) {
                                console.error(
                                    `Error fetching period name for ${periodId}:`,
                                    err
                                );
                            }
                        }),
                        ...locationIds.map(async (locationId) => {
                            try {
                                const locationRes =
                                    await locationService.getLocationById(
                                        locationId
                                    );
                                if (locationRes?.success) {
                                    lNames[locationId] = locationRes.data.name;
                                }
                            } catch (err) {
                                console.error(
                                    `Error fetching location name for ${locationId}:`,
                                    err
                                );
                            }
                        }),
                    ]);

                    setPeriodNames(pNames);
                    setLocationNames(lNames);
                } else {
                    console.error("API response error:", res);
                    setError(res?.message || "Không thể tải danh sách sự kiện");
                }
            } catch (e) {
                console.error("Error loading events:", e);
                setError("Có lỗi xảy ra khi tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };
        loadEvents();
    }, [page, limit, refreshKey, appliedFilters.q]);

    const handleCreateEvent = async (formData) => {
        setFormLoading(true);
        try {
            const response = await eventService.createEvent(formData);
            if (response.success) {
                setIsFormOpen(false);
                handleRefresh();
            } else {
                setError(response.message || "Tạo sự kiện thất bại");
            }
        } catch (err) {
            console.error("Lỗi khi tạo sự kiện:", err);
            setError("Có lỗi xảy ra khi tạo sự kiện");
        } finally {
            setFormLoading(false);
        }
    };

    const handleEditClick = (event) => {
        setEditingEvent(event);
        setIsFormOpen(true);
    };

    const handleUpdateEvent = async (formData) => {
        if (!editingEvent) return;

        setFormLoading(true);
        try {
            const response = await eventService.updateEvent(
                editingEvent.id,
                formData
            );
            if (response.success) {
                setIsFormOpen(false);
                setEditingEvent(null);
                handleRefresh();
            } else {
                setError(response.message || "Cập nhật sự kiện thất bại");
            }
        } catch (err) {
            console.error("Lỗi khi cập nhật sự kiện:", err);
            setError("Có lỗi xảy ra khi cập nhật sự kiện");
        } finally {
            setFormLoading(false);
        }
    };

    const handleFormSubmit = (formData) => {
        if (editingEvent) {
            handleUpdateEvent(formData);
        } else {
            handleCreateEvent(formData);
        }
    };

    const handleDeleteClick = (event) => {
        setEventToDelete(event);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!eventToDelete) return;

        setDeleteLoading(true);
        try {
            const response = await eventService.deleteEvent(eventToDelete.id);
            if (response.success) {
                setIsDeleteDialogOpen(false);
                setEventToDelete(null);
                handleRefresh();
            } else {
                setError(response.message || "Xóa sự kiện thất bại");
            }
        } catch (err) {
            console.error("Lỗi khi xóa sự kiện:", err);
            setError("Có lỗi xảy ra khi xóa sự kiện");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteDialogOpen(false);
        setEventToDelete(null);
    };

    const formatEventDate = (event) => {
        return formatShortDateRange(
            event.startDate,
            event.startMonth,
            event.startYear,
            event.endDate,
            event.endMonth,
            event.endYear
        );
    };

    return (
        <div className="events-management">
            <div className="admin-page-header events">
                <h1>
                    <img src={eventsStat} alt="" className="header-icon" />
                    Quản lý sự kiện
                </h1>
                <p>Quản lý các sự kiện lịch sử trong hệ thống</p>
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <EventForm
                            title={
                                editingEvent
                                    ? "Chỉnh sửa sự kiện"
                                    : "Thêm sự kiện mới"
                            }
                            mode={editingEvent ? "edit" : "create"}
                            initialValues={editingEvent}
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
                title="Xác nhận xóa sự kiện"
                message={`Bạn có chắc chắn muốn xóa sự kiện "${eventToDelete?.name}"? Hành động này không thể hoàn tác.`}
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
                        placeholder="Tìm theo tên sự kiện... (nhấn Enter hoặc nút Tìm kiếm)"
                    />
                    <Button onClick={handleSearch}>Tìm kiếm</Button>
                </div>
                <div className="actions">
                    <Button
                        className="primary"
                        onClick={() => setIsFormOpen(true)}
                    >
                        Thêm sự kiện
                    </Button>
                </div>
            </div>

            <div className="page-content">
                {error && <div className="error-box">{error}</div>}
                {loading ? (
                    <div className="loading">Đang tải...</div>
                ) : (
                    <div className="table-wrapper">
                        <table className="events-table">
                            <thead>
                                <tr>
                                    <th>Tên sự kiện</th>
                                    <th>Thời gian</th>
                                    <th>Địa danh</th>
                                    <th>Thời kỳ</th>
                                    <th>Nhân vật liên quan</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.length === 0 ? (
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
                                                    : "Không có dữ liệu sự kiện"}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    events.map((event) => (
                                        <tr key={event.id}>
                                            <td>
                                                <div className="event-info">
                                                    <div className="event-name">
                                                        {event.name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="center-content">
                                                {formatEventDate(event)}
                                            </td>
                                            <td className="center-content">
                                                {event.locationId
                                                    ? locationNames[
                                                          event.locationId
                                                      ] || "Đang tải..."
                                                    : "—"}
                                            </td>
                                            <td className="center-content">
                                                {event.periodId
                                                    ? periodNames[
                                                          event.periodId
                                                      ] || "Đang tải..."
                                                    : "—"}
                                            </td>
                                            <td className="center-content">
                                                {event.related_figures &&
                                                event.related_figures.length > 0
                                                    ? `${event.related_figures.length} nhân vật`
                                                    : "—"}
                                            </td>
                                            <td className="row-actions">
                                                <Button
                                                    size="small"
                                                    variant="edit"
                                                    onClick={() =>
                                                        handleEditClick(event)
                                                    }
                                                >
                                                    Sửa
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="view"
                                                    onClick={() =>
                                                        navigate(
                                                            `/admin/preview/events/${event.id}`
                                                        )
                                                    }
                                                >
                                                    Xem trước
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="delete"
                                                    onClick={() =>
                                                        handleDeleteClick(event)
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

export default AdminEvents;
