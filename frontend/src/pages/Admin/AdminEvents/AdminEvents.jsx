import React from 'react';
import './AdminEvents.css';

const AdminEvents = () => {
    return (
        <div className="admin-events">
            <div className="page-header">
                <h1>Quản lý sự kiện</h1>
                <p>Quản lý các sự kiện lịch sử trong hệ thống</p>
            </div>
            
            <div className="page-content">
                <div className="coming-soon">
                    <h2>🚧 Đang phát triển</h2>
                    <p>Trang quản lý sự kiện đang được phát triển và sẽ sớm có mặt.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminEvents;
