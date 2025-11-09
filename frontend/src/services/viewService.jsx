import { createApiClient } from "./apiClient";

const API_URL = "/api/views";

// Tạo axios instance với interceptor để gửi token
const apiClient = createApiClient(API_URL);

// Ghi nhận lượt xem
export const recordView = async (loaiTrang, id = null) => {
    try {
        const data = { loaiTrang };

        // Thêm ID tương ứng với loại trang
        if (loaiTrang !== "Website" && id) {
            switch (loaiTrang) {
                case "Bài viết":
                    data.maBaiViet = id;
                    break;
                case "Nhân vật":
                    data.maNhanVat = id;
                    break;
                case "Thời kỳ":
                    data.maThoiKy = id;
                    break;
                case "Sự kiện":
                    data.maSuKien = id;
                    break;
                case "Địa danh":
                    data.maDiaDanh = id;
                    break;
            }
        }

        const response = await apiClient.post("/record", data);
        return response.data;
    } catch (error) {
        console.error("Error recording view:", error);
        // Không throw error để không ảnh hưởng đến trải nghiệm người dùng
        return null;
    }
};

// Ghi nhận lượt xem website
export const recordWebsiteView = async () => {
    return await recordView("Website");
};

// Ghi nhận lượt xem bài viết
export const recordArticleView = async (articleId) => {
    return await recordView("Bài viết", articleId);
};

// Ghi nhận lượt xem nhân vật
export const recordFigureView = async (figureId) => {
    return await recordView("Nhân vật", figureId);
};

// Ghi nhận lượt xem thời kỳ
export const recordPeriodView = async (periodId) => {
    return await recordView("Thời kỳ", periodId);
};

// Ghi nhận lượt xem sự kiện
export const recordEventView = async (eventId) => {
    return await recordView("Sự kiện", eventId);
};

// Ghi nhận lượt xem địa danh
export const recordLocationView = async (locationId) => {
    return await recordView("Địa danh", locationId);
};

// Lấy số lượt xem
export const getViewCount = async (loaiTrang, id = null) => {
    try {
        const url = id
            ? `/${encodeURIComponent(loaiTrang)}/${id}`
            : `/${encodeURIComponent(loaiTrang)}`;

        const response = await apiClient.get(url);
        return response.data.data.count;
    } catch (error) {
        console.error("Error getting view count:", error);
        return 0;
    }
};

// Lấy số lượt xem cho nhiều items
export const getMultipleViewCounts = async (loaiTrang, ids) => {
    try {
        const response = await apiClient.post(
            `/${encodeURIComponent(loaiTrang)}/multiple`,
            { ids }
        );
        return response.data.data;
    } catch (error) {
        console.error("Error getting multiple view counts:", error);
        return {};
    }
};

// Lấy thống kê lượt xem
export const getViewStats = async (loaiTrang, id = null, days = 7) => {
    try {
        const url = id
            ? `/${encodeURIComponent(loaiTrang)}/${id}/stats?days=${days}`
            : `/${encodeURIComponent(loaiTrang)}/0/stats?days=${days}`;

        const response = await apiClient.get(url);
        return response.data.data;
    } catch (error) {
        console.error("Error getting view stats:", error);
        return [];
    }
};
