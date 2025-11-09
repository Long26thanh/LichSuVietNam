import React, { useEffect, useState } from "react";
import { Button, TextEditor } from "@/components";
import periodService from "@/services/periodService";
import locationService from "@/services/locationService";
import uploadService from "@/services/uploadService";
import {
    isBase64Image,
    extractBase64Images,
    replaceBase64WithUrls,
} from "@/utils";
import styles from "./FigureForm.module.css";

const defaultValues = {
    name: "",
    birth_date: "",
    birth_month: "",
    birth_year: "",
    death_date: "",
    death_month: "",
    death_year: "",
    title: "",
    period_id: "",
    birth_place_id: "",
    death_place_id: "",
    biography: "",
    achievements: "",
};

const FigureForm = ({
    mode = "create", // "create" | "edit"
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    title,
}) => {
    const [formData, setFormData] = useState(defaultValues);
    const [errors, setErrors] = useState({});
    const [periods, setPeriods] = useState([]);
    const [locations, setLocations] = useState([]);
    const [isLoadingPeriods, setIsLoadingPeriods] = useState(false);
    const [isLoadingLocations, setIsLoadingLocations] = useState(false);

    // Load periods
    useEffect(() => {
        const loadPeriods = async () => {
            setIsLoadingPeriods(true);
            try {
                const response = await periodService.getAllPeriods();
                if (response?.success) {
                    setPeriods(response.data || []);
                } else {
                    console.error("Không thể tải danh sách thời kỳ");
                    setPeriods([]);
                }
            } catch (error) {
                console.error("Lỗi khi tải danh sách thời kỳ:", error);
                setPeriods([]);
            } finally {
                setIsLoadingPeriods(false);
            }
        };
        loadPeriods();
    }, []);

    // Load locations
    useEffect(() => {
        const loadLocations = async () => {
            setIsLoadingLocations(true);
            try {
                const response = await locationService.getAllLocations({
                    limit: 1000,
                });
                if (response?.success) {
                    setLocations(response.data || []);
                } else {
                    console.error("Không thể tải danh sách địa điểm");
                    setLocations([]);
                }
            } catch (error) {
                console.error("Lỗi khi tải danh sách địa điểm:", error);
                setLocations([]);
            } finally {
                setIsLoadingLocations(false);
            }
        };
        loadLocations();
    }, []);

    // Initialize form data
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                birth_date: initialData.birth_date || "",
                birth_month: initialData.birth_month || "",
                birth_year: initialData.birth_year || "",
                death_date: initialData.death_date || "",
                death_month: initialData.death_month || "",
                death_year: initialData.death_year || "",
                title: initialData.title || "",
                period_id: initialData.period_id || "",
                birth_place_id: initialData.birth_place_id || "",
                death_place_id: initialData.death_place_id || "",
                biography: initialData.biography || "",
                achievements: initialData.achievements || "",
            });
        }
    }, [initialData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleBiographyChange = (e) => {
        // TextEditor returns an event object with target.value
        const value = typeof e === "string" ? e : e.target?.value || "";
        setFormData((prev) => ({
            ...prev,
            biography: value,
        }));
        if (errors.biography) {
            setErrors((prev) => ({ ...prev, biography: "" }));
        }
    };

    const handleAchievementsChange = (e) => {
        // TextEditor returns an event object with target.value
        const value = typeof e === "string" ? e : e.target?.value || "";
        setFormData((prev) => ({
            ...prev,
            achievements: value,
        }));
        if (errors.achievements) {
            setErrors((prev) => ({ ...prev, achievements: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Tên nhân vật không được để trống";
        }

        // Validate birth date
        if (
            formData.birth_date &&
            (isNaN(formData.birth_date) ||
                formData.birth_date < 1 ||
                formData.birth_date > 31)
        ) {
            newErrors.birth_date = "Ngày sinh phải từ 1-31";
        }

        if (
            formData.birth_month &&
            (isNaN(formData.birth_month) ||
                formData.birth_month < 1 ||
                formData.birth_month > 12)
        ) {
            newErrors.birth_month = "Tháng sinh phải từ 1-12";
        }

        // Validate death date
        if (
            formData.death_date &&
            (isNaN(formData.death_date) ||
                formData.death_date < 1 ||
                formData.death_date > 31)
        ) {
            newErrors.death_date = "Ngày mất phải từ 1-31";
        }

        if (
            formData.death_month &&
            (isNaN(formData.death_month) ||
                formData.death_month < 1 ||
                formData.death_month > 12)
        ) {
            newErrors.death_month = "Tháng mất phải từ 1-12";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            // Upload ảnh từ biography và achievements
            let processedBiography = formData.biography;
            let processedAchievements = formData.achievements;

            // Extract và upload ảnh từ biography
            const base64ImagesInBiography = extractBase64Images(formData.biography);
            if (base64ImagesInBiography.length > 0) {
                const replacementMap = {};
                for (const base64Image of base64ImagesInBiography) {
                    try {
                        const uploadResponse = await uploadService.uploadImage(
                            base64Image,
                            "figures"
                        );
                        if (uploadResponse.success) {
                            replacementMap[base64Image] = uploadResponse.data.url;
                        }
                    } catch (imgError) {
                        console.error("Failed to upload biography image:", imgError);
                    }
                }
                processedBiography = replaceBase64WithUrls(formData.biography, replacementMap);
            }

            // Extract và upload ảnh từ achievements
            const base64ImagesInAchievements = extractBase64Images(formData.achievements);
            if (base64ImagesInAchievements.length > 0) {
                const replacementMap = {};
                for (const base64Image of base64ImagesInAchievements) {
                    try {
                        const uploadResponse = await uploadService.uploadImage(
                            base64Image,
                            "figures"
                        );
                        if (uploadResponse.success) {
                            replacementMap[base64Image] = uploadResponse.data.url;
                        }
                    } catch (imgError) {
                        console.error("Failed to upload achievements image:", imgError);
                    }
                }
                processedAchievements = replaceBase64WithUrls(formData.achievements, replacementMap);
            }

            const submitData = {
                name: formData.name,
                birth_date: formData.birth_date
                    ? parseInt(formData.birth_date)
                    : null,
                birth_month: formData.birth_month
                    ? parseInt(formData.birth_month)
                    : null,
                birth_year: formData.birth_year
                    ? parseInt(formData.birth_year)
                    : null,
                death_date: formData.death_date
                    ? parseInt(formData.death_date)
                    : null,
                death_month: formData.death_month
                    ? parseInt(formData.death_month)
                    : null,
                death_year: formData.death_year
                    ? parseInt(formData.death_year)
                    : null,
                title: formData.title,
                period_id: formData.period_id || null,
                birth_place_id: formData.birth_place_id || null,
                death_place_id: formData.death_place_id || null,
                biography: processedBiography,
                achievements: processedAchievements,
            };

            await onSubmit(submitData);
        } catch (error) {
            console.error("Error processing form:", error);
            alert("Có lỗi xảy ra khi xử lý form");
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            {title && <h2 className={styles.formTitle}>{title}</h2>}

            <div className={styles.formContent}>
                {/* Basic Information */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Thông tin cơ bản</h3>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            Tên nhân vật{" "}
                            <span className={styles.required}>*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`${styles.input} ${
                                errors.name ? styles.inputError : ""
                            }`}
                            placeholder="Nhập tên nhân vật"
                        />
                        {errors.name && (
                            <span className={styles.errorText}>
                                {errors.name}
                            </span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Chức danh</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className={styles.input}
                            placeholder="Ví dụ: Vua, Tướng, Nhà thơ, Nhà văn..."
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Thời kỳ</label>
                        <select
                            name="period_id"
                            value={formData.period_id}
                            onChange={handleInputChange}
                            className={styles.select}
                            disabled={isLoadingPeriods}
                        >
                            <option value="">-- Chọn thời kỳ --</option>
                            {periods.map((period) => (
                                <option key={period.id} value={period.id}>
                                    {period.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Birth Information */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Thông tin sinh</h3>

                    <div className={styles.dateRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Ngày sinh</label>
                            <input
                                type="number"
                                name="birth_date"
                                value={formData.birth_date}
                                onChange={handleInputChange}
                                className={`${styles.input} ${
                                    errors.birth_date ? styles.inputError : ""
                                }`}
                                placeholder="Ngày (1-31)"
                                min="1"
                                max="31"
                            />
                            {errors.birth_date && (
                                <span className={styles.errorText}>
                                    {errors.birth_date}
                                </span>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Tháng sinh</label>
                            <input
                                type="number"
                                name="birth_month"
                                value={formData.birth_month}
                                onChange={handleInputChange}
                                className={`${styles.input} ${
                                    errors.birth_month ? styles.inputError : ""
                                }`}
                                placeholder="Tháng (1-12)"
                                min="1"
                                max="12"
                            />
                            {errors.birth_month && (
                                <span className={styles.errorText}>
                                    {errors.birth_month}
                                </span>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Năm sinh</label>
                            <input
                                type="number"
                                name="birth_year"
                                value={formData.birth_year}
                                onChange={handleInputChange}
                                className={styles.input}
                                placeholder="Năm"
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Nơi sinh</label>
                        <select
                            name="birth_place_id"
                            value={formData.birth_place_id}
                            onChange={handleInputChange}
                            className={styles.select}
                            disabled={isLoadingLocations}
                        >
                            <option value="">-- Chọn nơi sinh --</option>
                            {locations.map((location) => (
                                <option key={location.id} value={location.id}>
                                    {location.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Death Information */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Thông tin mất</h3>

                    <div className={styles.dateRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Ngày mất</label>
                            <input
                                type="number"
                                name="death_date"
                                value={formData.death_date}
                                onChange={handleInputChange}
                                className={`${styles.input} ${
                                    errors.death_date ? styles.inputError : ""
                                }`}
                                placeholder="Ngày (1-31)"
                                min="1"
                                max="31"
                            />
                            {errors.death_date && (
                                <span className={styles.errorText}>
                                    {errors.death_date}
                                </span>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Tháng mất</label>
                            <input
                                type="number"
                                name="death_month"
                                value={formData.death_month}
                                onChange={handleInputChange}
                                className={`${styles.input} ${
                                    errors.death_month ? styles.inputError : ""
                                }`}
                                placeholder="Tháng (1-12)"
                                min="1"
                                max="12"
                            />
                            {errors.death_month && (
                                <span className={styles.errorText}>
                                    {errors.death_month}
                                </span>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Năm mất</label>
                            <input
                                type="number"
                                name="death_year"
                                value={formData.death_year}
                                onChange={handleInputChange}
                                className={styles.input}
                                placeholder="Năm"
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Nơi mất</label>
                        <select
                            name="death_place_id"
                            value={formData.death_place_id}
                            onChange={handleInputChange}
                            className={styles.select}
                            disabled={isLoadingLocations}
                        >
                            <option value="">-- Chọn nơi mất --</option>
                            {locations.map((location) => (
                                <option key={location.id} value={location.id}>
                                    {location.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Biography */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Tiểu sử</h3>
                    <div className={styles.formGroup}>
                        <TextEditor
                        type="rich"
                            value={formData.biography}
                            onChange={handleBiographyChange}
                            placeholder="Nhập tiểu sử của nhân vật..."
                        />
                        {errors.biography && (
                            <span className={styles.errorText}>
                                {errors.biography}
                            </span>
                        )}
                    </div>
                </div>

                {/* Achievements */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Thành tựu</h3>
                    <div className={styles.formGroup}>
                        <TextEditor
                            value={formData.achievements}
                            onChange={handleAchievementsChange}
                            placeholder="Nhập các thành tựu của nhân vật..."
                        />
                        {errors.achievements && (
                            <span className={styles.errorText}>
                                {errors.achievements}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Form Actions */}
            <div className={styles.formActions}>
                <Button
                    type="button"
                    variant="cancel"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Hủy
                </Button>
                <Button type="submit" variant="submit" disabled={isLoading}>
                    {isLoading
                        ? "Đang xử lý..."
                        : mode === "edit"
                        ? "Cập nhật"
                        : "Tạo mới"}
                </Button>
            </div>
        </form>
    );
};

export default FigureForm;
