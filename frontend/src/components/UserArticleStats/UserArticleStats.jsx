import React, { useState, useEffect } from "react";
import { viewService } from "../../../services";
import "./UserArticleStats.css";

const UserArticleStats = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const response = await viewService.getUserArticleStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error("Error loading user article stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("vi-VN");
    };

    if (loading) {
        return <div className="user-stats-loading">Đang tải thống kê...</div>;
    }

    if (stats.length === 0) {
        return (
            <div className="user-stats-empty">
                <p>Bạn chưa có bài viết nào</p>
            </div>
        );
    }

    const totalViews = stats.reduce((sum, item) => sum + item.view_count, 0);
    const totalComments = stats.reduce(
        (sum, item) => sum + item.comment_count,
        0
    );

    return (
        <div className="user-article-stats">
            <h2 className="user-stats-title">📊 Thống kê bài viết của bạn</h2>

            {/* Summary Cards */}
            <div className="user-stats-summary">
                <div className="summary-card">
                    <div className="summary-icon">📝</div>
                    <div className="summary-content">
                        <p className="summary-label">Tổng bài viết</p>
                        <p className="summary-value">{stats.length}</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">👁️</div>
                    <div className="summary-content">
                        <p className="summary-label">Tổng lượt xem</p>
                        <p className="summary-value">
                            {totalViews.toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">💬</div>
                    <div className="summary-content">
                        <p className="summary-label">Tổng bình luận</p>
                        <p className="summary-value">
                            {totalComments.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Articles Table */}
            <div className="user-stats-table-container">
                <table className="user-stats-table">
                    <thead>
                        <tr>
                            <th>Tiêu đề</th>
                            <th>Ngày tạo</th>
                            <th>Lượt xem</th>
                            <th>Bình luận</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.map((article) => (
                            <tr key={article.id}>
                                <td className="article-title">
                                    {article.title}
                                </td>
                                <td className="article-date">
                                    {formatDate(article.created_at)}
                                </td>
                                <td className="article-stat">
                                    <span className="stat-badge stat-views">
                                        👁️ {article.view_count}
                                    </span>
                                </td>
                                <td className="article-stat">
                                    <span className="stat-badge stat-comments">
                                        💬 {article.comment_count}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserArticleStats;
