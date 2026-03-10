# Final Pre-Release Checks

## Compass / Qibla ✓

### Implementation
- **Magnetometer:** Uses `expo-sensors` Magnetometer for device heading
- **Qibla calculation:** Forward azimuth formula (spherical trig) — works globally
- **Distance:** Haversine formula for km to Makkah
- **Smoothing:** Exponential smoothing (alpha 0.3) to reduce jitter
- **Alignment:** Haptic feedback when aligned (±5°)

### Fixes applied
- Replaced missing `Mecca.png` with `IconSymbol` (building.columns.fill) — no crash

### Known limitations
- **Magnetic declination:** Compass uses a fixed calibration offset (-3°). True magnetic declination varies by location (e.g. ~-10° UK, +15° in parts of US). For higher accuracy, consider integrating a declination API based on user location.
- **Device support:** Some devices lack a magnetometer; the app shows an alert and displays direction without rotation.
- **Interference:** Metal objects and electronics can affect compass readings.

### Manual test checklist
- [ ] Open Qibla screen — compass loads, no crash
- [ ] Rotate device — compass rotates smoothly
- [ ] Align with Qibla — haptic fires, "Aligned with Qibla ✓" shows
- [ ] Location displayed correctly
- [ ] Distance to Makkah shown

---

## Prayer Times ✓

### Implementation
- **Primary:** Aladhan API (api.aladhan.com) — supports 15+ calculation methods
- **Fallback 1:** UmmahAPI
- **Fallback 2:** Offline `adhan` library (batoulapps)
- **Methods:** MWL, ISNA, UmmAlQura, Karachi, Egyptian, Tehran, Kuwait, Qatar, Singapore, France, Turkey, Russia, Dubai, Morocco, Tunisia, Algeria
- **Madhab:** Hanafi and Shafi (Standard)
- **Coordinates:** Validated (lat -90 to 90, lon -180 to 180)
- **Caching:** 30 min TTL to reduce API calls
- **Time format:** API returns 24h; converted to 12h for display

### Fixes applied
- **formatTime():** Added null/invalid checks, NaN handling, bounds clamping

### Global coverage
- Aladhan and UmmahAPI work for any coordinates worldwide
- Offline adhan library works for any lat/lon
- Timezone handled by APIs (Aladhan returns times in location's timezone)
- DST detection for device timezone

### Manual test checklist
- [ ] UK/Europe — verify times match local mosque
- [ ] Middle East — verify times
- [ ] Americas — verify times
- [ ] Asia/Australia — verify times
- [ ] High-latitude (e.g. Scandinavia) — extreme angles handled
- [ ] Airplane mode — offline fallback works
- [ ] Date picker — past/future dates work
- [ ] Calculation method change — times update
- [ ] Madhab change — Asr time differs (Hanafi vs Shafi)

---

## Recommended manual tests

1. **Compass:** Run on a real device (simulator has no magnetometer). Hold flat, rotate, verify alignment.
2. **Prayer times:** Test in 2–3 different locations (or use manual location entry) and compare with a known source.
3. **Offline:** Enable airplane mode, confirm prayer times still load from cache or offline calculation.
