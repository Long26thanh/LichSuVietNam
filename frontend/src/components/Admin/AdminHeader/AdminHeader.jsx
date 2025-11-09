import React, { useState, useEffect } from "react";
import * as icons from "@/assets/icons";
import UserDropdown from "@/components/UserDropdown/UserDropdown";
import styles from "./AdminHeader.module.css";

const AdminHeader = ({ user, onToggleSidebar, onLogout }) => {
    const [notifications, setNotifications] = useState([]);

    // Simulate notifications
    // useEffect(() => {
    //     setNotifications([
    //         {
    //             id: 1,
    //             title: "Người dùng mới đăng ký",
    //             message: "Nguyễn Văn A đã đăng ký tài khoản",
    //             time: "2 phút trước",
    //             type: "user",
    //             unread: true,
    //         },
    //         {
    //             id: 2,
    //             title: "Sự kiện mới được thêm",
    //             message: "Chiến thắng Điện Biên Phủ đã được thêm",
    //             time: "15 phút trước",
    //             type: "event",
    //             unread: true,
    //         },
    //         {
    //             id: 3,
    //             title: "Báo cáo hệ thống",
    //             message: "Hệ thống hoạt động bình thường",
    //             time: "1 giờ trước",
    //             type: "system",
    //             unread: false,
    //         },
    //     ]);
    // }, []);

    const handleNotificationClick = () => {
        // Notification click handler (debug log removed)
    };

    return (
        <header className={styles["admin-header"]}>
            <div className={styles["header-left"]}>
                <button
                    className={styles["sidebar-toggle"]}
                    onClick={onToggleSidebar}
                >
                    ☰
                </button>
                <h1>Dashboard</h1>
            </div>

            <div className={styles["header-right"]}>
                <div className={styles["header-actions"]}>
                    <span className={styles["welcome-text"]}>
                        Chào mừng, {user?.name || user?.username || "Admin"}
                    </span>

                    <UserDropdown
                        user={user}
                        onLogout={onLogout}
                        variant="admin"
                        showNotifications={true}
                        notifications={notifications}
                        onNotificationClick={handleNotificationClick}
                        items={[
                            {
                                key: "profile",
                                icon: icons.user,
                                label: "Hồ sơ cá nhân",
                                to: "/admin/profile",
                            },
                            { key: "divider-1", type: "divider" },
                            {
                                key: "logout",
                                icon: icons.logout,
                                label: "Đăng xuất",
                                danger: true,
                                onClick: onLogout,
                            },
                        ]}
                    />
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
