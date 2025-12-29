# Maestro Screenshots - Where Are They?

## The Issue

Maestro's `takeScreenshot` command logs that it's taking screenshots, but they're not being saved as separate PNG files in the test output folder.

## Where Screenshots Actually Are

### 1. **Embedded in HTML Report** ✅
Screenshots are embedded as base64 images in the HTML report:
```bash
open ~/.maestro/tests/LATEST_FOLDER/ai-report-01-login.html
```

The HTML report contains all screenshots inline - you can view them in your browser!

### 2. **Only on Failures** ❌
Maestro automatically saves PNG files ONLY when tests fail (marked with ❌ in filename).

### 3. **Commands JSON**
Screenshot data is also in the commands JSON file as base64.

## Solution: Extract Screenshots from HTML

Since screenshots are embedded in the HTML report, you have two options:

### Option A: View in Browser (Easiest)
```bash
# Open the HTML report - all screenshots are there!
open ~/.maestro/tests/$(ls -t ~/.maestro/tests | head -1)/ai-report-01-login.html
```

### Option B: Use Maestro Studio (Better)
Maestro Studio provides a better UI for viewing test results:
```bash
maestro studio
```

### Option C: Save Screenshots to Files
Modify the test to use `--format` flag:
```bash
maestro test --format html,json .maestro/01-login.yaml
```

## Why This Happens

Maestro's `takeScreenshot` command is designed for:
1. **Labeling** screenshots in the report (not saving files)
2. **Debugging** - screenshots appear in HTML report
3. **CI/CD** - embedded screenshots travel with the report

To get actual PNG files, you need:
- Test failures (automatic)
- Or use Maestro Cloud/Studio
- Or extract from HTML report manually

## Recommended Approach

**Just use the HTML report!** It has all your screenshots embedded and is easier to share.

```bash
# Quick command to open latest test report
open ~/.maestro/tests/$(ls -t ~/.maestro/tests | head -1)/ai-report-01-login.html
```

The HTML report shows:
- ✅ All screenshots taken during the test
- ✅ Test steps and results
- ✅ Timing information
- ✅ Error details (if any)

## For CI/CD

In CI/CD, publish the HTML report as an artifact - it contains everything you need!
