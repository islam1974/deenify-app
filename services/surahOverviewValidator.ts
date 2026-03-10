/**
 * Validates surah overview text against content constraints:
 * - 3–6 sentences
 * - 120–220 words
 * - No banned phrases (legal rulings, sectarian language, asbab al-nuzul, etc.)
 */

const MIN_SENTENCES = 3;
const MAX_SENTENCES = 6;
const MIN_WORDS = 120;
const MAX_WORDS = 220;

/** Phrases that indicate content outside the allowed scope */
const BANNED_PHRASES = [
  /\bthis proves\b/i,
  /\bthis verse proves\b/i,
  /\bverses? prove\b/i,
  /\baccording to (the )?(hanafi|shafi'i|maliki|hanbali|ja'fari)\b/i,
  /\b(halal|haram|wajib|mustahabb|makruh|mubah)\b/i,
  /\b(sunnis?|shi'?ites?|sufis?|salafis?)\b/i,
  /\basbab al-?nuzul\b/i,
  /\boccasion( of )?revelation\b/i,
  /\brevealed (when|because|after)\b/i,
  /\b(imam|scholar) (ibn|al-|ibn al-)/i,
  /\b(said|stated|held|ruled) that\s+\w+\s+(is )?(halal|haram|obligatory)/i,
  /\b(ibn taymiyyah|ibn kathir|al-bukhari|muslim|at-tabari)\b/i,
];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function countSentences(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  // Split on sentence-ending punctuation, filter empty
  const parts = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  return parts.length;
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter((w) => w.length > 0).length;
}

/**
 * Validates overview text against constraints.
 */
export function validateOverviewText(text: string): ValidationResult {
  const errors: string[] = [];

  const sentenceCount = countSentences(text);
  if (sentenceCount < MIN_SENTENCES) {
    errors.push(`Must have at least ${MIN_SENTENCES} sentences (found ${sentenceCount}).`);
  }
  if (sentenceCount > MAX_SENTENCES) {
    errors.push(`Must have at most ${MAX_SENTENCES} sentences (found ${sentenceCount}).`);
  }

  const wordCount = countWords(text);
  if (wordCount < MIN_WORDS) {
    errors.push(`Must have at least ${MIN_WORDS} words (found ${wordCount}).`);
  }
  if (wordCount > MAX_WORDS) {
    errors.push(`Must have at most ${MAX_WORDS} words (found ${wordCount}).`);
  }

  for (const pattern of BANNED_PHRASES) {
    if (pattern.test(text)) {
      errors.push(`Contains disallowed phrase or content.`);
      break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export { countSentences, countWords };
