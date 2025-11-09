import React from "react";
import styles from "./StatsCards.module.css";
import * as icons from "@/assets/icons";

const StatsCards = ({ stats, loading }) => {
    const statsData = [
        {
            title: "Tổng người dùng",
            value: stats?.overview?.totalUsers || 0,
            icon: icons.usersStat,
            color: "#3b82f6",
            bgColor: "#dbeafe",
        },
        {
            title: "Tổng bài viết",
            value: stats?.overview?.totalArticles || 0,
            icon: icons.articlesStat,
            color: "#10b981",
            bgColor: "#d1fae5",
        },
        {
            title: "Bài viết chờ duyệt",
            value: stats?.articles?.pending || 0,
            icon: icons.pendingStat,
            color: "#f59e0b",
            bgColor: "#fef3c7",
        },
        {
            title: "Sự kiện",
            value: stats?.overview?.totalEvents || 0,
            icon: icons.eventsStat,
            color: "#8b5cf6",
            bgColor: "#ede9fe",
        },
        {
            title: "Nhân vật",
            value: stats?.overview?.totalFigures || 0,
            icon: icons.figuresStat,
            color: "#ec4899",
            bgColor: "#fce7f3",
        },
        {
            title: "Địa danh",
            value: stats?.overview?.totalLocations || 0,
            icon: icons.locationsStat,
            color: "#06b6d4",
            bgColor: "#cffafe",
        },
        {
            title: "Thời kỳ",
            value: stats?.overview?.totalPeriods || 0,
            icon: icons.periodsStat,
            color: "#6366f1",
            bgColor: "#e0e7ff",
        },
        {
            title: "Lượt truy cập",
            value: stats?.overview?.websiteVisits || 0,
            icon: icons.visitsStat,
            color: "#14b8a6",
            bgColor: "#ccfbf1",
        },
        {
            title: "Tổng bình luận",
            value: stats?.overview?.totalComments || 0,
            icon: icons.commentsStat,
            color: "#f43f5e",
            bgColor: "#ffe4e6",
        },
    ];

    if (loading) {
        return (
            <div className={styles["stats-cards-container"]}>
                {[...Array(9)].map((_, index) => (
                    <div key={index} className={styles["stat-card loading"]}>
                        <div className={styles["stat-skeleton"]}></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className={styles["stats-cards-container"]}>
            {statsData.map((stat, index) => (
                <div key={index} className={styles["stat-card"]}>
                    <div
                        className={styles["stat-icon"]}
                        style={{
                            backgroundColor: stat.bgColor,
                            color: stat.color,
                        }}
                    >
                        <img 
                            src={stat.icon} 
                            alt={stat.title}
                            className={styles["stat-icon-svg"]}
                            style={{ width: '24px', height: '24px' }}
                        />
                    </div>
                    <div className={styles["stat-content"]}>
                        <h3 className={styles["stat-title"]}>{stat.title}</h3>
                        <p
                            className={styles["stat-value"]}
                            style={{ color: stat.color }}
                        >
                            {stat.value.toLocaleString()}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsCards;
