# Mobile Automation Testing & CI/CD Pipeline Guide

## Overview

Automated testing eliminates manual testing overhead and catches bugs before they reach users. This guide covers setting up automated tests for your React Native/Capacitor Android app.

## Testing Strategy

### Test Pyramid
```
        /\
       /E2E\        <- 10% (Critical user flows)
      /------\
     /  API   \     <- 20% (Backend endpoints)
    /----------\
   / Component \    <- 70% (UI components, logic)
  /--------------\
```

## Testing Tools & Frameworks

### 1. Unit & Component Tests (Already Set Up!)

You already have Vitest configured in your project.

**Current Setup:**
```json
// package.json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
}
```

**What to Test:**
- Utility functions
- React components
- State management
- API service functions

**Example Test:**
```javascript
// src/utils/__tests__/validation.test.js
import { describe, it, expect } from 'vitest';
import { validateEmail, validatePhone } from '../validation';

describe('Validation Utils', () => {
  it('validates email correctly', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('invalid')).toBe(false);
  });

  it('validates phone with country code', () => {
    expect(validatePhone('+919876543210')).toBe(true);
    expect(validatePhone('123')).toBe(false);
  });
});
```

### 2. E2E Testing for Mobile

#### Option A: Detox (Recommended for React Native)

**Pros:**
- Fast, runs on actual app
- Gray box testing (can access app internals)
- Great for React Native/Capacitor
- Free and open source

**Setup:**
```bash
npm install --save-dev detox detox-cli
```

**Configuration:**
```json
// .detoxrc.json
{
  "testRunner": "jest",
  "runnerConfig": "e2e/config.json",
  "apps": {
    "android.debug": {
      "type": "android.apk",
      "binaryPath": "android/app/build/outputs/apk/debug/app-debug.apk",
      "build": "cd android && ./gradlew assembleDebug"
    }
  },
  "devices": {
    "emulator": {
      "type": "android.emulator",
      "device": {
        "avdName": "Pixel_4_API_30"
      }
    }
  },
  "configurations": {
    "android.emu.debug": {
      "device": "emulator",
      "app": "android.debug"
    }
  }
}
```

**Example Test:**
```javascript
// e2e/login.test.js
describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should login successfully', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    await expect(element(by.text('Dashboard'))).toBeVisible();
  });

  it('should show error for invalid credentials', async () => {
    await element(by.id('email-input')).typeText('wrong@example.com');
    await element(by.id('password-input')).typeText('wrong');
    await element(by.id('login-button')).tap();
    await expect(element(by.text('Invalid credentials'))).toBeVisible();
  });
});
```

#### Option B: Appium (Cross-platform)

**Pros:**
- Works for Android & iOS
- Industry standard
- Large community

**Cons:**
- Slower than Detox
- More complex setup

**Setup:**
```bash
npm install --save-dev appium webdriverio
```

#### Option C: Maestro (Easiest!)

**Pros:**
- Extremely simple YAML syntax
- Fast setup
- Great for quick tests
- Free

**Installation:**
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

**Example Test:**
```yaml
# .maestro/login.yaml
appId: com.guestscanner.app
---
- launchApp
- tapOn: "Email"
- inputText: "test@example.com"
- tapOn: "Password"
- inputText: "password123"
- tapOn: "Login"
- assertVisible: "Dashboard"
```

**Run Test:**
```bash
maestro test .maestro/login.yaml
```

### 3. API Testing

**Tool: Supertest (for Node.js backend)**

```bash
npm install --save-dev supertest
```

**Example:**
```javascript
// backend/__tests__/auth.test.js
import request from 'supertest';
import app from '../server.js';

describe('Auth API', () => {
  it('POST /api/auth/login - success', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('POST /api/auth/login - invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrong@example.com',
        password: 'wrong'
      });
    
    expect(res.status).toBe(401);
  });
});
```

## CI/CD Pipeline Setup

### Option 1: GitHub Actions (Recommended - Free)

**Advantages:**
- Free for public repos
- 2000 minutes/month for private repos
- Easy integration with GitHub
- Good Android support

**Setup:**

Create `.github/workflows/android-ci.yml`:

```yaml
name: Android CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    # Setup Node.js
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    # Install dependencies
    - name: Install dependencies
      working-directory: ./frontend
      run: npm ci
    
    # Run unit tests
    - name: Run unit tests
      working-directory: ./frontend
      run: npm test
    
    # Run linter
    - name: Run linter
      working-directory: ./frontend
      run: npm run lint
    
    # Build frontend
    - name: Build frontend
      working-directory: ./frontend
      run: npm run build
    
    # Setup Java for Android
    - name: Setup Java
      uses: actions/setup-java@v3
      with:
        distribution: 'temurin'
        java-version: '17'
    
    # Setup Android SDK
    - name: Setup Android SDK
      uses: android-actions/setup-android@v2
    
    # Build Android APK
    - name: Build Android Debug APK
      working-directory: ./frontend/android
      run: ./gradlew assembleDebug
    
    # Upload APK artifact
    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: app-debug
        path: frontend/android/app/build/outputs/apk/debug/app-debug.apk
    
    # Run E2E tests (if using Maestro)
    - name: Setup Maestro
      run: |
        curl -Ls "https://get.maestro.mobile.dev" | bash
        echo "${HOME}/.maestro/bin" >> $GITHUB_PATH
    
    - name: Run Maestro tests
      run: |
        maestro test .maestro/
```

### Option 2: GitLab CI/CD

**Setup `.gitlab-ci.yml`:**

```yaml
stages:
  - test
  - build
  - deploy

variables:
  ANDROID_COMPILE_SDK: "33"
  ANDROID_BUILD_TOOLS: "33.0.0"

test:
  stage: test
  image: node:18
  script:
    - cd frontend
    - npm ci
    - npm test
    - npm run lint

build:
  stage: build
  image: mingc/android-build-box:latest
  script:
    - cd frontend
    - npm ci
    - npm run build
    - npx cap sync android
    - cd android
    - ./gradlew assembleDebug
  artifacts:
    paths:
      - frontend/android/app/build/outputs/apk/debug/app-debug.apk
    expire_in: 1 week
```

### Option 3: CircleCI

**Setup `.circleci/config.yml`:**

```yaml
version: 2.1

orbs:
  android: circleci/android@2.0

jobs:
  test:
    docker:
      - image: cimg/node:18.0
    steps:
      - checkout
      - restore_cache:
          keys:
            - v1-dependencies-{{ checksum "frontend/package-lock.json" }}
      - run:
          name: Install dependencies
          command: cd frontend && npm ci
      - run:
          name: Run tests
          command: cd frontend && npm test
      - save_cache:
          paths:
            - frontend/node_modules
          key: v1-dependencies-{{ checksum "frontend/package-lock.json" }}

  build:
    executor:
      name: android/android-machine
      resource-class: large
    steps:
      - checkout
      - run:
          name: Build Android APK
          command: |
            cd frontend
            npm ci
            npm run build
            npx cap sync android
            cd android
            ./gradlew assembleDebug
      - store_artifacts:
          path: frontend/android/app/build/outputs/apk/debug/app-debug.apk

workflows:
  test-and-build:
    jobs:
      - test
      - build:
          requires:
            - test
```

## Critical Test Cases to Automate

### High Priority (Must Have)

1. **Authentication**
   - Login with valid credentials
   - Login with invalid credentials
   - Signup flow
   - Logout

2. **Event Management**
   - Create new event
   - Edit event details
   - Delete event
   - View event list

3. **Guest Management**
   - Add guest manually
   - Import from contacts
   - Delete guest
   - View guest list

4. **QR Code Flow**
   - Generate QR code
   - Scan QR code
   - Check-in guest
   - Handle invalid QR code

5. **Critical User Journeys**
   - Complete event creation → add guests → check-in
   - Import contacts → create event → send invites

### Medium Priority

- Event wall posting
- Budget tracking
- Contact groups
- Profile management
- Settings changes

### Low Priority

- UI animations
- Theme switching
- Non-critical features

## Test Data Management

### Create Test Fixtures

```javascript
// e2e/fixtures/users.js
export const testUsers = {
  validUser: {
    email: 'test@hosteze.com',
    password: 'Test123!@#'
  },
  invalidUser: {
    email: 'invalid@hosteze.com',
    password: 'wrong'
  }
};

// e2e/fixtures/events.js
export const testEvents = {
  sampleEvent: {
    title: 'Test Birthday Party',
    date: '2024-12-31',
    location: 'Test Venue',
    description: 'Test event description'
  }
};
```

## Recommended Testing Strategy

### Phase 1: Start Simple (Week 1)
1. Set up GitHub Actions
2. Add unit tests for critical utils
3. Add API tests for auth endpoints
4. Run tests on every PR

### Phase 2: Add E2E (Week 2-3)
1. Install Maestro (easiest)
2. Write 5 critical flow tests
3. Run E2E tests on main branch only
4. Monitor for flaky tests

### Phase 3: Expand Coverage (Month 2)
1. Add more unit tests (target 70%)
2. Add more E2E tests (10-15 flows)
3. Add visual regression testing
4. Set up test reporting

### Phase 4: Optimize (Month 3)
1. Parallelize tests
2. Reduce test execution time
3. Add performance tests
4. Set up test analytics

## Cost Comparison

### Free Tier Options

| Service | Free Tier | Best For |
|---------|-----------|----------|
| GitHub Actions | 2000 min/month | Most projects |
| GitLab CI | 400 min/month | GitLab users |
| CircleCI | 6000 min/month | Heavy testing |
| Travis CI | Limited | Open source |

### Paid Options (if needed)

| Service | Cost | Features |
|---------|------|----------|
| BrowserStack | $29/month | Real devices |
| Sauce Labs | $39/month | Cloud testing |
| Firebase Test Lab | Pay per test | Google integration |

## Quick Start Guide

### 1. Add GitHub Actions (10 minutes)

```bash
# Create workflow directory
mkdir -p .github/workflows

# Create workflow file
cat > .github/workflows/android-ci.yml << 'EOF'
name: Android CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm ci
      - run: cd frontend && npm test
EOF

# Commit and push
git add .github/workflows/android-ci.yml
git commit -m "Add CI pipeline"
git push
```

### 2. Add First Unit Test (15 minutes)

```javascript
// frontend/src/utils/__tests__/example.test.js
import { describe, it, expect } from 'vitest';

describe('Example Test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});
```

### 3. Add Maestro Test (20 minutes)

```bash
# Install Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash

# Create test directory
mkdir -p .maestro

# Create first test
cat > .maestro/smoke-test.yaml << 'EOF'
appId: com.guestscanner.app
---
- launchApp
- assertVisible: "HostEze"
EOF

# Run test
maestro test .maestro/smoke-test.yaml
```

## Monitoring & Reporting

### Test Reports

Add to GitHub Actions:

```yaml
- name: Generate test report
  if: always()
  uses: dorny/test-reporter@v1
  with:
    name: Test Results
    path: frontend/test-results.json
    reporter: jest-junit
```

### Code Coverage

```yaml
- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./frontend/coverage/coverage-final.json
```

## Best Practices

1. **Keep tests fast** - Under 10 minutes total
2. **Test critical paths first** - 80/20 rule
3. **Avoid flaky tests** - Use proper waits
4. **Use test IDs** - Add `testID` props to components
5. **Mock external services** - Don't hit real APIs
6. **Run tests in parallel** - Save time
7. **Monitor test health** - Track flakiness
8. **Review test failures** - Don't ignore them

## Next Steps

1. **This week**: Set up GitHub Actions
2. **Next week**: Add 10 unit tests
3. **Month 1**: Add 5 E2E tests
4. **Month 2**: Achieve 50% code coverage
5. **Month 3**: Full automation

## Need Help?

- **Detox Docs**: [wix.github.io/Detox](https://wix.github.io/Detox/)
- **Maestro Docs**: [maestro.mobile.dev](https://maestro.mobile.dev/)
- **GitHub Actions**: [docs.github.com/actions](https://docs.github.com/en/actions)

---

**Ready to start?** I can help you:
1. Set up GitHub Actions workflow
2. Write your first unit tests
3. Create E2E test suite
4. Configure test reporting

Let me know what you'd like to tackle first!
