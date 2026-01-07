import OneSignal from 'onesignal-cordova-plugin';
import API_URL from '../config/api';

const ONESIGNAL_APP_ID = 'a2ee0c7f-460f-4d5e-a36f-635a0492d6b5';

class PushNotificationService {
    constructor() {
        this.initialized = false;
        this.userId = null;
        this.playerId = null;
    }

    /**
     * Get OneSignal instance (works for Cordova/Capacitor)
     */
    getOneSignal() {
        // For Cordova/Capacitor, OneSignal is available on window.plugins
        return window.plugins?.OneSignal || window.OneSignal;
    }

    /**
     * Initialize OneSignal
     */
    async initialize() {
        if (this.initialized) {
            console.log('OneSignal already initialized');
            return;
        }

        // Wait for device to be ready
        await this.waitForOneSignal();

        try {
            console.log('🔔 Initializing OneSignal...');

            // Initialize OneSignal (v5.x API)
            window.plugins.OneSignal.initialize(ONESIGNAL_APP_ID);

            // Set up notification handlers
            this.setupNotificationHandlers();

            // Request permission
            console.log('📱 Requesting notification permission...');
            window.plugins.OneSignal.Notifications.requestPermission(true).then((accepted) => {
                console.log('📱 Notification permission:', accepted ? 'Granted' : 'Denied');
            });

            this.initialized = true;
            console.log('✅ OneSignal initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing OneSignal:', error);
        }
    }

    /**
     * Wait for OneSignal to be available
     */
    async waitForOneSignal() {
        return new Promise((resolve) => {
            if (window.plugins?.OneSignal) {
                resolve();
                return;
            }

            // Poll for OneSignal availability
            const checkInterval = setInterval(() => {
                if (window.plugins?.OneSignal) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);

            // Timeout after 10 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
                if (!window.plugins?.OneSignal) {
                    console.error('❌ OneSignal not available after timeout');
                }
                resolve();
            }, 10000);
        });
    }

    /**
     * Setup notification event handlers
     */
    setupNotificationHandlers() {
        // Handle notification received (foreground) - v5 API
        window.plugins.OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
            console.log('📨 Notification will display in foreground:', event);
            // Let it display
            event.preventDefault();
            event.notification.display();
        });

        // Handle notification opened/tapped - v5 API
        window.plugins.OneSignal.Notifications.addEventListener('click', (event) => {
            console.log('👆 Notification clicked:', event);
            const data = event.notification.additionalData;

            if (data) {
                this.handleNotificationTap(data);
            }
        });
    }

    /**
     * Handle notification tap - navigate to appropriate screen
     */
    handleNotificationTap(data) {
        console.log('📱 Handling notification tap:', data);

        switch (data.type) {
            case 'guest_added':
                // Navigate to event details
                if (data.eventId) {
                    window.location.href = `/event/${data.eventId}`;
                }
                break;

            case 'event_wall_post':
                // Navigate to event wall
                if (data.eventId) {
                    window.location.href = `/event/${data.eventId}/wall`;
                }
                break;

            default:
                console.log('Unknown notification type:', data.type);
        }
    }

    /**
     * Register device with backend after user logs in
     */
    async registerDevice(userId, authToken) {
        try {
            this.userId = userId;

            // Get OneSignal subscription ID (player ID in v5)
            const subscriptionId = await window.plugins.OneSignal.User.pushSubscription.getIdAsync();

            if (!subscriptionId) {
                console.error('No OneSignal subscription ID available');
                return;
            }

            this.playerId = subscriptionId;
            console.log('📱 OneSignal Subscription ID:', this.playerId);

            // Determine platform
            const platform = this.getPlatform();

            // Register with backend
            const response = await fetch(`${API_URL}/notifications/register-device`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    playerId: this.playerId,
                    platform: platform
                })
            });

            if (!response.ok) {
                throw new Error('Failed to register device');
            }

            // Set external user ID in OneSignal (v5 API)
            window.plugins.OneSignal.login(userId);

            console.log('✅ Device registered successfully');
        } catch (error) {
            console.error('❌ Error registering device:', error);
        }
    }

    /**
     * Unregister device (on logout)
     */
    async unregisterDevice() {
        try {
            if (!this.playerId) {
                return;
            }

            // Logout from OneSignal (v5 API)
            window.plugins.OneSignal.logout();

            console.log('✅ Device unregistered');
            this.userId = null;
        } catch (error) {
            console.error('❌ Error unregistering device:', error);
        }
    }

    /**
     * Get unread notification count
     */
    async getUnreadCount(authToken) {
        try {
            const response = await fetch(`${API_URL}/notifications/unread-count`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data.count || 0;
            }
            return 0;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            return 0;
        }
    }

    /**
     * Get current platform
     */
    getPlatform() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;

        if (/android/i.test(userAgent)) {
            return 'android';
        }

        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            return 'ios';
        }

        return 'web';
    }

    /**
     * Get unread notification count from backend
     */
    async getUnreadCount(authToken) {
        try {
            const response = await fetch(`${API_URL}/notifications/unread-count`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get unread count');
            }

            const data = await response.json();
            return data.count || 0;
        } catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
    }

    /**
     * Fetch notifications from backend
     */
    async getNotifications(authToken, options = {}) {
        try {
            const { limit = 20, offset = 0, unreadOnly = false } = options;

            const params = new URLSearchParams({
                limit: limit.toString(),
                offset: offset.toString(),
                unreadOnly: unreadOnly.toString()
            });

            const response = await fetch(`${API_URL}/notifications?${params}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch notifications');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return { notifications: [], hasMore: false };
        }
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId, authToken) {
        try {
            const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to mark notification as read');
            }

            return true;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return false;
        }
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(authToken) {
        try {
            const response = await fetch(`${API_URL}/notifications/mark-all-read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to mark all notifications as read');
            }

            return true;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return false;
        }
    }

    /**
     * Delete notification
     */
    async deleteNotification(notificationId, authToken) {
        try {
            const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete notification');
            }

            return true;
        } catch (error) {
            console.error('Error deleting notification:', error);
            return false;
        }
    }
}

// Create singleton instance
const pushNotificationService = new PushNotificationService();

export default pushNotificationService;
