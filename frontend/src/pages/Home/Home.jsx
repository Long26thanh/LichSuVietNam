import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import config from "../../config";
import {
    periodService,
    figureService,
    eventService,
    locationService,
    articleService,
} from "../../services";
import { recordWebsiteView } from "@/services/viewService";
import TimeLineCard from "../../components/Card/TimeLineCard/TimeLineCard";
import FigureCard from "../../components/Card/FigureCard/FigureCard";
import EventCard from "../../components/Card/EventCard/EventCard";
import LocationCard from "../../components/Card/LocationCard/LocationCard";
import ArticleCard from "../../components/Card/ArticleCard/ArticleCard";
import "./Home.css";

function Home() {
    const [periods, setPeriods] = useState([]);
    const [figures, setFigures] = useState([]);
    const [events, setEvents] = useState([]);
    const [locations, setLocations] = useState([]);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch periods
                const periodsResponse = await periodService.getAllPeriods();
                const periodsData = Array.isArray(periodsResponse)
                    ? periodsResponse
                    : periodsResponse?.data || [];
                setPeriods(periodsData.slice(0, 3));

                // Fetch figures
                const figuresResponse = await figureService.getAllFigures();
                const figuresData = Array.isArray(figuresResponse)
                    ? figuresResponse
                    : figuresResponse?.data || [];
                setFigures(figuresData.slice(0, 3));

                // Fetch events
                const eventsResponse = await eventService.getAllEvents();
                const eventsData = Array.isArray(eventsResponse)
                    ? eventsResponse
                    : eventsResponse?.data || [];
                setEvents(eventsData.slice(0, 3));

                // Fetch locations
                const locationsResponse =
                    await locationService.getAllLocations();
                const locationsData = Array.isArray(locationsResponse)
                    ? locationsResponse
                    : locationsResponse?.data || [];
                setLocations(locationsData.slice(0, 3));

                // Fetch articles
                const articlesResponse =
                    await articleService.getPublishedArticles({
                        page: 1,
                        limit: 3,
                    });
                const articlesData = articlesResponse?.data || [];
                setArticles(articlesData);
            } catch (error) {
                console.error("Error fetching home data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Ghi nhận lượt xem website
    useEffect(() => {
        recordWebsiteView();
    }, []);

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Lịch Sử Việt Nam</h1>
                    <p className="hero-description">
                        Khám phá và tìm hiểu lịch sử hào hùng của dân tộc Việt
                        Nam qua hàng ngàn năm dựng nước và giữ nước
                    </p>
                    <div className="hero-actions">
                        <Link
                            to={config.routes.timeline}
                            className="hero-btn primary"
                        >
                            Khám phá dòng thời gian
                        </Link>
                        <Link
                            to={config.routes.news}
                            className="hero-btn secondary"
                        >
                            Đọc tin tức
                        </Link>
                    </div>
                </div>
            </section>

            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            ) : periods.length === 0 &&
              figures.length === 0 &&
              events.length === 0 &&
              locations.length === 0 &&
              articles.length === 0 ? (
                <div className="no-data-container">
                    <h3>Chưa có dữ liệu</h3>
                    <p>Hiện tại chưa có nội dung nào được thêm vào hệ thống.</p>
                    <p>Vui lòng quay lại sau hoặc liên hệ quản trị viên.</p>
                </div>
            ) : (
                <>
                    {/* Featured Periods - Dòng thời gian */}
                    {periods.length > 0 && (
                        <section className="timeline-section">
                            <div className="timeline-section-header">
                                <h2 className="section-title">
                                    Dòng Thời Gian
                                </h2>
                            </div>
                            <div className="home-timeline-container">
                                <div className="home-timeline-line"></div>
                                {periods.map((period, index) => (
                                    <div
                                        key={period.id}
                                        className="home-timeline-item-container"
                                    >
                                        {index % 2 === 0 ? (
                                            <>
                                                <div className="home-timeline-item-left">
                                                    <TimeLineCard
                                                        period={period}
                                                        isLeft={true}
                                                    />
                                                </div>
                                                <div className="home-timeline-marker"></div>
                                                <div className="home-timeline-item-right"></div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="home-timeline-item-left"></div>
                                                <div className="home-timeline-marker"></div>
                                                <div className="home-timeline-item-right">
                                                    <TimeLineCard
                                                        period={period}
                                                        isLeft={false}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="timeline-view-all-container">
                                <Link
                                    to={config.routes.timeline}
                                    className="timeline-view-all-btn"
                                >
                                    Xem dòng thời gian đầy đủ
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </section>
                    )}

                    {/* Featured Articles - Tin tức */}
                    {articles.length > 0 && (
                        <section className="home-section">
                            <div className="section-header">
                                <h2 className="section-title">Tin Tức</h2>
                                <Link
                                    to={config.routes.news}
                                    className="view-all"
                                >
                                    Xem tất cả →
                                </Link>
                            </div>
                            <div className="home-grid">
                                {articles.map((article) => (
                                    <ArticleCard
                                        key={article.id}
                                        article={article}
                                        viewCount={article.viewCount || 0}
                                        commentCount={article.commentCount || 0}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Featured Figures */}
                    {figures.length > 0 && (
                        <section className="home-section">
                            <div className="section-header">
                                <h2 className="section-title">
                                    Nhân Vật Lịch Sử
                                </h2>
                                <Link
                                    to={config.routes.characters}
                                    className="view-all"
                                >
                                    Xem tất cả →
                                </Link>
                            </div>
                            <div className="home-grid">
                                {figures.map((figure) => (
                                    <FigureCard
                                        key={figure.id}
                                        figure={figure}
                                        viewCount={figure.viewCount || 0}
                                        commentCount={figure.commentCount || 0}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Featured Events */}
                    {events.length > 0 && (
                        <section className="home-section">
                            <div className="section-header">
                                <h2 className="section-title">
                                    Sự Kiện Nổi Bật
                                </h2>
                                <Link
                                    to={config.routes.events}
                                    className="view-all"
                                >
                                    Xem tất cả →
                                </Link>
                            </div>
                            <div className="home-grid">
                                {events.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        viewCount={event.viewCount || 0}
                                        commentCount={event.commentCount || 0}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Featured Locations */}
                    {locations.length > 0 && (
                        <section className="home-section">
                            <div className="section-header">
                                <h2 className="section-title">
                                    Địa Danh Lịch Sử
                                </h2>
                                <Link
                                    to={config.routes.locations}
                                    className="view-all"
                                >
                                    Xem tất cả →
                                </Link>
                            </div>
                            <div className="home-grid">
                                {locations.map((location) => (
                                    <LocationCard
                                        key={location.id}
                                        location={location}
                                        viewCount={location.viewCount || 0}
                                        commentCount={
                                            location.commentCount || 0
                                        }
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}

            {/* Call to Action */}
            <section className="cta-section">
                <h2 className="cta-title">Cùng Khám Phá Lịch Sử Việt Nam</h2>
                <p className="cta-description">
                    Tìm hiểu về các giai đoạn lịch sử, nhân vật, sự kiện và địa
                    danh quan trọng trong lịch sử dân tộc
                </p>
                <Link to={config.routes.news} className="cta-button">
                    Đọc thêm tin tức →
                </Link>
            </section>
        </div>
    );
}

export default Home;
