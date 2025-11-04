import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TextEditor, Button } from "@/components";
import { LocationTypeForm } from "@/components";
import locationTypeService from "@/services/locationTypeService";
import styles from "./LocationForm.module.css";

const LocationForm = ({
    mode = "create",
    initialData,
    onSubmit,
    onCancel,
    isLoading,
    title,
}) => {
    const [formData, setFormData] = useState({
        name: "",
        ancient_name: "",
        modern_name: "",
        description: "",
        detail: "",
        latitude: "",
        longitude: "",
        location_type: "",
        custom_type: "",
        ...initialData,
    });

    const [errors, setErrors] = useState({});
    const [locationTypes, setLocationTypes] = useState([]);
    const [isTypeFormOpen, setIsTypeFormOpen] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [isCustomType, setIsCustomType] = useState(false);
    const [isLoadingTypes, setIsLoadingTypes] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                ancient_name: initialData.ancient_name || "",
                modern_name: initialData.modern_name || "",
                description: initialData.description || "",
                detail: initialData.detail || "",
                latitude: initialData.latitude || "",
                longitude: initialData.longitude || "",
                location_type: initialData.location_type || "",
                custom_type: "",
            });
        }
    }, [initialData]);

    // Load location types
    useEffect(() => {
        const loadLocationTypes = async () => {
            setIsLoadingTypes(true);
            try {
                const response = await locationTypeService.getAllTypes();
                if (response?.success) {
                    setLocationTypes(response.data || []);
                } else {
                    console.error(
                        "Không thể tải danh sách loại địa danh:",
                        response?.message
                    );
                    setLocationTypes([]);
                }
            } catch (error) {
                console.error("Lỗi khi tải danh sách loại địa danh:", error);
                setLocationTypes([]);
            } finally {
                setIsLoadingTypes(false);
            }
        };
        loadLocationTypes();
    }, [isTypeFormOpen]); // Thêm isTypeFormOpen để load lại sau khi thêm/sửa/xóa

    const handleTypeChange = (e) => {
        const value = e.target.value;
        if (value === "other") {
            setIsCustomType(true);
            setFormData((prev) => ({
                ...prev,
                location_type: "",
                custom_type: "",
            }));
        } else {
            setIsCustomType(false);
            setFormData((prev) => ({
                ...prev,
                location_type: value,
                custom_type: "",
            }));
        }
    };

    const handleCustomTypeChange = (e) => {
        setFormData((prev) => ({ ...prev, custom_type: e.target.value }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Tên địa danh không được để trống";
        }

        if (
            formData.latitude &&
            (isNaN(formData.latitude) ||
                formData.latitude < -90 ||
                formData.latitude > 90)
        ) {
            newErrors.latitude = "Vĩ độ phải là số từ -90 đến 90";
        }

        if (
            formData.longitude &&
            (isNaN(formData.longitude) ||
                formData.longitude < -180 ||
                formData.longitude > 180)
        ) {
            newErrors.longitude = "Kinh độ phải là số từ -180 đến 180";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDescriptionChange = (e) => {
        // TextEditor returns an event object with target.value
        const value = typeof e === "string" ? e : e.target?.value || "";
        setFormData((prev) => ({
            ...prev,
            description: value,
        }));
    };

    const handleDetailChange = (e) => {
        // TextEditor returns an event object with target.value
        const value = typeof e === "string" ? e : e.target?.value || "";
        setFormData((prev) => ({
            ...prev,
            detail: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            {title && <h2 className={styles.formTitle}>{title}</h2>}
            <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <label htmlFor="name">Tên địa danh *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Nhập tên địa danh"
                        className={errors.name ? styles.error : ""}
                    />
                    {errors.name && (
                        <span className={styles.errorText}>{errors.name}</span>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="ancient_name">Tên cổ</label>
                    <input
                        type="text"
                        id="ancient_name"
                        name="ancient_name"
                        value={formData.ancient_name}
                        onChange={handleInputChange}
                        placeholder="Nhập tên cổ của địa danh"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="modern_name">Tên hiện đại</label>
                    <input
                        type="text"
                        id="modern_name"
                        name="modern_name"
                        value={formData.modern_name}
                        onChange={handleInputChange}
                        placeholder="Nhập tên hiện đại của địa danh"
                    />
                </div>

                <div className={styles.formGroup}>
                    <div className={styles.typeHeader}>
                        <label htmlFor="location_type">Loại địa danh</label>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setSelectedType(null);
                                setIsTypeFormOpen(true);
                            }}
                        >
                            Quản lý loại
                        </Button>
                    </div>
                    <div className={styles.typeInputGroup}>
                        <select
                            id="location_type"
                            name="location_type"
                            value={
                                isCustomType ? "other" : formData.location_type
                            }
                            onChange={handleTypeChange}
                            disabled={isLoadingTypes}
                        >
                            <option value="">
                                {isLoadingTypes
                                    ? "Đang tải..."
                                    : "Chọn loại địa danh"}
                            </option>
                            {!isLoadingTypes && locationTypes.length > 0 ? (
                                locationTypes.map((type) => (
                                    <option key={type.id} value={type.name}>
                                        {type.name}
                                    </option>
                                ))
                            ) : !isLoadingTypes ? (
                                <option value="" disabled>
                                    Chưa có loại địa danh nào
                                </option>
                            ) : null}
                            <option value="other">Thêm loại mới</option>
                        </select>
                        {isCustomType && (
                            <input
                                type="text"
                                value={formData.custom_type}
                                onChange={handleCustomTypeChange}
                                placeholder="Nhập loại địa danh mới"
                                className={styles.customTypeInput}
                            />
                        )}
                    </div>
                </div>

                {isTypeFormOpen && (
                    <div className={styles.modalOverlay}>
                        <LocationTypeForm
                            onClose={() => {
                                setIsTypeFormOpen(false);
                                setSelectedType(null);
                            }}
                            initialData={selectedType}
                            locationTypes={locationTypes}
                            onRefresh={async () => {
                                // Reload location types after any change
                                setIsLoadingTypes(true);
                                try {
                                    const response =
                                        await locationTypeService.getAllTypes();
                                    if (response?.success) {
                                        setLocationTypes(response.data || []);
                                    }
                                } catch (error) {
                                    console.error(
                                        "Lỗi khi tải lại danh sách loại địa danh:",
                                        error
                                    );
                                }
                                setIsLoadingTypes(false);
                            }}
                        />
                    </div>
                )}

                <div className={styles.formGroup}>
                    <label htmlFor="latitude">Vĩ độ</label>
                    <input
                        type="text"
                        id="latitude"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleInputChange}
                        placeholder="Nhập vĩ độ (ví dụ: 21.0285)"
                        className={errors.latitude ? styles.error : ""}
                    />
                    {errors.latitude && (
                        <span className={styles.errorText}>
                            {errors.latitude}
                        </span>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="longitude">Kinh độ</label>
                    <input
                        type="text"
                        id="longitude"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleInputChange}
                        placeholder="Nhập kinh độ (ví dụ: 105.8542)"
                        className={errors.longitude ? styles.error : ""}
                    />
                    {errors.longitude && (
                        <span className={styles.errorText}>
                            {errors.longitude}
                        </span>
                    )}
                </div>
            </div>

            <div className={styles.editorSection}>
                <label>Mô tả</label>
                <TextEditor
                    content={formData.description}
                    onChange={handleDescriptionChange}
                    placeholder="Nhập mô tả về địa danh..."
                />
            </div>

            <div className={styles.editorSection}>
                <label>Chi tiết</label>
                <TextEditor
                    content={formData.detail}
                    onChange={handleDetailChange}
                    placeholder="Nhập thông tin chi tiết về địa danh..."
                />
            </div>

            <div className={styles.formActions}>
                <Button type="button" variant="cancel" onClick={onCancel}>
                    Hủy
                </Button>
                <Button type="submit" variant="submit" disabled={isLoading}>
                    {isLoading
                        ? "Đang xử lý..."
                        : initialData
                        ? "Cập nhật"
                        : "Tạo mới"}
                </Button>
            </div>
        </form>
    );
};

export default LocationForm;
