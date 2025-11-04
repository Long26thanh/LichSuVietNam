import React, { useState, useEffect } from "react";
import styles from "./LocationTypeForm.module.css";
import { Button, ConfirmDialog } from "@/components";
import locationTypeService from "@/services/locationTypeService";

const LocationTypeForm = ({
    onClose,
    isLoading = false,
    locationTypes = [],
    onRefresh, // Add new prop for refreshing the list
}) => {
    const [editingType, setEditingType] = useState(null);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({ name: "" });
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        type: null,
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSubmit = () => {
        if (!formData.name.trim()) {
            setError("Vui lòng nhập tên loại địa danh");
            return;
        }

        if (editingType) {
            handleUpdate();
        } else {
            handleAdd();
        }
    };

    const handleAdd = async () => {
        try {
            // Kiểm tra trùng tên
            const exists = locationTypes.some(
                (type) =>
                    type.name.toLowerCase() ===
                    formData.name.trim().toLowerCase()
            );
            if (exists) {
                setError("Tên loại địa danh đã tồn tại");
                return;
            }

            const newType = await locationTypeService.createType({
                name: formData.name.trim(),
            });

            // Reset form first to clear the input
            resetForm();
            // Then refresh the list to show the new data
            if (onRefresh) {
                await onRefresh();
            }
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Có lỗi xảy ra khi thêm loại địa danh"
            );
        }
    };

    const handleUpdate = async () => {
        try {
            // Kiểm tra trùng tên với các loại địa danh khác
            const exists = locationTypes.some(
                (type) =>
                    type.id !== editingType.id &&
                    type.name.toLowerCase() ===
                        formData.name.trim().toLowerCase()
            );
            if (exists) {
                setError("Tên loại địa danh đã tồn tại");
                return;
            }

            await locationTypeService.updateType(editingType.id, {
                name: formData.name.trim(),
            });
            resetForm();
            if (onRefresh) {
                await onRefresh();
            }
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Có lỗi xảy ra khi cập nhật loại địa danh"
            );
        }
    };

    const resetForm = () => {
        setFormData({ name: "" }); // Set empty string instead of undefined
        setEditingType(null);
        setError("");
    };

    const handleEdit = (type) => {
        setEditingType(type);
        setFormData({ name: type.name });
        setError("");
    };

    const handleDeleteClick = (type) => {
        setDeleteDialog({ open: true, type });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.type) return;

        setIsDeleting(true);
        try {
            await locationTypeService.deleteType(deleteDialog.type.id);
            setDeleteDialog({ open: false, type: null });
            if (onRefresh) {
                await onRefresh();
            }
        } catch (error) {
            alert(
                error.response?.data?.message ||
                    "Có lỗi xảy ra khi xóa loại địa danh"
            );
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        if (!isDeleting) {
            setDeleteDialog({ open: false, type: null });
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Quản lý loại địa danh</h2>
                <button className={styles.closeButton} onClick={onClose}>
                    ×
                </button>
            </div>

            <div className={styles.content}>
                <div className={styles.formSection}>
                    <h3>
                        {editingType
                            ? "Sửa loại địa danh"
                            : "Thêm loại địa danh mới"}
                    </h3>
                    <div className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="name">Tên loại địa danh *</label>
                            <input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                placeholder="Nhập tên loại địa danh"
                                className={error ? styles.error : ""}
                            />
                            {error && (
                                <span className={styles.errorText}>
                                    {error}
                                </span>
                            )}
                        </div>

                        <div className={styles.formActions}>
                            {editingType && (
                                <Button
                                    type="button"
                                    onClick={resetForm}
                                    disabled={isLoading}
                                >
                                    Hủy
                                </Button>
                            )}
                            <Button
                                type="button"
                                className="primary"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleSubmit();
                                }}
                                disabled={isLoading}
                            >
                                {isLoading
                                    ? "Đang xử lý..."
                                    : editingType
                                    ? "Cập nhật"
                                    : "Thêm mới"}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className={styles.listSection}>
                    <h3>Danh sách loại địa danh</h3>
                    {locationTypes.length > 0 ? (
                        <div className={styles.typeList}>
                            {locationTypes.map((type) => (
                                <div key={type.id} className={styles.typeItem}>
                                    <span className={styles.typeName}>
                                        {type.name}
                                    </span>
                                    <div className={styles.typeActions}>
                                        <button
                                            onClick={() => handleEdit(type)}
                                            className={styles.editButton}
                                            title="Sửa"
                                        >
                                            ✎
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDeleteClick(type)
                                            }
                                            className={styles.deleteButton}
                                            title="Xóa"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={styles.emptyMessage}>
                            Chưa có loại địa danh nào
                        </p>
                    )}
                </div>
            </div>

            <ConfirmDialog
                open={deleteDialog.open}
                title="Xác nhận xóa"
                message={`Bạn có chắc chắn muốn xóa loại địa danh "${deleteDialog.type?.name}"? Các địa danh thuộc loại này sẽ không còn loại địa danh.`}
                confirmText="Xóa"
                cancelText="Hủy"
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                loading={isDeleting}
                danger={true}
            />
        </div>
    );
};

export default LocationTypeForm;
