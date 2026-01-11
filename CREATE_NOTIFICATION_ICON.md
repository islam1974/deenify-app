# Create Proper Notification Icon - Step by Step

## The Problem
Your notification is showing Expo Go logo because Android requires a **white monochrome** icon, but you're using a colored logo.

## Quick Fix (5 minutes)

### Step 1: Generate the Icons Online
1. Go to: **https://romannurik.github.io/AndroidAssetStudio/icons-notification.html**
2. Click "**NOTIFICATION**" tab
3. Click "**CLIP ART**" 
4. Choose a simple icon OR upload your logo
5. For your Deenify logo:
   - Select "**Image**" tab
   - Upload: `assets/images/Deenifylogo.png`
   - Select "**Foreground**" color: WHITE
   - Select "**Background**" color: TRANSPARENT
6. Click "**DOWNLOAD**" button

### Step 2: Extract and Place Files
1. The download will be a zip file
2. Extract it
3. Copy these files from `res/drawable-{density}/` to your project:

```bash
# From the extracted zip:
res/drawable-mdpi/ic_stat_name.png  → android/app/src/main/res/drawable-mdpi/notification_icon.png
res/drawable-hdpi/ic_stat_name.png  → android/app/src/main/res/drawable-hdpi/notification_icon.png
res/drawable-xhdpi/ic_stat_name.png → android/app/src/main/res/drawable-xhdpi/notification_icon.png
res/drawable-xxhdpi/ic_stat_name.png → android/app/src/main/res/drawable-xxhdpi/notification_icon.png
res/drawable-xxxhdpi/ic_stat_name.png → android/app/src/main/res/drawable-xxxhdpi/notification_icon.png
```

### Step 3: Rebuild the App
```bash
npx expo run:android
```

### Step 4: Test
1. Open the app
2. Go to Settings → Prayer Notifications  
3. Tap "Test Notification"
4. The icon should now show your Deenify logo (white version)

---

## Alternative: Use Text-Based Icon (Fastest)

If you want to test quickly without design work:
1. Go to: https://romannurik.github.io/AndroidAssetStudio/icons-notification.html
2. Select "**CLIP ART**" tab
3. Search for "**crescent**" or "**moon**"
4. Pick a simple crescent moon icon
5. Download and replace files as above

This will give you a crescent moon icon in notifications which fits your Deenify theme!

