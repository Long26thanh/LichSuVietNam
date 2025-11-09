import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import figureService from "@/services/figureService";
import locationService from "@/services/locationService";
import { recordWebsiteView, recordFigureView } from "@/services/viewService";
import { formatDateRange, convertImagesToAbsoluteUrls } from "@/utils";
import { CommentSection } from "@/components";
import "./FigureDetail.css";

const FigureDetail = () => {
    const { id } = useParams();
    const nav = useNavigate();
    const { state } = useLocation();
    const [item, setItem] = useState(state?.figure || null);
    const [loading, setLoading] = useState(!state?.figure);
    const [error, setError] = useState(null);
    const [birthPlaceName, setBirthPlaceName] = useState(null);
    const [deathPlaceName, setDeathPlaceName] = useState(null);

    useEffect(() => {
        // Luôn fetch dữ liệu mới khi id thay đổi hoặc component mount
        // State chỉ dùng để hiển thị tạm thời, nhưng vẫn cập nhật từ server
        const fetchDetail = async () => {
            try {
                // Chỉ hiển thị loading nếu chưa có dữ liệu tạm từ state
                if (!item) setLoading(true);
                
                const res = await figureService.getFigureById(id);
                if (res?.success && res.data) {
                    setItem(res.data);
                    setError(null);
                } else {
                    setError("Không tìm thấy nhân vật");
                }
            } catch (e) {
                setError("Lỗi tải chi tiết nhân vật");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    // Load place names after item is available (avoid async in render)
    useEffect(() => {
        if (!item) return;
        const { birth_place_id, death_place_id } = item || {};
        const loadNames = async () => {
            try {
                const [birthNameRes, deathNameRes] = await Promise.all([
                    birth_place_id
                        ? locationService.getLocationNameById(birth_place_id)
                        : Promise.resolve(null),
                    death_place_id
                        ? locationService.getLocationNameById(death_place_id)
                        : Promise.resolve(null),
                ]);
                setBirthPlaceName(
                    birthNameRes?.success ? birthNameRes.data.name : null
                );
                setDeathPlaceName(
                    deathNameRes?.success ? deathNameRes.data.name : null
                );
            } catch (_) {
                console.error("Error loading place names:", _);
            }
        };
        loadNames();
    }, [item]);

    // Ghi nhận lượt xem
    useEffect(() => {
        if (item && item.id) {
            recordWebsiteView();
            recordFigureView(item.id);
        }
    }, [item]);

    const handleBack = () => nav(-1);

    const formatLifespan = () => {
        return formatDateRange(
            {
                day: item.birth_date,
                month: item.birth_month,
                year: item.birth_year,
            },
            {
                day: item.death_date,
                month: item.death_month,
                year: item.death_year,
            }
        );
    };

    if (loading) return <div className="fig-detail-page">Đang tải...</div>;
    if (error) return <div className="fig-detail-page">{error}</div>;
    if (!item) return <div className="fig-detail-page">Không có dữ liệu</div>;

    return (
        <div className="fig-detail-page">
            <button className="back-button" onClick={handleBack}>
                ← Quay lại
            </button>
            <header className="fig-detail-header">
                <h1 className="fig-name">{item.name}</h1>
                {item.title && <span className="fig-title">{item.title}</span>}
            </header>

            <main className="fig-detail-content">
                <section className="fig-section">
                    <h2 className="section-title">Thông tin chung</h2>
                    <ul className="info-list">
                        <li>
                            <strong>Thời gian:</strong>{" "}
                            <span>{formatLifespan()}</span>
                        </li>

                        {item.birth_place_id && (
                            <li>
                                <strong>Nơi sinh:</strong>{" "}
                                <Link to={`/locations/${item.birth_place_id}`}>
                                    {birthPlaceName || "Xem địa danh"}
                                </Link>
                            </li>
                        )}
                        {item.death_place_id && (
                            <li>
                                <strong>Nơi mất:</strong>{" "}
                                <Link to={`/locations/${item.death_place_id}`}>
                                    {deathPlaceName || "Xem địa danh"}
                                </Link>
                            </li>
                        )}
                    </ul>
                </section>
                {item.biography && (
                    <section className="fig-section">
                        <h2 className="section-title">Tiểu sử</h2>
                        <div 
                            className="section-content"
                            dangerouslySetInnerHTML={{ __html: convertImagesToAbsoluteUrls(item.biography) }}
                        />
                    </section>
                )}
                {item.achievements && (
                    <section className="fig-section">
                        <h2 className="section-title">Thành tựu</h2>
                        <div 
                            className="section-content"
                            dangerouslySetInnerHTML={{ __html: convertImagesToAbsoluteUrls(item.achievements) }}
                        />
                    </section>
                )}
            </main>

            {/* Comment Section */}
            <CommentSection pageType="Nhân vật" pageId={item.id} />
        </div>
    );
};

export default FigureDetail;
