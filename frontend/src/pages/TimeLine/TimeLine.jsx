import React, { useState, useEffect, useRef } from "react";
import TimeLineCard from "@/components/Card/TimeLineCard/TimeLineCard";
import Search from "@/components/Search/Search";
import "./TimeLine.css";
import { periodService } from "../../services";
import { recordWebsiteView } from "@/services/viewService";
import { use } from "react";

function TimeLine() {
    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredPeriods, setFilteredPeriods] = useState([]);
    const [showResultsInfo, setShowResultsInfo] = useState(false);
    const timelineRef = useRef(null);

    // Track website view
    useEffect(() => {
        recordWebsiteView();
    }, []);

    // Lấy dữ liệu từ API khi component được mount
    useEffect(() => {
        const fetchPeriods = async () => {
            try {
                const response = await periodService.getAllPeriods();
                if (!response.success) {
                    throw new Error("Failed to fetch periods");
                }
                const data = response.data;
                setPeriods(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPeriods();
    }, []);

    // Cập nhật filteredPeriods khi searchTerm hoặc periods thay đổi
    useEffect(() => {
        if (!searchTerm) {
            setFilteredPeriods(periods);
            setShowResultsInfo(false);
        } else {
            const filtered = periods.filter(
                (period) =>
                    period.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    (period.summary &&
                        period.summary
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()))
            );
            setFilteredPeriods(filtered);
            setShowResultsInfo(true);
        }
    }, [searchTerm, periods]);

    // Animation cho timeline khi số lượng items thay đổi
    useEffect(() => {
        if (timelineRef.current) {
            const timelineLine =
                timelineRef.current.querySelector(".timeline-line");
            const timelineContainer = timelineRef.current;

            if (timelineLine && timelineContainer) {
                // Tính toán chiều cao cần thiết dựa trên số lượng items
                const itemCount = filteredPeriods.length;
                const itemHeight = 300; // Chiều cao cho mỗi item (tăng lên để phù hợp hơn)
                const baseHeight = 200; // Chiều cao cơ bản
                const minHeight = Math.max(400, window.innerHeight * 0.5); // Tối thiểu 50% viewport

                // Tính toán chiều cao dựa trên số items thực tế
                let calculatedHeight;
                if (itemCount === 0) {
                    calculatedHeight = 300; // Chiều cao tối thiểu khi không có items
                } else if (itemCount === 1) {
                    calculatedHeight = 500; // Chiều cao vừa đủ cho 1 item, không quá dài
                } else {
                    calculatedHeight = Math.max(
                        minHeight,
                        itemCount * itemHeight + baseHeight
                    );
                }

                // Cập nhật chiều cao timeline container
                timelineContainer.style.minHeight = `${calculatedHeight}px`;

                // Thêm class cho timeline container dựa trên số items
                timelineContainer.classList.remove(
                    "single-item",
                    "multiple-items",
                    "no-items"
                );
                if (itemCount === 1) {
                    timelineContainer.classList.add("single-item");
                } else if (itemCount > 1) {
                    timelineContainer.classList.add("multiple-items");
                } else {
                    timelineContainer.classList.add("no-items");
                }

                // Thêm class phù hợp dựa trên số lượng items cho timeline line
                timelineLine.classList.remove(
                    "single-item",
                    "multiple-items",
                    "dynamic"
                );
                if (itemCount === 1) {
                    timelineLine.classList.add("single-item");
                } else if (itemCount > 1) {
                    timelineLine.classList.add("multiple-items");
                } else {
                    timelineLine.classList.add("dynamic");
                }

                // Animation cho timeline line
                timelineLine.classList.add("animate");
                setTimeout(() => {
                    timelineLine.classList.remove("animate");
                }, 800);
            }
        }
    }, [filteredPeriods.length]);

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const handleClearSearch = () => {
        setSearchTerm("");
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <>
            <div className="timeline-header">
                <h1 className="timeline-title">
                    Dòng thời gian lịch sử Việt Nam
                </h1>
                <p className="timeline-description">
                    Khám phá các thời kỳ lịch sử quan trọng của Việt Nam qua
                    dòng thời gian.
                </p>
            </div>
            <div className="search-wrapper">
                <Search
                    onSearch={handleSearch}
                    placeholder="Tìm kiếm thời kỳ..."
                />
                {showResultsInfo && (
                    <div
                        className={`search-results-info ${
                            showResultsInfo ? "show" : ""
                        }`}
                    >
                        <span>Tìm thấy</span>
                        <span className="count">{filteredPeriods.length}</span>
                        <span>kết quả</span>
                        <button
                            className="clear-btn"
                            onClick={handleClearSearch}
                            title="Xóa tìm kiếm"
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>
            <div className="timeline-content">
                {filteredPeriods.length === 0 ? (
                    <p>Không có thời kỳ nào để hiển thị.</p>
                ) : (
                    <div className="timeline-container" ref={timelineRef}>
                        <div className="timeline-line"></div>
                        {filteredPeriods.map((period, index) => (
                            <div
                                key={period.id}
                                className="timeline-item-container"
                            >
                                {index % 2 === 0 ? (
                                    <>
                                        <div className="timeline-item-left">
                                            <TimeLineCard
                                                period={period}
                                                isLeft={true}
                                                commentCount={
                                                    period.commentCount || 0
                                                }
                                            />
                                        </div>
                                        <div className="timeline-marker"></div>
                                        <div className="timeline-item-right"></div>
                                    </>
                                ) : (
                                    <>
                                        <div className="timeline-item-left"></div>
                                        <div className="timeline-marker"></div>
                                        <div className="timeline-item-right">
                                            <TimeLineCard
                                                period={period}
                                                isLeft={false}
                                                commentCount={
                                                    period.commentCount || 0
                                                }
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

export default TimeLine;
