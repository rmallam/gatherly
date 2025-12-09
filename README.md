# Gatherly - Event Management Platform

A comprehensive event planning platform with separated backend and frontend for easy deployment.

## Project Structure

```
gatherly/
├── backend/              # Node.js + Express API
│   ├── server.js
│   ├── server/
│   │   └── auth.js
│   ├── package.json
│   └── db.json
│
├── frontend/             # React + Capacitor App  
│   ├── src/
│   ├── public/
│   ├── android/
│   ├── ios/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## Quick Start

### Backend Setup

```bash
cd backend
npm install
npm start
```

Server runs on `http://localhost:3001`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:5173`

## Deployment

### Deploy Backend to Render

1. **Push to GitHub**
2. **Create Web Service** on Render.com
3. **Root Directory**: `backend`
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`

See [Render Deployment Guide](docs/render_deployment_guide.md) for details.

### Build Android APK

```bash
cd frontend
npm run build
npx cap sync android
npx cap open android
```

Build APK in Android Studio.

### Deploy Frontend to Vercel/Netlify (Optional)

```bash
cd frontend
npm run build
# Deploy dist/ folder
```

## Environment Variables

### Backend (.env)

```
PORT=3001
NODE_ENV=production
JWT_SECRET=your-secret-key
FRONTEND_URL=https://your-frontend.com
```

### Frontend

Update API URL in `frontend/src/context/AppContext.jsx`:

```javascript
const API_URL = 'https://your-backend.onrender.com/api';
```

## Features

- 📋 Event Management
- 👥 Guest Management with QR Check-in
- 📞 Contact Library
- 💌 Public Invitations
- 💰 Budget Tracking
- ✅ Task Management
- 🍽️ Catering Planning
- 🎨 Decorations
- 🎁 Gifts & Favors
- 🎵 Entertainment
- 📍 Venue Management
- 👔 Vendors Directory

## Development

**Backend** - Node.js + Express
- `npm start` - Production mode
- `npm run dev` - Development with auto-reload

**Frontend** - React + Vite
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview production build

## API Endpoints

See backend README for complete API documentation.

## License

MIT

---

Built with ❤️ using React and Node.js
