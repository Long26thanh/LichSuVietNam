import React from "react";
import { useNavigate } from "react-router-dom";
import config from "@/config";
import styles from "./QuickActions.module.css";
import * as icons from "@/assets/icons";

const QuickActions = () => {
    const navigate = useNavigate();

    const actions = [
        {
            title: "Thêm sự kiện mới",
            description: "Tạo sự kiện lịch sử mới",
            icon: icons.events,
            color: "#2196F3",
            path: config.routes.adminEvents,
            action: "add",
        },
        {
            title: "Thêm nhân vật",
            description: "Thêm nhân vật lịch sử",
            icon: icons.user,
            color: "#FF9800",
            path: config.routes.adminFigures,
            action: "add",
        },
        {
            title: "Thêm địa điểm",
            description: "Thêm địa điểm lịch sử",
            icon: icons.locationDot,
            color: "#9C27B0",
            path: config.routes.adminLocations,
            action: "add",
        },
        {
            title: "Quản lý người dùng",
            description: "Xem và quản lý người dùng",
            icon: icons.usersGroup,
            color: "#4CAF50",
            path: config.routes.adminUsers,
            action: "manage",
        },
    ];

    const handleActionClick = (action) => {
        navigate(action.path);
    };

    return (
        <div className={styles["quick-actions"]}>
            <div className={styles["actions-header"]}>
                <h3>Thao tác nhanh</h3>
                <p>Thực hiện các tác vụ quản lý phổ biến</p>
            </div>
            <div className={styles["actions-grid"]}>
                {actions.map((action, index) => (
                    <button
                        key={index}
                        className={styles["action-card"]}
                        onClick={() => handleActionClick(action)}
                        style={{ "--action-color": action.color }}
                    >
                        <div className={styles["action-icon"]}>
                            <img src={action.icon} alt="" />
                        </div>
                        <div className={styles["action-content"]}>
                            <h4 className={styles["action-title"]}>
                                {action.title}
                            </h4>
                            <p className={styles["action-description"]}>
                                {action.description}
                            </p>
                        </div>
                        <div className={styles["action-arrow"]}>
                            <img src={icons.dropdownArrow} alt="" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuickActions;
