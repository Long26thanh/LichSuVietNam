import React from "react";
import "./StatsCards.css";
import {
    UsersStat,
    ArticlesStat,
    PendingStat,
    EventsStat,
    FiguresStat,
    LocationsStat,
    PeriodsStat,
    VisitsStat,
    CommentsStat,
} from "./StatsIcons";

const StatsCards = ({ stats, loading }) => {
    const statsData = [
        {
            title: "Tổng người dùng",
            value: stats?.overview?.totalUsers || 0,
            Icon: UsersStat,
            color: "#3b82f6",
            bgColor: "#dbeafe",
        },
        {
            title: "Tổng bài viết",
            value: stats?.overview?.totalArticles || 0,
            Icon: ArticlesStat,
            color: "#10b981",
            bgColor: "#d1fae5",
        },
        {
            title: "Bài viết chờ duyệt",
            value: stats?.articles?.pending || 0,
            Icon: PendingStat,
            color: "#f59e0b",
            bgColor: "#fef3c7",
        },
        {
            title: "Sự kiện",
            value: stats?.overview?.totalEvents || 0,
            Icon: EventsStat,
            color: "#8b5cf6",
            bgColor: "#ede9fe",
        },
        {
            title: "Nhân vật",
            value: stats?.overview?.totalFigures || 0,
            Icon: FiguresStat,
            color: "#ec4899",
            bgColor: "#fce7f3",
        },
        {
            title: "Địa danh",
            value: stats?.overview?.totalLocations || 0,
            Icon: LocationsStat,
            color: "#06b6d4",
            bgColor: "#cffafe",
        },
        {
            title: "Thời kỳ",
            value: stats?.overview?.totalPeriods || 0,
            Icon: PeriodsStat,
            color: "#6366f1",
            bgColor: "#e0e7ff",
        },
        {
            title: "Lượt truy cập",
            value: stats?.overview?.websiteVisits || 0,
            Icon: VisitsStat,
            color: "#14b8a6",
            bgColor: "#ccfbf1",
        },
        {
            title: "Tổng bình luận",
            value: stats?.overview?.totalComments || 0,
            Icon: CommentsStat,
            color: "#f43f5e",
            bgColor: "#ffe4e6",
        },
    ];

    if (loading) {
        return (
            <div className="stats-cards-container">
                {[...Array(9)].map((_, index) => (
                    <div key={index} className="stat-card loading">
                        <div className="stat-skeleton"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="stats-cards-container">
            {statsData.map((stat, index) => {
                const IconComponent = stat.Icon;
                return (
                    <div key={index} className="stat-card">
                        <div
                            className="stat-icon"
                            style={{
                                backgroundColor: stat.bgColor,
                                color: stat.color,
                            }}
                        >
                            <IconComponent className="stat-icon-svg" />
                        </div>
                        <div className="stat-content">
                            <h3 className="stat-title">{stat.title}</h3>
                            <p
                                className="stat-value"
                                style={{ color: stat.color }}
                            >
                                {stat.value.toLocaleString()}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default StatsCards;
