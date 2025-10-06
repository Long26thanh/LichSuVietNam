import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from '@/components/Admin/AdminSidebar/AdminSidebar';
import AdminHeader from '@/components/Admin/AdminHeader/AdminHeader';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const { user, logout, isAuthenticated, sessionType, isAdminSession, switchSessionType } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Tự động chuyển đổi session type khi vào trang admin
    useEffect(() => {
        if (sessionType !== 'admin') {
            console.log('Auto switching to admin session in AdminLayout');
            switchSessionType('admin');
        }
    }, [sessionType, switchSessionType]);

    // Kiểm tra authentication trong useEffect
    useEffect(() => {
        const checkAuth = () => {
            // Kiểm tra nếu user chưa đăng nhập hoặc không phải admin/sa
            const isAdminRole = user && (user.role === 'admin' || user.role === 'sa');
            if (!isAuthenticated || !user || !isAdminRole) {
                navigate('/admin', { replace: true });
                return;
            }
            
            // Kiểm tra session type
            if (!isAdminSession || sessionType !== 'admin') {
                navigate('/admin', { replace: true });
                return;
            }
            
            setIsCheckingAuth(false);
        };

        checkAuth();
    }, [isAuthenticated, user, navigate, sessionType, isAdminSession]);

    // Hiển thị loading khi đang kiểm tra authentication
    if (isCheckingAuth) {
        return (
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

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/admin');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="admin-layout">
            <AdminSidebar 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)}
                currentPath={location.pathname}
            />
            <div className={`admin-main ${sidebarOpen ? 'sidebar-open' : ''}`}>
                <AdminHeader 
                    user={user}
                    onToggleSidebar={toggleSidebar}
                    onLogout={handleLogout}
                />
                <main className="admin-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
