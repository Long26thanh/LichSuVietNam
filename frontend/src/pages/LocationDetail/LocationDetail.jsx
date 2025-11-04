import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import locationService from "@/services/locationService";
import { recordWebsiteView, recordLocationView } from "@/services/viewService";
import { CommentSection } from "@/components";
import "./LocationDetail.css";

const LocationDetail = () => {
    const { id } = useParams();
    const nav = useNavigate();
    const { state } = useLocation();
    const [item, setItem] = useState(state?.location || null);
    const [loading, setLoading] = useState(!state?.location);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (item) return; // đã có từ state
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const res = await locationService.getLocationById(id);
                if (res?.success && res.data) {
                    setItem(res.data);
                } else {
                    setError("Không tìm thấy địa danh");
                }
            } catch (e) {
                setError("Lỗi tải chi tiết địa danh");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    // Ghi nhận lượt xem
    useEffect(() => {
        if (item && item.id) {
            recordWebsiteView();
            recordLocationView(item.id);
        }
    }, [item]);

    const handleBack = () => nav(-1);

    if (loading) return <div className="loc-detail-page">Đang tải...</div>;
    if (error) return <div className="loc-detail-page">{error}</div>;
    if (!item) return <div className="loc-detail-page">Không có dữ liệu</div>;

    return (
        <div className="loc-detail-page">
            <button className="back-button" onClick={handleBack}>
                ← Quay lại
            </button>
            <header className="loc-detail-header">
                <h1 className="loc-name">{item.name}</h1>
                {item.location_type && (
                    <span className="loc-type">{item.location_type}</span>
                )}
            </header>

            <main className="loc-detail-content">
                <section className="loc-section">
                    <h2 className="section-title">Thông tin chung</h2>
                    <ul className="info-list">
                        {item.ancient_name && (
                            <li>
                                <strong>Tên cổ:</strong>{" "}
                                <span>{item.ancient_name}</span>
                            </li>
                        )}
                        {item.modern_name && (
                            <li>
                                <strong>Tên hiện đại:</strong>{" "}
                                <span>{item.modern_name}</span>
                            </li>
                        )}
                        {item.latitude && item.longitude && (
                            <li>
                                <strong>Tọa độ:</strong>{" "}
                                <span>
                                    {item.latitude}, {item.longitude}
                                </span>
                            </li>
                        )}
                    </ul>
                </section>

                {item.description && (
                    <section className="loc-section">
                        <h2 className="section-title">Mô tả</h2>
                        <div className="section-content">
                            {item.description}
                        </div>
                    </section>
                )}

                {item.detail && (
                    <section className="loc-section">
                        <h2 className="section-title">Chi tiết</h2>
                        <div className="section-content">{item.detail}</div>
                    </section>
                )}
            </main>

            {/* Comment Section */}
            <CommentSection pageType="Địa danh" pageId={item.id} />
        </div>
    );
};

export default LocationDetail;
