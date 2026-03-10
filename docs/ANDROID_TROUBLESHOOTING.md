# Android – Why the app may not work

Common causes and how to fix them.

---

## 1. Maps (Mosque Finder)

**No Google API key needed.** On Android the app uses **OpenStreetMap** tiles (same data as the Mosque Finder list). On iOS it uses **Apple Maps**. No API key is required on either platform.

---

## 2. Missing image assets

**Symptom:** App crashes on launch or when opening Home / Prayer times / other screens. Red screen or “Require unknown module” / asset errors.

**Cause:** Some screens use `require('@/assets/images/...')`. If a file is missing, the app can crash.

**Required under `assets/images/` (or equivalent):**

| File | Used in |
|------|--------|
| `Mecca.png` | Qibla screen |
| `Deenify (1).png` | App icon, adaptive icon |
| `Deenify_Icon.png` | Various |
| `prayer-times-icon.png` | Home, Prayer widget |
| `Deenifylogo.png` | Splash (AnimatedSplashScreen) |
| `Qibla.jpeg` | Home drawer |
| `Quran.png` | Home drawer |
| `Tasbih-icon.png` | Home drawer |
| `Duas.png` | Home drawer |
| `Hadith.png` | Home drawer |
| `android-icon-background.png` | Android adaptive icon (app.json) |
| `android-icon-monochrome.png` | Android notifications (app.json) |

**Fix:** Add any missing files under `assets/images/` (or the path your app uses). If you don’t have an image, you can temporarily use a copy of an existing one (e.g. `Deenify_Icon.png`) and rename it until you have the final asset.

---

## 3. New Architecture / Hermes

**Symptom:** Build fails or app crashes on startup with native or Hermes errors.

**Current setup:** `newArchEnabled=true`, `hermesEnabled=true` in the project.

**Fix:** If you see New Architecture or Hermes-related crashes, try turning the New Architecture off for Android:

- In **`android/gradle.properties`** set:
  ```properties
  newArchEnabled=false
  ```
- Clean and rebuild.

---

## 4. Run and debug on device

**USB debugging:**

```bash
npx expo run:android
```

**Check logs:**

```bash
adb logcat *:E
# or filter by your app
adb logcat | grep -i deenify
```

**EAS build:**

```bash
eas build --platform android --profile production
```

---

## Summary checklist

- [ ] **Images:** All required assets present under `assets/images/` (or your configured path)
- [ ] **Rebuild:** After changing native config, do a full clean build
- [ ] **Logs:** Use `adb logcat` to see the exact error when the app “doesn’t work”
