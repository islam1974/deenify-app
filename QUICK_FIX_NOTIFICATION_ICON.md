# Quick Fix: Replace Expo Go Logo in Notifications

## Problem
Your notifications still show the Expo Go logo instead of the Deenify logo.

## Solution

### Option 1: Use ImageMagick to Convert Icon (Recommended)

If you have ImageMagick installed:

```bash
# Convert to white monochrome
convert assets/images/Deenifylogo.png \
  -colorspace Gray \
  -negate \
  -resize 96x96 \
  android/app/src/main/res/drawable-mdpi/notification_icon.png

# Copy to all densities
cp android/app/src/main/res/drawable-mdpi/notification_icon.png android/app/src/main/res/drawable-hdpi/
cp android/app/src/main/res/drawable-mdpi/notification_icon.png android/app/src/main/res/drawable-xhdpi/
cp android/app/src/main/res/drawable-mdpi/notification_icon.png android/app/src/main/res/drawable-xxhdpi/
cp android/app/src/main/res/drawable-mdpi/notification_icon.png android/app/src/main/res/drawable-xxxhdpi/

# Rebuild
npx expo run:android
```

### Option 2: Use Online Tool (Easiest)

1. Go to: https://romannurik.github.io/AndroidAssetStudio/icons-notification.html
2. Upload your logo: `assets/images/Deenifylogo.png`
3. Adjust colors to white
4. Click "Download"
5. Extract the icons to:
   ```
   android/app/src/main/res/drawable-mdpi/notification_icon.png (24x24)
   android/app/src/main/res/drawable-hdpi/notification_icon.png (36x36)
   android/app/src/main/res/drawable-xhdpi/notification_icon.png (48x48)
   android/app/src/main/res/drawable-xxhdpi/notification_icon.png (72x72)
   android/app/src/main/res/drawable-xxxhdpi/notification_icon.png (96x96)
   ```
6. Rebuild: `npx expo run:android`

### Option 3: Use sips (Built into macOS)

```bash
# Convert to grayscale first
sips -s format png -s colorspace Gray assets/images/Deenifylogo.png --out /tmp/logo_gray.png

# Invert to make it white
sips -s format png -s colorspace Invert /tmp/logo_gray.png --out /tmp/logo_white.png

# Resize and copy
sips -z 96 96 /tmp/logo_white.png --out android/app/src/main/res/drawable-mdpi/notification_icon.png
sips -z 144 144 /tmp/logo_white.png --out android/app/src/main/res/drawable-hdpi/notification_icon.png
sips -z 192 192 /tmp/logo_white.png --out android/app/src/main/res/drawable-xhdpi/notification_icon.png
sips -z 288 288 /tmp/logo_white.png --out android/app/src/main/res/drawable-xxhdpi/notification_icon.png
sips -z 384 384 /tmp/logo_white.png --out android/app/src/main/res/drawable-xxxhdpi/notification_icon.png

# Rebuild
npx expo run:android
```

### Why Is It Showing Expo Go Logo?

The notification icon needs to be:
- ✅ White/silhouette only (monochrome)
- ✅ Simple design
- ❌ NOT full-color

Your current icon is the full-color version, which Android can't display properly in the notification bar.

