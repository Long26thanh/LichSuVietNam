import { useNavigate } from "react-router-dom";
import routes from "@/config/routes";
import { formatViewCount } from "@/utils/viewUtils";
import styles from "./LocationCard.module.css";

const LocationCard = ({ location, viewCount = 0, commentCount = 0 }) => {
    const navigate = useNavigate();
    const handleCardClick = () => {
        navigate(routes.locationDetail.replace(":id", location.id), {
            state: { location },
        });
    };

    return (
        <div className={styles["location-card"]} onClick={handleCardClick}>
            <div className={styles["location-card-header"]}>
                <h3 className={styles["location-name"]}>{location.name}</h3>
                {location.location_type && (
                    <span className={styles["location-type"]}>
                        {location.location_type}
                    </span>
                )}
            </div>

            <div className={styles["location-card-content"]}>
                {location.ancient_name && (
                    <div className={styles["location-info"]}>
                        <span className={styles["info-label"]}>Tên cổ:</span>
                        <span className={styles["info-value"]}>
                            {location.ancient_name}
                        </span>
                    </div>
                )}

                {location.modern_name && (
                    <div className={styles["location-info"]}>
                        <span className={styles["info-label"]}>
                            Tên hiện đại:
                        </span>
                        <span className={styles["info-value"]}>
                            {location.modern_name}
                        </span>
                    </div>
                )}

                {location.description && (
                    <div 
                        className={styles["location-description"]}
                        dangerouslySetInnerHTML={{ __html: location.description }}
                    />
                )}

                {location.latitude && location.longitude && (
                    <div className={styles["location-coordinates"]}>
                        <span className={styles["coordinates"]}>
                            📍 {location.latitude}, {location.longitude}
                        </span>
                    </div>
                )}
            </div>

            <div className={styles["location-card-footer"]}>
                <div className={styles["location-stats"]}>
                    {viewCount >= 0 && (
                        <div className={styles["location-views"]}>
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
                        <div className={styles["location-comments"]}>
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

export default LocationCard;
