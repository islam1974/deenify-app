# Fix Notification Icon - Expo Go Logo Issue

## Problem
You're seeing the Expo Go logo in prayer notifications instead of the Deenify logo.

## Solution

### For Android
Android requires a **white/silhouette** icon for notifications, not a colored one. The icon must be:
- White or transparent
- Simple design
- Look good as a monochrome icon

### Steps to Fix:

1. **Create a white notification icon**:
   - Go to: https://romannurik.github.io/AndroidAssetStudio/icons-notification.html
   - Upload your Deenify logo (`assets/images/Deenifylogo.png`)
   - Generate the white notification icons
   - Download the generated icons

2. **Replace the notification icons**:
   Place the generated notification icons in:
   ```
   android/app/src/main/res/drawable-mdpi/notification_icon.png (24x24)
   android/app/src/main/res/drawable-hdpi/notification_icon.png (36x36)
   android/app/src/main/res/drawable-xhdpi/notification_icon.png (48x48)
   android/app/src/main/res/drawable-xxhdpi/notification_icon.png (72x72)
   android/app/src/main/res/drawable-xxxhdpi/notification_icon.png (96x96)
   ```

3. **Rebuild the app**:
   ```bash
   npx expo run:android
   ```

### Quick Alternative (Use App Icon)
The app is already configured to use the monochrome app icon (`android-icon-monochrome.png`). After rebuilding, it should automatically use your Deenify logo instead of the Expo Go logo.

### For iOS
iOS uses the app icon automatically for notifications. No additional configuration needed.

## Current Status
✅ Notification configuration updated in `app.json`
✅ Notification icons copied to Android drawable folders
✅ Service updated to use the icon

**Next Step**: Rebuild the app to see the changes

```bash
npx expo run:android
```

