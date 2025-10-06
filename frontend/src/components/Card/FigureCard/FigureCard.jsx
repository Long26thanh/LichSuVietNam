import { useNavigate } from "react-router-dom";
import routes from "@/config/routes";
import "./FigureCard.css";

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
        <div className="figure-card" onClick={handleCardClick}>
            <div className="figure-card-header">
                <h3 className="figure-name">{figure.name}</h3>
                {figure.title && (
                    <span className="figure-title">{figure.title}</span>
                )}
            </div>

            <div className="figure-card-content">
                <div className="figure-info">
                    <span className="info-label">Thời gian:</span>
                    <span className="info-value">{formatLifespan()}</span>
                </div>

                {figure.birth_place && (
                    <div className="figure-info">
                        <span className="info-label">Nơi sinh:</span>
                        <span className="info-value">{figure.birth_place}</span>
                    </div>
                )}

                {figure.death_place && (
                    <div className="figure-info">
                        <span className="info-label">Nơi mất:</span>
                        <span className="info-value">{figure.death_place}</span>
                    </div>
                )}

                {figure.achievements && (
                    <div className="figure-achievements">
                        <span className="info-label">Thành tựu:</span>
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

            <div className="figure-card-footer">
                <button className="view-details-btn">Xem chi tiết</button>
            </div>
        </div>
    );
};

export default FigureCard;
