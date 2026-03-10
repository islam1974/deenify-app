import QuranThemeSelectorModal from '@/components/QuranThemeSelectorModal';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { sanitizeEngagementCopy } from '@/constants/EngagementCopyRules';
import { useQuranSettings } from '@/contexts/QuranSettingsContext';
import { useQuranTheme } from '@/contexts/QuranThemeContext';
import QuranEngagementService, { WeeklyReflectionSummary } from '@/services/QuranEngagementService';
import QuranService, { Chapter } from '@/services/QuranService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_IPAD = Platform.OS === 'ios' && (Platform.isPad === true || SCREEN_WIDTH >= 768);
const IS_IPAD_MINI = IS_IPAD && Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) <= 800;
const IS_IPAD_11 = IS_IPAD && Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) <= 900 && !IS_IPAD_MINI;
const IS_LARGE_PHONE = !IS_IPAD && SCREEN_WIDTH >= 430; // 16 Pro Max, Plus, etc.
const IS_PRO_MAX = SCREEN_WIDTH >= 430;
/** Compact layout so content fits without scroll (e.g. iPhone Air / standard 6.1") - not on iPad */
const IS_SMALL_HEIGHT = !IS_IPAD && SCREEN_HEIGHT > 0 && SCREEN_HEIGHT < 860;
const READING_POSITIONS_KEY = 'quran_reading_positions_v1';
const LANDING_GRADIENT = ['#1F5A34', '#1a4a2e', '#153d26', '#0E3B22'];
const LEDGER_LABEL = '#F1EFE7';
const LEDGER_NUMBER = '#C8A44D';

type ReadingPosition = {
  chapterId: number;
  scrollY: number;
  lastPlayedVerse: number | null;
  timestamp: number;
  reciter: string;
  translator: string;
  font: string;
};

export default function QuranLandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { themeId, setTheme } = useQuranTheme();
  const { getReciterOptions } = useQuranSettings();
  const [continueInfo, setContinueInfo] = useState<{ chapter: Chapter; progress: number; lastVerse: number; reciter: string } | null>(null);
  const [reflection, setReflection] = useState<WeeklyReflectionSummary | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [animReady, setAnimReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const lineAnimsRef = useRef<{ opacity: Animated.Value; scale: Animated.Value }[]>([]);

  const loadEngagement = useCallback(async () => {
    const summary = await QuranEngagementService.generateWeeklyReflectionSummary();
    setReflection(summary);
  }, []);

  const loadContinueInfo = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(READING_POSITIONS_KEY);
      if (!raw) return;
      const positions: Record<string, ReadingPosition> = JSON.parse(raw);
      const entries = Object.values(positions);
      if (entries.length === 0) return;
      const latest = entries.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));
      const chapters = await QuranService.getChapters();
      const chapter = chapters.find((c) => c.id === latest.chapterId);
      if (!chapter) return;
      const verse = latest.lastPlayedVerse ?? 0;
      const progress = Math.min(1, chapter.versesCount > 0 ? verse / chapter.versesCount : 0);
      const lastVerse = Math.max(1, verse || Math.round(progress * chapter.versesCount) || 1);
      const reciterOpt = getReciterOptions().find((r) => r.id === latest.reciter);
      const reciterName = reciterOpt?.name ?? (latest.reciter ? latest.reciter.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Alafasy');
      setContinueInfo({ chapter, progress, lastVerse, reciter: reciterName });
    } catch {
      setContinueInfo(null);
    }
  }, [getReciterOptions]);

  useEffect(() => {
    loadContinueInfo();
  }, [loadContinueInfo]);

  const loadChapters = useCallback(async () => {
    try {
      const list = await QuranService.getChapters();
      setChapters(list);
    } catch {
      setChapters([]);
    }
  }, []);

  useEffect(() => {
    loadChapters();
  }, [loadChapters]);

  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return chapters.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.nameTransliterated.toLowerCase().includes(q) ||
        c.nameTranslated.toLowerCase().includes(q) ||
        String(c.id).includes(q)
    );
  }, [chapters, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      loadContinueInfo();
      loadEngagement();
    }, [loadContinueInfo, loadEngagement])
  );

  const lines = reflection?.lines ?? ["Your space is here when you're ready."];

  useEffect(() => {
    lineAnimsRef.current = lines.map(() => ({
      opacity: new Animated.Value(0),
      scale: new Animated.Value(1),
    }));
    setAnimReady(true);
  }, [lines.join('|')]);

  useEffect(() => {
    if (!animReady || lineAnimsRef.current.length === 0) return;
    const anims = lineAnimsRef.current.map(({ opacity, scale }, i) => {
      const delay = 150 + i * 90;
      return Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(scale, { toValue: 1.65, duration: 250, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 1, duration: 320, useNativeDriver: true }),
          ]),
        ]),
      ]);
    });
    Animated.stagger(0, anims).start();
  }, [animReady, lines.length]);

  return (
    <View style={[styles.container, { backgroundColor: LANDING_GRADIENT[0] }]}>
      <Svg style={StyleSheet.absoluteFill} width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
        <Defs>
          <RadialGradient id="radialBg" cx="50%" cy="35%" r="80%">
            <Stop offset="0" stopColor={LANDING_GRADIENT[0]} />
            <Stop offset="0.4" stopColor={LANDING_GRADIENT[1]} />
            <Stop offset="0.7" stopColor={LANDING_GRADIENT[2]} />
            <Stop offset="1" stopColor={LANDING_GRADIENT[3]} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={SCREEN_WIDTH} height={SCREEN_HEIGHT} fill="url(#radialBg)" />
      </Svg>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          Platform.OS === 'android' && styles.contentAndroid,
          IS_SMALL_HEIGHT && styles.contentCompact,
          IS_IPAD && styles.contentIpad,
          { paddingTop: Math.max(0, insets.top - (IS_SMALL_HEIGHT ? 16 : IS_IPAD ? -16 : 32)), paddingBottom: insets.bottom + (IS_SMALL_HEIGHT ? 12 : IS_IPAD ? 28 : 24) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.hero, Platform.OS === 'android' && styles.heroAndroid, IS_SMALL_HEIGHT && styles.heroCompact, IS_IPAD && styles.heroIpad]}>
          <Text style={[styles.arabicTitle, Platform.OS === 'android' && styles.arabicTitleAndroid, IS_SMALL_HEIGHT && styles.arabicTitleCompact, IS_IPAD_MINI && styles.arabicTitleIpadMini, IS_IPAD && !IS_IPAD_MINI && styles.arabicTitleIpad, { color: '#C8A44D' }]} accessibilityLabel="The Holy Quran">
            القرآن الكريم
          </Text>
          <Text style={[styles.title, IS_SMALL_HEIGHT && styles.titleCompact, IS_IPAD && styles.titleIpad, { color: LEDGER_LABEL }]}>The Holy Quran</Text>
          <Text style={[styles.tagline, IS_SMALL_HEIGHT && styles.taglineCompact, IS_IPAD && styles.taglineIpad, { color: 'rgba(241,239,231,0.9)' }]} numberOfLines={2}>
            Read with translation, recitation, and tajweed
          </Text>

          {/* Search Bar */}
          <View style={[styles.searchContainer, IS_SMALL_HEIGHT && styles.searchContainerCompact, IS_IPAD && styles.searchContainerIpad]}>
            <View style={[styles.searchBar, { borderColor: 'rgba(200,164,77,0.5)' }]}>
              <IconSymbol name="magnifyingglass" size={20} color={LEDGER_NUMBER} />
              <TextInput
                style={[styles.searchInput, { color: LEDGER_LABEL }]}
                placeholder="Search surahs..."
                placeholderTextColor="rgba(241,239,231,0.6)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton} accessibilityLabel="Clear search">
                  <IconSymbol name="xmark.circle.fill" size={20} color="rgba(241,239,231,0.7)" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {searchQuery.trim() ? (
            <View style={[styles.searchResultsContainer, IS_SMALL_HEIGHT && styles.searchResultsCompact, IS_IPAD && styles.searchResultsContainerIpad]}>
              <Text style={[styles.searchResultsTitle, { color: LEDGER_LABEL }]}>
                {filteredChapters.length} {filteredChapters.length === 1 ? 'surah' : 'surahs'}
              </Text>
              <View style={styles.searchResultsList}>
                {filteredChapters.length === 0 ? (
                  <View style={styles.noSearchResults}>
                    <IconSymbol name="magnifyingglass" size={40} color="rgba(241,239,231,0.5)" />
                    <Text style={[styles.noSearchResultsText, { color: 'rgba(241,239,231,0.7)' }]}>No surahs found</Text>
                  </View>
                ) : (
                  filteredChapters.map((chapter) => (
                    <Pressable
                      key={chapter.id}
                      onPress={() => {
                        setSearchQuery('');
                        router.push({
                          pathname: '/(drawer)/(stack)/quran',
                          params: { resumeChapterId: String(chapter.id), resumeVerse: '1' },
                        } as any);
                      }}
                      style={({ pressed }) => [styles.searchResultRow, { opacity: pressed ? 0.8 : 1 }]}
                    >
                      <Text style={[styles.searchResultNumber, { color: LEDGER_NUMBER }]}>{chapter.id}</Text>
                      <View style={styles.searchResultContent}>
                        <Text style={[styles.searchResultArabic, { color: LEDGER_LABEL }]}>{chapter.name}</Text>
                        <Text style={[styles.searchResultTransliterated, { color: 'rgba(241,239,231,0.85)' }]}>
                          {chapter.nameTransliterated} · {chapter.nameTranslated}
                        </Text>
                      </View>
                      <IconSymbol name="chevron.right" size={18} color="rgba(200,164,77,0.8)" />
                    </Pressable>
                  ))
                )}
              </View>
            </View>
          ) : (
          <View style={[styles.engagementCardOuter, Platform.OS === 'android' && styles.engagementCardOuterAndroid, IS_SMALL_HEIGHT && styles.engagementCardOuterCompact, IS_IPAD && styles.engagementCardOuterIpad, IS_IPAD_11 && styles.engagementCardOuterIpad11]}>
          <View style={[styles.engagementCardWrap, Platform.OS === 'android' && styles.engagementCardWrapAndroid, IS_SMALL_HEIGHT && styles.engagementCardWrapCompact, IS_IPAD && styles.engagementCardWrapIpad]}>
          <View style={[styles.statsBlock, Platform.OS === 'android' && styles.statsBlockAndroid, IS_SMALL_HEIGHT && styles.statsBlockCompact, IS_IPAD && styles.statsBlockIpad, { borderTopColor: 'rgba(200, 164, 77, 0.55)' }]}>
            <LinearGradient
              colors={['#1B4D3E', '#0E3B2E']}
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />
            <Text style={[styles.statsTitle, IS_SMALL_HEIGHT && styles.statsTitleCompact, IS_IPAD && styles.statsTitleIpad, { color: LEDGER_LABEL }]} numberOfLines={2}>
              Your Time with the Qur'an
            </Text>
            <View style={[styles.cardTitleDivider, IS_SMALL_HEIGHT && styles.cardTitleDividerCompact, IS_IPAD && styles.cardTitleDividerIpad, { backgroundColor: 'rgba(200, 164, 77, 0.7)' }]} />
            <View style={[styles.reflectionLines, IS_SMALL_HEIGHT && styles.reflectionLinesCompact, IS_IPAD && styles.reflectionLinesIpad]}>
              {lines.slice(0, IS_SMALL_HEIGHT ? 2 : undefined).map((line, i) => {
                const anim = lineAnimsRef.current[i];
                const style = anim
                  ? [
                      styles.reflectionLine,
                      IS_SMALL_HEIGHT && styles.reflectionLineCompact,
                      IS_IPAD && styles.reflectionLineIpad,
                      {
                        color: LEDGER_LABEL,
                        opacity: anim.opacity,
                        transform: [{ scale: anim.scale }],
                      },
                    ]
                  : [styles.reflectionLine, IS_SMALL_HEIGHT && styles.reflectionLineCompact, IS_IPAD && styles.reflectionLineIpad, { color: LEDGER_LABEL }];
                return (
                  <Animated.Text key={i} style={style} numberOfLines={IS_SMALL_HEIGHT ? 1 : undefined}>
                    {sanitizeEngagementCopy(line)}
                  </Animated.Text>
                );
              })}
            </View>
            <Pressable
              onPress={() => {
                if (Platform.OS === 'ios' || Platform.OS === 'android') {
                  LayoutAnimation.configureNext({
                    duration: 400,
                    create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
                    update: { type: LayoutAnimation.Types.easeInEaseOut },
                    delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
                  });
                }
                setShowDetails((v) => !v);
              }}
              style={({ pressed }) => [styles.viewDetailsBtn, IS_SMALL_HEIGHT && styles.viewDetailsBtnCompact, IS_IPAD && styles.viewDetailsBtnIpad, { opacity: pressed ? 0.65 : 0.72 }]}
              accessibilityLabel={showDetails ? 'Hide details' : 'View details'}
              accessibilityRole="button"
            >
              <Text style={[styles.viewDetailsText, IS_SMALL_HEIGHT && styles.viewDetailsTextCompact, IS_IPAD && styles.viewDetailsTextIpad, { color: LEDGER_LABEL }]}>
                {showDetails ? 'Hide details' : 'View details'}
              </Text>
            </Pressable>
            {showDetails && reflection && (
              <View style={[styles.detailsSection, IS_SMALL_HEIGHT && styles.detailsSectionCompact, IS_IPAD && styles.detailsSectionIpad]}>
                <View style={styles.ledgerList}>
                  <View style={styles.ledgerRow}>
                    <View style={styles.ledgerLabelWrap}>
                      <IconSymbol name="calendar" size={20} color={LEDGER_NUMBER} />
                      <Text style={[styles.ledgerLabel, { color: LEDGER_LABEL }]}>Days present</Text>
                    </View>
                    <Text style={[styles.ledgerValue, { color: LEDGER_NUMBER }]}>{reflection.uniqueDaysEngaged === 0 ? '—' : reflection.uniqueDaysEngaged}</Text>
                  </View>
                  <View style={[styles.ledgerDivider, { backgroundColor: 'rgba(200, 164, 77, 0.28)' }]} />
                  <View style={styles.ledgerRow}>
                    <View style={styles.ledgerLabelWrap}>
                      <IconSymbol name="lightbulb.fill" size={20} color={LEDGER_NUMBER} />
                      <Text style={[styles.ledgerLabel, { color: LEDGER_LABEL }]}>Reflections</Text>
                    </View>
                    <Text style={[styles.ledgerValue, { color: LEDGER_NUMBER }]}>{reflection.reflectionsCount === 0 ? '—' : reflection.reflectionsCount}</Text>
                  </View>
                  <View style={[styles.ledgerDivider, { backgroundColor: 'rgba(200, 164, 77, 0.28)' }]} />
                  <View style={styles.ledgerRow}>
                    <View style={styles.ledgerLabelWrap}>
                      <IconSymbol name="book.fill" size={20} color={LEDGER_NUMBER} />
                      <Text style={[styles.ledgerLabel, { color: LEDGER_LABEL }]}>Reading</Text>
                    </View>
                    <Text style={[styles.ledgerValue, { color: LEDGER_NUMBER }]}>{reflection.readingSessions === 0 ? '—' : reflection.readingSessions}</Text>
                  </View>
                  <View style={[styles.ledgerDivider, { backgroundColor: 'rgba(200, 164, 77, 0.28)' }]} />
                  <View style={styles.ledgerRow}>
                    <View style={styles.ledgerLabelWrap}>
                      <IconSymbol name="headphones" size={20} color={LEDGER_NUMBER} />
                      <Text style={[styles.ledgerLabel, { color: LEDGER_LABEL }]}>Listening</Text>
                    </View>
                    <Text style={[styles.ledgerValue, { color: LEDGER_NUMBER }]}>{reflection.listeningSessions === 0 ? '—' : reflection.listeningSessions}</Text>
                  </View>
                  <View style={[styles.ledgerDivider, { backgroundColor: 'rgba(200, 164, 77, 0.28)' }]} />
                  <View style={styles.ledgerRow}>
                    <View style={styles.ledgerLabelWrap}>
                      <IconSymbol name="arrow.clockwise" size={20} color={LEDGER_NUMBER} />
                      <Text style={[styles.ledgerLabel, { color: LEDGER_LABEL }]}>Surahs revisited</Text>
                    </View>
                    <Text style={[styles.ledgerValue, { color: LEDGER_NUMBER }]}>{reflection.revisitCount === 0 ? '—' : reflection.revisitCount}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
          </View>

        <View style={[styles.actions, IS_SMALL_HEIGHT && styles.actionsCompact, IS_IPAD && styles.actionsIpad]}>
          {continueInfo ? (
            <Pressable
              onPress={() => router.push({
                pathname: '/(drawer)/(stack)/quran',
                params: { resumeChapterId: String(continueInfo.chapter.id), resumeVerse: String(continueInfo.lastVerse) },
              } as any)}
              style={({ pressed }) => [
                styles.continueButton,
                Platform.OS === 'android' && styles.continueButtonAndroid,
                IS_SMALL_HEIGHT && styles.continueButtonCompact,
                IS_IPAD && styles.continueButtonIpad,
                { opacity: pressed ? 0.9 : 1 },
              ]}
              accessibilityLabel={`Continue reading ${continueInfo.chapter.nameTransliterated}`}
              accessibilityRole="button"
            >
              <View style={styles.continueTop}>
                <Text style={[styles.continueLabel, { color: '#FFFFFF' }]}>Continue Reading</Text>
                <IconSymbol name="chevron.right" size={18} color="#FFFFFF" />
              </View>
              <Text style={[styles.continueSurah, { color: '#FFFFFE' }]} numberOfLines={1}>
                {continueInfo.chapter.nameTransliterated}
              </Text>
              <View>
                <Text style={[styles.continueLastRead, { color: 'rgba(255, 255, 255, 0.75)' }]}>
                  Last read: {continueInfo.chapter.id}:{continueInfo.lastVerse}
                </Text>
                <Text style={[styles.continueLastRead, styles.continueReciter, { color: 'rgba(255, 255, 255, 0.75)' }]}>
                  Reciter: {continueInfo.reciter}
                </Text>
              </View>
            </Pressable>
          ) : null}
          <Pressable
            onPress={async () => {
              if (continueInfo) {
                await AsyncStorage.removeItem(READING_POSITIONS_KEY);
                await QuranEngagementService.resetStats();
                setContinueInfo(null);
                loadEngagement();
              }
              router.push('/(drawer)/(stack)/quran');
            }}
            style={({ pressed }) => [
              styles.primaryButton,
              Platform.OS === 'android' && styles.primaryButtonAndroid,
              IS_SMALL_HEIGHT && styles.primaryButtonCompact,
              IS_IPAD && styles.primaryButtonIpad,
              { opacity: pressed ? 0.9 : 1 },
              continueInfo && styles.primaryButtonSecondary,
              continueInfo && IS_SMALL_HEIGHT && styles.primaryButtonSecondaryCompact,
              continueInfo && IS_IPAD && styles.primaryButtonSecondaryIpad,
              continueInfo && Platform.OS === 'android' && styles.primaryButtonSecondaryAndroid,
            ]}
            accessibilityLabel="Start reading the Quran"
            accessibilityRole="button"
          >
            <Text style={[styles.primaryButtonText, continueInfo && styles.primaryButtonTextMuted]}>
              {continueInfo ? 'Start from beginning' : 'Start Reading'}
            </Text>
            <IconSymbol name="chevron.right" size={continueInfo ? 18 : 20} color={continueInfo ? 'rgba(255,255,255,0.48)' : 'rgba(255, 255, 255, 0.78)'} />
          </Pressable>

          <View style={[styles.appearanceSection, IS_SMALL_HEIGHT && styles.appearanceSectionCompact, IS_IPAD && styles.appearanceSectionIpad]}>
            <View style={[styles.appearanceDivider, IS_SMALL_HEIGHT && styles.appearanceDividerCompact]} />
            <Pressable
              style={({ pressed }) => [styles.appearanceBtn, { opacity: pressed ? 0.85 : 1 }]}
              onPress={() => setShowThemeModal(true)}
              accessibilityLabel="Choose Quran theme"
              accessibilityRole="button"
            >
              <Text style={styles.appearanceBtnText}>Quran Themes</Text>
              <IconSymbol name="chevron.right" size={16} color="rgba(200, 164, 77, 0.95)" />
            </Pressable>
          </View>
        </View>
        </View>
          )}
        </View>
      </ScrollView>

      <QuranThemeSelectorModal
        visible={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        themeId={themeId}
        onSelectTheme={setTheme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: IS_IPAD ? 44 : IS_PRO_MAX ? 6 : IS_LARGE_PHONE ? 16 : 14,
  },
  contentAndroid: {
    paddingHorizontal: 0,
  },
  contentCompact: {
    paddingHorizontal: 12,
  },
  contentIpad: {
    paddingHorizontal: 56,
    maxWidth: 9999,
    width: '100%',
  },
  hero: {
    alignItems: 'center',
    paddingVertical: IS_PRO_MAX ? 4 : IS_LARGE_PHONE ? 2 : 0,
    paddingHorizontal: IS_PRO_MAX ? 4 : 12,
  },
  heroAndroid: {
    paddingHorizontal: 20,
  },
  heroCompact: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  heroIpad: {
    paddingVertical: 32,
    paddingHorizontal: 32,
  },
  arabicTitle: {
    fontFamily: 'ScheherazadeNew-Bold',
    fontSize: IS_IPAD ? 70 : IS_PRO_MAX ? 66 : IS_LARGE_PHONE ? 62 : 58,
    fontWeight: '800',
    marginTop: IS_PRO_MAX ? 20 : IS_LARGE_PHONE ? 12 : 10,
    marginBottom: -4,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  arabicTitleAndroid: {
    fontSize: IS_IPAD ? 80 : IS_PRO_MAX ? 78 : IS_LARGE_PHONE ? 74 : 70,
    marginTop: IS_PRO_MAX ? 28 : IS_LARGE_PHONE ? 18 : 14,
  },
  arabicTitleCompact: {
    fontSize: 48,
    marginTop: 10,
    marginBottom: -2,
  },
  arabicTitleIpadMini: {
    fontSize: 80,
    marginTop: 18,
    marginBottom: -4,
  },
  arabicTitleIpad: {
    fontSize: 120,
    marginTop: 26,
    marginBottom: -2,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  title: {
    fontFamily: 'PlayfairDisplay-SemiBold',
    fontSize: IS_IPAD ? 24 : IS_PRO_MAX ? 22 : IS_LARGE_PHONE ? 26 : 24,
    fontWeight: '600',
    opacity: 0.9,
    marginTop: -14,
    marginBottom: IS_PRO_MAX ? 2 : IS_LARGE_PHONE ? 0 : 0,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  titleCompact: {
    fontSize: 18,
    marginTop: -14,
    marginBottom: 0,
  },
  titleIpad: {
    fontSize: 26,
    marginTop: -10,
    marginBottom: 6,
  },
  tagline: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: IS_IPAD ? 18 : IS_PRO_MAX ? 16 : IS_LARGE_PHONE ? 16 : 15.5,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: IS_PRO_MAX ? 26 : IS_LARGE_PHONE ? 24 : 23,
  },
  taglineCompact: {
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  taglineIpad: {
    fontSize: 24,
    lineHeight: 36,
    paddingHorizontal: 32,
  },
  searchContainer: {
    width: '100%',
    maxWidth: IS_PRO_MAX ? 9999 : 460,
    paddingHorizontal: 0,
    paddingVertical: IS_PRO_MAX ? 14 : 12,
  },
  searchContainerCompact: {
    paddingVertical: 8,
  },
  searchContainerIpad: {
    paddingVertical: 18,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: IS_IPAD ? 24 : 16,
    paddingVertical: IS_IPAD ? 20 : 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    backgroundColor: 'rgba(14, 59, 46, 0.5)',
  },
  searchInput: {
    flex: 1,
    fontSize: IS_IPAD ? 22 : 16,
    padding: 0,
  },
  clearSearchButton: {
    padding: 4,
  },
  searchResultsContainer: {
    width: '100%',
    maxWidth: IS_PRO_MAX ? 9999 : 460,
    marginTop: 0,
    paddingTop: 8,
    paddingBottom: 16,
  },
  searchResultsCompact: {
    paddingTop: 4,
    paddingBottom: 12,
  },
  searchResultsContainerIpad: {
    paddingTop: 12,
    paddingBottom: 16,
    maxWidth: 800,
  },
  searchResultsTitle: {
    fontFamily: 'PlayfairDisplay-SemiBold',
    fontSize: IS_IPAD ? 28 : 16,
    marginBottom: 12,
  },
  searchResultsList: {
    gap: 8,
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(14, 59, 46, 0.5)',
    gap: 14,
  },
  searchResultNumber: {
    fontFamily: 'PlayfairDisplay-SemiBold',
    fontSize: 16,
    minWidth: 28,
    textAlign: 'center',
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultArabic: {
    fontFamily: 'ScheherazadeNew-Bold',
    fontSize: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  searchResultTransliterated: {
    fontSize: 14,
    marginTop: 2,
  },
  noSearchResults: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  noSearchResultsText: {
    fontSize: 16,
  },
  engagementCardOuter: {
    width: '100%',
    maxWidth: IS_PRO_MAX ? 9999 : 520,
    marginTop: -4,
    padding: IS_PRO_MAX ? 28 : IS_LARGE_PHONE ? 24 : 22,
    borderWidth: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  engagementCardOuterAndroid: {
    width: SCREEN_WIDTH,
    maxWidth: SCREEN_WIDTH,
    paddingHorizontal: 14,
    paddingVertical: 18,
    borderWidth: 0,
    borderColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowColor: 'transparent',
  },
  engagementCardOuterCompact: {
    marginTop: 0,
    padding: 10,
  },
  engagementCardOuterIpad: {
    marginTop: 4,
    padding: 28,
    maxWidth: 9999,
    alignSelf: 'stretch',
  },
  engagementCardOuterIpad11: {
    marginTop: 28,
  },
  engagementCardWrap: {
    width: '100%',
    paddingTop: IS_PRO_MAX ? 18 : 16,
    paddingBottom: IS_PRO_MAX ? 24 : 22,
    paddingHorizontal: IS_PRO_MAX ? 26 : IS_LARGE_PHONE ? 24 : 22,
    borderWidth: 0,
  },
  engagementCardWrapAndroid: {
    paddingHorizontal: 10,
  },
  engagementCardWrapCompact: {
    paddingTop: 12,
    paddingBottom: 14,
    paddingHorizontal: 14,
  },
  engagementCardWrapIpad: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 36,
  },
  statsBlock: {
    marginTop: 0,
    paddingTop: IS_PRO_MAX ? 22 : IS_LARGE_PHONE ? 20 : 18,
    borderTopWidth: 2,
    paddingBottom: IS_PRO_MAX ? 32 : IS_LARGE_PHONE ? 28 : 26,
    paddingHorizontal: IS_PRO_MAX ? 26 : IS_LARGE_PHONE ? 24 : 22,
    borderRadius: 13,
    borderWidth: 0,
    width: '100%',
    maxWidth: IS_PRO_MAX ? 9999 : 520,
    overflow: 'hidden',
    elevation: 0,
  },
  statsBlockAndroid: {
    width: '100%',
    maxWidth: SCREEN_WIDTH,
    paddingHorizontal: 10,
  },
  statsBlockCompact: {
    paddingTop: 14,
    paddingBottom: 16,
    paddingHorizontal: 14,
  },
  statsBlockIpad: {
    paddingTop: 20,
    paddingBottom: 28,
    paddingHorizontal: 36,
    maxWidth: 9999,
    alignSelf: 'stretch',
  },
  statsTitle: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: IS_PRO_MAX ? 23 : IS_LARGE_PHONE ? 21 : 19,
    letterSpacing: 1.2,
    marginBottom: IS_PRO_MAX ? 14 : IS_LARGE_PHONE ? 12 : 10,
    textAlign: 'center',
  },
  statsTitleCompact: {
    fontSize: 16,
    marginBottom: 6,
  },
  statsTitleIpad: {
    fontSize: 34,
    marginBottom: 16,
  },
  cardTitleDivider: {
    alignSelf: 'center',
    width: '50%',
    height: 2,
    marginBottom: IS_PRO_MAX ? 16 : IS_LARGE_PHONE ? 14 : 12,
  },
  cardTitleDividerCompact: {
    marginBottom: 10,
  },
  cardTitleDividerIpad: {
    marginBottom: 14,
    height: 4,
  },
  reflectionLines: {
    gap: IS_PRO_MAX ? 14 : 12,
    alignItems: 'flex-start',
  },
  reflectionLinesCompact: {
    gap: 6,
  },
  reflectionLinesIpad: {
    gap: 14,
  },
  reflectionLine: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: IS_PRO_MAX ? 16.5 : IS_LARGE_PHONE ? 16 : 15.5,
    textAlign: 'left',
    lineHeight: IS_PRO_MAX ? 29 : IS_LARGE_PHONE ? 27 : 26,
  },
  reflectionLineCompact: {
    fontSize: 14,
    lineHeight: 19,
  },
  reflectionLineIpad: {
    fontSize: 24,
    lineHeight: 34,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: IS_PRO_MAX ? 20 : IS_LARGE_PHONE ? 18 : 16,
  },
  viewDetailsText: {
    fontFamily: 'PlayfairDisplay-SemiBold',
    fontSize: IS_PRO_MAX ? 15 : 14.5,
    letterSpacing: 1.2,
  },
  viewDetailsBtnCompact: {
    marginTop: 12,
  },
  viewDetailsBtnIpad: {
    marginTop: 18,
  },
  viewDetailsTextCompact: {
    fontSize: 13,
  },
  viewDetailsTextIpad: {
    fontSize: 22,
  },
  detailsSection: {
    marginTop: IS_PRO_MAX ? 18 : 16,
  },
  detailsSectionCompact: {
    marginTop: 12,
  },
  detailsSectionIpad: {
    marginTop: 16,
  },
  ledgerList: {
    paddingHorizontal: 4,
  },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: IS_PRO_MAX ? 9 : 8,
  },
  ledgerLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ledgerLabel: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: IS_IPAD ? 24 : IS_PRO_MAX ? 17 : 16,
    lineHeight: IS_PRO_MAX ? 25 : 23,
  },
  ledgerValue: {
    fontFamily: 'PlayfairDisplay-SemiBold',
    fontSize: IS_IPAD ? 28 : IS_PRO_MAX ? 19 : 18,
    lineHeight: IS_PRO_MAX ? 25 : 23,
  },
  ledgerDivider: {
    height: 1,
  },
  actions: {
    alignItems: 'center',
    paddingTop: IS_PRO_MAX ? 20 : 16,
    paddingBottom: IS_PRO_MAX ? 18 : 16,
    width: '100%',
  },
  actionsCompact: {
    paddingTop: 4,
    paddingBottom: 4,
  },
  actionsIpad: {
    paddingTop: 40,
    paddingBottom: 24,
    maxWidth: 580,
    alignSelf: 'center',
  },
  continueButton: {
    width: '100%',
    backgroundColor: 'rgba(45, 85, 65, 0.85)',
    borderRadius: IS_PRO_MAX ? 8 : 6,
    borderColor: 'rgba(232, 185, 35, 0.6)',
    paddingVertical: IS_PRO_MAX ? 16 : IS_LARGE_PHONE ? 14 : 13,
    paddingHorizontal: IS_PRO_MAX ? 22 : IS_LARGE_PHONE ? 20 : 19,
    marginBottom: IS_PRO_MAX ? 16 : IS_LARGE_PHONE ? 14 : 12,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  continueButtonAndroid: {
    paddingHorizontal: 14,
  },
  continueButtonCompact: {
    paddingVertical: 10,
    marginBottom: 12,
  },
  continueButtonIpad: {
    paddingVertical: 22,
    paddingHorizontal: 38,
    marginBottom: 22,
  },
  continueTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  continueLabel: {
    fontSize: IS_IPAD ? 22 : IS_PRO_MAX ? 16 : IS_LARGE_PHONE ? 15 : 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  continueSurah: {
    fontSize: IS_IPAD ? 22 : IS_PRO_MAX ? 19 : IS_LARGE_PHONE ? 17 : 16.5,
    fontWeight: '800',
    color: '#FFFFFE',
    marginBottom: 4,
  },
  continueLastRead: {
    fontFamily: 'PlayfairDisplay-SemiBold',
    fontSize: IS_IPAD ? 19 : IS_PRO_MAX ? 14 : 13.5,
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 0.5,
  },
  continueReciter: {
    marginTop: 2,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LANDING_GRADIENT[0],
    paddingVertical: IS_PRO_MAX ? 18 : IS_LARGE_PHONE ? 16 : 15,
    paddingHorizontal: IS_PRO_MAX ? 30 : IS_LARGE_PHONE ? 28 : 26,
    borderRadius: IS_PRO_MAX ? 18 : IS_LARGE_PHONE ? 16 : 15,
    minWidth: IS_PRO_MAX ? 240 : IS_LARGE_PHONE ? 220 : 208,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.78)',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  primaryButtonAndroid: {
    paddingHorizontal: 20,
    minWidth: 240,
  },
  primaryButtonCompact: {
    paddingVertical: 12,
    minWidth: 180,
  },
  primaryButtonIpad: {
    paddingVertical: 20,
    paddingHorizontal: 48,
    minWidth: 340,
    borderRadius: 24,
  },
  primaryButtonSecondary: {
    backgroundColor: 'transparent',
    marginTop: 14,
    paddingVertical: IS_PRO_MAX ? 13 : IS_LARGE_PHONE ? 12 : 11,
    paddingHorizontal: IS_PRO_MAX ? 22 : IS_LARGE_PHONE ? 20 : 18,
    minWidth: IS_PRO_MAX ? 200 : IS_LARGE_PHONE ? 185 : 172,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    elevation: 0,
    shadowOpacity: 0,
  },
  primaryButtonSecondaryCompact: {
    marginTop: 10,
  },
  primaryButtonSecondaryIpad: {
    marginTop: 12,
    paddingVertical: 18,
    paddingHorizontal: 44,
    minWidth: 320,
  },
  primaryButtonSecondaryAndroid: {
    minWidth: 220,
    paddingHorizontal: 20,
  },
  primaryButtonText: {
    fontSize: IS_IPAD ? 26 : IS_PRO_MAX ? 19 : IS_LARGE_PHONE ? 17 : 16.5,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.78)',
    marginRight: 8,
  },
  primaryButtonTextMuted: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  hint: {
    fontSize: IS_PRO_MAX ? 15 : IS_LARGE_PHONE ? 14 : 13.5,
    marginTop: IS_PRO_MAX ? 10 : IS_LARGE_PHONE ? 8 : 6,
    textAlign: 'center',
    flexShrink: 0,
  },
  hintCompact: {
    fontSize: 12,
    marginTop: 8,
  },
  appearanceSection: {
    alignItems: 'center',
    marginTop: IS_PRO_MAX ? 10 : IS_LARGE_PHONE ? 8 : 6,
    width: '100%',
  },
  appearanceSectionCompact: {
    marginTop: 6,
  },
  appearanceSectionIpad: {
    marginTop: 12,
  },
  appearanceDivider: {
    width: '60%',
    height: 1,
    backgroundColor: 'rgba(200, 164, 77, 0.2)',
    marginBottom: 8,
  },
  appearanceDividerCompact: {
    marginBottom: 4,
  },
  appearanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  appearanceBtnText: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: IS_IPAD ? 30 : IS_PRO_MAX ? 22 : 21,
    color: '#D4B85C',
    letterSpacing: 0.4,
  },
});
