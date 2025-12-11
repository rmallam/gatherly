// Validation utilities for email and password

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Disposable email domains to block (optional)
const DISPOSABLE_DOMAINS = [
    'tempmail.com', 'throwaway.email', '10minutemail.com',
    'guerrillamail.com', 'mailinator.com'
];

/**
 * Validate email format
 */
export function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        return { valid: false, error: 'Email is required' };
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
        return { valid: false, error: 'Invalid email format' };
    }

    // Optional: Block disposable emails
    const domain = trimmedEmail.split('@')[1];
    if (DISPOSABLE_DOMAINS.includes(domain)) {
        return { valid: false, error: 'Disposable email addresses are not allowed' };
    }

    return { valid: true, email: trimmedEmail };
}

/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
export function validatePassword(password) {
    if (!password || typeof password !== 'string') {
        return { valid: false, error: 'Password is required' };
    }

    const errors = [];

    if (password.length < 8) {
        errors.push('at least 8 characters');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('one special character (!@#$%^&*)');
    }

    if (errors.length > 0) {
        return {
            valid: false,
            error: `Password must contain ${errors.join(', ')}`
        };
    }

    return { valid: true };
}

/**
 * Calculate password strength score (0-4)
 */
export function getPasswordStrength(password) {
    let score = 0;

    if (!password) return { score: 0, label: 'None' };

    // Length
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Character variety
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

    return {
        score: Math.min(score, 4),
        label: labels[Math.min(score, 4)],
        color: colors[Math.min(score, 4)]
    };
}
