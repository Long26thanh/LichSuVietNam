import React from "react";
import "./ConfirmDialog.css";

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
        <div className="confirm-backdrop" onClick={loading ? undefined : onCancel}>
            <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="confirm-header">
                    <h3>{title}</h3>
                </div>
                <div className="confirm-body">
                    <p>{message}</p>
                </div>
                <div className="confirm-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`btn ${danger ? "btn-danger" : "btn-primary"}`}
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


