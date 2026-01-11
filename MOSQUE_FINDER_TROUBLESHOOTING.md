# 🕌 Mosque Finder Error Troubleshooting

## Common Error: "Error fetching maps" / "Failed with API"

### Quick Fixes (Try These First)

#### 1. Check Internet Connection
- Make sure your Android device has **active internet** (WiFi or Mobile Data)
- Test by opening a browser on the device
- The mosque finder requires internet to fetch mosque data

#### 2. Check Location Permission
- Settings → Apps → Expo Go (or Deenify) → Permissions → Location → **Allow**
- The app needs location to find nearby mosques

#### 3. Reload the App
**On Android Device:**
- **Shake the phone** to open dev menu
- Tap **"Reload"**
- OR close Expo Go completely and reopen

#### 4. Check Console Logs
Look in the terminal for these messages:
```
🔍 Trying Overpass API: https://overpass-api.de/...
📡 Response status: 200
✅ Successfully fetched mosques: 15
```

Or error messages:
```
❌ Failed with https://overpass-api.de/...: Network request failed
❌ Final error: Unable to fetch mosques
```

## What the Mosque Finder Uses

### API: Overpass API (OpenStreetMap)
- **Free** - No API key required
- **Multiple servers** for redundancy:
  1. overpass-api.de
  2. overpass.kumi.systems
  3. overpass.openstreetmap.ru

### How It Works:
1. Gets your location (GPS)
2. Queries OpenStreetMap for mosques within radius
3. Shows results on map
4. Lists mosques sorted by distance

## Common Issues & Solutions

### Issue: "Network request failed"
**Cause:** No internet connection or API is blocked

**Solutions:**
1. Check internet connection
2. Try switching between WiFi and Mobile Data
3. Check if your network blocks certain APIs
4. Wait a few minutes and try again (API might be temporarily down)

### Issue: "All API servers failed"
**Cause:** All 3 Overpass servers are unavailable

**Solutions:**
1. **Wait 5-10 minutes** - Servers might be under maintenance
2. **Check internet** - Make sure you're connected
3. **Try different network** - Switch from WiFi to mobile data
4. **Retry** - Pull down to refresh in the app

### Issue: "Error getting location"
**Cause:** Location permission denied or GPS unavailable

**Solutions:**
1. Go to Settings → Apps → Location → Allow
2. Make sure Location Services are ON
3. Try outdoors (better GPS signal)
4. Restart the app

### Issue: Map shows but no mosques
**Cause:** No mosques in the selected radius

**Solutions:**
1. **Increase the search radius** - Tap the radius selector (1, 2, 5, 10, 15, 20 miles)
2. You might be in an area with sparse mosque data
3. The data comes from OpenStreetMap - it might not be complete in your area

## Technical Details

### API Query
The app searches for:
```
Places of worship with religion = "muslim"
Within X miles of your location
Sorted by distance
```

### Timeout Settings:
- Each API server: 30 seconds timeout
- Small delay between server attempts: 500ms
- Total possible wait: ~90 seconds for all 3 servers

### Permissions Required:
- **Location**: To get your coordinates
- **Internet**: To fetch mosque data from APIs

## Alternative Solutions

### If Mosque Finder Continues to Fail:

**Option 1: Use Google Maps Directly**
The mosque finder has a fallback - you can manually:
1. Open Google Maps
2. Search "mosques near me"
3. Get directions

**Option 2: Manual Mosque List**
Consider adding popular mosques in your area manually (future feature)

## Developer Debugging

### Check Network Connectivity:
```bash
# In the app console, check for:
🔍 Trying Overpass API: [URL]
📡 Response status: 200 (good) or 4xx/5xx (error)
✅ Successfully fetched mosques: X
```

### Test API Manually:
Open this in a browser to test if Overpass API works:
```
https://overpass-api.de/api/status
```

Should show server status. If it loads, the API is working.

### Check Android Manifest:
Verify `android/app/src/main/AndroidManifest.xml` has:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

## Quick Test

**To verify it's working:**
1. Open Mosque Finder
2. Grant location permission if asked
3. Wait 10-15 seconds
4. Check console logs in terminal
5. If you see "✅ Successfully fetched mosques: X" - it's working!
6. If you see "❌ Failed with..." - there's a network/API issue

## Current Status

The mosque finder is configured to:
- ✅ Use free OpenStreetMap data (no API key needed)
- ✅ Try 3 different servers for redundancy
- ✅ Show helpful error messages
- ✅ Allow retry with pull-to-refresh
- ✅ Work offline (shows map but no mosques)

---

**Most Common Fix:** 
Just check your internet connection and try pulling down to refresh in the app! 🔄

