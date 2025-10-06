import React, { useEffect, useMemo, useState } from 'react';
import userService from '@/services/userService';
import './AdminUsers.css';

const defaultFilters = { q: '', role: '', status: '' };

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState(defaultFilters);
    const [selected, setSelected] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);

    const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await userService.listUsers({ page, limit, ...filters });
                if (res?.success) {
                    setUsers(res.data?.items || res.data || []);
                    setTotal(res.data?.total || res.total || 0);
                } else {
                    setError(res?.message || 'Không thể tải danh sách người dùng');
                }
            } catch (e) {
                setError('Có lỗi xảy ra khi tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [page, limit, filters, refreshKey]);

    const toggleSelect = (userId) => {
        setSelected((prev) => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
    };

    const selectAllOnPage = () => {
        const ids = users.map(u => u.id || u._id);
        const allSelected = ids.every(id => selected.includes(id));
        if (allSelected) {
            setSelected(prev => prev.filter(id => !ids.includes(id)));
        } else {
            setSelected(prev => Array.from(new Set([...prev, ...ids])));
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const handleRefresh = () => setRefreshKey(k => k + 1);

    const handleChangeRole = async (userId, role) => {
        const res = await userService.updateUserRole(userId, role);
        if (res?.success) handleRefresh();
    };

    const handleChangeStatus = async (userId, status) => {
        const res = await userService.updateUserStatus(userId, status);
        if (res?.success) handleRefresh();
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Xóa người dùng này?')) return;
        const res = await userService.deleteUser(userId);
        if (res?.success) handleRefresh();
    };

    return (
        <div className="admin-users">
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
                        placeholder="Tìm theo tên, email..."
                    />
                    <select name="role" value={filters.role} onChange={handleFilterChange}>
                        <option value="">Tất cả vai trò</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="sa">Super Admin</option>
                    </select>
                    <select name="status" value={filters.status} onChange={handleFilterChange}>
                        <option value="">Tất cả trạng thái</option>
                        <option value="active">Hoạt động</option>
                        <option value="blocked">Bị chặn</option>
                    </select>
                    <button onClick={handleRefresh}>Làm mới</button>
                </div>
                <div className="actions">
                    <span>Đã chọn: {selected.length}</span>
                    <button disabled={selected.length === 0} onClick={handleRefresh}>Cập nhật</button>
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
                                    <th>
                                        <input type="checkbox" onChange={selectAllOnPage} checked={users.length > 0 && users.every(u => selected.includes(u.id || u._id))} />
                                    </th>
                                    <th>Họ tên</th>
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
                                                <input type="checkbox" checked={selected.includes(id)} onChange={() => toggleSelect(id)} />
                                            </td>
                                            <td>{u.full_name || u.name || u.username || '—'}</td>
                                            <td>{u.email}</td>
                                            <td>
                                                <select value={u.role} onChange={(e) => handleChangeRole(id, e.target.value)}>
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                    <option value="sa">Super Admin</option>
                                                </select>
                                            </td>
                                            <td>
                                                <select value={u.status || 'active'} onChange={(e) => handleChangeStatus(id, e.target.value)}>
                                                    <option value="active">Hoạt động</option>
                                                    <option value="blocked">Bị chặn</option>
                                                </select>
                                            </td>
                                            <td>{u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : '—'}</td>
                                            <td className="row-actions">
                                                <button onClick={() => handleDelete(id)} className="danger">Xóa</button>
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
                <div className="page-info">Trang {page}/{totalPages} • Tổng {total}</div>
                <div className="page-controls">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Trước</button>
                    <select value={page} onChange={(e) => setPage(parseInt(e.target.value, 10))}>
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                    </select>
                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Sau</button>
                    <select value={limit} onChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(1); }}>
                        {[10, 20, 50].map(n => <option key={n} value={n}>{n}/trang</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
