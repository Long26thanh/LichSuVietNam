import styles from "./Search.module.css";
import { useState, useEffect, useRef } from "react";
import * as icons from "@/assets/icons";
import useToggle from "@/hooks/useToggle";
import articleService from "@/services/articleService";
import figureService from "@/services/figureService";
import periodService from "@/services/periodService";
import eventService from "@/services/eventService";
import locationService from "@/services/locationService";
import { useNavigate } from "react-router-dom";
import config from "@/config";

const CATEGORIES = [
    { id: "all", label: "Tất cả", icon: icons.search },
    { id: "articles", label: "Bài viết", icon: icons.news },
    { id: "periods", label: "Thời kỳ", icon: icons.timeline },
    { id: "figures", label: "Nhân vật", icon: icons.user },
    { id: "events", label: "Sự kiện", icon: icons.events },
    { id: "locations", label: "Địa danh", icon: icons.locations },
];

function Search({
    placeholder = "Tìm kiếm lịch sử, nhân vật, sự kiện...",
    toggleAble = false,
    onSearch = () => {},
    onClear = () => {},
    className = "",
    ...props
}) {
    const [query, setQuery] = useState("");
    const [isOpen, toggleOpen] = useToggle(false);
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchResults, setSearchResults] = useState({
        articles: [],
        periods: [],
        figures: [],
        events: [],
        locations: [],
    });
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    // Close search when clicking outside
    useEffect(() => {
        if (!toggleAble || !isOpen) return;
        
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                toggleOpen();
                setQuery("");
                setHasSearched(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, toggleOpen, toggleAble]);

    // Close search when pressing Escape
    useEffect(() => {
        if (!toggleAble) return;
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isOpen) {
                toggleOpen();
                setQuery("");
                setHasSearched(false);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, toggleOpen, toggleAble]);

    const handleInputChange = (e) => {
        setQuery(e.target.value);
        if (!e.target.value.trim()) {
            setHasSearched(false);
            setSearchResults({
                articles: [],
                periods: [],
                figures: [],
                events: [],
                locations: [],
            });
        }
    };

    const performSearch = async (searchQuery) => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        setHasSearched(true);

        try {
            const searchPromises = [];

            // Tìm kiếm theo category
            if (activeCategory === "all" || activeCategory === "articles") {
                searchPromises.push(
                    articleService.getPublishedArticles({ 
                        search: searchQuery, 
                        limit: 5 
                    })
                    .then(res => ({ type: "articles", data: res.data || [] }))
                    .catch(() => ({ type: "articles", data: [] }))
                );
            }

            if (activeCategory === "all" || activeCategory === "periods") {
                searchPromises.push(
                    periodService.getAllPeriods()
                    .then(res => {
                        const filtered = (res.data || []).filter(period => 
                            period.name?.toLowerCase().includes(searchQuery.toLowerCase())
                        ).slice(0, 5);
                        return { type: "periods", data: filtered };
                    })
                    .catch(() => ({ type: "periods", data: [] }))
                );
            }

            if (activeCategory === "all" || activeCategory === "figures") {
                searchPromises.push(
                    figureService.getAllFigures({ 
                        search: searchQuery, 
                        limit: 5 
                    })
                    .then(res => ({ type: "figures", data: res.data || [] }))
                    .catch(() => ({ type: "figures", data: [] }))
                );
            }

            if (activeCategory === "all" || activeCategory === "events") {
                searchPromises.push(
                    eventService.getAllEvents({ 
                        search: searchQuery, 
                        limit: 5 
                    })
                    .then(res => ({ type: "events", data: res.data || [] }))
                    .catch(() => ({ type: "events", data: [] }))
                );
            }

            if (activeCategory === "all" || activeCategory === "locations") {
                searchPromises.push(
                    locationService.getAllLocations({ 
                        search: searchQuery, 
                        limit: 5 
                    })
                    .then(res => ({ type: "locations", data: res.data || [] }))
                    .catch(() => ({ type: "locations", data: [] }))
                );
            }

            const results = await Promise.all(searchPromises);
            
            const newResults = {
                articles: [],
                periods: [],
                figures: [],
                events: [],
                locations: [],
            };

            results.forEach(result => {
                newResults[result.type] = result.data;
            });

            setSearchResults(newResults);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (query.trim()) {
            performSearch(query.trim());
            if (onSearch) {
                onSearch(query.trim());
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSearch();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch();
    };

    const handleCategoryChange = (categoryId) => {
        setActiveCategory(categoryId);
        if (query.trim() && hasSearched) {
            performSearch(query.trim());
        }
    };

    const handleResultClick = (type, item) => {
        let route = "";
        
        switch(type) {
            case "articles":
                route = `/news/${item.id}`;
                break;
            case "periods":
                route = `/timeline/${item.id}`;
                break;
            case "figures":
                route = `/characters/${item.id}`;
                break;
            case "events":
                route = `/events/${item.id}`;
                break;
            case "locations":
                route = `/locations/${item.id}`;
                break;
            default:
                return;
        }

        navigate(route);
        toggleOpen();
        setQuery("");
        setHasSearched(false);
    };

    const getResultCount = () => {
        if (activeCategory === "all") {
            return Object.values(searchResults).reduce((sum, arr) => sum + arr.length, 0);
        }
        return searchResults[activeCategory]?.length || 0;
    };

    const renderResultItem = (type, item) => {
        const getItemIcon = () => {
            switch(type) {
                case "articles": return icons.news;
                case "periods": return icons.timeline;
                case "figures": return icons.user;
                case "events": return icons.events;
                case "locations": return icons.locations;
                default: return icons.search;
            }
        };

        const getItemTitle = () => {
            return item.name || item.title || "Không có tiêu đề";
        };

        const getItemSubtitle = () => {
            switch(type) {
                case "articles":
                    return `Bài viết • ${item.authorName || "Không rõ tác giả"}`;
                case "periods":
                    return `Thời kỳ • ${item.startYear || ""} - ${item.endYear || ""}`;
                case "figures":
                    return `Nhân vật • ${item.birthYear || "?"}`;
                case "events":
                    return `Sự kiện • ${item.date || "Không rõ ngày"}`;
                case "locations":
                    return `Địa danh • ${item.locationTypeName || ""}`;
                default:
                    return "";
            }
        };

        return (
            <div
                key={`${type}-${item.id}`}
                className={styles["result-item"]}
                onClick={() => handleResultClick(type, item)}
            >
                <div className={styles["result-icon"]}>
                    <img src={getItemIcon()} alt={type} />
                </div>
                <div className={styles["result-content"]}>
                    <div className={styles["result-title"]}>{getItemTitle()}</div>
                    <div className={styles["result-subtitle"]}>{getItemSubtitle()}</div>
                </div>
            </div>
        );
    };

    const renderResults = () => {
        if (loading) {
            return (
                <div className={styles["search-loading"]}>
                    <div className={styles["loading-spinner"]}></div>
                    <p>Đang tìm kiếm...</p>
                </div>
            );
        }

        if (!hasSearched) {
            return (
                <div className={styles["search-empty"]}>
                    <img src={icons.search} alt="Search" />
                    <p>Nhập từ khóa và nhấn Enter để tìm kiếm</p>
                </div>
            );
        }

        const resultCount = getResultCount();

        if (resultCount === 0) {
            return (
                <div className={styles["search-empty"]}>
                    <img src={icons.search} alt="No results" />
                    <p>Không tìm thấy kết quả cho "{query}"</p>
                    <small>Thử tìm kiếm với từ khóa khác</small>
                </div>
            );
        }

        return (
            <div className={styles["search-results"]}>
                <div className={styles["results-header"]}>
                    <span className={styles["results-count"]}>
                        {resultCount} kết quả
                    </span>
                </div>

                {(activeCategory === "all" || activeCategory === "articles") && 
                 searchResults.articles.length > 0 && (
                    <div className={styles["results-section"]}>
                        <div className={styles["section-title"]}>
                            <img src={icons.news} alt="Articles" />
                            <span>Bài viết</span>
                        </div>
                        <div className={styles["section-items"]}>
                            {searchResults.articles.map(item => renderResultItem("articles", item))}
                        </div>
                    </div>
                )}

                {(activeCategory === "all" || activeCategory === "periods") && 
                 searchResults.periods.length > 0 && (
                    <div className={styles["results-section"]}>
                        <div className={styles["section-title"]}>
                            <img src={icons.timeline} alt="Periods" />
                            <span>Thời kỳ</span>
                        </div>
                        <div className={styles["section-items"]}>
                            {searchResults.periods.map(item => renderResultItem("periods", item))}
                        </div>
                    </div>
                )}

                {(activeCategory === "all" || activeCategory === "figures") && 
                 searchResults.figures.length > 0 && (
                    <div className={styles["results-section"]}>
                        <div className={styles["section-title"]}>
                            <img src={icons.user} alt="Figures" />
                            <span>Nhân vật</span>
                        </div>
                        <div className={styles["section-items"]}>
                            {searchResults.figures.map(item => renderResultItem("figures", item))}
                        </div>
                    </div>
                )}

                {(activeCategory === "all" || activeCategory === "events") && 
                 searchResults.events.length > 0 && (
                    <div className={styles["results-section"]}>
                        <div className={styles["section-title"]}>
                            <img src={icons.events} alt="Events" />
                            <span>Sự kiện</span>
                        </div>
                        <div className={styles["section-items"]}>
                            {searchResults.events.map(item => renderResultItem("events", item))}
                        </div>
                    </div>
                )}

                {(activeCategory === "all" || activeCategory === "locations") && 
                 searchResults.locations.length > 0 && (
                    <div className={styles["results-section"]}>
                        <div className={styles["section-title"]}>
                            <img src={icons.locations} alt="Locations" />
                            <span>Địa danh</span>
                        </div>
                        <div className={styles["section-items"]}>
                            {searchResults.locations.map(item => renderResultItem("locations", item))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (!toggleAble) {
        return (
            <div className={`${styles.search} ${className}`} {...props}>
                <form onSubmit={handleSubmit} className={styles["search-form"]}>
                    <div className={styles["search-input-wrapper"]}>
                        <input
                            type="text"
                            className={styles["search-input"]}
                            value={query}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            placeholder={placeholder}
                        />
                        <button
                            type="submit"
                            className={styles["search-submit"]}
                            aria-label="Tìm kiếm"
                        >
                            <img src={icons.search} alt="Tìm kiếm" />
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <>
            <div className={`${styles.search} ${className}`} {...props}>
                <button
                    className={styles["search-toggle"]}
                    onClick={toggleOpen}
                    aria-label="Mở thanh tìm kiếm"
                >
                    <img src={icons.search} alt="Tìm kiếm" />
                </button>
            </div>
            {isOpen && (
                <div className={styles["search-overlay"]} ref={searchRef}>
                    <div className={styles["search-modal"]}>
                        {/* Header */}
                        <div className={styles["search-header"]}>
                            <form onSubmit={handleSubmit} className={styles["search-form"]}>
                                <div className={styles["search-input-wrapper"]}>
                                    <img 
                                        src={icons.search} 
                                        alt="Search" 
                                        className={styles["input-icon"]}
                                    />
                                    <input
                                        type="text"
                                        className={styles["search-input"]}
                                        value={query}
                                        onChange={handleInputChange}
                                        onKeyPress={handleKeyPress}
                                        placeholder={placeholder}
                                        autoFocus
                                    />
                                    {query && (
                                        <button
                                            type="button"
                                            className={styles["clear-button"]}
                                            onClick={() => {
                                                setQuery("");
                                                setHasSearched(false);
                                                setSearchResults({
                                                    articles: [],
                                                    periods: [],
                                                    figures: [],
                                                    events: [],
                                                    locations: [],
                                                });
                                            }}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </form>
                            <button
                                className={styles["close-button"]}
                                onClick={() => {
                                    toggleOpen();
                                    setQuery("");
                                    setHasSearched(false);
                                }}
                            >
                                <span>ESC</span>
                            </button>
                        </div>

                        {/* Category Filter */}
                        <div className={styles["category-filter"]}>
                            {CATEGORIES.map(category => (
                                <button
                                    key={category.id}
                                    className={`${styles["category-button"]} ${
                                        activeCategory === category.id ? styles["active"] : ""
                                    }`}
                                    onClick={() => handleCategoryChange(category.id)}
                                >
                                    <img src={category.icon} alt={category.label} />
                                    <span>{category.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Results */}
                        <div className={styles["search-body"]}>
                            {renderResults()}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Search;
