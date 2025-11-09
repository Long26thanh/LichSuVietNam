import React, { useState, useEffect, useRef } from "react";
import Search from "@/components/Search/Search";
import LocationCard from "@/components/Card/LocationCard/LocationCard";
import locationService from "@/services/locationService";
import locationTypeService from "@/services/locationTypeService";
import { recordWebsiteView } from "@/services/viewService";
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
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const debounceRef = useRef(null);
    const abortRef = useRef(null);
    const [locationTypes, setLocationTypes] = useState([]);
    const [locationTypesMap, setLocationTypesMap] = useState({}); // Map ID -> Tên

    // Track website view
    useEffect(() => {
        recordWebsiteView();
    }, []);

    // Load danh sách loại địa danh
    useEffect(() => {
        const loadLocationTypes = async () => {
            try {
                const response = await locationTypeService.getAllTypes();
                if (response?.success && response.data) {
                    const types = response.data;
                    setLocationTypes([{ id: "all", name: "Tất cả" }, ...types]);
                    
                    // Tạo map ID -> Tên để dễ tra cứu
                    const typeMap = {};
                    types.forEach(type => {
                        typeMap[type.id] = type.name;
                    });
                    setLocationTypesMap(typeMap);
                }
            } catch (error) {
                console.error("Lỗi khi tải danh sách loại địa danh:", error);
            }
        };
        loadLocationTypes();
    }, []);

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
                    type: selectedType === "all" ? "" : selectedType, // Gửi empty string nếu "all"
                    signal: controller.signal,
                });
                if (!response.success) {
                    throw new Error("Failed to fetch locations");
                }
                const data = response.data;
                const pagination = response.pagination || {
                    total: 0,
                    totalPages: 1,
                };

                setLocations(data);
                setTotal(pagination.total);
                setTotalPages(pagination.totalPages);
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
        // Chỉ hiện số lượng khi có từ khóa tìm kiếm, không hiện khi chỉ lọc theo loại
        setShowResultsInfo(searchTerm !== "");
    }, [locations, searchTerm, selectedType]);

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
                                {total}
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
                                key={type.id}
                                className={`filter-btn ${
                                    selectedType === type.id ? "active" : ""
                                }`}
                                onClick={() => handleTypeFilter(type.id)}
                            >
                                {type.name}
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
                                viewCount={location.viewCount || 0}
                                commentCount={location.commentCount || 0}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            className="page-btn"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            ← Trang trước
                        </button>
                        <div className="page-info">
                            <span>Trang</span>
                            <select
                                value={page}
                                onChange={(e) =>
                                    setPage(parseInt(e.target.value))
                                }
                                className="page-select"
                            >
                                {Array.from(
                                    { length: totalPages },
                                    (_, i) => i + 1
                                ).map((p) => (
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>
                            <span>/ {totalPages}</span>
                            <span className="total-items">• Tổng {total}</span>
                        </div>
                        <button
                            className="page-btn"
                            onClick={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={page >= totalPages}
                        >
                            Trang sau →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Location;
