import React, { useState, useEffect } from "react";
import { Button, TextEditor, ImageUpload } from "@/components";
import { useAuth } from "@/contexts/AuthContext";
import figureService from "@/services/figureService";
import periodService from "@/services/periodService";
import eventService from "@/services/eventService";
import locationService from "@/services/locationService";
import uploadService from "@/services/uploadService";
import {
    isBase64Image,
    extractBase64Images,
    replaceBase64WithUrls,
} from "@/utils";
import styles from "./ArticleForm.module.css";

// Searchable Select Component
const SearchableSelect = ({ value, onChange, options, placeholder, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredOptions = options.filter((option) =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedOption = options.find((opt) => opt.id === value);

    return (
        <div className={styles.searchableSelect}>
            {label && <label className={styles.label}>{label}</label>}
            <div className={styles.selectWrapper}>
                <div
                    className={styles.selectInput}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span>
                        {selectedOption ? selectedOption.name : placeholder}
                    </span>
                    <span className={styles.arrow}>{isOpen ? "▲" : "▼"}</span>
                </div>
                {isOpen && (
                    <div className={styles.dropdown}>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <div className={styles.optionsList}>
                            <div
                                className={styles.option}
                                onClick={() => {
                                    onChange(null);
                                    setIsOpen(false);
                                    setSearchTerm("");
                                }}
                            >
                                -- Không chọn --
                            </div>
                            {filteredOptions.map((option) => (
                                <div
                                    key={option.id}
                                    className={`${styles.option} ${
                                        value === option.id
                                            ? styles.selected
                                            : ""
                                    }`}
                                    onClick={() => {
                                        onChange(option.id);
                                        setIsOpen(false);
                                        setSearchTerm("");
                                    }}
                                >
                                    {option.name}
                                </div>
                            ))}
                            {filteredOptions.length === 0 && (
                                <div className={styles.noOptions}>
                                    Không tìm thấy kết quả
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ArticleForm = ({
    title = "Thêm bài viết mới",
    mode = "create",
    initialValues = null,
    onSubmit,
    onCancel,
    loading = false,
    disableStatusEdit = false, // Thêm prop để disable chỉnh sửa trạng thái
    hideStatus = false, // Thêm prop để ẩn hoàn toàn trường trạng thái
    defaultStatus = "Chờ duyệt", // Trạng thái mặc định khi tạo mới
    autoSubmitDraft = false, // Tự động chuyển "Bản nháp" thành "Chờ duyệt" khi submit
}) => {
    const { user, isAdminSession } = useAuth(); // Lấy thông tin user hiện tại và admin session

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        coverImage: "",
        status: defaultStatus,
        relatedFigures: [],
        relatedPeriods: [],
        relatedEvents: [],
        relatedLocations: [],
    });

    // Data for dropdowns
    const [figures, setFigures] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [events, setEvents] = useState([]);
    const [locations, setLocations] = useState([]);

    // Modal states for selecting relations
    const [isFigureModalOpen, setIsFigureModalOpen] = useState(false);
    const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

    // Search states for modals
    const [figureSearch, setFigureSearch] = useState("");
    const [periodSearch, setPeriodSearch] = useState("");
    const [eventSearch, setEventSearch] = useState("");
    const [locationSearch, setLocationSearch] = useState("");

    // State cho tác giả
    const [authorName, setAuthorName] = useState("");

    // Load initial data
    useEffect(() => {
        if (initialValues) {
            // Mode edit - giữ nguyên trạng thái hiện tại (tự động lưu nháp)
            setFormData({
                title: initialValues.title || "",
                content: initialValues.content || "",
                coverImage: initialValues.coverImage || "",
                status: initialValues.status || "Bản nháp",
                relatedFigures: initialValues.relations?.figures || [],
                relatedPeriods: initialValues.relations?.periods || [],
                relatedEvents: initialValues.relations?.events || [],
                relatedLocations: initialValues.relations?.locations || [],
            });
            // Set tên tác giả từ initialValues nếu có
            setAuthorName(initialValues.authorName || "");
        } else {
            // Mode create - set trạng thái mặc định (Chờ duyệt khi hideStatus = true)
            setFormData((prev) => ({
                ...prev,
                status: defaultStatus,
            }));
            // Set tên user hiện tại
            setAuthorName(
                user?.name || user?.username || user?.full_name || ""
            );
        }
    }, [initialValues, user, defaultStatus]);

    // Load dropdown data
    useEffect(() => {
        const loadData = async () => {
            try {
                const [figuresRes, periodsRes, eventsRes, locationsRes] =
                    await Promise.all([
                        figureService.getAllFigures({ limit: 1000 }),
                        periodService.getAllPeriods(),
                        eventService.getAllEvents({ limit: 1000 }),
                        locationService.getAllLocations({ limit: 1000 }),
                    ]);

                if (figuresRes?.success) setFigures(figuresRes.data || []);
                if (periodsRes?.success) setPeriods(periodsRes.data || []);
                if (eventsRes?.success) setEvents(eventsRes.data || []);
                if (locationsRes?.success)
                    setLocations(locationsRes.data || []);
            } catch (error) {
                console.error("Error loading form data:", error);
            }
        };
        loadData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleContentChange = (e) => {
        // TextEditor returns an event object with target.value
        const content = typeof e === "string" ? e : e.target?.value || "";
        setFormData((prev) => ({ ...prev, content }));
    };

    // Handle adding/removing figures
    const handleAddFigure = (figure) => {
        if (!formData.relatedFigures.find((f) => f.id === figure.id)) {
            setFormData((prev) => ({
                ...prev,
                relatedFigures: [...prev.relatedFigures, figure],
            }));
        }
    };

    const handleRemoveFigure = (figureId) => {
        setFormData((prev) => ({
            ...prev,
            relatedFigures: prev.relatedFigures.filter(
                (f) => f.id !== figureId
            ),
        }));
    };

    // Handle adding/removing periods
    const handleAddPeriod = (period) => {
        if (!formData.relatedPeriods.find((p) => p.id === period.id)) {
            setFormData((prev) => ({
                ...prev,
                relatedPeriods: [...prev.relatedPeriods, period],
            }));
        }
    };

    const handleRemovePeriod = (periodId) => {
        setFormData((prev) => ({
            ...prev,
            relatedPeriods: prev.relatedPeriods.filter(
                (p) => p.id !== periodId
            ),
        }));
    };

    // Handle adding/removing events
    const handleAddEvent = (event) => {
        if (!formData.relatedEvents.find((e) => e.id === event.id)) {
            setFormData((prev) => ({
                ...prev,
                relatedEvents: [...prev.relatedEvents, event],
            }));
        }
    };

    const handleRemoveEvent = (eventId) => {
        setFormData((prev) => ({
            ...prev,
            relatedEvents: prev.relatedEvents.filter((e) => e.id !== eventId),
        }));
    };

    // Handle adding/removing locations
    const handleAddLocation = (location) => {
        if (!formData.relatedLocations.find((l) => l.id === location.id)) {
            setFormData((prev) => ({
                ...prev,
                relatedLocations: [...prev.relatedLocations, location],
            }));
        }
    };

    const handleRemoveLocation = (locationId) => {
        setFormData((prev) => ({
            ...prev,
            relatedLocations: prev.relatedLocations.filter(
                (l) => l.id !== locationId
            ),
        }));
    };

    const [isUploading, setIsUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsUploading(true);
            let coverImageUrl = formData.coverImage;
            let processedContent = formData.content;

            // 1. Upload cover image if it's base64
            if (formData.coverImage && isBase64Image(formData.coverImage)) {
                const uploadResponse = await uploadService.uploadImage(
                    formData.coverImage,
                    "articles"
                );

                if (uploadResponse.success) {
                    coverImageUrl = uploadResponse.data.url;
                } else {
                    throw new Error("Failed to upload cover image");
                }
            }

            // 2. Extract and upload images from content
            const base64ImagesInContent = extractBase64Images(formData.content);
            if (base64ImagesInContent.length > 0) {
                const replacementMap = {};

                for (const base64Image of base64ImagesInContent) {
                    try {
                        const uploadResponse = await uploadService.uploadImage(
                            base64Image,
                            "articles"
                        );

                        if (uploadResponse.success) {
                            replacementMap[base64Image] =
                                uploadResponse.data.url;
                        }
                    } catch (imgError) {
                        console.error(
                            "Failed to upload content image:",
                            imgError
                        );
                        // Continue with other images even if one fails
                    }
                }

                // Replace base64 images with URLs in content
                processedContent = replaceBase64WithUrls(
                    formData.content,
                    replacementMap
                );
            }

            setIsUploading(false);

            // Xác định trạng thái cuối cùng
            let finalStatus = formData.status;

            // Nếu autoSubmitDraft = true và trạng thái hiện tại là "Bản nháp"
            // → Tự động chuyển sang "Chờ duyệt" (chỉ áp dụng cho user thường)
            if (
                autoSubmitDraft &&
                formData.status === "Bản nháp" &&
                !isAdminSession
            ) {
                finalStatus = "Chờ duyệt";
            }

            // Convert to backend format
            const submitData = {
                title: formData.title,
                content: processedContent,
                coverImage: coverImageUrl,
                status: finalStatus,
                // Tự động set published_at khi status là "Đã Xuất bản"
                publishedAt:
                    finalStatus === "Đã xuất bản"
                        ? new Date().toISOString()
                        : null,
                related_figures: formData.relatedFigures.map((f) => f.id),
                related_periods: formData.relatedPeriods.map((p) => p.id),
                related_events: formData.relatedEvents.map((e) => e.id),
                related_locations: formData.relatedLocations.map((l) => l.id),
            };

            onSubmit(submitData);
        } catch (error) {
            console.error("Error in form submission:", error);
            setIsUploading(false);
            alert(
                `Có lỗi xảy ra: ${
                    error.response?.data?.message ||
                    error.message ||
                    "Vui lòng thử lại"
                }`
            );
        }
    };

    return (
        <div className={styles.formContainer}>
            <div className={styles.formHeader}>
                <h2>{title}</h2>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="title">
                        Tiêu đề bài viết{" "}
                        <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="Nhập tiêu đề bài viết"
                    />
                </div>

                {/* Ô hiển thị tác giả - không cho sửa */}
                <div className={styles.formGroup}>
                    <label htmlFor="author">Tác giả</label>
                    <input
                        type="text"
                        id="author"
                        name="author"
                        value={authorName}
                        disabled
                        className={styles.disabledInput}
                        placeholder="Đang tải thông tin tác giả..."
                    />
                    <small className={styles.helpText}>
                        {mode === "create"
                            ? "* Tác giả được tự động lấy từ tài khoản đang đăng nhập"
                            : "* Tác giả của bài viết này"}
                    </small>
                </div>

                <ImageUpload
                    value={formData.coverImage}
                    onChange={(value) =>
                        setFormData((prev) => ({
                            ...prev,
                            coverImage: value,
                        }))
                    }
                    label="Ảnh bìa bài viết"
                    helpText="Ảnh bìa sẽ hiển thị ở đầu bài viết và trong danh sách tin tức"
                    aspectRatio="16/9"
                    maxSize={5}
                />

                <div className={styles.formGroup}>
                    <label htmlFor="content">
                        Nội dung <span className={styles.required}>*</span>
                    </label>
                    <TextEditor
                        type="rich"
                        value={formData.content}
                        onChange={handleContentChange}
                        placeholder="Nhập nội dung bài viết..."
                    />
                </div>

                {/* Trạng thái - Chỉ hiển thị khi hideStatus = false */}
                {!hideStatus && (
                    <div className={styles.formGroup}>
                        <label htmlFor="status">Trạng thái</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            disabled={disableStatusEdit}
                            className={
                                disableStatusEdit ? styles.disabledInput : ""
                            }
                        >
                            <option value="Bản nháp">Bản nháp</option>
                            <option value="Chờ duyệt">Chờ duyệt</option>
                            <option value="Đã xuất bản">Đã xuất bản</option>
                            <option value="Lưu trữ">Lưu trữ</option>
                        </select>
                        <small
                            style={{
                                color: "#6b7280",
                                marginTop: "4px",
                                display: "block",
                            }}
                        >
                            {disableStatusEdit
                                ? "* Chỉ admin mới có thể thay đổi trạng thái bài viết"
                                : '* Ngày xuất bản sẽ tự động được cập nhật khi chọn "Đã xuất bản"'}
                        </small>
                    </div>
                )}

                {/* Related Figures */}
                <div className={styles.formGroup}>
                    <label>Nhân vật liên quan</label>
                    <div className={styles.tagsContainer}>
                        {formData.relatedFigures.map((figure) => (
                            <div key={figure.id} className={styles.tag}>
                                <span>{figure.name}</span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleRemoveFigure(figure.id)
                                    }
                                    className={styles.removeTag}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setIsFigureModalOpen(true)}
                            className={styles.addButton}
                        >
                            + Thêm nhân vật
                        </button>
                    </div>
                </div>

                {/* Related Periods */}
                <div className={styles.formGroup}>
                    <label>Thời kỳ liên quan</label>
                    <div className={styles.tagsContainer}>
                        {formData.relatedPeriods.map((period) => (
                            <div key={period.id} className={styles.tag}>
                                <span>{period.name}</span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleRemovePeriod(period.id)
                                    }
                                    className={styles.removeTag}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setIsPeriodModalOpen(true)}
                            className={styles.addButton}
                        >
                            + Thêm thời kỳ
                        </button>
                    </div>
                </div>

                {/* Related Events */}
                <div className={styles.formGroup}>
                    <label>Sự kiện liên quan</label>
                    <div className={styles.tagsContainer}>
                        {formData.relatedEvents.map((event) => (
                            <div key={event.id} className={styles.tag}>
                                <span>{event.name}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveEvent(event.id)}
                                    className={styles.removeTag}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setIsEventModalOpen(true)}
                            className={styles.addButton}
                        >
                            + Thêm sự kiện
                        </button>
                    </div>
                </div>

                {/* Related Locations */}
                <div className={styles.formGroup}>
                    <label>Địa danh liên quan</label>
                    <div className={styles.tagsContainer}>
                        {formData.relatedLocations.map((location) => (
                            <div key={location.id} className={styles.tag}>
                                <span>{location.name}</span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleRemoveLocation(location.id)
                                    }
                                    className={styles.removeTag}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setIsLocationModalOpen(true)}
                            className={styles.addButton}
                        >
                            + Thêm địa danh
                        </button>
                    </div>
                </div>

                <div className={styles.formActions}>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Hủy
                    </Button>
                    <Button type="submit" disabled={loading || isUploading}>
                        {isUploading
                            ? "Đang tải ảnh..."
                            : loading
                            ? "Đang xử lý..."
                            : mode === "create"
                            ? "Tạo bài viết"
                            : autoSubmitDraft &&
                              formData.status === "Bản nháp" &&
                              !isAdminSession
                            ? "Gửi duyệt"
                            : "Cập nhật"}
                    </Button>
                </div>
            </form>

            {/* Figure Selection Modal */}
            {isFigureModalOpen && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => {
                        setIsFigureModalOpen(false);
                        setFigureSearch("");
                    }}
                >
                    <div
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.modalHeader}>
                            <h3>Chọn nhân vật</h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsFigureModalOpen(false);
                                    setFigureSearch("");
                                }}
                                className={styles.closeModal}
                            >
                                ×
                            </button>
                        </div>
                        <div className={styles.modalSearch}>
                            <input
                                type="text"
                                placeholder="Tìm kiếm nhân vật..."
                                value={figureSearch}
                                onChange={(e) =>
                                    setFigureSearch(e.target.value)
                                }
                                className={styles.searchInput}
                            />
                        </div>
                        <div className={styles.modalBody}>
                            {figures
                                .filter((figure) =>
                                    figure.name
                                        .toLowerCase()
                                        .includes(figureSearch.toLowerCase())
                                )
                                .map((figure) => (
                                    <div
                                        key={figure.id}
                                        className={`${styles.modalItem} ${
                                            formData.relatedFigures.find(
                                                (f) => f.id === figure.id
                                            )
                                                ? styles.selected
                                                : ""
                                        }`}
                                        onClick={() => {
                                            handleAddFigure(figure);
                                            setIsFigureModalOpen(false);
                                            setFigureSearch("");
                                        }}
                                    >
                                        {figure.name}
                                    </div>
                                ))}
                            {figures.filter((figure) =>
                                figure.name
                                    .toLowerCase()
                                    .includes(figureSearch.toLowerCase())
                            ).length === 0 && (
                                <div className={styles.noResults}>
                                    Không tìm thấy nhân vật nào
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Period Selection Modal */}
            {isPeriodModalOpen && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => {
                        setIsPeriodModalOpen(false);
                        setPeriodSearch("");
                    }}
                >
                    <div
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.modalHeader}>
                            <h3>Chọn thời kỳ</h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsPeriodModalOpen(false);
                                    setPeriodSearch("");
                                }}
                                className={styles.closeModal}
                            >
                                ×
                            </button>
                        </div>
                        <div className={styles.modalSearch}>
                            <input
                                type="text"
                                placeholder="Tìm kiếm thời kỳ..."
                                value={periodSearch}
                                onChange={(e) =>
                                    setPeriodSearch(e.target.value)
                                }
                                className={styles.searchInput}
                            />
                        </div>
                        <div className={styles.modalBody}>
                            {periods
                                .filter((period) =>
                                    period.name
                                        .toLowerCase()
                                        .includes(periodSearch.toLowerCase())
                                )
                                .map((period) => (
                                    <div
                                        key={period.id}
                                        className={`${styles.modalItem} ${
                                            formData.relatedPeriods.find(
                                                (p) => p.id === period.id
                                            )
                                                ? styles.selected
                                                : ""
                                        }`}
                                        onClick={() => {
                                            handleAddPeriod(period);
                                            setIsPeriodModalOpen(false);
                                            setPeriodSearch("");
                                        }}
                                    >
                                        {period.name}
                                    </div>
                                ))}
                            {periods.filter((period) =>
                                period.name
                                    .toLowerCase()
                                    .includes(periodSearch.toLowerCase())
                            ).length === 0 && (
                                <div className={styles.noResults}>
                                    Không tìm thấy thời kỳ nào
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Event Selection Modal */}
            {isEventModalOpen && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => {
                        setIsEventModalOpen(false);
                        setEventSearch("");
                    }}
                >
                    <div
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.modalHeader}>
                            <h3>Chọn sự kiện</h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEventModalOpen(false);
                                    setEventSearch("");
                                }}
                                className={styles.closeModal}
                            >
                                ×
                            </button>
                        </div>
                        <div className={styles.modalSearch}>
                            <input
                                type="text"
                                placeholder="Tìm kiếm sự kiện..."
                                value={eventSearch}
                                onChange={(e) => setEventSearch(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>
                        <div className={styles.modalBody}>
                            {events
                                .filter((event) =>
                                    event.name
                                        .toLowerCase()
                                        .includes(eventSearch.toLowerCase())
                                )
                                .map((event) => (
                                    <div
                                        key={event.id}
                                        className={`${styles.modalItem} ${
                                            formData.relatedEvents.find(
                                                (e) => e.id === event.id
                                            )
                                                ? styles.selected
                                                : ""
                                        }`}
                                        onClick={() => {
                                            handleAddEvent(event);
                                            setIsEventModalOpen(false);
                                            setEventSearch("");
                                        }}
                                    >
                                        {event.name}
                                    </div>
                                ))}
                            {events.filter((event) =>
                                event.name
                                    .toLowerCase()
                                    .includes(eventSearch.toLowerCase())
                            ).length === 0 && (
                                <div className={styles.noResults}>
                                    Không tìm thấy sự kiện nào
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Location Selection Modal */}
            {isLocationModalOpen && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => {
                        setIsLocationModalOpen(false);
                        setLocationSearch("");
                    }}
                >
                    <div
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.modalHeader}>
                            <h3>Chọn địa danh</h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLocationModalOpen(false);
                                    setLocationSearch("");
                                }}
                                className={styles.closeModal}
                            >
                                ×
                            </button>
                        </div>
                        <div className={styles.modalSearch}>
                            <input
                                type="text"
                                placeholder="Tìm kiếm địa danh..."
                                value={locationSearch}
                                onChange={(e) =>
                                    setLocationSearch(e.target.value)
                                }
                                className={styles.searchInput}
                            />
                        </div>
                        <div className={styles.modalBody}>
                            {locations
                                .filter((location) =>
                                    location.name
                                        .toLowerCase()
                                        .includes(locationSearch.toLowerCase())
                                )
                                .map((location) => (
                                    <div
                                        key={location.id}
                                        className={`${styles.modalItem} ${
                                            formData.relatedLocations.find(
                                                (l) => l.id === location.id
                                            )
                                                ? styles.selected
                                                : ""
                                        }`}
                                        onClick={() => {
                                            handleAddLocation(location);
                                            setIsLocationModalOpen(false);
                                            setLocationSearch("");
                                        }}
                                    >
                                        {location.name}
                                    </div>
                                ))}
                            {locations.filter((location) =>
                                location.name
                                    .toLowerCase()
                                    .includes(locationSearch.toLowerCase())
                            ).length === 0 && (
                                <div className={styles.noResults}>
                                    Không tìm thấy địa danh nào
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArticleForm;
