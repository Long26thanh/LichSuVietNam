import styles from "./Button.module.css";

function Button({
    children,
    variant = "primary",
    size = "medium",
    disabled = false,
    loading = false,
    fullWidth = false,
    icon = null,
    iconPosition = "left",
    onClick,
    type = "button",
    className = "",
    ...props
}) {
    const getVariantClass = (variant) => {
        const variantMap = {
            primary: styles.btnPrimary,
            secondary: styles.btnSecondary,
            success: styles.btnSuccess,
            danger: styles.btnDanger,
            warning: styles.btnWarning,
            info: styles.btnInfo,
            light: styles.btnLight,
            dark: styles.btnDark,
            ghost: styles.btnGhost,
            iconOnly: styles.btnIconOnly,
        };
        return variantMap[variant] || styles.btnPrimary;
    };

    const getSizeClass = (size) => {
        const sizeMap = {
            small: styles.btnSmall,
            medium: styles.btnMedium,
            large: styles.btnLarge,
        };
        return sizeMap[size] || styles.btnMedium;
    };

    const renderIcon = (icon) => {
        if (typeof icon === "string") {
            if (icon.startsWith("<svg")) {
                return (
                    <span
                        className={styles.btnIconSvg}
                        dangerouslySetInnerHTML={{ __html: icon }}
                    />
                );
            }
            return <img className={styles.btnIconImg} src={icon} alt="icon" />;
        }
        return <span className={styles.btnIconComponent}>{icon}</span>;
    };

    const buttonClasses = [
        styles.btn,
        getVariantClass(variant),
        getSizeClass(size),
        disabled && styles.btnDisabled,
        loading && styles.btnLoading,
        fullWidth && styles.btnFullWidth,
        icon && styles.btnWithIcon,
        icon && !children && styles.btnIconOnly,
        className,
    ]
        .filter(Boolean)
        .join(" ");

    const handleClick = (e) => {
        if (disabled || loading) {
            e.preventDefault();
            return;
        }
        onClick?.(e);
    };

    return (
        <button
            type={type}
            className={buttonClasses}
            onClick={handleClick}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <span className={styles.btnSpinner}>
                    <svg viewBox="0 0 24 24">
                        <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray="31.416"
                            strokeDashoffset="31.416"
                        />
                    </svg>
                </span>
            )}

            {!loading && icon && iconPosition === "left" && (
                <span className={`${styles.btnIcon} ${styles.btnIconLeft}`}>
                    <span className={styles.btnIconWrapper}>
                        {icon && renderIcon(icon)}
                    </span>
                </span>
            )}

            {children && <span className={styles.btnText}>{children}</span>}

            {!loading && icon && iconPosition === "right" && (
                <span className={`${styles.btnIcon} ${styles.btnIconRight}`}>
                    <span className={styles.btnIconWrapper}>
                        {icon && renderIcon(icon)}
                    </span>
                </span>
            )}
        </button>
    );
}

export default Button;
