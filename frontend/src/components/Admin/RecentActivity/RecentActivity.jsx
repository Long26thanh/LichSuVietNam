import React, { useState, useEffect } from 'react';
import './RecentActivity.css';

const RecentActivity = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading activities
        const loadActivities = async () => {
            setLoading(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                setActivities([
                    {
                        id: 1,
                        type: 'user',
                        message: 'Người dùng mới đăng ký: Nguyễn Văn A',
                        time: '2 phút trước',
                        icon: '👤'
                    },
                    {
                        id: 2,
                        type: 'event',
                        message: 'Sự kiện mới được thêm: Chiến thắng Điện Biên Phủ',
                        time: '15 phút trước',
                        icon: '📅'
                    },
                    {
                        id: 3,
                        type: 'figure',
                        message: 'Nhân vật mới được thêm: Hồ Chí Minh',
                        time: '1 giờ trước',
                        icon: '👤'
                    },
                    {
                        id: 4,
                        type: 'location',
                        message: 'Địa điểm mới được thêm: Cố đô Huế',
                        time: '2 giờ trước',
                        icon: '📍'
                    },
                    {
                        id: 5,
                        type: 'period',
                        message: 'Thời kỳ mới được thêm: Thời kỳ Đồng Sơn',
                        time: '3 giờ trước',
                        icon: '⏰'
                    }
                ]);
            } catch (error) {
                console.error('Error loading activities:', error);
            } finally {
                setLoading(false);
            }
        };

        loadActivities();
    }, []);

    if (loading) {
        return (
            <div className="recent-activity">
                <div className="activity-header">
                    <h3>Hoạt động gần đây</h3>
                </div>
                <div className="activity-list">
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className="activity-item loading">
                            <div className="activity-icon skeleton"></div>
                            <div className="activity-content">
                                <div className="activity-message skeleton"></div>
                                <div className="activity-time skeleton"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="recent-activity">
            <div className="activity-header">
                <h3>Hoạt động gần đây</h3>
                <button className="view-all-btn">Xem tất cả</button>
            </div>
            <div className="activity-list">
                {activities.map((activity) => (
                    <div key={activity.id} className="activity-item">
                        <div className="activity-icon">
                            {activity.icon}
                        </div>
                        <div className="activity-content">
                            <p className="activity-message">{activity.message}</p>
                            <span className="activity-time">{activity.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentActivity;
