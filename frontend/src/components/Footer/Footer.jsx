import styles from "./Footer.module.css";
import config from "../../config";

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles["footer-wave"]}>
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
                </svg>
            </div>

            <div className={styles["footer-container"]}>
                <div className={styles["footer-content"]}>
                    {/* Logo và mô tả */}
                    <div className={styles["footer-brand"]}>
                        <div className={styles["footer-logo"]}>
                            <img
                                src="/logo.svg"
                                alt="Logo Lịch Sử Việt Nam"
                                className={styles["logo-image"]}
                            />
                            <h3 className={styles["footer-title"]}>
                                Lịch Sử Việt Nam
                            </h3>
                        </div>
                        <p className={styles["footer-description"]}>
                            Khám phá và tìm hiểu lịch sử văn hóa của dân tộc
                            Việt Nam từ quá khứ đến hiện tại. Nơi lưu giữ và lan
                            tỏa những giá trị truyền thống quý báu của dân tộc.
                        </p>
                        <div className={styles["footer-social"]}>
                            <a
                                href="#"
                                className={styles["social-link"]}
                                aria-label="Facebook"
                                title="Facebook"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                            <a
                                href="#"
                                className={styles["social-link"]}
                                aria-label="YouTube"
                                title="YouTube"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </a>
                            <a
                                href="#"
                                className={styles["social-link"]}
                                aria-label="Instagram"
                                title="Instagram"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12.017 0C8.396 0 7.989.013 7.041.048 6.094.082 5.48.204 4.955.388a7.418 7.418 0 0 0-2.687 1.748 7.418 7.418 0 0 0-1.748 2.687c-.184.525-.306 1.139-.34 2.086C.013 7.989 0 8.396 0 12.017s.013 4.028.048 4.976c.034.947.156 1.561.34 2.086a7.418 7.418 0 0 0 1.748 2.687 7.418 7.418 0 0 0 2.687 1.748c.525.184 1.139.306 2.086.34.948.035 1.355.048 4.976.048s4.028-.013 4.976-.048c.947-.034 1.561-.156 2.086-.34a7.418 7.418 0 0 0 2.687-1.748 7.418 7.418 0 0 0 1.748-2.687c.184-.525.306-1.139.34-2.086.035-.948.048-1.355.048-4.976s-.013-4.028-.048-4.976c-.034-.947-.156-1.561-.34-2.086a7.418 7.418 0 0 0-1.748-2.687A7.418 7.418 0 0 0 16.972.388c-.525-.184-1.139-.306-2.086-.34C14.028.013 13.621 0 12.017 0zM12.017 2.19c3.573 0 3.998.014 5.406.048.86.04 1.463.17 1.923.322.483.188.829.413 1.192.776.363.363.588.709.776 1.192.152.46.282 1.063.322 1.923.034 1.408.048 1.833.048 5.406s-.014 3.998-.048 5.406c-.04.86-.17 1.463-.322 1.923-.188.483-.413.829-.776 1.192-.363.363-.709.588-1.192.776-.46.152-1.063.282-1.923.322-1.408.034-1.833.048-5.406.048s-3.998-.014-5.406-.048c-.86-.04-1.463-.17-1.923-.322-.483-.188-.829-.413-1.192-.776-.363-.363-.588-.709-.776-1.192-.152-.46-.282-1.063-.322-1.923-.034-1.408-.048-1.833-.048-5.406s.014-3.998.048-5.406c.04-.86.17-1.463.322-1.923.188-.483.413-.829.776-1.192.363-.363.709-.588 1.192-.776.46-.152 1.063-.282 1.923-.322 1.408-.034 1.833-.048 5.406-.048zm0 3.719a6.108 6.108 0 1 0 0 12.217 6.108 6.108 0 0 0 0-12.217zm0 10.06a3.952 3.952 0 1 1 0-7.905 3.952 3.952 0 0 1 0 7.905zm7.753-10.36a1.426 1.426 0 1 1-2.853 0 1.426 1.426 0 0 1 2.853 0z" />
                                </svg>
                            </a>
                            <a
                                href="#"
                                className={styles["social-link"]}
                                aria-label="Twitter"
                                title="Twitter"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className={styles["footer-section"]}>
                        <h4 className={styles["footer-section-title"]}>
                            Khám Phá
                        </h4>
                        <ul className={styles["footer-links"]}>
                            <li>
                                <a href={config.routes.home}>
                                    <span className={styles["link-icon"]}>
                                        →
                                    </span>
                                    Trang chủ
                                </a>
                            </li>
                            <li>
                                <a href={config.routes.timeline}>
                                    <span className={styles["link-icon"]}>
                                        →
                                    </span>
                                    Dòng thời gian
                                </a>
                            </li>
                            <li>
                                <a href={config.routes.characters}>
                                    <span className={styles["link-icon"]}>
                                        →
                                    </span>
                                    Nhân vật
                                </a>
                            </li>
                            <li>
                                <a href={config.routes.events}>
                                    <span className={styles["link-icon"]}>
                                        →
                                    </span>
                                    Sự kiện
                                </a>
                            </li>
                            <li>
                                <a href={config.routes.locations}>
                                    <span className={styles["link-icon"]}>
                                        →
                                    </span>
                                    Địa danh
                                </a>
                            </li>
                            <li>
                                <a href={config.routes.news}>
                                    <span className={styles["link-icon"]}>
                                        →
                                    </span>
                                    Tin tức
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Thông tin */}
                    <div className={styles["footer-section"]}>
                        <h4 className={styles["footer-section-title"]}>
                            Thông Tin
                        </h4>
                        <ul className={styles["footer-links"]}>
                            <li>
                                <a href="/about">
                                    <span className={styles["link-icon"]}>
                                        →
                                    </span>
                                    Giới thiệu
                                </a>
                            </li>
                            <li>
                                <a href="/contact">
                                    <span className={styles["link-icon"]}>
                                        →
                                    </span>
                                    Liên hệ
                                </a>
                            </li>
                            <li>
                                <a href="/privacy">
                                    <span className={styles["link-icon"]}>
                                        →
                                    </span>
                                    Chính sách bảo mật
                                </a>
                            </li>
                            <li>
                                <a href="/terms">
                                    <span className={styles["link-icon"]}>
                                        →
                                    </span>
                                    Điều khoản sử dụng
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Liên hệ */}
                    <div className={styles["footer-section"]}>
                        <h4 className={styles["footer-section-title"]}>
                            Liên Hệ
                        </h4>
                        <ul className={styles["footer-contact"]}>
                            <li>
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                </svg>
                                <span>contact@lichsuvietnam.vn</span>
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                                </svg>
                                <span>(+84) 123 456 789</span>
                            </li>
                            <li>
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                                <span>Hà Nội, Việt Nam</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className={styles["footer-bottom"]}>
                    <div className={styles["footer-divider"]}></div>
                    <div className={styles["footer-copyright"]}>
                        <p>
                            © {currentYear} Lịch Sử Việt Nam. Tất cả quyền được
                            bảo lưu.
                        </p>
                        <p className={styles["footer-subtitle"]}>
                            Được xây dựng với{" "}
                            <span className={styles.heart}>❤️</span> cho việc
                            bảo tồn và truyền bá lịch sử dân tộc
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
