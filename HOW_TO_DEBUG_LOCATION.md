# How to Debug Location Error

## Quick Fix (Try This First!)

### On Real iPhone/iPad:
1. Open **Settings** on your device
2. Go to **Privacy & Security** → **Location Services**
3. Make sure **Location Services** is **ON** (master switch at top)
4. Scroll down to **Deenify**
5. Select **"While Using the App"** or **"Always"**
6. Go back to Deenify and pull down to refresh

### On iOS Simulator:
1. In Simulator menu: **Features** → **Location** → **Apple** (or Custom Location)
2. Or in Xcode: **Debug** → **Simulate Location** → **City Run**
3. Restart the app

## Use the Location Debugger (See Exact Problem)

I've created a debugging component for you. Here's how to add it:

### Step 1: Add to Home Screen (Easiest)

Open `app/(drawer)/index.tsx` and add this at the top with other imports:

```typescript
import LocationDebugger from '@/components/LocationDebugger';
```

Then add the component somewhere in the render (around line 400-500), for example after the header:

```typescript
<View style={[styles.container, { backgroundColor: colors.background }]}>
  <LocationDebugger />  {/* Add this line */}
  
  {/* Rest of your existing code */}
```

### Step 2: Run the App

```bash
npx expo start --clear
# Press 'i' for iOS
```

### Step 3: Check the Debug Info

You'll see a debug panel showing:
- ✅ or ❌ Permission status
- ✅ or ❌ Location services enabled
- Current location data
- Any error messages
- Buttons to request permission or refresh

### Step 4: Fix Based on What You See

| What the Debugger Shows | What to Do |
|------------------------|------------|
| Permission: "denied" | Settings → Deenify → Location → Allow |
| Services: "Disabled" | Settings → Location Services → ON |
| Error: "timeout" | Go outdoors, wait, try "Refresh Location" |
| Permission: "granted" but no location | Tap "Refresh Location" button |

## Alternative: Use Manual Location (No GPS Needed)

If GPS continues to fail, you can enter location manually:

1. Open **Settings** in Deenify
2. Find **"Use Device Location"** toggle
3. Turn it **OFF**
4. Enter your city and country manually
5. Prayer times will work perfectly without GPS!

## Common Issues & Solutions

### Issue: "Location permission denied"
**Fix:** Settings → Deenify → Location → "While Using the App"

### Issue: Works once, then fails
**Fix:** 
1. Force quit Deenify (swipe up from app switcher)
2. Reopen
3. Grant permission again if asked

### Issue: Simulator shows error
**Fix:** 
1. Simulator → Features → Location → Apple
2. Or test on real device (always more reliable)

### Issue: Still not working after all this
**Fix:** Use manual location entry (Settings → Disable "Use Device Location")

## Remove Debugger When Done

Once fixed, remove these lines from `app/(drawer)/index.tsx`:
```typescript
import LocationDebugger from '@/components/LocationDebugger';  // Remove this
<LocationDebugger />  // Remove this
```

## Need More Help?

Check `LOCATION_TROUBLESHOOTING.md` for comprehensive troubleshooting steps.

---

**TL;DR:**
1. Settings → Privacy → Location Services → ON
2. Settings → Privacy → Location Services → Deenify → "While Using the App"
3. Restart app
4. Or use manual location entry (no GPS needed)

