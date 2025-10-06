import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import eventService from "@/services/eventService";
import locationService from "@/services/locationService";
import periodService from "@/services/periodService";
import routes from "@/config/routes";
import { formatDateRange } from "@/utils";
import "./EventDetail.css";

const EventDetail = () => {
    const { id } = useParams();
    const nav = useNavigate();
    const { state } = useLocation();
    const [item, setItem] = useState(state?.event || null);
    const [loading, setLoading] = useState(!state?.event);
    const [error, setError] = useState(null);
    const [locationName, setLocationName] = useState(null);
    const [periodName, setPeriodName] = useState(null);

    useEffect(() => {
        if (item) return;
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const res = await eventService.getEventById(id);
                if (res?.success && res.data) {
                    setItem(res.data);
                } else {
                    setError("Không tìm thấy sự kiện");
                }
            } catch (e) {
                setError("Lỗi tải chi tiết sự kiện");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    // Load location and period names after item is available
    useEffect(() => {
        if (!item) return;
        
        const loadNames = async () => {
            try {
                const promises = [];
                
                if (item.locationId) {
                    promises.push(
                        locationService.getLocationNameById(item.locationId)
                            .then(res => res?.success ? res.data?.name : null)
                            .catch(() => null)
                    );
                } else {
                    promises.push(Promise.resolve(null));
                }
                
                if (item.periodId) {
                    promises.push(
                        periodService.getPeriodNameById(item.periodId)
                            .then(res => res?.success ? res.data?.name : null)
                            .catch(() => null)
                    );
                } else {
                    promises.push(Promise.resolve(null));
                }
                
                const [locationNameResult, periodNameResult] = await Promise.all(promises);
                setLocationName(locationNameResult);
                setPeriodName(periodNameResult);
            } catch (error) {
                console.error("Error loading names:", error);
            }
        };
        
        loadNames();
    }, [item]);

    const handleBack = () => nav(-1);

    const getFormattedDateRange = () => {
        return formatDateRange(
            {
                day: item.startDate,
                month: item.startMonth,
                year: item.startYear,
            },
            { day: item.endDate, month: item.endMonth, year: item.endYear }
        );
    };

    if (loading) return <div className="event-detail-page">Đang tải...</div>;
    if (error) return <div className="event-detail-page">{error}</div>;
    if (!item) return <div className="event-detail-page">Không có dữ liệu</div>;

    return (
        <div className="event-detail-page">
            <button className="back-button" onClick={handleBack}>
                ← Quay lại
            </button>
            <header className="event-detail-header">
                <h1 className="event-name">{item.name}</h1>
                <div className="event-date-range">
                    {getFormattedDateRange()}
                </div>
            </header>

            <main className="event-detail-content">
                <section className="event-section">
                    <h2 className="section-title">Thông tin chung</h2>
                    <ul className="info-list">
                        <li>
                            <strong>Thời gian:</strong>
                            <span>{getFormattedDateRange()}</span>
                        </li>
                        {item.locationId && (
                            <li>
                                <strong>Địa điểm:</strong>
                                <Link
                                    to={routes.locationDetail.replace(
                                        ":id",
                                        item.locationId
                                    )}
                                >
                                    {locationName || "Xem địa danh"}
                                </Link>
                            </li>
                        )}
                        {item.periodId && (
                            <li>
                                <strong>Thời kỳ:</strong>
                                <Link
                                    to={routes.periodDetail.replace(
                                        ":id",
                                        item.periodId
                                    )}
                                >
                                    {periodName || "Xem thời kỳ"}
                                </Link>
                            </li>
                        )}
                    </ul>
                </section>

                {item.summary && (
                    <section className="event-section">
                        <h2 className="section-title">Tóm tắt</h2>
                        <div className="section-content">{item.summary}</div>
                    </section>
                )}

                {item.description && (
                    <section className="event-section">
                        <h2 className="section-title">Mô tả chi tiết</h2>
                        <div className="section-content">
                            {item.description}
                        </div>
                    </section>
                )}

                {item.significance && (
                    <section className="event-section">
                        <h2 className="section-title">Ý nghĩa lịch sử</h2>
                        <div className="section-content">
                            {item.significance}
                        </div>
                    </section>
                )}

                {item.related_figures && item.related_figures.length > 0 && (
                    <section className="event-section">
                        <h2 className="section-title">Nhân vật liên quan</h2>
                        <ul className="related-figures-list">
                            {item.related_figures.map((figure, index) => {
                                // Handle both old format (string) and new format (object with id and name)
                                const figureId =
                                    typeof figure === "object"
                                        ? figure.id
                                        : null;
                                const figureName =
                                    typeof figure === "object"
                                        ? figure.name
                                        : figure;

                                return (
                                    <li
                                        key={figureId || index}
                                        className="related-figure-item"
                                    >
                                        {figureId ? (
                                            <Link
                                                to={routes.figureDetail.replace(
                                                    ":id",
                                                    figureId
                                                )}
                                                className="figure-link"
                                            >
                                                {figureName}
                                            </Link>
                                        ) : (
                                            <span>{figureName}</span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                )}
            </main>
        </div>
    );
};

export default EventDetail;
