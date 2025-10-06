export const getServerConfig = () => {
    return {
        port: process.env.PORT || 5000,
        nodeEnv: process.env.NODE_ENV || "development",
        jwtSecret: process.env.JWT_SECRET || "your_jwt_secret",
        jwtRefresh: process.env.JWT_REFRESH_SECRET || "your_jwt_refresh_secret",
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m", // 15 phút
        jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d", // 7 ngày
    };
};
