import { useNavigate, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import config from "@/config";
import styles from "./Header.module.css";
import * as icons from "@/assets/icons";
import { Navbar, Button, Search, UserDropdown } from "@/components";
import { useAuth } from "@/contexts/AuthContext";

function Header() {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    // Đóng menu khi click ra ngoài
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target)
            ) {
                setIsUserMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate(config.routes.home);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles["header-container"]}>
                <Link className={styles["header-logo"]} to={config.routes.home}>
                    <img className={styles.logo} src="/logo.svg" alt="Logo" />
                    <div className={styles["logo-text"]}>
                        <p className={styles["logo-title"]}>Lịch sử Việt Nam</p>
                        <p className={styles["logo-description"]}>
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
                <div className={styles["header-actions"]}>
                    <Search toggleAble={true} onSearch={(query) => {}} />
                    {!isAuthenticated ? (
                        <div className={styles["auth-buttons"]}>
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
                    ) : (
                        <UserDropdown
                            user={user}
                            onLogout={handleLogout}
                            variant="user"
                            showNotifications={false}
                            items={[
                                {
                                    key: "profile",
                                    icon: icons.user,
                                    label: "Hồ sơ cá nhân",
                                    to: "/profile",
                                },
                                {
                                    key: "my-articles",
                                    icon: icons.myArticles,
                                    label: "Bài viết của tôi",
                                    to: config.routes.userArticles,
                                },
                                {
                                    key: "settings",
                                    icon: icons.settings,
                                    label: "Cài đặt",
                                    to: "/settings",
                                },
                                { key: "divider-1", type: "divider" },
                                {
                                    key: "logout",
                                    icon: icons.logout,
                                    label: "Đăng xuất",
                                    danger: true,
                                    onClick: handleLogout,
                                },
                            ]}
                        />
                        // <div className="user-menu" ref={userMenuRef}>
                        //     <Button
                        //         onClick={() =>
                        //             setIsUserMenuOpen(!isUserMenuOpen)
                        //         }
                        //         className="user-menu-trigger"
                        //     >
                        //         <div className="user-avatar">
                        //             {user?.avatar_url ? (
                        //                 <img
                        //                     src={user.avatar_url}
                        //                     alt="User Avatar"
                        //                 />
                        //             ) : (
                        //                 <div className="avatar-placeholder">
                        //                     {user?.full_name
                        //                         ?.charAt(0)
                        //                         .toUpperCase() || "?"}
                        //                 </div>
                        //             )}
                        //         </div>
                        //         <span className="user-name">
                        //             {user?.full_name || "Người dùng"}
                        //         </span>
                        //         <img
                        //             src={icons.dropdownArrow}
                        //             alt="Dropdown Arrow"
                        //             className={`dropdown-arrow ${
                        //                 isUserMenuOpen ? "open" : ""
                        //             }`}
                        //         />
                        //     </Button>

                        //     {isUserMenuOpen && (
                        //         <div className="user-menu-dropdown">
                        //             <div className="user-info">
                        //                 <div className="user-info-avatar">
                        //                     {user?.avatar_url ? (
                        //                         <img
                        //                             src={user.avatar_url}
                        //                             alt="User Avatar"
                        //                         />
                        //                     ) : (
                        //                         <div className="avatar-placeholder">
                        //                             {user?.full_name
                        //                                 ?.charAt(0)
                        //                                 .toUpperCase() || "?"}
                        //                         </div>
                        //                     )}
                        //                 </div>
                        //                 <div className="user-info-text">
                        //                     <div className="user-info-name">
                        //                         {user?.full_name ||
                        //                             "Người dùng"}
                        //                     </div>
                        //                     <div className="user-info-email">
                        //                         {user?.email ||
                        //                             "user@example.com"}
                        //                     </div>
                        //                 </div>
                        //             </div>

                        //             <div className="user-menu-divider"></div>

                        //             <div className="user-menu-items">
                        //                 <button
                        //                     className="user-menu-item"
                        //                     onClick={() => {
                        //                         navigate("/profile");
                        //                         setIsUserMenuOpen(false);
                        //                     }}
                        //                 >
                        //                     <img
                        //                         src={icons.user}
                        //                         alt="Profile"
                        //                     />
                        //                     <span>Hồ sơ cá nhân</span>
                        //                 </button>

                        //                 <button
                        //                     className="user-menu-item"
                        //                     onClick={() => {
                        //                         navigate("/settings");
                        //                         setIsUserMenuOpen(false);
                        //                     }}
                        //                 >
                        //                     <img
                        //                         src={icons.settings}
                        //                         alt="Settings"
                        //                     />
                        //                     <span>Cài đặt</span>
                        //                 </button>

                        //                 <div className="user-menu-divider"></div>

                        //                 <button
                        //                     className="user-menu-item logout"
                        //                     onClick={handleLogout}
                        //                 >
                        //                     <img
                        //                         src={icons.logout}
                        //                         alt="Logout"
                        //                     />
                        //                     <span>Đăng xuất</span>
                        //                 </button>
                        //             </div>
                        //         </div>
                        //     )}
                        // </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
