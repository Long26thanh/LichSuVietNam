import React, { useEffect, useMemo, useState } from "react";
import userService from "@/services/userService";
import { Button, UserForm, ConfirmDialog } from "@/components";
import ResetPasswordModal from "@/components/ResetPasswordModal/ResetPasswordModal";
import { addUser } from "@/assets/icons";
import { useAuth } from "../../../contexts/AuthContext";
import { validatePassword } from "@/utils";
import "./AdminUsers.css";

const defaultFilters = { q: "", role: "", status: "" };

const AdminUsers = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filters, setFilters] = useState(defaultFilters);
    const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
    const [refreshKey, setRefreshKey] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showReset, setShowReset] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [targetUser, setTargetUser] = useState(null);

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(total / limit)),
        [total, limit]
    );

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await userService.getAllUsers({
                    page,
                    limit,
                    ...appliedFilters,
                });
                if (res?.success) {
                    setUsers(res.data?.data || []);
                    setTotal(res.data?.pagination?.total || 0);
                } else {
                    setError(
                        res?.message || "Không thể tải danh sách người dùng"
                    );
                }
            } catch (e) {
                setError("Có lỗi xảy ra khi tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [page, limit, appliedFilters, refreshKey]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
        setPage(1);

        // Tự động lọc khi thay đổi role hoặc status
        if (name === "role" || name === "status") {
            const newFilters = { ...filters, [name]: value };
            setAppliedFilters(newFilters);
            setRefreshKey((k) => k + 1);
        }
    };

    const handleSearch = () => {
        // Chỉ cập nhật tìm kiếm text (q), giữ nguyên role và status hiện tại
        setAppliedFilters((prev) => ({ ...prev, q: filters.q }));
        setPage(1);
        setRefreshKey((k) => k + 1);
    };

    const handleRefresh = () => {
        setRefreshKey((k) => k + 1);
    };

    const openCreate = () => {
        setEditingUser(null);
        setShowForm(true);
    };

    const openEdit = (user) => {
        console.log("Editing user:", user);
        setEditingUser(user);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingUser(null);
    };

    const handleSubmitForm = async (payload) => {
        setSubmitting(true);
        try {
            const mapped = {
                ...payload,
                is_active: payload.status === "active",
            };
            delete mapped.status;
            console.log("Submitting user data:", mapped);
            if (editingUser) {
                const id = editingUser.id || editingUser._id;
                const res = await userService.updateUser(id, mapped);
                if (res?.success) {
                    closeForm();
                    handleRefresh();
                } else {
                    alert(res?.message || "Không thể cập nhật người dùng");
                }
            } else {
                const res = await userService.createUser(mapped);
                if (res?.success) {
                    closeForm();
                    handleRefresh();
                } else {
                    console.error("Create user failed:", res);
                    alert(res?.message || "Không thể tạo người dùng");
                }
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleChangeRole = async (userId, role) => {
        const res = await userService.updateUserRole(userId, role);
        if (res?.success) handleRefresh();
    };

    const handleChangeStatus = async (userId, status) => {
        const res = await userService.updateUserStatus(userId, status);
        if (res?.success) handleRefresh();
    };

    const handleDelete = async (userId) => {
        if (!window.confirm("Xóa người dùng này?")) return;
        const res = await userService.deleteUser(userId);
        if (res?.success) handleRefresh();
    };

    const openResetPassword = (user) => {
        setTargetUser(user);
        setShowReset(true);
    };

    const closeResetPassword = () => {
        setShowReset(false);
        setTargetUser(null);
    };

    const openDeleteUser = (user) => {
        setTargetUser(user);
        setShowDelete(true);
    };

    const closeDeleteUser = () => {
        setShowDelete(false);
        setTargetUser(null);
    };

    const handleConfirmDelete = async () => {
        if (!targetUser) return;
        setSubmitting(true);
        try {
            const id = targetUser.id || targetUser._id;
            const res = await userService.deleteUser(id);

            if (res?.success) {
                closeDeleteUser();
                handleRefresh();
            } else {
                throw new Error(res?.message || "Không thể xóa người dùng");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            alert(error.message || "Có lỗi xảy ra khi xóa người dùng");
        } finally {
            setSubmitting(false);
        }
    };

    const submitResetPassword = async ({ password }) => {
        if (!targetUser) return;
        setSubmitting(true);
        const id = targetUser.id || targetUser._id;
        const res = await userService.updateUser(id, { password });
        setSubmitting(false);
        if (res?.success) {
            closeResetPassword();
            alert("Đặt lại mật khẩu thành công");
        } else {
            alert(res?.message || "Không thể đặt lại mật khẩu");
        }
    };

    return (
        <div className="user-management">
            <div className="page-header">
                <h1>Quản lý người dùng</h1>
                <p>Quản lý tài khoản người dùng trong hệ thống</p>
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
                        placeholder="Tìm theo tên, email... (nhấn Enter hoặc nút Tìm kiếm)"
                    />
                    <select
                        name="role"
                        value={filters.role}
                        onChange={handleFilterChange}
                    >
                        <option value="">Tất cả vai trò</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="sa">Super Admin</option>
                    </select>
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="active">Hoạt động</option>
                        <option value="blocked">Không hoạt động</option>
                    </select>
                    <Button onClick={handleSearch}>Tìm kiếm</Button>
                </div>
                <div className="actions">
                    <Button icon={addUser} onClick={openCreate}>
                        Thêm người dùng
                    </Button>
                </div>
            </div>

            <div className="page-content">
                {error && <div className="error-box">{error}</div>}
                {loading ? (
                    <div className="loading">Đang tải...</div>
                ) : (
                    <div className="table-wrapper">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Người dùng</th>
                                    <th>Email</th>
                                    <th>Vai trò</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày tạo</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => {
                                    const id = u.id || u._id;
                                    return (
                                        <tr key={id}>
                                            <td>
                                                <div className="user-info">
                                                    <div className="user-avatar">
                                                        {u.avatar_url ? (
                                                            <img
                                                                src={
                                                                    u.avatar_url
                                                                }
                                                                alt={
                                                                    u.full_name
                                                                }
                                                            />
                                                        ) : (
                                                            <div className="user-avatar-placeholder">
                                                                {u.full_name
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="user-details">
                                                        <div className="user-name">
                                                            {u.full_name ||
                                                                u.name ||
                                                                u.username ||
                                                                "—"}
                                                        </div>
                                                        <div className="user-username">
                                                            @{u.username || "—"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{u.email}</td>
                                            <td>
                                                <span
                                                    className={`role-badge ${u.role}`}
                                                >
                                                    {u.role === "sa"
                                                        ? "Super Admin"
                                                        : u.role === "admin"
                                                        ? "Quản Trị Viên"
                                                        : "Người Dùng"}
                                                </span>
                                            </td>
                                            <td>
                                                {(() => {
                                                    const isActive =
                                                        u.is_active ===
                                                        undefined
                                                            ? true
                                                            : !!u.is_active;
                                                    const statusKey = isActive
                                                        ? "active"
                                                        : "blocked";
                                                    return (
                                                        <span
                                                            className={`status-badge ${statusKey}`}
                                                        >
                                                            {isActive
                                                                ? "Hoạt Động"
                                                                : "Đã Khóa"}
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            <td>
                                                {u.created_at
                                                    ? new Date(
                                                          u.created_at
                                                      ).toLocaleDateString(
                                                          "vi-VN"
                                                      )
                                                    : "—"}
                                            </td>
                                            <td className="row-actions">
                                                <Button
                                                    variant="edit"
                                                    size="small"
                                                    onClick={() => openEdit(u)}
                                                >
                                                    Sửa
                                                </Button>
                                                <Button
                                                    variant="reset"
                                                    size="small"
                                                    onClick={() =>
                                                        openResetPassword(u)
                                                    }
                                                >
                                                    Đặt lại mật khẩu
                                                </Button>
                                                <Button
                                                    variant="delete"
                                                    size="small"
                                                    onClick={() =>
                                                        openDeleteUser(u)
                                                    }
                                                    disabled={
                                                        u.role === "sa" ||
                                                        u.role ===
                                                            currentUser.role
                                                    }
                                                >
                                                    Xóa
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
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
            {showForm && (
                <UserForm
                    mode={editingUser ? "edit" : "create"}
                    initialValues={editingUser}
                    onSubmit={handleSubmitForm}
                    onCancel={closeForm}
                    loading={submitting}
                />
            )}
            {showReset && (
                <ResetPasswordModal
                    user={targetUser}
                    onSubmit={submitResetPassword}
                    onCancel={closeResetPassword}
                    loading={submitting}
                />
            )}
            <ConfirmDialog
                open={showDelete}
                title="Xác nhận xóa người dùng"
                message={`Bạn có chắc muốn xóa tài khoản "${
                    targetUser?.full_name ||
                    targetUser?.username ||
                    "người dùng"
                }"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                cancelText="Hủy"
                danger
                loading={submitting}
                onCancel={closeDeleteUser}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
};

export default AdminUsers;
