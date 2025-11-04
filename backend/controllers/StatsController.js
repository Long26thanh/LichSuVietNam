import Article from "../models/ArticleModel.js";
import User from "../models/UserModel.js";
import Event from "../models/EventModel.js";
import Figure from "../models/FigureModel.js";
import Location from "../models/LocationModel.js";
import Period from "../models/PeriodModel.js";
import View from "../models/ViewModel.js";
import Comment from "../models/CommentModel.js";

class StatsController {
    // Lấy thống kê tổng quan cho admin dashboard
    async getAdminStats(req, res) {
        try {
            // Debug log removed

            // Đếm tổng số bản ghi trong từng bảng
            const [
                totalArticles,
                totalUsers,
                totalEvents,
                totalFigures,
                totalLocations,
                totalPeriods,
                websiteVisits,
                totalComments,
            ] = await Promise.all([
                Article.count(),
                User.count(),
                Event.count(),
                Figure.count(),
                Location.count(),
                Period.count(),
                View.getWebsiteVisits(),
                Comment.getTotalComments(),
            ]);

            // Debug log removed

            // Đếm số bài viết theo trạng thái
            const pendingArticles = await Article.countByStatus("Chờ duyệt");
            const approvedArticles = await Article.countByStatus("Đã duyệt");
            const rejectedArticles = await Article.countByStatus("Từ chối");

            // Debug log removed

            // Lấy thống kê bài viết theo thời gian (7 ngày gần nhất)
            const recentArticlesStats = await Article.getRecentStats(7);

            // Lấy top 5 bài viết có lượt xem nhiều nhất
            const topViewedArticles = await Article.getTopViewed(5);

            // Lấy top 5 bài viết có nhiều bình luận nhất
            const topCommentedArticles = await Article.getTopCommented(5);

            const responseData = {
                success: true,
                data: {
                    overview: {
                        totalArticles,
                        totalUsers,
                        totalEvents,
                        totalFigures,
                        totalLocations,
                        totalPeriods,
                        websiteVisits,
                        totalComments,
                    },
                    articles: {
                        pending: pendingArticles,
                        approved: approvedArticles,
                        rejected: rejectedArticles,
                        recentStats: recentArticlesStats,
                    },
                    topContent: {
                        topViewedArticles,
                        topCommentedArticles,
                    },
                },
            };

            // Debug log removed
            res.json(responseData);
        } catch (error) {
            console.error("Error in getAdminStats:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy thống kê",
                error: error.message,
            });
        }
    }

    // Lấy thống kê theo khoảng thời gian
    async getStatsByDateRange(req, res) {
        try {
            const { startDate, endDate, type } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng cung cấp startDate và endDate",
                });
            }

            let stats;
            switch (type) {
                case "articles":
                    stats = await Article.getStatsByDateRange(
                        startDate,
                        endDate
                    );
                    break;
                case "views":
                    stats = await View.getStatsByDateRange(startDate, endDate);
                    break;
                case "comments":
                    stats = await Comment.getStatsByDateRange(
                        startDate,
                        endDate
                    );
                    break;
                case "users":
                    stats = await User.getStatsByDateRange(startDate, endDate);
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: "Loại thống kê không hợp lệ",
                    });
            }

            res.json({
                success: true,
                data: stats,
            });
        } catch (error) {
            console.error("Error in getStatsByDateRange:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy thống kê theo thời gian",
                error: error.message,
            });
        }
    }
}

export default new StatsController();
