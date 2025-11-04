import Location from "../models/LocationModel.js";
import ViewModel from "../models/ViewModel.js";
import Comment from "../models/CommentModel.js";

class LocationController {
    // Get /api/locations - Lấy danh sách tất cả các địa điểm
    static async getAll(req, res) {
        try {
            const { page, limit, search, type } = req.query;
            const result = await Location.getAll({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20,
                search,
                type,
            });

            // Lấy view counts và comment counts cho tất cả locations
            const locationIds = result.data.map((location) => location.id);
            const viewCounts = await ViewModel.getMultipleViewCounts(
                "Địa danh",
                locationIds
            );
            const commentCounts = await Comment.getMultipleCommentCounts(
                "Địa danh",
                locationIds
            );

            // Thêm viewCount và commentCount vào mỗi location
            const locationsWithViews = result.data.map((location) => ({
                ...location,
                viewCount: viewCounts[location.id] || 0,
                commentCount: commentCounts[location.id] || 0,
            }));

            return res.status(200).json({
                success: true,
                data: locationsWithViews,
                pagination: result.pagination,
            });
        } catch (error) {
            console.error("Lỗi khi lấy danh sách địa điểm:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy danh sách địa điểm",
            });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const location = await Location.getById(id);
            if (!location) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy địa danh",
                });
            }

            // Lấy view count và comment count
            const viewCount = await ViewModel.getViewCount("Địa danh", id);
            const commentCount = await Comment.countByPageTypeAndId(
                "Địa danh",
                id
            );

            return res.status(200).json({
                success: true,
                data: {
                    ...location,
                    viewCount,
                    commentCount,
                },
            });
        } catch (error) {
            console.error("Lỗi khi lấy thông tin địa điểm:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy thông tin địa điểm",
            });
        }
    }

    static async getNameById(req, res) {
        try {
            const { id } = req.params;
            const name = await Location.getNameById(id);
            return res.status(200).json({
                success: true,
                data: { name },
            });
        } catch (error) {
            console.error("Lỗi khi lấy tên địa điểm:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy tên địa điểm",
            });
        }
    }

    static async create(req, res) {
        try {
            const locationData = req.body;
            const newLocation = await Location.create(locationData);
            return res.status(201).json({
                success: true,
                data: newLocation,
            });
        } catch (error) {
            console.error("Lỗi khi tạo địa điểm:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi tạo địa điểm",
            });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const locationData = req.body;
            const updatedLocation = await Location.update(id, locationData);

            if (!updatedLocation) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy địa điểm",
                });
            }

            return res.status(200).json({
                success: true,
                data: updatedLocation,
            });
        } catch (error) {
            console.error("Lỗi khi cập nhật địa điểm:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi cập nhật địa điểm",
            });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await Location.delete(id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy địa điểm",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Xóa địa điểm thành công",
            });
        } catch (error) {
            console.error("Lỗi khi xóa địa điểm:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi xóa địa điểm",
            });
        }
    }
}

export default LocationController;
