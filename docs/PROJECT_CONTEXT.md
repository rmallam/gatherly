# HostEze - Project Context

## What is HostEze?

**HostEze** (formerly Guest Scanner) is a mobile event management application built with React + Capacitor for Android. It helps event organizers manage guests, send invitations, track RSVPs, and handle check-ins via QR codes.

## Core Functionality

### For Event Organizers:
- Create and manage events
- Add guests (manually, from contacts, or import groups)
- Send invitations
- Track RSVPs
- QR code-based check-in
- Event wall for photos/posts
- Budget tracking
- Task management
- Push notifications

### For Guests:
- View event invitations
- RSVP to events
- Get QR code for check-in
- Access event wall
- Receive event updates

## Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Mobile**: Capacitor 8 (Android)
- **UI**: Custom CSS with dark mode support
- **State**: React Context API
- **Routing**: React Router v6
- **QR Codes**: qrcode.react
- **Testing**: Vitest

### Backend
- **Runtime**: Node.js with Express
- **Database**: PostgreSQL (Render hosted)
- **Auth**: JWT tokens + bcrypt
- **Push Notifications**: OneSignal
- **Email**: Nodemailer

### Infrastructure
- **Backend Hosting**: Render.com
- **Database**: Render PostgreSQL
- **Frontend Build**: Capacitor Android APK
- **CI/CD**: GitHub Actions (currently disabled)

## Key Architecture Patterns

### Phone Number Handling
**CRITICAL**: Phone numbers exist in multiple formats due to migration:
- **Old format**: `9100656947` (10 digits, no country code)
- **New format**: `+919100656947` (with country code)

**Always use flexible matching** when comparing phones:
```javascript
// Backend (PostgreSQL)
RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 10)

// Frontend (JavaScript)
phone.replace(/\D/g, '').slice(-10)
```

**Locations using phone matching:**
1. Login query (`/api/auth/login`)
2. Signup auto-linking (`/api/auth/signup`)
3. Guest addition (`/api/events/:id/guests`)
4. Bulk guest import (`/api/events/:id/guests/bulk`)
5. Frontend guest matching (`GuestEventView.jsx`)

### User-Guest Linking
Guests are linked to users via `user_id` in the `guests` table:
- Auto-linked during signup (if guest record exists)
- Auto-linked when adding guests (if user exists)
- Used to show events in guest view
- Required for RSVP and QR code display

### Authentication Flow
1. User signs up with email OR phone + password
2. Email verification sent (can be skipped with env var)
3. Login with email/phone + password
4. JWT token stored in localStorage
5. Token sent in Authorization header
6. Biometric auth available (optional)

## Database Schema (Key Tables)

### users
- `id` (UUID, primary key)
- `name`, `email`, `phone`, `password`
- `email_verified`, `verification_token`
- `created_at`

### events
- `id` (UUID, primary key)
- `user_id` (organizer)
- `title`, `description`, `date`, `location`
- `created_at`

### guests
- `id` (UUID, primary key)
- `event_id`, `user_id` (nullable)
- `name`, `email`, `phone`
- `rsvp` (boolean, nullable)
- `attended` (boolean)
- `contact_id` (link to user_contacts)

### user_contacts
- `id` (UUID, primary key)
- `user_id`
- `name`, `email`, `phone`
- Stores user's contact list

## Common Issues & Solutions

### Phone Format Mismatch
**Symptom**: Login fails, guests not linked, RSVP/QR not showing
**Cause**: Exact phone matching instead of flexible matching
**Fix**: Use last 10 digits comparison everywhere

### Guest Not Seeing Events
**Symptom**: Guest can't see events they're invited to
**Cause**: `user_id` not set in guests table
**Fix**: Ensure auto-linking works in signup and guest addition

### RSVP/QR Not Showing
**Symptom**: Guest sees event but no RSVP buttons or QR code
**Cause**: Frontend can't match current user to guest record
**Fix**: Use flexible phone matching in `GuestEventView.jsx`

## File Structure

```
guest-scanner/
├── frontend/
│   ├── src/
│   │   ├── pages/           # Main views
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React Context (Auth, App)
│   │   ├── services/        # API calls, biometric, push
│   │   └── utils/           # Utilities
│   ├── android/             # Capacitor Android project
│   └── public/              # Static assets
├── backend/
│   ├── server.js            # Main Express server
│   ├── db.js                # Database connection
│   └── public/              # Static files
├── docs/                    # Documentation
└── images/                  # Image assets
```

## Important Files

### Frontend
- `src/context/AuthContext.jsx` - Authentication logic
- `src/context/AppContext.jsx` - App state, API calls
- `src/pages/GuestEventView.jsx` - Guest event details
- `src/pages/ManagerDashboard.jsx` - Main dashboard
- `src/pages/Login.jsx` - Login page
- `src/pages/Signup.jsx` - Signup page

### Backend
- `server.js` - All API endpoints (single file)
- `db.js` - PostgreSQL connection

## Environment Variables

### Frontend (.env.production)
```
VITE_API_URL=https://gatherly-backend-3vmv.onrender.com/api
VITE_ONESIGNAL_APP_ID=<onesignal-app-id>
```

### Backend
```
DATABASE_URL=<postgresql-connection-string>
JWT_SECRET=<secret>
ONESIGNAL_APP_ID=<app-id>
ONESIGNAL_REST_API_KEY=<api-key>
EMAIL_USER=<email>
EMAIL_PASS=<password>
SKIP_EMAIL_VERIFICATION=true
```

## Build & Deploy

### Frontend
```bash
cd frontend
npm run build              # Build for production
npx cap sync android       # Sync with Capacitor
cd android
./gradlew assembleDebug    # Build APK
```

### Backend
- Auto-deploys from GitHub main branch to Render
- Database migrations run manually via Render shell

## Testing

### Unit Tests
```bash
cd frontend
npm test                   # Run once
npm run test:watch         # Watch mode
```

### E2E Tests (Maestro)
```bash
maestro test .maestro/
```

## Contact & Support
- **Email**: reach.hosteze@gmail.com
- **Repository**: https://github.com/rmallam/gatherly
- **Backend**: https://gatherly-backend-3vmv.onrender.com

## Version History
- **v1.5.0** (Current) - Country code support, phone matching fixes
- **v1.4.0** - Dark theme, biometric auth
- **v1.3.0** - Event wall, push notifications
- **v1.2.0** - Contact import, group selection
- **v1.1.0** - Budget tracker, reminders
- **v1.0.0** - Initial release

---

**Last Updated**: 2025-12-29
**Maintained By**: Rakesh Kumar Mallam
