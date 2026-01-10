import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Trash2, Check, ArrowLeft, MessageSquare, UserPlus, Info } from 'lucide-react';
import pushNotificationService from '../services/PushNotificationService';
import './NotificationList.css';

const NotificationList = () => {
    const [token] = useState(localStorage.getItem('token'));
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all' or 'unread'
    const navigate = useNavigate();

    // Fetch notifications
    const fetchNotifications = async () => {
        setLoading(true);
        const data = await pushNotificationService.getNotifications(token, {
            limit: 100,
            unreadOnly: filter === 'unread'
        });
        setNotifications(data.notifications || []);
        setLoading(false);
    };

    useEffect(() => {
        if (token) {
            fetchNotifications();
        }
    }, [token, filter]);

    // Handle notification click
    const handleNotificationClick = async (notification) => {
        // Mark as read if not already
        if (!notification.read) {
            await pushNotificationService.markAsRead(notification.id, token);
            // Optimistically update UI
            setNotifications(prev => prev.map(n =>
                n.id === notification.id ? { ...n, read: true } : n
            ));
            // Background refresh to be safe
            fetchNotifications();
        }

        // Navigate based on notification type
        const data = typeof notification.data === 'string'
            ? JSON.parse(notification.data)
            : notification.data;

        if (data.eventId) {
            if (notification.type === 'event_wall_post') {
                navigate(`/event/${data.eventId}/wall`);
            } else if (notification.type === 'guest_added') {
                navigate(`/event/${data.eventId}`);
            }
        }
    };

    // Delete notification
    const handleDelete = async (e, notificationId) => {
        e.stopPropagation();

        if (window.confirm('Delete this notification?')) {
            // Optimistic deletion
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            await pushNotificationService.deleteNotification(notificationId, token);
            fetchNotifications();
        }
    };

    // Mark all as read
    const handleMarkAllRead = async () => {
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        await pushNotificationService.markAllAsRead(token);
        fetchNotifications();
    };

    // Format time
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    // Get icon for notification type
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'guest_added':
                return <UserPlus size={24} />;
            case 'event_wall_post':
                return <MessageSquare size={24} />;
            default:
                return <Info size={24} />;
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="notification-list-page">
            {/* Header */}
            <div className="notification-list-header">
                <div className="header-top-row">
                    <div className="header-left">
                        <button onClick={() => navigate(-1)} className="back-btn">
                            <ArrowLeft size={24} />
                        </button>
                        <h1>Notifications</h1>
                    </div>
                    {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="mark-read-btn">
                            <Check size={16} />
                            Mark all read
                        </button>
                    )}
                </div>
            </div>

            {/* Filter */}
            <div className="notification-filter">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All
                </button>
                <button
                    className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                    onClick={() => setFilter('unread')}
                >
                    Unread {unreadCount > 0 && `(${unreadCount})`}
                </button>
            </div>

            {/* Content */}
            <div className="notification-list-content">
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading updates...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <Bell size={32} strokeWidth={1.5} />
                        </div>
                        <h3>No notifications</h3>
                        <p>
                            {filter === 'unread'
                                ? "You're all caught up! No unread notifications."
                                : "You haven't received any notifications yet."}
                        </p>
                    </div>
                ) : (
                    <div className="notification-items">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`notification-card ${!notification.read ? 'unread' : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className={`notification-icon-box type-${notification.type}`}>
                                    {getNotificationIcon(notification.type)}
                                </div>

                                <div className="notification-content">
                                    <div className="notification-title">{notification.title}</div>
                                    <div className="notification-body">{notification.body}</div>

                                    <div className="notification-meta">
                                        <span className="notification-time">{formatTime(notification.created_at)}</span>
                                        {!notification.read && <div className="unread-dot"></div>}
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => handleDelete(e, notification.id)}
                                    className="delete-btn"
                                    title="Delete notification"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationList;
