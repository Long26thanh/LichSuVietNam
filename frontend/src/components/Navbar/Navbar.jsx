import config from "../../config";
function Navbar() {
    return (
        <nav className="navbar">
            <ul className="navbar-list">
                <li className="navbar-item">
                    <a href={config.routes.home}>Home</a>
                </li>
                <li className="navbar-item">
                    <a href={config.routes.news}>Tin tức</a>
                </li>
                <li className="navbar-item">
                    <a href={config.routes.timeline}>Dòng thời gian</a>
                </li>
                <li className="navbar-item">
                    <a href={config.routes.characters}>Nhân vật</a>
                </li>
                <li className="navbar-item">
                    <a href={config.routes.events}>Sự kiện</a>
                </li>
                <li className="navbar-item">
                    <a href={config.routes.locations}>Địa danh</a>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;
