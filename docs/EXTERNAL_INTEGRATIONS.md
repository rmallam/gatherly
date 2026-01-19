# External Integrations Guide

This document lists all third-party services integrated into the HostEze application, their purpose, configuration requirements, and management console locations.

---

## 1. Hosting & Database

### **Render.com**
- **Purpose**: Hosts the Node.js backend API and the PostgreSQL database.
- **Console URL**: [https://dashboard.render.com/](https://dashboard.render.com/)
- **Configuration (Backend Environment Variables)**:
  - `DATABASE_URL`: Connection string for the PostgreSQL database.
  - `NODE_ENV`: Set to `production`.

---

## 2. Authentication & Push Notifications

### **OneSignal**
- **Purpose**: Sends push notifications to mobile devices (Event reminders, New posts, etc.).
- **Console URL**: [https://dashboard.onesignal.com/](https://dashboard.onesignal.com/)
- **Configuration**:
  - **Frontend (`.env.production` / `.env.development`)**:
    - `VITE_ONESIGNAL_APP_ID`: The unique App ID for the OneSignal project.
  - **Backend (`.env`)**:
    - `ONESIGNAL_APP_ID`: Same App ID as frontend.
    - `ONESIGNAL_REST_API_KEY`: Secret key for sending notifications from the server.

---

## 3. Communication (SMS)

### **Twilio**
- **Purpose**: Sends SMS messages for OTP login, guest announcements, and reminders.
- **Console URL**: [https://console.twilio.com/](https://console.twilio.com/)
- **Configuration (Backend Environment Variables)**:
  - `TWILIO_ACCOUNT_SID`: Account identifier.
  - `TWILIO_AUTH_TOKEN`: Secret authentication token.
  - `TWILIO_PHONE_NUMBER`: The Twilio phone number used to send messages.

---

## 4. Email Services

The application supports two email providers. You can configure either one.

### **Resend (Primary)**
- **Purpose**: Transactional emails (Email Verification, Password Reset).
- **Console URL**: [https://resend.com/domains](https://resend.com/domains)
- **Configuration (Backend Environment Variables)**:
  - `RESEND_API_KEY`: API Key for sending emails.
  - `FROM_EMAIL`: Verified sender address (e.g., `onboarding@resend.dev` or your custom domain email).

### **Gmail SMTP (Fallback)**
- **Purpose**: Alternative for sending emails if Resend is not used.
- **Console URL**: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
- **Configuration (Backend Environment Variables)**:
  - `GMAIL_USER`: Your Gmail address.
  - `GMAIL_APP_PASSWORD`: App-specific password (NOT your login password).

---

## 5. In-App Purchases (Monetization)

### **RevenueCat**
- **Purpose**: Manages subscriptions (Pro Tier) and consumable purchases (SMS Credits) across iOS and Android.
- **Console URL**: [https://app.revenuecat.com/](https://app.revenuecat.com/)
- **Configuration (Frontend Environment Variables)**:
  - `VITE_REVENUECAT_IOS_KEY`: Public API key for iOS app.
  - `VITE_REVENUECAT_ANDROID_KEY`: Public API key for Android app.
- **Notes**: Configure "Offerings" and "Entitlements" in the RevenueCat dashboard to match the app's logic (e.g., `pro` entitlement).

---

## 6. AI & Intelligence

### **Google Gemini**
- **Purpose**: Powers AI features like Budget Optimization, Menu Planning, and Decor Ideas.
- **Console URL**: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
- **Configuration (Backend Environment Variables)**:
  - `GEMINI_API_KEY`: API Key for accessing Gemini Pro models.

---

## 7. Media Storage

### **Cloudinary**
- **Purpose**: Stores and optimizes user uploaded images (Profile pictures, Event Wall photos).
- **Console URL**: [https://console.cloudinary.com/](https://console.cloudinary.com/)
- **Configuration (Backend Environment Variables)**:
  - `CLOUDINARY_CLOUD_NAME`: Your cloud name.
  - `CLOUDINARY_API_KEY`: Public API key.
  - `CLOUDINARY_API_SECRET`: Secret API key.

---

## Summary of Environment Variables

### **Frontend (`frontend/.env`)**
```env
VITE_API_URL=https://events.hosteze.app/api
VITE_ONESIGNAL_APP_ID=your_onesignal_app_id
VITE_REVENUECAT_IOS_KEY=your_rc_ios_key
VITE_REVENUECAT_ANDROID_KEY=your_rc_android_key
```

### **Backend (`backend/.env`)**
```env
# Server
PORT=3001
NODE_ENV=production
DATABASE_URL=postgres://...

# Auth
JWT_SECRET=your_jwt_secret

# Push Notifications
ONESIGNAL_APP_ID=your_onesignal_app_id
ONESIGNAL_REST_API_KEY=your_onesignal_rest_key

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_number

# Email (Resend)
RESEND_API_KEY=your_resend_key
FROM_EMAIL=onboarding@resend.dev

# AI (Google)
GEMINI_API_KEY=your_gemini_key

# Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
