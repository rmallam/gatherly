import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import { generateToken, hashPassword, comparePassword, authMiddleware } from './server/auth.js';
import { initializeDatabase, query } from './db/connection.js';

const app = express();

// Trust proxy - Required for Render.com and rate limiting
app.set('trust proxy', 1);

// Security Headers - Helmet.js
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
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
    max: 100,
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
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email and password are required' });
        }

        // Check if user exists
        const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const hashedPassword = hashPassword(password);
        const userId = uuidv4();

        await query(
            'INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4)',
            [userId, name, email, hashedPassword]
        );

        const user = { id: userId, name, email };
        const token = generateToken(user);

        res.json({ token, user });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const result = await query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];
        const isValid = comparePassword(password, user.password);

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = generateToken(user);
        const userResponse = { id: user.id, name: user.name, email: user.email };

        res.json({ token, user: userResponse });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
    res.json({ user: req.user });
});

// === EVENT ROUTES ===
app.get('/api/events', authMiddleware, async (req, res) => {
    try {
        const result = await query(
            `SELECT e.*, 
             (SELECT json_agg(g.*) FROM guests g WHERE g.event_id = e.id) as guests
             FROM events e 
             WHERE e.user_id = $1 
             ORDER BY e.created_at DESC`,
            [req.user.id]
        );

        const events = result.rows.map(event => ({
            ...event,
            guests: event.guests || []
        }));

        res.json(events);
    } catch (error) {
        console.error('Fetch events error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/events', authMiddleware, async (req, res) => {
    try {
        const { title, date, location, description } = req.body;
        const eventId = uuidv4();

        await query(
            'INSERT INTO events (id, user_id, title, date, location, description) VALUES ($1, $2, $3, $4, $5, $6)',
            [eventId, req.user.id, title, date, location, description]
        );

        const event = {
            id: eventId,
            user_id: req.user.id,
            title,
            date,
            location,
            description,
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
        const { title, date, location, description } = req.body;

        await query(
            'UPDATE events SET title = $1, date = $2, location = $3, description = $4 WHERE id = $5 AND user_id = $6',
            [title, date, location, description, req.params.id, req.user.id]
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

        await query(
            'INSERT INTO guests (id, event_id, name, email, phone) VALUES ($1, $2, $3, $4, $5)',
            [guestId, req.params.eventId, name, email || null, phone || null]
        );

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
        for (const guest of guests) {
            const guestId = uuidv4();
            await query(
                'INSERT INTO guests (id, event_id, name, email, phone) VALUES ($1, $2, $3, $4, $5)',
                [guestId, req.params.eventId, guest.name, guest.email || null, guest.phone || null]
            );
            addedGuests.push({ id: guestId, ...guest, rsvp: null, attended: false, attended_count: 0 });
        }

        res.json(addedGuests);
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

// Initialize database and start server
const PORT = process.env.PORT || 3001;

initializeDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`✓ Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    });
