# Creating a Signed Release APK

## Prerequisites
You need a keystore file for signing your Android app. If you already have one, skip to step 2.

## Step 1: Configure Keystore Properties

Edit the file `frontend/android/keystore.properties` and update it with your keystore details:

```properties
# Path to your keystore file (can be relative to android/ directory or absolute)
storeFile=/path/to/your/keystore.jks

# Keystore password
storePassword=YOUR_KEYSTORE_PASSWORD

# Key alias
keyAlias=YOUR_KEY_ALIAS

# Key password  
keyPassword=YOUR_KEY_PASSWORD
```

**IMPORTANT:** 
- Keep this file secure and NEVER commit it to version control
- The file is already added to `.gitignore`

## Step 2: Set Environment Variables (Alternative Method)

Instead of using `keystore.properties`, you can also set environment variables in your `~/.gradle/gradle.properties`:

```properties
MYAPP_RELEASE_STORE_FILE=/path/to/your/keystore.jks
MYAPP_RELEASE_STORE_PASSWORD=your_keystore_password
MYAPP_RELEASE_KEY_ALIAS=your_key_alias
MYAPP_RELEASE_KEY_PASSWORD=your_key_password
```

## Step 3: Build the Signed Release APK

### Option A: Using Gradle Command
```bash
cd frontend/android
./gradlew assembleRelease
```

### Option B: Build from frontend directory
```bash
cd frontend
npx cap sync android
cd android
./gradlew assembleRelease
```

## Step 4: Find Your Signed APK

The signed release APK will be located at:
```
frontend/android/app/build/outputs/apk/release/app-release.apk
```

## Step 5: Build AAB for Play Store (Optional)

To build an Android App Bundle (AAB) for Google Play Store:

```bash
cd frontend/android
./gradlew bundleRelease
```

The AAB will be located at:
```
frontend/android/app/build/outputs/bundle/release/app-release.aab
```

## Verification

To verify your APK is signed correctly:

```bash
jarsigner -verify -verbose -certs app-release.apk
```

Or use `apksigner`:

```bash
apksigner verify --verbose app-release.apk
```

## Troubleshooting

### Error: "Keystore file not found"
- Check that the path in `keystore.properties` is correct
- Use absolute path if relative path doesn't work

### Error: "Incorrect keystore password"
- Verify your password in `keystore.properties`
- Make sure there are no extra spaces

### Error: "Key alias not found"
- List aliases in your keystore:
  ```bash
  keytool -list -v -keystore /path/to/your/keystore.jks
  ```

## Current Version
- **versionCode**: 14
- **versionName**: 1.4.0

Remember to increment these in `frontend/android/app/build.gradle` for each release!
