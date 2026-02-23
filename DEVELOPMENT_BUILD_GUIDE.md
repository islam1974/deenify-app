# 📱 Development Build Guide

## ⭐ Test Before TestFlight (iOS)

**You must use a Development Build to test features like background audio, lock screen playback, and notifications** — these don't work in Expo Go.

### Step 1 — Install expo-dev-client ✅

```bash
npx expo install expo-dev-client
```

### Step 2 — Build a custom development build (iOS)

**On a Mac (local build):**
```bash
npx expo run:ios
```

**Or cloud build (EAS):**
```bash
eas build --profile development --platform ios
```

### Step 3 — Install the Dev Build on your device

- **Local build:** The app installs automatically on your connected iPhone or simulator
- **EAS build:** Use the link or QR code Expo provides to install on your device

This creates an "Expo Dev" or "Deenify" app with your custom native modules included.

### Step 4 — Run your app inside the custom Dev Client

```bash
npx expo start --dev-client
```

Scan the QR code or press `i` to open on iOS. Your app will launch with:

- ✅ Background audio working
- ✅ Lock screen controls working
- ✅ Headset controls working
- ✅ No native module errors
- ✅ Proper logs for debugging

**This is exactly how your app will behave on TestFlight.**

---

## Quick Answer: How to Build a Development Build

### For Android (Simplest Method)

```bash
npx expo run:android
```

This command will:
1. ✅ Build your app locally
2. ✅ Include all custom icons (including notification icons)
3. ✅ Install it on your connected Android device/emulator
4. ✅ Start the Metro bundler automatically

### Prerequisites

**For Android Emulator:**
- Android Studio installed
- An Android Virtual Device (AVD) created and running
- OR a physical Android device connected via USB with USB debugging enabled

**For Physical Device:**
1. Connect your Android phone via USB
2. Enable Developer Options:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
3. Enable USB Debugging:
   - Go to Settings → Developer Options
   - Turn on "USB Debugging"
4. Allow USB Debugging when prompted on your phone

### Steps

1. **Make sure you're in the project directory:**
   ```bash
   cd "/Users/suhelislam/Desktop/My Apps/Deenify App/deenify-app"
   ```

2. **Start the build:**
   ```bash
   npx expo run:android
   ```

3. **First time may take 5-10 minutes** (downloading dependencies, compiling)

4. **The app will automatically install and launch** on your device/emulator

5. **Test notifications:**
   - Go to Settings → Prayer Notifications
   - Tap "Test Notification"
   - You should see the **Deenify logo** (not Expo Go logo)! 🎉

---

## Method 2: EAS Build (Cloud Build)

If you prefer cloud builds or need iOS builds:

### Setup EAS (First Time Only)

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Configure EAS:**
   ```bash
   eas build:configure
   ```

4. **Build for Android:**
   ```bash
   eas build --platform android --profile development
   ```

5. **Download and install** the APK when build completes

---

## Troubleshooting

### "No devices/emulators found"
- Make sure Android emulator is running, OR
- Physical device is connected and USB debugging is enabled
- Check with: `adb devices`

### "Build failed"
- Make sure you have Android Studio installed
- Run: `npx expo prebuild --clean` first
- Check if all dependencies are installed: `npm install`

### Still seeing Expo Go logo?
- Make sure you're running the development build (from `npx expo run:android`)
- NOT using Expo Go app
- The app name should be "Deenify", not "Expo Go"

---

## What's Different from Expo Go?

| Feature | Expo Go | Development Build |
|---------|---------|-------------------|
| Custom notification icons | ❌ No | ✅ Yes |
| Custom splash screens | ❌ Limited | ✅ Full control |
| Native modules | ❌ Limited | ✅ All supported |
| App name | "Expo Go" | "Deenify" |
| App icon | Expo logo | Your Deenify logo |

---

## Next Steps After Building

1. ✅ Test notifications - should show Deenify logo
2. ✅ Test all app features
3. ✅ Make changes to code (hot reload works!)
4. ✅ Rebuild when you change native code (icons, permissions, etc.)

---

## Quick Commands Reference

```bash
# Build and run on Android
npx expo run:android

# Build and run on iOS (if on Mac)
npx expo run:ios

# Start Metro bundler only
npx expo start

# Clean and rebuild
npx expo prebuild --clean
npx expo run:android
```

