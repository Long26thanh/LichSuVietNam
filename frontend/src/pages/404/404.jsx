import config from "../../config";
import styles from "@/pages/404/404.module.css";

function NotFound() {
    return (
        <div className={styles.notFoundContainer}>
            <div className={styles.errorIllustration}>🏛️</div>
            <h1 className={styles.error404}>404</h1>
            <h2 className={styles.errorMessage}>
                Không tìm thấy trang bạn yêu cầu
            </h2>
            <p className={styles.errorDescription}>
                Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời
                không khả dụng.
            </p>
            <a className={styles.homeLink} href={config.routes.home}>
                <svg
                    className={styles.homeIcon}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
                Quay về trang chủ
            </a>
        </div>
    );
}

export default NotFound;
