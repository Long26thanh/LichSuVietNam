import Figure from "../models/FigureModel.js";
import ViewModel from "../models/ViewModel.js";
import Comment from "../models/CommentModel.js";

class FigureController {
    static async getAll(req, res) {
        try {
            const { page, limit, search } = req.query;
            const result = await Figure.getAll({ page, limit, search });

            // Lấy view counts và comment counts cho tất cả figures
            const figureIds = result.data.map((figure) => figure.id);
            const viewCounts = await ViewModel.getMultipleViewCounts(
                "Nhân vật",
                figureIds
            );
            const commentCounts = await Comment.getMultipleCommentCounts(
                "Nhân vật",
                figureIds
            );

            // Thêm viewCount và commentCount vào mỗi figure
            const figuresWithViews = result.data.map((figure) => ({
                ...figure,
                viewCount: viewCounts[figure.id] || 0,
                commentCount: commentCounts[figure.id] || 0,
            }));

            return res.status(200).json({
                success: true,
                data: figuresWithViews,
                pagination: result.pagination,
            });
        } catch (error) {
            console.error("Lấy danh sách nhân vật thất bại:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi lấy danh sách nhân vật",
            });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const figure = await Figure.getById(id);
            if (!figure) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy nhân vật",
                });
            }

            // Lấy view count và comment count
            const viewCount = await ViewModel.getViewCount("Nhân vật", id);
            const commentCount = await Comment.countByPageTypeAndId(
                "Nhân vật",
                id
            );

            return res.status(200).json({
                success: true,
                data: {
                    ...figure,
                    viewCount,
                    commentCount,
                },
            });
        } catch (error) {
            console.error("Lấy chi tiết nhân vật thất bại:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi lấy chi tiết nhân vật",
            });
        }
    }

    static async create(req, res) {
        try {
            const figureData = req.body;

            // Validate required fields
            if (!figureData.name) {
                return res.status(400).json({
                    success: false,
                    message: "Tên nhân vật là bắt buộc",
                });
            }

            const newFigure = await Figure.create(figureData);
            return res.status(201).json({
                success: true,
                message: "Tạo nhân vật thành công",
                data: newFigure,
            });
        } catch (error) {
            console.error("Tạo nhân vật thất bại:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi tạo nhân vật",
            });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const figureData = req.body;

            // Check if figure exists
            const existingFigure = await Figure.getById(id);
            if (!existingFigure) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy nhân vật",
                });
            }

            const updatedFigure = await existingFigure.update(figureData);
            return res.status(200).json({
                success: true,
                message: "Cập nhật nhân vật thành công",
                data: updatedFigure,
            });
        } catch (error) {
            console.error("Cập nhật nhân vật thất bại:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi cập nhật nhân vật",
            });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;

            // Check if figure exists
            const existingFigure = await Figure.getById(id);
            if (!existingFigure) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy nhân vật",
                });
            }

            await Figure.delete(id);
            return res.status(200).json({
                success: true,
                message: "Xóa nhân vật thành công",
            });
        } catch (error) {
            console.error("Xóa nhân vật thất bại:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi xóa nhân vật",
            });
        }
    }
}

export default FigureController;
