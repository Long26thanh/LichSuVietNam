import styles from "./Search.module.css";
import { useState, useEffect } from "react";
import * as icons from "@/assets/icons";
import useToggle from "@/hooks/useToggle";

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

    // Close search when pressing Escape
    useEffect(() => {
        if (!toggleAble) return;
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isOpen) {
                toggleOpen();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, toggleOpen, toggleAble]);

    const handleInputChange = (e) => {
        setQuery(e.target.value);
    };

    const handleSearch = () => {
        if (query.trim() && onSearch) {
            onSearch(query.trim());
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch();
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
                <div className={styles["search-container"]}>
                    <div className={styles["search-inner"]}>
                        <form
                            onSubmit={handleSubmit}
                            className={styles["search-form"]}
                        >
                            <div className={styles["search-input-wrapper"]}>
                                <input
                                    type="text"
                                    className={styles["search-input"]}
                                    value={query}
                                    onChange={handleInputChange}
                                    onKeyPress={handleKeyPress}
                                    placeholder={placeholder}
                                    autoFocus
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
                        <button
                            className={styles["search-close"]}
                            onClick={toggleOpen}
                            aria-label="Đóng tìm kiếm"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Search;
