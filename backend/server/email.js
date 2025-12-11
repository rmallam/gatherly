import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// From email address
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const APP_URL = process.env.APP_URL || 'https://gatherly-backend-3vmv.onrender.com';

/**
 * Send email verification
 */
export async function sendVerificationEmail(user, token) {
    const verificationUrl = `${APP_URL}/verify-email?token=${token}`;

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [user.email],
            subject: 'Verify your Gatherly account',
            html: `
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
                            <h1>🎉 Welcome to Gatherly!</h1>
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
                            <p>If you didn't create an account with Gatherly, you can safely ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>Thanks,<br>The Gatherly Team</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });

        if (error) {
            console.error('Resend error:', error);
            throw new Error('Failed to send verification email');
        }

        console.log('Verification email sent:', data);
        return data;
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
}

/**
 * Send password reset email (for future use)
 */
export async function sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [user.email],
            subject: 'Reset your Gatherly password',
            html: `
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
                    <p>Thanks,<br>The Gatherly Team</p>
                </body>
                </html>
            `
        });

        if (error) {
            throw new Error('Failed to send password reset email');
        }

        return data;
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw error;
    }
}
