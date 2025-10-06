import config from "../../config";
import "./404.css";

function NotFound() {
    return (
        <div className="notFoundContainer">
            <div className="errorIllustration">🏛️</div>
            <h1 className="error404">404</h1>
            <h2 className="errorMessage">Không tìm thấy trang bạn yêu cầu</h2>
            <p className="errorDescription">
                Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời
                không khả dụng.
            </p>
            <a className="homeLink" href={config.routes.home}>
                <svg
                    className="homeIcon"
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
