import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Guest management utility functions
 */

export const deduplicateGuests = (guests) => {
    const seen = new Map();

    return guests.filter(guest => {
        const key = guest.phone || guest.email || guest.name.toLowerCase();
        if (seen.has(key)) {
            return false;
        }
        seen.set(key, true);
        return true;
    });
};

export const formatGuestName = (name) => {
    return name
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

export const countAttendees = (guests) => {
    return guests.filter(guest => guest.status === 'checked_in').length;
};

export const getGuestsByStatus = (guests, status) => {
    return guests.filter(guest => guest.status === status);
};

// Tests
describe('Guest Management Utils', () => {
    let sampleGuests;

    beforeEach(() => {
        sampleGuests = [
            { id: 1, name: 'John Doe', phone: '+919876543210', status: 'invited' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'checked_in' },
            { id: 3, name: 'Bob Wilson', phone: '+919876543210', status: 'invited' }, // Duplicate phone
            { id: 4, name: 'Alice Brown', phone: '+441234567890', status: 'checked_in' },
        ];
    });

    describe('deduplicateGuests', () => {
        it('should remove duplicate guests by phone', () => {
            const result = deduplicateGuests(sampleGuests);
            expect(result).toHaveLength(3);
            expect(result.find(g => g.id === 3)).toBeUndefined();
        });

        it('should handle guests without phone/email', () => {
            const guests = [
                { id: 1, name: 'John Doe' },
                { id: 2, name: 'john doe' }, // Same name, different case
                { id: 3, name: 'Jane Smith' },
            ];
            const result = deduplicateGuests(guests);
            expect(result).toHaveLength(2);
        });

        it('should return empty array for empty input', () => {
            expect(deduplicateGuests([])).toEqual([]);
        });
    });

    describe('formatGuestName', () => {
        it('should capitalize names correctly', () => {
            expect(formatGuestName('john doe')).toBe('John Doe');
            expect(formatGuestName('JANE SMITH')).toBe('Jane Smith');
            expect(formatGuestName('bob WILSON')).toBe('Bob Wilson');
        });

        it('should handle single names', () => {
            expect(formatGuestName('john')).toBe('John');
        });

        it('should trim whitespace', () => {
            expect(formatGuestName('  john doe  ')).toBe('John Doe');
        });
    });

    describe('countAttendees', () => {
        it('should count checked-in guests correctly', () => {
            expect(countAttendees(sampleGuests)).toBe(2);
        });

        it('should return 0 for no checked-in guests', () => {
            const guests = sampleGuests.map(g => ({ ...g, status: 'invited' }));
            expect(countAttendees(guests)).toBe(0);
        });
    });

    describe('getGuestsByStatus', () => {
        it('should filter guests by status', () => {
            const invited = getGuestsByStatus(sampleGuests, 'invited');
            expect(invited).toHaveLength(2);

            const checkedIn = getGuestsByStatus(sampleGuests, 'checked_in');
            expect(checkedIn).toHaveLength(2);
        });

        it('should return empty array for non-existent status', () => {
            const result = getGuestsByStatus(sampleGuests, 'declined');
            expect(result).toEqual([]);
        });
    });
});
