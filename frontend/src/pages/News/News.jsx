import React, { useEffect, useRef, useState } from "react";
import Search from "@/components/Search/Search";
import ArticleCard from "@/components/Card/ArticleCard/ArticleCard";
import { articleService } from "@/services";
import { recordWebsiteView } from "@/services/viewService";
import "./News.css";

function News() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredArticles, setFilteredArticles] = useState([]);
    const [showResultsInfo, setShowResultsInfo] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(12);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const debounceRef = useRef(null);
    const abortRef = useRef(null);

    // Track website view
    useEffect(() => {
        recordWebsiteView();
    }, []);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                setLoading(true);
                if (abortRef.current) {
                    abortRef.current.abort();
                }
                const controller = new AbortController();
                abortRef.current = controller;

                const response = await articleService.getPublishedArticles({
                    page,
                    limit,
                    search: searchTerm,
                    signal: controller.signal,
                });
                if (!response.success) {
                    throw new Error("Failed to fetch articles");
                }
                const data = response.data || [];
                const pagination = response.pagination || {
                    total: 0,
                    totalPages: 1,
                };

                setArticles(data);
                setTotal(pagination.total);
                setTotalPages(pagination.totalPages);
            } catch (err) {
                if (err.name === "CanceledError" || err.name === "AbortError") {
                    return;
                }
                console.error("Error fetching articles:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            fetchArticles();
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            if (abortRef.current) {
                abortRef.current.abort();
            }
        };
    }, [page, limit, searchTerm]);

    useEffect(() => {
        setFilteredArticles(articles);
        setShowResultsInfo(searchTerm.length > 0);
    }, [articles, searchTerm]);

    const handleSearch = (term) => {
        setSearchTerm(term);
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    return (
        <div className="news-page">
            <div className="news-hero">
                <div className="hero-content">
                    <h1>Tin Tức Lịch Sử</h1>
                    <p>
                        Khám phá những câu chuyện, sự kiện và bài viết về lịch
                        sử Việt Nam
                    </p>
                </div>
            </div>

            <div className="news-container">
                <div className="news-search">
                    <Search
                        onSearch={handleSearch}
                        placeholder="Tìm kiếm bài viết..."
                    />
                </div>

                {showResultsInfo && (
                    <div className="search-results-info">
                        Tìm thấy <strong>{total}</strong> bài viết cho "
                        <em>{searchTerm}</em>"
                    </div>
                )}

                {loading ? (
                    <div className="news-loading">
                        <div className="spinner"></div>
                        <p>Đang tải bài viết...</p>
                    </div>
                ) : error ? (
                    <div className="news-error">
                        <p>Đã xảy ra lỗi: {error}</p>
                    </div>
                ) : filteredArticles.length === 0 ? (
                    <div className="news-empty">
                        <p>Không tìm thấy bài viết nào</p>
                    </div>
                ) : (
                    <>
                        <div className="news-grid">
                            {filteredArticles.map((article) => (
                                <ArticleCard
                                    key={article.id}
                                    article={article}
                                    viewCount={article.viewCount || 0}
                                    commentCount={article.commentCount || 0}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="news-pagination">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    className="pagination-btn"
                                >
                                    ← Trước
                                </button>
                                <div className="pagination-info">
                                    Trang {page} / {totalPages}
                                </div>
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages}
                                    className="pagination-btn"
                                >
                                    Sau →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default News;
