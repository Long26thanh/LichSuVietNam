import React, { useState, useEffect } from "react";
import styles from "./RecentActivity.module.css";
import * as icons from "@/assets/icons";

const RecentActivity = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading activities
        const loadActivities = async () => {
            setLoading(true);
            try {
                await new Promise((resolve) => setTimeout(resolve, 1000));

                setActivities([
                    {
                        id: 1,
                        type: "user",
                        message: "Người dùng mới đăng ký: Nguyễn Văn A",
                        time: "2 phút trước",
                        icon: icons.user,
                    },
                    {
                        id: 2,
                        type: "event",
                        message:
                            "Sự kiện mới được thêm: Chiến thắng Điện Biên Phủ",
                        time: "15 phút trước",
                        icon: icons.events,
                    },
                    {
                        id: 3,
                        type: "figure",
                        message: "Nhân vật mới được thêm: Hồ Chí Minh",
                        time: "1 giờ trước",
                        icon: icons.user,
                    },
                    {
                        id: 4,
                        type: "location",
                        message: "Địa điểm mới được thêm: Cố đô Huế",
                        time: "2 giờ trước",
                        icon: icons.locationDot,
                    },
                    {
                        id: 5,
                        type: "period",
                        message: "Thời kỳ mới được thêm: Thời kỳ Đồng Sơn",
                        time: "3 giờ trước",
                        icon: icons.clock,
                    },
                ]);
            } catch (error) {
                console.error("Error loading activities:", error);
            } finally {
                setLoading(false);
            }
        };

        loadActivities();
    }, []);

    if (loading) {
        return (
            <div className={styles["recent-activity"]}>
                <div className={styles["activity-header"]}>
                    <h3>Hoạt động gần đây</h3>
                </div>
                <div className={styles["activity-list"]}>
                    {[...Array(5)].map((_, index) => (
                        <div
                            key={index}
                            className={`${styles["activity-item"]} ${styles["loading"]}`}
                        >
                            <div
                                className={`${styles["activity-icon"]} ${styles["skeleton"]}`}
                            ></div>
                            <div className={styles["activity-content"]}>
                                <div
                                    className={`${styles["activity-message"]} ${styles["skeleton"]}`}
                                ></div>
                                <div
                                    className={`${styles["activity-time"]} ${styles["skeleton"]}`}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={styles["recent-activity"]}>
            <div className={styles["activity-header"]}>
                <h3>Hoạt động gần đây</h3>
                <button className={styles["view-all-btn"]}>Xem tất cả</button>
            </div>
            <div className={styles["activity-list"]}>
                {activities.map((activity) => (
                    <div key={activity.id} className={styles["activity-item"]}>
                        <div className={styles["activity-icon"]}>
                            <img src={activity.icon} alt="" />
                        </div>
                        <div className={styles["activity-content"]}>
                            <p className={styles["activity-message"]}>
                                {activity.message}
                            </p>
                            <span className={styles["activity-time"]}>
                                {activity.time}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentActivity;
