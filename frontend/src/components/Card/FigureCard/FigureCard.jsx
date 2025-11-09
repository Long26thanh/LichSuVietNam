import { useNavigate } from "react-router-dom";
import routes from "@/config/routes";
import { formatShortDateRange } from "@/utils/dateUtils";
import { formatViewCount } from "@/utils/viewUtils";
import styles from "./FigureCard.module.css";

const FigureCard = ({ figure, viewCount = 0, commentCount = 0 }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(routes.figureDetail.replace(":id", figure.id), {
            state: { figure },
        });
    };

    const formatLifespan = () => {
        return formatShortDateRange(
            {
                day: figure.birth_date,
                month: figure.birth_month,
                year: figure.birth_year,
            },
            {
                day: figure.death_date,
                month: figure.death_month,
                year: figure.death_year,
            }
        );
    };

    return (
        <div className={styles["figure-card"]} onClick={handleCardClick}>
            <div className={styles["figure-card-header"]}>
                <div className={styles["figure-header-content"]}>
                    <h3 className={styles["figure-name"]}>{figure.name}</h3>
                    {figure.title && (
                        <span className={styles["figure-title"]}>
                            {figure.title}
                        </span>
                    )}
                </div>
            </div>

            <div className={styles["figure-card-content"]}>
                <div className={styles["figure-info"]}>
                    <span className={styles["info-label"]}>Thời gian:</span>
                    <span className={styles["info-value"]}>
                        {formatLifespan()}
                    </span>
                </div>

                {figure.birth_place && (
                    <div className={styles["figure-info"]}>
                        <span className={styles["info-label"]}>Nơi sinh:</span>
                        <span className={styles["info-value"]}>
                            {figure.birth_place}
                        </span>
                    </div>
                )}

                {figure.death_place && (
                    <div className={styles["figure-info"]}>
                        <span className={styles["info-label"]}>Nơi mất:</span>
                        <span className={styles["info-value"]}>
                            {figure.death_place}
                        </span>
                    </div>
                )}

                {figure.achievements && (
                    <div className={styles["figure-achievements"]}>
                        <span className={styles["info-label"]}>Thành tựu:</span>
                        <div 
                            className={styles["achievements-content"]}
                            dangerouslySetInnerHTML={{ __html: figure.achievements }}
                        />
                    </div>
                )}
            </div>

            <div className={styles["figure-card-footer"]}>
                <div className={styles["figure-stats"]}>
                    {viewCount >= 0 && (
                        <div className={styles["figure-views"]}>
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
                        <div className={styles["figure-comments"]}>
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
};

export default FigureCard;
