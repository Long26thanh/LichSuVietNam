import React, { useState, useEffect } from 'react';
import StatsCard from '@/components/Admin/StatsCard/StatsCard';
import RecentActivity from '@/components/Admin/RecentActivity/RecentActivity';
import QuickActions from '@/components/Admin/QuickActions/QuickActions';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalEvents: 0,
        totalFigures: 0,
        totalLocations: 0,
        totalPeriods: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading stats
        const loadStats = async () => {
            setLoading(true);
            try {
                // TODO: Replace with actual API calls
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                setStats({
                    totalUsers: 1250,
                    totalEvents: 89,
                    totalFigures: 156,
                    totalLocations: 45,
                    totalPeriods: 12
                });
            } catch (error) {
                console.error('Error loading stats:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    const statsCards = [
        {
            title: 'Tổng người dùng',
            value: stats.totalUsers,
            icon: '👥',
            color: '#4CAF50',
            change: '+12%',
            changeType: 'positive'
        },
        {
            title: 'Sự kiện lịch sử',
            value: stats.totalEvents,
            icon: '📅',
            color: '#2196F3',
            change: '+5%',
            changeType: 'positive'
        },
        {
            title: 'Nhân vật lịch sử',
            value: stats.totalFigures,
            icon: '👤',
            color: '#FF9800',
            change: '+8%',
            changeType: 'positive'
        },
        {
            title: 'Địa điểm lịch sử',
            value: stats.totalLocations,
            icon: '📍',
            color: '#9C27B0',
            change: '+3%',
            changeType: 'positive'
        }
    ];

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h2>Dashboard</h2>
                <p>Tổng quan hệ thống quản lý lịch sử Việt Nam</p>
            </div>

            <div className="dashboard-content">
                {/* Stats Cards */}
                <div className="stats-grid">
                    {statsCards.map((stat, index) => (
                        <StatsCard
                            key={index}
                            title={stat.title}
                            value={stat.value}
                            icon={stat.icon}
                            color={stat.color}
                            change={stat.change}
                            changeType={stat.changeType}
                            loading={loading}
                        />
                    ))}
                </div>

                <div className="dashboard-main">
                    <div className="dashboard-left">
                        <RecentActivity />
                    </div>
                    <div className="dashboard-right">
                        <QuickActions />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
