import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import config from '@/config';
import './AdminSidebar.css';

const AdminSidebar = ({ isOpen, onClose, currentPath }) => {
    const location = useLocation();

    const menuItems = [
        {
            title: 'Dashboard',
            path: config.routes.adminDashboard,
            icon: '📊',
            exact: true
        },
        {
            title: 'Người dùng',
            path: config.routes.adminUsers,
            icon: '👥'
        },
        {
            title: 'Sự kiện',
            path: config.routes.adminEvents,
            icon: '📅'
        },
        {
            title: 'Nhân vật',
            path: config.routes.adminFigures,
            icon: '👤'
        },
        {
            title: 'Địa điểm',
            path: config.routes.adminLocations,
            icon: '📍'
        },
        {
            title: 'Thời kỳ',
            path: config.routes.adminPeriods,
            icon: '⏰'
        },
        {
            title: 'Hồ sơ',
            path: config.routes.adminProfile,
            icon: '⚙️'
        }
    ];

    const isActive = (path, exact = false) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div 
                    className="sidebar-overlay" 
                    onClick={onClose}
                />
            )}
            
            <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h2>Admin Panel</h2>
                    <button 
                        className="sidebar-close"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>
                
                <nav className="sidebar-nav">
                    <ul className="nav-list">
                        {menuItems.map((item, index) => (
                            <li key={index} className="nav-item">
                                <Link
                                    to={item.path}
                                    className={`nav-link ${isActive(item.path, item.exact) ? 'active' : ''}`}
                                    onClick={onClose}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    <span className="nav-text">{item.title}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                
                <div className="sidebar-footer">
                    <p>Lịch sử Việt Nam</p>
                    <p>Admin Panel v1.0</p>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
