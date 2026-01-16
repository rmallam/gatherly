import { query } from '../db/connection.js';

// SMS limits by subscription tier
export const SMS_LIMITS = {
    free: 10,
    pro: 100,
    premium: 500
};

/**
 * Log SMS usage to database
 */
export const logSMSUsage = async (data) => {
    const {
        userId,
        eventId,
        recipientPhone,
        messageType = 'other',
        status = 'sent',
        twilioSid = null,
        costUnits = 1,
        errorMessage = null
    } = data;

    try {
        await query(
            `INSERT INTO sms_logs 
            (user_id, event_id, recipient_phone, message_type, status, twilio_sid, cost_units, error_message)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [userId, eventId, recipientPhone, messageType, status, twilioSid, costUnits, errorMessage]
        );
    } catch (error) {
        console.error('Failed to log SMS usage:', error);
        // Don't throw - logging failure shouldn't break SMS sending
    }
};

/**
 * Increment user's SMS quota
 */
export const incrementSMSQuota = async (userId, count = 1) => {
    if (!userId) return;

    try {
        // Check if quota needs reset (new month)
        const userResult = await query(
            'SELECT sms_quota_reset_date FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) return;

        const resetDate = new Date(userResult.rows[0].sms_quota_reset_date);
        const today = new Date();
        const needsReset = resetDate.getMonth() !== today.getMonth() ||
            resetDate.getFullYear() !== today.getFullYear();

        if (needsReset) {
            // Reset quota for new month
            await query(
                `UPDATE users 
                SET sms_quota_used = $1, sms_quota_reset_date = CURRENT_DATE 
                WHERE id = $2`,
                [count, userId]
            );
        } else {
            // Increment existing quota
            await query(
                'UPDATE users SET sms_quota_used = sms_quota_used + $1 WHERE id = $2',
                [count, userId]
            );
        }
    } catch (error) {
        console.error('Failed to increment SMS quota:', error);
    }
};

/**
 * Check if user has SMS quota available
 */
export const checkSMSQuota = async (userId) => {
    if (!userId) {
        return { allowed: false, remaining: 0, limit: 0, used: 0 };
    }

    try {
        const result = await query(
            `SELECT sms_quota_used, sms_quota_reset_date, subscription_tier 
            FROM users WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return { allowed: false, remaining: 0, limit: 0, used: 0 };
        }

        const user = result.rows[0];
        const tier = user.subscription_tier || 'free';
        const limit = SMS_LIMITS[tier] || SMS_LIMITS.free;

        // Check if quota needs reset
        const resetDate = new Date(user.sms_quota_reset_date);
        const today = new Date();
        const needsReset = resetDate.getMonth() !== today.getMonth() ||
            resetDate.getFullYear() !== today.getFullYear();

        let used = needsReset ? 0 : (user.sms_quota_used || 0);
        const remaining = Math.max(0, limit - used);
        const allowed = remaining > 0;

        // Calculate next reset date
        const nextReset = new Date(today.getFullYear(), today.getMonth() + 1, 1);

        return {
            allowed,
            remaining,
            limit,
            used,
            tier,
            resetDate: nextReset.toISOString().split('T')[0]
        };
    } catch (error) {
        console.error('Failed to check SMS quota:', error);
        return { allowed: false, remaining: 0, limit: 0, used: 0 };
    }
};

/**
 * Get SMS usage statistics for a user
 */
export const getSMSUsageStats = async (userId, period = 'month') => {
    if (!userId) return { total: 0, logs: [] };

    try {
        let dateFilter = '';
        if (period === 'month') {
            dateFilter = `AND sent_at >= date_trunc('month', CURRENT_DATE)`;
        } else if (period === 'week') {
            dateFilter = `AND sent_at >= date_trunc('week', CURRENT_DATE)`;
        } else if (period === 'day') {
            dateFilter = `AND sent_at >= CURRENT_DATE`;
        }

        const result = await query(
            `SELECT 
                COUNT(*) as total,
                SUM(cost_units) as total_units,
                COUNT(CASE WHEN status = 'sent' THEN 1 END) as successful,
                COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
            FROM sms_logs 
            WHERE user_id = $1 ${dateFilter}`,
            [userId]
        );

        return result.rows[0] || { total: 0, total_units: 0, successful: 0, failed: 0 };
    } catch (error) {
        console.error('Failed to get SMS usage stats:', error);
        return { total: 0, total_units: 0, successful: 0, failed: 0 };
    }
};

/**
 * Get SMS logs for a user with pagination
 */
export const getSMSLogs = async (userId, page = 1, limit = 20) => {
    if (!userId) return { logs: [], total: 0 };

    try {
        const offset = (page - 1) * limit;

        const logsResult = await query(
            `SELECT 
                sl.*,
                e.title as event_title
            FROM sms_logs sl
            LEFT JOIN events e ON sl.event_id = e.id
            WHERE sl.user_id = $1
            ORDER BY sl.sent_at DESC
            LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        const countResult = await query(
            'SELECT COUNT(*) as total FROM sms_logs WHERE user_id = $1',
            [userId]
        );

        return {
            logs: logsResult.rows,
            total: parseInt(countResult.rows[0].total),
            page,
            limit
        };
    } catch (error) {
        console.error('Failed to get SMS logs:', error);
        return { logs: [], total: 0, page, limit };
    }
};
