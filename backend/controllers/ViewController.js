import ViewModel from "../models/ViewModel.js";

class ViewController {
    // Ghi nhận lượt xem
    static async recordView(req, res) {
        try {
            const {
                loaiTrang,
                maBaiViet,
                maNhanVat,
                maThoiKy,
                maSuKien,
                maDiaDanh,
            } = req.body;
            
            // Lấy user ID nếu đã đăng nhập
            const userId = req.user?.id || null;
            
            // Lấy IP address từ nhiều nguồn khác nhau
            const ipAddress = 
                req.headers['x-forwarded-for']?.split(',')[0].trim() || 
                req.headers['x-real-ip'] || 
                req.connection.remoteAddress || 
                req.socket.remoteAddress ||
                req.ip;
            

            // Validate loaiTrang
            const validTypes = [
                "Website",
                "Bài viết",
                "Thời kỳ",
                "Địa danh",
                "Sự kiện",
                "Nhân vật",
            ];
            if (!validTypes.includes(loaiTrang)) {
                return res.status(400).json({
                    success: false,
                    message: "Loại trang không hợp lệ",
                });
            }

            // Validate rằng chỉ có một ID được cung cấp (trừ Website)
            if (loaiTrang !== "Website") {
                const ids = [
                    maBaiViet,
                    maNhanVat,
                    maThoiKy,
                    maSuKien,
                    maDiaDanh,
                ].filter((id) => id !== undefined && id !== null);
                if (ids.length !== 1) {
                    return res.status(400).json({
                        success: false,
                        message: "Phải cung cấp đúng một ID cho loại trang này",
                    });
                }
            }

            const view = await ViewModel.recordView({
                loaiTrang,
                maBaiViet,
                maNhanVat,
                maThoiKy,
                maSuKien,
                maDiaDanh,
                userId,
                ipAddress,
            });

            // Nếu trigger bỏ qua (view trùng trong 5 phút), vẫn trả về success
            if (!view) {
                return res.status(200).json({
                    success: true,
                    message: "Lượt xem đã được ghi nhận trước đó",
                    skipped: true,
                });
            }

            res.status(201).json({
                success: true,
                message: "Ghi nhận lượt xem thành công",
                data: view,
            });
        } catch (error) {
            console.error("Error recording view:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi ghi nhận lượt xem",
                error: error.message,
            });
        }
    }

    // Lấy số lượt xem
    static async getViewCount(req, res) {
        try {
            const { loaiTrang, id } = req.params;

            const count = await ViewModel.getViewCount(loaiTrang, id);

            res.status(200).json({
                success: true,
                data: {
                    loaiTrang,
                    id: loaiTrang === "Website" ? null : id,
                    count,
                },
            });
        } catch (error) {
            console.error("Error getting view count:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy số lượt xem",
                error: error.message,
            });
        }
    }

    // Lấy lượt xem cho nhiều items
    static async getMultipleViewCounts(req, res) {
        try {
            const { loaiTrang } = req.params;
            const { ids } = req.body;

            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Danh sách IDs không hợp lệ",
                });
            }

            const viewCounts = await ViewModel.getMultipleViewCounts(
                loaiTrang,
                ids
            );

            res.status(200).json({
                success: true,
                data: viewCounts,
            });
        } catch (error) {
            console.error("Error getting multiple view counts:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy số lượt xem",
                error: error.message,
            });
        }
    }

    // Lấy thống kê lượt xem theo thời gian
    static async getViewStats(req, res) {
        try {
            const { loaiTrang, id } = req.params;
            const { days } = req.query;

            const stats = await ViewModel.getViewStats(
                loaiTrang,
                loaiTrang === "Website" ? null : id,
                days ? parseInt(days) : 7
            );

            res.status(200).json({
                success: true,
                data: stats,
            });
        } catch (error) {
            console.error("Error getting view stats:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy thống kê lượt xem",
                error: error.message,
            });
        }
    }
}

export default ViewController;
