import { useNavigate } from "react-router-dom";
import routes from "@/config/routes";
import styles from "./FigureCard.module.css";

const FigureCard = ({ figure }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(routes.figureDetail.replace(":id", figure.id), {
            state: { figure },
        });
    };

    const formatYear = (year) => {
        if (!year) return "N/A";
        return year < 0 ? `${Math.abs(year)} TCN` : `${year} SCN`;
    };

    const formatLifespan = () => {
        if (figure.birth_year && figure.death_year) {
            return `${formatYear(figure.birth_year)} - ${formatYear(
                figure.death_year
            )}`;
        } else if (figure.birth_year) {
            return `Sinh: ${formatYear(figure.birth_year)}`;
        } else if (figure.death_year) {
            return `Mất: ${formatYear(figure.death_year)}`;
        }
        return "N/A";
    };

    return (
        <div className={styles["figure-card"]} onClick={handleCardClick}>
            <div className={styles["figure-card-header"]}>
                <h3 className={styles["figure-name"]}>{figure.name}</h3>
                {figure.title && (
                    <span className={styles["figure-title"]}>
                        {figure.title}
                    </span>
                )}
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
                        <ul>
                            {figure.achievements
                                .split(/[.\n]+/)
                                .filter(Boolean)
                                .map((ach, idx) => (
                                    <li key={idx}>{ach.trim()}</li>
                                ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className={styles["figure-card-footer"]}>
                <button className={styles["view-details-btn"]}>
                    Xem chi tiết
                </button>
            </div>
        </div>
    );
};

export default FigureCard;
