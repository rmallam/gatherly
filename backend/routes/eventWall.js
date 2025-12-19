import express from 'express';
import { query } from '../db/connection.js';
import { authMiddleware } from '../server/auth.js';

const router = express.Router();

// Test endpoint to verify routes are loaded
router.get('/test', (req, res) => {
    res.json({ message: 'Event wall routes are loaded!' });
});

// Join an event wall (become a participant)
router.post('/:eventId/join', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;
        const { profilePhoto, bio, funFact, relationshipToHost } = req.body;
        const userId = req.user.userId;

        // Find guest record for this user at this event
        const guestCheck = await query(
            `SELECT g.* FROM guests g 
             WHERE g.event_id = $1 AND g.user_id = $2`,
            [eventId, userId]
        );

        let guestId = null;

        if (guestCheck.rows.length > 0) {
            // User is a guest - use their guest record
            guestId = guestCheck.rows[0].id;
        } else {
            // Check if user is the event organizer
            const eventCheck = await query(
                'SELECT * FROM events WHERE id = $1 AND user_id = $2',
                [eventId, userId]
            );

            if (eventCheck.rows.length > 0) {
                // User is organizer - create a guest record for them
                const newGuest = await query(
                    `INSERT INTO guests (event_id, user_id, name, email) 
                     VALUES ($1, $2, $3, $4) RETURNING id`,
                    [eventId, userId, req.user.name, req.user.email]
                );
                guestId = newGuest.rows[0].id;
            } else {
                return res.status(404).json({ error: 'Event not found or access denied' });
            }
        }

        // Check if already joined as participant
        const existingParticipant = await query(
            'SELECT * FROM event_participants WHERE event_id = $1 AND guest_id = $2',
            [eventId, guestId]
        );

        if (existingParticipant.rows.length > 0) {
            return res.json({ participant: existingParticipant.rows[0] });
        }

        // Join the event wall
        const result = await query(
            `INSERT INTO event_participants 
            (event_id, guest_id, profile_photo_url, bio, fun_fact, relationship_to_host)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [eventId, guestId, profilePhoto, bio, funFact, relationshipToHost]
        );

        res.json({ participant: result.rows[0] });
    } catch (error) {
        console.error('Error joining event:', error);
        res.status(500).json({ error: 'Failed to join event' });
    }
});

// Get event participants
router.get('/:eventId/participants', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;

        const result = await query(
            `SELECT 
                ep.*,
                g.name as guest_name,
                g.email,
                g.phone
            FROM event_participants ep
            JOIN guests g ON ep.guest_id = g.id
            WHERE ep.event_id = $1
            ORDER BY ep.joined_at DESC`,
            [eventId]
        );

        res.json({ participants: result.rows });
    } catch (error) {
        console.error('Error fetching participants:', error);
        res.status(500).json({ error: 'Failed to fetch participants' });
    }
});

// Update participant profile
router.patch('/:eventId/participants/:participantId', authMiddleware, async (req, res) => {
    try {
        const { participantId } = req.params;
        const { profilePhoto, bio, funFact, relationshipToHost } = req.body;

        const result = await query(
            `UPDATE event_participants 
            SET profile_photo_url = COALESCE($1, profile_photo_url),
                bio = COALESCE($2, bio),
                fun_fact = COALESCE($3, fun_fact),
                relationship_to_host = COALESCE($4, relationship_to_host)
            WHERE id = $5
            RETURNING *`,
            [profilePhoto, bio, funFact, relationshipToHost, participantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Participant not found' });
        }

        res.json({ participant: result.rows[0] });
    } catch (error) {
        console.error('Error updating participant:', error);
        res.status(500).json({ error: 'Failed to update participant' });
    }
});

// Get event wall posts
router.get('/:eventId/posts', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;
        const { limit = 20, offset = 0, type = 'all' } = req.query;

        let query = `
            SELECT 
                ep.*,
                part.profile_photo_url,
                g.name as author_name,
                COUNT(DISTINCT pl.id) as like_count,
                COUNT(DISTINCT pc.id) as comment_count
            FROM event_posts ep
            JOIN event_participants part ON ep.participant_id = part.id
            JOIN guests g ON part.guest_id = g.id
            LEFT JOIN post_likes pl ON ep.id = pl.post_id
            LEFT JOIN post_comments pc ON ep.id = pc.post_id
            WHERE ep.event_id = $1 AND ep.is_approved = true
        `;

        const params = [eventId];

        if (type !== 'all') {
            query += ` AND ep.post_type = $${params.length + 1}`;
            params.push(type);
        }

        query += `
            GROUP BY ep.id, part.profile_photo_url, g.name
            ORDER BY ep.is_pinned DESC, ep.created_at DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;

        params.push(limit, offset);

        const result = await query(query, params);

        res.json({
            posts: result.rows,
            hasMore: result.rows.length === parseInt(limit)
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Create new post
router.post('/:eventId/posts', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;
        const { participantId, type, content, photoUrl } = req.body;

        // Verify participant belongs to this event
        const participantCheck = await query(
            'SELECT * FROM event_participants WHERE id = $1 AND event_id = $2',
            [participantId, eventId]
        );

        if (participantCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Not a participant of this event' });
        }

        const result = await query(
            `INSERT INTO event_posts 
            (event_id, participant_id, post_type, content, photo_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [eventId, participantId, type, content, photoUrl]
        );

        // Fetch the complete post with author info
        const postWithAuthor = await query(
            `SELECT 
                ep.*,
                part.profile_photo_url,
                g.name as author_name
            FROM event_posts ep
            JOIN event_participants part ON ep.participant_id = part.id
            JOIN guests g ON part.guest_id = g.id
            WHERE ep.id = $1`,
            [result.rows[0].id]
        );

        res.json({ post: postWithAuthor.rows[0] });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Delete post
router.delete('/:eventId/posts/:postId', authMiddleware, async (req, res) => {
    try {
        const { eventId, postId } = req.params;
        const userId = req.user.userId;

        // Check if user is event owner or post author
        const authCheck = await query(
            `SELECT ep.* FROM event_posts ep
            JOIN event_participants part ON ep.participant_id = part.id
            JOIN guests g ON part.guest_id = g.id
            JOIN events e ON ep.event_id = e.id
            WHERE ep.id = $1 AND ep.event_id = $2
            AND (e.user_id = $3 OR g.user_id = $3)`,
            [postId, eventId, userId]
        );

        if (authCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Not authorized to delete this post' });
        }

        await query('DELETE FROM event_posts WHERE id = $1', [postId]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

// Like a post
router.post('/posts/:postId/like', authMiddleware, async (req, res) => {
    try {
        const { postId } = req.params;
        const { participantId } = req.body;

        // Check if already liked
        const existing = await query(
            'SELECT * FROM post_likes WHERE post_id = $1 AND participant_id = $2',
            [postId, participantId]
        );

        if (existing.rows.length > 0) {
            return res.json({ like: existing.rows[0] });
        }

        const result = await query(
            'INSERT INTO post_likes (post_id, participant_id) VALUES ($1, $2) RETURNING *',
            [postId, participantId]
        );

        // Get updated like count
        const countResult = await query(
            'SELECT COUNT(*) as like_count FROM post_likes WHERE post_id = $1',
            [postId]
        );

        res.json({
            like: result.rows[0],
            likeCount: parseInt(countResult.rows[0].like_count)
        });
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ error: 'Failed to like post' });
    }
});

// Unlike a post
router.delete('/posts/:postId/like/:participantId', authMiddleware, async (req, res) => {
    try {
        const { postId, participantId } = req.params;

        await query(
            'DELETE FROM post_likes WHERE post_id = $1 AND participant_id = $2',
            [postId, participantId]
        );

        // Get updated like count
        const countResult = await query(
            'SELECT COUNT(*) as like_count FROM post_likes WHERE post_id = $1',
            [postId]
        );

        res.json({
            success: true,
            likeCount: parseInt(countResult.rows[0].like_count)
        });
    } catch (error) {
        console.error('Error unliking post:', error);
        res.status(500).json({ error: 'Failed to unlike post' });
    }
});

export default router;
