import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook để kiểm tra token expiration khi route thay đổi
 * Tự động logout chỉ khi token thực sự hết hạn và không thể refresh
 */
const useTokenExpirationCheck = () => {
    const location = useLocation();
    const { isAuthenticated, authService, logout } = useAuth();

    useEffect(() => {
        const checkToken = async () => {
            if (!isAuthenticated) {
                return;
            }

            try {
                // Lấy token hiện tại
                const token = authService.getToken();
                
                if (!token) {
                    return;
                }

                // Kiểm tra token có thực sự hết hạn không
                const isExpired = authService.isTokenExpired(token);
                
                if (isExpired) {
                    console.warn('Token expired on route change, attempting refresh...');
                    
                    try {
                        // Token hết hạn, thử refresh
                        await authService.refreshToken();
                        console.log('Token refreshed successfully on route change');
                    } catch (refreshError) {
                        // Refresh thất bại, logout
                        console.error('Token refresh failed on route change, logging out...', refreshError);
                        await logout();
                    }
                } else if (authService.isTokenExpiringSoon(token)) {
                    // Token sắp hết hạn, refresh ngay
                    console.log('Token expiring soon on route change, refreshing...');
                    try {
                        await authService.refreshToken();
                        console.log('Token refreshed successfully on route change');
                    } catch (refreshError) {
                        console.error('Token refresh failed on route change:', refreshError);
                        // Không logout vì token vẫn còn valid
                    }
                }
                // Nếu token vẫn còn hạn tốt, không làm gì
            } catch (error) {
                console.error('Error checking token on route change:', error);
            }
        };

        // Chạy check khi route thay đổi
        checkToken();
    }, [location.pathname, isAuthenticated, authService, logout]);
};

export default useTokenExpirationCheck;
