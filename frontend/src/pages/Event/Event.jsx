import React, { useEffect, useRef, useState } from "react";
import Search from "@/components/Search/Search";
import EventCard from "@/components/Card/EventCard/EventCard";
import eventService from "@/services/eventService";
import "./Event.css";

function Event() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [showResultsInfo, setShowResultsInfo] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(12);
    const debounceRef = useRef(null);
    const abortRef = useRef(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                if (abortRef.current) {
                    abortRef.current.abort();
                }
                const controller = new AbortController();
                abortRef.current = controller;

                const response = await eventService.getAllEvents({
                    page,
                    limit,
                    search: searchTerm,
                    signal: controller.signal,
                });
                if (!response.success) {
                    throw new Error("Failed to fetch events");
                }
                setEvents(response.data || []);
            } catch (err) {
                if (
                    err.name !== "CanceledError" &&
                    err.name !== "AbortError"
                ) {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(fetchEvents, 400);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            if (abortRef.current) abortRef.current.abort();
        };
    }, [page, limit, searchTerm]);

    useEffect(() => {
        setFilteredEvents(events);
        setShowResultsInfo(searchTerm !== "");
    }, [events, searchTerm]);

    const handleSearch = (term) => {
        setSearchTerm(term);
        setPage(1);
    };

    const handleClearSearch = () => setSearchTerm("");

    if (loading) {
        return (
            <div className="event-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải sự kiện...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="event-page">
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
        <div className="event-page">
            <div className="event-header">
                <h1 className="event-title">Sự kiện lịch sử Việt Nam</h1>
                <p className="event-description">
                    Tìm hiểu các sự kiện lịch sử tiêu biểu qua các thời kỳ.
                </p>
            </div>

            <div className="search-section">
                <Search onSearch={handleSearch} placeholder="Tìm kiếm sự kiện..." />
                {showResultsInfo && (
                    <div className={`search-results-info ${showResultsInfo ? "show" : ""}`}>
                        <span>Tìm thấy</span>
                        <span className="count">{filteredEvents.length}</span>
                        <span>sự kiện</span>
                        <button className="clear-btn" onClick={handleClearSearch} title="Xóa tìm kiếm">✕</button>
                    </div>
                )}
            </div>

            <div className="events-content">
                {filteredEvents.length === 0 ? (
                    <div className="no-results">
                        <h3>Không tìm thấy sự kiện nào</h3>
                        <p>Hãy thử tìm kiếm với từ khóa khác.</p>
                    </div>
                ) : (
                    <div className="events-grid">
                        {filteredEvents.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                )}

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
                        disabled={filteredEvents.length < limit}
                    >
                        Trang sau →
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Event;
