import LocationType from "../models/LocationTypeModel.js";

class LocationTypeController {
    // Get /api/location-types - Lấy danh sách tất cả các loại địa danh
    static async getAllLocationTypes(req, res) {
        try {
            const locationTypes = await LocationType.getAll();
            return res.status(200).json({
                success: true,
                data: locationTypes,
            });
        } catch (error) {
            console.error("Lỗi khi lấy danh sách loại địa danh:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi lấy danh sách loại địa danh",
            });
        }
    }

    // POST /api/location-types - Tạo loại địa danh mới
    static async createLocationType(req, res) {
        try {
            const { name } = req.body;
            const newLocationType = await LocationType.create({ name });
            return res.status(201).json({
                success: true,
                data: newLocationType,
            });
        } catch (error) {
            console.error("Lỗi khi tạo loại địa danh:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi tạo loại địa danh",
            });
        }
    }

    static async updateLocationType(req, res) {
        try {
            const { id } = req.params;
            const { name } = req.body;
            const locationType = new LocationType({ MaLoai: id });
            const updatedLocationType = await locationType.update({ name });
            return res.status(200).json({
                success: true,
                data: updatedLocationType,
            });
        } catch (error) {
            console.error("Lỗi khi cập nhật loại địa danh:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi cập nhật loại địa danh",
            });
        }
    }

    // DELETE /api/location-types/:id - Xóa loại địa danh
    static async deleteLocationType(req, res) {
        try {
            const { id } = req.params;
            const locationType = new LocationType({ MaLoai: id });
            await locationType.delete();
            return res.status(200).json({
                success: true,
                message: "Xóa loại địa danh thành công",
            });
        } catch (error) {
            console.error("Lỗi khi xóa loại địa danh:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi server khi xóa loại địa danh",
            });
        }
    }
}

export default LocationTypeController;
