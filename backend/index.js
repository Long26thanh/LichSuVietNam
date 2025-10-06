import pg from "pg";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import path from "path";
import { testConnection } from "./config/db.js";

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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
