import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components";
import {
    validateUsername,
    validateEmail,
    validatePassword,
    validateFullName,
    validatePhoneNumber,
} from "@/utils";
import "./UserForm.css";

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
    const [values, setValues] = useState(defaultValues);
    const [errors, setErrors] = useState({});

    const isEdit = useMemo(() => mode === "edit", [mode]);

    useEffect(() => {
        if (initialValues) {
            setValues((prev) => ({ ...prev, ...initialValues }));
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
        const payload = { ...values, updated_at: new Date().toISOString() };

        // Convert empty birthday string to null
        if (payload.birthday === "") {
            payload.birthday = null;
        }

        if (isEdit) {
            delete payload.password;
        } else if (!payload.password) {
            setErrors((p) => ({ ...p, password: "Vui lòng nhập mật khẩu" }));
            return;
        }
        onSubmit && onSubmit(payload);
    };

    return (
        <div className="user-form-modal">
            <div className="user-form-dialog">
                <div className="user-form-header">
                    <h3>
                        {title ||
                            (isEdit
                                ? "Cập nhật người dùng"
                                : "Thêm người dùng")}
                    </h3>
                </div>
                <form className="user-form" onSubmit={handleSubmit}>
                    <div className="grid">
                        <div className="form-group">
                            <label>Họ tên *</label>
                            <input
                                name="full_name"
                                value={values.full_name}
                                onChange={handleChange}
                                placeholder="Nhập họ tên"
                            />
                            {errors.full_name && (
                                <span className="error-text">
                                    {errors.full_name}
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Tên người dùng *</label>
                            <input
                                name="username"
                                value={values.username}
                                onChange={handleChange}
                                placeholder="ví dụ: nguyenvana"
                                disabled={isEdit}
                            />
                            {errors.username && (
                                <span className="error-text">
                                    {errors.username}
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Email *</label>
                            <input
                                name="email"
                                value={values.email}
                                onChange={handleChange}
                                placeholder="name@example.com"
                            />
                            {errors.email && (
                                <span className="error-text">
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
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="sa">Super Admin</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Trạng thái</label>
                            <select
                                name="status"
                                value={values.status || "active"}
                                onChange={handleChange}
                            >
                                <option value="active">Hoạt động</option>
                                <option value="blocked">Không hoạt động</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Ngày sinh</label>
                            <input
                                type="date"
                                name="birthday"
                                value={values.birthday}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Ảnh đại diện (URL)</label>
                            <input
                                name="avatar_url"
                                value={values.avatar_url}
                                onChange={handleChange}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="form-group form-group--full">
                            <label>Địa chỉ</label>
                            <textarea
                                name="address"
                                rows={2}
                                value={values.address}
                                onChange={handleChange}
                                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                            />
                        </div>

                        <div className="form-group form-group--full">
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

                    <div className="form-actions">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onCancel}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading}>
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
