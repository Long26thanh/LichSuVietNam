import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import userService from '@/services/userService';
import './AdminProfile.css';

const AdminProfile = () => {
    const { user: authUser, updateUser } = useAuth();
    const [user, setUser] = useState(authUser);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        bio: ''
    });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await userService.getCurrentUser();
                if (res?.success) {
                    setUser(res.user);
                    setFormData({
                        full_name: res.user.full_name || '',
                        email: res.user.email || '',
                        phone: res.user.phone || '',
                        bio: res.user.bio || ''
                    });
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const onChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            const res = await userService.updateCurrentUser(formData);
            if (res?.success) {
                setUser(res.user);
                if (updateUser) updateUser(res.user);
                setMessage('Cập nhật thành công');
            } else {
                setMessage(res?.message || 'Cập nhật thất bại');
            }
        } catch (err) {
            setMessage('Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-profile">
                <div className="admin-profile__card">Đang tải hồ sơ...</div>
            </div>
        );
    }

    return (
        <div className="admin-profile">
            <div className="admin-profile__header">
                <h2>Hồ sơ quản trị</h2>
                <p>Cập nhật thông tin tài khoản quản trị của bạn</p>
            </div>

            {message && <div className="admin-profile__message">{message}</div>}

            <div className="admin-profile__card">
                <form onSubmit={onSubmit} className="admin-profile__form">
                    <div className="form-row">
                        <label>Họ và tên</label>
                        <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={onChange}
                            placeholder="Nhập họ và tên"
                        />
                    </div>
                    <div className="form-row">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={onChange}
                            placeholder="Nhập email"
                        />
                    </div>
                    <div className="form-row">
                        <label>Số điện thoại</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={onChange}
                            placeholder="Nhập số điện thoại"
                        />
                    </div>
                    <div className="form-row">
                        <label>Giới thiệu</label>
                        <textarea
                            name="bio"
                            rows="4"
                            value={formData.bio}
                            onChange={onChange}
                            placeholder="Viết vài dòng về bạn"
                        />
                    </div>

                    <div className="actions">
                        <button type="submit" disabled={saving}>
                            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminProfile;


