import React, { useState, useEffect, useRef } from "react";
import Search from "@/components/Search/Search";
import LocationCard from "@/components/Card/LocationCard/LocationCard";
import locationService from "@/services/locationService";
import "./Location.css";

const Location = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredLocations, setFilteredLocations] = useState([]);
    const [showResultsInfo, setShowResultsInfo] = useState(false);
    const [selectedType, setSelectedType] = useState("all");
    const [page, setPage] = useState(1);
    const [limit] = useState(12);
    const debounceRef = useRef(null);
    const abortRef = useRef(null);
    const [locationTypes, setLocationTypes] = useState(["all"]);

    // Lấy dữ liệu từ API khi component được mount
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                // Chỉ hiển thị loading lớn ở lần tải đầu tiên
                if (loading && locations.length === 0) {
                    setLoading(true);
                } else {
                    setIsFetching(true);
                }
                if (abortRef.current) {
                    abortRef.current.abort();
                }
                const controller = new AbortController();
                abortRef.current = controller;

                const response = await locationService.getAllLocations({
                    page,
                    limit,
                    search: searchTerm,
                    type: selectedType,
                    signal: controller.signal,
                });
                if (!response.success) {
                    throw new Error("Failed to fetch locations");
                }
                const data = response.data;
                console.log("Fetched locations:", data);
                setLocations(data);
            } catch (error) {
                if (
                    error.name !== "CanceledError" &&
                    error.name !== "AbortError"
                ) {
                    setError(error.message);
                }
            } finally {
                setLoading(false);
                setIsFetching(false);
            }
        };

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(fetchLocations, 400);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            if (abortRef.current) {
                abortRef.current.abort();
            }
        };
    }, [page, limit, searchTerm, selectedType]);

    // Cập nhật danh sách hiển thị từ kết quả server
    useEffect(() => {
        setFilteredLocations(locations);
        setShowResultsInfo(searchTerm !== "" || selectedType !== "all");
    }, [locations, searchTerm, selectedType]);

    // Cập nhật danh sách loại địa danh khi không áp dụng filter theo loại
    useEffect(() => {
        if (selectedType === "all" && Array.isArray(locations)) {
            const types = [
                "all",
                ...Array.from(
                    new Set(
                        locations
                            .map((l) => l.location_type)
                            .filter((t) => t && typeof t === "string")
                    )
                ),
            ];
            setLocationTypes(types);
        }
    }, [locations, selectedType]);

    const handleSearch = (term) => {
        setSearchTerm(term);
        setPage(1);
    };

    const handleClearSearch = () => {
        setSearchTerm("");
    };

    const handleTypeFilter = (type) => {
        setSelectedType(type);
        setPage(1);
    };

    // locationTypes được lưu trạng thái để không mất khi đang lọc theo loại

    if (loading) {
        return (
            <div className="location-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải địa danh...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="location-page">
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
        <div className="location-page">
            {/* Header Section */}
            <div className="location-header">
                <h1 className="location-title">Địa danh lịch sử Việt Nam</h1>
                <p className="location-description">
                    Khám phá các địa danh lịch sử quan trọng của Việt Nam qua
                    các thời kỳ.
                </p>
            </div>

            {/* Search and Filter Section */}
            <div className="search-filter-wrapper">
                <div className="search-section">
                    <Search
                        onSearch={handleSearch}
                        placeholder="Tìm kiếm địa danh..."
                    />
                    {showResultsInfo && (
                        <div
                            className={`search-results-info ${
                                showResultsInfo ? "show" : ""
                            }`}
                        >
                            <span>Tìm thấy</span>
                            <span className="count">
                                {filteredLocations.length}
                            </span>
                            <span>địa danh</span>
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

                {/* Type Filter */}
                <div className="filter-section">
                    <div className="filter-buttons">
                        {locationTypes.map((type) => (
                            <button
                                key={type}
                                className={`filter-btn ${
                                    selectedType === type ? "active" : ""
                                }`}
                                onClick={() => handleTypeFilter(type)}
                            >
                                {type === "all" ? "Tất cả" : type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Locations Grid */}
            <div className="locations-content">
                {isFetching && (
                    <div className="inline-fetching">
                        <div className="small-spinner"></div>
                        <span>Đang cập nhật kết quả...</span>
                    </div>
                )}
                {filteredLocations.length === 0 ? (
                    <div className="no-results">
                        <h3>Không tìm thấy địa danh nào</h3>
                        <p>
                            Hãy thử tìm kiếm với từ khóa khác hoặc chọn loại địa
                            danh khác.
                        </p>
                    </div>
                ) : (
                    <div className="locations-grid">
                        {filteredLocations.map((location) => (
                            <LocationCard
                                key={location.id}
                                location={location}
                            />
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
                        disabled={filteredLocations.length < limit}
                    >
                        Trang sau →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Location;
