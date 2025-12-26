import * as OneSignalSDK from '@onesignal/node-onesignal';
import { query } from '../db/connection.js';

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

// Initialize OneSignal client
const configuration = OneSignalSDK.createConfiguration({
    restApiKey: ONESIGNAL_REST_API_KEY,
});
const oneSignalClient = new OneSignalSDK.DefaultApi(configuration);

/**
 * Send notification to a specific user
 * @param {string} userId - User ID to send notification to
 * @param {object} notification - Notification object with title, body, data
 * @returns {Promise} OneSignal API response
 */
export async function sendNotificationToUser(userId, notification) {
    return sendNotificationToUsers([userId], notification);
}

/**
 * Send notification to multiple users
 * @param {string[]} userIds - Array of user IDs
 * @param {object} notification - Notification object { type, title, body, data }
 * @returns {Promise} OneSignal API response
 */
export async function sendNotificationToUsers(userIds, notification) {
    try {
        if (!userIds || userIds.length === 0) {
            console.log('No users to send notification to');
            return null;
        }

        // ALWAYS save to database first for in-app notifications
        await saveNotificationsToDatabase(userIds, notification);

        // Try to send push notification via OneSignal
        try {
            // Get all player IDs for these users
            const result = await query(
                'SELECT DISTINCT player_id FROM device_tokens WHERE user_id = ANY($1)',
                [userIds]
            );

            if (result.rows.length === 0) {
                console.log('⚠️ No device tokens found for users:', userIds);
                console.log('📱 In-app notification saved, but push notification skipped (no devices registered)');
                return null;
            }

            const playerIds = result.rows.map(row => row.player_id);
            console.log(`📱 Sending push notification to ${playerIds.length} devices for ${userIds.length} users`);

            // Create OneSignal notification using new SDK
            const onesignalNotification = new OneSignalSDK.Notification();
            onesignalNotification.app_id = ONESIGNAL_APP_ID;
            onesignalNotification.headings = { en: notification.title };
            onesignalNotification.contents = { en: notification.body };
            onesignalNotification.include_player_ids = playerIds;

            // IMPORTANT: OneSignal SDK v5.x uses 'include_subscription_ids' instead of 'include_player_ids'
            // Comment out the old field and use the new one
            onesignalNotification.include_subscription_ids = playerIds;


            // NOTE: Removed android_channel_id - OneSignal v5.x doesn't accept it in API calls
            // The notification channel is created in MainActivity.java and will be used automatically

            onesignalNotification.data = {
                type: notification.type,
                ...notification.data
            };
            onesignalNotification.ios_badgeType = 'Increase';
            onesignalNotification.ios_badgeCount = 1;

            // Send push notification via OneSignal
            const response = await oneSignalClient.createNotification(onesignalNotification);
            console.log('✅ Push notification sent via OneSignal:', response.id);

            return response;
        } catch (pushError) {
            // Push notification failed, but in-app notification was already saved
            console.error('⚠️ Push notification failed (in-app notification still saved):', pushError.message);

            // Log detailed error information for debugging
            if (pushError.statusCode) {
                console.error('   HTTP Status Code:', pushError.statusCode);
            }
            if (pushError.body) {
                console.error('   Error Body:', JSON.stringify(pushError.body, null, 2));
            }
            if (pushError['HTTP-Code']) {
                console.error('   HTTP-Code:', pushError['HTTP-Code']);
            }

            // Log the full error object for complete debugging info
            console.error('   Full Error:', JSON.stringify(pushError, Object.getOwnPropertyNames(pushError), 2));

            return null;
        }
    } catch (error) {
        console.error('❌ Error in notification system:', error);
        throw error;
    }
}

/**
 * Save notifications to database for in-app notification center
 * @param {string[]} userIds - Array of user IDs
 * @param {object} notification - Notification object
 */
async function saveNotificationsToDatabase(userIds, notification) {
    try {
        // Insert a notification record for each user
        for (const userId of userIds) {
            await query(
                `INSERT INTO notifications (user_id, type, title, body, data)
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    userId,
                    notification.type,
                    notification.title,
                    notification.body,
                    JSON.stringify(notification.data)
                ]
            );
        }
        console.log(`💾 Saved ${userIds.length} notifications to database`);
    } catch (error) {
        console.error('Error saving notifications to database:', error);
        // Don't throw - push notification already sent, this is just for history
    }
}

/**
 * Register device token for a user
 * @param {string} userId - User ID
 * @param {string} playerId - OneSignal player ID
 * @param {string} platform - Platform (android/ios/web)
 */
export async function registerDeviceToken(userId, playerId, platform) {
    try {
        // Check if this player ID already exists
        const existing = await query(
            'SELECT * FROM device_tokens WHERE player_id = $1',
            [playerId]
        );

        if (existing.rows.length > 0) {
            // Update existing token
            await query(
                'UPDATE device_tokens SET user_id = $1, platform = $2, updated_at = NOW() WHERE player_id = $3',
                [userId, platform, playerId]
            );
            console.log(`🔄 Updated device token for user ${userId}`);
        } else {
            // Insert new token
            await query(
                'INSERT INTO device_tokens (user_id, player_id, platform) VALUES ($1, $2, $3)',
                [userId, playerId, platform]
            );
            console.log(`➕ Registered new device token for user ${userId}`);
        }

        return { success: true };
    } catch (error) {
        console.error('Error registering device token:', error);
        throw error;
    }
}

/**
 * Remove device token
 * @param {string} playerId - OneSignal player ID
 */
export async function removeDeviceToken(playerId) {
    try {
        await query('DELETE FROM device_tokens WHERE player_id = $1', [playerId]);
        console.log(`🗑️ Removed device token: ${playerId}`);
        return { success: true };
    } catch (error) {
        console.error('Error removing device token:', error);
        throw error;
    }
}

/**
 * Get unread notification count for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Count of unread notifications
 */
export async function getUnreadCount(userId) {
    try {
        const result = await query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = FALSE',
            [userId]
        );
        return parseInt(result.rows[0].count);
    } catch (error) {
        console.error('Error getting unread count:', error);
        throw error;
    }
}
