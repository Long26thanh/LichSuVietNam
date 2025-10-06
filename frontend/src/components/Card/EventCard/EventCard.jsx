import { useNavigate, Link } from "react-router-dom";
import routes from "@/config/routes";
import { formatShortDateRange } from "@/utils";
import "./EventCard.css";

function EventCard({ event }) {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(routes.eventDetail.replace(":id", event.id), {
            state: { event },
        });
    };

    return (
        <div className="event-card" onClick={handleCardClick}>
            <div className="event-card-header">
                <h3 className="event-title">{event.name}</h3>
                <span className="event-date">
                    {formatShortDateRange(
                        { day: event.startDate, month: event.startMonth, year: event.startYear },
                        { day: event.endDate, month: event.endMonth, year: event.endYear }
                    )}
                </span>
            </div>
            <div className="event-card-content">
                {event.summary && (
                    <p className="event-description">{event.summary}</p>
                )}
                {event.location && (
                    <div className="event-location">
                        <span className="location-label">Địa điểm:</span>
                        <span className="location-value">{event.location}</span>
                    </div>
                )}
                {event.related_figures && event.related_figures.length > 0 && (
                    <div className="related-figures">
                        <span className="figures-label">
                            Nhân vật liên quan:
                        </span>
                        <ul className="figures-list">
                            {event.related_figures.map((figure, index) => {
                                const figureId = typeof figure === 'object' ? figure.id : null;
                                const figureName = typeof figure === 'object' ? figure.name : figure;
                                
                                return (
                                    <li key={figureId || index} className="figure-item">
                                        {figureId ? (
                                            <Link 
                                                to={routes.figureDetail.replace(":id", figureId)}
                                                className="figure-link"
                                                onClick={(e) => e.stopPropagation()}
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
            <div className="event-card-footer">
                <button className="view-details-btn">Xem chi tiết</button>
            </div>
        </div>
    );
}

export default EventCard;
