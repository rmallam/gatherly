# Google Play Store Deployment Guide

Complete guide to build a signed APK/AAB and submit Gatherly to the Google Play Store.

---

## Prerequisites

- Android Studio installed
- Google Play Console account ($25 one-time fee)
- Privacy policy URL (required by Google)

---

## Step 1: Generate a Signing Key

Open Terminal and run:

```bash
cd ~/Rakesh-work/guest-scanner/frontend/android
keytool -genkey -v -keystore gatherly-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 -alias gatherly
```

**You'll be prompted for:**
- Keystore password (choose a strong password)
- Key password (can be same as keystore password)
- Your name, organization, city, state, country

**⚠️ CRITICAL:** Save these passwords! You'll need them forever. Losing them means you can't update your app.

---

## Step 2: Configure Gradle Signing

### 2.1 Create `android/key.properties`

Create file at `frontend/android/key.properties`:

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=gatherly
storeFile=gatherly-release-key.jks
```

Replace `YOUR_KEYSTORE_PASSWORD` and `YOUR_KEY_PASSWORD` with your actual passwords.

### 2.2 Add to `.gitignore`

**IMPORTANT:** Never commit your signing keys to Git!

```bash
cd ~/Rakesh-work/guest-scanner/frontend
echo "android/key.properties" >> .gitignore
echo "android/*.jks" >> .gitignore
echo "android/*.keystore" >> .gitignore
```

### 2.3 Update `android/app/build.gradle`

**Add this BEFORE the `android {` block:**

```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

**Add this INSIDE the `android {` block:**

```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

---

## Step 3: Build Signed AAB (Android App Bundle)

### Option A: Using Android Studio (Recommended)

1. Open project in Android Studio
2. `Build` → `Generate Signed Bundle / APK`
3. Select `Android App Bundle`
4. Click `Next`
5. Select your keystore file (`gatherly-release-key.jks`)
6. Enter keystore password and key password
7. Choose `release` build variant
8. Click `Finish`

Output location: `android/app/build/outputs/bundle/release/app-release.aab`

### Option B: Command Line

```bash
# Build the web assets
cd ~/Rakesh-work/guest-scanner/frontend
npm run build
npx cap sync android

# Build the AAB
cd android
./gradlew bundleRelease

# Find your AAB
ls -lh app/build/outputs/bundle/release/app-release.aab
```

---

## Step 4: Prepare Play Store Assets

Before submitting, you need these assets:

### Required Graphics

1. **App Icon** (PNG, 512x512, 32-bit, no transparency)
   - Use your current app icon
   
2. **Feature Graphic** (PNG, 1024x500)
   - Banner image for store listing
   
3. **Screenshots** (at least 2, max 8)
   - Phone: 1080x1920 or 1080x2340
   - Take screenshots of key features:
     - Event overview
     - Guest list
     - QR scanner
     - Check-in process

### Required Information

- **App name:** Gatherly
- **Short description:** (80 characters max)
  "Event management made easy. Track RSVPs, check-in guests with QR codes."
  
- **Full description:** (4000 characters max)
  Write about features: event creation, guest management, QR scanning, etc.
  
- **Category:** Events
- **Privacy policy URL:** (REQUIRED!)
  - Host a simple privacy policy on your website or GitHub Pages
  
- **Contact email:** Your email address
- **Developer name:** Your name or company

---

## Step 5: Submit to Google Play Console

### 5.1 Create App

1. Go to [Google Play Console](https://play.google.com/console)
2. Click `Create app`
3. Fill in:
   - App name: Gatherly
   - Default language: English (United States)
   - App or game: App
   - Free or paid: Free
4. Accept declarations and click `Create app`

### 5.2 Set Up Store Listing

1. Go to `Store presence` → `Main store listing`
2. Upload:
   - App icon
   - Feature graphic
   - Screenshots
3. Fill in:
   - Short description
   - Full description
4. Choose category: Events
5. Save

### 5.3 App Content

1. **Privacy Policy:** Add your privacy policy URL
2. **Ads:** Declare if your app contains ads (No)
3. **Content Rating:** Complete questionnaire
   - Answer questions about app content
   - Typically rated "Everyone"
4. **Target Audience:** Select age groups
5. **Data Safety:** Fill out data collection form

### 5.4 Upload AAB

1. Go to `Release` → `Production`
2. Click `Create new release`
3. Upload `app-release.aab`
4. Add release notes (what's new)
5. Click `Review release`
6. Click `Start rollout to Production`

### 5.5 Pricing & Distribution

1. Go to `Pricing`
2. Select countries to distribute
3. Set pricing: Free
4. Save

---

## Step 6: Submit for Review

1. Review all sections for completion
2. Click `Send for review`
3. Wait for Google's review (typically 1-7 days)

---

## Updating the App

When you need to update:

```bash
# 1. Update version in capacitor.config.json
# Change: "version": "1.0.1"

# 2. Update version in android/app/build.gradle
# versionCode 2
# versionName "1.0.1"

# 3. Build new AAB
cd ~/Rakesh-work/guest-scanner/frontend
npm run build
npx cap sync android
cd android
./gradlew bundleRelease

# 4. Upload to Play Console
# Go to Production → Create new release
# Upload new AAB with release notes
```

---

## Common Issues

### "App not compatible with device"
- Ensure `minSdkVersion` in `build.gradle` is 22 or lower
- Check device supports required permissions

### "Signature verification failed"
- Make sure you're using the same signing key
- Check passwords are correct

### "Privacy policy URL required"
- Create a simple privacy policy
- Host on GitHub Pages or your website
- Update in Play Console

---

## Backup Your Signing Key

**CRITICAL:** Backup `gatherly-release-key.jks` and `key.properties`

```bash
# Copy to safe location
cp ~/Rakesh-work/guest-scanner/frontend/android/gatherly-release-key.jks ~/Documents/app-keys/
cp ~/Rakesh-work/guest-scanner/frontend/android/key.properties ~/Documents/app-keys/
```

**Store backups:**
- Cloud storage (Google Drive, iCloud)
- External hard drive
- Password manager (for passwords)

**If you lose the signing key, you CANNOT update your app ever again!**

---

## Quick Reference Commands

```bash
# Full deployment build
cd ~/Rakesh-work/guest-scanner/frontend
npm run build
npx cap sync android
cd android
./gradlew bundleRelease

# Find AAB
ls -lh app/build/outputs/bundle/release/

# Build debug APK for testing
./gradlew assembleDebug
```

---

## Resources

- [Play Console Help](https://support.google.com/googleplay/android-developer)
- [App Bundle Documentation](https://developer.android.com/guide/app-bundle)
- [Signing Guidelines](https://developer.android.com/studio/publish/app-signing)
