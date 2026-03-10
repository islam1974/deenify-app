/**
 * Loads and serves surah overviews from the local JSON dataset.
 * Overviews are thematic summaries for general understanding, not tafsir.
 */

import { validateOverviewText } from './surahOverviewValidator';

export interface SurahOverview {
  surahNumber: number;
  overview: string;
  isValid?: boolean;
}

type OverviewDataset = Record<string, { overview: string }>;

let cachedDataset: OverviewDataset | null = null;

async function loadDataset(): Promise<OverviewDataset> {
  if (cachedDataset) return cachedDataset;
  try {
    const asset = require('@/assets/surah_overviews.json');
    cachedDataset = (asset as OverviewDataset) || {};
  } catch {
    cachedDataset = {};
  }
  return cachedDataset;
}

const PLACEHOLDER_OVERVIEW =
  'A brief thematic overview for this surah will be added in a future update. You can read and reflect on the verses in the reader.';

/**
 * Returns the overview for a surah by number (1–114). Uses the dataset when available;
 * otherwise returns a placeholder so every surah has an overview.
 * Validates the overview text; invalid entries are still returned but flagged.
 */
export async function getOverview(surahNumber: number): Promise<SurahOverview | null> {
  if (surahNumber < 1 || surahNumber > 114) {
    return null;
  }
  const dataset = await loadDataset();
  const key = String(surahNumber);
  const entry = dataset[key];
  const overviewText = entry?.overview?.trim() || PLACEHOLDER_OVERVIEW;
  const validation = validateOverviewText(overviewText);
  return {
    surahNumber,
    overview: overviewText,
    isValid: validation.valid,
  };
}
