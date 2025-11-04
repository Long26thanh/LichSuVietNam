import Event from "../models/EventModel.js";
import ViewModel from "../models/ViewModel.js";
import Comment from "../models/CommentModel.js";

class EventController {
    // Get /api/events - Lấy danh sách tất cả các sự kiện
    static async getAll(req, res) {
        try {
            const { page, limit, search } = req.query;
            const result = await Event.getAll({ page, limit, search });

            // Lấy view counts và comment counts cho tất cả events
            const eventIds = result.data.map((event) => event.id);
            const viewCounts = await ViewModel.getMultipleViewCounts(
                "Sự kiện",
                eventIds
            );
            const commentCounts = await Comment.getMultipleCommentCounts(
                "Sự kiện",
                eventIds
            );

            // Thêm viewCount và commentCount vào mỗi event
            const eventsWithViews = result.data.map((event) => ({
                ...event,
                viewCount: viewCounts[event.id] || 0,
                commentCount: commentCounts[event.id] || 0,
            }));

            return res.status(200).json({
                success: true,
                data: eventsWithViews,
                pagination: result.pagination,
            });
        } catch (error) {
            console.error("Lỗi khi lấy danh sách sự kiện:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy danh sách sự kiện",
            });
        }
    }
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const event = await Event.getById(id);
            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sự kiện",
                });
            }

            // Lấy view count và comment count
            const viewCount = await ViewModel.getViewCount("Sự kiện", id);
            const commentCount = await Comment.countByPageTypeAndId(
                "Sự kiện",
                id
            );

            return res.status(200).json({
                success: true,
                data: {
                    ...event,
                    viewCount,
                    commentCount,
                },
            });
        } catch (error) {
            console.error("Lỗi khi lấy thông tin sự kiện:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy thông tin sự kiện",
            });
        }
    }

    static async create(req, res) {
        try {
            const eventData = req.body;
            const newEvent = await Event.create(eventData);
            return res.status(201).json({
                success: true,
                data: newEvent,
            });
        } catch (error) {
            console.error("Lỗi khi tạo sự kiện:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi tạo sự kiện",
            });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const eventData = req.body;
            const event = new Event({ MaSuKien: id });
            const updatedEvent = await event.update(eventData);
            return res.status(200).json({
                success: true,
                data: updatedEvent,
            });
        } catch (error) {
            console.error("Lỗi khi cập nhật sự kiện:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi cập nhật sự kiện",
            });
        }
    }
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const event = new Event({ MaSuKien: id });
            await event.delete();
            return res.status(200).json({
                success: true,
                message: "Xóa sự kiện thành công",
            });
        } catch (error) {
            console.error("Lỗi khi xóa sự kiện:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi xóa sự kiện",
            });
        }
    }
}

export default EventController;
