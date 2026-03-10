import { getOverview } from '../services/surahOverviewService';

describe('surahOverviewService', () => {
  it('returns overview for existing surah', async () => {
    const result = await getOverview(1);
    expect(result).not.toBeNull();
    expect(result?.surahNumber).toBe(1);
    expect(result?.overview).toContain('Al-Fatihah');
  });

  it('returns null for missing surah', async () => {
    const result = await getOverview(999);
    expect(result).toBeNull();
  });

  it('caches dataset across calls', async () => {
    const a = await getOverview(1);
    const b = await getOverview(1);
    expect(a).toEqual(b);
  });
});
