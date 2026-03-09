import { query } from '../db/connection.js';
import { generateGiftRegistry } from '../services/geminiService.js';

/**
 * Get all gifts for an event
 */
export const getGifts = async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user.id;

    try {
        // Verify access - user must be owner or a guest
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
            `SELECT * FROM gift_registries 
             WHERE event_id = $1 
             ORDER BY priority DESC, created_at DESC`,
            [eventId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching gifts:', error);
        res.status(500).json({ error: 'Failed to fetch gifts' });
    }
};

/**
 * Create a custom gift
 */
export const createGift = async (req, res) => {
    const { eventId } = req.params;
    const { name, description, estimated_price, priority, category, url } = req.body;
    const userId = req.user.id;

    try {
        // Only host can create custom gifts initially
        const eventCheck = await query(
            `SELECT id FROM events WHERE id = $1 AND user_id = $2`,
            [eventId, userId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Only the event host can add custom gifts' });
        }

        const result = await query(
            `INSERT INTO gift_registries 
             (event_id, name, description, estimated_price, priority, category, url)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [eventId, name, description, estimated_price, priority || 'Medium', category, url]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating gift:', error);
        res.status(500).json({ error: 'Failed to create gift' });
    }
};

/**
 * Auto-Generate Gift Registry via AI
 */
export const autoGenerateGiftRegistry = async (req, res) => {
    const { eventId } = req.params;
    const { prompt } = req.body;
    const userId = req.user.id;

    try {
        // Only host can generate gifts
        const eventCheck = await query(
            `SELECT id, title, data, date FROM events WHERE id = $1 AND user_id = $2`,
            [eventId, userId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Only the event host can generate a gift registry' });
        }

        const dbEvent = eventCheck.rows[0];
        const eventData = {
            ...dbEvent,
            eventType: dbEvent.data?.eventType || 'General'
        };

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required for gift generation' });
        }

        // Call Gemini
        const aiResult = await generateGiftRegistry(eventData, prompt);

        if (!aiResult || !aiResult.gifts || !Array.isArray(aiResult.gifts)) {
            return res.status(500).json({ error: 'Failed to generate valid gift format' });
        }

        const generatedItems = [];

        // Insert each AI item into the DB
        for (const item of aiResult.gifts) {
            const result = await query(
                `INSERT INTO gift_registries 
                 (event_id, name, description, estimated_price, priority, category, url)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING *`,
                [
                    eventId,
                    item.name || 'Gift Idea',
                    item.description || null,
                    item.estimated_price || null,
                    item.priority || 'Medium',
                    item.category || null,
                    item.url || null
                ]
            );
            generatedItems.push(result.rows[0]);
        }

        res.status(201).json({ gifts: generatedItems });
    } catch (error) {
        console.error('Error auto-generating gifts:', error);
        res.status(500).json({ error: 'Failed to auto-generate gift registry' });
    }
};

/**
 * Update gift status (e.g. mark purchased)
 */
export const updateGift = async (req, res) => {
    const { eventId, giftId } = req.params;
    const { is_purchased } = req.body;
    const userId = req.user.id;

    try {
        // Any guest can mark a gift as purchased
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
            `UPDATE gift_registries 
             SET is_purchased = $1, purchased_by = CASE WHEN $1 THEN $2 ELSE NULL END, updated_at = CURRENT_TIMESTAMP
             WHERE id = $3 AND event_id = $4
             RETURNING *`,
            [is_purchased, userId, giftId, eventId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Gift not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating gift:', error);
        res.status(500).json({ error: 'Failed to update gift' });
    }
};

/**
 * Delete a gift
 */
export const deleteGift = async (req, res) => {
    const { eventId, giftId } = req.params;
    const userId = req.user.id;

    try {
        // Only host can delete
        const eventCheck = await query(
            `SELECT id FROM events WHERE id = $1 AND user_id = $2`,
            [eventId, userId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Only the event host can delete gifts' });
        }

        await query('DELETE FROM gift_registries WHERE id = $1 AND event_id = $2', [giftId, eventId]);

        res.json({ message: 'Gift removed successfully' });
    } catch (error) {
        console.error('Error deleting gift:', error);
        res.status(500).json({ error: 'Failed to delete gift' });
    }
};
