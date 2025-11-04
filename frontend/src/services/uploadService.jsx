import axios from "axios";
import config from "../config";

const API_BASE_URL = `${config.serverUrl}/api/upload`;

/**
 * Get authentication token based on session type
 * @returns {string|null} - Authentication token
 */
const getAuthToken = () => {
    if (localStorage.getItem("session_type") === "admin") {
        return localStorage.getItem("admin_auth_token");
    } else {
        return localStorage.getItem("auth_token");
    }
};

/**
 * Upload image to server
 * @param {string} base64Image - Base64 encoded image
 * @param {string} folder - Folder name (articles, figures, events, etc.)
 * @returns {Promise} - Upload response with image URL
 */
const uploadImage = async (base64Image, folder = "articles") => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await axios.post(
            `${API_BASE_URL}/image`,
            {
                image: base64Image,
                folder: folder,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
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
        const token = getAuthToken();
        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await axios.delete(`${API_BASE_URL}/image`, {
            data: { imageUrl },
            headers: {
                Authorization: `Bearer ${token}`,
            },
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
