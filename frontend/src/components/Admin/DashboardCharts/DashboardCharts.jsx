import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { statsService } from "@/services";
import config from "@/config";
import * as icons from "@/assets/icons";
import styles from "./DashboardCharts.module.css";

const DashboardCharts = () => {
    const [period, setPeriod] = useState("month"); // day, week, month, year
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [customDateRange, setCustomDateRange] = useState({
        startDate: "",
        endDate: "",
    });
    const [useCustomRange, setUseCustomRange] = useState(false);
    const navigate = useNavigate();
    const printRef = useRef(null);

    useEffect(() => {
        loadStats();
    }, [period]);

    const loadStats = async () => {
        setLoading(true);
        try {
            let response;
            if (useCustomRange && customDateRange.startDate && customDateRange.endDate) {
                response = await statsService.getDashboardStats(
                    period,
                    customDateRange.startDate,
                    customDateRange.endDate
                );
            } else {
                response = await statsService.getDashboardStats(period);
            }
            
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error("Error loading dashboard stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        setUseCustomRange(false);
    };

    const handleCustomDateChange = (e) => {
        setCustomDateRange({
            ...customDateRange,
            [e.target.name]: e.target.value,
        });
    };

    const applyCustomRange = () => {
        if (customDateRange.startDate && customDateRange.endDate) {
            setUseCustomRange(true);
            loadStats();
        }
    };

    // Hàm để chuyển hướng đến trang chi tiết
    const handleContentClick = (content) => {
        let path = '';
        switch (content.content_type) {
            case 'article':
                path = config.routes.articleDetail.replace(':id', content.id);
                break;
            case 'figure':
                path = config.routes.figureDetail.replace(':id', content.id);
                break;
            case 'period':
                path = config.routes.periodDetail.replace(':id', content.id);
                break;
            case 'event':
                path = config.routes.eventDetail.replace(':id', content.id);
                break;
            case 'location':
                path = config.routes.locationDetail.replace(':id', content.id);
                break;
            default:
                return;
        }
        
        // Mở trong tab mới
        window.open(path, '_blank');
    };

    // Hàm tính chiều cao cột với giá trị tối thiểu
    const calculateBarHeight = (value, maxValue, minHeightPercent = 20) => {
        if (value === 0) return 0;
        const calculatedHeight = (value / maxValue) * 100;
        return Math.max(calculatedHeight, minHeightPercent);
    };

    const formatPeriodLabel = (periodValue) => {
        switch (period) {
            case "day":
                return periodValue;
            case "week":
                return `Tuần ${periodValue.split("-")[1]}`;
            case "month":
                return `Tháng ${periodValue.split("-")[1]}/${periodValue.split("-")[0]}`;
            case "year":
                return `Năm ${periodValue}`;
            default:
                return periodValue;
        }
    };

    const handlePrintReport = () => {
        // Tạo URL params
        const params = new URLSearchParams();
        params.append('period', period);
        
        if (useCustomRange && customDateRange.startDate && customDateRange.endDate) {
            params.append('startDate', customDateRange.startDate);
            params.append('endDate', customDateRange.endDate);
            params.append('useCustomRange', 'true');
        }
        
        // Mở trang in báo cáo trong tab mới
        const reportUrl = `${config.routes.adminReportPrint}?${params.toString()}`;
        window.open(reportUrl, '_blank');
    };

    if (loading) {
        return (
            <div className={styles["dashboard-charts-loading"]}>
                <img src={icons.activity} alt="loading" style={{ width: '48px', height: '48px' }} className="icon-spin" />
                <p>Đang tải thống kê...</p>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className={styles["dashboard-charts-error"]}>
                <img src={icons.alert} alt="no-data" style={{ width: '48px', height: '48px', color: '#dc3545' }} />
                <p>Không có dữ liệu</p>
            </div>
        );
    }

    return (
        <div className={styles["dashboard-charts"]} ref={printRef}>
            <div className={styles["charts-header"]}>
                <h3>
                    <img src={icons.barChart} alt="bar-chart" style={{ width: '24px', height: '24px' }} />
                    Thống kê chi tiết
                </h3>
                {/* <div className={styles["header-actions"]}>
                    <button 
                        className={styles["print-report-btn"]}
                        onClick={handlePrintReport}
                        title="In báo cáo"
                    >
                        <img src={icons.printer} alt="print" style={{ width: '18px', height: '18px' }} />
                        In báo cáo
                    </button>
                </div> */}
            <div className={styles["period-selector"]}>
                <button
                    className={period === "day" ? styles["active"] : ""}
                    onClick={() => handlePeriodChange("day")}
                >
                    Ngày
                </button>
                <button
                    className={period === "week" ? styles["active"] : ""}
                    onClick={() => handlePeriodChange("week")}
                >
                    Tuần
                </button>
                <button
                    className={period === "month" ? styles["active"] : ""}
                    onClick={() => handlePeriodChange("month")}
                >
                    Tháng
                </button>
                <button
                    className={period === "year" ? styles["active"] : ""}
                    onClick={() => handlePeriodChange("year")}
                >
                    Năm
                </button>
            </div>
            </div>

            {/* Custom Date Range Selector */}
            <div className={styles["custom-date-range"]}>
                <input
                    type="date"
                    name="startDate"
                    value={customDateRange.startDate}
                    onChange={handleCustomDateChange}
                    placeholder="Từ ngày"
                />
                <span>đến</span>
                <input
                    type="date"
                    name="endDate"
                    value={customDateRange.endDate}
                    onChange={handleCustomDateChange}
                    placeholder="Đến ngày"
                />
                <button onClick={applyCustomRange} className={styles["apply-btn"]}>
                    <img src={icons.checkCircle} alt="apply" style={{ width: '16px', height: '16px' }} />
                    Áp dụng
                </button>
            </div>

            {/* Overview Cards */}
            <div className={styles["period-overview"]}>
                {/* <div className={styles["overview-card"] + " " + styles["card-purple"]}>
                    <img src={icons.filePlus} alt="all-content" style={{ width: '48px', height: '48px' }} className={styles["card-icon"]} />
                    <div className={styles["card-content"]}>
                        <h4>Tổng nội dung xuất bản</h4>
                        <p className={styles["card-number"]}>
                            {stats.overview.totalAllContentPublished || 0}
                        </p>
                    </div>
                </div> */}
                <div className={styles["overview-card"] + " " + styles["card-purple"]}>
                    <img src={icons.filePlus} alt="articles" style={{ width: '48px', height: '48px' }} className={styles["card-icon"]} />
                    <div className={styles["card-content"]}>
                        <h4>Bài viết được tạo</h4>
                        <p className={styles["card-number"]}>
                            {(stats.overview.totalAllContentPublished || 0) + (stats.overview.totalPendingArticles || 0)}
                        </p>
                    </div>
                </div>
                <div className={styles["overview-card"] + " " + styles["card-green"]}>
                    <img src={icons.checkCircle} alt="published" style={{ width: '48px', height: '48px' }} className={styles["card-icon"]} />
                    <div className={styles["card-content"]}>
                        <h4>Bài đã xuất bản</h4>
                        <p className={styles["card-number"]}>{stats.overview.totalArticlesPublished}</p>
                    </div>
                </div>
                <div className={styles["overview-card"] + " " + styles["card-pink"]}>
                    <img src={icons.clock} alt="pending" style={{ width: '48px', height: '48px' }} className={styles["card-icon"]} />
                    <div className={styles["card-content"]}>
                        <h4>Bài chờ duyệt</h4>
                        <p className={styles["card-number"]}>{stats.overview.totalPendingArticles}</p>
                    </div>
                </div>
                <div className={styles["overview-card"] + " " + styles["card-blue"]}>
                    <img src={icons.trendingUp} alt="views" style={{ width: '48px', height: '48px' }} className={styles["card-icon"]} />
                    <div className={styles["card-content"]}>
                        <h4>Lượt xem</h4>
                        <p className={styles["card-number"]}>{stats.overview.totalViews}</p>
                    </div>
                </div>
                <div className={styles["overview-card"] + " " + styles["card-teal"]}>
                    <img src={icons.infoIcon} alt="comments" style={{ width: '48px', height: '48px' }} className={styles["card-icon"]} />
                    <div className={styles["card-content"]}>
                        <h4>Bình luận</h4>
                        <p className={styles["card-number"]}>{stats.overview.totalComments}</p>
                    </div>
                </div>
                <div className={styles["overview-card"] + " " + styles["card-orange"]}>
                    <img src={icons.usersGroup} alt="users" style={{ width: '48px', height: '48px' }} className={styles["card-icon"]} />
                    <div className={styles["card-content"]}>
                        <h4>Người dùng mới</h4>
                        <p className={styles["card-number"]}>{stats.overview.totalNewUsers}</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className={styles["charts-grid"]}>
                {/* Articles Chart - Hiển thị tất cả nội dung */}
                <div className={styles["chart-card"]}>
                    <h4>
                        <img src={icons.filePlus} alt="articles" style={{ width: '20px', height: '20px' }} />
                        Nội dung
                    </h4>
                    <div className={styles["simple-chart"]}>
                        {stats.charts.allContent && stats.charts.allContent.length > 0 ? (
                            stats.charts.allContent.map((item, index) => {
                                const maxTotal = Math.max(...stats.charts.allContent.map(i => i.total));
                                return (
                                    <div key={index} className={styles["chart-bar-group"]}>
                                        <div className={styles["chart-label"]}>{formatPeriodLabel(item.period)}</div>
                                        <div className={styles["chart-bars"]}>
                                            <div
                                                className={styles["chart-bar"] + " " + styles["total"]}
                                                style={{
                                                    height: `${calculateBarHeight(item.total, maxTotal)}%`,
                                                }}
                                                title={`Tổng được tạo: ${item.total}`}
                                            >
                                                {item.total}
                                            </div>
                                            <div
                                                className={styles["chart-bar"] + " " + styles["published"]}
                                                style={{
                                                    height: `${calculateBarHeight(item.published, maxTotal)}%`,
                                                }}
                                                title={`Đã xuất bản: ${item.published}`}
                                            >
                                                {item.published}
                                            </div>
                                            <div
                                                className={styles["chart-bar"] + " " + styles["pending"]}
                                                style={{
                                                    height: `${calculateBarHeight(item.pending, maxTotal)}%`,
                                                }}
                                                title={`Chờ duyệt: ${item.pending}`}
                                            >
                                                {item.pending}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className={styles["no-data"]}>Không có dữ liệu</p>
                        )}
                    </div>
                    <div className={styles["chart-legend"]}>
                        <span className={styles["legend-item"]}>
                            <span className={styles["legend-color"] + " " + styles["total"]}></span> Tổng được tạo
                        </span>
                        <span className={styles["legend-item"]}>
                            <span className={styles["legend-color"] + " " + styles["published"]}></span> Đã xuất bản
                        </span>
                        <span className={styles["legend-item"]}>
                            <span className={styles["legend-color"] + " " + styles["pending"]}></span> Chờ duyệt
                        </span>
                    </div>
                </div>

                {/* Views Chart */}
                <div className={styles["chart-card"]}>
                    <h4>
                        <img src={icons.trendingUp} alt="views" style={{ width: '20px', height: '20px' }} />
                        Lượt xem
                    </h4>
                    <div className={styles["simple-chart"]}>
                        {stats.charts.views && stats.charts.views.length > 0 ? (
                            stats.charts.views.map((item, index) => {
                                const maxTotal = Math.max(...stats.charts.views.map(i => i.total));
                                return (
                                    <div key={index} className={styles["chart-bar-group"]}>
                                        <div className={styles["chart-label"]}>{formatPeriodLabel(item.period)}</div>
                                        <div className={styles["chart-bars"]}>
                                            <div
                                                className={`${styles["chart-bar"]} ${styles["views"]}`}
                                                style={{
                                                    height: `${calculateBarHeight(item.total, maxTotal)}%`,
                                                }}
                                                title={`Tổng: ${item.total}`}
                                            >
                                                {item.total}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className={styles["no-data"]}>Không có dữ liệu</p>
                        )}
                    </div>
                </div>

                {/* Comments Chart */}
                <div className={styles["chart-card"]}>
                    <h4>
                        <img src={icons.infoIcon} alt="comments" style={{ width: '20px', height: '20px' }} />
                        Bình luận
                    </h4>
                    <div className={styles["simple-chart"]}>
                        {stats.charts.comments && stats.charts.comments.length > 0 ? (
                            stats.charts.comments.map((item, index) => {
                                const maxTotal = Math.max(...stats.charts.comments.map(i => i.total));
                                return (
                                    <div key={index} className={styles["chart-bar-group"]}>
                                        <div className={styles["chart-label"]}>{formatPeriodLabel(item.period)}</div>
                                        <div className={styles["chart-bars"]}>
                                            <div
                                                className={`${styles["chart-bar"]} ${styles["comments"]}`}
                                                style={{
                                                    height: `${calculateBarHeight(item.total, maxTotal)}%`,
                                                }}
                                                title={`Tổng: ${item.total}`}
                                            >
                                                {item.total}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className={styles["no-data"]}>Không có dữ liệu</p>
                        )}
                    </div>
                </div>

                {/* Users Chart */}
                <div className={styles["chart-card"]}>
                    <h4>
                        <img src={icons.usersGroup} alt="users" style={{ width: '20px', height: '20px' }} />
                        Người dùng mới
                    </h4>
                    <div className={styles["simple-chart"]}>
                        {stats.charts.users && stats.charts.users.length > 0 ? (
                            stats.charts.users.map((item, index) => {
                                const maxTotal = Math.max(...stats.charts.users.map(i => i.total));
                                return (
                                    <div key={index} className={styles["chart-bar-group"]}>
                                        <div className={styles["chart-label"]}>{formatPeriodLabel(item.period)}</div>
                                        <div className={styles["chart-bars"]}>
                                            <div
                                                className={`${styles["chart-bar"]} ${styles["users"]}`}
                                                style={{
                                                    height: `${calculateBarHeight(item.total, maxTotal)}%`,
                                                }}
                                                title={`Tổng: ${item.total}`}
                                            >
                                                {item.total}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className={styles["no-data"]}>Không có dữ liệu</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Top Content Section */}
            <div className={styles["top-content-section"]}>
                <div className={styles["top-content-card"]}>
                    <h4>
                        <img src={icons.trendingUp} alt="top-views" style={{ width: '20px', height: '20px' }} />
                        Top nội dung có lượt xem cao nhất
                    </h4>
                    <div className={styles["top-content-list"]}>
                        {stats?.topContent?.topViewedAllContent && stats.topContent.topViewedAllContent.length > 0 ? (
                            stats.topContent.topViewedAllContent.map((content, index) => (
                                <div
                                    key={`${content.content_type}-${content.id}`}
                                    className={`${styles["top-content-item"]} ${styles["clickable"]}`}
                                    onClick={() => handleContentClick(content)}
                                    title={`Xem chi tiết: ${content.title}`}
                                >
                                    <span className={styles["rank"]}>#{index + 1}</span>
                                    <div className={styles["content-info"]}>
                                        <h5>{content.title || "Không có tiêu đề"}</h5>
                                        <p className={styles["content-meta"]}>
                                            <span className={`${styles["type-badge"]} ${styles[`type-${content.content_type}`]}`}>
                                                {content.page_type}
                                            </span>
                                            {content.author && (
                                                <span className={styles["author"]}>
                                                    <img src={icons.usersGroup} alt="author" style={{ width: '12px', height: '12px' }} />
                                                    {content.author}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <span className={styles["count"]}>
                                        <img src={icons.trendingUp} alt="view-count" style={{ width: '16px', height: '16px' }} />
                                        {content.view_count || 0}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className={styles["no-data"]}>Không có dữ liệu</p>
                        )}
                    </div>
                </div>

                <div className={styles["top-content-card"]}>
                    <h4>
                        <img src={icons.infoIcon} alt="top-comments" style={{ width: '20px', height: '20px' }} />
                        Top nội dung có nhiều bình luận nhất
                    </h4>
                    <div className={styles["top-content-list"]}>
                        {stats?.topContent?.topCommentedAllContent && stats.topContent.topCommentedAllContent.length > 0 ? (
                            stats.topContent.topCommentedAllContent.map((content, index) => (
                                <div
                                    key={`${content.content_type}-${content.id}`}
                                    className={`${styles["top-content-item"]} ${styles["clickable"]}`}
                                    onClick={() => handleContentClick(content)}
                                    title={`Xem chi tiết: ${content.title}`}
                                >
                                    <span className={styles["rank"]}>#{index + 1}</span>
                                    <div className={styles["content-info"]}>
                                        <h5>{content.title || "Không có tiêu đề"}</h5>
                                        <p className={styles["content-meta"]}>
                                            <span className={`${styles["type-badge"]} ${styles[`type-${content.content_type}`]}`}>
                                                {content.page_type}
                                            </span>
                                            {content.author && (
                                                <span className={styles["author"]}>
                                                    <img src={icons.usersGroup} alt="author" style={{ width: '12px', height: '12px' }} />
                                                    {content.author}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <span className={styles["count"]}>
                                        <img src={icons.infoIcon} alt="comment-count" style={{ width: '16px', height: '16px' }} />
                                        {content.comment_count || 0}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className={styles["no-data"]}>Không có dữ liệu</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardCharts;
