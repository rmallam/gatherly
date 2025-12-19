# Apple App Store Deployment Guide

Complete guide to build, sign, and submit Gatherly to the Apple App Store.

---

## Prerequisites

- Mac with Xcode installed
- Apple Developer Account ($99/year subscription)
- Valid credit card for App Store Connect
- Privacy policy URL (required by Apple)

---

## Step 1: Apple Developer Account Setup

### 1.1 Enroll in Apple Developer Program

1. Go to [Apple Developer](https://developer.apple.com/programs/)
2. Click **Enroll**
3. Sign in with your Apple ID
4. Choose **Individual** or **Organization**
5. Complete enrollment and pay $99/year fee
6. Wait for approval (typically 24-48 hours)

---

## Step 2: Create App ID and Certificates

### 2.1 Create App ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+** button
4. Select **App IDs** → **Continue**
5. Select **App** → **Continue**
6. Fill in:
   - **Description**: Gatherly
   - **Bundle ID**: `com.guestscanner.app` (must match your app)
   - **Capabilities**: Enable any needed (e.g., Push Notifications)
7. Click **Continue** → **Register**

### 2.2 Create Distribution Certificate

1. On your Mac, open **Keychain Access**
2. Go to **Keychain Access** → **Certificate Assistant** → **Request a Certificate from a Certificate Authority**
3. Enter your email and name
4. Select **Saved to disk** → **Continue**
5. Save the `.certSigningRequest` file

6. Back in Apple Developer Portal:
   - Go to **Certificates** → **+** button
   - Select **Apple Distribution** → **Continue**
   - Upload the `.certSigningRequest` file
   - Download the certificate (`.cer` file)

7. Double-click the `.cer` file to install it in Keychain

### 2.3 Create Provisioning Profile

1. In Apple Developer Portal, go to **Profiles** → **+**
2. Select **App Store** → **Continue**
3. Select your App ID → **Continue**
4. Select your Distribution certificate → **Continue**
5. Name it: **Gatherly App Store Profile**
6. Download the `.mobileprovision` file
7. Double-click to install it in Xcode

---

## Step 3: Configure Xcode Project

### 3.1 Update Bundle Identifier and Version

1. Open `frontend/ios/App/App.xcodeproj` in Xcode
2. Select the **App** target
3. Go to **General** tab
4. Set:
   - **Bundle Identifier**: `com.guestscanner.app`
   - **Version**: `1.0.0`
   - **Build**: `1`
   - **Display Name**: Gatherly

### 3.2 Configure Signing

1. Go to **Signing & Capabilities** tab
2. **Automatically manage signing**: ☑️ Checked
3. **Team**: Select your Apple Developer team
4. Xcode will automatically select the provisioning profile

### 3.3 Update App Icons

1. In Xcode, go to **Assets.xcassets** → **AppIcon**
2. Drag and drop icon images for all required sizes:
   - **1024x1024**: App Store icon (required)
   - **180x180**, **120x120**, **87x87**, etc.

You can use online tools like [AppIcon.co](https://www.appicon.co/) to generate all sizes from one image.

---

## Step 4: Create App Store Listing

### 4.1 Create App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - **Platforms**: iOS
   - **Name**: Gatherly
   - **Primary Language**: English (U.S.)
   - **Bundle ID**: `com.guestscanner.app`
   - **SKU**: `gatherly-001` (unique identifier)
   - **User Access**: Full Access
4. Click **Create**

### 4.2 Complete App Information

#### App Information Tab
- **Name**: Gatherly
- **Subtitle** (30 chars): "Event Management Made Easy"
- **Category**: Productivity or Lifestyle
- **Content Rights**: Your name/company

#### Pricing and Availability
- **Price**: Free
- **Availability**: All countries/regions

#### Privacy Policy
- **Privacy Policy URL**: Your hosted privacy policy URL (REQUIRED)

### 4.3 Prepare App Screenshots

Required for iPhone (at least 2 screenshots each):
- **6.7" Display** (iPhone 14 Pro Max): 1290 x 2796 pixels
- **6.5" Display** (iPhone 11 Pro Max): 1242 x 2688 pixels

Take screenshots of:
- Event list/dashboard
- Event details
- Guest check-in with QR scanner
- Messages/Communication hub
- Guest list management

You can use Xcode's simulator to capture screenshots:
- Run app in simulator
- **Cmd + S** to save screenshot
- Resize to required dimensions

### 4.4 App Description

**Description** (4000 characters max):

```
Gatherly makes event management effortless! Plan, organize, and manage your events with powerful features designed for hosts and event planners.

🎉 KEY FEATURES

EVENT MANAGEMENT
• Create and manage multiple events with ease
• Set event details: date, time, location, description
• Customize event information and settings

GUEST MANAGEMENT
• Add guests manually or import from contacts
• Track RSVPs and attendance
• Send custom invitations with QR codes
• Check-in guests instantly with QR scanning

COMMUNICATION HUB
• Send announcements to all guests or filtered groups
• Send personalized thank you messages
• Customize sender name for personal touch
• Track message history and delivery status

BUDGET TRACKER
• Set total event budget
• Track expenses by category
• Monitor spending vs. budget in real-time
• View cost per guest

SMART REMINDERS
• Auto-schedule RSVP reminders
• Day-before event notifications
• Event starting soon alerts
• Never miss important event milestones

QR CODE CHECK-IN
• Generate unique QR codes for each guest
• Fast check-in with built-in scanner
• Track attendance in real-time
• Support for plus-ones and group check-ins

Perfect for: Birthday parties, weddings, corporate events, conferences, meetups, and any gathering where you need to manage guests efficiently.

Download Gatherly today and make your next event unforgettable!
```

**Keywords** (100 characters max):
```
event,party,guest,rsvp,qr,scanner,check-in,invitation,planner,wedding
```

**Support URL**: Your website or GitHub repo
**Marketing URL**: (Optional) Your website

---

## Step 5: Build and Upload to App Store

### 5.1 Archive the App

1. In Xcode, select **Product** → **Destination** → **Any iOS Device (arm64)**
2. Select **Product** → **Archive**
3. Wait for the build to complete (3-10 minutes)
4. The **Organizer** window will open automatically

### 5.2 Upload to App Store Connect

1. In **Organizer**, select your archive
2. Click **Distribute App**
3. Select **App Store Connect** → **Next**
4. Select **Upload** → **Next**
5. Choose distribution options:
   - **Include bitcode**: ☐ (Unchecked for Capacitor apps)
   - **Upload symbols**: ☑️ (Checked)
   - **Manage Version**: ☑️ (Automatically)
6. Select your Distribution certificate and provisioning profile
7. Click **Upload**
8. Wait for processing (5-30 minutes)

### 5.3 Alternative: Command Line Build

```bash
# Build the web assets
cd ~/Rakesh-work/guest-scanner/frontend
npm run build
npx cap sync ios

# Archive using xcodebuild
cd ios/App
xcodebuild -workspace App.xcworkspace \
  -scheme App \
  -sdk iphoneos \
  -configuration Release \
  archive -archivePath ./build/Gatherly.xcarchive

# Export IPA for App Store
xcodebuild -exportArchive \
  -archivePath ./build/Gatherly.xcarchive \
  -exportOptionsPlist ExportOptions.plist \
  -exportPath ./build
```

---

## Step 6: Submit for Review

### 6.1 Complete Build Information

1. In App Store Connect, go to your app
2. Click **Prepare for Submission**
3. Under **Build**, click **+** and select your uploaded build
4. Wait for processing to complete (shows green checkmark)

### 6.2 App Review Information

Fill in:
- **Contact Information**: Your name, phone, email
- **Demo Account** (if login required):
  - Username: demo@gatherly.app
  - Password: (create a test account)
- **Notes**: Any special instructions for reviewers

### 6.3 Export Compliance

- **Does your app use encryption?**: 
  - Select **No** (if you're only using HTTPS)
  - Or select **Yes** and answer follow-up questions

### 6.4 Content Rights

- Confirm you have rights to all content in the app

### 6.5 Submit

1. Review all information
2. Click **Add for Review**
3. Click **Submit to App Review**
4. Wait for review (typically 1-3 days)

---

## Step 7: App Review Process

### Review Status
- **Waiting for Review**: In queue
- **In Review**: Being reviewed (1-2 days)
- **Pending Developer Release**: Approved! Ready to release
- **Ready for Sale**: Live on App Store

### If Rejected
- Read rejection reason carefully
- Fix the issues mentioned
- Resubmit with explanation of changes

---

## Updating Your App

When you need to release an update:

### 1. Update Version Numbers

In `capacitor.config.json`:
```json
{
  "version": "1.0.1"
}
```

In Xcode (General tab):
- **Version**: `1.0.1`
- **Build**: `2` (increment build number)

### 2. Build and Upload

```bash
cd ~/Rakesh-work/guest-scanner/frontend
npm run build
npx cap sync ios

# Open in Xcode
npx cap open ios

# Then: Product → Archive → Distribute App
```

### 3. Submit Update

1. In App Store Connect, create new version
2. Add **What's New** text
3. Select new build
4. Submit for review

---

## Common Issues

### Build Failed - Missing Provisioning Profile
- In Xcode, go to **Signing & Capabilities**
- Re-select your Team
- Clean build: **Product** → **Clean Build Folder**
- Archive again

### Archive Not Showing in Organizer
- Ensure you selected **Any iOS Device (arm64)** as destination
- Check for build errors in Xcode console
- Verify Bundle ID matches App Store Connect

### Upload Failed - Invalid Binary
- Check that all required icons are present
- Verify Bundle ID matches your App ID
- Ensure minimum iOS version is set (iOS 13.0+)

### App Rejected - Missing Privacy Policy
- Add privacy policy URL in App Store Connect
- Ensure the URL is accessible and loads properly

### TestFlight Issues
- If you want to test before submission, select **TestFlight** instead of **App Store** when distributing
- Invite internal or external testers
- Get feedback before final submission

---

## TestFlight Beta Testing (Optional)

Before submitting to App Store, you can test with TestFlight:

### 1. Upload Build for TestFlight

1. Archive your app in Xcode
2. Select **TestFlight & App Store** → **Next**
3. Upload as described above

### 2. Add Testers

1. In App Store Connect → **TestFlight**
2. Add **Internal Testers** (up to 100, instant access)
3. Or add **External Testers** (up to 10,000, requires review)

### 3. Test Thoroughly

- Test all features
- Verify on different devices
- Get feedback from testers
- Fix issues before App Store submission

---

## Checklist Before Submission

- [ ] App runs without crashes on real device
- [ ] All app icons provided (including 1024x1024)
- [ ] Screenshots prepared for required sizes
- [ ] Privacy policy URL added and accessible
- [ ] App description, keywords filled out
- [ ] Contact information provided
- [ ] Demo account created (if app requires login)
- [ ] Export compliance answered
- [ ] Version and build numbers set correctly
- [ ] Tested on multiple iOS versions/devices

---

## Resources

- [App Store Connect Guide](https://developer.apple.com/app-store-connect/)
- [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [App Store Assets](https://developer.apple.com/app-store/product-page/)

---

## Quick Reference Commands

```bash
# Build web assets and sync
cd frontend
npm run build
npx cap sync ios

# Open in Xcode
npx cap open ios

# Then in Xcode:
# Product → Archive → Distribute App → App Store Connect
```

---

**Good luck with your App Store submission! 🍎**
