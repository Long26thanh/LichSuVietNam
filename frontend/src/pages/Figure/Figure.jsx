import React, { useState, useEffect, useRef } from "react";
import Search from "@/components/Search/Search";
import FigureCard from "@/components/Card/FigureCard/FigureCard";
import figureService from "@/services/figureService";
import "./Figure.css";

const Figure = () => {
    const [figures, setFigures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredFigures, setFilteredFigures] = useState([]);
    const [showResultsInfo, setShowResultsInfo] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(12);
    const debounceRef = useRef(null);
    const abortRef = useRef(null);

    // Lấy dữ liệu từ API khi component được mount
    useEffect(() => {
        const fetchFigures = async () => {
            try {
                setLoading(true);
                if (abortRef.current) {
                    abortRef.current.abort();
                }
                const controller = new AbortController();
                abortRef.current = controller;

                const response = await figureService.getAllFigures({
                    page,
                    limit,
                    search: searchTerm,
                    signal: controller.signal,
                });
                if (!response.success) {
                    throw new Error("Failed to fetch figures");
                }
                const data = response.data;
                console.log("Fetched figures:", data);
                setFigures(data);
            } catch (error) {
                if (
                    error.name !== "CanceledError" &&
                    error.name !== "AbortError"
                ) {
                    setError(error.message);
                }
            } finally {
                setLoading(false);
            }
        };

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(fetchFigures, 400);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            if (abortRef.current) {
                abortRef.current.abort();
            }
        };
    }, [page, limit, searchTerm]);

    // Cập nhật danh sách hiển thị từ kết quả server
    useEffect(() => {
        setFilteredFigures(figures);
        setShowResultsInfo(searchTerm !== "");
    }, [figures, searchTerm]);

    const handleSearch = (term) => {
        setSearchTerm(term);
        setPage(1);
    };

    const handleClearSearch = () => {
        setSearchTerm("");
    };

    if (loading) {
        return (
            <div className="figure-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải nhân vật...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="figure-page">
                <div className="error-container">
                    <h2>Lỗi: {error}</h2>
                    <button onClick={() => window.location.reload()}>
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="figure-page">
            {/* Header Section */}
            <div className="figure-header">
                <h1 className="figure-title">Nhân vật lịch sử Việt Nam</h1>
                <p className="figure-description">
                    Khám phá các nhân vật lịch sử quan trọng của Việt Nam qua
                    các thời kỳ.
                </p>
            </div>

            {/* Search Section */}
            <div className="search-section">
                <Search
                    onSearch={handleSearch}
                    placeholder="Tìm kiếm nhân vật..."
                />
                {showResultsInfo && (
                    <div
                        className={`search-results-info ${
                            showResultsInfo ? "show" : ""
                        }`}
                    >
                        <span>Tìm thấy</span>
                        <span className="count">{filteredFigures.length}</span>
                        <span>nhân vật</span>
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

            {/* Figures Grid */}
            <div className="figures-content">
                {filteredFigures.length === 0 ? (
                    <div className="no-results">
                        <h3>Không tìm thấy nhân vật nào</h3>
                        <p>Hãy thử tìm kiếm với từ khóa khác.</p>
                    </div>
                ) : (
                    <div className="figures-grid">
                        {filteredFigures.map((figure) => (
                            <FigureCard key={figure.id} figure={figure} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                <div className="pagination">
                    <button
                        className="page-btn"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        ← Trang trước
                    </button>
                    <span className="page-info">Trang {page}</span>
                    <button
                        className="page-btn"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={filteredFigures.length < limit}
                    >
                        Trang sau →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Figure;
