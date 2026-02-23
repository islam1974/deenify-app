/**
 * Engagement Copy Enforcement Layer
 * Tone is sacred. These rules are non-negotiable.
 */

/** Words/phrases that must never appear in Quran engagement UI copy. */
export const BANNED_WORDS = ['missed', 'failed', 'only', 'streak lost'] as const;

/** Safe fallback when banned content is detected. Prefer these instead. */
export const SAFE_ALTERNATIVES = [
  'You came back.',
  'You showed up.',
  'Still here.',
  "Whenever you're ready.",
] as const;

/**
 * Sanitize engagement copy. If any banned word is present, returns a safe alternative.
 * Call this on all user-facing engagement text before render.
 */
export function sanitizeEngagementCopy(text: string): string {
  const lower = text.toLowerCase();
  for (const banned of BANNED_WORDS) {
    if (lower.includes(banned)) {
      return SAFE_ALTERNATIVES[0]; // "You came back."
    }
  }
  return text;
}
