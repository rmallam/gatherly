import cron from 'node-cron';
import { query } from '../db/connection.js';
import { sendReminder } from '../services/reminderService.js';

/**
 * Check for pending reminders and send them
 */
const processPendingReminders = async () => {
    try {
        console.log('\n=== REMINDER CHECK START ===');
        console.log('Current server time:', new Date().toISOString());

        // Get all unsent reminders that are due (use CURRENT_TIMESTAMP for proper timezone handling)
        const result = await query(
            `SELECT * FROM reminders 
             WHERE sent = false 
             AND send_at <= CURRENT_TIMESTAMP 
             ORDER BY send_at ASC`
        );

        const pendingReminders = result.rows;

        console.log(`Found ${result.rows.length} total unsent reminders`);
        console.log(`Found ${pendingReminders.length} reminders that are due`);

        if (pendingReminders.length === 0) {
            console.log('No pending reminders to process');
            console.log('=== REMINDER CHECK END ===\n');
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
                    'UPDATE reminders SET sent = true WHERE id = $1',
                    [reminder.id]
                );
                console.log(`✓ Reminder ${reminder.id} marked as sent`);
            } else {
                console.error(`✗ Failed to send reminder ${reminder.id}:`, sendResult.error);
            }
        }

        console.log(`✓ Reminder processing complete\n`);
        console.log('=== REMINDER CHECK END ===\n');
    } catch (error) {
        console.error('Error processing reminders:', error);

        // Also log all unsent reminders for debugging
        try {
            const allUnsent = await query('SELECT id, send_at, sent, reminder_type FROM reminders WHERE sent = false ORDER BY send_at');
            console.log('\nAll unsent reminders in database:');
            allUnsent.rows.forEach(r => {
                console.log(`  - ${r.id}: ${r.reminder_type} at ${r.send_at} (sent: ${r.sent})`);
            });
        } catch (err) {
            console.error('Failed to fetch unsent reminders for debugging:', err);
        }
    }
};

/**
 * Start the reminder cron job
 * Runs every 15 minutes
 */
export const startReminderCron = () => {
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

export { processPendingReminders };
