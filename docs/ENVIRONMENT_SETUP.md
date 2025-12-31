# Environment Management Guide

## 📁 Environment Files

- `.env.development` - Local development (npm run dev)
- `.env.staging` - Staging/testing environment
- `.env.production` - Production environment (npm run build)

## 🚀 How to Use

### 1. Local Development
```bash
cd frontend
npm run dev
# Uses .env.development
# Points to: http://localhost:3001
```

### 2. Build for Staging
```bash
cd frontend
npm run build -- --mode staging
npx cap sync android
# Uses .env.staging
# Points to: staging backend URL
```

### 3. Build for Production
```bash
cd frontend
npm run build
npx cap sync android
# Uses .env.production
# Points to: https://gatherly-backend-3vmv.onrender.com
```

## 🔧 Switching Environments

### Quick Switch for Testing:
Edit `frontend/.env.development` and change the URL:

**Test with local backend:**
```
VITE_API_URL=http://localhost:3001
```

**Test with production backend:**
```
VITE_API_URL=https://gatherly-backend-3vmv.onrender.com
```

Then restart: `npm run dev`

## 📱 Android Build Environments

### Development Build (Debug)
```bash
npm run build -- --mode development
npx cap sync android
# Open Android Studio and run
```

### Staging Build
```bash
npm run build -- --mode staging
npx cap sync android
# Open Android Studio and run
```

### Production Build (Release)
```bash
npm run build
npx cap sync android
cd android
./gradlew assembleRelease
```

## 🎯 Best Practices

1. **Never commit `.env` files** (already in .gitignore)
2. **Use `.env.example`** as template for team members
3. **Local dev**: Use local backend when possible
4. **Testing**: Use staging environment
5. **Production**: Only deploy tested code

## 🔍 Check Current Environment

In your app code, you can check:
```javascript
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Mode:', import.meta.env.MODE);
```

## 🌐 Backend Environments

### Local Backend
```bash
cd backend
npm start
# Runs on http://localhost:3001
```

### Production Backend
- URL: https://gatherly-backend-3vmv.onrender.com
- Auto-deploys from main branch
- Database: Production PostgreSQL

### Staging Backend (Optional)
Create a separate Render service:
1. Fork backend to staging branch
2. Create new Render service
3. Point to staging branch
4. Use separate database

## 📊 Environment Variables Reference

### Frontend (.env files)
- `VITE_API_URL` - Backend API endpoint

### Backend (Render environment variables)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing key
- `TWILIO_*` - Twilio credentials
- `EMAIL_*` - Email service credentials

## 🔄 Workflow Example

### Feature Development:
```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Develop locally
cd frontend
npm run dev  # Uses .env.development

# 3. Test with local backend
cd backend
npm start

# 4. Build and test on device
cd frontend
npm run build -- --mode staging
npx cap sync android

# 5. Merge to main for production
git checkout main
git merge feature/my-feature
git push origin main
```

## 🎨 Current Setup

**Development:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Database: Local PostgreSQL (if running)

**Production:**
- Frontend: Android APK
- Backend: https://gatherly-backend-3vmv.onrender.com
- Database: Render PostgreSQL

## 💡 Tips

1. **Quick backend switch**: Just edit `.env.development`
2. **Test production API locally**: Set `VITE_API_URL` to production URL
3. **Debug API calls**: Check Network tab in browser DevTools
4. **Environment issues**: Clear browser cache and rebuild
