import config from "../../config";
import "./404.css";

function NotFound() {
    return (
        <div className="notFoundContainer">
            <h1 className="error404">404</h1>
            <h2 className="errorMessage">Không tìm thấy trang bạn yêu cầu</h2>
            <a className="homeLink" href={config.routes.home}>
                Quay về trang chủ
            </a>
        </div>
    );
}
export default NotFound;
