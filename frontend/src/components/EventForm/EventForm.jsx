import React, { useEffect, useMemo, useState } from "react";
import { Button, TextEditor } from "@/components";
import periodService from "@/services/periodService";
import locationService from "@/services/locationService";
import figureService from "@/services/figureService";
import uploadService from "@/services/uploadService";
import {
    isBase64Image,
    extractBase64Images,
    replaceBase64WithUrls,
} from "@/utils";
import styles from "./EventForm.module.css";

const defaultValues = {
    name: "",
    description: "",
    summary: "",
    significance: "",
    startDate: "",
    startMonth: "",
    startYear: "",
    endDate: "",
    endMonth: "",
    endYear: "",
    locationId: "",
    periodId: "",
    relatedFigures: [],
};

// Custom searchable select component
const SearchableSelect = ({ value, onChange, options, placeholder, name }) => {
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const filteredOptions = options.filter((opt) =>
        opt.name.toLowerCase().includes(search.toLowerCase())
    );

    const selectedOption = options.find((opt) => opt.id === value);

    const handleSelect = (optionId) => {
        onChange({ target: { name, value: optionId } });
        setIsOpen(false);
        setSearch("");
    };

    return (
        <div className={styles.searchableSelect}>
            <div
                className={styles.selectDisplay}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>
                    {selectedOption ? selectedOption.name : placeholder}
                </span>
                <span className={styles.selectArrow}>▼</span>
            </div>
            {isOpen && (
                <div className={styles.selectDropdown}>
                    <input
                        type="text"
                        className={styles.selectSearch}
                        placeholder="Tìm kiếm..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                    />
                    <div className={styles.selectOptions}>
                        <div
                            className={styles.selectOption}
                            onClick={() => handleSelect("")}
                        >
                            {placeholder}
                        </div>
                        {filteredOptions.map((option) => (
                            <div
                                key={option.id}
                                className={`${styles.selectOption} ${
                                    option.id === value ? styles.selected : ""
                                }`}
                                onClick={() => handleSelect(option.id)}
                            >
                                {option.name}
                            </div>
                        ))}
                        {filteredOptions.length === 0 && (
                            <div className={styles.noResults}>
                                Không tìm thấy kết quả
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const EventForm = ({
    mode = "create",
    initialValues,
    onSubmit,
    onCancel,
    loading = false,
    title,
}) => {
    const [values, setValues] = useState(defaultValues);
    const [errors, setErrors] = useState({});
    const [periods, setPeriods] = useState([]);
    const [locations, setLocations] = useState([]);
    const [figures, setFigures] = useState([]);
    const [selectedFigures, setSelectedFigures] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [figureSearch, setFigureSearch] = useState("");
    const [isFigureModalOpen, setIsFigureModalOpen] = useState(false);

    const isEdit = useMemo(() => mode === "edit", [mode]);

    // Get selected figure objects with details
    const selectedFigureObjects = useMemo(() => {
        return selectedFigures
            .map((id) => figures.find((f) => f.id === id))
            .filter(Boolean);
    }, [selectedFigures, figures]);

    // Filter figures for modal
    const filteredFigures = useMemo(() => {
        return figures.filter(
            (fig) =>
                !selectedFigures.includes(fig.id) &&
                fig.name.toLowerCase().includes(figureSearch.toLowerCase())
        );
    }, [figures, selectedFigures, figureSearch]);

    // Load periods, locations, and figures
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoadingData(true);
                const [periodsRes, locationsRes, figuresRes] =
                    await Promise.all([
                        periodService.getAllPeriods({ limit: 100 }),
                        locationService.getAllLocations({ limit: 1000 }),
                        figureService.getAllFigures({ limit: 1000 }),
                    ]);

                if (periodsRes?.success) {
                    setPeriods(periodsRes.data || []);
                }
                if (locationsRes?.success) {
                    setLocations(locationsRes.data || []);
                }
                if (figuresRes?.success) {
                    setFigures(figuresRes.data || []);
                }
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoadingData(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        if (initialValues) {
            const {
                name,
                description,
                summary,
                significance,
                startDate,
                startMonth,
                startYear,
                endDate,
                endMonth,
                endYear,
                locationId,
                periodId,
                related_figures,
            } = initialValues;

            setValues({
                name: name || "",
                description: description || "",
                summary: summary || "",
                significance: significance || "",
                startDate: startDate || "",
                startMonth: startMonth || "",
                startYear: startYear || "",
                endDate: endDate || "",
                endMonth: endMonth || "",
                endYear: endYear || "",
                locationId: locationId || "",
                periodId: periodId || "",
            });

            if (related_figures && Array.isArray(related_figures)) {
                setSelectedFigures(related_figures.map((f) => f.id));
            }
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

    const handleOpenFigureModal = () => {
        setIsFigureModalOpen(true);
        setFigureSearch("");
    };

    const handleCloseFigureModal = () => {
        setIsFigureModalOpen(false);
        setFigureSearch("");
    };

    const handleAddFigure = (figureId) => {
        if (figureId && !selectedFigures.includes(figureId)) {
            setSelectedFigures((prev) => [...prev, figureId]);
        }
    };

    const handleRemoveFigure = (figureId) => {
        setSelectedFigures((prev) => prev.filter((id) => id !== figureId));
    };

    const validate = () => {
        const next = {};
        if (!values.name.trim()) {
            next.name = "Vui lòng nhập tên sự kiện";
        }
        if (!values.startYear) {
            next.startYear = "Vui lòng nhập năm bắt đầu";
        } else if (isNaN(values.startYear)) {
            next.startYear = "Năm bắt đầu phải là số";
        }
        if (!values.summary.trim()) {
            next.summary = "Vui lòng nhập tóm tắt";
        }
        if (!values.description.trim()) {
            next.description = "Vui lòng nhập mô tả chi tiết";
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            // Upload ảnh từ description, summary và significance
            let processedDescription = values.description;
            let processedSummary = values.summary;
            let processedSignificance = values.significance;

            // Extract và upload ảnh từ description
            const base64ImagesInDescription = extractBase64Images(values.description);
            if (base64ImagesInDescription.length > 0) {
                const replacementMap = {};
                for (const base64Image of base64ImagesInDescription) {
                    try {
                        const uploadResponse = await uploadService.uploadImage(
                            base64Image,
                            "events"
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
                            "events"
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

            // Extract và upload ảnh từ significance
            if (values.significance) {
                const base64ImagesInSignificance = extractBase64Images(values.significance);
                if (base64ImagesInSignificance.length > 0) {
                    const replacementMap = {};
                    for (const base64Image of base64ImagesInSignificance) {
                        try {
                            const uploadResponse = await uploadService.uploadImage(
                                base64Image,
                                "events"
                            );
                            if (uploadResponse.success) {
                                replacementMap[base64Image] = uploadResponse.data.url;
                            }
                        } catch (imgError) {
                            console.error("Failed to upload significance image:", imgError);
                        }
                    }
                    processedSignificance = replaceBase64WithUrls(values.significance, replacementMap);
                }
            }

            const formData = {
                name: values.name,
                description: processedDescription,
                summary: processedSummary,
                significance: processedSignificance || null,
                start_date: values.startDate ? Number(values.startDate) : null,
                start_month: values.startMonth ? Number(values.startMonth) : null,
                start_year: Number(values.startYear),
                end_date: values.endDate ? Number(values.endDate) : null,
                end_month: values.endMonth ? Number(values.endMonth) : null,
                end_year: values.endYear ? Number(values.endYear) : null,
                location_id: values.locationId || null,
                period_id: values.periodId || null,
                related_figures: selectedFigures,
            };

            await onSubmit(formData);
        } catch (error) {
            console.error("Error processing form:", error);
            alert("Có lỗi xảy ra khi xử lý form");
        }
    };

    if (loadingData) {
        return (
            <div className={styles.form}>
                <div className={styles.loading}>Đang tải dữ liệu...</div>
            </div>
        );
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            {title && <h2 className={styles.formTitle}>{title}</h2>}

            <div className={styles.formGroup}>
                <label htmlFor="name">Tên sự kiện *</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    placeholder="Nhập tên sự kiện"
                />
                {errors.name && (
                    <span className={styles.errorText}>{errors.name}</span>
                )}
            </div>

            <div className={styles.dateGrid}>
                <div className={styles.formGroup}>
                    <label htmlFor="startDate">Ngày bắt đầu</label>
                    <input
                        type="number"
                        id="startDate"
                        name="startDate"
                        value={values.startDate}
                        onChange={handleChange}
                        placeholder="Ngày (1-31)"
                        min="1"
                        max="31"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="startMonth">Tháng bắt đầu</label>
                    <input
                        type="number"
                        id="startMonth"
                        name="startMonth"
                        value={values.startMonth}
                        onChange={handleChange}
                        placeholder="Tháng (1-12)"
                        min="1"
                        max="12"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="startYear">Năm bắt đầu *</label>
                    <input
                        type="number"
                        id="startYear"
                        name="startYear"
                        value={values.startYear}
                        onChange={handleChange}
                        placeholder="Năm"
                    />
                    {errors.startYear && (
                        <span className={styles.errorText}>
                            {errors.startYear}
                        </span>
                    )}
                </div>
            </div>

            <div className={styles.dateGrid}>
                <div className={styles.formGroup}>
                    <label htmlFor="endDate">Ngày kết thúc</label>
                    <input
                        type="number"
                        id="endDate"
                        name="endDate"
                        value={values.endDate}
                        onChange={handleChange}
                        placeholder="Ngày (1-31)"
                        min="1"
                        max="31"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="endMonth">Tháng kết thúc</label>
                    <input
                        type="number"
                        id="endMonth"
                        name="endMonth"
                        value={values.endMonth}
                        onChange={handleChange}
                        placeholder="Tháng (1-12)"
                        min="1"
                        max="12"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="endYear">Năm kết thúc</label>
                    <input
                        type="number"
                        id="endYear"
                        name="endYear"
                        value={values.endYear}
                        onChange={handleChange}
                        placeholder="Năm"
                    />
                </div>
            </div>

            <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <label htmlFor="periodId">Thời kỳ</label>
                    <SearchableSelect
                        name="periodId"
                        value={values.periodId}
                        onChange={handleChange}
                        options={periods}
                        placeholder="-- Chọn thời kỳ --"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="locationId">Địa danh</label>
                    <SearchableSelect
                        name="locationId"
                        value={values.locationId}
                        onChange={handleChange}
                        options={locations}
                        placeholder="-- Chọn địa danh --"
                    />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="summary">Tóm tắt *</label>
                <TextEditor
                    value={values.summary}
                    onChange={handleEditorChange}
                    name="summary"
                />
                {errors.summary && (
                    <span className={styles.errorText}>{errors.summary}</span>
                )}
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="description">Mô tả chi tiết *</label>
                <TextEditor
                    value={values.description}
                    onChange={handleEditorChange}
                    name="description"
                    type="rich"
                />
                {errors.description && (
                    <span className={styles.errorText}>
                        {errors.description}
                    </span>
                )}
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="significance">Ý nghĩa lịch sử</label>
                <TextEditor
                    value={values.significance}
                    onChange={handleEditorChange}
                    name="significance"
                    type="rich"
                />
            </div>

            <div className={styles.formGroup}>
                <label>Nhân vật liên quan</label>
                <div className={styles.figureTagsContainer}>
                    <div className={styles.figureTagsWrapper}>
                        {selectedFigureObjects.map((figure) => (
                            <div key={figure.id} className={styles.figureTag}>
                                <span>{figure.name}</span>
                                <button
                                    type="button"
                                    className={styles.removeButton}
                                    onClick={() =>
                                        handleRemoveFigure(figure.id)
                                    }
                                    title="Xóa"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            className={styles.addFigureButton}
                            onClick={handleOpenFigureModal}
                        >
                            + Thêm nhân vật
                        </button>
                    </div>
                    {selectedFigureObjects.length === 0 && (
                        <p className={styles.emptyHint}>
                            Nhấn nút "Thêm nhân vật" để chọn nhân vật liên quan
                        </p>
                    )}
                </div>
            </div>

            {/* Figure Selection Modal */}
            {isFigureModalOpen && (
                <div
                    className={styles.modalOverlay}
                    onClick={handleCloseFigureModal}
                >
                    <div
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.modalHeader}>
                            <h3>Chọn nhân vật liên quan</h3>
                            <button
                                type="button"
                                className={styles.modalCloseButton}
                                onClick={handleCloseFigureModal}
                            >
                                ×
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <input
                                type="text"
                                className={styles.modalSearchInput}
                                placeholder="Tìm kiếm nhân vật..."
                                value={figureSearch}
                                onChange={(e) =>
                                    setFigureSearch(e.target.value)
                                }
                                autoFocus
                            />
                            <div className={styles.figureList}>
                                {filteredFigures.length === 0 ? (
                                    <p className={styles.emptyText}>
                                        {figureSearch
                                            ? "Không tìm thấy nhân vật nào"
                                            : "Tất cả nhân vật đã được chọn"}
                                    </p>
                                ) : (
                                    filteredFigures.map((figure) => (
                                        <div
                                            key={figure.id}
                                            className={styles.figureItem}
                                            onClick={() => {
                                                handleAddFigure(figure.id);
                                                handleCloseFigureModal();
                                            }}
                                        >
                                            <span className={styles.figureName}>
                                                {figure.name}
                                            </span>
                                            {figure.title && (
                                                <span
                                                    className={
                                                        styles.figureTitle
                                                    }
                                                >
                                                    {figure.title}
                                                </span>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

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

export default EventForm;
