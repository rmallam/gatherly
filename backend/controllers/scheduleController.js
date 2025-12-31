import { query } from '../db/connection.js';

/**
 * Create a new schedule item
 */
export const createScheduleItem = async (req, res) => {
    const { eventId } = req.params;
    const { date, startTime, endTime, title, description, location, category, assignedTo, estimatedCost } = req.body;
    const userId = req.user.id;

    try {
        // Verify user has access to event
        const eventCheck = await query(
            `SELECT id FROM events WHERE id = $1 AND 
             (user_id = $2 OR id IN (
                 SELECT event_id FROM guests WHERE user_id = $2
             ))`,
            [eventId, userId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied to this event' });
        }

        // Validate required fields
        if (!date || !title) {
            return res.status(400).json({ error: 'Date and title are required' });
        }

        // Create schedule item
        const result = await query(
            `INSERT INTO event_schedule_items 
             (event_id, date, start_time, end_time, title, description, location, category, assigned_to, estimated_cost, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING *`,
            [
                eventId,
                date,
                startTime || null,
                endTime || null,
                title,
                description || null,
                location || null,
                category || 'activity',
                assignedTo ? JSON.stringify(assignedTo) : null,
                estimatedCost || null,
                userId
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating schedule item:', error);
        res.status(500).json({ error: 'Failed to create schedule item' });
    }
};

/**
 * Get all schedule items for an event
 */
export const getScheduleItems = async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user.id;
    const { date, startDate, endDate } = req.query;

    try {
        // Verify access
        const eventCheck = await query(
            `SELECT id FROM events WHERE id = $1 AND 
             (user_id = $2 OR id IN (
                 SELECT event_id FROM guests WHERE user_id = $2
             ))`,
            [eventId, userId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied to this event' });
        }

        // Build query with filters
        let queryText = `
            SELECT si.*, 
                   u.name as created_by_name
            FROM event_schedule_items si
            LEFT JOIN users u ON si.created_by = u.id
            WHERE si.event_id = $1
        `;

        const params = [eventId];
        let paramCount = 1;

        if (date) {
            paramCount++;
            queryText += ` AND si.date = $${paramCount}`;
            params.push(date);
        }

        if (startDate) {
            paramCount++;
            queryText += ` AND si.date >= $${paramCount}`;
            params.push(startDate);
        }

        if (endDate) {
            paramCount++;
            queryText += ` AND si.date <= $${paramCount}`;
            params.push(endDate);
        }

        queryText += ` ORDER BY si.date ASC, si.start_time ASC NULLS LAST`;

        const result = await query(queryText, params);

        res.json({ scheduleItems: result.rows });
    } catch (error) {
        console.error('Error fetching schedule items:', error);
        res.status(500).json({ error: 'Failed to fetch schedule items' });
    }
};

/**
 * Get schedule item by ID
 */
export const getScheduleItem = async (req, res) => {
    const { eventId, itemId } = req.params;
    const userId = req.user.id;

    try {
        // Verify access
        const eventCheck = await query(
            `SELECT id FROM events WHERE id = $1 AND 
             (user_id = $2 OR id IN (
                 SELECT event_id FROM guests WHERE user_id = $2
             ))`,
            [eventId, userId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied to this event' });
        }

        const result = await query(
            `SELECT si.*, u.name as created_by_name
             FROM event_schedule_items si
             LEFT JOIN users u ON si.created_by = u.id
             WHERE si.id = $1 AND si.event_id = $2`,
            [itemId, eventId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Schedule item not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching schedule item:', error);
        res.status(500).json({ error: 'Failed to fetch schedule item' });
    }
};

/**
 * Update schedule item
 */
export const updateScheduleItem = async (req, res) => {
    const { eventId, itemId } = req.params;
    const { date, startTime, endTime, title, description, location, category, assignedTo, estimatedCost } = req.body;
    const userId = req.user.id;

    try {
        // Verify access
        const eventCheck = await query(
            `SELECT id FROM events WHERE id = $1 AND 
             (user_id = $2 OR id IN (
                 SELECT event_id FROM guests WHERE user_id = $2
             ))`,
            [eventId, userId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied to this event' });
        }

        // Build update query
        const updateFields = [];
        const updateParams = [itemId, eventId];
        let paramCount = 2;

        if (date !== undefined) {
            paramCount++;
            updateFields.push(`date = $${paramCount}`);
            updateParams.push(date);
        }
        if (startTime !== undefined) {
            paramCount++;
            updateFields.push(`start_time = $${paramCount}`);
            updateParams.push(startTime);
        }
        if (endTime !== undefined) {
            paramCount++;
            updateFields.push(`end_time = $${paramCount}`);
            updateParams.push(endTime);
        }
        if (title !== undefined) {
            paramCount++;
            updateFields.push(`title = $${paramCount}`);
            updateParams.push(title);
        }
        if (description !== undefined) {
            paramCount++;
            updateFields.push(`description = $${paramCount}`);
            updateParams.push(description);
        }
        if (location !== undefined) {
            paramCount++;
            updateFields.push(`location = $${paramCount}`);
            updateParams.push(location);
        }
        if (category !== undefined) {
            paramCount++;
            updateFields.push(`category = $${paramCount}`);
            updateParams.push(category);
        }
        if (assignedTo !== undefined) {
            paramCount++;
            updateFields.push(`assigned_to = $${paramCount}`);
            updateParams.push(assignedTo ? JSON.stringify(assignedTo) : null);
        }
        if (estimatedCost !== undefined) {
            paramCount++;
            updateFields.push(`estimated_cost = $${paramCount}`);
            updateParams.push(estimatedCost);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        const result = await query(
            `UPDATE event_schedule_items 
             SET ${updateFields.join(', ')}
             WHERE id = $1 AND event_id = $2
             RETURNING *`,
            updateParams
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Schedule item not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating schedule item:', error);
        res.status(500).json({ error: 'Failed to update schedule item' });
    }
};

/**
 * Delete schedule item
 */
export const deleteScheduleItem = async (req, res) => {
    const { eventId, itemId } = req.params;
    const userId = req.user.id;

    try {
        // Verify access
        const eventCheck = await query(
            `SELECT id FROM events WHERE id = $1 AND 
             (user_id = $2 OR id IN (
                 SELECT event_id FROM guests WHERE user_id = $2
             ))`,
            [eventId, userId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied to this event' });
        }

        const result = await query(
            'DELETE FROM event_schedule_items WHERE id = $1 AND event_id = $2 RETURNING id',
            [itemId, eventId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Schedule item not found' });
        }

        res.json({ message: 'Schedule item deleted successfully' });
    } catch (error) {
        console.error('Error deleting schedule item:', error);
        res.status(500).json({ error: 'Failed to delete schedule item' });
    }
};
