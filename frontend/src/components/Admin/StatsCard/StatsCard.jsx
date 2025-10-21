import React from "react";
import styles from "./StatsCard.module.css";

const StatsCard = ({
    title,
    value,
    icon,
    color,
    change,
    changeType,
    loading,
}) => {
    if (loading) {
        return (
            <div className={`${styles["stats-card"]} ${styles["loading"]}`}>
                <div className={styles["stats-card-content"]}>
                    <div
                        className={`${styles["stats-icon"]} ${styles["skeleton"]}`}
                    ></div>
                    <div className={styles["stats-info"]}>
                        <div
                            className={`${styles["stats-title"]} ${styles["skeleton"]}`}
                        ></div>
                        <div
                            className={`${styles["stats-value"]} ${styles["skeleton"]}`}
                        ></div>
                        <div
                            className={`${styles["stats-change"]} ${styles["skeleton"]}`}
                        ></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles["stats-card"]}>
            <div className={styles["stats-card-content"]}>
                <div
                    className={styles["stats-icon"]}
                    style={{ backgroundColor: color }}
                >
                    {icon}
                </div>
                <div className={styles["stats-info"]}>
                    <h3 className={styles["stats-title"]}>{title}</h3>
                    <p className={styles["stats-value"]}>
                        {value.toLocaleString()}
                    </p>
                    <span
                        className={`${styles["stats-change"]} ${styles[changeType]}`}
                    >
                        {change}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
