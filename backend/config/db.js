import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// Cấu hình kết nối cơ sở dữ liệu PostgreSQL
const dbConfig = {
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "vietnam-history",
    password: process.env.DB_PASSWORD || "",
    port: process.env.DB_PORT || 5432,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};

// Tạo một pool kết nối
const pool = new Pool(dbConfig);

// Test kết nối
const testConnection = async () => {
    try {
        const client = await pool.connect();
        client.release();
        return true;
    } catch (err) {
        console.error("Lỗi kết nối cơ sở dữ liệu:", err);
        return false;
    }
};

// Xử lý kết nối
pool.on("connect", () => {
    // console.log("Kết nối đến cơ sở dữ liệu thành công");
});

pool.on("error", (err) => {
    console.error("Lỗi kết nối cơ sở dữ liệu:", err);
    process.exit(-1);
});

// Hàm truy vấn cơ sở dữ liệu
const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        // console.log("Truy vấn thành công:", {
        //     text,
        //     duration,
        //     rows: result.rowCount,
        // });
        return result;
    } catch (err) {
        console.error("Lỗi truy vấn:", err);
        throw err;
    }
};

// Hàm lấy client từ pool
const getClient = async () => {
    try {
        const client = await pool.connect();
        return client;
    } catch (err) {
        console.error("Lỗi lấy client:", err);
        throw err;
    }
};

// Hàm đóng pool kết nối
const closePool = async () => {
    try {
        await pool.end();
    } catch (err) {
        console.error("Lỗi đóng pool:", err);
    }
};

export { pool, testConnection, query, getClient, closePool };
