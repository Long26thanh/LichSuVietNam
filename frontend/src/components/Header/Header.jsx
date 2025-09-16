import "./Header.css";
import config from "../../config";
import { Navbar } from "..";

function Header() {
    return (
        <header className="header">
            <a className="header-logo" href={config.routes.home}>
                <img className="logo" src="logo.svg" alt="Logo" />
                <p className="logo-title">Lịch sử Việt Nam</p>
                <p className="logo-description">
                    Khám phá lịch sử Việt Nam từ quá khứ đến hiện tại
                </p>
            </a>
            <Navbar />
        </header>
    );
}

export default Header;
