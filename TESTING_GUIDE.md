# Automated Testing Strategy for Gatherly

This guide covers setting up automated testing for your mobile app to catch bugs early and reduce manual testing time.

---

## 🚨 Development Practice

**IMPORTANT: All new functionality MUST include tests**

When adding new features:
1. Write tests for the new functionality
2. Ensure tests pass before committing
3. Run `./run-tests.sh` before every deployment

---

## Testing Pyramid

```
           /\
          /  \  E2E Tests (UI flows)
         /____\
        /      \  Integration Tests (API + DB)
       /________\
      /          \  Unit Tests (Functions, Components)
     /____________\
```

**Focus**: More unit tests, fewer E2E tests

---

## 1. Backend Testing (API & Database)

### Setup Backend Testing

```bash
cd backend
npm install --save-dev jest supertest @types/jest
```

Create `backend/package.json` test script:
```json
{
  "scripts": {
    "test": "NODE_ENV=test jest",
    "test:watch": "NODE_ENV=test jest --watch",
    "test:coverage": "NODE_ENV=test jest --coverage"
  }
}
```

### Backend Test Structure

```
backend/
├── __tests__/
│   ├── auth.test.js          # Authentication tests
│   ├── events.test.js        # Event CRUD tests
│   ├── guests.test.js        # Guest management tests
│   ├── communications.test.js # Announcements tests
│   └── setup.js              # Test database setup
```

### Example: API Integration Test

**File**: `backend/__tests__/events.test.js`

```javascript
import request from 'supertest';
import app from '../server.js';
import { query } from '../db/connection.js';

describe('Events API', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Create test user and get token
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    
    authToken = response.body.token;
    userId = response.body.user.id;
  });

  afterAll(async () => {
    // Clean up test data
    await query('DELETE FROM users WHERE email = $1', ['test@example.com']);
  });

  describe('POST /api/events', () => {
    it('should create a new event', async () => {
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Event',
          date: '2025-12-25',
          time: '18:00',
          venue: 'Test Venue'
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Test Event');
      expect(response.body.id).toBeDefined();
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .post('/api/events')
        .send({
          title: 'Event Without Auth',
          date: '2025-12-25'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/events', () => {
    it('should return user events', async () => {
      const response = await request(app)
        .get('/api/events')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
```

---

## 2. Frontend Testing (React Components)

### Setup Frontend Testing

```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom
```

Update `frontend/package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

Create `frontend/vitest.config.js`:
```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
});
```

### Frontend Test Structure

```
frontend/src/
├── __tests__/
│   ├── components/
│   │   ├── EventCard.test.jsx
│   │   ├── GuestList.test.jsx
│   │   └── Header.test.jsx
│   ├── pages/
│   │   ├── EventDetails.test.jsx
│   │   └── Dashboard.test.jsx
│   └── utils/
│       └── csvExport.test.js
├── test/
│   └── setup.js              # Test setup
```

### Example: Component Test

**File**: `frontend/src/__tests__/components/EventCard.test.jsx`

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EventCard from '../../components/EventCard';
import { vi } from 'vitest';

describe('EventCard', () => {
  const mockEvent = {
    id: '1',
    title: 'Birthday Party',
    date: '2025-12-25',
    time: '18:00',
    venue: 'My House',
    guests: [
      { id: '1', name: 'John', attended: true },
      { id: '2', name: 'Jane', attended: false }
    ]
  };

  const mockOnDelete = vi.fn();

  it('renders event information', () => {
    render(
      <BrowserRouter>
        <EventCard event={mockEvent} onDelete={mockOnDelete} />
      </BrowserRouter>
    );

    expect(screen.getByText('Birthday Party')).toBeInTheDocument();
    expect(screen.getByText(/My House/)).toBeInTheDocument();
  });

  it('shows correct guest count', () => {
    render(
      <BrowserRouter>
        <EventCard event={mockEvent} onDelete={mockOnDelete} />
      </BrowserRouter>
    );

    expect(screen.getByText(/2 guests/)).toBeInTheDocument();
  });

  it('shows attended count', () => {
    render(
      <BrowserRouter>
        <EventCard event={mockEvent} onDelete={mockOnDelete} />
      </BrowserRouter>
    );

    expect(screen.getByText(/1 attended/)).toBeInTheDocument();
  });
});
```

---

## 3. End-to-End Testing (Critical User Flows)

### Setup E2E Testing with Playwright

```bash
cd frontend
npm install --save-dev @playwright/test
npx playwright install
```

Create `frontend/e2e/` directory:

```
frontend/e2e/
├── auth.spec.js              # Login/signup flows
├── event-creation.spec.js    # Create event flow
├── guest-checkin.spec.js     # QR scanning flow
└── announcements.spec.js     # Send announcement
```

### Example: E2E Test

**File**: `frontend/e2e/event-creation.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('Event Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Login")');
    await page.waitForURL('**/dashboard');
  });

  test('should create a new event', async ({ page }) => {
    // Click create event button
    await page.click('button:has-text("Create Event")');

    // Fill event form
    await page.fill('input[name="title"]', 'Test Event');
    await page.fill('input[type="date"]', '2025-12-25');
    await page.fill('input[type="time"]', '18:00');
    await page.fill('input[name="venue"]', 'Test Venue');
    await page.fill('textarea[name="description"]', 'Test description');

    // Submit form
    await page.click('button:has-text("Create")');

    // Verify event was created
    await expect(page.locator('text=Test Event')).toBeVisible();
    await expect(page.locator('text=Test Venue')).toBeVisible();
  });

  test('should add guests to event', async ({ page }) => {
    // Navigate to event
    await page.click('text=Test Event');

    // Click Add Guest
    await page.click('button:has-text("Add Guest")');

    // Fill guest form
    await page.fill('input[name="name"]', 'John Doe');
    await page.fill('input[name="phone"]', '+919876543210');
    await page.fill('input[name="email"]', 'john@example.com');

    // Submit
    await page.click('button:has-text("Add")');

    // Verify guest added
    await expect(page.locator('text=John Doe')).toBeVisible();
  });
});
```

### Run E2E Tests

```bash
# Run all E2E tests
npx playwright test

# Run with UI
npx playwright test --ui

# Run specific test
npx playwright test e2e/event-creation.spec.js
```

---

## 4. CI/CD Automated Testing (GitHub Actions)

Create `.github/workflows/test.yml`:

```yaml
name: Run Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: gatherly_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install backend dependencies
        run: |
          cd backend
          npm install
          
      - name: Run backend tests
        run: |
          cd backend
          npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/gatherly_test

  frontend-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install frontend dependencies
        run: |
          cd frontend
          npm install
          
      - name: Run frontend tests
        run: |
          cd frontend
          npm test

  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd frontend
          npm install
          npx playwright install --with-deps
          
      - name: Run E2E tests
        run: |
          cd frontend
          npm run build
          npm run preview &
          npx playwright test
```

---

## 5. Testing Priority (Start Here)

### Phase 1: Critical Path Testing
1. **Authentication**: Login, signup, logout
2. **Event CRUD**: Create, read, update, delete events
3. **Guest Management**: Add guest, check-in, RSVP
4. **Announcements**: Send message to guests

### Phase 2: Feature Testing
1. Budget tracker calculations
2. Reminder scheduling
3. CSV import/export
4. QR code generation

### Phase 3: Edge Cases
1. Error handling
2. Invalid inputs
3. Network failures
4. Permission issues

---

## 6. Quick Start Commands

```bash
# Backend tests
cd backend
npm test
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report

# Frontend tests
cd frontend
npm test
npm run test:ui         # Interactive UI
npm run test:coverage   # Coverage report

# E2E tests
cd frontend
npx playwright test
npx playwright test --ui
npx playwright show-report
```

---

## 7. Testing Best Practices

### ✅ DO
- Test user behavior, not implementation
- Write tests before fixing bugs
- Keep tests simple and focused
- Use descriptive test names
- Mock external dependencies (APIs, SMS)
- Test error cases

### ❌ DON'T
- Test library code (React, Express)
- Write brittle tests that break on UI changes
- Test everything (focus on critical paths)
- Ignore flaky tests
- Skip E2E tests in CI

---

## 8. Mobile-Specific Testing

Since you're building with Capacitor, also consider:

### Capacitor Native Testing

```bash
# Install Appium for mobile automation
npm install --save-dev appium webdriverio
```

### Test on Real Devices
- Use **BrowserStack** or **Sauce Labs** for cloud testing
- Test on real iOS and Android devices
- Verify touch gestures, camera, contacts work

---

## 9. Monitoring & Reporting

### Coverage Goals
- **Backend**: 70%+ coverage
- **Frontend Components**: 60%+ coverage
- **Critical Paths**: 100% E2E coverage

### Tools
- **Jest Coverage**: Built-in coverage reporter
- **Codecov**: Upload coverage to cloud
- **GitHub Actions**: Automated CI/CD testing

---

## Implementation Checklist

- [ ] Install testing dependencies (backend & frontend)
- [ ] Create test directory structure
- [ ] Write first backend API test
- [ ] Write first frontend component test
- [ ] Set up E2E test for login flow
- [ ] Configure GitHub Actions CI/CD
- [ ] Set coverage thresholds
- [ ] Run tests before every commit
- [ ] Add tests for new features

---

## Next Steps

1. **Start small**: Write tests for authentication first
2. **Automate**: Run tests on every PR via GitHub Actions
3. **Iterate**: Add more tests as you find bugs
4. **Monitor**: Track coverage and aim for 70%+

**Testing saves time in the long run by catching bugs before users do!** 🚀
