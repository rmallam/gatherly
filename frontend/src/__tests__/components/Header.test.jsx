import { describe, it, expect } from 'vitest';

describe('CSV Export Functionality', () => {
    const exportToCSV = (data, headers) => {
        const headerRow = headers.join(',');
        const dataRows = data.map(row =>
            headers.map(header => {
                const value = row[header] || '';
                // Escape commas and quotes
                return `"${value.toString().replace(/"/g, '""')}"`;
            }).join(',')
        );
        return [headerRow, ...dataRows].join('\n');
    };

    it('should export guest data to CSV format', () => {
        const guests = [
            { name: 'John Doe', phone: '+919876543210', email: 'john@example.com', rsvp: true },
            { name: 'Jane Smith', phone: '+919876543211', email: 'jane@example.com', rsvp: false }
        ];

        const csv = exportToCSV(guests, ['name', 'phone', 'email', 'rsvp']);

        expect(csv).toContain('name,phone,email,rsvp');
        expect(csv).toContain('John Doe');
        expect(csv).toContain('jane@example.com');
    });

    it('should handle special characters in CSV', () => {
        const guests = [
            { name: 'O\'Brien, John', email: 'test@example.com' }
        ];

        const csv = exportToCSV(guests, ['name', 'email']);

        expect(csv).toContain('"O\'Brien, John"');
    });
});

describe('Budget Calculation', () => {
    const calculateBudgetStats = (expenses, totalBudget) => {
        const spent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const remaining = totalBudget - spent;
        const percentUsed = (spent / totalBudget) * 100;

        return {
            totalBudget,
            spent,
            remaining,
            percentUsed: Math.round(percentUsed * 100) / 100
        };
    };

    it('should calculate budget correctly', () => {
        const expenses = [
            { category: 'Venue', amount: 1000 },
            { category: 'Catering', amount: 2000 },
            { category: 'Decorations', amount: 500 }
        ];

        const stats = calculateBudgetStats(expenses, 5000);

        expect(stats.spent).toBe(3500);
        expect(stats.remaining).toBe(1500);
        expect(stats.percentUsed).toBe(70);
    });

    it('should handle over-budget scenarios', () => {
        const expenses = [
            { category: 'Venue', amount: 6000 }
        ];

        const stats = calculateBudgetStats(expenses, 5000);

        expect(stats.spent).toBe(6000);
        expect(stats.remaining).toBe(-1000);
        expect(stats.percentUsed).toBe(120);
    });
});

describe('RSVP Tracking', () => {
    const getRSVPStats = (guests) => {
        const total = guests.length;
        const responded = guests.filter(g => g.rsvp !== null && g.rsvp !== undefined).length;
        const confirmed = guests.filter(g => g.rsvp === true).length;
        const declined = guests.filter(g => g.rsvp === false).length;
        const pending = total - responded;
        const responseRate = total > 0 ? (responded / total) * 100 : 0;

        return {
            total,
            responded,
            confirmed,
            declined,
            pending,
            responseRate: Math.round(responseRate * 100) / 100
        };
    };

    it('should calculate RSVP statistics', () => {
        const guests = [
            { name: 'Guest 1', rsvp: true },
            { name: 'Guest 2', rsvp: true },
            { name: 'Guest 3', rsvp: false },
            { name: 'Guest 4', rsvp: null }
        ];

        const stats = getRSVPStats(guests);

        expect(stats.total).toBe(4);
        expect(stats.responded).toBe(3);
        expect(stats.confirmed).toBe(2);
        expect(stats.declined).toBe(1);
        expect(stats.pending).toBe(1);
        expect(stats.responseRate).toBe(75);
    });
});

describe('Date Formatting', () => {
    const formatEventDate = (dateStr) => {
        const date = new Date(dateStr);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    it('should format dates correctly', () => {
        const formatted = formatEventDate('2025-12-25');
        expect(formatted).toContain('December');
        expect(formatted).toContain('25');
        expect(formatted).toContain('2025');
    });
});

describe('Search Functionality', () => {
    const searchGuests = (guests, query) => {
        const lowerQuery = query.toLowerCase();
        return guests.filter(guest =>
            guest.name.toLowerCase().includes(lowerQuery) ||
            guest.email?.toLowerCase().includes(lowerQuery) ||
            guest.phone?.includes(query)
        );
    };

    it('should search guests by name', () => {
        const guests = [
            { name: 'John Doe', email: 'john@example.com' },
            { name: 'Jane Smith', email: 'jane@example.com' },
            { name: 'Bob Johnson', email: 'bob@example.com' }
        ];

        const results = searchGuests(guests, 'john');
        expect(results).toHaveLength(2); // John Doe and Bob Johnson
    });

    it('should search guests by email', () => {
        const guests = [
            { name: 'John Doe', email: 'john@example.com' },
            { name: 'Jane Smith', email: 'jane@example.com' }
        ];

        const results = searchGuests(guests, 'jane@');
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Jane Smith');
    });
});
