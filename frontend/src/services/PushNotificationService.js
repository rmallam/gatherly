import OneSignal from 'onesignal-cordova-plugin';

const ONESIGNAL_APP_ID = 'a2ee0c7f-460f-4d5e-a36f-635a0492d6b5';
const API_URL = import.meta.env.VITE_API_URL || 'https://gatherly-backend-3vmv.onrender.com/api';

class PushNotificationService {
    constructor() {
        this.initialized = false;
        this.userId = null;
        this.playerId = null;
    }

    /**
     * Initialize OneSignal
     */
    async initialize() {
        if (this.initialized) {
            console.log('OneSignal already initialized');
            return;
        }

        try {
            console.log('🔔 Initializing OneSignal...');

            // Initialize OneSignal
            OneSignal.setAppId(ONESIGNAL_APP_ID);

            // Set up notification handlers
            this.setupNotificationHandlers();

            // Request permission
            const hasPermission = await OneSignal.getDeviceState();
            if (hasPermission && !hasPermission.hasNotificationPermission) {
                await OneSignal.promptForPushNotificationsWithUserResponse();
            }

            this.initialized = true;
            console.log('✅ OneSignal initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing OneSignal:', error);
        }
    }

    /**
     * Setup notification event handlers
     */
    setupNotificationHandlers() {
        // Handle notification received (foreground)
        OneSignal.setNotificationWillShowInForegroundHandler((notificationReceivedEvent) => {
            console.log('📨 Notification received in foreground:', notificationReceivedEvent);
            const notification = notificationReceivedEvent.getNotification();

            // Display the notification
            notificationReceivedEvent.complete(notification);
        });

        // Handle notification opened/tapped
        OneSignal.setNotificationOpenedHandler((openedEvent) => {
            console.log('👆 Notification opened:', openedEvent);
            const notification = openedEvent.notification;
            const data = notification.additionalData;

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
                    window.location.href = `/events/${data.eventId}`;
                }
                break;

            case 'event_wall_post':
                // Navigate to event wall
                if (data.eventId) {
                    window.location.href = `/event-wall/${data.eventId}`;
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

            // Get OneSignal player ID
            const deviceState = await OneSignal.getDeviceState();

            if (!deviceState || !deviceState.userId) {
                console.error('No OneSignal player ID available');
                return;
            }

            this.playerId = deviceState.userId;
            console.log('📱 OneSignal Player ID:', this.playerId);

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

            // Set external user ID in OneSignal
            OneSignal.setExternalUserId(userId);

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

            // Remove external user ID
            OneSignal.removeExternalUserId();

            console.log('✅ Device unregistered');
            this.userId = null;
        } catch (error) {
            console.error('❌ Error unregistering device:', error);
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
