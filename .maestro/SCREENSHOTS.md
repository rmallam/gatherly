# Maestro Screenshot Storage Guide

## Where Screenshots Are Stored

### 1. **Automatic Failure Screenshots** ❌
When a test fails, Maestro automatically saves a screenshot:

**Location:**
```
~/.maestro/tests/YYYY-MM-DD_HHMMSS/screenshot-❌-timestamp-(test-name).png
```

**Example:**
```
~/.maestro/tests/2025-12-29_131109/screenshot-❌-1766994160436-(01-login.yaml).png
```

These are saved in the test output folder with the test results.

### 2. **Manual Screenshots** (takeScreenshot command) 📸
When you use `takeScreenshot: "name"` in your test:

**Location:**
```
<current-working-directory>/name.png
```

**For our tests, this is:**
```
/Users/rakeshkumarmallam/Rakesh-work/guest-scanner/name.png
```

Screenshots are saved to wherever you ran `maestro test` from.

### 3. **No Screenshots on Success** ✅
When tests pass, Maestro does NOT save automatic screenshots. You must use `takeScreenshot` commands explicitly.

## Current Setup

**Your test screenshots are in:**
```bash
/Users/rakeshkumarmallam/Rakesh-work/guest-scanner/
```

**Files from last run with takeScreenshot:**
- `01-app-loaded.png`
- `03-login-screen.png`
- `04-credentials-entered.png`
- `05-after-login-click.png`
- `06-dashboard-loaded.png`

## Quick Access Commands

```bash
# View all test failure screenshots
find ~/.maestro/tests -name "screenshot-*.png" -mtime -1

# View manual screenshots in project
ls -lh /Users/rakeshkumarmallam/Rakesh-work/guest-scanner/*.png

# Open latest test folder
open ~/.maestro/tests/$(ls -t ~/.maestro/tests | head -1)

# Open project folder (manual screenshots)
open /Users/rakeshkumarmallam/Rakesh-work/guest-scanner/
```

## Best Practice

For visual test documentation, add `takeScreenshot` commands at key steps:

```yaml
- tapOn: "Login"
- takeScreenshot: "after-login-click"
- assertVisible: "Dashboard"
- takeScreenshot: "dashboard-loaded"
```

Screenshots will be saved to your project directory.

## Cleanup

Manual screenshots are NOT automatically cleaned up. Remove them manually:

```bash
# Remove all test screenshots from project root
rm /Users/rakeshkumarmallam/Rakesh-work/guest-scanner/0*.png
```
