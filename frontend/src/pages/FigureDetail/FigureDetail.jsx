import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import figureService from "@/services/figureService";
import locationService from "@/services/locationService";
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
        if (item) return;
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const res = await figureService.getFigureById(id);
                if (res?.success && res.data) {
                    setItem(res.data);
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
                const [birthName, deathName] = await Promise.all([
                    birth_place_id
                        ? locationService.getLocationNameById(birth_place_id)
                        : Promise.resolve(null),
                    death_place_id
                        ? locationService.getLocationNameById(death_place_id)
                        : Promise.resolve(null),
                ]);
                setBirthPlaceName(birthName);
                setDeathPlaceName(deathName);
            } catch (_) {}
        };
        loadNames();
    }, [item]);

    const handleBack = () => nav(-1);

    const formatYear = (year) => {
        if (!year) return "N/A";
        return year < 0 ? `${Math.abs(year)} TCN` : `${year} SCN`;
    };

    const formatLifespan = () => {
        if (item.birth_year && item.death_year) {
            return `${formatYear(item.birth_year)} - ${formatYear(
                item.death_year
            )}`;
        } else if (item.birth_year) {
            return `Sinh: ${formatYear(item.birth_year)}`;
        } else if (item.death_year) {
            return `Mất: ${formatYear(item.death_year)}`;
        }
        return "N/A";
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
                        <div className="section-content">{item.biography}</div>
                    </section>
                )}

                {item.achievements && (
                    <section className="fig-section">
                        <h2 className="section-title">Thành tựu</h2>
                        <div className="section-content">
                            {item.achievements}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default FigureDetail;
