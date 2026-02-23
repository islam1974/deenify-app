import QuranThemeSelectorModal from '@/components/QuranThemeSelectorModal';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { sanitizeEngagementCopy } from '@/constants/EngagementCopyRules';
import { useQuranTheme } from '@/contexts/QuranThemeContext';
import QuranEngagementService, { WeeklyReflectionSummary } from '@/services/QuranEngagementService';
import QuranService, { Chapter } from '@/services/QuranService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_IPAD = false; // Set true when deploying on iPad
const IS_LARGE_PHONE = !IS_IPAD && SCREEN_WIDTH >= 430; // 16 Pro Max, Plus, etc.
const IS_PRO_MAX = SCREEN_WIDTH >= 430;
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
  const [continueInfo, setContinueInfo] = useState<{ chapter: Chapter; progress: number; lastVerse: number } | null>(null);
  const [reflection, setReflection] = useState<WeeklyReflectionSummary | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [animReady, setAnimReady] = useState(false);
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
      setContinueInfo({ chapter, progress, lastVerse });
    } catch {
      setContinueInfo(null);
    }
  }, []);

  useEffect(() => {
    loadContinueInfo();
  }, [loadContinueInfo]);

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
        contentContainerStyle={[styles.content, { paddingTop: Math.max(4, insets.top - 20), paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <Text style={[styles.arabicTitle, { color: '#C8A44D' }]} accessibilityLabel="The Holy Quran">
            القرآن الكريم
          </Text>
          <Text style={[styles.title, { color: LEDGER_LABEL }]}>The Holy Quran</Text>
          <Text style={[styles.tagline, { color: 'rgba(241,239,231,0.9)' }]} numberOfLines={2}>
            Read with translation, recitation, and tajweed
          </Text>
          <View style={styles.engagementCardOuter}>
          <View style={styles.engagementCardWrap}>
          <View style={[styles.statsBlock, { borderTopColor: 'rgba(200, 164, 77, 0.35)' }]}>
            <LinearGradient
              colors={['#1B4D3E', '#0E3B2E']}
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />
            <Text style={[styles.statsTitle, { color: LEDGER_LABEL }]} numberOfLines={2}>
              Your Time with the Qur'an
            </Text>
            <View style={[styles.cardTitleDivider, { backgroundColor: 'rgba(200, 164, 77, 0.5)' }]} />
            <View style={styles.reflectionLines}>
              {lines.map((line, i) => {
                const anim = lineAnimsRef.current[i];
                const style = anim
                  ? [
                      styles.reflectionLine,
                      {
                        color: LEDGER_LABEL,
                        opacity: anim.opacity,
                        transform: [{ scale: anim.scale }],
                      },
                    ]
                  : [styles.reflectionLine, { color: LEDGER_LABEL }];
                return (
                  <Animated.Text key={i} style={style}>
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
              style={({ pressed }) => [styles.viewDetailsBtn, { opacity: pressed ? 0.65 : 0.72 }]}
              accessibilityLabel={showDetails ? 'Hide details' : 'View details'}
              accessibilityRole="button"
            >
              <Text style={[styles.viewDetailsText, { color: LEDGER_LABEL }]}>
                {showDetails ? 'Hide details' : 'View details'}
              </Text>
            </Pressable>
            {showDetails && reflection && (
              <View style={styles.detailsSection}>
                <View style={styles.ledgerList}>
                  <View style={styles.ledgerRow}>
                    <Text style={[styles.ledgerLabel, { color: LEDGER_LABEL }]}>Days present</Text>
                    <Text style={[styles.ledgerValue, { color: LEDGER_NUMBER }]}>{reflection.uniqueDaysEngaged === 0 ? '—' : reflection.uniqueDaysEngaged}</Text>
                  </View>
                  <View style={[styles.ledgerDivider, { backgroundColor: 'rgba(200, 164, 77, 0.15)' }]} />
                  <View style={styles.ledgerRow}>
                    <Text style={[styles.ledgerLabel, { color: LEDGER_LABEL }]}>Reflections</Text>
                    <Text style={[styles.ledgerValue, { color: LEDGER_NUMBER }]}>{reflection.reflectionsCount === 0 ? '—' : reflection.reflectionsCount}</Text>
                  </View>
                  <View style={[styles.ledgerDivider, { backgroundColor: 'rgba(200, 164, 77, 0.15)' }]} />
                  <View style={styles.ledgerRow}>
                    <Text style={[styles.ledgerLabel, { color: LEDGER_LABEL }]}>Reading</Text>
                    <Text style={[styles.ledgerValue, { color: LEDGER_NUMBER }]}>{reflection.readingSessions === 0 ? '—' : reflection.readingSessions}</Text>
                  </View>
                  <View style={[styles.ledgerDivider, { backgroundColor: 'rgba(200, 164, 77, 0.15)' }]} />
                  <View style={styles.ledgerRow}>
                    <Text style={[styles.ledgerLabel, { color: LEDGER_LABEL }]}>Listening</Text>
                    <Text style={[styles.ledgerValue, { color: LEDGER_NUMBER }]}>{reflection.listeningSessions === 0 ? '—' : reflection.listeningSessions}</Text>
                  </View>
                  <View style={[styles.ledgerDivider, { backgroundColor: 'rgba(200, 164, 77, 0.15)' }]} />
                  <View style={styles.ledgerRow}>
                    <Text style={[styles.ledgerLabel, { color: LEDGER_LABEL }]}>Surahs revisited</Text>
                    <Text style={[styles.ledgerValue, { color: LEDGER_NUMBER }]}>{reflection.revisitCount === 0 ? '—' : reflection.revisitCount}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

        <View style={styles.actions}>
          {continueInfo ? (
            <Pressable
              onPress={() => router.push('/(drawer)/(stack)/quran')}
              style={({ pressed }) => [
                styles.continueButton,
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
              <Text style={[styles.continueLastRead, { color: 'rgba(255, 255, 255, 0.75)' }]}>
                Last read: {continueInfo.chapter.id}:{continueInfo.lastVerse}
              </Text>
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
              { opacity: pressed ? 0.9 : 1 },
              continueInfo && styles.primaryButtonSecondary,
            ]}
            accessibilityLabel="Start reading the Quran"
            accessibilityRole="button"
          >
            <Text style={[styles.primaryButtonText, continueInfo && styles.primaryButtonTextMuted]}>
              {continueInfo ? 'Start from beginning' : 'Start Reading'}
            </Text>
            <IconSymbol name="chevron.right" size={continueInfo ? 18 : 20} color={continueInfo ? 'rgba(255,255,255,0.85)' : 'rgba(255, 255, 255, 0.78)'} />
          </Pressable>

          <Text style={[styles.hint, { color: 'rgba(255, 255, 255, 0.78)' }]} numberOfLines={1} adjustsFontSizeToFit>
            114 surahs • Arabic with translation & audio
          </Text>

          <View style={styles.appearanceSection}>
            <View style={styles.appearanceDivider} />
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
          </View>
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
  hero: {
    alignItems: 'center',
    paddingVertical: IS_PRO_MAX ? 12 : IS_LARGE_PHONE ? 10 : 8,
    paddingHorizontal: IS_PRO_MAX ? 4 : 12,
  },
  arabicTitle: {
    fontFamily: 'ScheherazadeNew-Bold',
    fontSize: IS_IPAD ? 70 : IS_PRO_MAX ? 66 : IS_LARGE_PHONE ? 62 : 58,
    fontWeight: '800',
    marginTop: IS_PRO_MAX ? 28 : IS_LARGE_PHONE ? 12 : 10,
    marginBottom: 10,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  title: {
    fontFamily: 'PlayfairDisplay-SemiBold',
    fontSize: IS_IPAD ? 30 : IS_PRO_MAX ? 28 : IS_LARGE_PHONE ? 26 : 24,
    fontWeight: '600',
    opacity: 0.9,
    marginTop: -6,
    marginBottom: IS_PRO_MAX ? 4 : IS_LARGE_PHONE ? 2 : 2,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  tagline: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: IS_IPAD ? 18 : IS_PRO_MAX ? 16 : IS_LARGE_PHONE ? 16 : 15.5,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: IS_PRO_MAX ? 26 : IS_LARGE_PHONE ? 24 : 23,
  },
  engagementCardOuter: {
    width: '100%',
    maxWidth: IS_PRO_MAX ? 9999 : 460,
    marginTop: IS_PRO_MAX ? 16 : IS_LARGE_PHONE ? 14 : 12,
    padding: IS_PRO_MAX ? 28 : IS_LARGE_PHONE ? 24 : 22,
    borderWidth: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  engagementCardWrap: {
    width: '100%',
    paddingTop: IS_PRO_MAX ? 26 : 24,
    paddingBottom: IS_PRO_MAX ? 30 : 28,
    paddingHorizontal: IS_PRO_MAX ? 26 : IS_LARGE_PHONE ? 24 : 22,
    borderWidth: 0,
  },
  statsBlock: {
    marginTop: 0,
    paddingTop: IS_PRO_MAX ? 30 : IS_LARGE_PHONE ? 26 : 24,
    borderTopWidth: 1,
    paddingBottom: IS_PRO_MAX ? 32 : IS_LARGE_PHONE ? 28 : 26,
    paddingHorizontal: IS_PRO_MAX ? 26 : IS_LARGE_PHONE ? 24 : 22,
    borderRadius: 13,
    borderWidth: 0,
    width: '100%',
    maxWidth: IS_PRO_MAX ? 9999 : 460,
    overflow: 'hidden',
    elevation: 0,
  },
  statsTitle: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: IS_PRO_MAX ? 19 : IS_LARGE_PHONE ? 17 : 16,
    letterSpacing: 1.2,
    marginBottom: IS_PRO_MAX ? 14 : IS_LARGE_PHONE ? 12 : 10,
    textAlign: 'center',
  },
  cardTitleDivider: {
    alignSelf: 'center',
    width: '50%',
    height: 1,
    marginBottom: IS_PRO_MAX ? 22 : IS_LARGE_PHONE ? 20 : 18,
  },
  reflectionLines: {
    gap: IS_PRO_MAX ? 14 : 12,
    alignItems: 'flex-start',
  },
  reflectionLine: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: IS_PRO_MAX ? 15.5 : IS_LARGE_PHONE ? 15 : 14.5,
    textAlign: 'left',
    lineHeight: IS_PRO_MAX ? 28 : IS_LARGE_PHONE ? 26 : 25,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: IS_PRO_MAX ? 30 : IS_LARGE_PHONE ? 28 : 26,
  },
  viewDetailsText: {
    fontFamily: 'PlayfairDisplay-SemiBold',
    fontSize: IS_PRO_MAX ? 14 : 13.5,
    letterSpacing: 1.2,
  },
  detailsSection: {
    marginTop: IS_PRO_MAX ? 24 : 22,
  },
  ledgerList: {
    paddingHorizontal: 4,
  },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingVertical: IS_PRO_MAX ? 9 : 8,
  },
  ledgerLabel: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: IS_PRO_MAX ? 16 : 15,
    lineHeight: IS_PRO_MAX ? 24 : 22,
  },
  ledgerValue: {
    fontFamily: 'PlayfairDisplay-SemiBold',
    fontSize: IS_PRO_MAX ? 18 : 17,
    lineHeight: IS_PRO_MAX ? 24 : 22,
  },
  ledgerDivider: {
    height: 1,
  },
  actions: {
    alignItems: 'center',
    paddingTop: IS_PRO_MAX ? 32 : 28,
    paddingBottom: IS_PRO_MAX ? 24 : 22,
    width: '100%',
  },
  continueButton: {
    width: '100%',
    backgroundColor: 'rgba(45, 85, 65, 0.85)',
    borderRadius: IS_PRO_MAX ? 8 : 6,
    borderColor: 'rgba(232, 185, 35, 0.4)',
    paddingVertical: IS_PRO_MAX ? 18 : IS_LARGE_PHONE ? 16 : 15,
    paddingHorizontal: IS_PRO_MAX ? 22 : IS_LARGE_PHONE ? 20 : 19,
    marginBottom: IS_PRO_MAX ? 24 : IS_LARGE_PHONE ? 22 : 20,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  continueTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  continueLabel: {
    fontSize: IS_PRO_MAX ? 16 : IS_LARGE_PHONE ? 15 : 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  continueSurah: {
    fontSize: IS_PRO_MAX ? 19 : IS_LARGE_PHONE ? 17 : 16.5,
    fontWeight: '800',
    color: '#FFFFFE',
    marginBottom: 4,
  },
  continueLastRead: {
    fontFamily: 'PlayfairDisplay-SemiBold',
    fontSize: IS_PRO_MAX ? 14 : 13.5,
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 0.5,
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
  primaryButtonSecondary: {
    backgroundColor: 'transparent',
    marginTop: 22,
    paddingVertical: IS_PRO_MAX ? 13 : IS_LARGE_PHONE ? 12 : 11,
    paddingHorizontal: IS_PRO_MAX ? 22 : IS_LARGE_PHONE ? 20 : 18,
    minWidth: IS_PRO_MAX ? 200 : IS_LARGE_PHONE ? 185 : 172,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    elevation: 0,
    shadowOpacity: 0,
  },
  primaryButtonText: {
    fontSize: IS_PRO_MAX ? 19 : IS_LARGE_PHONE ? 17 : 16.5,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.78)',
    marginRight: 8,
  },
  primaryButtonTextMuted: {
    color: 'rgba(255, 255, 255, 0.88)',
  },
  hint: {
    fontSize: IS_PRO_MAX ? 15 : IS_LARGE_PHONE ? 14 : 13.5,
    marginTop: IS_PRO_MAX ? 16 : IS_LARGE_PHONE ? 14 : 13,
    textAlign: 'center',
    flexShrink: 0,
  },
  appearanceSection: {
    alignItems: 'center',
    marginTop: IS_PRO_MAX ? 16 : IS_LARGE_PHONE ? 14 : 12,
    width: '100%',
  },
  appearanceDivider: {
    width: '60%',
    height: 1,
    backgroundColor: 'rgba(200, 164, 77, 0.2)',
    marginBottom: 8,
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
    fontSize: IS_PRO_MAX ? 22 : 21,
    color: 'rgba(200, 164, 77, 0.95)',
    letterSpacing: 0.4,
  },
});
