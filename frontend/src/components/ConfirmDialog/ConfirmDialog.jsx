import React from "react";
import styles from "./ConfirmDialog.module.css";

const ConfirmDialog = ({
    open,
    title = "Xác nhận",
    message = "Bạn có chắc muốn thực hiện hành động này?",
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    onConfirm,
    onCancel,
    loading = false,
    danger = false,
}) => {
    if (!open) return null;
    return (
        <div
            className={styles["confirm-backdrop"]}
            onClick={loading ? undefined : onCancel}
        >
            <div
                className={styles["confirm-dialog"]}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles["confirm-header"]}>
                    <h3>{title}</h3>
                </div>
                <div className={styles["confirm-body"]}>
                    <p>{message}</p>
                </div>
                <div className={styles["confirm-actions"]}>
                    <button
                        className={`${styles.btn} ${styles["btn-secondary"]}`}
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`${styles.btn} ${
                            danger
                                ? styles["btn-danger"]
                                : styles["btn-primary"]
                        }`}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? "Đang xử lý..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
