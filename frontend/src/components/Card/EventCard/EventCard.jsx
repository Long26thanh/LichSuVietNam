import { useNavigate, Link } from "react-router-dom";
import routes from "@/config/routes";
import { formatShortDateRange } from "@/utils";
import { formatViewCount } from "@/utils/viewUtils";
import styles from "./EventCard.module.css";

function EventCard({ event, viewCount = 0, commentCount = 0 }) {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(routes.eventDetail.replace(":id", event.id), {
            state: { event },
        });
    };

    return (
        <div className={styles["event-card"]} onClick={handleCardClick}>
            <div className={styles["event-card-header"]}>
                <div className={styles["event-header-content"]}>
                    <h3 className={styles["event-title"]}>{event.name}</h3>
                    <span className={styles["event-date"]}>
                        {formatShortDateRange(
                            {
                                day: event.startDate,
                                month: event.startMonth,
                                year: event.startYear,
                            },
                            {
                                day: event.endDate,
                                month: event.endMonth,
                                year: event.endYear,
                            }
                        )}
                    </span>
                </div>
            </div>
            <div className={styles["event-card-content"]}>
                {event.summary && (
                    <div 
                        className={styles["event-description"]}
                        dangerouslySetInnerHTML={{ __html: event.summary }}
                    />
                )}
                {event.location && (
                    <div className={styles["event-location"]}>
                        <span className={styles["location-label"]}>
                            Địa điểm:
                        </span>
                        <span className={styles["location-value"]}>
                            {event.location}
                        </span>
                    </div>
                )}
                {event.related_figures && event.related_figures.length > 0 && (
                    <div className={styles["related-figures"]}>
                        <span className={styles["figures-label"]}>
                            Nhân vật liên quan:
                        </span>
                        <ul className={styles["figures-list"]}>
                            {event.related_figures.map((figure, index) => {
                                const figureId =
                                    typeof figure === "object"
                                        ? figure.id
                                        : null;
                                const figureName =
                                    typeof figure === "object"
                                        ? figure.name
                                        : figure;

                                return (
                                    <li
                                        key={figureId || index}
                                        className={styles["figure-item"]}
                                    >
                                        {figureId ? (
                                            <Link
                                                to={routes.figureDetail.replace(
                                                    ":id",
                                                    figureId
                                                )}
                                                className={
                                                    styles["figure-link"]
                                                }
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                {figureName}
                                            </Link>
                                        ) : (
                                            <span>{figureName}</span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
            <div className={styles["event-card-footer"]}>
                <div className={styles["event-stats"]}>
                    {viewCount >= 0 && (
                        <div className={styles["event-views"]}>
                            <svg
                                className={styles["view-icon"]}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                            <span>{formatViewCount(viewCount)}</span>
                        </div>
                    )}
                    {commentCount >= 0 && (
                        <div className={styles["event-comments"]}>
                            <svg
                                className={styles["comment-icon"]}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <span>{commentCount}</span>
                        </div>
                    )}
                </div>
                <button className={styles["view-details-btn"]}>
                    Xem chi tiết
                </button>
            </div>
        </div>
    );
}

export default EventCard;
