import "./Header.css";
import { useNavigate, Link } from "react-router-dom";
import config from "@/config";
import * as icons from "@/assets/icons";
import { Navbar, Button, Search, UserDropdown } from "@/components";
import { useAuth } from "@/contexts/AuthContext";

function Header() {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            navigate(config.routes.home);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <header className="header">
            <div className="header-container">
                <Link className="header-logo" to={config.routes.home}>
                    <img className="logo" src="/logo.svg" alt="Logo" />
                    <div className="logo-text">
                        <p className="logo-title">Lịch sử Việt Nam</p>
                        <p className="logo-description">
                            Khám phá lịch sử Việt Nam
                        </p>
                    </div>
                </Link>
                <Navbar
                    items={[
                        {
                            label: "Trang chủ",
                            route: config.routes.home,
                            icon: icons.home,
                        },
                        {
                            label: "Tin tức",
                            route: config.routes.news,
                            icon: icons.news,
                        },
                        {
                            label: "Dòng thời gian",
                            route: config.routes.timeline,
                            icon: icons.timeline,
                        },
                        {
                            label: "Nhân vật",
                            route: config.routes.characters,
                            icon: icons.user,
                        },
                        {
                            label: "Sự kiện",
                            route: config.routes.events,
                            icon: icons.events,
                        },
                        {
                            label: "Địa danh",
                            route: config.routes.locations,
                            icon: icons.locations,
                        },
                    ]}
                />
                <div className="header-actions">
                    {!isAuthenticated ? (
                        <>
                            <Search
                                toggleAble={true}
                                onSearch={(query) =>
                                    console.log("Searching for:", query)
                                }
                            />
                            <div className="auth-buttons">
                                <Button
                                    onClick={() => {
                                        navigate(config.routes.login);
                                    }}
                                >
                                    Đăng nhập
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() =>
                                        (window.location.href =
                                            config.routes.register)
                                    }
                                >
                                    Đăng ký
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="user-section">
                            <Search
                                toggleAble={true}
                                onSearch={(query) =>
                                    console.log("Searching for:", query)
                                }
                                className="search-container"
                            />
                            <UserDropdown
                                user={user}
                                onLogout={handleLogout}
                                variant="default"
                                items={[
                                    { key: 'profile', icon: '👤', label: 'Hồ sơ cá nhân', to: config.routes.profile },
                                    { key: 'settings', icon: '⚙️', label: 'Cài đặt', to: '/settings' },
                                    { key: 'divider-1', type: 'divider' },
                                    { key: 'logout', icon: '🚪', label: 'Đăng xuất', danger: true, onClick: handleLogout },
                                ]}
                            />
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
