import React, { useState, useEffect } from 'react';
import UserDropdown from '@/components/UserDropdown/UserDropdown';
import './AdminHeader.css';

const AdminHeader = ({ user, onToggleSidebar, onLogout }) => {
    const [notifications, setNotifications] = useState([]);

    // Simulate notifications
    useEffect(() => {
        setNotifications([
            {
                id: 1,
                title: 'Người dùng mới đăng ký',
                message: 'Nguyễn Văn A đã đăng ký tài khoản',
                time: '2 phút trước',
                type: 'user',
                unread: true
            },
            {
                id: 2,
                title: 'Sự kiện mới được thêm',
                message: 'Chiến thắng Điện Biên Phủ đã được thêm',
                time: '15 phút trước',
                type: 'event',
                unread: true
            },
            {
                id: 3,
                title: 'Báo cáo hệ thống',
                message: 'Hệ thống hoạt động bình thường',
                time: '1 giờ trước',
                type: 'system',
                unread: false
            }
        ]);
    }, []);

    const handleNotificationClick = () => {
        console.log('Notification clicked');
    };

    return (
        <header className="admin-header">
            <div className="header-left">
                <button 
                    className="sidebar-toggle"
                    onClick={onToggleSidebar}
                >
                    ☰
                </button>
                <h1>Dashboard</h1>
            </div>
            
            <div className="header-right">
                <div className="header-actions">
                    <span className="welcome-text">
                        Chào mừng, {user?.name || user?.username || 'Admin'}
                    </span>
                    
                    <UserDropdown
                        user={user}
                        onLogout={onLogout}
                        variant="admin"
                        showNotifications={true}
                        notifications={notifications}
                        onNotificationClick={handleNotificationClick}
                        items={[
                            { key: 'profile', icon: '👤', label: 'Hồ sơ cá nhân', to: '/admin/profile' },
                            { key: 'notifications', icon: '🔔', label: 'Thông báo', to: '/admin/notifications' },
                            { key: 'settings', icon: '⚙️', label: 'Cài đặt', to: '/admin/settings' },
                            { key: 'divider-1', type: 'divider' },
                            { key: 'logout', icon: '🚪', label: 'Đăng xuất', danger: true, onClick: onLogout },
                        ]}
                    />
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
