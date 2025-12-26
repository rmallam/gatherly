import express from 'express';
import { query } from '../db/connection.js';
import { authMiddleware } from '../server/auth.js';

const router = express.Router();

// Get all user's contact groups with member counts
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await query(
            `SELECT 
                cg.*,
                COUNT(cgm.contact_id) as member_count
            FROM contact_groups cg
            LEFT JOIN contact_group_members cgm ON cgm.group_id = cg.id
            WHERE cg.user_id = $1
            GROUP BY cg.id
            ORDER BY cg.name ASC`,
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching contact groups:', error);
        res.status(500).json({ error: 'Failed to fetch contact groups' });
    }
});

// Get single group with members
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const groupId = req.params.id;

        const groupResult = await query(
            'SELECT * FROM contact_groups WHERE id = $1 AND user_id = $2',
            [groupId, userId]
        );

        if (groupResult.rows.length === 0) {
            return res.status(404).json({ error: 'Group not found' });
        }

        res.json(groupResult.rows[0]);
    } catch (error) {
        console.error('Error fetching contact group:', error);
        res.status(500).json({ error: 'Failed to fetch contact group' });
    }
});

// Create new contact group
router.post('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, description, color } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Group name is required' });
        }

        const result = await query(
            `INSERT INTO contact_groups (user_id, name, description, color)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [userId, name.trim(), description || null, color || '#6B7280']
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating contact group:', error);

        // Handle duplicate group name
        if (error.code === '23505') {
            return res.status(400).json({ error: 'A group with this name already exists' });
        }

        res.status(500).json({ error: 'Failed to create contact group' });
    }
});

// Update contact group
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const groupId = req.params.id;
        const { name, description, color } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Group name is required' });
        }

        const result = await query(
            `UPDATE contact_groups 
            SET name = $1, description = $2, color = $3
            WHERE id = $4 AND user_id = $5
            RETURNING *`,
            [name.trim(), description || null, color || '#6B7280', groupId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Group not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating contact group:', error);

        // Handle duplicate group name
        if (error.code === '23505') {
            return res.status(400).json({ error: 'A group with this name already exists' });
        }

        res.status(500).json({ error: 'Failed to update contact group' });
    }
});

// Delete contact group
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const groupId = req.params.id;

        const result = await query(
            'DELETE FROM contact_groups WHERE id = $1 AND user_id = $2 RETURNING *',
            [groupId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Group not found' });
        }

        res.json({ message: 'Group deleted successfully' });
    } catch (error) {
        console.error('Error deleting contact group:', error);
        res.status(500).json({ error: 'Failed to delete contact group' });
    }
});

// Get all members of a group
router.get('/:id/members', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const groupId = req.params.id;

        // Verify group ownership
        const groupCheck = await query(
            'SELECT id FROM contact_groups WHERE id = $1 AND user_id = $2',
            [groupId, userId]
        );

        if (groupCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Get all contacts in the group
        const result = await query(
            `SELECT uc.*, cgm.added_at as group_added_at
            FROM user_contacts uc
            INNER JOIN contact_group_members cgm ON cgm.contact_id = uc.id
            WHERE cgm.group_id = $1
            ORDER BY uc.name ASC`,
            [groupId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching group members:', error);
        res.status(500).json({ error: 'Failed to fetch group members' });
    }
});

// Add contacts to group (bulk)
router.post('/:id/members', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const groupId = req.params.id;
        const { contactIds } = req.body;

        if (!Array.isArray(contactIds) || contactIds.length === 0) {
            return res.status(400).json({ error: 'Contact IDs array is required' });
        }

        // Verify group ownership
        const groupCheck = await query(
            'SELECT id FROM contact_groups WHERE id = $1 AND user_id = $2',
            [groupId, userId]
        );

        if (groupCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const addedMembers = [];

        for (const contactId of contactIds) {
            // Verify contact ownership
            const contactCheck = await query(
                'SELECT id FROM user_contacts WHERE id = $1 AND user_id = $2',
                [contactId, userId]
            );

            if (contactCheck.rows.length === 0) continue;

            // Add to group (ignore if already exists)
            try {
                const result = await query(
                    `INSERT INTO contact_group_members (group_id, contact_id)
                    VALUES ($1, $2)
                    RETURNING *`,
                    [groupId, contactId]
                );

                if (result.rows.length > 0) {
                    addedMembers.push(result.rows[0]);
                }
            } catch (err) {
                // Skip if duplicate (already in group)
                if (err.code !== '23505') throw err;
            }
        }

        res.json({
            added: addedMembers.length,
            members: addedMembers
        });
    } catch (error) {
        console.error('Error adding group members:', error);
        res.status(500).json({ error: 'Failed to add group members' });
    }
});

// Remove contact from group
router.delete('/:id/members/:contactId', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const groupId = req.params.id;
        const contactId = req.params.contactId;

        // Verify group ownership
        const groupCheck = await query(
            'SELECT id FROM contact_groups WHERE id = $1 AND user_id = $2',
            [groupId, userId]
        );

        if (groupCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const result = await query(
            'DELETE FROM contact_group_members WHERE group_id = $1 AND contact_id = $2 RETURNING *',
            [groupId, contactId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Member not found in group' });
        }

        res.json({ message: 'Member removed from group successfully' });
    } catch (error) {
        console.error('Error removing group member:', error);
        res.status(500).json({ error: 'Failed to remove group member' });
    }
});

export default router;
