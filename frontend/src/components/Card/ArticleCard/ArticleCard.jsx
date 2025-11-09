import { useNavigate } from "react-router-dom";
import routes from "@/config/routes";
import config from "@/config";
import { formatViewCount } from "@/utils/viewUtils";
import styles from "./ArticleCard.module.css";

const ArticleCard = ({ article, viewCount = 0, commentCount = 0 }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(routes.articleDetail.replace(":id", article.id), {
            state: { article },
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    // Helper function to get full image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        
        // If already a full URL (http/https) or data URL, return as is
        if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
            return imagePath;
        }
        
        // If it's a relative path, prepend server URL
        if (imagePath.startsWith('/assets/images/')) {
            return `${config.serverUrl}${imagePath}`;
        }
        
        return imagePath;
    };

    return (
        <div className={styles["article-card"]} onClick={handleCardClick}>
            {/* Cover Image */}
            <div className={styles["article-card-image"]}>
                {article.coverImage ? (
                    <img
                        src={getImageUrl(article.coverImage)}
                        alt={article.title}
                        onError={(e) => {
                            e.target.src =
                                "https://via.placeholder.com/400x250/667eea/ffffff?text=No+Image";
                        }}
                    />
                ) : (
                    <div className={styles["placeholder-image"]}>
                        <span>📰</span>
                    </div>
                )}
            </div>

            {/* Card Content */}
            <div className={styles["article-card-content"]}>
                {/* Title */}
                <h3 className={styles["article-title"]}>{article.title}</h3>

                {/* Footer Info */}
                <div className={styles["article-card-footer"]}>
                    {/* Author */}
                    {article.authorName && (
                        <div className={styles["article-author"]}>
                            <svg
                                className={styles["author-icon"]}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            <span>{article.authorName}</span>
                        </div>
                    )}

                    {/* Stats Container - Views and Comments */}
                    <div className={styles["article-stats"]}>
                        {/* View Count */}
                        {viewCount >= 0 && (
                            <div className={styles["article-views"]}>
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

                        {/* Comment Count */}
                        {commentCount >= 0 && (
                            <div className={styles["article-comments"]}>
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
                </div>
            </div>
        </div>
    );
};

export default ArticleCard;
