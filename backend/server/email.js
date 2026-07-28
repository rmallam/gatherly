import { Resend } from 'resend';
import nodemailer from 'nodemailer';

// Email provider configuration
const USE_GMAIL = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD;
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_local_dev');

// Gmail transporter (if configured)
let gmailTransporter = null;
if (USE_GMAIL) {
    gmailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });
    console.log('✓ Gmail SMTP configured for email sending');
}

// From email address
const FROM_EMAIL = USE_GMAIL
    ? process.env.GMAIL_USER
    : (process.env.FROM_EMAIL || 'onboarding@resend.dev');

const APP_URL = process.env.APP_URL || 'https://events.hosteze.app';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://events.hosteze.app';

/**
 * Send email using Gmail or Resend
 */
async function sendEmail({ to, subject, html }) {
    if (USE_GMAIL && gmailTransporter) {
        // Use Gmail SMTP
        try {
            const info = await gmailTransporter.sendMail({
                from: `"HostEze" <${FROM_EMAIL}>`,
                to,
                subject,
                html
            });
            console.log('✓ Email sent via Gmail:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Gmail SMTP error:', error);
            throw error;
        }
    } else {
        // Use Resend
        try {
            const { data, error } = await resend.emails.send({
                from: FROM_EMAIL,
                to: Array.isArray(to) ? to : [to],
                subject,
                html
            });

            if (error) {
                console.error('Resend error:', error);
                throw new Error('Failed to send email via Resend');
            }

            console.log('✓ Email sent via Resend:', data);
            return { success: true, data };
        } catch (error) {
            console.error('Resend error:', error);
            throw error;
        }
    }
}

/**
 * Send a one-time login code (passwordless auth).
 */
export async function sendOtpEmail(email, code) {
    const html = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background:#f5f5f7; margin:0; padding:24px;">
            <div style="max-width:420px; margin:0 auto; background:#ffffff; border-radius:16px; padding:36px 28px; text-align:center; box-shadow:0 2px 10px rgba(0,0,0,0.06);">
                <h1 style="color:#6366f1; font-size:24px; margin:0 0 8px;">HostEze</h1>
                <p style="color:#374151; font-size:15px; margin:0 0 24px;">Here's your login code. It expires in 5 minutes.</p>
                <div style="font-size:38px; font-weight:700; letter-spacing:10px; color:#111827; background:#f3f4f6; border-radius:12px; padding:18px 0; margin:0 0 24px;">
                    ${code}
                </div>
                <p style="color:#9ca3af; font-size:13px; margin:0;">If you didn't request this code, you can safely ignore this email.</p>
            </div>
        </body>
        </html>
    `;

    return await sendEmail({
        to: email,
        subject: `${code} is your HostEze login code`,
        html
    });
}

/**
 * Send email verification
 */
export async function sendVerificationEmail(user, token) {
    const verificationUrl = `${APP_URL}/verify-email?token=${token}`;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .container {
                        background: #ffffff;
                        border-radius: 8px;
                        padding: 40px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .header h1 {
                        color: #6366f1;
                        margin: 0;
                        font-size: 28px;
                    }
                    .content {
                        margin-bottom: 30px;
                    }
                    .button {
                        display: inline-block;
                        padding: 14px 32px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: #ffffff !important;
                        text-decoration: none;
                        border-radius: 6px;
                        font-weight: 600;
                        text-align: center;
                    }
                    .button:hover {
                        background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
                    }
                    .link {
                        color: #6366f1;
                        word-break: break-all;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #e5e7eb;
                        color: #6b7280;
                        font-size: 14px;
                    }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Welcome to HostEze!</h1>
                </div>
                <div class="content">
                    <p>Hi ${user.name},</p>
                    <p>Thanks for signing up! Please verify your email address to start creating and managing events.</p>
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" class="button">Verify Email Address</a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p class="link">${verificationUrl}</p>
                    <p><strong>This link will expire in 24 hours.</strong></p>
                    <p>If you didn't create an account with HostEze, you can safely ignore this email.</p>
                </div>
                <div class="footer">
                    <p>Thanks,<br>The HostEze Team</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendEmail({
        to: user.email,
        subject: 'Verify your HostEze account',
        html
    });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

    const html = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #6366f1;">Reset Your Password</h2>
            <p>Hi ${user.name},</p>
            <p>We received a request to reset your password. Click the button below to choose a new password:</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px;">Reset Password</a>
            </p>
            <p>Or copy this link: ${resetUrl}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request a password reset, please ignore this email.</p>
            <p>Thanks,<br>The HostEze Team</p>
        </body>
        </html>
    `;

    return await sendEmail({
        to: user.email,
        subject: 'Reset your HostEze password',
        html
    });
}
