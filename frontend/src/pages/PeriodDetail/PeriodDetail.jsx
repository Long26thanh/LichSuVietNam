import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { previewService, periodService } from "@/services";
import { recordWebsiteView, recordPeriodView } from "@/services/viewService";
import { convertImagesToAbsoluteUrls } from "@/utils";
import "./PeriodDetail.css";
import { TextEditor, CommentSection } from "@/components";

const PeriodDetail = ({ isPreview = false }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [period, setPeriod] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPeriod = async () => {
            try {
                setLoading(true);
                // Sử dụng API khác nhau cho preview và xem thường
                const response = isPreview
                    ? await previewService.previewPeriod(id)
                    : await periodService.getPeriodById(id);

                if (!response.success) {
                    setError(
                        isPreview
                            ? "Xem trước thời kỳ thất bại"
                            : "Lấy thông tin thời kỳ thất bại"
                    );
                } else {
                    setPeriod(response.data);
                }
            } catch (error) {
                console.error(
                    isPreview
                        ? "Lỗi xem trước thời kỳ:"
                        : "Lỗi lấy thông tin thời kỳ:",
                    error
                );
                setError(
                    isPreview
                        ? "Xem trước thời kỳ thất bại"
                        : "Lấy thông tin thời kỳ thất bại"
                );
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchPeriod();
        }
    }, [id, isPreview]);

    // Ghi nhận lượt xem (chỉ khi không phải preview)
    useEffect(() => {
        if (period && period.id && !isPreview) {
            recordWebsiteView();
            recordPeriodView(period.id);
        }
    }, [period, isPreview]);

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
                ← Quay lại {isPreview ? "trang quản lý" : "dòng thời gian"}
            </button>

            {isPreview && (
                <div className="preview-banner">
                    Đang xem trước - Chỉ admin mới nhìn thấy nội dung này
                </div>
            )}

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
                            dangerouslySetInnerHTML={{ __html: convertImagesToAbsoluteUrls(period.summary) }}
                        ></div>
                    </div>
                )}
                {period.description && (
                    <div className="period-section">
                        <h2 className="section-title">Mô tả</h2>
                        <div
                            className="section-content"
                            dangerouslySetInnerHTML={{
                                __html: convertImagesToAbsoluteUrls(period.description),
                            }}
                        ></div>
                    </div>
                )}
            </div>

            {/* <div className="period-metadata-card">
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
            </div> */}

            {/* Comment Section - Chỉ hiển thị khi không phải preview */}
            {!isPreview && (
                <CommentSection pageType="Thời kỳ" pageId={period.id} />
            )}
        </div>
    );
};

export default PeriodDetail;
