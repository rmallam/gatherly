import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import pushNotificationService from '../services/PushNotificationService';
import './NotificationCenter.css';

const NotificationCenter = ({ authToken }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Fetch unread count
    const fetchUnreadCount = async () => {
        if (!authToken) return;

        const count = await pushNotificationService.getUnreadCount(authToken);
        setUnreadCount(count);
    };

    // Fetch notifications
    const fetchNotifications = async () => {
        if (!authToken) return;

        setLoading(true);
        const data = await pushNotificationService.getNotifications(authToken, { limit: 10 });
        setNotifications(data.notifications || []);
        setLoading(false);
    };

    // Load unread count on mount and set interval
    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Update every 30 seconds

        return () => clearInterval(interval);
    }, [authToken]);

    // Load notifications when dropdown opens
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, authToken]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Handle notification click
    const handleNotificationClick = async (notification) => {
        // Mark as read
        if (!notification.read) {
            await pushNotificationService.markAsRead(notification.id, authToken);
            fetchUnreadCount();
            fetchNotifications();
        }

        // Navigate based on notification type
        const data = typeof notification.data === 'string'
            ? JSON.parse(notification.data)
            : notification.data;

        setIsOpen(false);

        if (data.eventId) {
            if (notification.type === 'event_wall_post') {
                navigate(`/event-wall/${data.eventId}`);
            } else if (notification.type === 'guest_added') {
                navigate(`/events/${data.eventId}`);
            }
        }
    };

    // Mark all as read
    const handleMarkAllRead = async () => {
        await pushNotificationService.markAllAsRead(authToken);
        fetchUnreadCount();
        fetchNotifications();
    };

    // Format time ago
    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const time = new Date(timestamp);
        const seconds = Math.floor((now - time) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

        return time.toLocaleDateString();
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

    return (
        <div className="notification-center" ref={dropdownRef}>
            <button
                className="notification-bell-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        {notifications.length > 0 && (
                            <button onClick={handleMarkAllRead} className="mark-all-read-btn">
                                <CheckCheck size={16} />
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="notification-list">
                        {loading ? (
                            <div className="notification-loading">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="notification-empty">
                                <Bell size={48} opacity={0.3} />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="notification-icon">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="notification-content">
                                        <div className="notification-title">{notification.title}</div>
                                        <div className="notification-body">{notification.body}</div>
                                        <div className="notification-time">{formatTimeAgo(notification.created_at)}</div>
                                    </div>
                                    {!notification.read && (
                                        <div className="notification-unread-dot"></div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="notification-footer">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate('/notifications');
                                }}
                                className="view-all-btn"
                            >
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
