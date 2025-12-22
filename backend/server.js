import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { generateToken, hashPassword, comparePassword, authMiddleware } from './server/auth.js';
import { initializeDatabase, query } from './db/connection.js';
import { validateEmail, validatePassword } from './server/validators.js';
import { sendVerificationEmail } from './server/email.js';
import { initTwilio } from './services/reminderService.js';
import { startReminderCron } from './jobs/reminderCron.js';
import { sendAnnouncement, sendThankYouMessages, getCommunications } from './controllers/communicationController.js';
import {
    sendNotificationToUser,
    sendNotificationToUsers,
    registerDeviceToken,
    removeDeviceToken,
    getUnreadCount
} from './services/notificationService.js';
import eventWallRoutes from './routes/eventWall.js';

const app = express();

// Trust proxy - Required for Render.com and rate limiting
app.set('trust proxy', 1);

// Security Headers - Helmet.js
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// CORS Configuration - Secure for production
const allowedOrigins = [
    'http://localhost:5173',   // Vite dev server
    'http://localhost:3000',   // Alternative dev port
    'capacitor://localhost',   // Capacitor iOS
    'ionic://localhost',       // Capacitor Android
    'http://localhost',        // Capacitor fallback
    'https://localhost',       // Capacitor HTTPS mode
    'https://gatherly-backend-3vmv.onrender.com', // Production backend (for invite.html)
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        console.warn(`Blocked CORS request from unauthorized origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300, // Increased from 100 to handle polling + updates
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts, please try again later.',
    skipSuccessfulRequests: true,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

// Body parser
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (for email verification page)
app.use(express.static('public'));

// === HEALTH CHECK ===
app.get('/api/health', async (req, res) => {
    try {
        // Check database connectivity
        await query('SELECT 1');

        res.json({
            status: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            status: 'error',
            database: 'disconnected',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// === AUTH ROUTES ===
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Must provide name, password, and at least email OR phone
        if (!name || !password) {
            return res.status(400).json({ error: 'Name and password are required' });
        }

        if (!email && !phone) {
            return res.status(400).json({ error: 'Either email or phone number is required' });
        }

        // Validate email if provided
        let validatedEmail = null;
        if (email) {
            const emailValidation = validateEmail(email);
            if (!emailValidation.valid) {
                return res.status(400).json({ error: emailValidation.error });
            }
            validatedEmail = emailValidation.email;
        }

        // Normalize phone if provided
        let validatedPhone = null;
        if (phone) {
            validatedPhone = phone.trim();
            // Basic phone validation (10 digits for India)
            if (!/^\d{10}$/.test(validatedPhone.replace(/\D/g, ''))) {
                return res.status(400).json({ error: 'Please enter a valid 10-digit phone number' });
            }
        }

        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({ error: passwordValidation.error });
        }

        // Check if user exists with email
        if (validatedEmail) {
            const existingEmailUser = await query('SELECT id FROM users WHERE email = $1', [validatedEmail]);
            if (existingEmailUser.rows.length > 0) {
                return res.status(400).json({ error: 'User with this email already exists' });
            }
        }

        // Check if user exists with phone
        if (validatedPhone) {
            const existingPhoneUser = await query('SELECT id FROM users WHERE phone = $1', [validatedPhone]);
            if (existingPhoneUser.rows.length > 0) {
                return res.status(400).json({ error: 'User with this phone number already exists' });
            }
        }

        const hashedPassword = hashPassword(password);
        const userId = uuidv4();
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await query(
            `INSERT INTO users (id, name, email, phone, password, email_verified, verification_token, verification_token_expires) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [userId, name, validatedEmail, validatedPhone, hashedPassword, false, verificationToken, tokenExpires]
        );

        // Auto-link to any guest records with matching email or phone
        if (validatedEmail) {
            await query('UPDATE guests SET user_id = $1 WHERE email = $2 AND user_id IS NULL', [userId, validatedEmail]);
        }
        if (validatedPhone) {
            await query('UPDATE guests SET user_id = $1 WHERE phone = $2 AND user_id IS NULL', [userId, validatedPhone]);
        }

        // Send verification email (only if email provided)
        if (validatedEmail) {
            const user = { id: userId, name, email: validatedEmail };
            try {
                await sendVerificationEmail(user, verificationToken);
            } catch (emailError) {
                console.error('Failed to send verification email:', emailError);
                // Don't fail signup if email fails
            }
        }

        res.json({
            message: validatedEmail
                ? 'Account created! Please check your email to verify your account.'
                : 'Account created successfully!',
            email: validatedEmail,
            phone: validatedPhone
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, phone, password } = req.body;

        // Must provide password and either email OR phone
        if (!password) {
            return res.status(400).json({ error: 'Password is required' });
        }

        if (!email && !phone) {
            return res.status(400).json({ error: 'Email or phone number is required' });
        }

        // Try to find user by email or phone
        let result;
        if (email) {
            result = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
        } else if (phone) {
            result = await query('SELECT * FROM users WHERE phone = $1', [phone.trim()]);
        }

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const isValid = comparePassword(password, user.password);

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if email is verified (can be disabled with env var)
        const skipVerification = process.env.SKIP_EMAIL_VERIFICATION === 'true';
        if (!skipVerification && user.email && !user.email_verified) {
            return res.status(403).json({
                error: 'Please verify your email before logging in',
                needsVerification: true,
                email: user.email
            });
        }

        const token = generateToken(user);
        const userResponse = { id: user.id, name: user.name, email: user.email, phone: user.phone, emailVerified: user.email_verified };

        res.json({ token, user: userResponse });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
    try {
        const result = await query('SELECT id, name, email, email_verified FROM users WHERE id = $1', [req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];
        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                emailVerified: user.email_verified
            }
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Email verification endpoint
app.get('/api/auth/verify-email', async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ error: 'Verification token is required' });
        }

        const result = await query(
            'SELECT * FROM users WHERE verification_token = $1',
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid verification token' });
        }

        const user = result.rows[0];

        // Check if already verified
        if (user.email_verified) {
            return res.json({ message: 'Email already verified', alreadyVerified: true });
        }

        // Check if token expired
        if (new Date() > new Date(user.verification_token_expires)) {
            return res.status(400).json({ error: 'Verification token has expired' });
        }

        // Mark as verified and clear token
        await query(
            'UPDATE users SET email_verified = $1, verification_token = NULL, verification_token_expires = NULL WHERE id = $2',
            [true, user.id]
        );

        res.json({ message: 'Email verified successfully!', verified: true });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Resend verification email
app.post('/api/auth/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const result = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);

        if (result.rows.length === 0) {
            // Don't reveal if email exists or not
            return res.json({ message: 'If an account exists with this email, a verification email has been sent' });
        }

        const user = result.rows[0];

        if (user.email_verified) {
            return res.json({ message: 'Email is already verified' });
        }

        // Generate new token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await query(
            'UPDATE users SET verification_token = $1, verification_token_expires = $2 WHERE id = $3',
            [verificationToken, tokenExpires, user.id]
        );

        // Send verification email
        try {
            await sendVerificationEmail(user, verificationToken);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            return res.status(500).json({ error: 'Failed to send verification email' });
        }

        res.json({ message: 'Verification email sent successfully' });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// === USER PROFILE ROUTES ===

// Get current user's profile
app.get('/api/users/profile', authMiddleware, async (req, res) => {
    try {
        const result = await query(
            'SELECT id, name, email, phone, profile_picture_url, bio, email_verified, created_at, updated_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            profilePictureUrl: user.profile_picture_url,
            bio: user.bio,
            emailVerified: user.email_verified,
            createdAt: user.created_at,
            updatedAt: user.updated_at
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update user profile
app.patch('/api/users/profile', authMiddleware, async (req, res) => {
    try {
        const { name, phone, bio, profilePictureUrl } = req.body;

        // Validate inputs
        if (name && (!name.trim() || name.trim().length < 2)) {
            return res.status(400).json({ error: 'Name must be at least 2 characters' });
        }

        if (phone && phone.trim()) {
            const cleanPhone = phone.replace(/\D/g, '');
            if (!/^\d{10}$/.test(cleanPhone)) {
                return res.status(400).json({ error: 'Please enter a valid 10-digit phone number' });
            }

            // Check if phone is already used by another user
            const existingPhone = await query(
                'SELECT id FROM users WHERE phone = $1 AND id != $2',
                [phone.trim(), req.user.id]
            );
            if (existingPhone.rows.length > 0) {
                return res.status(400).json({ error: 'Phone number already in use' });
            }
        }

        if (bio && bio.length > 500) {
            return res.status(400).json({ error: 'Bio must be less than 500 characters' });
        }

        // Build update query dynamically
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (name !== undefined) {
            updates.push(`name = $${paramCount++}`);
            values.push(name.trim());
        }
        if (phone !== undefined) {
            updates.push(`phone = $${paramCount++}`);
            values.push(phone.trim() || null);
        }
        if (bio !== undefined) {
            updates.push(`bio = $${paramCount++}`);
            values.push(bio.trim() || null);
        }
        if (profilePictureUrl !== undefined) {
            updates.push(`profile_picture_url = $${paramCount++}`);
            values.push(profilePictureUrl || null);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(req.user.id);

        const result = await query(
            `UPDATE users 
             SET ${updates.join(', ')}
             WHERE id = $${paramCount}
             RETURNING id, name, email, phone, profile_picture_url, bio, email_verified, created_at, updated_at`,
            values
        );

        const user = result.rows[0];
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            profilePictureUrl: user.profile_picture_url,
            bio: user.bio,
            emailVerified: user.email_verified,
            createdAt: user.created_at,
            updatedAt: user.updated_at
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Change password
app.post('/api/users/change-password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

        // Get current user password
        const result = await query(
            'SELECT password FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        // Verify current password
        const isValid = comparePassword(currentPassword, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Validate new password
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.valid) {
            return res.status(400).json({ error: passwordValidation.error });
        }

        // Hash and update new password
        const hashedPassword = hashPassword(newPassword);
        await query(
            'UPDATE users SET password = $1 WHERE id = $2',
            [hashedPassword, req.user.id]
        );

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// === EVENT ROUTES ===
app.get('/api/events', authMiddleware, async (req, res) => {
    try {
        // Get events created by the user
        const createdEvents = await query(
            `SELECT e.*, 
             (SELECT json_agg(g.*) FROM guests g WHERE g.event_id = e.id) as guests,
             'organizer' as role
             FROM events e 
             WHERE e.user_id = $1 
             ORDER BY e.created_at DESC`,
            [req.user.id]
        );

        // Get events where user is invited as a guest (but NOT the organizer)
        const invitedEvents = await query(
            `SELECT e.*, 
             (SELECT json_agg(g.*) FROM guests g WHERE g.event_id = e.id) as guests,
             'guest' as role,
             g.id as guest_id,
             g.rsvp,
             g.attended
             FROM events e
             JOIN guests g ON g.event_id = e.id
             WHERE g.user_id = $1 AND e.user_id != $1
             ORDER BY e.date DESC`,
            [req.user.id]
        );

        console.log('📊 Events query for user:', req.user.id, req.user.email || req.user.phone);
        console.log('  ✅ Created (organizer):', createdEvents.rows.length, createdEvents.rows.map(e => e.title));
        console.log('  👥 Invited (guest):', invitedEvents.rows.length, invitedEvents.rows.map(e => e.title));

        // Merge created and invited events
        const allEvents = [...createdEvents.rows, ...invitedEvents.rows];

        // Merge data column into each event
        const events = allEvents.map(event => {
            const { data, role, ...eventFields } = event;
            return {
                ...eventFields,
                ...(data || {}), // Spread the data jsonb fields
                role, // IMPORTANT: Preserve role from query (guest vs organizer)
                guests: event.guests || []
            };
        });

        res.json(events);
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/events', authMiddleware, async (req, res) => {
    try {
        const { title, date, location, description } = req.body;
        const eventId = uuidv4();

        // Convert empty strings to null for optional fields
        const eventDate = date && date.trim() !== '' ? date : null;
        const eventLocation = location && location.trim() !== '' ? location : null;
        const eventDescription = description && description.trim() !== '' ? description : null;

        await query(
            'INSERT INTO events (id, user_id, title, date, location, description) VALUES ($1, $2, $3, $4, $5, $6)',
            [eventId, req.user.id, title, eventDate, eventLocation, eventDescription]
        );

        const event = {
            id: eventId,
            user_id: req.user.id,
            title,
            date: eventDate,
            location: eventLocation,
            description: eventDescription,
            guests: []
        };

        res.json(event);
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/events/:id', authMiddleware, async (req, res) => {
    try {
        const { title, date, location, description, ...extraData } = req.body;

        // Store catering, tasks, venue, and other fields in data jsonb column
        await query(
            'UPDATE events SET title = $1, date = $2, location = $3, description = $4, data = $5 WHERE id = $6 AND user_id = $7',
            [
                title,
                date || null,
                location || null,
                description || null,
                JSON.stringify(extraData),
                req.params.id,
                req.user.id
            ]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/events/:id', authMiddleware, async (req, res) => {
    try {
        await query('DELETE FROM events WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// === NOTIFICATION ROUTES ===

// Register device token
app.post('/api/notifications/register-device', authMiddleware, async (req, res) => {
    try {
        const { playerId, platform } = req.body;

        if (!playerId) {
            return res.status(400).json({ error: 'Player ID is required' });
        }

        if (!platform || !['android', 'ios', 'web'].includes(platform)) {
            return res.status(400).json({ error: 'Valid platform is required (android/ios/web)' });
        }

        await registerDeviceToken(req.user.id, playerId, platform);

        res.json({ success: true, message: 'Device registered successfully' });
    } catch (error) {
        console.error('Register device error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Remove device token
app.delete('/api/notifications/device/:playerId', authMiddleware, async (req, res) => {
    try {
        await removeDeviceToken(req.params.playerId);
        res.json({ success: true, message: 'Device removed successfully' });
    } catch (error) {
        console.error('Remove device error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user's notifications (paginated)
app.get('/api/notifications', authMiddleware, async (req, res) => {
    try {
        const { limit = 20, offset = 0, unreadOnly = 'false' } = req.query;

        let sqlQuery = `
            SELECT id, type, title, body, data, read, created_at
            FROM notifications
            WHERE user_id = $1
        `;

        if (unreadOnly === 'true') {
            sqlQuery += ' AND read = FALSE';
        }

        sqlQuery += ' ORDER BY created_at DESC LIMIT $2 OFFSET $3';

        const result = await query(sqlQuery, [req.user.id, limit, offset]);

        res.json({
            notifications: result.rows,
            hasMore: result.rows.length === parseInt(limit)
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get unread notification count
app.get('/api/notifications/unread-count', authMiddleware, async (req, res) => {
    try {
        const count = await getUnreadCount(req.user.id);
        res.json({ count });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Mark notification as read
app.patch('/api/notifications/:id/read', authMiddleware, async (req, res) => {
    try {
        const result = await query(
            'UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *',
            [req.params.id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json({ success: true, notification: result.rows[0] });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Mark all notifications as read
app.patch('/api/notifications/mark-all-read', authMiddleware, async (req, res) => {
    try {
        await query(
            'UPDATE notifications SET read = TRUE WHERE user_id = $1 AND read = FALSE',
            [req.user.id]
        );

        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete notification
app.delete('/api/notifications/:id', authMiddleware, async (req, res) => {
    try {
        const result = await query(
            'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
            [req.params.id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// === GUEST ROUTES ===
app.post('/api/events/:eventId/guests', authMiddleware, async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const guestId = uuidv4();

        // Verify event ownership
        const eventCheck = await query(
            'SELECT id FROM events WHERE id = $1 AND user_id = $2',
            [req.params.eventId, req.user.id]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Check for duplicate guest (by phone or email)
        // Only check if we have actual phone or email to check against
        const hasPhone = phone && phone.trim().length > 0;
        const hasEmail = email && email.trim().length > 0;

        if (hasPhone || hasEmail) {
            let duplicateName = null;

            // Check phone duplicate
            if (hasPhone) {
                const normalizedPhone = phone.replace(/[\s\-\+]/g, '');
                const phoneCheck = await query(
                    `SELECT g.name FROM guests g 
                     WHERE g.event_id = $1 
                     AND g.phone IS NOT NULL 
                     AND g.phone != ''
                     AND REPLACE(REPLACE(REPLACE(g.phone, ' ', ''), '-', ''), '+', '') = $2
                     LIMIT 1`,
                    [req.params.eventId, normalizedPhone]
                );
                if (phoneCheck.rows.length > 0) {
                    duplicateName = phoneCheck.rows[0].name;
                }
            }

            // Check email duplicate (only if phone didn't find duplicate)
            if (!duplicateName && hasEmail) {
                const emailCheck = await query(
                    `SELECT g.name FROM guests g 
                     WHERE g.event_id = $1 
                     AND g.email IS NOT NULL 
                     AND g.email != ''
                     AND g.email = $2
                     LIMIT 1`,
                    [req.params.eventId, email]
                );
                if (emailCheck.rows.length > 0) {
                    duplicateName = emailCheck.rows[0].name;
                }
            }

            if (duplicateName) {
                return res.status(400).json({
                    error: `Already invited: ${duplicateName}`,
                    duplicate: true
                });
            }
        }

        await query(
            'INSERT INTO guests (id, event_id, name, email, phone) VALUES ($1, $2, $3, $4, $5)',
            [guestId, req.params.eventId, name, email || null, phone || null]
        );

        // Auto-link to existing user if phone or email matches
        let linkedUserId = null;
        if (phone) {
            // Normalize phone for matching (remove spaces, +, etc)
            const normalizedPhone = phone.replace(/[\s\-\+]/g, '');
            const userByPhone = await query(
                `SELECT id FROM users WHERE REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = $1`,
                [normalizedPhone]
            );
            if (userByPhone.rows.length > 0) {
                linkedUserId = userByPhone.rows[0].id;
            }
        }
        if (!linkedUserId && email) {
            const userByEmail = await query(
                'SELECT id FROM users WHERE email = $1',
                [email]
            );
            if (userByEmail.rows.length > 0) {
                linkedUserId = userByEmail.rows[0].id;
            }
        }

        // Update guest with user_id if found
        if (linkedUserId) {
            await query(
                'UPDATE guests SET user_id = $1 WHERE id = $2',
                [linkedUserId, guestId]
            );

            // Send notification to the guest if they have a user account
            try {
                // Get event details for notification
                const eventResult = await query(
                    'SELECT title FROM events WHERE id = $1',
                    [req.params.eventId]
                );

                if (eventResult.rows.length > 0) {
                    const eventTitle = eventResult.rows[0].title;

                    await sendNotificationToUser(linkedUserId, {
                        type: 'guest_added',
                        title: 'New Event Invitation',
                        body: `You've been added to ${eventTitle}`,
                        data: {
                            eventId: req.params.eventId,
                            eventTitle: eventTitle
                        }
                    });

                    console.log(`📨 Notification sent to user ${linkedUserId} for event ${eventTitle}`);
                }
            } catch (notifError) {
                // Don't fail the request if notification fails
                console.error('Failed to send notification:', notifError);
            }
        }

        const guest = { id: guestId, name, email, phone, rsvp: null, attended: false, attended_count: 0 };
        res.json(guest);
    } catch (error) {
        console.error('Add guest error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/events/:eventId/guests/bulk', authMiddleware, async (req, res) => {
    try {
        const { guests } = req.body;

        // Verify event ownership
        const eventCheck = await query(
            'SELECT id FROM events WHERE id = $1 AND user_id = $2',
            [req.params.eventId, req.user.id]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const addedGuests = [];
        const skippedGuests = [];

        for (const guest of guests) {
            // Check for duplicate
            const hasPhone = guest.phone && guest.phone.trim().length > 0;
            const hasEmail = guest.email && guest.email.trim().length > 0;

            if (hasPhone || hasEmail) {
                const normalizedPhone = hasPhone ? guest.phone.replace(/[\s\-\+]/g, '') : null;
                const duplicateCheck = await query(
                    `SELECT g.name FROM guests g 
                     WHERE g.event_id = $1 
                     AND (
                         ($2::text IS NOT NULL AND $2 != '' AND g.phone IS NOT NULL AND g.phone != '' AND REPLACE(REPLACE(REPLACE(g.phone, ' ', ''), '-', ''), '+', '') = $2)
                         OR ($3::text IS NOT NULL AND $3 != '' AND g.email IS NOT NULL AND g.email != '' AND g.email = $3)
                     )
                     LIMIT 1`,
                    [req.params.eventId, normalizedPhone, guest.email]
                );

                if (duplicateCheck.rows.length > 0) {
                    skippedGuests.push({ name: guest.name, reason: `Already invited: ${duplicateCheck.rows[0].name}` });
                    continue;
                }
            }

            const guestId = uuidv4();
            await query(
                'INSERT INTO guests (id, event_id, name, email, phone) VALUES ($1, $2, $3, $4, $5)',
                [guestId, req.params.eventId, guest.name, guest.email || null, guest.phone || null]
            );

            // Auto-link to existing user
            let linkedUserId = null;
            if (guest.phone) {
                const normalizedPhone = guest.phone.replace(/[\s\-\+]/g, '');
                const userByPhone = await query(
                    `SELECT id FROM users WHERE REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = $1`,
                    [normalizedPhone]
                );
                if (userByPhone.rows.length > 0) {
                    linkedUserId = userByPhone.rows[0].id;
                }
            }
            if (!linkedUserId && guest.email) {
                const userByEmail = await query(
                    'SELECT id FROM users WHERE email = $1',
                    [guest.email]
                );
                if (userByEmail.rows.length > 0) {
                    linkedUserId = userByEmail.rows[0].id;
                }
            }
            if (linkedUserId) {
                await query(
                    'UPDATE guests SET user_id = $1 WHERE id = $2',
                    [linkedUserId, guestId]
                );
            }

            addedGuests.push({ id: guestId, ...guest, rsvp: null, attended: false, attended_count: 0 });
        }

        res.json({
            added: addedGuests,
            skipped: skippedGuests,
            message: skippedGuests.length > 0 ? `${addedGuests.length} added, ${skippedGuests.length} skipped (duplicates)` : undefined
        });
    } catch (error) {
        console.error('Bulk add guests error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/events/:eventId/guests/:guestId/rsvp', async (req, res) => {
    try {
        const { rsvp } = req.body;

        await query(
            'UPDATE guests SET rsvp = $1 WHERE id = $2 AND event_id = $3',
            [rsvp, req.params.guestId, req.params.eventId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('RSVP error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/events/:eventId/guests/:guestId/attend', authMiddleware, async (req, res) => {
    try {
        const { count } = req.body;

        await query(
            'UPDATE guests SET attended = true, attended_count = attended_count + $1 WHERE id = $2 AND event_id = $3',
            [count || 1, req.params.guestId, req.params.eventId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Mark attendance error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/events/:eventId/guests/:guestId', authMiddleware, async (req, res) => {
    try {
        await query('DELETE FROM guests WHERE id = $1 AND event_id = $2', [req.params.guestId, req.params.eventId]);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete guest error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Check-in guest
app.post('/api/events/:eventId/guests/:guestId/checkin', authMiddleware, async (req, res) => {
    try {
        const { eventId, guestId } = req.params;
        const { count } = req.body;

        // Verify event ownership
        const eventResult = await query(
            'SELECT user_id FROM events WHERE id = $1',
            [eventId]
        );

        if (eventResult.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (eventResult.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Update guest check-in status
        const result = await query(
            `UPDATE guests 
             SET attended = true, 
                 attended_count = COALESCE(attended_count, 0) + $1,
                 check_in_time = COALESCE(check_in_time, NOW())
             WHERE id = $2 AND event_id = $3
             RETURNING *`,
            [count || 1, guestId, eventId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Guest not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// === CONTACT ROUTES ===
app.get('/api/contacts', authMiddleware, async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM contacts WHERE user_id = $1 ORDER BY name ASC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Fetch contacts error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/contacts', authMiddleware, async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const contactId = uuidv4();

        await query(
            'INSERT INTO contacts (id, user_id, name, email, phone) VALUES ($1, $2, $3, $4, $5)',
            [contactId, req.user.id, name, email || null, phone || null]
        );

        const contact = { id: contactId, name, email, phone };
        res.json(contact);
    } catch (error) {
        console.error('Add contact error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/contacts/bulk', authMiddleware, async (req, res) => {
    try {
        const { contacts } = req.body;
        const addedContacts = [];

        for (const contact of contacts) {
            const contactId = uuidv4();
            await query(
                'INSERT INTO contacts (id, user_id, name, email, phone) VALUES ($1, $2, $3, $4, $5)',
                [contactId, req.user.id, contact.name, contact.email || null, contact.phone || null]
            );
            addedContacts.push({ id: contactId, ...contact });
        }

        res.json(addedContacts);
    } catch (error) {
        console.error('Bulk add contacts error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/contacts/:id', authMiddleware, async (req, res) => {
    try {
        await query('DELETE FROM contacts WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete contact error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// === PUBLIC ROUTES (for RSVP) ===
app.get('/api/public/events/:id', async (req, res) => {
    try {
        const result = await query('SELECT * FROM events WHERE id = $1', [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Fetch public event error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Public RSVP submission endpoint
app.post('/api/public/events/:eventId/rsvp', async (req, res) => {
    try {
        const { eventId } = req.params;
        const { name, email, phone, response, plusOnes, dietaryRestrictions } = req.body;

        // Verify event exists
        const eventResult = await query('SELECT id FROM events WHERE id = $1', [eventId]);
        if (eventResult.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Convert response to boolean
        const rsvpValue = response === 'yes' ? true : response === 'no' ? false : null;

        // Check if guest already exists (by email or phone)
        let existingGuest = null;
        if (email || phone) {
            const guestQuery = email && phone
                ? 'SELECT * FROM guests WHERE event_id = $1 AND (email = $2 OR phone = $3)'
                : email
                    ? 'SELECT * FROM guests WHERE event_id = $1 AND email = $2'
                    : 'SELECT * FROM guests WHERE event_id = $1 AND phone = $2';

            const params = email && phone
                ? [eventId, email, phone]
                : email
                    ? [eventId, email]
                    : [eventId, phone];

            const guestResult = await query(guestQuery, params);
            if (guestResult.rows.length > 0) {
                existingGuest = guestResult.rows[0];
            }
        }

        let guest;
        if (existingGuest) {
            // Update existing guest
            const updateResult = await query(
                `UPDATE guests 
                 SET name = COALESCE($1, name), 
                     email = COALESCE($2, email), 
                     phone = COALESCE($3, phone),
                     rsvp = $4
                 WHERE id = $5 AND event_id = $6
                 RETURNING *`,
                [name, email, phone, rsvpValue, existingGuest.id, eventId]
            );
            guest = updateResult.rows[0];
        } else {
            // Create new guest
            const guestId = uuidv4();
            const insertResult = await query(
                'INSERT INTO guests (id, event_id, name, email, phone, rsvp) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [guestId, eventId, name, email || null, phone || null, rsvpValue]
            );
            guest = insertResult.rows[0];
        }

        res.json({ success: true, message: 'RSVP submitted successfully', guest });
    } catch (error) {
        console.error('Public RSVP error:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// === INVITE/RSVP ROUTES ===
// Serve invite page
app.get('/invite/:eventId', (req, res) => {
    res.sendFile('invite.html', { root: './public' });
});

// Get event and guest data for invite page
app.get('/api/events/:eventId/invite/:guestId', async (req, res) => {
    try {
        const { eventId, guestId } = req.params;

        // Get event with data column
        const eventResult = await query(
            'SELECT id, title, date, location, description, data FROM events WHERE id = $1',
            [eventId]
        );

        if (eventResult.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Get guest
        const guestResult = await query(
            'SELECT id, name, email, phone, rsvp FROM guests WHERE id = $1 AND event_id = $2',
            [guestId, eventId]
        );

        if (guestResult.rows.length === 0) {
            return res.status(404).json({ error: 'Guest not found' });
        }

        // Merge data column into event object
        const event = eventResult.rows[0];
        const { data, ...eventFields } = event;
        const mergedEvent = {
            ...eventFields,
            ...(data || {}) // Spread the data jsonb fields (includes venue, time, etc.)
        };

        res.json({
            event: mergedEvent,
            guest: guestResult.rows[0]
        });
    } catch (error) {
        console.error('Fetch invite data error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ========================================
// BUDGET & EXPENSE ENDPOINTS  
// ========================================

// Get budget for event
app.get('/api/events/:eventId/budget', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;

        // Verify event belongs to user
        const eventCheck = await query(
            'SELECT user_id FROM events WHERE id = $1',
            [eventId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (eventCheck.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const result = await query(
            'SELECT * FROM budgets WHERE event_id = $1',
            [eventId]
        );

        res.json(result.rows[0] || null);
    } catch (error) {
        console.error('Get budget error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create budget for event
app.post('/api/events/:eventId/budget', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;
        const { total_budget, currency } = req.body;

        // Verify event belongs to user
        const eventCheck = await query(
            'SELECT user_id FROM events WHERE id = $1',
            [eventId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (eventCheck.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const budgetId = uuidv4();
        const result = await query(
            'INSERT INTO budgets (id, event_id, total_budget, currency) VALUES ($1, $2, $3, $4) RETURNING *',
            [budgetId, eventId, total_budget, currency || 'USD']
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create budget error:', error);
        if (error.code === '23505') { // Unique constraint violation
            res.status(400).json({ error: 'Budget already exists for this event' });
        } else {
            res.status(500).json({ error: 'Server error' });
        }
    }
});

// Update budget
app.put('/api/events/:eventId/budget', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;
        const { total_budget, currency } = req.body;

        // Verify event belongs to user
        const eventCheck = await query(
            'SELECT user_id FROM events WHERE id = $1',
            [eventId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (eventCheck.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const result = await query(
            'UPDATE budgets SET total_budget = $1, currency = $2, updated_at = NOW() WHERE event_id = $3 RETURNING *',
            [total_budget, currency, eventId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Budget not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update budget error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete budget
app.delete('/api/events/:eventId/budget', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;

        // Verify event belongs to user
        const eventCheck = await query(
            'SELECT user_id FROM events WHERE id = $1',
            [eventId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (eventCheck.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await query('DELETE FROM budgets WHERE event_id = $1', [eventId]);
        res.json({ message: 'Budget deleted successfully' });
    } catch (error) {
        console.error('Delete budget error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all expenses for event
app.get('/api/events/:eventId/expenses', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;

        // Verify event belongs to user
        const eventCheck = await query(
            'SELECT user_id FROM events WHERE id = $1',
            [eventId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (eventCheck.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const result = await query(
            'SELECT * FROM expenses WHERE event_id = $1 ORDER BY date DESC, created_at DESC',
            [eventId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get expenses error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add expense
app.post('/api/events/:eventId/expenses', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;
        const { category, description, amount, vendor, paid, date } = req.body;

        // Verify event belongs to user
        const eventCheck = await query(
            'SELECT user_id FROM events WHERE id = $1',
            [eventId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (eventCheck.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const expenseId = uuidv4();
        const result = await query(
            'INSERT INTO expenses (id, event_id, category, description, amount, vendor, paid, date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [expenseId, eventId, category, description, amount, vendor, paid || false, date || new Date()]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Add expense error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update expense
app.put('/api/events/:eventId/expenses/:expenseId', authMiddleware, async (req, res) => {
    try {
        const { eventId, expenseId } = req.params;
        const { category, description, amount, vendor, paid, date } = req.body;

        // Verify event belongs to user
        const eventCheck = await query(
            'SELECT user_id FROM events WHERE id = $1',
            [eventId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (eventCheck.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const result = await query(
            'UPDATE expenses SET category = $1, description = $2, amount = $3, vendor = $4, paid = $5, date = $6, updated_at = NOW() WHERE id = $7 AND event_id = $8 RETURNING *',
            [category, description, amount, vendor, paid, date, expenseId, eventId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update expense error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete expense
app.delete('/api/events/:eventId/expenses/:expenseId', authMiddleware, async (req, res) => {
    try {
        const { eventId, expenseId } = req.params;

        // Verify event belongs to user
        const eventCheck = await query(
            'SELECT user_id FROM events WHERE id = $1',
            [eventId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (eventCheck.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await query('DELETE FROM expenses WHERE id = $1 AND event_id = $2', [expenseId, eventId]);
        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get expense summary
app.get('/api/events/:eventId/expenses/summary', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;

        // Verify event belongs to user
        const eventCheck = await query(
            'SELECT user_id FROM events WHERE id = $1',
            [eventId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (eventCheck.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Get budget
        const budgetResult = await query(
            'SELECT * FROM budgets WHERE event_id = $1',
            [eventId]
        );

        // Get total expenses
        const expensesResult = await query(
            'SELECT SUM(amount) as total FROM expenses WHERE event_id = $1',
            [eventId]
        );

        // Get expenses by category
        const categoryResult = await query(
            'SELECT category, SUM(amount) as total FROM expenses WHERE event_id = $1 GROUP BY category',
            [eventId]
        );

        // Get guest count for cost per guest
        const guestResult = await query(
            'SELECT COUNT(*) as count FROM guests WHERE event_id = $1',
            [eventId]
        );

        const budget = budgetResult.rows[0];
        const totalSpent = parseFloat(expensesResult.rows[0]?.total || 0);
        const guestCount = parseInt(guestResult.rows[0]?.count || 0);

        const byCategory = {};
        categoryResult.rows.forEach(row => {
            byCategory[row.category] = parseFloat(row.total);
        });

        res.json({
            total_budget: budget?.total_budget || 0,
            currency: budget?.currency || 'USD',
            total_spent: totalSpent,
            remaining: (budget?.total_budget || 0) - totalSpent,
            by_category: byCategory,
            cost_per_guest: guestCount > 0 ? (totalSpent / guestCount).toFixed(2) : 0,
            guest_count: guestCount
        });
    } catch (error) {
        console.error('Get summary error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ========================================
// SMART REMINDERS ENDPOINTS
// ========================================

// Get all reminders for event
app.get('/api/events/:eventId/reminders', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;

        // Verify event belongs to user
        const eventCheck = await query(
            'SELECT user_id FROM events WHERE id = $1',
            [eventId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (eventCheck.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const result = await query(
            'SELECT * FROM reminders WHERE event_id = $1 ORDER BY send_at ASC',
            [eventId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get reminders error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create reminder
app.post('/api/events/:eventId/reminders', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;
        const { reminder_type, recipient_type, send_at, message } = req.body;

        // Verify event belongs to user
        const eventCheck = await query(
            'SELECT user_id FROM events WHERE id = $1',
            [eventId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (eventCheck.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const reminderId = uuidv4();
        const result = await query(
            'INSERT INTO reminders (id, event_id, reminder_type, recipient_type, send_at, message) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [reminderId, eventId, reminder_type, recipient_type, send_at, message]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create reminder error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update reminder
app.put('/api/events/:eventId/reminders/:reminderId', authMiddleware, async (req, res) => {
    try {
        const { eventId, reminderId } = req.params;
        const { reminder_type, recipient_type, send_at, message } = req.body;

        // Verify event belongs to user
        const eventCheck = await query(
            'SELECT user_id FROM events WHERE id = $1',
            [eventId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (eventCheck.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const result = await query(
            'UPDATE reminders SET reminder_type = $1, recipient_type = $2, send_at = $3, message = $4 WHERE id = $5 AND event_id = $6 RETURNING *',
            [reminder_type, recipient_type, send_at, message, reminderId, eventId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Reminder not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update reminder error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete reminder
app.delete('/api/events/:eventId/reminders/:reminderId', authMiddleware, async (req, res) => {
    try {
        const { eventId, reminderId } = req.params;

        // Verify event belongs to user
        const eventCheck = await query(
            'SELECT user_id FROM events WHERE id = $1',
            [eventId]
        );

        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (eventCheck.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await query('DELETE FROM reminders WHERE id = $1 AND event_id = $2', [reminderId, eventId]);
        res.json({ message: 'Reminder deleted successfully' });
    } catch (error) {
        console.error('Delete reminder error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Auto-schedule reminders for event
app.post('/api/events/:eventId/reminders/auto-schedule', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;

        // Get event with date
        const eventResult = await query(
            'SELECT * FROM events WHERE id = $1 AND user_id = $2',
            [eventId, req.user.id]
        );

        if (eventResult.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const event = eventResult.rows[0];
        if (!event.date) {
            return res.status(400).json({ error: 'Event must have a date to schedule reminders' });
        }

        const eventDate = new Date(event.date);
        const reminders = [];

        // RSVP Follow-up - 7 days before event
        const rsvpDate = new Date(eventDate);
        rsvpDate.setDate(rsvpDate.getDate() - 7);
        if (rsvpDate > new Date()) {
            reminders.push({
                id: uuidv4(),
                event_id: eventId,
                reminder_type: 'rsvp_followup',
                recipient_type: 'guests',
                send_at: rsvpDate,
                message: `Don't forget to RSVP for ${event.title}!`
            });
        }

        // Day Before Event - 24 hours before
        const dayBeforeDate = new Date(eventDate);
        dayBeforeDate.setDate(dayBeforeDate.getDate() - 1);
        if (dayBeforeDate > new Date()) {
            reminders.push({
                id: uuidv4(),
                event_id: eventId,
                reminder_type: 'event_tomorrow',
                recipient_type: 'guests',
                send_at: dayBeforeDate,
                message: `See you tomorrow at ${event.title}!`
            });
        }

        // Event Starting Soon - 2 hours before
        const twoHoursBefore = new Date(eventDate);
        twoHoursBefore.setHours(twoHoursBefore.getHours() - 2);
        if (twoHoursBefore > new Date()) {
            reminders.push({
                id: uuidv4(),
                event_id: eventId,
                reminder_type: 'event_starting',
                recipient_type: 'guests',
                send_at: twoHoursBefore,
                message: `${event.title} starts in 2 hours!`
            });
        }

        // Insert reminders
        for (const reminder of reminders) {
            await query(
                'INSERT INTO reminders (id, event_id, reminder_type, recipient_type, send_at, message) VALUES ($1, $2, $3, $4, $5, $6)',
                [reminder.id, reminder.event_id, reminder.reminder_type, reminder.recipient_type, reminder.send_at, reminder.message]
            );
        }

        res.json({ message: `${reminders.length} reminders scheduled`, reminders });
    } catch (error) {
        console.error('Auto-schedule error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Test endpoint to manually trigger reminder check
app.post('/api/admin/process-reminders', authMiddleware, async (req, res) => {
    try {
        const { processPendingReminders } = await import('./jobs/reminderCron.js');
        console.log('Manual reminder check triggered by user:', req.user.email);
        await processPendingReminders();
        res.json({ message: 'Reminder check completed. Check server logs for details.' });
    } catch (error) {
        console.error('Manual reminder check error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== COMMUNICATIONS ====================

// Event Social Wall Routes - using /api/wall prefix to avoid conflicts
app.use('/api/wall', eventWallRoutes);

// Send announcement to guests
app.post('/api/events/:eventId/communications/announcement', authMiddleware, sendAnnouncement);

// Send thank you messages to attended guests
app.post('/api/events/:eventId/communications/thank-you', authMiddleware, sendThankYouMessages);

// Get communication history
app.get('/api/events/:eventId/communications', authMiddleware, getCommunications);

// Initialize database and start server
const PORT = process.env.PORT || 3001;

initializeDatabase()
    .then(() => {
        // Initialize Twilio
        initTwilio();

        // Start reminder cron job
        startReminderCron();

        app.listen(PORT, () => {
            console.log(`✓ Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    });

