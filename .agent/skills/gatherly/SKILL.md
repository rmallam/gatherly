---
name: Gatherly App Protocol & Architecture
description: Comprehensive overview of the Gatherly (HostEze) web and mobile application, including architecture, core features, workflows, and tech stack guidelines for future refinements.
---

# Gatherly (HostEze) Application Overview

This skill document defines the functional and technical blueprint of the **Gatherly (brand name: HostEze)** application. It is meant to provide deep context to developers and AI agents working on refinements, bug fixes, or feature additions for this specific repository.

## 1. Application Purpose & Core Value
Gatherly is a comprehensive **Event Management Platform** designed to simplify the planning and execution of events (weddings, parties, corporate meetups). It provides a centralized dashboard for hosts to handle guest lists, budgeting, tasks, catering, decorations, scheduling, and direct communications, utilizing AI-assisted features for reducing cognitive load.

## 2. Technical Stack
The project is maintained as a monorepo containing both a frontend React/Capacitor application and a backend Node.js API service.

### Frontend (`/frontend`)
- **Core:** React 18, Vite.
- **Routing:** React Router DOM (v6).
- **Mobile Capabilities:** Capacitor v8 (supports iOS, Android cross-platform packaging). Integrates specialized plugins:
  - `@capacitor-community/contacts` (Device contacts import)
  - `@capgo/capacitor-native-biometric` (Biometric authentication)
  - `@capacitor/camera` (QR Scanning, image uploads)
  - `@revenuecat/purchases-capacitor` (In-App Purchases / Pro status)
- **UI/UX:** Uses `lucide-react` for icons, `recharts` for charts, and specific modern, flat UI styling across CSS files within `src/pages` and `src/components`.

### Backend (`/backend`)
- **Core:** Node.js (v18+ expected), Express.js.
- **Database:** PostgreSQL (with `pg` driver), migrations, `pg-mem` for testing. Database schema encompasses users, events, guests, expenses, tasks, contacts, unverified guests, schedules.
- **AI Integrations:** `@google/generative-ai` (Gemini API interactions for AI budgeting, menus, finance).
- **Communication Pipelines:** 
  - `@onesignal/node-onesignal` (Push notifications).
  - `twilio` (SMS interactions & OTP).
  - `resend` and `nodemailer` (Email services).
- **Authentication:** JWT tokens (`jsonwebtoken`) and `bcrypt` for password hashing.
- **Media:** Cloudinary for image and file uploads.
- **Scheduling:** `node-cron` for running background jobs and event reminders.

## 3. Core Features & Navigation Workflows
When working on the application, note the following established tabs and features available to an authenticated user:

- **Authentication Module:** Supports Email/Password login, OTP/Phone login, and biometric pass-throughs.
- **Home Dashboard:** Displays 'Upcoming Events' and 'Past Events', plus platform navigation (Home, Scanner, Contacts, Notifications).
- **Event-Specific Dashboard:**
  - **Overview:** High-level metrics (RSVPs, Total Expected, Budget limit alerts).
  - **Guests:** Add guests manually or via imports. Send digital invitations via WhatsApp, SMS, or shareable links. Issue QR codes.
  - **Budget:** Tracks standard expenses. Uses an **AI Smart Budget Optimizer**.
  - **Catering, Decorations, Gifts, Entertainment, Vendor Tabs:** Specialized logistics views for the event. Note the use of **AI Menu/Decor Ideas** driven by Gemini.
  - **Tasks:** Kanban/Checklist tracking (To-Do, In Progress, Complete).
  - **Social Walls & Gallery:** Event-specific content feeds.
- **Expense Splitting & Shared Events:**
  - **Shared Event Type:** Events can be explicitly created as `eventType: 'shared'`, designed for trips and outings.
  - **Splitting Logic:** The `AddExpenseModal` supports `equal` or `custom` split calculations across group members.
  - **Participant Tracking:** Split participants can be either registered platform users (using `userId`) or unregistered contacts (using `name, email, phone`).
  - **Balances & Settlements:** The `BalanceSummary` component calculates and visualizes "who owes whom" to help settle shared debts among friends.
- **Scanner:** Dedicated QR Code scanner utility. Used by hosts or delegates at event entry points. Checks in guests directly from the `Scanner.jsx` and triggers backend updates.
- **Admin Dashboard:** Specific to 'Pro' or administrative users. Tracks total site-wide metrics (Total Users, Events created) and user role modifications.

## 4. Development Workflow & Guidelines
To make refinements or add features, follow these rules:
1. **Frontend Styling:** Maintain the vibrant and modern styling present. Do not default back to raw HTML elements. Review existing components inside `frontend/src/components` before creating duplicative features. Ensure Capacitor functionality remains intact if adding native features.
2. **Backend API Changes:** Add routes inside `backend/routes/` and business logic inside `backend/controllers/`.
3. **AI Module Integrations:** AI features should route through `backend/services/geminiService.js`. Look for existing patterns when prompting standard outputs (JSON formatting required in prompts).
4. **Notifications/Scheduled Tasks:** Changes to reminders and pushes must account for `node-cron` inside the backend `services/` folder.
5. **Database Updates:** If creating new data models, write direct SQL scripts mapping back to the established PostgreSQL infrastructure.
---
