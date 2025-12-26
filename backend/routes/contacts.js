import express from 'express';
import { query } from '../db/connection.js';
import { authMiddleware } from '../server/auth.js';

const router = express.Router();

// Get all user's contacts
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await query(
            `SELECT 
                c.*,
                COUNT(DISTINCT g.event_id) as events_count,
                MAX(g.added_at) as last_invited_at
            FROM user_contacts c
            LEFT JOIN guests g ON g.contact_id = c.id
            WHERE c.user_id = $1
            GROUP BY c.id
            ORDER BY c.name ASC`,
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});

// Search contacts
router.get('/search', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const searchQuery = req.query.q || '';

        const result = await query(
            `SELECT * FROM user_contacts 
            WHERE user_id = $1 
            AND (
                name ILIKE $2 OR 
                phone ILIKE $2 OR 
                email ILIKE $2
            )
            ORDER BY name ASC`,
            [userId, `%${searchQuery}%`]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error searching contacts:', error);
        res.status(500).json({ error: 'Failed to search contacts' });
    }
});

// Get single contact
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const contactId = req.params.id;

        const result = await query(
            'SELECT * FROM user_contacts WHERE id = $1 AND user_id = $2',
            [contactId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching contact:', error);
        res.status(500).json({ error: 'Failed to fetch contact' });
    }
});

// Create new contact
router.post('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, phone, email, notes } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Name is required' });
        }

        if (!phone && !email) {
            return res.status(400).json({ error: 'Phone or email is required' });
        }

        const result = await query(
            `INSERT INTO user_contacts (user_id, name, phone, email, notes)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [userId, name.trim(), phone || null, email || null, notes || null]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating contact:', error);

        // Handle duplicate constraint violations
        if (error.code === '23505') {
            if (error.constraint?.includes('phone')) {
                return res.status(400).json({ error: 'A contact with this phone number already exists' });
            }
            if (error.constraint?.includes('email')) {
                return res.status(400).json({ error: 'A contact with this email already exists' });
            }
        }

        res.status(500).json({ error: 'Failed to create contact' });
    }
});

// Update contact
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const contactId = req.params.id;
        const { name, phone, email, notes } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Name is required' });
        }

        if (!phone && !email) {
            return res.status(400).json({ error: 'Phone or email is required' });
        }

        const result = await query(
            `UPDATE user_contacts 
            SET name = $1, phone = $2, email = $3, notes = $4
            WHERE id = $5 AND user_id = $6
            RETURNING *`,
            [name.trim(), phone || null, email || null, notes || null, contactId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating contact:', error);

        // Handle duplicate constraint violations
        if (error.code === '23505') {
            if (error.constraint?.includes('phone')) {
                return res.status(400).json({ error: 'A contact with this phone number already exists' });
            }
            if (error.constraint?.includes('email')) {
                return res.status(400).json({ error: 'A contact with this email already exists' });
            }
        }

        res.status(500).json({ error: 'Failed to update contact' });
    }
});

// Delete contact
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const contactId = req.params.id;

        const result = await query(
            'DELETE FROM user_contacts WHERE id = $1 AND user_id = $2 RETURNING *',
            [contactId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ error: 'Failed to delete contact' });
    }
});

// Bulk create contacts
router.post('/bulk', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { contacts } = req.body;

        if (!Array.isArray(contacts) || contacts.length === 0) {
            return res.status(400).json({ error: 'Contacts array is required' });
        }

        const createdContacts = [];

        for (const contact of contacts) {
            const { name, phone, email, notes } = contact;

            if (!name || !name.trim() || (!phone && !email)) {
                continue; // Skip invalid contacts
            }

            try {
                const result = await query(
                    `INSERT INTO user_contacts (user_id, name, phone, email, notes)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT DO NOTHING
                    RETURNING *`,
                    [userId, name.trim(), phone || null, email || null, notes || null]
                );

                if (result.rows.length > 0) {
                    createdContacts.push(result.rows[0]);
                }
            } catch (err) {
                // Skip duplicates, continue with others
                console.log('Skipping duplicate contact:', name);
            }
        }

        res.status(201).json({
            created: createdContacts.length,
            contacts: createdContacts
        });
    } catch (error) {
        console.error('Error bulk creating contacts:', error);
        res.status(500).json({ error: 'Failed to bulk create contacts' });
    }
});

// Add contacts to event (bulk add from library to event)
router.post('/add-to-event/:eventId', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const eventId = req.params.eventId;
        const { contactIds } = req.body;

        if (!Array.isArray(contactIds) || contactIds.length === 0) {
            return res.status(400).json({ error: 'Contact IDs array is required' });
        }

        // Verify event ownership
        const eventCheck = await query(
            'SELECT id FROM events WHERE id = $1 AND user_id = $2',
            [eventId, userId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const addedGuests = [];

        for (const contactId of contactIds) {
            // Get contact details
            const contactResult = await query(
                'SELECT * FROM user_contacts WHERE id = $1 AND user_id = $2',
                [contactId, userId]
            );

            if (contactResult.rows.length === 0) continue;

            const contact = contactResult.rows[0];

            // Check if already added to this event
            const existingGuest = await query(
                'SELECT id FROM guests WHERE event_id = $1 AND (phone = $2 OR (email IS NOT NULL AND email = $3))',
                [eventId, contact.phone, contact.email]
            );

            if (existingGuest.rows.length > 0) continue; // Skip if already added

            // Add as guest
            const guestResult = await query(
                `INSERT INTO guests (event_id, name, phone, email, contact_id, created_at)
                VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
                RETURNING *`,
                [eventId, contact.name, contact.phone, contact.email, contact.id]
            );

            addedGuests.push(guestResult.rows[0]);
        }

        res.json({
            added: addedGuests.length,
            guests: addedGuests
        });
    } catch (error) {
        console.error('Error adding contacts to event:', error);
        res.status(500).json({ error: 'Failed to add contacts to event' });
    }
});

export default router;
