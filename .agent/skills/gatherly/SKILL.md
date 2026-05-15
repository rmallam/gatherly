---
name: Gatherly (HostEze) App Architecture & AI Ecosystem
description: Comprehensive technical blueprint of the HostEze platform, detailing its React/Capacitor/Node monorepo architecture, Pro-Tier monetization, responsive UI patterns, Gemini AI integrations, and automated deployment workflows.
---

# Gatherly (HostEze) Application Overview

This skill document defines the functional and technical blueprint of the **Gatherly (brand name: HostEze)** application. It provides deep context to developers and AI agents working on refinements, bug fixes, or feature additions for this specific repository.

## 1. Application Purpose & Core Value
Gatherly is a comprehensive **Event Management Platform** designed to simplify the planning and execution of events (weddings, parties, corporate meetups). It provides a centralized dashboard for hosts to handle guest lists, budgeting, tasks, catering, decorations, scheduling, and direct communications, heavily utilizing Gemini AI-assisted features for reducing cognitive load and predicting user needs.

## 2. Technical Stack
The project is maintained as a monorepo containing both a frontend React/Capacitor application and a backend Node.js API service.

### Frontend (`/frontend`)
- **Core:** React 18, Vite.
- **Routing:** React Router DOM (v6).
- **Mobile Capabilities:** Capacitor v8 (supports iOS, Android cross-platform packaging). Integrates specialized plugins:
  - `@capacitor-community/contacts` (Device contacts import)
  - `@capacitor/camera` (QR Scanning, receipt uploads)
  - `@capacitor/filesystem` & `@capacitor/share` (Caching and natively sharing AI generated image assets)
  - `@revenuecat/purchases-capacitor` (In-App Purchases / Pro status management)
- **UI/UX:** Uses `lucide-react` for icons, `recharts` for charts, and custom modern CSS files (`EventTabs.css`). It follows a sleek design language prioritizing glassmorphism, clean shadow-based card containers, animated floating labels, and glowing focus states.

### Backend (`/backend`)
- **Core:** Node.js, Express.js.
- **Database:** PostgreSQL (with `pg` driver). Uses JSONB columns (e.g., `data` on `events` table) for flexible metadata storage alongside rigid foreign key relations.
- **AI Integrations:** `@google/generative-ai` (Gemini Flash & Gemini Vision). The AI acts as the central engine for parsing receipts, scheduling, budgeting, analyzing vendor PDFs, and natural language chatbot commands.
- **Communication & SEO Pipelines:** 
  - `cheerio` (Injects OpenGraph `<meta>` tags dynamically into `index.html` for beautiful WhatsApp/iMessage link unrolling).
  - `sharp` (Rasterizes dynamic SVGs into PNGs for AI Image Invitations).
  - `twilio`, `resend` (SMS & Email services).
- **Authentication & Security:** JWT tokens, `bcrypt` hashing, and custom `requireProTier` middleware limiting intensive AI actions to subscribers.

## 3. Advanced AI Ecosystem & Features
The application contains a deeply integrated AI suite powered by `backend/services/geminiService.js`. When extending the AI, observe the established patterns:

- **AI Chatbot (`AIAssistantWidget.jsx`):** A floating, context-aware chatbot available on all screens. It parses natural language into strict JSON payloads to execute CRUD actions against the DB (e.g. `ADD_EXPENSE`, `RSVP_GUEST`, `UPDATE_EVENT`).
- **Scan-to-Split Receipts:** Uses Gemini Vision to parse physical receipt images, extracting line-item costs, taxes, and tips, and auto-populating the Split Expenses UI.
- **Targeted AI Tab Generators:** 
  - `AITasksGenerator`: Predicts and generates chronological checklists for event planning.
  - `AIGiftsGenerator`: Generates highly targeted gift registries based on event demographics.
  - `AIVendorQuoteAnalyzer`: Parses copy/pasted vendor quotes to highlight hidden fees and negotiate rates.
  - `AISmartSchedule`: Predicts and graphs complete multi-day event timelines.
- **AI Visual Invitations:** Gemini generates color palettes and layout data which the backend merges into an SVG template and rasterizes via `sharp` for direct native sharing on iOS/Android.

## 4. Monetization & Paywalls
- The app operates on a freemium model.
- **Backend:** `middleware/proTierCheck.js` blocks restricted routes like `/tasks/generate` and `/ai/chat`, returning HTTP 403 if `subscription_tier` is not `pro` or `premium`.
- **Frontend:** Components wrap feature `fetch` calls in try-catch blocks. If a 403 occurs with the Pro restriction message, they mount the global `<UpgradeModal />` to seamlessly prompt the user to subscribe via RevenueCat instead of crashing the flow.

## 5. Development Workflow & Guidelines
To make refinements or add features, strictly adhere to these rules:
1. **Frontend Styling:** Maintain the vibrant and modern styling present. Do not default back to raw HTML elements. Prefer utilizing unified CSS classes (e.g. `.modern-input`, `.floating-label-group`) located in `src/pages/EventTabs.css`. Use smooth shadows (`box-shadow: 0 8px 30px rgba(0,0,0,0.04)`) instead of hard borders for cards.
2. **Layout Overlaps:** Floating Action Buttons (FABs) like the AI Chat Widget sit above the bottom navigation. When adjusting standard page layouts, ensure `Layout.jsx` or your container has sufficient `padding-bottom` (approx `170px`) to prevent scroll occlusion.
3. **Backend API Changes:** Add RESTful routes inside `backend/routes/` and corresponding controllers inside `backend/controllers/`. Always bundle API endpoints behind `/api/...` in production.
4. **AI Module Integrations:** AI features should route through `backend/services/geminiService.js`. Force strict JSON formatting via system prompts and strip markdown codeblocks cleanly before running `JSON.parse`.
5. **Database Updates:** If creating new data models, write direct SQL scripts in `backend/db/migrations/`. You must explicitly inject an execution query to `backend/db/connection.js` inside `initializeDatabase()` for the table to automatically migrate on the production Render server.

## 6. AI Agent Operational Guidelines (Antigravity Rules)
When developing new features, AI agents must strictly adhere to these guardrails:
1. **Never push blindly to Git:** All features must be successfully built locally and fully verified using local Maestro UI tests before any `git push` is executed.
2. **Security-First Approach:** Always proactively check for security vulnerabilities (e.g., OWASP standards, missing headers, unsafe dependencies) during implementation.
3. **Secret Scanning:** Strictly ensure no sensitive secrets (API keys, passwords, private configuration) are ever staged or included in a `git commit`. 
4. **No Hallucinations:** Base all technical decisions, architecture patterns, and syntax on verified project context or official documentation. Never fabricate APIs or assume nonexistent dependencies.
