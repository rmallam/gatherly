# Maestro Test Coverage

## Current Tests (9)

### ✅ Existing Tests
1. **01-smoke-test.yaml** - App launches
2. **01-login.yaml** - User login
3. **02-login-flow.yaml** - Alternative login test
4. **02-signup.yaml** - User signup
5. **03-create-event.yaml** - Create event
6. **04-add-guest.yaml** - Add guest manually
7. **05-delete-event.yaml** - Delete event
8. **06-scanner.yaml** - QR scanner
9. **07-back-navigation.yaml** - Back button navigation

## Missing Test Coverage

### 🔴 High Priority
- [ ] **Admin Dashboard** - Access admin panel, view stats, manage users
- [ ] **RSVP Flow** - Guest RSVP to event (accept/decline)
- [ ] **Event Wall** - Post to event wall, like posts
- [ ] **Profile Management** - Edit profile, change password, upload photo
- [ ] **Dark Theme Toggle** - Switch between light/dark themes
- [ ] **Contact Import** - Import contacts from device
- [ ] **Guest Check-in** - Scan guest QR code for check-in

### 🟡 Medium Priority
- [ ] **Budget Tracker** - Add/edit budget items
- [ ] **Task Management** - Add/edit tasks
- [ ] **Notifications** - View notifications, mark as read
- [ ] **Event Details Tabs** - Test all tabs (Catering, Venue, Decorations, etc.)
- [ ] **Guest Search/Filter** - Search guests by name/phone
- [ ] **Bulk Guest Import** - Import multiple guests
- [ ] **Guest Communication** - Send announcements/thank you messages

### 🟢 Low Priority
- [ ] **Biometric Auth** - Login with fingerprint/face
- [ ] **Email Verification** - Verify email flow
- [ ] **Password Reset** - Forgot password flow
- [ ] **Event Sharing** - Share event via SMS/WhatsApp
- [ ] **Public Invitation** - Access public invitation link
- [ ] **Logout** - Logout and clear session

## Test Issues Found

### 01-smoke-test.yaml
- ❌ "HostEze" → "Host" (HTML has italic formatting)
- ✅ Fixed

### 01-login.yaml
- ❌ "Sign In" → "Login"
- ❌ "Email Address" → "Email"
- ✅ Fixed

### 02-signup.yaml
- ❌ "Full Name" → "Name"
- ❌ Needs randomized email to avoid duplicates
- ✅ Fixed

### 03-create-event.yaml
- ❌ Needs randomized event name
- ❌ "Event Details" → "Event Title"
- ✅ Fixed

### 04-add-guest.yaml
- ⚠️ Needs review - selectors may be outdated
- ⚠️ Email field now exists for guests

### 05-delete-event.yaml
- ⚠️ Needs review

### 06-scanner.yaml
- ⚠️ Needs review - scanner UI may have changed

### 07-back-navigation.yaml
- ⚠️ Needs review

## Recommendations

1. **Update all tests** to use current UI text
2. **Add randomization** where needed (emails, event names)
3. **Create new tests** for missing features
4. **Run all tests** to verify they pass
5. **Add to CI/CD** pipeline for automated testing

## Priority Order

1. Fix existing tests (01-04)
2. Add admin dashboard test
3. Add RSVP flow test
4. Add event wall test
5. Add remaining high-priority tests
