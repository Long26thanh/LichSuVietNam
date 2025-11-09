import React, { useState, useEffect } from "react";
import RecentActivity from "@/components/Admin/RecentActivity/RecentActivity";
import QuickActions from "@/components/Admin/QuickActions/QuickActions";
import PendingArticles from "@/components/Admin/PendingArticles/PendingArticles";
import StatsCards from "@/components/Admin/StatsCards/StatsCards";
import { DashboardCharts, MonthlyReport } from "@/components/Admin";
import { statsService } from "@/services";
import "./AdminDashboard.css";

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load stats from new API endpoint
        const loadStats = async () => {
            setLoading(true);
            try {
                const response = await statsService.getAdminStats();
                if (response.success) {
                    setStats(response.data);
                }
            } catch (error) {
                console.error("Error loading stats:", error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h2>Dashboard</h2>
                <p>Tổng quan hệ thống quản lý lịch sử Việt Nam</p>
            </div>

            <div className="dashboard-content">
                {/* Stats Cards */}
                <StatsCards stats={stats} loading={loading} />

                {/* Pending Articles Section */}
                <PendingArticles />

                {/* Dashboard Charts - Thống kê chi tiết theo ngày/tháng/năm */}
                <DashboardCharts />

                {/* Monthly Report - Báo cáo theo tháng */}
                <MonthlyReport />

                {/* <div className="dashboard-main">
                    <div className="dashboard-left">
                        <RecentActivity />
                    </div>
                    <div className="dashboard-right">
                        <QuickActions />
                    </div>
                </div> */}
            </div>
        </div>
    );
};

export default AdminDashboard;
