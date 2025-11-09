import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import userService from "@/services/userService";
import * as icons from "@/assets/icons";
import "./Profile.css";

const Profile = () => {
    const { user: authUser, updateUser } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [user, setUser] = useState(authUser);
    const [userStats, setUserStats] = useState({
        saved_posts: 0,
        favorite_events: 0,
        favorite_figures: 0,
        visited_locations: 0,
    });
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        bio: "",
        location: "",
        birth_date: "",
    });
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Load user data and stats on component mount
    useEffect(() => {
        const loadUserData = async () => {
            try {
                setInitialLoading(true);
                setMessage({ type: "", text: "" });

                // Load user profile and stats in parallel
                const [userResponse, statsResponse] = await Promise.all([
                    userService.getCurrentUser(),
                    userService.getUserStats(),
                ]);

                if (userResponse.success) {
                    const userData = userResponse.user;
                    setUser(userData);

                    // Update form data with user info
                    setFormData({
                        full_name: userData.full_name || "",
                        email: userData.email || "",
                        phone: userData.phone || "",
                        bio: userData.bio || "",
                        location: userData.location || "",
                        birth_date: userData.birth_date || "",
                    });

                    // Hiển thị thông báo nếu dữ liệu được lấy từ cache
                    if (userResponse.isOfflineData) {
                        setMessage({
                            type: "warning",
                            text: "Hiển thị dữ liệu từ bộ nhớ cache. Kết nối mạng để cập nhật mới nhất.",
                        });
                    }
                } else {
                    setMessage({
                        type: "error",
                        text:
                            userResponse.message ||
                            "Không thể tải thông tin người dùng",
                    });
                }

                if (statsResponse.success) {
                    setUserStats(statsResponse.data);
                }
            } catch (error) {
                console.error("Error loading user data:", error);
                setMessage({
                    type: "error",
                    text: "Có lỗi xảy ra khi tải thông tin người dùng.",
                });
            } finally {
                setInitialLoading(false);
            }
        };

        loadUserData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const response = await userService.updateCurrentUser(formData);

            if (response.success) {
                // Update local user state
                setUser(response.user);

                // Update auth context if needed
                if (updateUser) {
                    updateUser(response.user);
                }

                setMessage({
                    type: "success",
                    text: "Cập nhật thông tin thành công!",
                });
                setIsEditing(false);
            } else {
                setMessage({
                    type: "error",
                    text:
                        response.message ||
                        "Có lỗi xảy ra khi cập nhật thông tin.",
                });
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            const errorMessage =
                error.response?.data?.message ||
                "Có lỗi xảy ra khi cập nhật thông tin.";
            setMessage({ type: "error", text: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            full_name: user?.full_name || "",
            email: user?.email || "",
            phone: user?.phone || "",
            bio: user?.bio || "",
            location: user?.location || "",
            birth_date: user?.birth_date || "",
        });
        setIsEditing(false);
        setMessage({ type: "", text: "" });
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                setMessage({ type: "info", text: "Đang tải ảnh đại diện..." });

                const response = await userService.uploadAvatar(file);

                if (response.success) {
                    // Update user avatar
                    const updatedUser = {
                        ...user,
                        avatar_url: response.avatar_url,
                    };
                    setUser(updatedUser);

                    // Update auth context
                    if (updateUser) {
                        updateUser(updatedUser);
                    }

                    setMessage({
                        type: "success",
                        text: "Cập nhật ảnh đại diện thành công!",
                    });
                } else {
                    setMessage({
                        type: "error",
                        text: response.message || "Có lỗi xảy ra khi tải ảnh.",
                    });
                }
            } catch (error) {
                console.error("Error uploading avatar:", error);
                setMessage({
                    type: "error",
                    text: "Tính năng tải ảnh đại diện sẽ được cập nhật sớm.",
                });
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Chưa cập nhật";
        try {
            return new Date(dateString).toLocaleDateString("vi-VN");
        } catch {
            return "Chưa cập nhật";
        }
    };

    const getInitials = (name) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Show loading state while fetching initial data
    if (initialLoading) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <div className="profile-loading">
                        <div className="loading-spinner"></div>
                        <p>Đang tải thông tin người dùng...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                {/* Header */}
                <div className="profile-header">
                    <button
                        className="back-button"
                        onClick={() => navigate(-1)}
                    >
                        ← Quay lại
                    </button>
                    <h1 className="profile-title">Hồ sơ cá nhân</h1>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`profile-message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="profile-content">
                    {/* Avatar Section */}
                    <div className="profile-avatar-section">
                        <div className="profile-avatar-container">
                            <div
                                className="profile-avatar"
                                onClick={handleAvatarClick}
                            >
                                {user?.avatar_url ? (
                                    <img
                                        src={user.avatar_url}
                                        alt="Avatar"
                                        className="avatar-image"
                                    />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {getInitials(user?.full_name)}
                                    </div>
                                )}
                                <div className="avatar-overlay">
                                    <img src={icons.settings} alt="Change" />
                                </div>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                style={{ display: "none" }}
                            />
                        </div>
                        <div className="profile-avatar-info">
                            <h2 className="profile-name">
                                {user?.full_name || "Người dùng"}
                            </h2>
                            <p className="profile-email">
                                {user?.email || "user@example.com"}
                            </p>
                            <p className="profile-join-date">
                                Tham gia từ: {formatDate(user?.created_at)}
                            </p>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <div className="profile-form-section">
                        <div className="profile-form-header">
                            <h3>Thông tin cá nhân</h3>
                            {!isEditing ? (
                                <button
                                    className="edit-button"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <img src={icons.settings} alt="Edit" />
                                    Chỉnh sửa
                                </button>
                            ) : (
                                <div className="edit-actions">
                                    <button
                                        className="cancel-button"
                                        onClick={handleCancel}
                                        disabled={loading}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        className="save-button"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                    >
                                        {loading ? "Đang lưu..." : "Lưu"}
                                    </button>
                                </div>
                            )}
                        </div>

                        <form className="profile-form" onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="full_name">Họ và tên</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            id="full_name"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleInputChange}
                                            placeholder="Nhập họ và tên"
                                        />
                                    ) : (
                                        <div className="form-value">
                                            {user?.full_name || "Chưa cập nhật"}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="Nhập email"
                                        />
                                    ) : (
                                        <div className="form-value">
                                            {user?.email || "Chưa cập nhật"}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone">Số điện thoại</label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="Nhập số điện thoại"
                                        />
                                    ) : (
                                        <div className="form-value">
                                            {user?.phone || "Chưa cập nhật"}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="birth_date">
                                        Ngày sinh
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            id="birth_date"
                                            name="birth_date"
                                            value={formData.birth_date}
                                            onChange={handleInputChange}
                                        />
                                    ) : (
                                        <div className="form-value">
                                            {formatDate(user?.birth_date)}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="location">Địa chỉ</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            id="location"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            placeholder="Nhập địa chỉ"
                                        />
                                    ) : (
                                        <div className="form-value">
                                            {user?.location || "Chưa cập nhật"}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group full-width">
                                    <label htmlFor="bio">Giới thiệu</label>
                                    {isEditing ? (
                                        <textarea
                                            id="bio"
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            placeholder="Viết vài dòng giới thiệu về bản thân..."
                                            rows="4"
                                        />
                                    ) : (
                                        <div className="form-value">
                                            {user?.bio || "Chưa cập nhật"}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Account Stats */}
                    {/* <div className="profile-stats-section">
                        <h3>Thống kê tài khoản</h3>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <div className="stat-icon">
                                    <img src={icons.timeline} alt="Timeline" />
                                </div>
                                <div className="stat-info">
                                    <div className="stat-value">
                                        {userStats.saved_posts}
                                    </div>
                                    <div className="stat-label">
                                        Bài viết đã lưu
                                    </div>
                                </div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-icon">
                                    <img src={icons.events} alt="Events" />
                                </div>
                                <div className="stat-info">
                                    <div className="stat-value">
                                        {userStats.favorite_events}
                                    </div>
                                    <div className="stat-label">
                                        Sự kiện quan tâm
                                    </div>
                                </div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-icon">
                                    <img src={icons.user} alt="Figures" />
                                </div>
                                <div className="stat-info">
                                    <div className="stat-value">
                                        {userStats.favorite_figures}
                                    </div>
                                    <div className="stat-label">
                                        Nhân vật yêu thích
                                    </div>
                                </div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-icon">
                                    <img
                                        src={icons.locations}
                                        alt="Locations"
                                    />
                                </div>
                                <div className="stat-info">
                                    <div className="stat-value">
                                        {userStats.visited_locations}
                                    </div>
                                    <div className="stat-label">
                                        Địa danh đã thăm
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default Profile;
