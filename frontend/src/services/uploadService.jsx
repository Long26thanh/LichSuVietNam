import { createApiClient } from "./apiClient";

const API_URL = "/api/upload";
const apiClient = createApiClient(API_URL);

/**
 * Upload image to server
 * @param {string} base64Image - Base64 encoded image
 * @param {string} folder - Folder name (articles, figures, events, etc.)
 * @returns {Promise} - Upload response with image URL
 */
const uploadImage = async (base64Image, folder = "articles") => {
    try {
        const response = await apiClient.post("/image", {
            image: base64Image,
            folder: folder,
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
};

/**
 * Delete image from server
 * @param {string} imageUrl - URL of the image to delete
 * @returns {Promise} - Delete response
 */
const deleteImage = async (imageUrl) => {
    try {
        const response = await apiClient.delete("/image", {
            data: { imageUrl },
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting image:", error);
        throw error;
    }
};

const uploadService = {
    uploadImage,
    deleteImage,
};

export default uploadService;
