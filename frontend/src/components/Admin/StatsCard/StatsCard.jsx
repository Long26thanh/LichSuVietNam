import React from 'react';
import './StatsCard.css';

const StatsCard = ({ title, value, icon, color, change, changeType, loading }) => {
    if (loading) {
        return (
            <div className="stats-card loading">
                <div className="stats-card-content">
                    <div className="stats-icon skeleton"></div>
                    <div className="stats-info">
                        <div className="stats-title skeleton"></div>
                        <div className="stats-value skeleton"></div>
                        <div className="stats-change skeleton"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="stats-card">
            <div className="stats-card-content">
                <div className="stats-icon" style={{ backgroundColor: color }}>
                    {icon}
                </div>
                <div className="stats-info">
                    <h3 className="stats-title">{title}</h3>
                    <p className="stats-value">{value.toLocaleString()}</p>
                    <span className={`stats-change ${changeType}`}>
                        {change}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
