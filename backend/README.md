# Gatherly Backend API

Node.js + Express REST API for Gatherly event management platform.

## Setup

```bash
npm install
npm start
```

Server runs on port 3001 (or `PORT` environment variable).

## Environment Variables

Create `.env` file:

```
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:5173
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login

### Events
- `GET /api/events` - Get all events (auth required)
- `POST /api/events` - Create event (auth required)
- `PUT /api/events/:id` - Update event (auth required)
- `DELETE /api/events/:id` - Delete event (auth required)

### Guests
- `POST /api/events/:id/guests` - Add guest
- `POST /api/events/:eventId/guests/:guestId/checkin` - Check-in
- `POST /api/events/:eventId/guests/:guestId/rsvp` - RSVP

### Contacts
- `GET /api/contacts` - Get contacts (auth required)
- `POST /api/contacts` - Add contact (auth required)
- `PUT /api/contacts/:id` - Update contact (auth required)
- `DELETE /api/contacts/:id` - Delete contact (auth required)

### Public
- `GET /api/public/events/:id` - Get event details (no auth)

## Deployment

### Render.com

1. Push to GitHub
2. Create Web Service
3. **Root Directory**: `backend`
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. Add environment variables

## Database

Uses JSON file (`db.json`) for simplicity.

**Schema:**
```json
{
  "users": [],
  "events": [],
  "contacts": []
}
```

## Tech Stack

- Express 4.x
- bcrypt (password hashing)
- jsonwebtoken (JWT auth)
- uuid (ID generation)
- CORS enabled
