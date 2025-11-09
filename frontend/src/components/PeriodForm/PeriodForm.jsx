import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components";
import { TextEditor } from "@/components";
import uploadService from "@/services/uploadService";
import {
    isBase64Image,
    extractBase64Images,
    replaceBase64WithUrls,
} from "@/utils";
import styles from "./PeriodForm.module.css";

const defaultValues = {
    name: "",
    description: "",
    summary: "",
    start_year: "",
    end_year: "",
};

const PeriodForm = ({
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
            const { name, description, summary, start_year, end_year } =
                initialValues;

            setValues((prev) => ({
                ...prev,
                name: name || "",
                description: description || "",
                summary: summary || "",
                start_year: start_year || "",
                end_year: end_year || "",
            }));
        }
    }, [initialValues]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    };

    const handleEditorChange = (e) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    };

    const validate = () => {
        const next = {};
        if (!values.name.trim()) {
            next.name = "Vui lòng nhập tên thời kỳ";
        }
        if (!values.start_year) {
            next.start_year = "Vui lòng nhập năm bắt đầu";
        } else if (isNaN(values.start_year)) {
            next.start_year = "Năm bắt đầu phải là số";
        }
        if (!values.end_year) {
            next.end_year = "Vui lòng nhập năm kết thúc";
        } else if (isNaN(values.end_year)) {
            next.end_year = "Năm kết thúc phải là số";
        } else if (Number(values.end_year) < Number(values.start_year)) {
            next.end_year = "Năm kết thúc phải lớn hơn năm bắt đầu";
        }
        if (!values.summary.trim()) {
            next.summary = "Vui lòng nhập tóm tắt";
        }
        if (!values.description.trim()) {
            next.description = "Vui lòng nhập mô tả";
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            // Upload ảnh từ description và summary
            let processedDescription = values.description;
            let processedSummary = values.summary;

            // Extract và upload ảnh từ description
            const base64ImagesInDescription = extractBase64Images(values.description);
            if (base64ImagesInDescription.length > 0) {
                const replacementMap = {};
                for (const base64Image of base64ImagesInDescription) {
                    try {
                        const uploadResponse = await uploadService.uploadImage(
                            base64Image,
                            "periods"
                        );
                        if (uploadResponse.success) {
                            replacementMap[base64Image] = uploadResponse.data.url;
                        }
                    } catch (imgError) {
                        console.error("Failed to upload description image:", imgError);
                    }
                }
                processedDescription = replaceBase64WithUrls(values.description, replacementMap);
            }

            // Extract và upload ảnh từ summary
            const base64ImagesInSummary = extractBase64Images(values.summary);
            if (base64ImagesInSummary.length > 0) {
                const replacementMap = {};
                for (const base64Image of base64ImagesInSummary) {
                    try {
                        const uploadResponse = await uploadService.uploadImage(
                            base64Image,
                            "periods"
                        );
                        if (uploadResponse.success) {
                            replacementMap[base64Image] = uploadResponse.data.url;
                        }
                    } catch (imgError) {
                        console.error("Failed to upload summary image:", imgError);
                    }
                }
                processedSummary = replaceBase64WithUrls(values.summary, replacementMap);
            }

            const formData = {
                name: values.name,
                description: processedDescription,
                summary: processedSummary,
                start_year: Number(values.start_year),
                end_year: Number(values.end_year),
            };

            await onSubmit(formData);
        } catch (error) {
            console.error("Error processing form:", error);
            alert("Có lỗi xảy ra khi xử lý form");
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            {title && <h2 className={styles.formTitle}>{title}</h2>}

            <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <label htmlFor="name">Tên thời kỳ *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        placeholder="Nhập tên thời kỳ"
                    />
                    {errors.name && (
                        <span className={styles.errorText}>{errors.name}</span>
                    )}
                </div>
            </div>

            <div className={styles.yearInputs}>
                <div className={styles.formGroup}>
                    <label htmlFor="start_year">Năm bắt đầu *</label>
                    <input
                        type="number"
                        id="start_year"
                        name="start_year"
                        value={values.start_year}
                        onChange={handleChange}
                        placeholder="Nhập năm bắt đầu"
                    />
                    {errors.start_year && (
                        <span className={styles.errorText}>
                            {errors.start_year}
                        </span>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="end_year">Năm kết thúc *</label>
                    <input
                        type="number"
                        id="end_year"
                        name="end_year"
                        value={values.end_year}
                        onChange={handleChange}
                        placeholder="Nhập năm kết thúc"
                    />
                    {errors.end_year && (
                        <span className={styles.errorText}>
                            {errors.end_year}
                        </span>
                    )}
                </div>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="summary">Tóm tắt</label>
                <TextEditor
                    value={values.summary}
                    onChange={handleEditorChange}
                    name="summary"
                />
                {errors.summary && (
                    <span className={styles.error}>{errors.summary}</span>
                )}
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="description">Mô tả chi tiết</label>
                <TextEditor
                    value={values.description}
                    onChange={handleEditorChange}
                    name="description"
                    type="rich"
                />
                {errors.description && (
                    <span className={styles.error}>{errors.description}</span>
                )}
            </div>

            <div className={styles.actions}>
                <Button
                    type="button"
                    variant="cancel"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Hủy
                </Button>
                <Button type="submit" variant="submit" loading={loading}>
                    {isEdit ? "Cập nhật" : "Thêm mới"}
                </Button>
            </div>
        </form>
    );
};

export default PeriodForm;
