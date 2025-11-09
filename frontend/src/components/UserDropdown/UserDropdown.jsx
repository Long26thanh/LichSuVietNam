import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import config from "@/config";
import { getImageUrl } from "@/utils/imageUtils";
import "./UserDropdown.css";

const UserDropdown = ({
    user,
    onLogout,
    variant = "default", // 'default' | 'admin'
    showNotifications = false,
    notifications = [],
    onNotificationClick,
    className = "",
    items = [], // Customizable menu items (required by design)
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showNotificationDropdown, setShowNotificationDropdown] =
        useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
                setShowNotificationDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        setIsOpen(false);
        onLogout && onLogout();
    };

    const handleNotifications = () => {
        setShowNotificationDropdown(!showNotificationDropdown);
        setIsOpen(false);
        if (onNotificationClick) {
            onNotificationClick();
        }
    };

    const unreadCount = notifications.filter((n) => n.unread).length;

    const menuItems = items; // No defaults; callers must supply

    const handleItemClick = (item) => {
        setIsOpen(false);
        if (item.onClick) {
            item.onClick();
            return;
        }
        if (item.to) {
            navigate(item.to);
        }
    };

    return (
        <div
            className={`user-dropdown-container ${className}`}
            ref={dropdownRef}
        >
            {/* Notifications (only for admin variant) */}
            {showNotifications && (
                <div className="notification-menu">
                    {/* <button
                        className="notification-btn"
                        onClick={handleNotifications}
                    >
                        🔔
                        {unreadCount > 0 && (
                            <span className="notification-badge">
                                {unreadCount}
                            </span>
                        )}
                    </button> */}

                    {showNotificationDropdown && (
                        <div className="notification-dropdown">
                            <div className="notification-header">
                                <h3>Thông báo</h3>
                                <button className="mark-all-read">
                                    Đánh dấu tất cả
                                </button>
                            </div>
                            <div className="notification-list">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`notification-item ${
                                            notification.unread ? "unread" : ""
                                        }`}
                                    >
                                        
                                        <div className="notification-content">
                                            <h4>{notification.title}</h4>
                                            <p>{notification.message}</p>
                                            <span className="notification-time">
                                                {notification.time}
                                            </span>
                                        </div>
                                        {notification.unread && (
                                            <div className="unread-dot"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="notification-footer">
                                <button className="view-all-notifications">
                                    Xem tất cả thông báo
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* User Menu */}
            <div className="user-menu">
                <button
                    className={`user-avatar ${variant}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {user?.avatar_url ? (
                        <img src={getImageUrl(user.avatar_url)} alt={user?.full_name || user?.username || 'User'} />
                    ) : (
                        (user?.name?.charAt(0) ||
                            user?.username?.charAt(0) ||
                            user?.full_name?.charAt(0) ||
                            "A")
                    )}
                </button>

                {isOpen && (
                    <div className={`user-dropdown ${variant}`}>
                        <div className="dropdown-header">
                            <div className="user-info-header">
                                <div className="user-avatar-large">
                                    {user?.avatar_url ? (
                                        <img src={getImageUrl(user.avatar_url)} alt={user?.full_name || user?.username || 'User'} />
                                    ) : (
                                        (user?.name?.charAt(0) ||
                                            user?.username?.charAt(0) ||
                                            user?.full_name?.charAt(0) ||
                                            "A")
                                    )}
                                </div>
                                <div className="user-details">
                                    <p className="user-name">
                                        {user?.name ||
                                            user?.username ||
                                            user?.full_name ||
                                            "User"}
                                    </p>
                                    <p className="user-email">
                                        {user?.email || "user@example.com"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="dropdown-menu">
                            {menuItems.map((item) => {
                                if (item.type === "divider") {
                                    return (
                                        <div
                                            key={item.key || Math.random()}
                                            className="dropdown-divider"
                                        ></div>
                                    );
                                }
                                const badge =
                                    item.badge ??
                                    (item.key === "notifications"
                                        ? unreadCount
                                        : undefined);
                                const classNames = `dropdown-item${
                                    item.danger ? " logout" : ""
                                }`;
                                return (
                                    <button
                                        key={item.key || item.label}
                                        className={classNames}
                                        onClick={() => handleItemClick(item)}
                                    >
                                        {item.icon && (
                                            <span className="item-icon">
                                                {typeof item.icon ===
                                                "string" ? (
                                                    // Kiểm tra xem có phải URL không
                                                    item.icon.startsWith(
                                                        "http"
                                                    ) ||
                                                    item.icon.startsWith(
                                                        "data:"
                                                    ) ||
                                                    item.icon.startsWith("/") ||
                                                    item.icon.startsWith(
                                                        "."
                                                    ) ? (
                                                        <img
                                                            src={item.icon}
                                                            alt=""
                                                        />
                                                    ) : (
                                                        // Render text/emoji trực tiếp
                                                        item.icon
                                                    )
                                                ) : (
                                                    // Render React element
                                                    item.icon
                                                )}
                                            </span>
                                        )}
                                        <span className="item-text">
                                            {item.label}
                                        </span>
                                        {badge > 0 && (
                                            <span className="item-badge">
                                                {badge}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDropdown;
