import Period from "../models/PeriodModel.js";

class PeriodController {
    // Get /api/periods - Lấy danh sách tất cả các thời kỳ
    static async getAllPeriods(req, res) {
        try {
            const periods = await Period.getAll();
            return res.status(200).json({
                success: true,
                data: periods,
            });
        } catch (error) {
            console.error("Lỗi khi lấy danh sách thời kỳ:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy danh sách thời kỳ",
            });
        }
    }

    // GET /api/periods/:id - Lấy thông tin chi tiết một thời kỳ theo ID
    static async getPeriodById(req, res) {
        try {
            const { id } = req.params;
            const period = await Period.getById(id);
            console.log("Thông tin thời kỳ:", period);
            if (!period) {
                return res.status(404).json({
                    success: false,
                    message: "Thời kỳ không tồn tại",
                });
            }
            return res.status(200).json({
                success: true,
                data: period,
            });
        } catch (error) {
            console.error("Lỗi khi lấy thông tin thời kỳ:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy thông tin thời kỳ",
            });
        }
    }

    // Get /api/periods/:id/name - Lấy tên thời kỳ theo ID
    static async getPeriodNameById(req, res) {
        try {
            const { id } = req.params;
            const name = await Period.getPeriodNameById(id);
            return res.status(200).json({
                success: true,
                data: { name },
            });
        } catch (error) {
            console.error("Lỗi khi lấy tên thời kỳ:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy tên thời kỳ",
            });
        }
    }

    // Post /api/periods - Tạo mới một thời kỳ
    static async createPeriod(req, res) {
        try {
            const { name, description, summary, start_year, end_year } =
                req.body;
            const newPeriod = await Period.create({
                name,
                description,
                summary,
                start_year,
                end_year,
            });
            return res.status(201).json({
                success: true,
                message: "Tạo thời kỳ thành công",
                data: newPeriod,
            });
        } catch (error) {
            console.error("Lỗi khi tạo thời kỳ:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi tạo thời kỳ",
                error: error.message,
            });
        }
    }

    // Put /api/periods/:id - Cập nhật thông tin một thời kỳ
    static async updatePeriod(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Thêm await khi gọi getPeriodById
            const period = await Period.getPeriodById(id);

            if (!period) {
                return res.status(404).json({
                    success: false,
                    message: "Thời kỳ không tồn tại",
                });
            }

            // Thêm await cho hàm update
            const updatedPeriod = await period.update(updateData);

            return res.status(200).json({
                success: true,
                message: "Cập nhật thời kỳ thành công",
                data: updatedPeriod,
            });
        } catch (error) {
            console.error("Lỗi khi cập nhật thời kỳ:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi cập nhật thời kỳ",
                error: error.message,
            });
        }
    }

    // Delete /api/periods/:id - Xóa một thời kỳ
    static async deletePeriod(req, res) {
        try {
            const { id } = req.params;
            const isDeleted = await Period.delete(id);

            if (!isDeleted) {
                return res.status(404).json({
                    success: false,
                    message: "Thời kỳ không tồn tại hoặc đã bị xóa",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Xóa thời kỳ thành công",
            });
        } catch (error) {
            console.error("Lỗi khi xóa thời kỳ:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi xóa thời kỳ",
                error: error.message,
            });
        }
    }

    // Get /api/periods/search - Tìm kiếm thời kỳ
    static async search(req, res) {
        try {
            const { q, start_year, end_year } = req.query;
            let periods;
            if (q) {
                periods = await Period.searchByName(q);
            } else if (start_year && end_year) {
                periods = await Period.getByYearRange(start_year, end_year);
            } else {
                periods = await Period.getAll();
            }
            return res.status(200).json({
                success: true,
                message: "Tìm kiếm thời kỳ thành công",
                data: periods,
            });
        } catch (error) {
            console.error("Lỗi khi tìm kiếm thời kỳ:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi tìm kiếm thời kỳ",
                error: error.message,
            });
        }
    }
}

export default PeriodController;
