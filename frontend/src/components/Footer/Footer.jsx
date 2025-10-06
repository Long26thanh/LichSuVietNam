import "./Footer.css";
import config from "../../config";

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    {/* Logo và mô tả */}
                    <div className="footer-section footer-brand">
                        <div className="footer-logo">
                            <img
                                className="footer-logo-image"
                                src="/logo.svg"
                                alt="Lịch sử Việt Nam"
                            />
                            <h3 className="footer-title">Lịch sử Việt Nam</h3>
                        </div>
                        <p className="footer-description">
                            Khám phá và tìm hiểu lịch sử văn hóa của dân tộc
                            Việt Nam từ quá khứ đến hiện tại.
                        </p>
                    </div>

                    {/* Navigation Links */}
                    <div className="footer-section">
                        <h4 className="footer-section-title">Khám phá</h4>
                        <ul className="footer-links">
                            <li>
                                <a href={config.routes.home}>Trang chủ</a>
                            </li>
                            <li>
                                <a href={config.routes.timeline}>
                                    Dòng thời gian
                                </a>
                            </li>
                            <li>
                                <a href={config.routes.characters}>Nhân vật</a>
                            </li>
                            <li>
                                <a href={config.routes.events}>Sự kiện</a>
                            </li>
                            <li>
                                <a href={config.routes.locations}>Địa danh</a>
                            </li>
                        </ul>
                    </div>

                    {/* Thông tin */}
                    <div className="footer-section">
                        <h4 className="footer-section-title">Thông tin</h4>
                        <ul className="footer-links">
                            <li>
                                <a href="/about">Giới thiệu</a>
                            </li>
                            <li>
                                <a href="/contact">Liên hệ</a>
                            </li>
                            <li>
                                <a href="/privacy">Chính sách bảo mật</a>
                            </li>
                            <li>
                                <a href="/terms">Điều khoản sử dụng</a>
                            </li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div className="footer-section">
                        <h4 className="footer-section-title">Kết nối</h4>
                        <div className="footer-social">
                            <a
                                href="#"
                                className="social-link"
                                aria-label="Facebook"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                            <a
                                href="#"
                                className="social-link"
                                aria-label="YouTube"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </a>
                            <a
                                href="#"
                                className="social-link"
                                aria-label="Instagram"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12.017 0C8.396 0 7.989.013 7.041.048 6.094.082 5.48.204 4.955.388a7.418 7.418 0 0 0-2.687 1.748 7.418 7.418 0 0 0-1.748 2.687c-.184.525-.306 1.139-.34 2.086C.013 7.989 0 8.396 0 12.017s.013 4.028.048 4.976c.034.947.156 1.561.34 2.086a7.418 7.418 0 0 0 1.748 2.687 7.418 7.418 0 0 0 2.687 1.748c.525.184 1.139.306 2.086.34.948.035 1.355.048 4.976.048s4.028-.013 4.976-.048c.947-.034 1.561-.156 2.086-.34a7.418 7.418 0 0 0 2.687-1.748 7.418 7.418 0 0 0 1.748-2.687c.184-.525.306-1.139.34-2.086.035-.948.048-1.355.048-4.976s-.013-4.028-.048-4.976c-.034-.947-.156-1.561-.34-2.086a7.418 7.418 0 0 0-1.748-2.687A7.418 7.418 0 0 0 16.972.388c-.525-.184-1.139-.306-2.086-.34C14.028.013 13.621 0 12.017 0zM12.017 2.19c3.573 0 3.998.014 5.406.048.86.04 1.463.17 1.923.322.483.188.829.413 1.192.776.363.363.588.709.776 1.192.152.46.282 1.063.322 1.923.034 1.408.048 1.833.048 5.406s-.014 3.998-.048 5.406c-.04.86-.17 1.463-.322 1.923-.188.483-.413.829-.776 1.192-.363.363-.709.588-1.192.776-.46.152-1.063.282-1.923.322-1.408.034-1.833.048-5.406.048s-3.998-.014-5.406-.048c-.86-.04-1.463-.17-1.923-.322-.483-.188-.829-.413-1.192-.776-.363-.363-.588-.709-.776-1.192-.152-.46-.282-1.063-.322-1.923-.034-1.408-.048-1.833-.048-5.406s.014-3.998.048-5.406c.04-.86.17-1.463.322-1.923.188-.483.413-.829.776-1.192.363-.363.709-.588 1.192-.776.46-.152 1.063-.282 1.923-.322 1.408-.034 1.833-.048 5.406-.048zm0 3.719a6.108 6.108 0 1 0 0 12.217 6.108 6.108 0 0 0 0-12.217zm0 10.06a3.952 3.952 0 1 1 0-7.905 3.952 3.952 0 0 1 0 7.905zm7.753-10.36a1.426 1.426 0 1 1-2.853 0 1.426 1.426 0 0 1 2.853 0z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="footer-bottom">
                    <div className="footer-divider"></div>
                    <div className="footer-copyright">
                        <p>
                            &copy; {currentYear} Lịch sử Việt Nam. Tất cả quyền
                            được bảo lưu.
                        </p>
                        <p className="footer-subtitle">
                            Được xây dựng với ❤️ cho việc bảo tồn và truyền bá
                            lịch sử dân tộc
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
