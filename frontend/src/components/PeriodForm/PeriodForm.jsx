import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components";
import { TextEditor } from "@/components";
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

        const formData = {
            name: values.name,
            description: values.description,
            summary: values.summary,
            start_year: Number(values.start_year),
            end_year: Number(values.end_year),
        };

        await onSubmit(formData);
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            {title && <h2 className={styles.title}>{title}</h2>}

            <div className={styles.formGroup}>
                <label htmlFor="name">Tên thời kỳ</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    placeholder="Nhập tên thời kỳ"
                />
                {errors.name && (
                    <span className={styles.error}>{errors.name}</span>
                )}
            </div>

            <div className={styles.yearInputs}>
                <div className={styles.formGroup}>
                    <label htmlFor="start_year">Năm bắt đầu</label>
                    <input
                        type="number"
                        id="start_year"
                        name="start_year"
                        value={values.start_year}
                        onChange={handleChange}
                        placeholder="Nhập năm bắt đầu"
                    />
                    {errors.start_year && (
                        <span className={styles.error}>
                            {errors.start_year}
                        </span>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="end_year">Năm kết thúc</label>
                    <input
                        type="number"
                        id="end_year"
                        name="end_year"
                        value={values.end_year}
                        onChange={handleChange}
                        placeholder="Nhập năm kết thúc"
                    />
                    {errors.end_year && (
                        <span className={styles.error}>{errors.end_year}</span>
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
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Hủy
                </Button>
                <Button type="submit" loading={loading}>
                    {isEdit ? "Cập nhật" : "Thêm mới"}
                </Button>
            </div>
        </form>
    );
};

export default PeriodForm;
