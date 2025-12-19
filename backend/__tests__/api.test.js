import { describe, it, expect, beforeAll } from '@jest/globals';
import crypto from 'crypto';

// Utility functions to test
describe('Password Hashing', () => {
    it('should hash passwords securely', async () => {
        const bcrypt = await import('bcrypt');
        const password = 'TestPassword123!';
        const hash = await bcrypt.hash(password, 10);

        expect(hash).toBeDefined();
        expect(hash).not.toBe(password);
        expect(hash.length).toBeGreaterThan(50);
    });

    it('should verify correct passwords', async () => {
        const bcrypt = await import('bcrypt');
        const password = 'TestPassword123!';
        const hash = await bcrypt.hash(password, 10);

        const isValid = await bcrypt.compare(password, hash);
        expect(isValid).toBe(true);
    });

    it('should reject incorrect passwords', async () => {
        const bcrypt = await import('bcrypt');
        const password = 'TestPassword123!';
        const hash = await bcrypt.hash(password, 10);

        const isValid = await bcrypt.compare('WrongPassword', hash);
        expect(isValid).toBe(false);
    });
});

describe('Email Validation', () => {
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    it('should accept valid emails', () => {
        expect(validateEmail('test@example.com')).toBe(true);
        expect(validateEmail('user+tag@domain.co.uk')).toBe(true);
        expect(validateEmail('first.last@company.org')).toBe(true);
    });

    it('should reject invalid emails', () => {
        expect(validateEmail('notanemail')).toBe(false);
        expect(validateEmail('@nodomain.com')).toBe(false);
        expect(validateEmail('missing@domain')).toBe(false);
        expect(validateEmail('')).toBe(false);
    });
});

describe('Phone Number Validation', () => {
    const validatePhone = (phone) => {
        // International format: +[country code][number]
        const phoneRegex = /^\+\d{10,15}$/;
        return phoneRegex.test(phone);
    };

    it('should accept valid phone numbers', () => {
        expect(validatePhone('+919876543210')).toBe(true);
        expect(validatePhone('+12025551234')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
        expect(validatePhone('9876543210')).toBe(false); // Missing +
        expect(validatePhone('+91')).toBe(false); // Too short
        expect(validatePhone('invalid')).toBe(false);
    });
});

describe('Event Data Validation', () => {
    const validateEventData = (event) => {
        const errors = [];

        if (!event.title || event.title.trim().length === 0) {
            errors.push('Title is required');
        }

        if (!event.date) {
            errors.push('Date is required');
        }

        if (event.date && new Date(event.date) < new Date()) {
            errors.push('Date cannot be in the past');
        }

        return errors;
    };

    it('should validate complete event data', () => {
        const validEvent = {
            title: 'Birthday Party',
            date: '2025-12-25',
            time: '18:00',
            venue: 'My House'
        };

        const errors = validateEventData(validEvent);
        expect(errors).toHaveLength(0);
    });

    it('should reject event without title', () => {
        const invalidEvent = {
            date: '2025-12-25',
            time: '18:00'
        };

        const errors = validateEventData(invalidEvent);
        expect(errors).toContain('Title is required');
    });

    it('should reject event without date', () => {
        const invalidEvent = {
            title: 'Party',
            time: '18:00'
        };

        const errors = validateEventData(invalidEvent);
        expect(errors).toContain('Date is required');
    });

    it('should reject past dates', () => {
        const invalidEvent = {
            title: 'Party',
            date: '2020-01-01'
        };

        const errors = validateEventData(invalidEvent);
        expect(errors).toContain('Date cannot be in the past');
    });
});

describe('Guest Statistics', () => {
    const calculateStats = (guests) => {
        return {
            total: guests.length,
            confirmed: guests.filter(g => g.rsvp === true).length,
            attended: guests.filter(g => g.attended === true).length,
            pending: guests.filter(g => g.rsvp === null || g.rsvp === undefined).length
        };
    };

    it('should calculate guest statistics correctly', () => {
        const guests = [
            { name: 'John', rsvp: true, attended: true },
            { name: 'Jane', rsvp: true, attended: false },
            { name: 'Bob', rsvp: null, attended: false },
            { name: 'Alice', rsvp: false, attended: false }
        ];

        const stats = calculateStats(guests);

        expect(stats.total).toBe(4);
        expect(stats.confirmed).toBe(2);
        expect(stats.attended).toBe(1);
        expect(stats.pending).toBe(1);
    });
});
