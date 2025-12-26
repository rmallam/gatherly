import { query } from '../db/connection.js';
import { sendNotificationToUsers } from './notificationService.js';

const REMINDER_INTERVALS = {
    '3_days': 3 * 24 * 60, // minutes
    '2_days': 2 * 24 * 60,
    '1_day': 1 * 24 * 60,
    '2_hours': 2 * 60,
    '5_minutes': 5
};

/**
 * Check for upcoming events and send reminder notifications
 */
export async function checkAndSendReminders() {
    console.log('🔔 Checking for event reminders...');

    for (const [reminderType, minutesBefore] of Object.entries(REMINDER_INTERVALS)) {
        await sendRemindersForInterval(reminderType, minutesBefore);
    }
}

/**
 * Send reminders for a specific time interval
 */
async function sendRemindersForInterval(reminderType, minutesBefore) {
    try {
        // Find events that need this reminder
        // Look for events within a 30-minute window to account for cron timing
        const events = await query(`
            SELECT e.id, e.title, e.date, e.location, e.user_id,
                   EXTRACT(EPOCH FROM (e.date - NOW())) / 60 AS minutes_until
            FROM events e
            LEFT JOIN event_reminders er 
                ON e.id = er.event_id AND er.reminder_type = $1
            WHERE e.date IS NOT NULL
              AND e.date > NOW()
              AND EXTRACT(EPOCH FROM (e.date - NOW())) / 60 <= $2
              AND EXTRACT(EPOCH FROM (e.date - NOW())) / 60 > $3
              AND er.id IS NULL
        `, [reminderType, minutesBefore, minutesBefore - 30]);

        if (events.rows.length === 0) {
            return;
        }

        console.log(`📅 Found ${events.rows.length} events needing ${reminderType} reminder`);

        for (const event of events.rows) {
            await sendEventReminder(event, reminderType);
        }
    } catch (error) {
        console.error(`Error sending ${reminderType} reminders:`, error);
    }
}

/**
 * Send reminder notification for a specific event
 */
async function sendEventReminder(event, reminderType) {
    try {
        // Get all recipients (organizer + guests with user accounts)
        const recipients = await query(`
            SELECT DISTINCT user_id
            FROM (
                SELECT $1::uuid as user_id
                UNION
                SELECT g.user_id
                FROM guests g
                WHERE g.event_id = $2 AND g.user_id IS NOT NULL
            ) AS all_users
            WHERE user_id IS NOT NULL
        `, [event.user_id, event.id]);

        if (recipients.rows.length === 0) {
            console.log(`⚠️ No recipients for event ${event.title}`);
            return;
        }

        const userIds = recipients.rows.map(r => r.user_id);

        // Create notification message
        const message = getReminderMessage(event, reminderType);

        // Send notification
        await sendNotificationToUsers(userIds, {
            type: 'event_reminder',
            title: message.title,
            body: message.body,
            data: {
                eventId: event.id,
                eventTitle: event.title,
                eventDate: event.date,
                reminderType: reminderType
            }
        });

        // Mark reminder as sent
        await query(`
            INSERT INTO event_reminders (event_id, reminder_type, recipient_count)
            VALUES ($1, $2, $3)
            ON CONFLICT (event_id, reminder_type) DO NOTHING
        `, [event.id, reminderType, userIds.length]);

        console.log(`✅ Sent ${reminderType} reminder for event: ${event.title} to ${userIds.length} users`);
    } catch (error) {
        console.error(`Error sending reminder for event ${event.id}:`, error);
    }
}

/**
 * Generate reminder message based on reminder type
 */
function getReminderMessage(event, reminderType) {
    const eventDate = new Date(event.date);
    const dateStr = eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
    const timeStr = eventDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
    });

    const location = event.location ? ` at ${event.location}` : '';

    const messages = {
        '3_days': {
            title: `📅 Event in 3 Days: ${event.title}`,
            body: `${event.title} is coming up on ${dateStr} at ${timeStr}${location}`
        },
        '2_days': {
            title: `📅 Event in 2 Days: ${event.title}`,
            body: `Don't forget! ${event.title} is in 2 days on ${dateStr}${location}`
        },
        '1_day': {
            title: `📅 Tomorrow: ${event.title}`,
            body: `${event.title} is tomorrow at ${timeStr}${location}. See you there!`
        },
        '2_hours': {
            title: `⏰ Event Starting Soon: ${event.title}`,
            body: `${event.title} starts in 2 hours at ${timeStr}${location}`
        },
        '5_minutes': {
            title: `🔔 Event Starting Now: ${event.title}`,
            body: `${event.title} is starting in 5 minutes${location}!`
        }
    };

    return messages[reminderType] || {
        title: `Event Reminder: ${event.title}`,
        body: `${event.title} is coming up soon`
    };
}
