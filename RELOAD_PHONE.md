# Get latest app on your physical phone (when simulator is updated)

If the **simulator** shows the new UI but your **phone** does not, the phone is loading an old cached bundle. Do this:

## 1. Same Metro, one device at a time (recommended)

- **Stop the simulator** (close the simulator app or stop the iOS sim).
- In terminal, **restart Metro with a clean cache**:
  ```bash
  npx expo start --clear
  ```
- On your **phone**: fully **close the Deenify app** (swipe it away from app switcher).
- **Open Deenify** on the phone again so it connects to Metro and downloads the new bundle.
- You should see **"Mosque Finder"** with a small **"• latest"** under it (in dev), and radius options **0 mi (here), 1 mi, 2 mi, 5 mi, 10 mi, 15 mi, 20 mi**.

## 2. If you use Expo Go

- Make sure the phone is on the **same Wi‑Fi** as your Mac.
- In Metro terminal, press **`s`** to switch to Expo Go and scan the QR code again with your phone (or open the project URL manually in Expo Go).
- Then **close Expo Go completely** and reopen it, then open the Deenify project again.

## 3. If you use a development build (expo-dev-client)

- **Kill the app** on the phone (remove from app switcher).
- Restart Metro: `npx expo start --clear`.
- Reopen the app on the phone. If it still shows old UI, try **shake → Reload** or **Clear app data** (Android) / **delete and reinstall** the dev build (iOS) so it doesn’t use a cached bundle.

## Check it worked

- Open **Mosque Finder** on the phone.
- You should see **"• latest"** under the title (dev only) and **"0 mi (here)"** as the first radius option. If you see those, the phone is on the new bundle.
