import { useNavigate, Link } from "react-router-dom";
import routes from "@/config/routes";
import { formatShortDateRange } from "@/utils";
import styles from "./EventCard.module.css";

function EventCard({ event }) {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(routes.eventDetail.replace(":id", event.id), {
            state: { event },
        });
    };

    return (
        <div className={styles["event-card"]} onClick={handleCardClick}>
            <div className={styles["event-card-header"]}>
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
            <div className={styles["event-card-content"]}>
                {event.summary && (
                    <p className={styles["event-description"]}>
                        {event.summary}
                    </p>
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
                <button className={styles["view-details-btn"]}>
                    Xem chi tiết
                </button>
            </div>
        </div>
    );
}

export default EventCard;
