import React, { useState, useRef } from "react";
import styles from "./ImageUpload.module.css";

const ImageUpload = ({
    value,
    onChange,
    label,
    helpText,
    maxSize = 5, // MB
    aspectRatio = "16/9", // "16/9", "1/1", "4/3", "free"
    placeholder = "Kéo thả ảnh vào đây hoặc click để chọn",
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState(value || null);
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Update preview when value prop changes (for edit mode)
    React.useEffect(() => {
        setPreview(value || null);
    }, [value]);

    const validateFile = (file) => {
        // Check file type
        if (!file.type.startsWith("image/")) {
            return "Vui lòng chọn file ảnh (JPG, PNG, GIF, WebP)";
        }

        // Check file size
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > maxSize) {
            return `Kích thước file không được vượt quá ${maxSize}MB`;
        }

        return null;
    };

    const handleFileUpload = async (file) => {
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError("");
        setUploading(true);

        try {
            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setPreview(base64String);
                onChange(base64String);
                setUploading(false);
            };
            reader.onerror = () => {
                setError("Lỗi đọc file. Vui lòng thử lại.");
                setUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            setError("Có lỗi xảy ra khi tải ảnh");
            setUploading(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemove = () => {
        setPreview(null);
        setError("");
        onChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const getAspectRatioClass = () => {
        switch (aspectRatio) {
            case "1/1":
                return styles.square;
            case "4/3":
                return styles.landscape;
            case "16/9":
                return styles.wide;
            default:
                return styles.free;
        }
    };

    return (
        <div className={styles.container}>
            {label && <label className={styles.label}>{label}</label>}

            <div
                className={`${styles.uploadArea} ${getAspectRatioClass()} ${
                    isDragging ? styles.dragging : ""
                } ${preview ? styles.hasImage : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={!preview ? handleClick : undefined}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                />

                {uploading ? (
                    <div className={styles.uploading}>
                        <div className={styles.spinner}></div>
                        <p>Đang tải ảnh...</p>
                    </div>
                ) : preview ? (
                    <div className={styles.preview}>
                        <img src={preview} alt="Preview" />
                        <div className={styles.overlay}>
                            <button
                                type="button"
                                className={styles.changeBtn}
                                onClick={handleClick}
                            >
                                Thay đổi
                            </button>
                            <button
                                type="button"
                                className={styles.removeBtn}
                                onClick={handleRemove}
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.placeholder}>
                        <div className={styles.icon}>📷</div>
                        <p className={styles.mainText}>{placeholder}</p>
                        <p className={styles.subText}>
                            Hỗ trợ: JPG, PNG, GIF, WebP (Tối đa {maxSize}MB)
                        </p>
                    </div>
                )}
            </div>

            {error && <p className={styles.error}>{error}</p>}
            {helpText && !error && (
                <p className={styles.helpText}>{helpText}</p>
            )}
        </div>
    );
};

export default ImageUpload;
