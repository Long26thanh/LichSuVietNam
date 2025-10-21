import React, { useMemo, useState } from "react";
import { Button } from "@/components";
import { validatePassword } from "@/utils";
import styles from "./ResetPasswordModal.module.css";

const ResetPasswordModal = ({ user, onSubmit, onCancel, loading = false }) => {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");

    const canSubmit = useMemo(() => {
        return (
            password.length > 0 &&
            confirm.length > 0 &&
            password === confirm &&
            validatePassword(password)
        );
    }, [password, confirm]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        if (!validatePassword(password)) {
            setError(
                "Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số"
            );
            return;
        }
        if (password !== confirm) {
            setError("Mật khẩu xác nhận không khớp");
            return;
        }
        onSubmit && onSubmit({ password });
    };

    return (
        <div className={styles["rp-modal"]}>
            <div className={styles["rp-dialog"]}>
                <div className={styles["rp-header"]}>
                    <h3>Đặt lại mật khẩu</h3>
                    <p>
                        Người dùng: <strong>@{user?.username}</strong>
                    </p>
                </div>
                <form className={styles["rp-form"]} onSubmit={handleSubmit}>
                    <div className={styles["rp-group"]}>
                        <label>Mật khẩu mới</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Ít nhất 6 ký tự, có chữ hoa/thường và số"
                        />
                    </div>
                    <div className={styles["rp-group"]}>
                        <label>Xác nhận mật khẩu</label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            placeholder="Nhập lại mật khẩu mới"
                        />
                    </div>
                    {error && <div className={styles["rp-error"]}>{error}</div>}

                    <div className={styles["rp-actions"]}>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onCancel}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={!canSubmit || loading}>
                            {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordModal;
