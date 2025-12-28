import { describe, it, expect } from 'vitest';

/**
 * Validation utility functions
 */

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhone = (phone) => {
    // Validate phone with country code (e.g., +919876543210)
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    return phoneRegex.test(phone);
};

export const validateEventTitle = (title) => {
    if (!title) return false;
    return title.trim().length >= 3 && title.trim().length <= 100;
};

export const validateDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date) && date > new Date();
};

// Tests
describe('Validation Utils', () => {
    describe('validateEmail', () => {
        it('should validate correct email addresses', () => {
            expect(validateEmail('test@example.com')).toBe(true);
            expect(validateEmail('user.name@domain.co.uk')).toBe(true);
            expect(validateEmail('test+tag@hosteze.com')).toBe(true);
        });

        it('should reject invalid email addresses', () => {
            expect(validateEmail('invalid')).toBe(false);
            expect(validateEmail('test@')).toBe(false);
            expect(validateEmail('@example.com')).toBe(false);
            expect(validateEmail('test @example.com')).toBe(false);
            expect(validateEmail('')).toBe(false);
        });
    });

    describe('validatePhone', () => {
        it('should validate phone numbers with country code', () => {
            expect(validatePhone('+919876543210')).toBe(true);
            expect(validatePhone('+14155552671')).toBe(true);
            expect(validatePhone('+447911123456')).toBe(true);
        });

        it('should reject invalid phone numbers', () => {
            expect(validatePhone('123')).toBe(false);
            expect(validatePhone('abcdefghij')).toBe(false);
            expect(validatePhone('+1234')).toBe(false);
            expect(validatePhone('')).toBe(false);
        });
    });

    describe('validateEventTitle', () => {
        it('should validate correct event titles', () => {
            expect(validateEventTitle('Birthday Party')).toBe(true);
            expect(validateEventTitle('Annual Conference 2024')).toBe(true);
            expect(validateEventTitle('ABC')).toBe(true);
        });

        it('should reject invalid event titles', () => {
            expect(validateEventTitle('AB')).toBe(false); // Too short
            expect(validateEventTitle('  ')).toBe(false); // Only spaces
            expect(validateEventTitle('')).toBe(false); // Empty
            expect(validateEventTitle('A'.repeat(101))).toBe(false); // Too long
        });
    });

    describe('validateDate', () => {
        it('should validate future dates', () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 7);
            expect(validateDate(futureDate.toISOString())).toBe(true);
        });

        it('should reject past dates', () => {
            const pastDate = new Date('2020-01-01');
            expect(validateDate(pastDate.toISOString())).toBe(false);
        });

        it('should reject invalid dates', () => {
            expect(validateDate('invalid')).toBe(false);
            expect(validateDate('')).toBe(false);
        });
    });
});
