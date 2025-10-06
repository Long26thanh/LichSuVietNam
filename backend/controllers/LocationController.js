import Location from "../models/LocationModel.js";

class LocationController {
    // Get /api/locations - Lấy danh sách tất cả các địa điểm
    static async getAllLocations(req, res) {
        try {
            const { page, limit, search, type } = req.query;
            const locations = await Location.getAll({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20,
                search,
                type,
            });

            console.log(locations);
            return res.status(200).json({
                success: true,
                data: locations,
            });
        } catch (error) {
            console.error("Lỗi khi lấy danh sách địa điểm:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy danh sách địa điểm",
            });
        }
    }

    static async getLocationById(req, res) {
        try {
            const { id } = req.params;
            const location = await Location.getById(id);
            if (!location) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy địa danh",
                });
            }
            return res.status(200).json({ success: true, data: location });
        } catch (error) {
            console.error("Lỗi khi lấy thông tin địa điểm:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy thông tin địa điểm",
            });
        }
    }

    static async getLocationNameById(req, res) {
        try {
            const { id } = req.params;
            const name = await Location.getLocationNameById(id);
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
}

export default LocationController;
