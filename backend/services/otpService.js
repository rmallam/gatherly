import { query } from '../db/connection.js';
import { sendSMS } from './reminderService.js';
import { sendOtpEmail } from '../server/email.js';
import crypto from 'crypto';

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;

/**
 * Generate a 6-digit numeric OTP.
 */
function generateNumericOTP(length = 6) {
    const buffer = crypto.randomBytes(length);
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += (buffer[i] % 10).toString();
    }
    return otp;
}

function hashCode(code) {
    return crypto.createHash('sha256').update(String(code)).digest('hex');
}

/**
 * True when the identifier looks like an email address (vs a phone number).
 */
export function isEmailIdentifier(identifier) {
    return typeof identifier === 'string' && identifier.includes('@');
}

/**
 * Send an OTP to an identifier (email or phone).
 * Email is preferred (near-zero cost via Resend); SMS is the fallback.
 * @param {string} identifier - normalized email (lowercased) or phone (E.164-ish)
 */
export async function sendOTP(identifier) {
    if (!identifier) {
        throw new Error('Identifier is required');
    }

    const channel = isEmailIdentifier(identifier) ? 'email' : 'sms';
    const code = generateNumericOTP(6);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    // Store a HASH of the code (never plaintext), reset attempts on each new send.
    await query(
        `INSERT INTO auth_otp_codes (identifier, code_hash, channel, attempts, expires_at, created_at)
         VALUES ($1, $2, $3, 0, $4, NOW())
         ON CONFLICT (identifier)
         DO UPDATE SET code_hash = $2, channel = $3, attempts = 0, expires_at = $4, created_at = NOW()`,
        [identifier, hashCode(code), channel, expiresAt]
    );

    // Only surface the code in non-production for local testing.
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[dev] OTP for ${identifier} (${channel}): ${code}`);
    }

    try {
        if (channel === 'email') {
            await sendOtpEmail(identifier, code);
        } else {
            const message = `Your HostEze verification code is: ${code}. Valid for 5 minutes.`;
            const smsResult = await sendSMS(identifier, message, { messageType: 'otp' });
            if (!smsResult.success) {
                if (process.env.NODE_ENV !== 'production') {
                    console.log('DEV MODE: proceeding despite SMS failure (see code above)');
                    return { success: true, devMode: true, channel };
                }
                return { success: false, error: 'Failed to send SMS' };
            }
        }
        return { success: true, channel };
    } catch (error) {
        console.error(`Failed to send OTP via ${channel}:`, error);
        if (process.env.NODE_ENV !== 'production') {
            return { success: true, devMode: true, channel };
        }
        return { success: false, error: `Failed to send ${channel === 'email' ? 'email' : 'SMS'}` };
    }
}

/**
 * Verify an OTP for an identifier. Enforces expiry and a max-attempt limit.
 * @param {string} identifier
 * @param {string} code
 */
export async function verifyOTP(identifier, code) {
    const result = await query('SELECT * FROM auth_otp_codes WHERE identifier = $1', [identifier]);

    if (result.rows.length === 0) {
        return { valid: false, reason: 'No code found. Please request a new one.' };
    }

    const record = result.rows[0];

    if (new Date() > new Date(record.expires_at)) {
        await query('DELETE FROM auth_otp_codes WHERE identifier = $1', [identifier]);
        return { valid: false, reason: 'Code expired. Please request a new one.' };
    }

    if (record.attempts >= MAX_ATTEMPTS) {
        await query('DELETE FROM auth_otp_codes WHERE identifier = $1', [identifier]);
        return { valid: false, reason: 'Too many attempts. Please request a new code.' };
    }

    if (record.code_hash !== hashCode(code)) {
        await query('UPDATE auth_otp_codes SET attempts = attempts + 1 WHERE identifier = $1', [identifier]);
        return { valid: false, reason: 'Invalid code' };
    }

    // Success — consume the code so it can't be reused.
    await query('DELETE FROM auth_otp_codes WHERE identifier = $1', [identifier]);
    return { valid: true };
}
