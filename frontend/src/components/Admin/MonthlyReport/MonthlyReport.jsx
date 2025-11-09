import React, { useState, useEffect } from "react";
import { statsService } from "@/services";
import styles from "./MonthlyReport.module.css";
import printReportCSS from "./PrintReport.css?raw";
import * as icons from "@/assets/icons";

const MonthlyReport = () => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [stats, setStats] = useState(null);
    const [dailyStats, setDailyStats] = useState(null);
    const [detailedContent, setDetailedContent] = useState(null);
    const [activeTab, setActiveTab] = useState('daily'); // 'daily', 'views', 'comments', 'users', 'content'
    const [loading, setLoading] = useState(true);
    const [loadingDaily, setLoadingDaily] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [availableYears, setAvailableYears] = useState([]);

    useEffect(() => {
        // Generate available years (current year and 4 years back)
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = 0; i < 5; i++) {
            years.push(currentYear - i);
        }
        setAvailableYears(years);
    }, []);

    useEffect(() => {
        loadStats();
        setSelectedMonth(null);
        setDailyStats(null);
        setDetailedContent(null);
    }, [year]);

    useEffect(() => {
        if (selectedMonth !== null) {
            loadDailyStats();
            if (activeTab !== 'daily') {
                loadDetailedContent();
            }
        } else {
            setDailyStats(null);
            setDetailedContent(null);
        }
    }, [selectedMonth]);

    useEffect(() => {
        if (selectedMonth !== null && activeTab !== 'daily') {
            loadDetailedContent();
        }
    }, [activeTab]);

    const loadStats = async () => {
        setLoading(true);
        try {
            const response = await statsService.getMonthlyStats(year);
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error("Error loading monthly stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadDailyStats = async () => {
        setLoadingDaily(true);
        try {
            const response = await statsService.getDailyStats(year, selectedMonth + 1);
            if (response.success) {
                setDailyStats(response.data);
            }
        } catch (error) {
            console.error("Error loading daily stats:", error);
        } finally {
            setLoadingDaily(false);
        }
    };

    const loadDetailedContent = async () => {
        setLoadingDetails(true);
        try {
            const type = activeTab === 'daily' ? 'all' : activeTab;
            const response = await statsService.getMonthlyDetailedContent(year, selectedMonth + 1, type);
            if (response.success) {
                setDetailedContent(response.data);
            }
        } catch (error) {
            console.error("Error loading detailed content:", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const monthNames = [
        "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
    ];

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getMaxValue = (data) => {
        return Math.max(...data.map(item => item.count), 1);
    };

    const handleMonthClick = (monthIndex) => {
        if (selectedMonth === monthIndex) {
            setSelectedMonth(null);
        } else {
            setSelectedMonth(monthIndex);
        }
    };

    const handlePrint = () => {
        // Tạo cửa sổ mới để in chỉ bảng tổng hợp
        const printWindow = window.open('', '_blank');
        const tableContent = document.querySelector(`.${styles["summary-table-container"]}`);
        
        if (!tableContent || !printWindow) return;

        // Tạo HTML cho trang in với CSS từ file
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Báo cáo Tổng hợp - Năm ${year}</title>
                <meta charset="UTF-8">
                <style>
                    ${printReportCSS}
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>BÁO CÁO TỔNG HỢP NĂM ${year}</h2>
                    <p>Ngày in: ${new Date().toLocaleDateString('vi-VN')}</p>
                </div>
                ${tableContent.innerHTML}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        
        // Đợi nội dung load xong rồi mới in
        printWindow.onload = function() {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
    };

    const handlePrintDaily = () => {
        // Tạo cửa sổ mới để in bảng chi tiết theo ngày
        const printWindow = window.open('', '_blank');
        const tableContent = document.querySelector(`.${styles["daily-table"]}`);
        
        if (!tableContent || !printWindow || selectedMonth === null) return;

        // Tạo HTML cho trang in với CSS từ file
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Báo cáo Chi tiết - ${monthNames[selectedMonth]} ${year}</title>
                <meta charset="UTF-8">
                <style>
                    ${printReportCSS}
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>BÁO CÁO CHI TIẾT ${monthNames[selectedMonth].toUpperCase()} ${year}</h2>
                    <p>Ngày in: ${new Date().toLocaleDateString('vi-VN')}</p>
                </div>
                <table>
                    ${tableContent.innerHTML}
                </table>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        
        // Đợi nội dung load xong rồi mới in
        printWindow.onload = function() {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
    };

    const handlePrintTabContent = (tabName) => {
        const printWindow = window.open('', '_blank');
        let contentElement = null;
        let title = '';

        switch (tabName) {
            case 'views':
                contentElement = document.querySelector(`.${styles["detail-content"]}`);
                title = `Top Lượt Xem - ${monthNames[selectedMonth]} ${year}`;
                break;
            case 'comments':
                contentElement = document.querySelector(`.${styles["detail-content"]}`);
                title = `Top Bình Luận - ${monthNames[selectedMonth]} ${year}`;
                break;
            case 'users':
                contentElement = document.querySelector(`.${styles["detail-content"]}`);
                title = `Người Dùng Mới - ${monthNames[selectedMonth]} ${year}`;
                break;
            case 'content':
                contentElement = document.querySelector(`.${styles["detail-content"]}`);
                title = `Nội Dung Mới - ${monthNames[selectedMonth]} ${year}`;
                break;
            default:
                return;
        }

        if (!contentElement || !printWindow) return;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <meta charset="UTF-8">
                <style>
                    ${printReportCSS}
                    .content-summary { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 20px; }
                    .summary-item { padding: 10px; border: 1px solid #ddd; text-align: center; }
                    .summary-label { font-size: 0.9rem; color: #666; }
                    .summary-value { font-size: 1.5rem; font-weight: bold; color: #007bff; }
                    .content-section { margin-bottom: 30px; }
                    .content-section h6 { margin: 20px 0 10px 0; padding-bottom: 5px; border-bottom: 2px solid #333; }
                    .no-data { text-align: center; padding: 20px; color: #666; font-style: italic; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>${title.toUpperCase()}</h2>
                    <p>Ngày in: ${new Date().toLocaleDateString('vi-VN')}</p>
                </div>
                ${contentElement.innerHTML}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        
        printWindow.onload = function() {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
    };

    const handlePrintContentSection = (sectionType) => {
        const printWindow = window.open('', '_blank');
        let sectionElement = null;
        let title = '';

        // Tìm section element dựa vào type
        const sections = document.querySelectorAll(`.${styles["content-section"]}`);
        sections.forEach(section => {
            const heading = section.querySelector('h6');
            if (heading) {
                const headingText = heading.textContent.toLowerCase();
                if ((sectionType === 'articles' && headingText.includes('bài viết')) ||
                    (sectionType === 'figures' && headingText.includes('nhân vật')) ||
                    (sectionType === 'events' && headingText.includes('sự kiện')) ||
                    (sectionType === 'locations' && headingText.includes('địa danh')) ||
                    (sectionType === 'periods' && headingText.includes('thời kỳ'))) {
                    sectionElement = section;
                }
            }
        });

        if (!sectionElement || !printWindow) return;

        const typeNames = {
            articles: 'Bài Viết',
            figures: 'Nhân Vật',
            events: 'Sự Kiện',
            locations: 'Địa Danh',
            periods: 'Thời Kỳ'
        };

        title = `${typeNames[sectionType]} Mới - ${monthNames[selectedMonth]} ${year}`;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <meta charset="UTF-8">
                <style>
                    ${printReportCSS}
                    h6 { margin: 10px 0; padding-bottom: 5px; border-bottom: 2px solid #333; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>${title.toUpperCase()}</h2>
                    <p>Ngày in: ${new Date().toLocaleDateString('vi-VN')}</p>
                </div>
                ${sectionElement.innerHTML}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        
        printWindow.onload = function() {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
    };

    if (loading) {
        return <div className="monthly-report-loading">Đang tải báo cáo...</div>;
    }

    if (!stats) {
        return <div className="monthly-report-error">Không có dữ liệu</div>;
    }

    return (
        <div className={styles["monthly-report"]}>
            <div className={styles["report-header"]}>
                <h3>Tổng hợp</h3>
                <div className={styles["header-actions"]}>
                    <div className={styles["year-selector"]}>
                        <label>Năm:</label>
                        <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
                            {availableYears.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <button 
                        className={styles["print-button"]} 
                        onClick={handlePrint}
                        title="In báo cáo"
                    >
                        <img src={icons.printer} alt="Print" className={styles["button-icon"]} />
                        In báo cáo
                    </button>
                </div>
            </div>

            {/*<div className={styles["report-grid"]}>
                <div className={styles["report-card"]}>
                    <h4>
                        <img src={icons.filePlus} alt="" className={styles["card-title-icon"]} />
                        Tất cả nội dung đã tạo
                    </h4>
                    <div className={styles["monthly-chart"]}>
                        {stats.stats.allContent && stats.stats.allContent.map((item, index) => {
                            const maxValue = getMaxValue(stats.stats.allContent);
                            const percentage = (item.count / maxValue) * 100;
                            return (
                                <div key={item.month} className={styles["month-bar"]}>
                                    <div className={styles["month-label"]}>{monthNames[index]}</div>
                                    <div className={styles["bar-container"]}>
                                        <div 
                                            className={`${styles["bar"]} ${styles["allcontent-bar"]}`}
                                            style={{ height: `${percentage}%` }}
                                            title={`${item.count} nội dung`}
                                        >
                                            <span className={styles["bar-value"]}>{item.count}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className={styles["report-total"]}>
                        <strong>Tổng:</strong> {stats.stats.allContent ? stats.stats.allContent.reduce((sum, item) => sum + item.count, 0) : 0} nội dung
                        <br />
                        <small style={{ opacity: 0.7 }}>Bài viết + Nhân vật + Thời kỳ + Sự kiện + Địa danh</small>
                    </div>
                </div>

                <div className={styles["report-card"]}>
                    <h4>
                        <img src={icons.articlesStat} alt="" className={styles["card-title-icon"]} />
                        Bài viết xuất bản
                    </h4>
                    <div className={styles["monthly-chart"]}>
                        {stats.stats.articles.map((item, index) => {
                            const maxValue = getMaxValue(stats.stats.articles);
                            const percentage = (item.count / maxValue) * 100;
                            return (
                                <div key={item.month} className={styles["month-bar"]}>
                                    <div className={styles["month-label"]}>{monthNames[index]}</div>
                                    <div className={styles["bar-container"]}>
                                        <div 
                                            className={`${styles["bar"]} ${styles["articles-bar"]}`}
                                            style={{ height: `${percentage}%` }}
                                            title={`${item.count} bài viết`}
                                        >
                                            <span className={styles["bar-value"]}>{item.count}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className={styles["report-total"]}>
                        <strong>Tổng:</strong> {stats.stats.articles.reduce((sum, item) => sum + item.count, 0)} bài viết
                    </div>
                </div>

                <div className={styles["report-card"]}>
                    <h4>
                        <img src={icons.visitsStat} alt="" className={styles["card-title-icon"]} />
                        Lượt xem
                    </h4>
                    <div className={styles["monthly-chart"]}>
                        {stats.stats.views.map((item, index) => {
                            const maxValue = getMaxValue(stats.stats.views);
                            const percentage = (item.count / maxValue) * 100;
                            return (
                                <div key={item.month} className={styles["month-bar"]}>
                                    <div className={styles["month-label"]}>{monthNames[index]}</div>
                                    <div className={styles["bar-container"]}>
                                        <div 
                                            className={`${styles["bar"]} ${styles["views-bar"]}`}
                                            style={{ height: `${percentage}%` }}
                                            title={`${item.count} lượt xem`}
                                        >
                                            <span className={styles["bar-value"]}>{item.count}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className={styles["report-total"]}>
                        <strong>Tổng:</strong> {stats.stats.views.reduce((sum, item) => sum + item.count, 0)} lượt xem
                    </div>
                </div>

                <div className={styles["report-card"]}>
                    <h4>
                        <img src={icons.commentsStat} alt="" className={styles["card-title-icon"]} />
                        Bình luận
                    </h4>
                    <div className={styles["monthly-chart"]}>
                        {stats.stats.comments.map((item, index) => {
                            const maxValue = getMaxValue(stats.stats.comments);
                            const percentage = (item.count / maxValue) * 100;
                            return (
                                <div key={item.month} className={styles["month-bar"]}>
                                    <div className={styles["month-label"]}>{monthNames[index]}</div>
                                    <div className={styles["bar-container"]}>
                                        <div 
                                            className={`${styles["bar"]} ${styles["comments-bar"]}`}
                                            style={{ height: `${percentage}%` }}
                                            title={`${item.count} bình luận`}
                                        >
                                            <span className={styles["bar-value"]}>{item.count}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className={styles["report-total"]}>
                        <strong>Tổng:</strong> {stats.stats.comments.reduce((sum, item) => sum + item.count, 0)} bình luận
                    </div>
                </div>

                <div className={styles["report-card"]}>
                    <h4>
                        <img src={icons.usersGroup} alt="" className={styles["card-title-icon"]} />
                        Người dùng mới
                    </h4>
                    <div className={styles["monthly-chart"]}>
                        {stats.stats.users.map((item, index) => {
                            const maxValue = getMaxValue(stats.stats.users);
                            const percentage = (item.count / maxValue) * 100;
                            return (
                                <div key={item.month} className={styles["month-bar"]}>
                                    <div className={styles["month-label"]}>{monthNames[index]}</div>
                                    <div className={styles["bar-container"]}>
                                        <div 
                                            className={`${styles["bar"]} ${styles["users-bar"]}`}
                                            style={{ height: `${percentage}%` }}
                                            title={`${item.count} người dùng`}
                                        >
                                            <span className={styles["bar-value"]}>{item.count}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className={styles["report-total"]}>
                        <strong>Tổng:</strong> {stats.stats.users.reduce((sum, item) => sum + item.count, 0)} người dùng
                    </div>
                </div>
            </div> */}

            {/* Summary Table */}
            <div className={styles["summary-table-container"]}>
                {/* <h4>📋 Bảng tổng hợp</h4> */}
                <table className={styles["summary-table"]}>
                    <thead>
                        <tr>
                            <th>Tháng</th>
                            <th>Nội dung mới</th>
                            {/* <th>Bài viết</th> */}
                            <th>Lượt xem</th>
                            <th>Bình luận</th>
                            <th>Người dùng mới</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.stats.articles.map((_, index) => (
                            <tr 
                                key={index} 
                                onClick={() => handleMonthClick(index)}
                                className={`${selectedMonth === index ? styles["selected-row"] : ""} ${styles["clickable-row"]}`}
                                title="Click để xem chi tiết theo ngày"
                            >
                                <td>{monthNames[index]}</td>
                                <td>{stats.stats.allContent ? stats.stats.allContent[index].count : 0}</td>
                                {/* <td>{stats.stats.articles[index].count}</td> */}
                                <td>{stats.stats.views[index].count}</td>
                                <td>{stats.stats.comments[index].count}</td>
                                <td>{stats.stats.users[index].count}</td>
                            </tr>
                        ))}
                        <tr className={styles["total-row"]}>
                            <td><strong>Tổng cộng</strong></td>
                            <td><strong>{stats.stats.allContent ? stats.stats.allContent.reduce((sum, item) => sum + item.count, 0) : 0}</strong></td>
                            {/* <td><strong>{stats.stats.articles.reduce((sum, item) => sum + item.count, 0)}</strong></td> */}
                            <td><strong>{stats.stats.views.reduce((sum, item) => sum + item.count, 0)}</strong></td>
                            <td><strong>{stats.stats.comments.reduce((sum, item) => sum + item.count, 0)}</strong></td>
                            <td><strong>{stats.stats.users.reduce((sum, item) => sum + item.count, 0)}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Daily Stats Table */}
            {selectedMonth !== null && (
                <div className={styles["daily-stats-container"]}>
                    <div className={styles["daily-stats-header"]}>
                        <h4>
                            <img src={icons.clock} alt="" className={styles["header-icon"]} />
                            Chi tiết {monthNames[selectedMonth]} {year}
                        </h4>
                        <div className={styles["header-buttons"]}>
                            {activeTab !== 'daily' && (
                                <button 
                                    className={styles["print-tab-button"]}
                                    onClick={() => handlePrintTabContent(activeTab)}
                                    title="In nội dung tab hiện tại"
                                >
                                    <img src={icons.printer} alt="Print" className={styles["button-icon"]} />
                                    In {activeTab === 'views' ? 'lượt xem' : activeTab === 'comments' ? 'bình luận' : activeTab === 'users' ? 'người dùng' : 'nội dung'}
                                </button>
                            )}
                            {activeTab === 'daily' && (
                                <button 
                                    className={styles["print-daily-button"]}
                                    onClick={handlePrintDaily}
                                    title="In báo cáo chi tiết"
                                >
                                    <img src={icons.printer} alt="Print" className={styles["button-icon"]} />
                                    In
                                </button>
                            )}
                            <button 
                                className={styles["close-button"]}
                                onClick={() => setSelectedMonth(null)}
                                title="Đóng"
                            >
                                <img src={icons.closeIcon} alt="Close" className={styles["close-icon"]} />
                                Đóng
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className={styles["detail-tabs"]}>
                        <button 
                            className={`${styles["tab"]} ${activeTab === 'daily' ? styles["active-tab"] : ''}`}
                            onClick={() => setActiveTab('daily')}
                        >
                            <img src={icons.calendar} alt="" className={styles["tab-icon"]} />
                            Theo ngày
                        </button>
                        <button 
                            className={`${styles["tab"]} ${activeTab === 'views' ? styles["active-tab"] : ''}`}
                            onClick={() => setActiveTab('views')}
                        >
                            <img src={icons.visitsStat} alt="" className={styles["tab-icon"]} />
                            Lượt xem
                        </button>
                        <button 
                            className={`${styles["tab"]} ${activeTab === 'comments' ? styles["active-tab"] : ''}`}
                            onClick={() => setActiveTab('comments')}
                        >
                            <img src={icons.commentsStat} alt="" className={styles["tab-icon"]} />
                            Bình luận
                        </button>
                        <button 
                            className={`${styles["tab"]} ${activeTab === 'users' ? styles["active-tab"] : ''}`}
                            onClick={() => setActiveTab('users')}
                        >
                            <img src={icons.usersGroup} alt="" className={styles["tab-icon"]} />
                            Người dùng mới
                        </button>
                        <button 
                            className={`${styles["tab"]} ${activeTab === 'content' ? styles["active-tab"] : ''}`}
                            onClick={() => setActiveTab('content')}
                        >
                            <img src={icons.filePlus} alt="" className={styles["tab-icon"]} />
                            Nội dung mới
                        </button>
                    </div>
                    
                    {/* Tab Content */}
                    {activeTab === 'daily' && (
                        loadingDaily ? (
                            <div className={styles["loading"]}>Đang tải dữ liệu...</div>
                        ) : dailyStats ? (
                            <table className={styles["daily-table"]}>
                                <thead>
                                    <tr>
                                        <th>Ngày</th>
                                        <th>Nội dung mới</th>
                                        <th>Lượt xem</th>
                                        <th>Bình luận</th>
                                        <th>Người dùng mới</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dailyStats.stats.articles.map((_, index) => (
                                        <tr key={index}>
                                            <td>Ngày {index + 1}</td>
                                            <td>{dailyStats.stats.allContent ? dailyStats.stats.allContent[index].count : 0}</td>
                                            <td>{dailyStats.stats.views[index].count}</td>
                                            <td>{dailyStats.stats.comments[index].count}</td>
                                            <td>{dailyStats.stats.users[index].count}</td>
                                        </tr>
                                    ))}
                                    <tr className={styles["total-row"]}>
                                        <td><strong>Tổng cộng</strong></td>
                                        <td><strong>{dailyStats.stats.allContent ? dailyStats.stats.allContent.reduce((sum, item) => sum + item.count, 0) : 0}</strong></td>
                                        <td><strong>{dailyStats.stats.views.reduce((sum, item) => sum + item.count, 0)}</strong></td>
                                        <td><strong>{dailyStats.stats.comments.reduce((sum, item) => sum + item.count, 0)}</strong></td>
                                        <td><strong>{dailyStats.stats.users.reduce((sum, item) => sum + item.count, 0)}</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        ) : (
                            <div className={styles["error"]}>Không có dữ liệu</div>
                        )
                    )}

                    {activeTab === 'views' && (
                        loadingDetails ? (
                            <div className={styles["loading"]}>Đang tải dữ liệu...</div>
                        ) : detailedContent?.topViewedContent ? (
                            <div className={styles["detail-content"]}>
                                <h5>Top nội dung có lượt xem cao nhất trong {monthNames[selectedMonth]} {year}</h5>
                                <p className={styles["detail-description"]}>
                                    Số lượt xem được tính trong khoảng thời gian từ ngày 1 đến hết {monthNames[selectedMonth]} {year}
                                </p>
                                <table className={styles["detail-table"]}>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Loại</th>
                                            <th>Tiêu đề</th>
                                            <th>Tác giả</th>
                                            <th>Lượt xem trong tháng</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detailedContent.topViewedContent.map((item, index) => (
                                            <tr key={`${item.content_type}-${item.id}`}>
                                                <td>{index + 1}</td>
                                                <td><span className={styles["content-type-badge"]}>{item.page_type}</span></td>
                                                <td className={styles["content-title"]}>{item.title}</td>
                                                <td>{item.author}</td>
                                                <td><strong>{item.view_count}</strong></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {detailedContent.topViewedContent.length === 0 && (
                                    <div className={styles["no-data"]}>Không có nội dung nào được xem trong tháng này</div>
                                )}
                            </div>
                        ) : (
                            <div className={styles["error"]}>Không có dữ liệu</div>
                        )
                    )}

                    {activeTab === 'comments' && (
                        loadingDetails ? (
                            <div className={styles["loading"]}>Đang tải dữ liệu...</div>
                        ) : detailedContent?.topCommentedContent ? (
                            <div className={styles["detail-content"]}>
                                <h5>Top nội dung có nhiều bình luận nhất trong {monthNames[selectedMonth]} {year}</h5>
                                <p className={styles["detail-description"]}>
                                    Số bình luận được tính trong khoảng thời gian từ ngày 1 đến hết {monthNames[selectedMonth]} {year}
                                </p>
                                <table className={styles["detail-table"]}>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Loại</th>
                                            <th>Tiêu đề</th>
                                            <th>Tác giả</th>
                                            <th>Bình luận trong tháng</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detailedContent.topCommentedContent.map((item, index) => (
                                            <tr key={`${item.content_type}-${item.id}`}>
                                                <td>{index + 1}</td>
                                                <td><span className={styles["content-type-badge"]}>{item.page_type}</span></td>
                                                <td className={styles["content-title"]}>{item.title}</td>
                                                <td>{item.author}</td>
                                                <td><strong>{item.comment_count}</strong></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {detailedContent.topCommentedContent.length === 0 && (
                                    <div className={styles["no-data"]}>Không có bình luận nào trong tháng này</div>
                                )}
                            </div>
                        ) : (
                            <div className={styles["error"]}>Không có dữ liệu</div>
                        )
                    )}

                    {activeTab === 'users' && (
                        loadingDetails ? (
                            <div className={styles["loading"]}>Đang tải dữ liệu...</div>
                        ) : detailedContent?.newUsers ? (
                            <div className={styles["detail-content"]}>
                                <h5>Người dùng mới ({detailedContent.newUsers.length})</h5>
                                <table className={styles["detail-table"]}>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Tên đăng nhập</th>
                                            <th>Họ tên</th>
                                            <th>Email</th>
                                            <th>Vai trò</th>
                                            <th>Ngày đăng ký</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detailedContent.newUsers.map((user, index) => (
                                            <tr key={user.id}>
                                                <td>{index + 1}</td>
                                                <td>{user.username}</td>
                                                <td>{user.full_name}</td>
                                                <td>{user.email}</td>
                                                <td><span className={styles[`role-${user.role}`]}>{user.role}</span></td>
                                                <td>{new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className={styles["error"]}>Không có dữ liệu</div>
                        )
                    )}

                    {activeTab === 'content' && (
                        loadingDetails ? (
                            <div className={styles["loading"]}>Đang tải dữ liệu...</div>
                        ) : detailedContent?.newContent ? (
                            <div className={styles["detail-content"]}>
                                <div className={styles["content-header"]}>
                                    <h5>Nội dung mới (Tổng: {detailedContent.newContent.total})</h5>
                                </div>
                                
                                <div className={styles["content-summary"]}>
                                    <div className={styles["summary-item"]}>
                                        <span className={styles["summary-label"]}>Bài viết: </span>
                                        <span className={styles["summary-value"]}>{detailedContent.newContent.articles.length}</span>
                                    </div>
                                    <div className={styles["summary-item"]}>
                                        <span className={styles["summary-label"]}>Nhân vật: </span>
                                        <span className={styles["summary-value"]}>{detailedContent.newContent.figures.length}</span>
                                    </div>
                                    <div className={styles["summary-item"]}>
                                        <span className={styles["summary-label"]}>Sự kiện: </span>
                                        <span className={styles["summary-value"]}>{detailedContent.newContent.events.length}</span>
                                    </div>
                                    <div className={styles["summary-item"]}>
                                        <span className={styles["summary-label"]}>Địa danh:  </span>
                                        <span className={styles["summary-value"]}>{detailedContent.newContent.locations.length}</span>
                                    </div>
                                    <div className={styles["summary-item"]}>
                                        <span className={styles["summary-label"]}>Thời kỳ: </span>
                                        <span className={styles["summary-value"]}>{detailedContent.newContent.periods.length}</span>
                                    </div>
                                </div>

                                {detailedContent.newContent.articles.length > 0 && (
                                    <div className={styles["content-section"]}>
                                        <div className={styles["section-header"]}>
                                            <h6>
                                                <img src={icons.news} alt="" className={styles["section-icon"]} />
                                                Bài viết ({detailedContent.newContent.articles.length})
                                            </h6>
                                            <button 
                                                className={styles["print-section-button"]}
                                                onClick={() => handlePrintContentSection('articles')}
                                                title="In danh sách bài viết"
                                            >
                                                <img src={icons.printer} alt="Print" className={styles["button-icon"]} />
                                            </button>
                                        </div>
                                        <table className={styles["detail-table"]}>
                                            <thead>
                                                <tr>
                                                    <th>Tiêu đề</th>
                                                    <th>Tác giả</th>
                                                    <th>Lượt xem</th>
                                                    <th>Bình luận</th>
                                                    <th>Ngày xuất bản</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {detailedContent.newContent.articles.map((article) => (
                                                    <tr key={article.id}>
                                                        <td className={styles["content-title"]}>{article.title}</td>
                                                        <td>{article.author}</td>
                                                        <td>{article.view_count}</td>
                                                        <td>{article.comment_count}</td>
                                                        <td>{new Date(article.published_date).toLocaleDateString('vi-VN')}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {detailedContent.newContent.figures.length > 0 && (
                                    <div className={styles["content-section"]}>
                                        <div className={styles["section-header"]}>
                                            <h6>
                                                <img src={icons.user} alt="" className={styles["section-icon"]} />
                                                Nhân vật ({detailedContent.newContent.figures.length})
                                            </h6>
                                            <button 
                                                className={styles["print-section-button"]}
                                                onClick={() => handlePrintContentSection('figures')}
                                                title="In danh sách nhân vật"
                                            >
                                                <img src={icons.printer} alt="Print" className={styles["button-icon"]} />
                                            </button>
                                        </div>
                                        <table className={styles["detail-table"]}>
                                            <thead>
                                                <tr>
                                                    <th>Tên</th>
                                                    <th>Chức danh</th>
                                                    <th>Lượt xem</th>
                                                    <th>Bình luận</th>
                                                    <th>Ngày tạo</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {detailedContent.newContent.figures.map((figure) => (
                                                    <tr key={figure.id}>
                                                        <td className={styles["content-title"]}>{figure.name}</td>
                                                        <td>{figure.title || '-'}</td>
                                                        <td>{figure.view_count}</td>
                                                        <td>{figure.comment_count}</td>
                                                        <td>{new Date(figure.created_date).toLocaleDateString('vi-VN')}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {detailedContent.newContent.events.length > 0 && (
                                    <div className={styles["content-section"]}>
                                        <div className={styles["section-header"]}>
                                            <h6>
                                                <img src={icons.calendar} alt="" className={styles["section-icon"]} />
                                                Sự kiện ({detailedContent.newContent.events.length})
                                            </h6>
                                            <button 
                                                className={styles["print-section-button"]}
                                                onClick={() => handlePrintContentSection('events')}
                                                title="In danh sách sự kiện"
                                            >
                                                <img src={icons.printer} alt="Print" className={styles["button-icon"]} />
                                            </button>
                                        </div>
                                        <table className={styles["detail-table"]}>
                                            <thead>
                                                <tr>
                                                    <th>Tên sự kiện</th>
                                                    <th>Lượt xem</th>
                                                    <th>Bình luận</th>
                                                    <th>Ngày tạo</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {detailedContent.newContent.events.map((event) => (
                                                    <tr key={event.id}>
                                                        <td className={styles["content-title"]}>{event.name}</td>
                                                        <td>{event.view_count}</td>
                                                        <td>{event.comment_count}</td>
                                                        <td>{new Date(event.created_date).toLocaleDateString('vi-VN')}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {detailedContent.newContent.locations.length > 0 && (
                                    <div className={styles["content-section"]}>
                                        <div className={styles["section-header"]}>
                                            <h6>
                                                <img src={icons.mapPin} alt="" className={styles["section-icon"]} />
                                                Địa danh ({detailedContent.newContent.locations.length})
                                            </h6>
                                            <button 
                                                className={styles["print-section-button"]}
                                                onClick={() => handlePrintContentSection('locations')}
                                                title="In danh sách địa danh"
                                            >
                                                <img src={icons.printer} alt="Print" className={styles["button-icon"]} />
                                            </button>
                                        </div>
                                        <table className={styles["detail-table"]}>
                                            <thead>
                                                <tr>
                                                    <th>Tên địa danh</th>
                                                    <th>Lượt xem</th>
                                                    <th>Bình luận</th>
                                                    <th>Ngày tạo</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {detailedContent.newContent.locations.map((location) => (
                                                    <tr key={location.id}>
                                                        <td className={styles["content-title"]}>{location.name}</td>
                                                        <td>{location.view_count}</td>
                                                        <td>{location.comment_count}</td>
                                                        <td>{new Date(location.created_date).toLocaleDateString('vi-VN')}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {detailedContent.newContent.periods.length > 0 && (
                                    <div className={styles["content-section"]}>
                                        <div className={styles["section-header"]}>
                                            <h6>
                                                <img src={icons.clock} alt="" className={styles["section-icon"]} />
                                                Thời kỳ ({detailedContent.newContent.periods.length})
                                            </h6>
                                            <button 
                                                className={styles["print-section-button"]}
                                                onClick={() => handlePrintContentSection('periods')}
                                                title="In danh sách thời kỳ"
                                            >
                                                <img src={icons.printer} alt="Print" className={styles["button-icon"]} />
                                            </button>
                                        </div>
                                        <table className={styles["detail-table"]}>
                                            <thead>
                                                <tr>
                                                    <th>Tên thời kỳ</th>
                                                    <th>Lượt xem</th>
                                                    <th>Bình luận</th>
                                                    <th>Ngày tạo</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {detailedContent.newContent.periods.map((period) => (
                                                    <tr key={period.id}>
                                                        <td className={styles["content-title"]}>{period.name}</td>
                                                        <td>{period.view_count}</td>
                                                        <td>{period.comment_count}</td>
                                                        <td>{new Date(period.created_date).toLocaleDateString('vi-VN')}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className={styles["error"]}>Không có dữ liệu</div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};

export default MonthlyReport;
