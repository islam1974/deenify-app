import { IconSymbol } from '@/components/ui/icon-symbol';
import { useQuranTheme } from '@/contexts/QuranThemeContext';
import { getOverview } from '@/services/surahOverviewService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_IPAD = Platform.OS === 'ios' && (Platform.isPad === true || SCREEN_WIDTH >= 768);

export default function SurahOverviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    surahNumber: string;
    surahNameArabic?: string;
    surahNameTransliterated?: string;
  }>();
  const insets = useSafeAreaInsets();
  const { theme } = useQuranTheme();
  const t = theme;

  const surahNumber = params.surahNumber ? parseInt(params.surahNumber, 10) : 0;
  const surahNameArabic = params.surahNameArabic ?? '';
  const surahNameTransliterated = params.surahNameTransliterated ?? '';

  const [overview, setOverview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOverview = useCallback(async () => {
    if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
      setOverview(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await getOverview(surahNumber);
      setOverview(result?.overview ?? null);
    } catch {
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }, [surahNumber]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const PAPER_BG = t.background;
  const PAPER_TEXT = t.arabicText;
  const PAPER_TEXT_SECONDARY = t.translationText;
  const ICON_GOLD = t.verseBadgeGold;

  return (
    <View style={[styles.container, { backgroundColor: PAPER_BG }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8, paddingBottom: 12 }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, IS_IPAD && styles.backButtonIpad, { opacity: pressed ? 0.7 : 1 }]}
          accessibilityLabel="Back"
          accessibilityRole="button"
        >
          <IconSymbol name="chevron.left" size={IS_IPAD ? 32 : 24} color={PAPER_TEXT} />
          <Text style={[styles.backLabel, IS_IPAD && styles.backLabelIpad, { color: PAPER_TEXT }]}>Back</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          IS_IPAD && styles.contentIpad,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.titleBlock, IS_IPAD && styles.titleBlockIpad]}>
          {surahNameArabic ? (
            <Text style={[styles.arabicTitle, IS_IPAD && styles.arabicTitleIpad, { color: PAPER_TEXT }]} accessibilityLabel={`Surah ${surahNameTransliterated}`}>
              {surahNameArabic}
            </Text>
          ) : null}
          <Text style={[styles.englishTitle, IS_IPAD && styles.englishTitleIpad, { color: PAPER_TEXT }]}>
            {surahNameTransliterated || `Surah ${surahNumber}`}
          </Text>
          <Text style={[styles.surahNumber, IS_IPAD && styles.surahNumberIpad, { color: ICON_GOLD }]}>
            Surah {surahNumber}
          </Text>
        </View>

        {loading ? (
          <View style={[styles.loadingBlock, IS_IPAD && styles.loadingBlockIpad]}>
            <ActivityIndicator size="large" color={ICON_GOLD} />
            <Text style={[styles.loadingText, IS_IPAD && styles.loadingTextIpad, { color: PAPER_TEXT_SECONDARY }]}>
              Loading overview...
            </Text>
          </View>
        ) : overview ? (
          <Text style={[styles.overviewText, IS_IPAD && styles.overviewTextIpad, { color: PAPER_TEXT_SECONDARY }]}>
            {overview}
          </Text>
        ) : (
          <View style={[styles.emptyBlock, IS_IPAD && styles.emptyBlockIpad]}>
            <IconSymbol name="doc.text" size={IS_IPAD ? 64 : 48} color={PAPER_TEXT_SECONDARY} />
            <Text style={[styles.emptyText, IS_IPAD && styles.emptyTextIpad, { color: PAPER_TEXT_SECONDARY }]}>
              Overview coming soon.
            </Text>
          </View>
        )}

        {!loading && overview ? (
          <Text style={[styles.footerNote, IS_IPAD && styles.footerNoteIpad, { color: PAPER_TEXT_SECONDARY }]}>
            Overview for general understanding.
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingVertical: 8,
  },
  backButtonIpad: {
    gap: 8,
    paddingVertical: 12,
  },
  backLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  backLabelIpad: {
    fontSize: 26,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  contentIpad: {
    paddingHorizontal: 48,
    paddingTop: 32,
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
  },
  titleBlock: {
    marginBottom: 24,
  },
  titleBlockIpad: {
    marginBottom: 32,
  },
  arabicTitle: {
    fontFamily: 'ScheherazadeNew-Bold',
    fontSize: 36,
    textAlign: 'center',
    writingDirection: 'rtl',
    marginBottom: 8,
  },
  arabicTitleIpad: {
    fontSize: 56,
    marginBottom: 12,
  },
  englishTitle: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  englishTitleIpad: {
    fontSize: 34,
    marginBottom: 8,
  },
  surahNumber: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.9,
  },
  surahNumberIpad: {
    fontSize: 26,
  },
  loadingBlock: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 16,
  },
  loadingBlockIpad: {
    paddingVertical: 64,
    gap: 24,
  },
  loadingText: {
    fontSize: 16,
  },
  loadingTextIpad: {
    fontSize: 24,
  },
  overviewText: {
    fontSize: 17,
    lineHeight: 28,
    textAlign: 'justify',
  },
  overviewTextIpad: {
    fontSize: 24,
    lineHeight: 38,
  },
  emptyBlock: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 16,
  },
  emptyBlockIpad: {
    paddingVertical: 64,
    gap: 24,
  },
  emptyText: {
    fontSize: 17,
  },
  emptyTextIpad: {
    fontSize: 24,
  },
  footerNote: {
    marginTop: 32,
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  footerNoteIpad: {
    marginTop: 40,
    fontSize: 20,
  },
});
