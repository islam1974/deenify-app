# API & Third-Party Credits

Deenify uses the following APIs and services. This document summarizes usage and attribution requirements for copyright compliance.

---

## Prayer Times & Islamic Calendar

### Aladhan API (api.aladhan.com)
- **Used for:** Prayer times, Gregorian-to-Hijri date conversion
- **Attribution:** Islamic Network. Credit: [aladhan.com](https://aladhan.com)
- **Terms:** [aladhan.com/credits-and-terms](https://aladhan.com/credits-and-terms)
- **Note:** Calculations based on praytimes.org (Hamid Zarrabi-Zadeh)

### UmmahAPI (ummahapi.com)
- **Used for:** Prayer times and Hijri dates (fallback)
- **Attribution:** Credit UmmahAPI for fallback prayer/timezone data

### adhan (npm package)
- **Used for:** Local prayer time calculations (batoulapps/Adhan)
- **Attribution:** [github.com/batoulapps/Adhan](https://github.com/batoulapps/Adhan)
- **License:** MIT

---

## Quran

### fawazahmed0/quran-api
- **Used for:** Quran text (Arabic), translations
- **Attribution:** [github.com/fawazahmed0/quran-api](https://github.com/fawazahmed0/quran-api)
- **License:** Unlicense (public domain)

### everyayah.com
- **Used for:** Quran audio recitations (streamed)
- **Attribution:** [everyayah.com](https://www.everyayah.com/)
- **Note:** All rights remain with the original reciters (Alafasy, Husary, Abdul Basit, etc.)

---

## Hadith

### Hadith API (hadithapi.com)
- **Used for:** Hadith collections
- **Attribution:** [hadithapi.com](https://hadithapi.com)
- **Terms:** Free API service; requires API key

---

## Mosque Finder

### Overpass API (OpenStreetMap)
- **Used for:** Mosque/place data via Overpass queries
- **Endpoints:** overpass-api.de, overpass.kumi.systems
- **Attribution:** © OpenStreetMap contributors
- **Terms:** [openstreetmap.org/copyright](https://www.openstreetmap.org/copyright)
- **License:** ODbL (Open Database License)

### Google Maps (react-native-maps)
- **Used for:** Map display on Android
- **Attribution:** Built-in by Google Maps SDK; comply with [Google Maps Platform Terms](https://cloud.google.com/maps-platform/terms)

---

## Prayer Reminders

### islamcan.com (optional)
- **Used for:** Reminder notification sound (if enabled)
- **Attribution:** Audio from islamcan.com

---

## In-App Credit Requirements

The About screen must credit:
1. **Quran text:** fawazahmed0/quran-api (with link)
2. **Quran audio:** everyayah.com (with link); note reciter rights
3. **Prayer times:** Aladhan API (with link)
4. **Hadith:** Hadith API (hadithapi.com)
5. **Mosque data:** OpenStreetMap / Overpass API
6. **Prayer calculations:** adhan library (batoulapps)

---

*Last updated: February 2025*
