import React, { useEffect, useMemo, useState } from "react";
import { Button, ImageUpload } from "@/components";
import {
    validateUsername,
    validateEmail,
    validatePassword,
    validateFullName,
    validatePhoneNumber,
} from "@/utils";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./UserForm.module.css";

const defaultValues = {
    full_name: "",
    username: "",
    email: "",
    role: "user",
    status: "active",
    password: "",
    phone: "",
    birthday: "",
    address: "",
    bio: "",
    avatar_url: "",
};

const UserForm = ({
    mode = "create", // "create" | "edit"
    initialValues,
    onSubmit,
    onCancel,
    loading = false,
    title,
}) => {
    const { user } = useAuth();
    const [values, setValues] = useState(defaultValues);
    const [errors, setErrors] = useState({});

    const isEdit = useMemo(() => mode === "edit", [mode]);

    useEffect(() => {
        if (initialValues) {
            const {
                full_name,
                username,
                email,
                role,
                is_active,
                phone,
                birthday,
                address,
                bio,
                avatar_url,
            } = initialValues;

            // Xác định trạng thái hoạt động của tài khoản
            const activeStatus =
                is_active === undefined || is_active === null
                    ? true
                    : !!is_active;

            setValues((prev) => ({
                ...prev,
                full_name: full_name || "",
                username: username || "",
                email: email || "",
                role: role || "user",
                status: activeStatus ? "active" : "blocked",
                phone: phone || "",
                birthday: birthday || "",
                address: address || "",
                bio: bio || "",
                avatar_url: avatar_url || "",
            }));
        }
    }, [initialValues]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    };

    const validate = () => {
        const next = {};
        if (!validateFullName(values.full_name)) {
            next.full_name = "Vui lòng nhập họ tên";
        }
        if (!validateUsername(values.username)) {
            next.username =
                "Tên người dùng chỉ gồm chữ, số, gạch dưới (3-30 ký tự)";
        }
        if (!validateEmail(values.email)) {
            next.email = "Email không hợp lệ";
        }
        if (!isEdit) {
            if (!validatePassword(values.password)) {
                next.password =
                    "Mật khẩu tối thiểu 8 ký tự, có chữ hoa, thường và số";
            }
        }
        if (values.phone && !validatePhoneNumber(values.phone)) {
            next.phone = "Số điện thoại không hợp lệ";
        }
        return next;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const v = validate();
        if (Object.keys(v).length > 0) {
            setErrors(v);
            return;
        }
        // Tạo payload chỉ với các trường cần thiết
        const payload = {
            full_name: values.full_name,
            username: values.username,
            email: values.email,
            role: values.role,
            status: values.status,
            phone: values.phone || null,
            birthday: values.birthday === "" ? null : values.birthday,
            address: values.address || null,
            bio: values.bio || null,
            avatar_url: values.avatar_url || null,
            updated_at: new Date().toISOString(),
        };

        // Thêm mật khẩu chỉ khi tạo mới user
        if (!isEdit) {
            if (!values.password) {
                setErrors((p) => ({
                    ...p,
                    password: "Vui lòng nhập mật khẩu",
                }));
                return;
            }
            payload.password = values.password;
        }

        onSubmit && onSubmit(payload);
    };

    return (
        <div className={styles["user-form-modal"]}>
            <div className={styles["user-form-dialog"]}>
                <div className={styles["user-form-header"]}>
                    <h2 className={styles.formTitle}>
                        {title ||
                            (isEdit
                                ? "Cập nhật người dùng"
                                : "Thêm người dùng")}
                    </h2>
                </div>
                <form className={styles["user-form"]} onSubmit={handleSubmit}>
                    <div className={styles.grid}>
                        <div className={styles["form-group"]}>
                            <label>Họ tên *</label>
                            <input
                                name="full_name"
                                value={values.full_name}
                                onChange={handleChange}
                                placeholder="Nhập họ tên"
                            />
                            {errors.full_name && (
                                <span className={styles["error-text"]}>
                                    {errors.full_name}
                                </span>
                            )}
                        </div>

                        <div className={styles["form-group"]}>
                            <label>Tên người dùng *</label>
                            <input
                                name="username"
                                value={values.username}
                                onChange={handleChange}
                                placeholder="ví dụ: nguyenvana"
                                disabled={isEdit}
                            />
                            {errors.username && (
                                <span className={styles["error-text"]}>
                                    {errors.username}
                                </span>
                            )}
                        </div>

                        <div className={styles["form-group"]}>
                            <label>Email *</label>
                            <input
                                name="email"
                                value={values.email}
                                onChange={handleChange}
                                placeholder="name@example.com"
                            />
                            {errors.email && (
                                <span className={styles["error-text"]}>
                                    {errors.email}
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Số điện thoại</label>
                            <input
                                name="phone"
                                value={values.phone}
                                onChange={handleChange}
                                placeholder="Ví dụ: +84901234567"
                            />
                            {errors.phone && (
                                <span className="error-text">
                                    {errors.phone}
                                </span>
                            )}
                        </div>

                        {!isEdit && (
                            <div className="form-group">
                                <label>Mật khẩu *</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={values.password}
                                    onChange={handleChange}
                                    placeholder="Ít nhất 6 ký tự, có chữ hoa/thường và số"
                                />
                                {errors.password && (
                                    <span className="error-text">
                                        {errors.password}
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="form-group">
                            <label>Vai trò</label>
                            <select
                                name="role"
                                value={values.role}
                                onChange={handleChange}
                                disabled={
                                    values.role === "sa" || user?.role !== "sa"
                                }
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                {values.role === "sa" &&
                                    (<option value="sa">Super Admin</option> ||
                                        currentUser?.role === "sa")}
                            </select>
                        </div>

                        <div className={styles["form-group"]}>
                            <label>Trạng thái</label>
                            <select
                                name="status"
                                value={values.status || "active"}
                                onChange={handleChange}
                            >
                                <option value="active">Hoạt động</option>
                                <option value="blocked">Đã khóa</option>
                            </select>
                        </div>

                        <div className={styles["form-group"]}>
                            <label>Ngày sinh</label>
                            <input
                                type="date"
                                name="birthday"
                                value={values.birthday}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <ImageUpload
                        value={values.avatar_url}
                        onChange={(value) =>
                            setValues((prev) => ({
                                ...prev,
                                avatar_url: value,
                            }))
                        }
                        label="Ảnh đại diện"
                        helpText="Ảnh đại diện sẽ hiển thị trong hồ sơ và bình luận của bạn"
                        aspectRatio="1/1"
                        maxSize={3}
                    />

                    <div className={styles["form-row"]}>
                        <div
                            className={`${styles["form-group"]} ${styles["form-group--full"]}`}
                        >
                            <label>Địa chỉ</label>
                            <textarea
                                name="address"
                                rows={2}
                                value={values.address}
                                onChange={handleChange}
                                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                            />
                        </div>

                        <div
                            className={`${styles["form-group"]} ${styles["form-group--full"]}`}
                        >
                            <label>Giới thiệu</label>
                            <textarea
                                name="bio"
                                rows={3}
                                value={values.bio}
                                onChange={handleChange}
                                placeholder="Mô tả ngắn về người dùng"
                            />
                        </div>
                    </div>

                    <div className={styles["form-actions"]}>
                        <Button
                            type="button"
                            variant="cancel"
                            onClick={onCancel}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            variant="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Đang lưu..."
                                : isEdit
                                ? "Cập nhật"
                                : "Tạo mới"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserForm;
