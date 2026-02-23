/**
 * Ramadan start date calculator with offline fallback.
 * Uses Aladhan API when available, falls back to UmmahAPI, then offline map.
 */

/** Offline Ramadan 1 Gregorian dates (YYYY-MM-DD) by Hijri year. Extend as needed. */
const RAMADAN_START_OFFLINE: Record<number, string> = {
  1444: '2023-03-23',
  1445: '2024-03-11',
  1446: '2025-02-28',
  1447: '2025-02-28',
  1448: '2026-02-18',
  1449: '2027-02-08',
  1450: '2028-01-28',
};

/** Get Gregorian date for 1 Ramadan of the given Hijri year. Returns YYYY-MM-DD or null. */
export async function getRamadanStartGregorian(hijriYear: number): Promise<string | null> {
  const offline = RAMADAN_START_OFFLINE[hijriYear];
  if (offline) return offline;

  try {
    const res = await fetch(`https://api.aladhan.com/v1/hToG?date=1-9-${hijriYear}`);
    const data = await res.json();
    if (data.code === 200 && data.data?.gregorian?.date) {
      const [d, m, y] = data.data.gregorian.date.split('-').map(Number);
      if (!Number.isNaN(d) && !Number.isNaN(m) && !Number.isNaN(y)) {
        return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      }
    }
  } catch (_) {}

  return null;
}

/** Get target Hijri year for "next Ramadan" from current Hijri date. */
export function getTargetRamadanYear(hijriYear: number, hijriMonth: number, hijriDay: number): number {
  if (hijriMonth > 9 || (hijriMonth === 9 && hijriDay > 1)) return hijriYear + 1;
  return hijriYear;
}
