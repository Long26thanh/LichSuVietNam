/**
 * Utility functions for handling image uploads and storage
 */

/**
 * Save image to assets/images folder and return the relative path
 * @param {File} file - The image file to save
 * @param {string} folder - Subfolder in assets/images (e.g., 'articles', 'figures')
 * @returns {Promise<string>} - The relative path to the saved image
 */
export const saveImageToAssets = async (file, folder = "articles") => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
            try {
                const base64String = reader.result;
                // Generate unique filename
                const timestamp = Date.now();
                const randomStr = Math.random().toString(36).substring(2, 15);
                const extension = file.name.split(".").pop();
                const filename = `${folder}_${timestamp}_${randomStr}.${extension}`;

                // In production, you should upload to a server
                // For now, we'll return the base64 string with metadata
                const imageData = {
                    filename,
                    base64: base64String,
                    path: `/assets/images/${folder}/${filename}`,
                    size: file.size,
                    type: file.type,
                };

                resolve(imageData);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => {
            reject(new Error("Failed to read file"));
        };

        reader.readAsDataURL(file);
    });
};

/**
 * Convert base64 image to File object
 * @param {string} base64String - Base64 encoded image
 * @param {string} filename - Name for the file
 * @returns {File} - File object
 */
export const base64ToFile = (base64String, filename = "image.jpg") => {
    // Extract the actual base64 data
    const arr = base64String.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
};

/**
 * Save base64 image to backend server
 * @param {string} base64String - Base64 encoded image
 * @param {string} folder - Subfolder name
 * @returns {Promise<string>} - URL of the saved image
 */
export const uploadImageToServer = async (
    base64String,
    folder = "articles"
) => {
    try {
        // This should be implemented with your backend API
        // For now, return the base64 string
        // TODO: Implement actual server upload
        const response = await fetch("/api/upload/image", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                image: base64String,
                folder: folder,
            }),
        });

        if (!response.ok) {
            throw new Error("Upload failed");
        }

        const data = await response.json();
        return data.url;
    } catch (error) {
        console.error("Error uploading image:", error);
        // Fallback to base64 if upload fails
        return base64String;
    }
};

/**
 * Process and optimize image before saving
 * @param {File} file - Image file
 * @param {Object} options - Optimization options
 * @returns {Promise<string>} - Processed image as base64
 */
export const processImage = async (file, options = {}) => {
    const { maxWidth = 1920, maxHeight = 1080, quality = 0.9 } = options;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                // Calculate new dimensions
                let width = img.width;
                let height = img.height;

                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(
                        maxWidth / width,
                        maxHeight / height
                    );
                    width = width * ratio;
                    height = height * ratio;
                }

                // Create canvas and resize
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to base64
                const base64 = canvas.toDataURL(file.type, quality);
                resolve(base64);
            };

            img.onerror = () => {
                reject(new Error("Failed to load image"));
            };

            img.src = e.target.result;
        };

        reader.onerror = () => {
            reject(new Error("Failed to read file"));
        };

        reader.readAsDataURL(file);
    });
};

/**
 * Extract filename from path or URL
 * @param {string} path - File path or URL
 * @returns {string} - Filename
 */
export const getFilenameFromPath = (path) => {
    if (!path) return "";
    return path.split("/").pop().split("?")[0];
};

/**
 * Check if string is a base64 image
 * @param {string} str - String to check
 * @returns {boolean}
 */
export const isBase64Image = (str) => {
    if (!str || typeof str !== "string") return false;
    return str.startsWith("data:image/");
};

/**
 * Extract all base64 images from HTML content
 * @param {string} htmlContent - HTML string with embedded images
 * @returns {Array} - Array of base64 image strings
 */
export const extractBase64Images = (htmlContent) => {
    if (!htmlContent) return [];

    const base64Images = [];
    const imgRegex = /<img[^>]+src="(data:image\/[^"]+)"/g;
    let match;

    while ((match = imgRegex.exec(htmlContent)) !== null) {
        base64Images.push(match[1]);
    }

    return base64Images;
};

/**
 * Replace base64 images in HTML content with URLs
 * @param {string} htmlContent - HTML string with base64 images
 * @param {Object} replacementMap - Map of {base64: url}
 * @returns {string} - HTML with replaced URLs
 */
export const replaceBase64WithUrls = (htmlContent, replacementMap) => {
    if (!htmlContent) return htmlContent;

    let result = htmlContent;
    for (const [base64, url] of Object.entries(replacementMap)) {
        result = result.replace(
            new RegExp(base64.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
            url
        );
    }

    return result;
};
