import Event from "../models/EventModel.js";

class EventController {
    // Get /api/events - Lấy danh sách tất cả các sự kiện
    static async getAllEvents(req, res) {
        try {
            const { page, limit, search } = req.query;
            const events = await Event.getAll({ page, limit, search });
            return res.status(200).json({
                success: true,
                data: events,
            });
        } catch (error) {
            console.error("Lỗi khi lấy danh sách sự kiện:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy danh sách sự kiện",
            });
        }
    }
    static async getEventById(req, res) {
        try {
            const { id } = req.params;
            const event = await Event.getById(id);
            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy sự kiện",
                });
            }
            return res.status(200).json({ success: true, data: event });
        } catch (error) {
            console.error("Lỗi khi lấy thông tin sự kiện:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy thông tin sự kiện",
            });
        }
    }
}

export default EventController;
