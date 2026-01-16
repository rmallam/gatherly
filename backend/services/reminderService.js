import twilio from 'twilio';
import { query } from '../db/connection.js';
import { logSMSUsage, incrementSMSQuota } from './smsTrackingService.js';

// Initialize Twilio client
let twilioClient = null;

export const initTwilio = () => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !phoneNumber) {
        console.warn('⚠️  Twilio credentials not configured. SMS reminders will not be sent.');
        return null;
    }

    try {
        twilioClient = twilio(accountSid, authToken);
        console.log('✓ Twilio SMS service initialized');
        return twilioClient;
    } catch (error) {
        console.error('Failed to initialize Twilio:', error);
        return null;
    }
};

/**
 * Send SMS to a single phone number with tracking
 * @param {string} to - Recipient phone number
 * @param {string} message - Message content
 * @param {object} metadata - Tracking metadata (userId, eventId, messageType)
 */
export const sendSMS = async (to, message, metadata = {}) => {
    if (!twilioClient) {
        console.log('Twilio not configured, skipping SMS:', { to, message });

        // Log failed attempt
        if (metadata.userId) {
            await logSMSUsage({
                ...metadata,
                recipientPhone: to,
                status: 'failed',
                errorMessage: 'Twilio not configured'
            });
        }

        return { success: false, error: 'Twilio not configured' };
    }

    try {
        const result = await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: to
        });

        console.log(`✓ SMS sent to ${to} (SID: ${result.sid})`);

        // Log successful send
        if (metadata.userId) {
            await logSMSUsage({
                userId: metadata.userId,
                eventId: metadata.eventId || null,
                recipientPhone: to,
                messageType: metadata.messageType || 'other',
                status: 'sent',
                twilioSid: result.sid,
                costUnits: 1
            });

            // Increment user's SMS quota
            await incrementSMSQuota(metadata.userId, 1);
        }

        return { success: true, sid: result.sid };
    } catch (error) {
        console.error(`Failed to send SMS to ${to}:`, error.message);

        // Log failed send
        if (metadata.userId) {
            await logSMSUsage({
                userId: metadata.userId,
                eventId: metadata.eventId || null,
                recipientPhone: to,
                messageType: metadata.messageType || 'other',
                status: 'failed',
                errorMessage: error.message
            });
        }

        return { success: false, error: error.message };
    }
};

/**
 * Send reminder to guests
 */
export const sendReminder = async (reminder) => {
    try {
        const { id, event_id, recipient_type, message } = reminder;

        // Get event details
        const eventResult = await query(
            'SELECT title FROM events WHERE id = $1',
            [event_id]
        );

        if (eventResult.rows.length === 0) {
            console.error(`Event ${event_id} not found for reminder ${id}`);
            return { success: false, sent: 0 };
        }

        const event = eventResult.rows[0];
        let recipients = [];

        if (recipient_type === 'guests') {
            // Get all guests with phone numbers who have RSVP'd yes
            const guestsResult = await query(
                'SELECT name, phone FROM guests WHERE event_id = $1 AND phone IS NOT NULL AND rsvp = true',
                [event_id]
            );
            recipients = guestsResult.rows;
        } else if (recipient_type === 'host') {
            // Get event host's phone
            const hostResult = await query(
                `SELECT u.name, u.phone 
                 FROM users u 
                 JOIN events e ON e.user_id = u.id 
                 WHERE e.id = $1 AND u.phone IS NOT NULL`,
                [event_id]
            );
            recipients = hostResult.rows;
        }

        if (recipients.length === 0) {
            console.log(`No recipients with phone numbers for reminder ${id}`);
            return { success: true, sent: 0 };
        }

        // Send SMS to each recipient
        let sentCount = 0;
        for (const recipient of recipients) {
            // Format phone number properly
            let phoneNumber = recipient.phone;
            if (phoneNumber) {
                // Remove all spaces and special characters except +
                phoneNumber = phoneNumber.replace(/[^\d+]/g, '');

                // Add country code +91 if missing
                if (!phoneNumber.startsWith('+')) {
                    // If starts with 91, add +
                    if (phoneNumber.startsWith('91')) {
                        phoneNumber = '+' + phoneNumber;
                    } else {
                        // Otherwise assume Indian number and add +91
                        phoneNumber = '+91' + phoneNumber;
                    }
                }
            }

            console.log(`Sending SMS to ${recipient.name} at ${phoneNumber}`);
            const personalizedMessage = `Hi ${recipient.name}, ${message}`;
            const result = await sendSMS(phoneNumber, personalizedMessage);
            if (result.success) {
                sentCount++;
            }
        }

        console.log(`✓ Reminder ${id}: Sent ${sentCount}/${recipients.length} SMS`);
        return { success: true, sent: sentCount, total: recipients.length };
    } catch (error) {
        console.error('Send reminder error:', error);
        return { success: false, error: error.message };
    }
};

