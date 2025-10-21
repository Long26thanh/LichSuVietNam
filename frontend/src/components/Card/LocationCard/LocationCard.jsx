import { useNavigate } from "react-router-dom";
import routes from "@/config/routes";
import styles from "./LocationCard.module.css";

const LocationCard = ({ location }) => {
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
                    <div className={styles["location-description"]}>
                        <p>{location.description}</p>
                    </div>
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
                <button className={styles["view-details-btn"]}>
                    Xem chi tiết
                </button>
            </div>
        </div>
    );
};

export default LocationCard;
