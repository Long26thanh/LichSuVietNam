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
                Article.countAllPublishedContent(), // Đếm tất cả nội dung đã xuất bản (Bài viết + Nhân vật + Thời kỳ + Sự kiện + Địa danh)
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
            const approvedArticles = await Article.countByStatus("Đã xuất bản");
            const rejectedArticles = await Article.countByStatus("Từ chối");

            // Debug log removed

            // Lấy thống kê bài viết theo thời gian (7 ngày gần nhất) - chỉ bài viết
            const recentArticlesStats = await Article.getRecentStats(7);

            // Lấy thống kê tất cả nội dung đã xuất bản theo thời gian (7 ngày gần nhất)
            const recentAllContentStats = await Article.getRecentAllContentStats(7);

            // Lấy top 5 bài viết có lượt xem nhiều nhất (chỉ bài viết)
            const topViewedArticles = await Article.getTopViewed(5);

            // Lấy top 5 bài viết có nhiều bình luận nhất (chỉ bài viết)
            const topCommentedArticles = await Article.getTopCommented(5);

            // Lấy top 10 content có lượt xem nhiều nhất (tất cả loại trang)
            const topViewedAllContent = await Article.getTopViewedAllContent(10);

            // Lấy top 10 content có nhiều bình luận nhất (tất cả loại trang)
            const topCommentedAllContent = await Article.getTopCommentedAllContent(10);

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
                    allContent: {
                        recentStats: recentAllContentStats, // Thống kê tất cả nội dung theo thời gian
                    },
                    topContent: {
                        topViewedArticles, // Top 5 chỉ bài viết
                        topCommentedArticles, // Top 5 chỉ bài viết
                        topViewedAllContent, // Top 10 tất cả loại
                        topCommentedAllContent, // Top 10 tất cả loại
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

    // Lấy thống kê Dashboard chi tiết theo ngày/tháng/năm
    async getDashboardStats(req, res) {
        try {
            const { period = "month", startDate, endDate } = req.query;

            // Tính toán khoảng thời gian mặc định
            let start, end;
            const now = new Date();

            if (startDate && endDate) {
                start = new Date(startDate);
                end = new Date(endDate);
            } else {
                end = now;
                switch (period) {
                    case "day":
                        start = new Date(now);
                        start.setHours(0, 0, 0, 0);
                        break;
                    case "week":
                        start = new Date(now);
                        start.setDate(start.getDate() - 7);
                        break;
                    case "month":
                        start = new Date(now);
                        start.setMonth(start.getMonth() - 1);
                        break;
                    case "year":
                        start = new Date(now);
                        start.setFullYear(start.getFullYear() - 1);
                        break;
                    default:
                        start = new Date(now);
                        start.setMonth(start.getMonth() - 1);
                }
            }

            // Lấy thống kê bài viết theo thời gian
            const articlesStats = await Article.getDetailedStatsByPeriod(
                start,
                end,
                period
            );

            // Lấy thống kê tất cả nội dung theo thời gian
            const allContentStats = await Article.getAllContentDetailedStatsByPeriod(
                start,
                end,
                period
            );

            // Lấy bài viết có lượt xem cao nhất trong khoảng thời gian
            const topViewedArticles = await Article.getTopViewedByPeriod(
                start,
                end,
                10
            );

            // Lấy bài viết có nhiều bình luận nhất trong khoảng thời gian
            const topCommentedArticles = await Article.getTopCommentedByPeriod(
                start,
                end,
                10
            );

            // Lấy thống kê lượt truy cập website theo thời gian
            const viewsStats = await View.getDetailedStatsByPeriod(
                start,
                end,
                period
            );

            // Lấy thống kê bình luận theo thời gian
            const commentsStats = await Comment.getDetailedStatsByPeriod(
                start,
                end,
                period
            );

            // Lấy thống kê người dùng mới
            const usersStats = await User.getDetailedStatsByPeriod(
                start,
                end,
                period
            );

            // Lấy top content tất cả loại trang
            const topViewedAllContent = await Article.getTopViewedAllContent(10);
            const topCommentedAllContent = await Article.getTopCommentedAllContent(10);

            // Thống kê tổng quan cho khoảng thời gian
            const periodOverview = {
                totalArticlesPublished: await Article.countByDateRange(
                    start,
                    end,
                    "Đã xuất bản"
                ),
                totalAllContentPublished: await Article.countAllContentByDateRange(
                    start,
                    end
                ), // Tổng số tất cả nội dung đã xuất bản (Bài viết + Nhân vật + Thời kỳ + Sự kiện + Địa danh)
                totalPendingArticles: await Article.countByDateRange(
                    start,
                    end,
                    "Chờ duyệt"
                ),
                totalViews: await View.countByDateRange(start, end),
                totalComments: await Comment.countByDateRange(start, end),
                totalNewUsers: await User.countByDateRange(start, end),
            };

            res.json({
                success: true,
                data: {
                    period,
                    startDate: start,
                    endDate: end,
                    overview: periodOverview,
                    charts: {
                        articles: articlesStats,
                        allContent: allContentStats, // Thống kê tất cả nội dung
                        views: viewsStats,
                        comments: commentsStats,
                        users: usersStats,
                    },
                    topContent: {
                        topViewedArticles,
                        topCommentedArticles,
                        topViewedAllContent, // Thêm mới: tất cả loại trang
                        topCommentedAllContent, // Thêm mới: tất cả loại trang
                    },
                },
            });
        } catch (error) {
            console.error("Error in getDashboardStats:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy thống kê dashboard",
                error: error.message,
            });
        }
    }

    // Lấy thống kê theo tháng trong năm
    async getMonthlyStats(req, res) {
        try {
            const { year = new Date().getFullYear() } = req.query;

            const stats = {
                articles: [],
                allContent: [], // Thêm thống kê tất cả nội dung
                views: [],
                comments: [],
                users: [],
            };

            // Lấy thống kê cho 12 tháng
            for (let month = 0; month < 12; month++) {
                const startDate = new Date(year, month, 1);
                const endDate = new Date(year, month + 1, 0, 23, 59, 59);

                const [articleCount, allContentCount, viewCount, commentCount, userCount] =
                    await Promise.all([
                        Article.countByDateRange(startDate, endDate, "Đã xuất bản"),
                        Article.countAllContentByDateRange(startDate, endDate), // Đếm tất cả nội dung
                        View.countByDateRange(startDate, endDate),
                        Comment.countByDateRange(startDate, endDate),
                        User.countByDateRange(startDate, endDate),
                    ]);

                stats.articles.push({
                    month: month + 1,
                    count: articleCount,
                });
                stats.allContent.push({
                    month: month + 1,
                    count: allContentCount,
                });
                stats.views.push({
                    month: month + 1,
                    count: viewCount,
                });
                stats.comments.push({
                    month: month + 1,
                    count: commentCount,
                });
                stats.users.push({
                    month: month + 1,
                    count: userCount,
                });
            }

            res.json({
                success: true,
                data: {
                    year: parseInt(year),
                    stats,
                },
            });
        } catch (error) {
            console.error("Error in getMonthlyStats:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy thống kê theo tháng",
                error: error.message,
            });
        }
    }

    // Lấy thống kê theo ngày trong tháng
    async getDailyStats(req, res) {
        try {
            const { year, month } = req.query;

            if (!year || !month) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu tham số year hoặc month",
                });
            }

            const daysInMonth = new Date(year, month, 0).getDate();
            const stats = {
                articles: [],
                allContent: [],
                views: [],
                comments: [],
                users: [],
            };

            // Lấy thống kê cho từng ngày trong tháng
            for (let day = 1; day <= daysInMonth; day++) {
                const startDate = new Date(year, month - 1, day, 0, 0, 0);
                const endDate = new Date(year, month - 1, day, 23, 59, 59);

                const [articleCount, allContentCount, viewCount, commentCount, userCount] =
                    await Promise.all([
                        Article.countByDateRange(startDate, endDate, "Đã xuất bản"),
                        Article.countAllContentByDateRange(startDate, endDate),
                        View.countByDateRange(startDate, endDate),
                        Comment.countByDateRange(startDate, endDate),
                        User.countByDateRange(startDate, endDate),
                    ]);

                stats.articles.push({
                    day: day,
                    count: articleCount,
                });
                stats.allContent.push({
                    day: day,
                    count: allContentCount,
                });
                stats.views.push({
                    day: day,
                    count: viewCount,
                });
                stats.comments.push({
                    day: day,
                    count: commentCount,
                });
                stats.users.push({
                    day: day,
                    count: userCount,
                });
            }

            res.json({
                success: true,
                data: {
                    year: parseInt(year),
                    month: parseInt(month),
                    daysInMonth,
                    stats,
                },
            });
        } catch (error) {
            console.error("Error in getDailyStats:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy thống kê theo ngày",
                error: error.message,
            });
        }
    }

    // Lấy danh sách chi tiết các bài viết/nội dung theo tháng
    async getMonthlyDetailedContent(req, res) {
        try {
            const { year, month, type = 'all' } = req.query;

            if (!year || !month) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu tham số year hoặc month",
                });
            }

            const startDate = new Date(year, month - 1, 1, 0, 0, 0);
            const endDate = new Date(year, month, 0, 23, 59, 59);

            let data = {};

            // Lấy danh sách content theo type
            if (type === 'all' || type === 'views') {
                // Top content có lượt xem cao nhất trong tháng
                const topViewedContent = await Article.getTopViewedAllContentByDateRange(
                    startDate,
                    endDate,
                    50 // Lấy top 50
                );
                data.topViewedContent = topViewedContent;
            }

            if (type === 'all' || type === 'comments') {
                // Top content có nhiều bình luận nhất trong tháng
                const topCommentedContent = await Article.getTopCommentedAllContentByDateRange(
                    startDate,
                    endDate,
                    50
                );
                data.topCommentedContent = topCommentedContent;
            }

            if (type === 'all' || type === 'users') {
                // Người dùng mới trong tháng
                const newUsers = await User.getNewUsersByDateRange(
                    startDate,
                    endDate
                );
                data.newUsers = newUsers;
            }

            if (type === 'all' || type === 'content') {
                // Nội dung mới trong tháng (phân loại)
                const [articles, figures, events, locations, periods] = await Promise.all([
                    Article.getByDateRange(startDate, endDate, "Đã xuất bản"),
                    Figure.getByDateRange(startDate, endDate),
                    Event.getByDateRange(startDate, endDate),
                    Location.getByDateRange(startDate, endDate),
                    Period.getByDateRange(startDate, endDate),
                ]);

                data.newContent = {
                    articles: articles || [],
                    figures: figures || [],
                    events: events || [],
                    locations: locations || [],
                    periods: periods || [],
                    total: (articles?.length || 0) + (figures?.length || 0) + 
                           (events?.length || 0) + (locations?.length || 0) + 
                           (periods?.length || 0),
                };
            }

            res.json({
                success: true,
                data: {
                    year: parseInt(year),
                    month: parseInt(month),
                    period: {
                        start: startDate,
                        end: endDate,
                    },
                    ...data,
                },
            });
        } catch (error) {
            console.error("Error in getMonthlyDetailedContent:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi khi lấy danh sách chi tiết theo tháng",
                error: error.message,
            });
        }
    }
}

export default new StatsController();
