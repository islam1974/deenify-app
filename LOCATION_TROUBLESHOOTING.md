# 🗺️ Location Error Troubleshooting Guide

## Quick Diagnostic Steps

### 1. Check Device Settings

**iOS:**
1. Settings → Privacy & Security → Location Services → **ON**
2. Settings → Privacy & Security → Location Services → **Deenify** → "While Using the App"
3. Make sure you're not in Airplane Mode
4. Try toggling Location Services off and on

**iOS Simulator:**
- If testing on simulator: Features → Location → **Apple** (or Custom Location)
- Simulator location can be unreliable - test on a real device

### 2. Check App Permissions

1. Open Deenify
2. When prompted for location permission, tap **Allow While Using App**
3. If you previously denied permission:
   - iOS: Settings → Deenify → Location → "While Using the App"

### 3. Common Error Messages & Solutions

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Location permission denied" | User denied location access | Go to Settings → Deenify → Location → Allow |
| "Location services are disabled" | Device location is OFF | Settings → Privacy → Location Services → ON |
| "Location request timed out" | GPS signal weak or unavailable | Move outdoors or near a window, try again |
| "Failed to get location" | Generic error | Check all settings above, restart app |

### 4. In-App Debugging

Open the app and check the console logs for these messages:

```
🔄 Location enabled but no location data, requesting...
📍 Requesting current position...
📍 Raw GPS data received: { latitude: X, longitude: Y }
📍 Location fetched: { city, country }
```

Or error messages:
```
❌ Location permission denied
❌ Location services are disabled
Error getting location: [error details]
```

## Manual Location Entry (Workaround)

If location isn't working, you can enter your location manually:

1. Open Deenify
2. Go to **Settings** (from drawer menu)
3. Find "Location Services" section
4. Toggle "Use Device Location" to **OFF**
5. Enter your city and country manually
6. Prayer times will calculate based on your manual location

## Specific Issues & Fixes

### Issue: "Error getting location" on iOS Simulator

**Cause:** iOS Simulator requires manual location setup

**Fix:**
1. In Xcode: Debug → Location → **Apple** or **Custom Location**
2. Or in Simulator menu: Features → Location → **City Run**
3. Better: Test on a real device

### Issue: Location works once, then fails

**Cause:** Cached location expired or permission changed

**Fix:**
1. Force quit the app
2. Reopen Deenify
3. Grant permission again if prompted
4. Or use manual location entry

### Issue: "Location request timed out"

**Cause:** Poor GPS signal or network issue

**Fix:**
1. Make sure you're connected to WiFi or cellular
2. Go outdoors or near a window
3. Wait 30 seconds for GPS to acquire signal
4. Try again

### Issue: Permission granted but still getting error

**Cause:** Location services disabled at system level

**Fix:**
1. Settings → Privacy & Security → Location Services → **ON** (master switch)
2. Settings → Privacy & Security → Location Services → Deenify → "While Using the App"
3. Restart the app

## Developer Debugging

If you're developing/testing, here's how to debug:

### Enable Console Logging

Run the app with:
```bash
npx expo start
# Then press 'i' for iOS or 'a' for Android
```

Watch for location-related logs in the console.

### Test Location Flow

1. Uninstall the app completely
2. Reinstall
3. Watch console logs during first launch
4. Note exactly when/where the error occurs

### Check Info.plist (iOS)

Verify these keys exist in `ios/Deenify/Info.plist`:
- `NSLocationWhenInUseUsageDescription` ✅ (already configured)
- `NSLocationAlwaysAndWhenInUseUsageDescription` ✅ (already configured)

### Check AndroidManifest.xml (Android)

Verify these permissions exist:
- `ACCESS_FINE_LOCATION` ✅ (already configured)
- `ACCESS_COARSE_LOCATION` ✅ (already configured)

## Code-Level Issues

### Potential Fixes Applied

The following improvements were made to `contexts/LocationContext.tsx`:

1. ✅ Timeout set to 10 seconds (was causing hangs)
2. ✅ Accuracy changed to "Balanced" (more reliable than "High")
3. ✅ Accepts location up to 60 seconds old (maximumAge)
4. ✅ Fallback to "Unknown City" if geocoding fails
5. ✅ Detailed error messages for different failure scenarios

### Location Flow

1. App loads → `LocationProvider` initializes
2. Checks if location enabled in settings
3. If enabled but no saved location → requests location
4. Requests permission → `requestForegroundPermissionsAsync()`
5. Checks if location services enabled → `hasServicesEnabledAsync()`
6. Gets current position → `getCurrentPositionAsync()`
7. Reverse geocodes → `reverseGeocodeAsync()`
8. Saves location to AsyncStorage

Any failure in steps 4-7 will show an error.

## Still Having Issues?

### Option 1: Reset Location Settings

```bash
# iOS: Delete app data
# Settings → General → iPhone Storage → Deenify → Delete App
# Then reinstall from TestFlight/App Store

# Or programmatically:
# In the app, go to Settings → Clear all data (if available)
```

### Option 2: Use Manual Location

This is the most reliable option if GPS continues to fail:

1. Disable "Use Device Location" in Settings
2. Enter your city manually
3. Prayer times will still be accurate

### Option 3: Check for iOS Updates

Sometimes location services are buggy on certain iOS versions. Update to the latest iOS if available.

## Reporting the Issue

If none of the above work, please provide:

1. **Device:** iPhone/iPad model and iOS version
2. **Exact error message:** Screenshot or copy the text
3. **When it occurs:** First launch? After denying permission? After granting?
4. **Console logs:** If possible, run with `npx expo start` and copy location-related logs
5. **Steps to reproduce:** Exact steps that lead to the error

## Quick Fixes Summary

| Problem | Quick Fix |
|---------|-----------|
| Permission denied | Settings → Deenify → Location → Allow |
| Services disabled | Settings → Location Services → ON |
| Timeout | Go outdoors, wait, retry |
| Simulator issues | Use real device |
| Persistent issues | Use manual location entry |

---

**Most Common Solution:** 
Go to **Settings → Deenify → Location** and ensure it's set to **"While Using the App"** or **"Always"** (not "Never" or "Ask Next Time").

**Best Workaround:**
Use manual location entry in app Settings if GPS continues to fail.

