import { useNavigate } from "react-router-dom";
import routes from "@/config/routes";
import "./LocationCard.css";

const LocationCard = ({ location }) => {
    const navigate = useNavigate();
    const handleCardClick = () => {
        navigate(routes.locationDetail.replace(":id", location.id), {
            state: { location },
        });
    };

    return (
        <div className="location-card" onClick={handleCardClick}>
            <div className="location-card-header">
                <h3 className="location-name">{location.name}</h3>
                {location.location_type && (
                    <span className="location-type">{location.location_type}</span>
                )}
            </div>

            <div className="location-card-content">
                {location.ancient_name && (
                    <div className="location-info">
                        <span className="info-label">Tên cổ:</span>
                        <span className="info-value">{location.ancient_name}</span>
                    </div>
                )}

                {location.modern_name && (
                    <div className="location-info">
                        <span className="info-label">Tên hiện đại:</span>
                        <span className="info-value">{location.modern_name}</span>
                    </div>
                )}

                {location.description && (
                    <div className="location-description">
                        <p>{location.description}</p>
                    </div>
                )}

                {(location.latitude && location.longitude) && (
                    <div className="location-coordinates">
                        <span className="coordinates">
                            📍 {location.latitude}, {location.longitude}
                        </span>
                    </div>
                )}
            </div>

            <div className="location-card-footer">
                <button className="view-details-btn">
                    Xem chi tiết
                </button>
            </div>
        </div>
    );
};

export default LocationCard;
