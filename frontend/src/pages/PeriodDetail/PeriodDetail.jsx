import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { periodService } from "@/services";
import "./PeriodDetail.css";

const PeriodDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [period, setPeriod] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPeriod = async () => {
            try {
                setLoading(true);
                const response = await periodService.getPeriodById(id);
                if (!response.success) {
                    setError("Lấy thông tin thời kỳ thất bại");
                } else {
                    setPeriod(response.data);
                }
            } catch (error) {
                console.error("Lỗi lấy thông tin thời kỳ:", error);
                setError("Lấy thông tin thời kỳ thất bại");
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchPeriod();
        }
    }, [id]);

    const formatYear = (year) => {
        return year < 0 ? `${Math.abs(year)} TCN` : `${year} SCN`;
    };

    const formatPeriod = () => {
        if (!period) return "";
        const startYear = period.start_year;
        const endYear = period.end_year;
        if (startYear && endYear) {
            return `${formatYear(startYear)} - ${formatYear(endYear)}`;
        } else if (startYear) {
            return `${formatYear(startYear)}`;
        } else if (endYear) {
            return `${formatYear(endYear)}`;
        }
        return "N/A";
    };

    const handleBackClick = () => {
        navigate(-1);
    };
    if (loading) {
        return <div className="period-detail">Đang tải...</div>;
    }
    if (error) {
        return <div className="period-detail">Lỗi: {error}</div>;
    }

    if (!period) {
        return (
            <>
                <div className="period-detail">Không tìm thấy thời kỳ</div>
                <button onClick={handleBackClick} className="back-button">
                    Quay lại dòng thời gian
                </button>
            </>
        );
    }
    return (
        <div className="period-detail">
            <button onClick={handleBackClick} className="back-button">
                ← Quay lại dòng thời gian
            </button>

            <div className="period-detail-header">
                <h1 className="period-title">{period.name}</h1>
                {formatPeriod() && (
                    <p className="period-years">{formatPeriod()}</p>
                )}
            </div>

            <div className="period-detail-content">
                {period.summary && (
                    <div className="period-section">
                        <h2 className="section-title">Tóm tắt</h2>
                        <div
                            className="section-content"
                            dangerouslySetInnerHTML={{ __html: period.summary }}
                        ></div>
                    </div>
                )}
                {period.description && (
                    <div className="period-section">
                        <h2 className="section-title">Mô tả</h2>
                        <div
                            className="section-content"
                            dangerouslySetInnerHTML={{
                                __html: period.description,
                            }}
                        ></div>
                    </div>
                )}
            </div>

            <div className="period-metadata-card">
                <h3 className="metadata-title">Thông tin</h3>
                <ul className="metadata-list">
                    {period.start_year && (
                        <li className="metadata-item">
                            <strong>Năm bắt đầu:</strong>{" "}
                            <span>{formatYear(period.start_year)}</span>
                        </li>
                    )}
                    {period.end_year && (
                        <li className="metadata-item">
                            <strong>Năm kết thúc:</strong>{" "}
                            <span>{formatYear(period.end_year)}</span>
                        </li>
                    )}
                    {period.start_year && period.end_year && (
                        <li className="metadata-item">
                            <strong>Thời gian tồn tại:</strong>{" "}
                            <span>
                                {Math.abs(period.start_year - period.end_year)}{" "}
                                năm
                            </span>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default PeriodDetail;
