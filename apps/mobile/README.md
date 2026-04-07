# Intemso Mobile App (Android)

## Setup

```bash
cd apps/mobile
npm install
```

## Development

```bash
npx expo start
```

Scan the QR code with Expo Go on your Android device.

## Build APK

### Option 1: EAS Build (cloud, recommended)

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build -p android --profile preview
```

The APK will be available for download from the Expo dashboard.

### Option 2: Local Build

```bash
# Prebuild native project
npx expo prebuild --platform android

# Build APK with Gradle
cd android
./gradlew assembleRelease
```

The APK will be at `android/app/build/outputs/apk/release/app-release.apk`.

## Asset Generation

Before building, generate the app icons and splash screen:

1. Place a 1024x1024 icon at `assets/icon.png`
2. Place a 1024x1024 adaptive icon at `assets/adaptive-icon.png` (foreground with transparent padding)
3. Place a 1284x2778 splash image at `assets/splash.png`

You can use https://icon.kitchen or Figma to generate these.

## Architecture

- **src/lib/api.ts** - API client (mirrors web's api-client package, uses SecureStore for tokens)
- **src/lib/storage.ts** - Secure token storage using expo-secure-store
- **src/context/AuthContext.tsx** - Authentication state management
- **src/navigation/AppNavigator.tsx** - Tab navigation + screen routing
- **src/screens/** - All app screens
- **src/components/** - Reusable UI components
- **src/theme/** - Colors, spacing, typography constants

## Features

- Login/Register (email + Ghana Card)
- Browse gigs with category filters
- Search gigs
- Gig detail view with Easy Apply
- Messages with real-time polling
- Notifications with unread count badge
- Profile with wallet balance + stats
- Pull-to-refresh on all list screens
- Infinite scroll pagination
- Secure token storage (expo-secure-store)
- Auto token refresh on 401
