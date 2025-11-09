import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { statsService } from "@/services";
import * as icons from "@/assets/icons";
import styles from "./ReportPrint.module.css";

const ReportPrint = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const hasAutoPressed = useRef(false); // Ref để track việc đã tự động in chưa

    // Lấy các tham số từ URL
    const period = searchParams.get("period") || "month";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const useCustomRange = searchParams.get("useCustomRange") === "true";

    useEffect(() => {
        loadStats();
    }, []); // Chỉ chạy 1 lần khi component mount

    // Tự động mở hộp thoại in sau khi dữ liệu được tải
    useEffect(() => {
        if (!loading && stats && !error && !hasAutoPressed.current) {
            hasAutoPressed.current = true; // Đánh dấu đã in 1 lần
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [loading, stats, error]);

    const loadStats = async () => {
        setLoading(true);
        setError(null);
        try {
            let response;
            if (useCustomRange && startDate && endDate) {
                response = await statsService.getDashboardStats(
                    period,
                    startDate,
                    endDate
                );
            } else {
                response = await statsService.getDashboardStats(period);
            }

            console.log("Report data loaded:", response); // Debug log

            if (response.success) {
                setStats(response.data);
            } else {
                setError("Không thể tải dữ liệu báo cáo");
            }
        } catch (error) {
            console.error("Error loading dashboard stats:", error);
            setError("Đã xảy ra lỗi khi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const getPeriodText = () => {
        if (useCustomRange && startDate && endDate) {
            const start = new Date(startDate).toLocaleDateString("vi-VN");
            const end = new Date(endDate).toLocaleDateString("vi-VN");
            return `${start} - ${end}`;
        }
        switch (period) {
            case "day":
                return "Theo Ngày";
            case "week":
                return "Theo Tuần";
            case "month":
                return "Theo Tháng";
            case "year":
                return "Theo Năm";
            default:
                return "";
        }
    };

    const getTopArticles = () => {
        return (
            stats?.topContent?.topViewedArticles?.slice(0, 5).map((article, index) => ({
                stt: index + 1,
                title: article.title || "Chưa có tiêu đề",
                views: article.views || article.view_count || 0,
            })) || []
        );
    };

    const getTopEvents = () => {
        // Lọc các sự kiện từ topViewedAllContent
        const events = stats?.topContent?.topViewedAllContent?.filter(
            item => item.content_type === 'event'
        ) || [];
        return events.slice(0, 5).map((event, index) => ({
            stt: index + 1,
            name: event.name || event.title || "Chưa có tên",
            views: event.views || event.view_count || 0,
        }));
    };

    const getTopFigures = () => {
        // Lọc các nhân vật từ topViewedAllContent
        const figures = stats?.topContent?.topViewedAllContent?.filter(
            item => item.content_type === 'figure'
        ) || [];
        return figures.slice(0, 5).map((figure, index) => ({
            stt: index + 1,
            name: figure.name || figure.title || "Chưa có tên",
            views: figure.views || figure.view_count || 0,
        }));
    };

    const getTopLocations = () => {
        // Lọc các địa điểm từ topViewedAllContent
        const locations = stats?.topContent?.topViewedAllContent?.filter(
            item => item.content_type === 'location'
        ) || [];
        return locations.slice(0, 5).map((location, index) => ({
            stt: index + 1,
            name: location.name || location.title || "Chưa có tên",
            views: location.views || location.view_count || 0,
        }));
    };

    const handlePrint = () => {
        window.print();
    };

    const handleClose = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className={styles["report-loading"]}>
                <img
                    src={icons.activity}
                    alt="loading"
                    className={styles["icon-spin"]}
                />
                <p>Đang tải dữ liệu báo cáo...</p>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className={styles["report-error"]}>
                <img src={icons.alert} alt="error" />
                <p>{error || "Không có dữ liệu"}</p>
                <button onClick={handleClose} className={styles["btn-back"]}>
                    Quay lại
                </button>
            </div>
        );
    }

    const now = new Date();
    const printDate = now.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
    const printTime = now.toLocaleTimeString("vi-VN");

    const topArticles = getTopArticles();
    const topEvents = getTopEvents();
    const topFigures = getTopFigures();
    const topLocations = getTopLocations();

    return (
        <div className={styles["report-print-page"]}>
            {/* Action buttons - chỉ hiển thị trên màn hình, không in */}
            <div className={styles["report-actions"]}>
                <button onClick={handlePrint} className={styles["btn-print"]}>
                    <img src={icons.printer} alt="print" />
                    In báo cáo
                </button>
                <button onClick={handleClose} className={styles["btn-close"]}>
                    <img src={icons.closeIcon} alt="close" />
                    Đóng
                </button>
            </div>

            {/* Nội dung báo cáo */}
            <div className={styles["print-container"]}>
                {/* HEADER */}
                <div className={styles["report-header"]}>
                    <div className={styles["org-info"]}>
                        <div className={styles["org-name"]}>
                            HỆ THỐNG QUẢN LÝ LỊCH SỬ VIỆT NAM
                        </div>
                        <div className={styles["org-subtitle"]}>
                            Hệ thống quản lý và lưu trữ tư liệu lịch sử
                        </div>
                    </div>

                    <div className={styles["report-title"]}>
                        <h1>BÁO CÁO THỐNG KÊ HỆ THỐNG</h1>
                    </div>

                    <div className={styles["report-info"]}>
                        <p>
                            <strong>Kỳ báo cáo:</strong> {getPeriodText()}
                        </p>
                        <p>
                            <strong>Ngày in:</strong> {printDate} - {printTime}
                        </p>
                    </div>
                </div>

                {/* TỔNG QUAN */}
                <div className={styles["section-title"]}>I. TỔNG QUAN HỆ THỐNG</div>
                <table className={styles["summary-table"]}>
                    <tbody>
                        <tr>
                            <td className={styles["label-cell"]}>Bài viết được tạo</td>
                            <td className={styles["value-cell"]}>
                                {(stats.overview?.totalArticlesPublished || 0) + 
                                 (stats.overview?.totalPendingArticles || 0)}
                            </td>
                        </tr>
                        <tr>
                            <td className={styles["label-cell"]}>Bài viết đã xuất bản</td>
                            <td className={styles["value-cell"]}>
                                {stats.overview?.totalArticlesPublished || 0}
                            </td>
                        </tr>
                        <tr>
                            <td className={styles["label-cell"]}>Bài viết chờ duyệt</td>
                            <td className={styles["value-cell"]}>
                                {stats.overview?.totalPendingArticles || 0}
                            </td>
                        </tr>
                        <tr>
                            <td className={styles["label-cell"]}>Tổng lượt xem</td>
                            <td className={styles["value-cell"]}>
                                {stats.overview?.totalViews || 0}
                            </td>
                        </tr>
                        <tr>
                            <td className={styles["label-cell"]}>Tổng bình luận</td>
                            <td className={styles["value-cell"]}>
                                {stats.overview?.totalComments || 0}
                            </td>
                        </tr>
                        <tr>
                            <td className={styles["label-cell"]}>Người dùng mới</td>
                            <td className={styles["value-cell"]}>
                                {stats.overview?.totalNewUsers || 0}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* CHI TIẾT TOP CONTENT */}
                <div className={styles["section-title"]}>
                    II. CHI TIẾT THỐNG KÊ LƯỢT XEM
                </div>

                <div className={styles["tables-grid"]}>
                    {/* TOP BÀI VIẾT */}
                    <div className={styles["table-wrapper"]}>
                        <h3>1. Top Bài viết xem nhiều nhất</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th className={styles["col-stt"]}>STT</th>
                                    <th>Tiêu đề bài viết</th>
                                    <th className={styles["col-views"]}>Lượt xem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topArticles.length > 0 ? (
                                    topArticles.map((item) => (
                                        <tr key={item.stt}>
                                            <td className={styles["text-center"]}>
                                                {item.stt}
                                            </td>
                                            <td>{item.title}</td>
                                            <td className={styles["text-right font-bold"]}>
                                                {item.views.toLocaleString(
                                                    "vi-VN"
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="3"
                                            className={styles["text-center no-data-cell"]}
                                        >
                                            Chưa có dữ liệu
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* TOP SỰ KIỆN */}
                    <div className={styles["table-wrapper"]}>
                        <h3>2. Top Sự kiện xem nhiều nhất</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th className={styles["col-stt"]}>STT</th>
                                    <th>Tên sự kiện</th>
                                    <th className={styles["col-views"]}>Lượt xem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topEvents.length > 0 ? (
                                    topEvents.map((item) => (
                                        <tr key={item.stt}>
                                            <td className={styles["text-center"]}>
                                                {item.stt}
                                            </td>
                                            <td>{item.name}</td>
                                            <td className={styles["text-right font-bold"]}>
                                                {item.views.toLocaleString(
                                                    "vi-VN"
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="3"
                                            className={styles["text-center no-data-cell"]}
                                        >
                                            Chưa có dữ liệu
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* TOP NHÂN VẬT */}
                    <div className={styles["table-wrapper"]}>
                        <h3>3. Top Nhân vật xem nhiều nhất</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th className={styles["col-stt"]}>STT</th>
                                    <th>Tên nhân vật</th>
                                    <th className={styles["col-views"]}>Lượt xem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topFigures.length > 0 ? (
                                    topFigures.map((item) => (
                                        <tr key={item.stt}>
                                            <td className={styles["text-center"]}>
                                                {item.stt}
                                            </td>
                                            <td>{item.name}</td>
                                            <td className={styles["text-right font-bold"]}>
                                                {item.views.toLocaleString(
                                                    "vi-VN"
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="3"
                                            className={styles["text-center no-data-cell"]}
                                        >
                                            Chưa có dữ liệu
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* TOP ĐỊA ĐIỂM */}
                    <div className={styles["table-wrapper"]}>
                        <h3>4. Top Địa điểm xem nhiều nhất</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th className={styles["col-stt"]}>STT</th>
                                    <th>Tên địa điểm</th>
                                    <th className={styles["col-views"]}>Lượt xem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topLocations.length > 0 ? (
                                    topLocations.map((item) => (
                                        <tr key={item.stt}>
                                            <td className={styles["text-center"]}>
                                                {item.stt}
                                            </td>
                                            <td>{item.name}</td>
                                            <td className={styles["text-right font-bold"]}>
                                                {item.views.toLocaleString(
                                                    "vi-VN"
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="3"
                                            className={styles["text-center no-data-cell"]}
                                        >
                                            Chưa có dữ liệu
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FOOTER */}
                <div className={styles["report-footer"]}>
                    <div className={styles["footer-left"]}>
                        <p>
                            <strong>Hệ thống Quản lý Lịch sử Việt Nam</strong>
                        </p>
                        <p>Báo cáo được tạo tự động từ hệ thống</p>
                    </div>
                    <div className={styles["footer-right"]}>
                        <p>Trang 1/1</p>
                        <p>© {now.getFullYear()} All Rights Reserved</p>
                    </div>
                </div>

                {/* CHỮ KÝ */}
                <div className={styles["signature-section"]}>
                    <div className={styles["signature-date"]}>Ngày {printDate}</div>
                    <div className={styles["signature-title"]}>Người lập báo cáo</div>
                    <div className={styles["signature-name"]}>
                        (Ký và ghi rõ họ tên)
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportPrint;
