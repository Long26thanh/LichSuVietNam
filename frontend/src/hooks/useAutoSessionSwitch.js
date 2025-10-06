import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const useAutoSessionSwitch = () => {
    const location = useLocation();
    const { authService } = useAuth();

    useEffect(() => {
        // Tự động chuyển đổi session type dựa trên route hiện tại
        authService.autoSwitchSessionType(location.pathname);
    }, [location.pathname, authService]);
};

export default useAutoSessionSwitch;
