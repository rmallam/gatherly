import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/connection.js';
import { sendSMS } from '../services/reminderService.js';

// Message templates
const templates = {
    announcement: (eventTitle, customMessage) =>
        `📢 ${eventTitle}\n\n${customMessage}\n\nBest regards,\nYour Event Team`,

    thankYou: (eventTitle, guestName) =>
        `Thank you ${guestName} for attending ${eventTitle}! 🎉\n\nWe hope you had a wonderful time. We look forward to seeing you at future events!\n\nBest regards,\nYour Event Team`
};

// Send announcement to guests
export const sendAnnouncement = async (req, res) => {
    const { eventId } = req.params;
    const { message, recipientFilter = 'all' } = req.body;
    const userId = req.user.id;

    try {
        // Validate message
        if (!message || message.trim().length === 0) {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (message.length > 320) {
            return res.status(400).json({ error: 'Message must be 320 characters or less' });
        }

        // Get event details
        const eventResult = await query(
            'SELECT * FROM events WHERE id = $1 AND user_id = $2',
            [eventId, userId]
        );

        if (eventResult.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const event = eventResult.rows[0];

        // Get recipients based on filter
        let guestsQuery = 'SELECT * FROM guests WHERE event_id = $1';
        const queryParams = [eventId];

        if (recipientFilter === 'confirmed') {
            guestsQuery += ' AND rsvp = true';
        } else if (recipientFilter === 'attended') {
            guestsQuery += ' AND attended = true';
        }

        const guestsResult = await query(guestsQuery, queryParams);
        const guests = guestsResult.rows;

        if (guests.length === 0) {
            return res.status(400).json({ error: 'No guests match the selected filter' });
        }

        // Create communication record
        const commResult = await query(
            `INSERT INTO communications (event_id, type, message, recipient_filter, recipients_count, created_by)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [eventId, 'announcement', message, recipientFilter, guests.length, userId]
        );

        const communication = commResult.rows[0];

        // Send messages asynchronously
        sendMessagesInBackground(communication.id, event, guests, message, 'announcement');

        res.json({
            success: true,
            communication: {
                id: communication.id,
                recipientsCount: guests.length,
                status: 'sending'
            }
        });
    } catch (error) {
        console.error('Error sending announcement:', error);
        res.status(500).json({ error: 'Failed to send announcement' });
    }
};

// Send thank you messages
export const sendThankYouMessages = async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user.id;

    try {
        // Get event details
        const eventResult = await query(
            'SELECT * FROM events WHERE id = $1 AND user_id = $2',
            [eventId, userId]
        );

        if (eventResult.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const event = eventResult.rows[0];

        // Get attended guests only
        const guestsResult = await query(
            'SELECT * FROM guests WHERE event_id = $1 AND attended = true',
            [eventId]
        );

        const guests = guestsResult.rows;

        if (guests.length === 0) {
            return res.status(400).json({ error: 'No guests have attended this event yet' });
        }

        // Create communication record
        const thankYouMessage = `Thank you for attending ${event.title}!`;
        const commResult = await query(
            `INSERT INTO communications (event_id, type, message, recipient_filter, recipients_count, created_by)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [eventId, 'thank_you', thankYouMessage, 'attended', guests.length, userId]
        );

        const communication = commResult.rows[0];

        // Send messages asynchronously
        sendMessagesInBackground(communication.id, event, guests, null, 'thank_you');

        res.json({
            success: true,
            communication: {
                id: communication.id,
                recipientsCount: guests.length,
                status: 'sending'
            }
        });
    } catch (error) {
        console.error('Error sending thank you messages:', error);
        res.status(500).json({ error: 'Failed to send thank you messages' });
    }
};

// Get communication history
export const getCommunications = async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user.id;

    try {
        // Verify event ownership
        const eventResult = await query(
            'SELECT * FROM events WHERE id = $1 AND user_id = $2',
            [eventId, userId]
        );

        if (eventResult.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Get communications
        const result = await query(
            `SELECT * FROM communications 
             WHERE event_id = $1 
             ORDER BY created_at DESC`,
            [eventId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching communications:', error);
        res.status(500).json({ error: 'Failed to fetch communications' });
    }
};

// Background function to send messages
async function sendMessagesInBackground(communicationId, event, guests, customMessage, type) {
    let sentCount = 0;
    let failedCount = 0;

    // Update status to sending
    await query(
        'UPDATE communications SET status = $1 WHERE id = $2',
        ['sending', communicationId]
    );

    for (const guest of guests) {
        try {
            // Prepare message
            let messageText;
            if (type === 'announcement') {
                messageText = templates.announcement(event.title, customMessage);
            } else {
                messageText = templates.thankYou(event.title, guest.name);
            }

            // Send SMS
            const result = await sendSMS(guest.phone, messageText);

            if (result.success) {
                sentCount++;
            } else {
                failedCount++;
            }

            // Small delay to avoid rate limiting (100ms)
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            console.error(`Failed to send message to ${guest.name}:`, error);
            failedCount++;
        }
    }

    // Update final status
    await query(
        `UPDATE communications 
         SET status = $1, sent_count = $2, failed_count = $3, completed_at = NOW() 
         WHERE id = $4`,
        ['completed', sentCount, failedCount, communicationId]
    );
}
