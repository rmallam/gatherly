const cron = require('node-cron');
const { query } = require('../db');
const { sendReminder } = require('../services/reminderService');

/**
 * Check for pending reminders and send them
 */
const processPendingReminders = async () => {
    try {
        // Get all unsent reminders that are due
        const result = await query(
            `SELECT * FROM reminders 
             WHERE sent = false 
             AND send_at <= NOW() 
             ORDER BY send_at ASC`
        );

        const pendingReminders = result.rows;

        if (pendingReminders.length === 0) {
            return;
        }

        console.log(`\n🔔 Processing ${pendingReminders.length} pending reminder(s)...`);

        for (const reminder of pendingReminders) {
            console.log(`Processing reminder ${reminder.id} (${reminder.reminder_type})...`);

            // Send the reminder
            const sendResult = await sendReminder(reminder);

            if (sendResult.success) {
                // Mark as sent
                await query(
                    'UPDATE reminders SET sent = true, updated_at = NOW() WHERE id = $1',
                    [reminder.id]
                );
                console.log(`✓ Reminder ${reminder.id} marked as sent`);
            } else {
                console.error(`✗ Failed to send reminder ${reminder.id}:`, sendResult.error);
            }
        }

        console.log(`✓ Reminder processing complete\n`);
    } catch (error) {
        console.error('Error processing reminders:', error);
    }
};

/**
 * Start the reminder cron job
 * Runs every 15 minutes
 */
const startReminderCron = () => {
    // Run every 15 minutes
    cron.schedule('*/15 * * * *', () => {
        const now = new Date().toLocaleString();
        console.log(`[${now}] Running reminder check...`);
        processPendingReminders();
    });

    console.log('✓ Reminder cron job started (runs every 15 minutes)');

    // Also run once on startup after 30 seconds
    setTimeout(() => {
        console.log('Running initial reminder check...');
        processPendingReminders();
    }, 30000);
};

module.exports = {
    startReminderCron,
    processPendingReminders
};
