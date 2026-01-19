import { query } from '../db/connection.js';
import { sendSMS } from './reminderService.js';
import crypto from 'crypto';

/**
 * Generate a 6-digit OTP
 */
function generateNumericOTP(length = 6) {
    // Generate random buffer
    const buffer = crypto.randomBytes(length);
    let otp = '';
    for (let i = 0; i < length; i++) {
        // Use modulo 10 to get digits 0-9
        otp += (buffer[i] % 10).toString();
    }
    return otp;
}

/**
 * Send OTP to a phone number
 * @param {string} phone - Normalized phone number (e.g., +919876543210)
 */
export async function sendOTP(phone) {
    try {
        if (!phone) {
            throw new Error('Phone number is required');
        }

        // Generate 6-digit code
        const code = generateNumericOTP(6);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

        // Store in DB (upsert)
        await query(
            `INSERT INTO otp_codes (phone, code, expires_at, created_at) 
             VALUES ($1, $2, $3, NOW()) 
             ON CONFLICT (phone) 
             DO UPDATE SET code = $2, expires_at = $3, created_at = NOW()`,
            [phone, code, expiresAt]
        );

        // Send via Twilio
        // In development/test if Twilio not set, we might want to log it
        const message = `Your HostEze verification code is: ${code}. Valid for 5 minutes.`;

        console.log(`Sending OTP to ${phone}: ${code}`); // Security warning: Don't log this in prod

        const smsResult = await sendSMS(phone, message, { messageType: 'otp' });

        if (!smsResult.success) {
            console.error('Failed to send OTP SMS:', smsResult.error);
            // In dev mode, maybe allows it to pass if we just want to test logic?
            // For now, return false if SMS failed
            if (process.env.NODE_ENV === 'development') {
                console.log('DEV MODE: Proceeding even though SMS failed (Check console for code)');
                return { success: true, devMode: true };
            }
            return { success: false, error: 'Failed to send SMS' };
        }

        return { success: true };
    } catch (error) {
        console.error('Send OTP error:', error);
        throw error;
    }
}

/**
 * Verify OTP
 * @param {string} phone - Normalized phone number
 * @param {string} code - The code to verify
 */
export async function verifyOTP(phone, code) {
    try {
        const result = await query(
            'SELECT * FROM otp_codes WHERE phone = $1',
            [phone]
        );

        if (result.rows.length === 0) {
            return { valid: false, reason: 'No OTP found' };
        }

        const record = result.rows[0];

        // Check expiration
        if (new Date() > new Date(record.expires_at)) {
            return { valid: false, reason: 'OTP expired' };
        }

        // Check match
        if (record.code !== code) {
            return { valid: false, reason: 'Invalid code' };
        }

        // OTP is valid - clear it so it can't be reused
        await query('DELETE FROM otp_codes WHERE phone = $1', [phone]);

        return { valid: true };
    } catch (error) {
        console.error('Verify OTP error:', error);
        throw error;
    }
}
