# Maestro Test Recordings

## Automatic Recording

Maestro automatically records videos of all test runs! 

### Where to Find Recordings

All test recordings are saved to:
```
~/.maestro/tests/
```

Each test run creates a new folder with timestamp:
```
~/.maestro/tests/YYYY-MM-DD_HHMMSS/
```

### What's Included

Each test folder contains:
- 📹 **Video recording** (`.mp4` or `.mov`)
- 📸 **Screenshots** (at each step and on failure)
- 📝 **Logs** (`maestro.log`)
- 📊 **HTML report** (`ai-report-*.html`)
- 📋 **Commands JSON** (detailed step info)

### View Latest Recording

```bash
# Open latest test folder
open ~/.maestro/tests/$(ls -t ~/.maestro/tests | head -1)

# Or open all test results
open ~/.maestro/tests/
```

### Manual Recording Commands

You can also explicitly control recording in tests:

```yaml
- startRecording  # Start recording
# ... test steps ...
- stopRecording   # Stop recording
```

### Recording Settings

Maestro records by default, but you can customize:

```bash
# Run test with recording (default)
maestro test .maestro/01-login.yaml

# Disable recording (faster)
maestro test --no-recording .maestro/01-login.yaml
```

### Video Format

- **Format**: MP4 or MOV
- **Quality**: High quality screen capture
- **FPS**: 30 fps
- **Size**: Varies by test length

### Viewing Recordings

1. **Finder**: Navigate to `~/.maestro/tests/` and double-click video
2. **Terminal**: `open ~/.maestro/tests/latest-folder/recording.mp4`
3. **HTML Report**: Open the HTML report which embeds the video

### Cleanup

Old recordings are automatically deleted after 14 days to save space.

Manual cleanup:
```bash
# Delete all test recordings
rm -rf ~/.maestro/tests/*

# Delete recordings older than 7 days
find ~/.maestro/tests -type d -mtime +7 -exec rm -rf {} +
```

## Example: Latest Test Recording

```bash
# Quick command to open latest test results
open ~/.maestro/tests/$(ls -t ~/.maestro/tests | head -1)
```

This will show:
- Video of the entire test run
- Screenshots at each step
- Detailed logs
- HTML report with embedded media
