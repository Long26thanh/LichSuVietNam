import Article from "../models/ArticleModel.js";

/**
 * Scheduler service để tự động publish bài viết đã lên lịch
 * Chạy mỗi phút để kiểm tra
 */
class SchedulerService {
    constructor() {
        this.isRunning = false;
        this.interval = null;
    }

    // Bắt đầu scheduler
    start() {
        if (this.isRunning) {
            console.log("Scheduler already running");
            return;
        }

        this.isRunning = true;

        // Chạy ngay lần đầu
        this.publishScheduledArticles();

        // Chạy mỗi phút
        this.interval = setInterval(() => {
            this.publishScheduledArticles();
        }, 60000); // 60000ms = 1 minute

    }

    // Dừng scheduler
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
    }

    // Xuất bản các bài viết đã đến hạn
    async publishScheduledArticles() {
        try {
            const published = await Article.publishScheduledArticles();
            
            if (published && published.length > 0) {
                console.log(`[Scheduler] Published ${published.length} scheduled article(s):`);
                published.forEach(article => {
                    console.log(`  - ID: ${article.MaBaiViet}, Title: ${article.TieuDe}`);
                });
            }
        } catch (error) {
            console.error("[Scheduler] Error publishing scheduled articles:", error);
        }
    }

    // Lấy trạng thái
    getStatus() {
        return {
            running: this.isRunning,
            intervalMs: this.interval ? 60000 : null,
        };
    }
}

// Singleton instance
const schedulerService = new SchedulerService();

export default schedulerService;
