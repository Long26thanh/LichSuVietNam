import Figure from "../models/FigureModel.js";

class FigureController {
    async getAllFigures(req, res) {
        try {
            const { page, limit, search } = req.query;
            const figures = await Figure.getAll({ page, limit, search });
            return res.status(200).json({
                success: true,
                data: figures,
            });
        } catch (error) {
            console.error("Lấy danh sách nhân vật thất bại:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi lấy danh sách nhân vật",
            });
        }
    }

    async getFigureById(req, res) {
        try {
            const { id } = req.params;
            const figure = await Figure.getById(id);
            if (!figure) {
                return res.status(404).json({ success: false, message: "Không tìm thấy nhân vật" });
            }
            return res.status(200).json({ success: true, data: figure });
        } catch (error) {
            console.error("Lấy chi tiết nhân vật thất bại:", error);
            return res.status(500).json({ success: false, message: "Lỗi máy chủ khi lấy chi tiết nhân vật" });
        }
    }
}

export default new FigureController();
