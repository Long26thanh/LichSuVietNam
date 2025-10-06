import { useToggle } from "@/hooks";
import styles from "./Navbar.module.css";

function Navbar({
    items = [],
    orientation = "horizontal",
    variant = "default",
    className = "",
    toggleAble = false,
    currentPath = window.location.pathname,
    ...props
}) {
    const [isOpen, toggleOpen] = useToggle(false);

    const renderIcon = (icon) => {
        if (typeof icon === "string") {
            return <img src={icon} alt="icon" />;
        }
        return icon;
    };

    const isActive = (route) => {
        return currentPath === route;
    };
    if (toggleAble) {
        return (
            <div
                className={`${styles["navbar-toggle-able"]} ${className}`}
                {...props}
            >
                <button
                    className={styles["navbar-toggle"]}
                    onClick={toggleOpen}
                    aria-label="Toggle navigation"
                >
                    ☰
                </button>
                {isOpen && (
                    <nav className={styles["navbar-dropdown"]}>
                        <ul className={styles["navbar-list"]}>
                            {items.map((item, index) => (
                                <li
                                    className={styles["navbar-item"]}
                                    key={index}
                                >
                                    <a
                                        className={`${styles["navbar-link"]} ${
                                            isActive(item.route)
                                                ? styles["navbar-active"]
                                                : ""
                                        }`}
                                        href={item.route}
                                        onClick={() => {
                                            onItemClick?.(item);
                                            toggleOpen();
                                        }}
                                    >
                                        {item.icon && renderIcon(item.icon)}
                                        <span className={styles["nav-text"]}>
                                            {item.label}
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}
            </div>
        );
    }
    return (
        <nav className={`${styles.navbar} ${className}`} {...props}>
            <ul className={styles["navbar-list"]}>
                {items.map((item, index) => (
                    <li className={styles["navbar-item"]} key={index}>
                        <a
                            className={`${styles["navbar-link"]} ${
                                isActive(item.route)
                                    ? styles["navbar-active"]
                                    : ""
                            }`}
                            href={item.route}
                            onClick={() => onItemClick?.(item)}
                        >
                            {item.icon && renderIcon(item.icon)}
                            <span className={styles["nav-text"]}>
                                {item.label}
                            </span>
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export default Navbar;
