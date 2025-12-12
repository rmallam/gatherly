# Gatherly - Maestro Test Suite

## Running Tests

### Run all tests:
```bash
maestro test .maestro/
```

### Run specific test:
```bash
maestro test .maestro/01-login.yaml
```

### Run with emulator/device:
```bash
# Start emulator first
maestro test --device emulator-5554 .maestro/
```

## Test Files

1. **01-login.yaml** - User login flow
2. **02-signup.yaml** - User registration with password strength validation
3. **03-create-event.yaml** - Event creation
4. **04-add-guest.yaml** - Adding guests manually with duplicate prevention
5. **05-delete-event.yaml** - Event deletion and persistence
6. **06-scanner.yaml** - Scanner navigation
7. **07-back-navigation.yaml** - Android back button behavior

## Prerequisites

- Maestro CLI installed: `curl -Ls "https://get.maestro.mobile.dev" | bash`
- Android emulator running OR physical device connected
- APK installed on device/emulator

## Test Accounts

Create these test accounts for running tests:
- **Email:** test@example.com
- **Password:** Test@1234

## Notes

- Tests use `clearState` to start fresh each time
- Some tests depend on previous state (e.g., events must exist to delete)
- Scanner tests can't scan actual QR codes in emulator - only tests navigation
- Contact import tests require permissions - grant when prompted

## CI/CD Integration

Add to GitHub Actions:
```yaml
- name: Run Maestro Tests
  run: |
    maestro test .maestro/ --format junit
```

## Debugging

Run in interactive mode:
```bash
maestro studio
```

View test recording:
```bash
maestro test --record .maestro/01-login.yaml
```
