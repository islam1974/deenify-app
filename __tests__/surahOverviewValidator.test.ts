import {
  validateOverviewText,
  countSentences,
  countWords,
} from '../services/surahOverviewValidator';

describe('countSentences', () => {
  it('returns 0 for empty string', () => {
    expect(countSentences('')).toBe(0);
  });
  it('counts sentences ending with . ! ?', () => {
    expect(countSentences('One. Two. Three.')).toBe(3);
    expect(countSentences('One! Two? Three.')).toBe(3);
  });
  it('ignores multiple consecutive punctuation', () => {
    expect(countSentences('One... Two!!')).toBe(2);
  });
});

describe('countWords', () => {
  it('returns 0 for empty string', () => {
    expect(countWords('')).toBe(0);
  });
  it('counts space-separated words', () => {
    expect(countWords('one two three')).toBe(3);
  });
  it('handles multiple spaces', () => {
    expect(countWords('one   two   three')).toBe(3);
  });
});

describe('validateOverviewText', () => {
  const validOverview =
    'First sentence with enough content to start the overview and set the tone for the reader as they approach the text. Second sentence continues the theme and adds depth for the reader to consider as they reflect on what follows. Third sentence provides more context and helps build understanding of the main ideas presented in the surah. Fourth sentence rounds out the main points in a clear and accessible way that invites contemplation and deeper engagement. Fifth sentence completes the paragraph with sufficient word count to meet the minimum requirement. Sixth sentence ensures we are well within the allowed range and provides a fitting conclusion to this thematic overview for general understanding and thoughtful, attentive reflection before reading the verses.';

  it('passes for valid overview (3–6 sentences, 120–220 words)', () => {
    const result = validateOverviewText(validOverview);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails when too few sentences', () => {
    const text = 'One sentence. Two sentences.';
    const result = validateOverviewText(text);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('at least 3 sentences'))).toBe(true);
  });

  it('fails when too many sentences', () => {
    const text =
      'A. B. C. D. E. F. G. '.repeat(20) +
      'More words to reach minimum word count for testing validation rules.';
    const result = validateOverviewText(text);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('at most 6 sentences'))).toBe(true);
  });

  it('fails when too few words', () => {
    const text =
      'Short. Overview. Here.';
    const result = validateOverviewText(text);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('words'))).toBe(true);
  });

  it('fails when too many words', () => {
    const long =
      'Word '.repeat(250);
    const result = validateOverviewText(long);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('at most 220 words'))).toBe(true);
  });

  it('fails on banned phrase "this proves"', () => {
    const text =
      validOverview + ' This proves the point.';
    const result = validateOverviewText(text);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('disallowed'))).toBe(true);
  });

  it('fails on legal/fiqh term "halal"', () => {
    const text =
      validOverview + ' The ruling is halal.';
    const result = validateOverviewText(text);
    expect(result.valid).toBe(false);
  });

  it('all 114 surah overviews in assets pass validation', () => {
    const dataset = require('../assets/surah_overviews.json') as Record<string, { overview: string }>;
    const errors: string[] = [];
    for (let i = 1; i <= 114; i++) {
      const key = String(i);
      const entry = dataset[key];
      if (!entry?.overview?.trim()) {
        errors.push(`Surah ${key}: missing overview`);
        continue;
      }
      const result = validateOverviewText(entry.overview);
      if (!result.valid) {
        errors.push(`Surah ${key}: ${result.errors.join('; ')}`);
      }
    }
    expect(errors).toEqual([]);
  });
});
