import React from 'react';
import './AdminFigures.css';

const AdminFigures = () => {
    return (
        <div className="admin-figures">
            <div className="page-header">
                <h1>Quản lý nhân vật</h1>
                <p>Quản lý các nhân vật lịch sử trong hệ thống</p>
            </div>
            
            <div className="page-content">
                <div className="coming-soon">
                    <h2>🚧 Đang phát triển</h2>
                    <p>Trang quản lý nhân vật đang được phát triển và sẽ sớm có mặt.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminFigures;
