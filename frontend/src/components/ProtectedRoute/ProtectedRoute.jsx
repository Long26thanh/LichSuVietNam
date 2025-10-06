import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import config from '@/config';

const ProtectedRoute = ({ 
    children, 
    requireAuth = true, 
    requireRole = null, 
    requireSessionType = null, // "admin" hoặc "user"
    redirectTo = null,
    fallback = null 
}) => {
    const { user, isAuthenticated, isLoading, sessionType, isAdminSession } = useAuth();
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAccess = async () => {
            // Nếu đang loading, chờ
            if (isLoading) {
                return;
            }

            // Nếu không yêu cầu auth, cho phép truy cập
            if (!requireAuth) {
                setIsChecking(false);
                return;
            }

            // Nếu chưa đăng nhập
            if (!isAuthenticated || !user) {
                const redirectPath = redirectTo || config.routes.login;
                navigate(redirectPath, { replace: true });
                return;
            }

            // Nếu yêu cầu role cụ thể
            if (requireRole) {
                // Role "sa" được xử lý như "admin"
                if (requireRole === "admin" && user.role !== "admin" && user.role !== "sa") {
                    const redirectPath = redirectTo || config.routes.home;
                    navigate(redirectPath, { replace: true });
                    return;
                } else if (requireRole !== "admin" && user.role !== requireRole) {
                    const redirectPath = redirectTo || config.routes.home;
                    navigate(redirectPath, { replace: true });
                    return;
                }
            }

            // Nếu yêu cầu session type cụ thể
            if (requireSessionType) {
                if (requireSessionType === "admin" && (!isAdminSession || sessionType !== "admin")) {
                    // Yêu cầu phiên admin nhưng không có phiên admin
                    const redirectPath = redirectTo || config.routes.admin;
                    navigate(redirectPath, { replace: true });
                    return;
                } else if (requireSessionType === "user" && (isAdminSession || sessionType === "admin")) {
                    // Yêu cầu phiên user nhưng đang ở phiên admin
                    const redirectPath = redirectTo || config.routes.home;
                    navigate(redirectPath, { replace: true });
                    return;
                }
            }

            // Cho phép truy cập
            setIsChecking(false);
        };

        checkAccess();
    }, [isAuthenticated, user, isLoading, requireAuth, requireRole, requireSessionType, sessionType, isAdminSession, redirectTo, navigate]);

    // Hiển thị loading khi đang kiểm tra
    if (isLoading || isChecking) {
        return fallback || (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <div>Đang kiểm tra quyền truy cập...</div>
            </div>
        );
    }

    // Nếu không có quyền truy cập, không render gì (đã redirect)
    if (requireAuth && (!isAuthenticated || !user || 
        (requireRole === "admin" && user.role !== "admin" && user.role !== "sa") ||
        (requireRole && requireRole !== "admin" && user.role !== requireRole) ||
        (requireSessionType === "admin" && (!isAdminSession || sessionType !== "admin")) ||
        (requireSessionType === "user" && (isAdminSession || sessionType === "admin")))) {
        return null;
    }

    return children;
};

export default ProtectedRoute;



