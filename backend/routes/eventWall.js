import express from 'express';
import { query } from '../db/connection.js';
import { authMiddleware } from '../server/auth.js';

const router = express.Router();

// Test endpoint to verify routes are loaded
router.get('/test', (req, res) => {
    res.json({ message: 'Event wall routes are loaded!' });
});

// Get event details
router.get('/:eventId/details', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;
        const result = await query(
            'SELECT id, title, description, date, location, user_id FROM events WHERE id = $1',
            [eventId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get event details error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Join an event wall (become a participant)
router.post('/:eventId/join', authMiddleware, async (req, res) => {
    console.log('=== JOIN EVENT WALL REQUEST ==');
    console.log('Event ID:', req.params.eventId);
    console.log('User ID:', req.user?.userId);
    console.log('Body:', req.body);

    try {
        const { eventId } = req.params;
        const { profilePhoto, bio, funFact, relationshipToHost } = req.body;
        const userId = req.user.id;  // FIX: auth middleware sets req.user.id, not req.user.userId

        console.log('Looking for guest with eventId:', eventId, 'userId:', userId);

        // Find guest record for this user at this event
        const guestCheck = await query(
            `SELECT g.* FROM guests g 
             WHERE g.event_id = $1 AND g.user_id = $2`,
            [eventId, userId]
        );

        console.log('Guest check result:', guestCheck.rows.length, 'rows');

        let guestId = null;

        if (guestCheck.rows.length > 0) {
            console.log('User is guest, guestId:', guestCheck.rows[0].id);
            guestId = guestCheck.rows[0].id;
        } else {
            console.log('Not a guest, checking if organizer...');
            // Check if user is the event organizer
            const eventCheck = await query(
                'SELECT * FROM events WHERE id = $1 AND user_id = $2',
                [eventId, userId]
            );

            console.log('Event organizer check:', eventCheck.rows.length, 'rows');
            if (eventCheck.rows.length > 0) {
                console.log('User IS the organizer!');
            } else {
                console.log('❌ User is NOT the organizer. Event user_id:', eventCheck.rows[0]?.user_id, 'vs User ID:', userId);
            }

            if (eventCheck.rows.length > 0) {
                // User is organizer - fetch their details and create a guest record for them
                const userDetails = await query(
                    'SELECT name, email, phone FROM users WHERE id = $1',
                    [userId]
                );

                if (userDetails.rows.length === 0) {
                    return res.status(404).json({ error: 'User not found' });
                }

                const user = userDetails.rows[0];
                const newGuest = await query(
                    `INSERT INTO guests (id, event_id, user_id, name, email, phone) 
                     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5) RETURNING id`,
                    [eventId, userId, user.name, user.email, user.phone]
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

        console.log('✅ Join successful, participant:', result.rows[0]);
        res.json({ participant: result.rows[0] });
    } catch (error) {
        console.error('❌ Error joining event:', error);
        res.status(500).json({ error: 'Failed to join event', details: error.message });
    }
});

// Get event participants
router.get('/:eventId/participants', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.id;

        const result = await query(
            `SELECT 
                ep.*,
                g.name as guest_name,
                g.email,
                g.phone,
                CASE WHEN g.user_id = $2 THEN true ELSE false END as is_current_user
            FROM event_participants ep
            JOIN guests g ON ep.guest_id = g.id
            WHERE ep.event_id = $1
            ORDER BY ep.joined_at DESC`,
            [eventId, userId]
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

        const params = [eventId];

        let sqlQuery = `
            SELECT 
                ep.*,
                part.profile_photo_url,
                g.name as author_name,
                g.user_id as author_user_id,
                COUNT(DISTINCT pl.id) as like_count,
                COUNT(DISTINCT pc.id) as comment_count,
                CASE WHEN EXISTS(
                    SELECT 1 FROM post_likes pl2 
                    JOIN event_participants ep2 ON pl2.participant_id = ep2.id
                    JOIN guests g2 ON ep2.guest_id = g2.id
                    WHERE pl2.post_id = ep.id AND g2.user_id = $2
                ) THEN true ELSE false END as user_has_liked
            FROM event_posts ep
            JOIN event_participants part ON ep.participant_id = part.id
            JOIN guests g ON part.guest_id = g.id
            LEFT JOIN post_likes pl ON ep.id = pl.post_id
            LEFT JOIN post_comments pc ON ep.id = pc.post_id
            WHERE ep.event_id = $1 AND ep.is_approved = true
        `;

        params.push(req.user.id);

        if (type !== 'all') {
            sqlQuery += ` AND ep.post_type = $${params.length + 1}`;
            params.push(type);
        }

        sqlQuery += `
            GROUP BY ep.id, part.profile_photo_url, g.name, g.user_id
            ORDER BY ep.is_pinned DESC, ep.created_at DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;

        params.push(limit, offset);

        const result = await query(sqlQuery, params);

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
    console.log('=== CREATE POST REQUEST ===');
    console.log('Event ID:', req.params.eventId);
    console.log('User ID:', req.user?.userId);
    console.log('Body:', req.body);

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
        const userId = req.user.id;  // FIX: use req.user.id not req.user.userId

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
router.post('/:eventId/posts/:postId/like', authMiddleware, async (req, res) => {
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
router.delete('/:eventId/posts/:postId/like/:participantId', authMiddleware, async (req, res) => {
    try {
        const { eventId, postId, participantId } = req.params;
        const userId = req.user.id;

        // Check if user is event owner OR owns this like
        const authCheck = await query(
            `SELECT pl.*, e.user_id as event_owner_id, g.user_id as like_owner_id
             FROM post_likes pl
             JOIN event_participants ep ON pl.participant_id = ep.id
             JOIN guests g ON ep.guest_id = g.id
             JOIN events e ON e.id = $1
             WHERE pl.post_id = $2 AND pl.participant_id = $3`,
            [eventId, postId, participantId]
        );

        if (authCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Like not found' });
        }

        const like = authCheck.rows[0];
        const isEventOwner = like.event_owner_id === userId;
        const isLikeOwner = like.like_owner_id === userId;

        if (!isEventOwner && !isLikeOwner) {
            return res.status(403).json({ error: 'Not authorized to delete this like' });
        }

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

// Catch-all debug route
router.all('*', (req, res) => {
    console.log('⚠️ UNMATCHED ROUTE:', req.method, req.path);
    console.log('Full URL:', req.originalUrl);
    console.log('Params:', req.params);
    res.status(404).json({
        error: 'Route not found in event wall router',
        method: req.method,
        path: req.path,
        originalUrl: req.originalUrl
    });
});

export default router;
