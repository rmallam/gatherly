# Gatherly Frontend

React + Vite web application and mobile app (Capacitor) for event management.

## Setup

```bash
npm install
npm run dev
```

App runs on `http://localhost:5173`

## Configuration

### API URL

Edit `src/context/AppContext.jsx`:

```javascript
// Development (local backend)
const API_URL = '/api';

// Production (hosted backend)
const API_URL = 'https://your-backend.onrender.com/api';
```

### Vite Proxy

For development, `vite.config.js` proxies `/api` to `http://localhost:3001`.

## Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Mobile App

### Android

```bash
npm run build
npx cap sync android
npx cap open android
```

Build APK in Android Studio.

### iOS

```bash
npm run build
npx cap sync ios
npx cap open ios
```

Build in Xcode.

## Deployment

### Vercel/Netlify

1. Build: `npm run build`
2. Deploy `dist/` folder
3. Set environment variable: `VITE_API_URL=https://your-backend.com`

### As APK Only

Build production bundle and use Capacitor for Android/iOS apps. Backend deployed separately to Render.

## Tech Stack

- React 18
- React Router 6
- Vite 5
- Capacitor 8
- Lucide Icons
- QR Code libraries

## Features

- Event management dashboard
- Guest list with QR check-in
- Contact library
- Public invitation pages
- Budget tracking
- Task management
- 7 additional planning tabs

## Environment

No environment variables needed for development. For production, optionally set `VITE_API_URL` to override default API endpoint.
