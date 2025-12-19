import { describe, it, expect } from 'vitest';

describe('Form Validation', () => {
    const validateEventForm = (formData) => {
        const errors = {};

        if (!formData.title?.trim()) {
            errors.title = 'Event title is required';
        } else if (formData.title.length > 100) {
            errors.title = 'Title must be less than 100 characters';
        }

        if (!formData.date) {
            errors.date = 'Event date is required';
        } else {
            const eventDate = new Date(formData.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (eventDate < today) {
                errors.date = 'Event date cannot be in the past';
            }
        }

        if (formData.venue && formData.venue.length > 200) {
            errors.venue = 'Venue must be less than 200 characters';
        }

        return errors;
    };

    it('should validate valid event form', () => {
        const formData = {
            title: 'Birthday Party',
            date: '2025-12-25',
            venue: 'My House',
            description: 'A fun party'
        };

        const errors = validateEventForm(formData);
        expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should require event title', () => {
        const formData = {
            date: '2025-12-25',
            venue: 'My House'
        };

        const errors = validateEventForm(formData);
        expect(errors.title).toBe('Event title is required');
    });

    it('should reject very long titles', () => {
        const formData = {
            title: 'A'.repeat(101),
            date: '2025-12-25'
        };

        const errors = validateEventForm(formData);
        expect(errors.title).toContain('less than 100 characters');
    });

    it('should reject past dates', () => {
        const formData = {
            title: 'Old Event',
            date: '2020-01-01'
        };

        const errors = validateEventForm(formData);
        expect(errors.date).toContain('cannot be in the past');
    });
});

describe('Guest Filtering', () => {
    const filterGuests = (guests, filter) => {
        switch (filter) {
            case 'confirmed':
                return guests.filter(g => g.rsvp === true);
            case 'declined':
                return guests.filter(g => g.rsvp === false);
            case 'pending':
                return guests.filter(g => g.rsvp == null);
            case 'attended':
                return guests.filter(g => g.attended === true);
            case 'notAttended':
                return guests.filter(g => g.attended === false);
            default:
                return guests;
        }
    };

    const guests = [
        { name: 'John', rsvp: true, attended: true },
        { name: 'Jane', rsvp: true, attended: false },
        { name: 'Bob', rsvp: false, attended: false },
        { name: 'Alice', rsvp: null, attended: false }
    ];

    it('should show all guests by default', () => {
        const filtered = filterGuests(guests, 'all');
        expect(filtered).toHaveLength(4);
    });

    it('should filter confirmed guests', () => {
        const filtered = filterGuests(guests, 'confirmed');
        expect(filtered).toHaveLength(2);
        expect(filtered.every(g => g.rsvp === true)).toBe(true);
    });

    it('should filter declined guests', () => {
        const filtered = filterGuests(guests, 'declined');
        expect(filtered).toHaveLength(1);
        expect(filtered[0].name).toBe('Bob');
    });

    it('should filter pending guests', () => {
        const filtered = filterGuests(guests, 'pending');
        expect(filtered).toHaveLength(1);
        expect(filtered[0].name).toBe('Alice');
    });

    it('should filter attended guests', () => {
        const filtered = filterGuests(guests, 'attended');
        expect(filtered).toHaveLength(1);
        expect(filtered[0].name).toBe('John');
    });
});

describe('Guest Sorting', () => {
    const sortGuests = (guests, sortBy) => {
        const sorted = [...guests];

        switch (sortBy) {
            case 'name':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'rsvp':
                return sorted.sort((a, b) => {
                    if (a.rsvp === b.rsvp) return 0;
                    if (a.rsvp === true) return -1;
                    if (b.rsvp === true) return 1;
                    if (a.rsvp === false) return -1;
                    return 1;
                });
            case 'attended':
                return sorted.sort((a, b) => {
                    if (a.attended === b.attended) return 0;
                    return a.attended ? -1 : 1;
                });
            default:
                return sorted;
        }
    };

    it('should sort guests by name alphabetically', () => {
        const guests = [
            { name: 'Charlie' },
            { name: 'Alice' },
            { name: 'Bob' }
        ];

        const sorted = sortGuests(guests, 'name');
        expect(sorted[0].name).toBe('Alice');
        expect(sorted[1].name).toBe('Bob');
        expect(sorted[2].name).toBe('Charlie');
    });

    it('should sort by RSVP status', () => {
        const guests = [
            { name: 'Pending', rsvp: null },
            { name: 'Confirmed', rsvp: true },
            { name: 'Declined', rsvp: false }
        ];

        const sorted = sortGuests(guests, 'rsvp');
        expect(sorted[0].name).toBe('Confirmed');
    });
});

describe('Task Progress Tracking', () => {
    const calculateProgress = (tasks) => {
        if (tasks.length === 0) return 0;

        const completed = tasks.filter(t => t.completed).length;
        return Math.round((completed / tasks.length) * 100);
    };

    it('should calculate task completion percentage', () => {
        const tasks = [
            { name: 'Task 1', completed: true },
            { name: 'Task 2', completed: true },
            { name: 'Task 3', completed: false },
            { name: 'Task 4', completed: false }
        ];

        const progress = calculateProgress(tasks);
        expect(progress).toBe(50);
    });

    it('should return 0 for no tasks', () => {
        const progress = calculateProgress([]);
        expect(progress).toBe(0);
    });

    it('should return 100 for all completed', () => {
        const tasks = [
            { name: 'Task 1', completed: true },
            { name: 'Task 2', completed: true }
        ];

        const progress = calculateProgress(tasks);
        expect(progress).toBe(100);
    });
});

describe('Cost Per Guest Calculation', () => {
    const calculateCostPerGuest = (totalBudget, guestCount) => {
        if (guestCount === 0) return 0;
        return Math.round((totalBudget / guestCount) * 100) / 100;
    };

    it('should calculate cost per guest', () => {
        const cost = calculateCostPerGuest(5000, 50);
        expect(cost).toBe(100);
    });

    it('should handle decimal results', () => {
        const cost = calculateCostPerGuest(1000, 3);
        expect(cost).toBe(333.33);
    });

    it('should return 0 for zero guests', () => {
        const cost = calculateCostPerGuest(5000, 0);
        expect(cost).toBe(0);
    });
});

describe('Plus-One Handling', () => {
    const countTotalAttendees = (guests) => {
        return guests.reduce((total, guest) => {
            return total + 1 + (guest.plusOne || 0);
        }, 0);
    };

    it('should count guests with plus-ones', () => {
        const guests = [
            { name: 'John', plusOne: 1 },
            { name: 'Jane', plusOne: 0 },
            { name: 'Bob', plusOne: 2 }
        ];

        const total = countTotalAttendees(guests);
        expect(total).toBe(6); // 3 guests + 3 plus-ones
    });

    it('should handle guests without plus-ones', () => {
        const guests = [
            { name: 'John' },
            { name: 'Jane' }
        ];

        const total = countTotalAttendees(guests);
        expect(total).toBe(2);
    });
});

describe('Time Formatting', () => {
    const formatTime = (time24) => {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    it('should convert 24h to 12h format', () => {
        expect(formatTime('14:30')).toBe('2:30 PM');
        expect(formatTime('09:15')).toBe('9:15 AM');
        expect(formatTime('00:00')).toBe('12:00 AM');
        expect(formatTime('12:00')).toBe('12:00 PM');
    });
});

describe('QR Code Data', () => {
    const generateQRData = (guest, event) => {
        return JSON.stringify({
            guestId: guest.id,
            eventId: event.id,
            name: guest.name,
            checkInToken: `${event.id}-${guest.id}`
        });
    };

    it('should generate valid QR code data', () => {
        const guest = { id: 'g123', name: 'John Doe' };
        const event = { id: 'e456', title: 'Birthday' };

        const qrData = generateQRData(guest, event);
        const parsed = JSON.parse(qrData);

        expect(parsed.guestId).toBe('g123');
        expect(parsed.eventId).toBe('e456');
        expect(parsed.name).toBe('John Doe');
        expect(parsed.checkInToken).toBe('e456-g123');
    });
});
