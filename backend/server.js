import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { generateToken, hashPassword, comparePassword, authMiddleware } from './server/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_FILE = join(__dirname, 'db.json');

const app = express();

// CORS Configuration for production
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost'
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all for now, restrict in production
        }
    },
    credentials: true
}));

app.use(bodyParser.json());

// Initialize DB
const initDb = async () => {
    try {
        await fs.access(DB_FILE);
    } catch {
        await fs.writeFile(DB_FILE, JSON.stringify({ events: [], users: [], contacts: [] }));
    }
};

const readDb = async () => {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data);
};

const writeDb = async (data) => {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
};

// === HEALTH CHECK ENDPOINT ===
// Simple health check for keep-alive pings
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authentication Routes
app.post('/api/auth/signup', async (req, res) => {
    try {
        console.log('Signup request received:', { name: req.body.name, email: req.body.email });
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email and password are required' });
        }

        const db = await readDb();

        // Check if user already exists
        const existingUser = db.users?.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        console.log('Hashing password...');
        // Hash password
        const hashedPassword = hashPassword(password);
        console.log('Password hashed successfully');

        // Create user
        const newUser = {
            id: uuidv4(),
            name,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        if (!db.users) db.users = [];
        db.users.push(newUser);
        await writeDb(db);
        console.log('User saved to database');

        // Generate token
        const token = generateToken(newUser);
        console.log('Token generated successfully');

        res.json({
            token,
            user: { id: newUser.id, name: newUser.name, email: newUser.email }
        });
    } catch (error) {
        console.error('Signup error details:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const db = await readDb();
        const user = db.users?.find(u => u.email === email);

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Compare password
        const isValid = comparePassword(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate token
        const token = generateToken(user);

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
    res.json({ user: req.user });
});

// API Routes (Protected)
app.get('/api/events', authMiddleware, async (req, res) => {
    const db = await readDb();
    // Filter events by user
    const userEvents = db.events.filter(e => e.userId === req.user.id);
    res.json(userEvents);
});

app.post('/api/events', authMiddleware, async (req, res) => {
    const db = await readDb();
    const newEvent = {
        ...req.body,
        userId: req.user.id // Associate event with user
    };
    db.events.unshift(newEvent); // Add to top
    await writeDb(db);
    res.json(newEvent);
});

app.delete('/api/events/:id', async (req, res) => {
    const db = await readDb();
    db.events = db.events.filter(e => e.id !== req.params.id);
    await writeDb(db);
    res.json({ success: true });
});

app.post('/api/events/:id/guests', async (req, res) => {
    const db = await readDb();
    const event = db.events.find(e => e.id === req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    event.guests.push(req.body);
    await writeDb(db);
    res.json(db.events);
});

app.post('/api/events/:eventId/guests/:guestId/checkin', async (req, res) => {
    const { eventId, guestId } = req.params;
    const { count } = req.body;

    const db = await readDb();
    const event = db.events.find(e => e.id === eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const guest = event.guests.find(g => g.id === guestId);
    if (!guest) return res.status(404).json({ error: 'Guest not found' });

    guest.attended = true;
    guest.attendedCount = (guest.attendedCount || 0) + count;
    guest.checkInTime = new Date().toISOString();

    await writeDb(db);
    res.json(db.events);
});

// RSVP endpoint
app.post('/api/events/:eventId/guests/:guestId/rsvp', async (req, res) => {
    const { eventId, guestId } = req.params;
    const { response } = req.body;

    const db = await readDb();
    const event = db.events.find(e => e.id === eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const guest = event.guests.find(g => g.id === guestId);
    if (!guest) return res.status(404).json({ error: 'Guest not found' });

    guest.rsvp = response;
    guest.rsvpTime = new Date().toISOString();

    await writeDb(db);
    res.json({ success: true, guest });
});

// Update event endpoint
app.put('/api/events/:id', authMiddleware, async (req, res) => {
    const db = await readDb();
    const eventIndex = db.events.findIndex(e => e.id === req.params.id && e.userId === req.user.id);

    if (eventIndex === -1) {
        return res.status(404).json({ error: 'Event not found' });
    }

    db.events[eventIndex] = { ...db.events[eventIndex], ...req.body };
    await writeDb(db);
    res.json(db.events[eventIndex]);
});

// ============================================
// CONTACT LIBRARY ROUTES
// ============================================

// Get all contacts for a user
app.get('/api/contacts', authMiddleware, async (req, res) => {
    const db = await readDb();
    if (!db.contacts) db.contacts = [];

    const userContacts = db.contacts.filter(c => c.userId === req.user.id);
    res.json(userContacts);
});

// Add new contact
app.post('/api/contacts', authMiddleware, async (req, res) => {
    const { name, phone, email, notes } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    const newContact = {
        id: uuidv4(),
        userId: req.user.id,
        name,
        phone: phone || '',
        email: email || '',
        notes: notes || '',
        addedAt: new Date().toISOString(),
        usedInEvents: []
    };

    const db = await readDb();
    if (!db.contacts) db.contacts = [];
    db.contacts.push(newContact);
    await writeDb(db);

    res.json(newContact);
});

// Update contact
app.put('/api/contacts/:id', authMiddleware, async (req, res) => {
    const db = await readDb();
    if (!db.contacts) db.contacts = [];

    const contactIndex = db.contacts.findIndex(c => c.id === req.params.id && c.userId === req.user.id);

    if (contactIndex === -1) {
        return res.status(404).json({ error: 'Contact not found' });
    }

    db.contacts[contactIndex] = {
        ...db.contacts[contactIndex],
        ...req.body,
        userId: req.user.id, // Ensure userId can't be changed
        id: req.params.id // Ensure id can't be changed
    };

    await writeDb(db);
    res.json(db.contacts[contactIndex]);
});

// Delete contact
app.delete('/api/contacts/:id', authMiddleware, async (req, res) => {
    const db = await readDb();
    if (!db.contacts) db.contacts = [];

    const initialLength = db.contacts.length;
    db.contacts = db.contacts.filter(c => !(c.id === req.params.id && c.userId === req.user.id));

    if (db.contacts.length === initialLength) {
        return res.status(404).json({ error: 'Contact not found' });
    }

    await writeDb(db);
    res.json({ success: true });
});

// ============================================
// PUBLIC INVITATION ROUTES (No Auth Required)
// ============================================

// Get public event details for invitation page
app.get('/api/public/events/:id', async (req, res) => {
    const db = await readDb();
    const event = db.events.find(e => e.id === req.params.id);

    if (!event) {
        return res.status(404).json({ error: 'Event not found' });
    }

    // Return only public-safe data
    const publicEvent = {
        id: event.id,
        title: event.title,
        venue: event.venue,
        date: event.date,
        time: event.time,
        description: event.description
    };

    res.json(publicEvent);
});

// Submit RSVP from public invitation page
app.post('/api/public/events/:id/rsvp', async (req, res) => {
    const { name, phone, email, response, plusOnes, dietaryRestrictions } = req.body;

    if (!name || !response) {
        return res.status(400).json({ error: 'Name and response are required' });
    }

    const db = await readDb();
    const event = db.events.find(e => e.id === req.params.id);

    if (!event) {
        return res.status(404).json({ error: 'Event not found' });
    }

    // Check if guest already exists by phone or email
    let guest = event.guests.find(g =>
        (phone && g.phone === phone) || (email && g.email === email)
    );

    if (guest) {
        // Update existing guest
        guest.rsvp = response === 'yes' ? true : response === 'no' ? false : null;
        guest.rsvpTime = new Date().toISOString();
        guest.plusOnes = plusOnes || 0;
        guest.dietaryRestrictions = dietaryRestrictions || '';
    } else {
        // Create new guest
        const newGuest = {
            id: uuidv4(),
            name,
            phone: phone || '',
            email: email || '',
            rsvp: response === 'yes' ? true : response === 'no' ? false : null,
            rsvpTime: new Date().toISOString(),
            plusOnes: plusOnes || 0,
            dietaryRestrictions: dietaryRestrictions || '',
            addedAt: new Date().toISOString(),
            attended: false,
            attendedCount: 0,
            source: 'public_invitation'
        };
        event.guests.push(newGuest);
    }

    await writeDb(db);
    res.json({ success: true, message: 'RSVP submitted successfully' });
});

const PORT = 3001;

initDb().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
});
