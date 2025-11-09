import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { authenticateToken } from "../middlewares/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * @route   POST /api/upload/image
 * @desc    Upload an image and save to assets/images
 * @access  Private
 */
router.post("/image", authenticateToken, async (req, res) => {
    try {
        const { image, folder = "articles" } = req.body;

        if (!image) {
            return res.status(400).json({
                success: false,
                message: "No image data provided",
            });
        }

        // Check if it's a base64 image
        if (!image.startsWith("data:image/")) {
            return res.status(400).json({
                success: false,
                message: "Invalid image format",
            });
        }

        // Extract base64 data and mime type
        const matches = image.match(/^data:image\/([a-zA-Z]*);base64,(.*)$/);
        if (!matches || matches.length !== 3) {
            return res.status(400).json({
                success: false,
                message: "Invalid base64 image format",
            });
        }

        const imageType = matches[1]; // png, jpg, etc.
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, "base64");

        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 15);
        const filename = `${folder}_${timestamp}_${randomStr}.${imageType}`;

        // Create directory structure in src/assets/images
        const uploadDir = path.join(
            __dirname,
            "../../frontend/src/assets/images",
            folder
        );

        await fs.mkdir(uploadDir, { recursive: true });

        // Save file
        const filePath = path.join(uploadDir, filename);
        await fs.writeFile(filePath, buffer);

        // Return the relative URL path that backend will serve
        const imageUrl = `/assets/images/${folder}/${filename}`;

        res.json({
            success: true,
            message: "Image uploaded successfully",
            data: {
                url: imageUrl,
                filename: filename,
                size: buffer.length,
            },
        });
    } catch (error) {
        console.error("Error uploading image:", error);
        console.error("Error stack:", error.stack);
        res.status(500).json({
            success: false,
            message: "Error uploading image",
            error: error.message,
        });
    }
});

/**
 * @route   DELETE /api/upload/image
 * @desc    Delete an image from assets/images
 * @access  Private
 */
router.delete("/image", authenticateToken, async (req, res) => {
    try {
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: "No image URL provided",
            });
        }

        // Extract path from URL
        // Example: /assets/images/articles/filename.jpg
        const urlPath = imageUrl.replace(/^\//, ""); // Remove leading slash
        const filePath = path.join(__dirname, "../../frontend", urlPath);

        // Check if file exists
        try {
            await fs.access(filePath);
            // Delete the file
            await fs.unlink(filePath);

            res.json({
                success: true,
                message: "Image deleted successfully",
            });
        } catch (error) {
            // File doesn't exist
            res.json({
                success: true,
                message: "Image not found or already deleted",
            });
        }
    } catch (error) {
        console.error("Error deleting image:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting image",
            error: error.message,
        });
    }
});

export default router;
