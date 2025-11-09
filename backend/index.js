import pg from "pg";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import path from "path";
import { fileURLToPath } from "url";
import { testConnection } from "./config/db.js";
import schedulerService from "./services/schedulerService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tải biến môi trường từ file .env
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const app = express();
const PORT = process.env.PORT || 3001;

// Cors middleware
app.use((req, res, next) => {
    const allowOrigin = ["http://localhost:5173"];
    const origin = req.headers.origin;

    res.header(
        "Access-Control-Allow-Origin",
        allowOrigin.includes(origin) ? origin : ""
    );

    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control"
    );

    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
    );

    res.header("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});

// Middleware để phân tích body của yêu cầu
// Tăng giới hạn kích thước để hỗ trợ upload ảnh base64 lớn từ frontend
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser());

// Serve static images from frontend/src/assets/images
app.use('/assets/images', express.static(path.join(__dirname, '../frontend/src/assets/images')));

// Thêm error handler cho trường hợp payload quá lớn để trả về thông điệp rõ ràng
app.use((err, req, res, next) => {
    if (err && err.type === "entity.too.large") {
        return res.status(413).json({
            success: false,
            message:
                "Payload too large. Vui lòng gửi ảnh nhỏ hơn hoặc dùng upload file thay vì base64.",
        });
    }
    return next(err);
});

// Đăng ký các routes
routes(app);

// Khởi động server
const startServer = async () => {
    try {
        console.log("Đang khởi động server...");
        try {
            const connected = await testConnection();
            if (connected) {
                app.listen(PORT, () => {
                    console.log(`Server đang chạy trên cổng ${PORT}`);
                    
                    // Khởi động scheduler để tự động xuất bản bài viết đã lên lịch
                    schedulerService.start();
                });
            } else {
                console.error(
                    "Không thể kết nối đến cơ sở dữ liệu. Dừng server."
                );
                process.exit(1);
            }
        } catch (err) {
            console.error("Lỗi kết nối cơ sở dữ liệu:", err);
            process.exit(1);
        }
    } catch (error) {
        console.error("Lỗi khởi động server:", error);
        process.exit(1);
    }
};

startServer();
