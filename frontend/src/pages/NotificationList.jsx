import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Trash2, Check, ArrowLeft } from 'lucide-react';
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
        // Mark as read
        if (!notification.read) {
            await pushNotificationService.markAsRead(notification.id, token);
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
            await pushNotificationService.deleteNotification(notificationId, token);
            fetchNotifications();
        }
    };

    // Mark all as read
    const handleMarkAllRead = async () => {
        await pushNotificationService.markAllAsRead(token);
        fetchNotifications();
    };

    // Format time
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    // Get icon for notification type
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'guest_added':
                return '🎉';
            case 'event_wall_post':
                return '💬';
            default:
                return '🔔';
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="notification-list-page">
            <div className="notification-list-header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <ArrowLeft size={24} />
                </button>
                <h1>Notifications</h1>
                <div className="notification-list-actions">
                    {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="mark-read-btn">
                            <Check size={18} />
                            Mark all read
                        </button>
                    )}
                </div>
            </div>

            <div className="notification-filter">
                <button
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => setFilter('all')}
                >
                    All ({notifications.length})
                </button>
                <button
                    className={filter === 'unread' ? 'active' : ''}
                    onClick={() => setFilter('unread')}
                >
                    Unread ({unreadCount})
                </button>
            </div>

            <div className="notification-list-content">
                {loading ? (
                    <div className="notification-list-loading">
                        <div className="spinner"></div>
                        <p>Loading notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="notification-list-empty">
                        <Bell size={64} opacity={0.2} />
                        <h3>No notifications</h3>
                        <p>
                            {filter === 'unread'
                                ? 'You\'re all caught up!'
                                : 'You haven\'t received any notifications yet.'}
                        </p>
                    </div>
                ) : (
                    <div className="notification-items">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`notification-list-item ${!notification.read ? 'unread' : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="notification-list-icon">
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className="notification-list-content-inner">
                                    <div className="notification-list-title">{notification.title}</div>
                                    <div className="notification-list-body">{notification.body}</div>
                                    <div className="notification-list-time">{formatTime(notification.created_at)}</div>
                                </div>
                                <div className="notification-list-actions-inner">
                                    {!notification.read && (
                                        <div className="notification-list-unread-dot"></div>
                                    )}
                                    <button
                                        onClick={(e) => handleDelete(e, notification.id)}
                                        className="delete-notification-btn"
                                        aria-label="Delete notification"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationList;
