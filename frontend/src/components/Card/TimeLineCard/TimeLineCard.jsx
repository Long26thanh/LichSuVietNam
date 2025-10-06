import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./TimeLineCard.module.css";

function TimeLineCard({ period, isLeft = false }) {
    const navigate = useNavigate();
    const cardRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                threshold: 0.1,
                rootMargin: "0px 0px -50px 0px",
            }
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // // Chuyển tên thành slug không dấu, thay khoảng trắng bằng _
    // const toSlug = (str) => {
    //     return str
    //         .normalize("NFD")
    //         .replace(/\p{Diacritic}/gu, "")
    //         .replace(/đ/g, "d")
    //         .replace(/Đ/g, "D")
    //         .replace(/[^a-zA-Z0-9-_ ]/g, "")
    //         .replace(/\s+/g, "_");
    // };

    const handleClick = () => {
        navigate(`/timeline/${period.id}`);
    };

    const formatYear = (year) => {
        return year < 0 ? `${Math.abs(year)} TCN` : `${year} SCN`;
    };

    const formatPeriod = () => {
        const startYear = period.start_year;
        const endYear = period.end_year;

        if (startYear && endYear) {
            return `${formatYear(parseInt(startYear, 10))} - ${formatYear(
                parseInt(endYear, 10)
            )}`;
        } else if (startYear) {
            return `${formatYear(parseInt(startYear, 10))}`;
        } else if (endYear) {
            return `${formatYear(parseInt(endYear, 10))}`;
        }
        return "";
    };

    return (
        <div
            ref={cardRef}
            className={`${
                styles[`timeline-item ${isLeft ? "left" : "right"}`]
            } ${isVisible ? styles["animate-in"] : ""}`}
        >
            <div className={styles["timeline-card"]} onClick={handleClick}>
                <div className={styles["timeline-card-header"]}></div>
                <div className={styles["timeline-card-title"]}>
                    <div className={styles["timeline-card-years"]}>
                        {formatPeriod(period)}
                    </div>
                </div>
                <div className={styles["timeline-card-content"]}>
                    <div
                        className={styles["timeline-card-summary"]}
                        dangerouslySetInnerHTML={{
                            __html: period.summary || "",
                        }}
                    ></div>
                </div>
                <div className={styles["timeline-card-footer"]}>
                    <button className={styles["timeline-card-button"]}>
                        Xem chi tiết
                        <svg
                            className={styles["timeline-card-arrow"]}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TimeLineCard;
