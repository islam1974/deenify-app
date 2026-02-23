# Quran Audio APIs for Mobile Apps

This document summarizes the three main professional-grade aggregators for Quran recitation audio and how Deenify uses them safely.

---

## 1. MP3Quran.net API — Best for volume

- **Reciter count:** 200+ (largest library; many narrations/Rewayat).
- **Copyright:** Non-profit "Waqf" (endowment). Audio provided "in the hope it will be useful." They have implicit permission to distribute for Dawah; reciters’ rights remain with them.
- **Use case:** Maximum reciter choice and diversity.
- **Developer:** [MP3Quran API Documentation](https://mp3quran.net/api) — use API to fetch reciters and direct MP3 links.

---

## 2. Al-Quran Cloud (Islamic Network) — Best for structure

- **Reciter count:** 70+ (e.g. Al-Afasy, Al-Shatri, Sudais).
- **Copyright:** Terms state: *"All audio files used on this website and third-party libraries own and retain their respective copyrights."*
- **Safety:** Suitable for free apps. If you monetize, risk is generally low **as long as you stream** from their servers (do not package MP3s in the app).
- **Use case:** Modern REST API, good JSON structure for React Native / Expo.
- **Example:** `https://api.alquran.cloud/v1/edition?format=audio&type=versebyverse`

---

## 3. EveryAyah.com — Best for verse-by-verse highlighting

- **Reciter count:** 60+ with **verse-level timing data**.
- **Copyright:** Public-service project; widely used in open-source apps (e.g. Quran.com Android/iOS).
- **Use case:** When you need audio to follow the text (verse-by-verse highlighter).
- **Access:** Predictable URL structure; can use their Audio Gallery and URLs for streaming.

---

## Comparison

| API              | Reciters | Best for                          |
|------------------|----------|-----------------------------------|
| **MP3Quran**     | 200+     | Most diversity (narrations)      |
| **Al-Quran Cloud** | 70+    | Best JSON/React Native integration |
| **EveryAyah**    | 60+      | Verse-by-verse timing (highlighter) |

---

## Three rules for legal safety (including monetization)

1. **Don’t bundle**  
   Do **not** ship MP3 files inside the app. That makes you a distributor of copyrighted content.

2. **Stream only**  
   Always play from the API/CDN URLs. The user is effectively “listening on the web,” which is much lower liability.

3. **Credit the source**  
   In Settings/About, state clearly:  
   *"Audio files provided by [API Name]. All rights remain with the original reciters."*

---

## Deenify’s current setup

- **Audio:** Streamed from URLs (everyayah.com and/or other APIs). No MP3s are bundled in the app.
- **Credits:** About screen should credit the audio provider(s) and state that rights remain with the reciters. See `docs/AL_QURAN_CLOUD_COPYRIGHT.md` and app About screen for exact wording.

When adding or changing an audio source, keep using **stream-only**, **no bundling**, and **clear attribution**.
