import PaperTextureOverlay from '@/components/PaperTextureOverlay';
import TajweedLegend from '@/components/TajweedLegend';
import TajweedText from '@/components/TajweedText';
import Dropdown from '@/components/ui/dropdown';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useQuranSettings } from '@/contexts/QuranSettingsContext';
import { useQuranTheme } from '@/contexts/QuranThemeContext';
import { useTheme } from '@/contexts/ThemeContext';
import AudioService from '@/services/AudioService';
import QuranEngagementService from '@/services/QuranEngagementService';
import QuranService, { Chapter, ChapterWithVerses, Verse } from '@/services/QuranService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, AppState, AppStateStatus, Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_IPAD = false; // Set true when deploying on iPad
const IS_SMALL_PHONE = SCREEN_WIDTH < 400;
const READING_POSITIONS_KEY = 'quran_reading_positions_v1';

const RUB_EL_HIZB = '\u06DE';

type ReadingPosition = {
  chapterId: number;
  scrollY: number;
  lastPlayedVerse: number | null;
  timestamp: number;
  reciter: string;
  translator: string;
  font: string;
};

type BottomTab = 'play' | 'tajweed' | 'fonts';

function QuranScreenContent() {
  const router = useRouter();
  const { theme } = useTheme();
  const quranTheme = useQuranTheme();
  const colors = Colors[((theme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const { settings, getReciterOptions, getTranslatorOptions, getFontOptions, toggleTranslation, toggleArabic, updateReciter, updateTranslator, updateFont, toggleTajweed, updateResumeMode } = useQuranSettings();

  const t = quranTheme.theme;
  const PAPER_BG = t.background;
  const PAPER_CARD = t.card;
  const PAPER_TEXT = t.arabicText;
  const PAPER_TEXT_SECONDARY = t.translationText;
  const ICON_GOLD = t.verseBadgeGold;
  const TAB_BAR_BG = t.tabBarBg ?? t.card;
  const TAB_ACTIVE = t.accent;
  const TAB_INACTIVE = t.translationText;
  const TAB_CONTENT_TEXT = t.label;
  const TAB_ACTIVE_BG = t.tabActiveBg ?? 'rgba(200,164,77,0.25)';
  const TAB_ACTIVE_TEXT = t.tabActiveText ?? t.label;
  const verseCardColors = t.verseCardColors ?? [t.card, t.background];
  const isDarkReader = t.id !== 'parchment-classic';
  const reciterOptions = getReciterOptions();
  const translatorOptions = getTranslatorOptions();
  const fontOptions = getFontOptions();
  const insets = useSafeAreaInsets();
  
  // Orientation detection for landscape split-screen layout
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  
  // Allow all orientations on Quran screen
  useEffect(() => {
    const enableAllOrientations = async () => {
      try {
        await ScreenOrientation.unlockAsync();
      } catch (error) {
        console.log('Could not unlock orientation:', error);
      }
    };
    
    enableAllOrientations();
    
    // Lock back to portrait when leaving the screen
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
    };
  }, []);
  
  // State management
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [currentChapter, setCurrentChapter] = useState<ChapterWithVerses | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChapters, setIsLoadingChapters] = useState(true);
  const [audioState, setAudioState] = useState(AudioService.getCurrentState());
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [playedVerses, setPlayedVerses] = useState<Map<number, Set<number>>>(new Map());
  
  // Bottom Tab Navigation State
  const activeTabRef = useRef<BottomTab>('play');
  const [activeTab, setActiveTab] = useState<BottomTab>('play');
  const [scrollSpeed, setScrollSpeed] = useState(1);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  
  const handleTabChange = useCallback((newTab: BottomTab) => {
    if (activeTabRef.current !== newTab) {
      activeTabRef.current = newTab;
      setActiveTab(newTab);
    }
  }, []);
  
  // Scroll refs
  const flatListRef = useRef<FlatList>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollPositionRef = useRef<number>(0); // Track scroll position for auto-scroll
  const lastScrollYRef = useRef<number>(0);
  const lastUserScrollYRef = useRef<number>(0); // Only updated when user manually scrolls (not playing)
  const bottomTabsVisibleRef = useRef<boolean>(true);
  const [bottomTabsVisible, setBottomTabsVisible] = useState(true);
  const bottomTabsAnim = useRef(new Animated.Value(0)).current;
  const [hasRestoredPosition, setHasRestoredPosition] = useState(false);
  const [pendingScrollY, setPendingScrollY] = useState<number | null>(null);
  const [pendingVerseNumber, setPendingVerseNumber] = useState<number | null>(null); // For "listen" resume mode
  const [showResumePopover, setShowResumePopover] = useState(false);
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const readingPositionsRef = useRef<Record<string, ReadingPosition>>({});
  const [initialChapterResolved, setInitialChapterResolved] = useState(false);
  const pendingScrollOffsetRef = useRef<number | null>(null); // Apply scroll when list content is ready (e.g. onContentSizeChange)
  const restoreAppliedRef = useRef(false);
  const recordedReadSessionChaptersRef = useRef<Set<number>>(new Set());

  const persistReadingPositions = useCallback(async () => {
    try {
      await AsyncStorage.setItem(READING_POSITIONS_KEY, JSON.stringify(readingPositionsRef.current));
    } catch (error) {
      console.error('Error persisting reading positions:', error);
    }
  }, []);

  const loadReadingPositions = useCallback(async () => {
    try {
      const storedPositions = await AsyncStorage.getItem(READING_POSITIONS_KEY);
      if (storedPositions) {
        readingPositionsRef.current = JSON.parse(storedPositions);
      } else {
        readingPositionsRef.current = {};
      }

      // Migrate legacy single-position storage if present
      const legacyPosition = await AsyncStorage.getItem('quran_reading_position');
      if (legacyPosition) {
        const parsedLegacy = JSON.parse(legacyPosition);
        if (parsedLegacy?.chapterId) {
          readingPositionsRef.current[String(parsedLegacy.chapterId)] = {
            chapterId: parsedLegacy.chapterId,
            scrollY: parsedLegacy.scrollY ?? 0,
            lastPlayedVerse: parsedLegacy.lastPlayedVerse ?? null,
            timestamp: parsedLegacy.timestamp ?? Date.now(),
            reciter: parsedLegacy.lastReciter ?? settings.selectedReciter,
            translator: settings.selectedTranslator,
            font: settings.selectedFont,
          };
          await AsyncStorage.removeItem('quran_reading_position');
          await persistReadingPositions();
        }
      }
    } catch (error) {
      console.error('Error loading reading positions:', error);
      readingPositionsRef.current = {};
    }
  }, [persistReadingPositions, settings.selectedFont, settings.selectedReciter, settings.selectedTranslator]);

  const getSavedPositionForChapter = useCallback((chapterId: number): ReadingPosition | null => {
    return readingPositionsRef.current[String(chapterId)] ?? null;
  }, []);

  // Load chapters on mount
  useEffect(() => {
    const initialize = async () => {
      await loadReadingPositions();
      await loadChapters();
    };

    initialize();
    
    // Set up audio listener
    const unsubscribe = AudioService.addListener((newState) => {
      setAudioState(newState);
      
      // Track played verses per chapter
      if (newState.currentVerse && newState.currentChapter) {
        setPlayedVerses(prev => {
          const newMap = new Map(prev);
          const chapterVerses = newMap.get(newState.currentChapter!) || new Set();
          chapterVerses.add(newState.currentVerse!);
          newMap.set(newState.currentChapter!, chapterVerses);
          return newMap;
        });
      }
    });

    // Set up surah completion listener for auto-advance to next chapter
    const unsubscribeSurahCompletion = AudioService.addSurahCompletionListener(async (completedChapterNumber) => {
      console.log('📖 Surah completed, checking for next chapter...', completedChapterNumber);
      
      try {
        // Get current chapters list (fetch fresh if needed)
        let currentChapters = chapters;
        if (currentChapters.length === 0) {
          currentChapters = await QuranService.getChapters();
        }
        
        // Find the next chapter
        const currentChapterIndex = currentChapters.findIndex(ch => ch.id === completedChapterNumber);
        if (currentChapterIndex !== -1 && currentChapterIndex < currentChapters.length - 1) {
          const nextChapter = currentChapters[currentChapterIndex + 1];
          console.log('⏭️ Auto-advancing to next chapter:', nextChapter.nameTransliterated);
          
          // Small delay for smooth transition
          setTimeout(async () => {
            try {
              // Load the next chapter
              await loadChapter(nextChapter.id, false);
              setSelectedChapter(nextChapter);
              
              // Wait for chapter to load, then start playing
              setTimeout(async () => {
                try {
                  // Get the updated currentChapter after loading
                  const updatedChapter = await QuranService.getChapterWithTranslation(
                    nextChapter.id,
                    settings.selectedTranslator,
                    settings.selectedReciter,
                    settings.selectedFont
                  );
                  if (updatedChapter && updatedChapter.verses.length > 0) {
                    console.log('▶️ Auto-playing next chapter:', nextChapter.nameTransliterated);
                    setIsLoadingAudio(true);
                    await AudioService.playFullSurah(updatedChapter, settings.selectedReciter);
                    QuranEngagementService.recordEvent({ type: 'AUDIO_PLAYED', chapterId: nextChapter.id });
                    setIsLoadingAudio(false);
                  }
                } catch (playError) {
                  console.error('❌ Error auto-playing next chapter:', playError);
                  setIsLoadingAudio(false);
                }
              }, 800); // Increased delay to ensure chapter is fully loaded
            } catch (loadError) {
              console.error('❌ Error loading next chapter:', loadError);
              setIsLoadingAudio(false);
            }
          }, 500);
        } else {
          console.log('🏁 Last chapter reached, no more chapters to play');
        }
      } catch (error) {
        console.error('❌ Error in surah completion handler:', error);
      }
    });
    
    return () => {
      unsubscribe();
      unsubscribeSurahCompletion();
      if (scrollIntervalRef.current !== null) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
        setIsAutoScrolling(false);
      }
    };
  }, [chapters, loadChapter, settings.selectedTranslator, settings.selectedReciter, settings.selectedFont]);

  // Save position when leaving the screen (unmount)
  useEffect(() => {
    return () => {
      saveReadingPosition();
    };
  }, [saveReadingPosition]);

  // Save position when screen loses focus (e.g. user navigates back) so we persist before unmount
  useFocusEffect(
    useCallback(() => {
      return () => {
        saveReadingPosition();
      };
    }, [saveReadingPosition])
  );

  // Save position when app goes to background (user switches apps, locks phone)
  // Also pause Quran engagement time when app is not in foreground
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        saveReadingPosition();
        QuranEngagementService.stopSession();
      } else if (nextState === 'active') {
        QuranEngagementService.startSession();
      }
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [saveReadingPosition]);

  // Track time spent on Quran reader screen (engagement)
  useEffect(() => {
    QuranEngagementService.startSession();
    return () => {
      QuranEngagementService.stopSession();
    };
  }, []);

  // Load chapter when selected OR when translator/font changes
  useEffect(() => {
    if (selectedChapter) {
      const skipPositionRestore = !!currentChapter; // Skip position restore if chapter already loaded
      loadChapter(selectedChapter.id, skipPositionRestore);
    }
    
    // Cleanup: stop audio when chapter changes
    return () => {
      // This will run before the next chapter loads
      const currentState = AudioService.getCurrentState();
      if (currentState.isPlaying && currentState.currentChapter !== selectedChapter?.id) {
        AudioService.stop().catch(err => console.error('Error stopping audio on chapter change:', err));
      }
    };
  }, [selectedChapter?.id, settings.selectedTranslator, settings.selectedFont]);

  // Auto-scroll to currently playing verse
  useEffect(() => {
    if (
      audioState.isPlaying && 
      audioState.currentVerse && 
      audioState.currentChapter === selectedChapter?.id &&
      currentChapter?.verses
    ) {
      // Find the index of the current verse in the verses array
      const verseIndex = currentChapter.verses.findIndex(
        v => v.verseNumber === audioState.currentVerse
      );
      
      if (verseIndex !== -1 && flatListRef.current) {
        // Scroll immediately when verse changes, with minimal delay
        const scrollTimeout = setTimeout(() => {
          try {
            flatListRef.current?.scrollToIndex({
              index: verseIndex,
              animated: true,
              viewPosition: 0.25, // Position verse at 25% from top for better visibility
            });
          } catch (error) {
            // If scroll fails, try again after a short delay
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({
                index: verseIndex,
                animated: true,
                viewPosition: 0.25,
              });
            }, 200);
          }
        }, 100); // Reduced delay for faster response
        
        return () => clearTimeout(scrollTimeout);
      }
    }
  }, [
    audioState.isPlaying, 
    audioState.currentVerse, 
    audioState.currentChapter,
    selectedChapter?.id,
    currentChapter?.verses
  ]);


  // Removed scroll handler - player is now always visible

  // Save reading position to AsyncStorage (scrollY from user's physical scroll only, not playback)
  const saveReadingPosition = useCallback(async () => {
    try {
      const userY = lastUserScrollYRef.current;
      const scrollY = userY > 0 ? userY : scrollPositionRef.current;
      if (selectedChapter && scrollY >= 0) {
        const key = String(selectedChapter.id);
        const positionData: ReadingPosition = {
          chapterId: selectedChapter.id,
          scrollY,
          lastPlayedVerse: audioState.currentVerse ?? null,
          timestamp: Date.now(),
          reciter: settings.selectedReciter,
          translator: settings.selectedTranslator,
          font: settings.selectedFont,
        };

        readingPositionsRef.current = {
          ...readingPositionsRef.current,
          [key]: positionData,
        };

        await persistReadingPositions();
      }
    } catch (error) {
      console.error('Error saving reading position:', error);
    }
  }, [
    selectedChapter,
    audioState.isPlaying,
    audioState.currentVerse,
    settings.selectedReciter,
    settings.selectedTranslator,
    settings.selectedFont,
    persistReadingPositions,
  ]);

  // Tap anywhere to toggle bottom tabs (show ↔ hide)
  const toggleBottomTabs = useCallback(() => {
    const nextVisible = !bottomTabsVisibleRef.current;
    bottomTabsVisibleRef.current = nextVisible;
    setBottomTabsVisible(nextVisible);
    Animated.timing(bottomTabsAnim, {
      toValue: nextVisible ? 0 : 150,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [bottomTabsAnim]);

  const tapGesture = useMemo(
    () => Gesture.Tap().maxDuration(400).runOnJS(true).onEnd(toggleBottomTabs),
    [toggleBottomTabs]
  );

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    setScrollPosition(yOffset);
    scrollPositionRef.current = yOffset;
    lastScrollYRef.current = yOffset;
    // Only track user scroll position when not playing (playback auto-scroll shouldn't overwrite read position)
    if (!audioState.isPlaying) {
      lastUserScrollYRef.current = yOffset;
    }
  }, [audioState.isPlaying]);

  // Reset tabs to visible when chapter changes
  useEffect(() => {
    if (selectedChapter) {
      bottomTabsVisibleRef.current = true;
      setBottomTabsVisible(true);
      bottomTabsAnim.setValue(0);
    }
  }, [selectedChapter?.id, bottomTabsAnim]);

  // Save position only when user scrolls while NOT playing (physical scroll = read position)
  useEffect(() => {
    if (selectedChapter && scrollPosition >= 0 && !audioState.isPlaying) {
      const timer = setTimeout(() => {
        saveReadingPosition();
      }, 1000); // Debounce: save 1 second after scroll stops
      
      return () => clearTimeout(timer);
    }
  }, [selectedChapter, scrollPosition, audioState.isPlaying, saveReadingPosition]);

  // Record reading session when user scrolls while reading (meaningful engagement)
  useEffect(() => {
    if (!selectedChapter || audioState.isPlaying || scrollPosition < 100) return;
    if (recordedReadSessionChaptersRef.current.has(selectedChapter.id)) return;
    recordedReadSessionChaptersRef.current.add(selectedChapter.id);
    QuranEngagementService.recordEvent({ type: 'AYAH_READ_SESSION', chapterId: selectedChapter.id });
  }, [selectedChapter, audioState.isPlaying, scrollPosition]);

  // Allow recording again when switching to a different chapter
  useEffect(() => {
    if (selectedChapter) {
      recordedReadSessionChaptersRef.current.delete(selectedChapter.id);
    }
  }, [selectedChapter?.id]);

  // Restore scroll position after verses are loaded (read = scroll position, listen = last played verse)
  useEffect(() => {
    if (!currentChapter?.verses?.length || hasRestoredPosition) return;
    const scrollY = pendingScrollY;
    const verseNum = pendingVerseNumber;
    if (verseNum != null) {
      // Listen mode: scroll to last played verse
      const verseIndex = currentChapter.verses.findIndex(v => v.verseNumber === verseNum);
      if (verseIndex !== -1 && flatListRef.current) {
        const timer = setTimeout(() => {
          try {
            flatListRef.current?.scrollToIndex({
              index: verseIndex,
              animated: false,
              viewPosition: 0.25,
            });
            const approxY = verseIndex * 120; // Approximate for refs
            scrollPositionRef.current = approxY;
            lastUserScrollYRef.current = approxY;
          } catch (_) {}
          setPendingVerseNumber(null);
          setPendingScrollY(null);
          setHasRestoredPosition(true);
        }, 350);
        return () => clearTimeout(timer);
      }
      setPendingVerseNumber(null);
      setHasRestoredPosition(true);
      return;
    }
    if (scrollY != null && scrollY > 0 && flatListRef.current && currentChapter?.verses?.length) {
      pendingScrollOffsetRef.current = scrollY;
      const verses = currentChapter.verses;
      const approxVerseHeight = 130;
      const estimatedIndex = Math.min(Math.max(0, Math.floor(scrollY / approxVerseHeight)), verses.length - 1);
      const timer = setTimeout(() => {
        if (flatListRef.current && pendingScrollOffsetRef.current != null && !restoreAppliedRef.current) {
          const offset = pendingScrollOffsetRef.current;
          try {
            flatListRef.current.scrollToOffset({ offset, animated: false });
            restoreAppliedRef.current = true;
          } catch (_) {}
          scrollPositionRef.current = offset;
          lastUserScrollYRef.current = offset;
          pendingScrollOffsetRef.current = null;
          setPendingScrollY(null);
          setHasRestoredPosition(true);
        }
      }, 100);
      const fallbackTimer = setTimeout(() => {
        if (flatListRef.current && !restoreAppliedRef.current) {
          try {
            flatListRef.current.scrollToIndex({ index: estimatedIndex, animated: false, viewPosition: 0 });
            const offset = estimatedIndex * approxVerseHeight;
            scrollPositionRef.current = offset;
            lastUserScrollYRef.current = offset;
            restoreAppliedRef.current = true;
          } catch (_) {}
          pendingScrollOffsetRef.current = null;
          setPendingScrollY(null);
          setHasRestoredPosition(true);
        }
      }, 600);
      return () => {
        clearTimeout(timer);
        clearTimeout(fallbackTimer);
      };
    }
    if (scrollY !== undefined && (scrollY === null || scrollY <= 0)) {
      setPendingScrollY(null);
      setHasRestoredPosition(true);
    }
  }, [currentChapter, pendingScrollY, pendingVerseNumber, hasRestoredPosition]);

  const loadChapters = useCallback(async () => {
    try {
      setIsLoadingChapters(true);
      const chaptersData = await QuranService.getChapters();
      setChapters(chaptersData);

      if (!initialChapterResolved) {
        const savedPositions = Object.values(readingPositionsRef.current);
        const sortedByRecent = savedPositions.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
        const mostRecent = sortedByRecent[0];

        if (mostRecent) {
          const savedChapter = chaptersData.find(chapter => chapter.id === mostRecent.chapterId);
          if (savedChapter) {
            setSelectedChapter(savedChapter);
            setInitialChapterResolved(true);
            setShowResumePopover(true); // Show resume picker when restoring from saved position
            return;
          }
        }

        if (chaptersData.length > 0) {
          setSelectedChapter(chaptersData[0]);
          setInitialChapterResolved(true);
        }
      }
    } catch (error) {
      console.error('Error loading chapters:', error);
    } finally {
      setIsLoadingChapters(false);
    }
  }, [initialChapterResolved]);

  const loadChapter = useCallback(async (chapterNumber: number, skipPositionRestore: boolean = false) => {
    try {
      setIsLoading(true);
      
      const chapterData = await QuranService.getChapterWithTranslation(
        chapterNumber, 
        settings.selectedTranslator, 
        settings.selectedReciter, 
        settings.selectedFont
      );
      setCurrentChapter(chapterData);

      // Record engagement events (relationship-based, not time-based)
      const savedPos = getSavedPositionForChapter(chapterNumber);
      if (savedPos) {
        QuranEngagementService.recordEvent({ type: 'AYAH_REVISITED', chapterId: chapterNumber });
      } else {
        QuranEngagementService.recordEvent({ type: 'AYAH_READ', chapterId: chapterNumber });
      }
      if (settings.showTranslation) {
        QuranEngagementService.recordEvent({ type: 'TRANSLATION_VIEWED', chapterId: chapterNumber });
      }
      
      // Only try to restore position on initial chapter load
      if (!skipPositionRestore && !hasRestoredPosition) {
        const savedPosition = getSavedPositionForChapter(chapterNumber);
        const resumeMode = settings.resumeMode ?? 'read';
        if (resumeMode === 'listen' && savedPosition?.lastPlayedVerse != null) {
          setPendingVerseNumber(savedPosition.lastPlayedVerse);
          setPendingScrollY(null);
        } else if (savedPosition && savedPosition.scrollY > 0) {
          const scrollY = savedPosition.scrollY;
          restoreAppliedRef.current = false;
          pendingScrollOffsetRef.current = scrollY;
          scrollPositionRef.current = scrollY;
          lastUserScrollYRef.current = scrollY;
          setPendingScrollY(scrollY);
          setPendingVerseNumber(null);
        } else {
          setPendingScrollY(null);
          setPendingVerseNumber(null);
          setHasRestoredPosition(true);
        }
      }
    } catch (error) {
      console.error('Error loading chapter:', error);
    } finally {
      setIsLoading(false);
    }
  }, [
    settings.selectedTranslator,
    settings.selectedReciter,
    settings.selectedFont,
    settings.resumeMode,
    hasRestoredPosition,
    getSavedPositionForChapter,
  ]);


  const handleChapterSelect = useCallback(async (chapter: Chapter) => {
    try {
      console.log('📖 Switching to new chapter:', chapter.nameTransliterated);

      await saveReadingPosition();

      // Stop any active audio playback when changing chapters
      const currentState = AudioService.getCurrentState();
      if (currentState.isPlaying || currentState.currentChapter) {
        console.log('🛑 Stopping audio from previous chapter');
        await AudioService.stop();
      }
      
      // Reset position flag for new chapter
      setHasRestoredPosition(false);
      setPendingScrollY(null);
      setPendingVerseNumber(null);
      setSelectedChapter(chapter);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error switching chapter:', error);
      // Still proceed with chapter change even if stop fails
      setHasRestoredPosition(false);
      setPendingScrollY(null);
      setPendingVerseNumber(null);
      setSelectedChapter(chapter);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [saveReadingPosition]);

  const scrollToLastReadPosition = useCallback(() => {
    if (!selectedChapter || !flatListRef.current) return;
    const saved = getSavedPositionForChapter(selectedChapter.id);
    const scrollY = saved?.scrollY;
    if (scrollY == null || scrollY <= 0) return;
    try {
      flatListRef.current.scrollToOffset({ offset: scrollY, animated: true });
      scrollPositionRef.current = scrollY;
      lastUserScrollYRef.current = scrollY;
    } catch (_) {}
  }, [selectedChapter, getSavedPositionForChapter]);

  const scrollToLastPlayedVerse = useCallback(() => {
    if (!selectedChapter || !currentChapter?.verses?.length) return;
    const saved = getSavedPositionForChapter(selectedChapter.id);
    const verseNum = saved?.lastPlayedVerse;
    if (verseNum == null) return;
    const idx = currentChapter.verses.findIndex(v => v.verseNumber === verseNum);
    if (idx === -1 || !flatListRef.current) return;
    try {
      flatListRef.current.scrollToIndex({ index: idx, animated: true, viewPosition: 0.25 });
      const approxY = idx * 120;
      scrollPositionRef.current = approxY;
      lastUserScrollYRef.current = approxY;
    } catch (_) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.25 });
      }, 300);
    }
  }, [selectedChapter, currentChapter, getSavedPositionForChapter]);

  const handleStopAudio = useCallback(async () => {
    try {
      await AudioService.stop();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }, []);

  const handlePlayPause = useCallback(async () => {
    try {
      console.log('🎵 Play/Pause button pressed');
      const currentState = AudioService.getCurrentState();
      console.log('🎵 Current audio state:', currentState);
      
      if (currentState.isPlaying) {
        console.log('⏸️ Pausing audio...');
        await AudioService.pause();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else if (currentState.currentChapter && currentState.currentVerse) {
        console.log('▶️ Resuming audio...');
        await AudioService.resume();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else if (currentChapter && currentChapter.verses.length > 0) {
        console.log('🎵 Starting continuous surah playback...');
        console.log('📖 Chapter:', currentChapter.nameTransliterated, `(${currentChapter.verses.length} verses)`);
        console.log('🎙️ Reciter:', settings.selectedReciter);
        
        setIsLoadingAudio(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        await AudioService.playFullSurah(currentChapter, settings.selectedReciter);
        QuranEngagementService.recordEvent({ type: 'AUDIO_PLAYED', chapterId: currentChapter.id });
        console.log('✅ Continuous playback started successfully');
      } else {
        console.warn('⚠️ No chapter loaded or no verses available');
        Alert.alert('No Chapter Selected', 'Please select a chapter to play.');
      }
    } catch (error) {
      console.error('❌ Error with play/pause:', error);
      Alert.alert('Playback Error', 'Failed to start audio playback. Please try again.');
    } finally {
      setIsLoadingAudio(false);
    }
  }, [currentChapter, settings.selectedReciter]);


  // Auto-scroll functionality using setInterval
  const startAutoScroll = useCallback(() => {
    if (scrollIntervalRef.current !== null) {
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (scrollPositionRef.current === 0 && scrollPosition > 0) {
      scrollPositionRef.current = scrollPosition;
    }
    
    scrollIntervalRef.current = setInterval(() => {
      const newPos = scrollPositionRef.current + scrollSpeed;
      scrollPositionRef.current = newPos;
      
      flatListRef.current?.scrollToOffset({ 
        offset: newPos, 
        animated: false 
      });
    }, 50);
    
    setIsAutoScrolling(true);
  }, [scrollSpeed, scrollPosition]);

  const stopAutoScroll = useCallback(() => {
    if (scrollIntervalRef.current === null) {
      return;
    }
    
    clearInterval(scrollIntervalRef.current);
    scrollIntervalRef.current = null;
    setIsAutoScrolling(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    const wasScrolling = scrollIntervalRef.current !== null;
    
    if (wasScrolling) {
      clearInterval(scrollIntervalRef.current!);
      scrollIntervalRef.current = null;
    }
    
    setScrollSpeed(newSpeed);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (wasScrolling) {
      scrollIntervalRef.current = setInterval(() => {
        scrollPositionRef.current += newSpeed;
        flatListRef.current?.scrollToOffset({ 
          offset: scrollPositionRef.current, 
          animated: false 
        });
      }, 50);
    }
  }, []);

  // Handle translation toggle
  const handleToggleTranslation = useCallback(() => {
    toggleTranslation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [toggleTranslation]);

  // Handle Arabic toggle
  const handleToggleArabic = useCallback(() => {
    toggleArabic();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [toggleArabic]);

  // Memoize font sizes to avoid recalculation on every render
  const fontSizes = useMemo(() => {
    const baseLineHeightArabic = 48;
    const baseLineHeightTranslation = 30;
    const scale = IS_IPAD ? 3.0 : IS_SMALL_PHONE ? 1.15 : 1.35;
    
    switch (settings.fontSize) {
      case 'small':
        return {
          arabic: 24 * scale,
          translation: 12 * scale,
          lineHeightArabic: baseLineHeightArabic * (28/30) * scale,
          lineHeightTranslation: baseLineHeightTranslation * (13/16) * scale,
        };
      case 'medium':
        return {
          arabic: 30 * scale,
          translation: 14 * scale,
          lineHeightArabic: baseLineHeightArabic * (34/30) * scale,
          lineHeightTranslation: baseLineHeightTranslation * (15/16) * scale,
        };
      case 'large':
        return {
          arabic: 36 * scale,
          translation: 16.5 * scale,
          lineHeightArabic: baseLineHeightArabic * (40/30) * scale,
          lineHeightTranslation: baseLineHeightTranslation * (17/16) * scale,
        };
      case 'extra-large':
        return {
          arabic: 42 * scale,
          translation: 19 * scale,
          lineHeightArabic: baseLineHeightArabic * (46/30) * scale,
          lineHeightTranslation: baseLineHeightTranslation * (18/16) * scale,
        };
      default:
        return {
          arabic: 48 * scale,
          translation: 21 * scale,
          lineHeightArabic: baseLineHeightArabic * 1.2 * scale,
          lineHeightTranslation: baseLineHeightTranslation * 1.2 * scale,
        };
    }
  }, [settings.fontSize]);

  const dropdownItems = useMemo(() => 
    chapters.map(chapter => ({
      id: chapter.id,
      label: `${RUB_EL_HIZB}  ${chapter.id}. ${chapter.nameTransliterated} (${chapter.name})`,
      value: chapter.name
    })), [chapters]);

  const selectedDropdownItem = useMemo(() => 
    dropdownItems.find(item => item.id === selectedChapter?.id) || null, 
    [dropdownItems, selectedChapter?.id]
  );

  // Create a chapter lookup map for O(1) access
  const chapterMap = useMemo(() => {
    const map = new Map<number, Chapter>();
    chapters.forEach(chapter => map.set(chapter.id, chapter));
    return map;
  }, [chapters]);


  // Memoize font family separately
  const currentFontFamily = useMemo(() => {
    const currentFont = fontOptions.find(f => f.id === settings.selectedFont);
    return currentFont?.fontFamily || 'NotoNaskhArabic-Regular';
  }, [fontOptions, settings.selectedFont]);

  // Optimized verse rendering for FlatList
  const renderVerse = useCallback(({ item: verse }: { item: Verse }) => {
    const isCurrentVerse = audioState.isPlaying && 
                          audioState.currentVerse === verse.verseNumber && 
                          audioState.currentChapter === selectedChapter?.id;
    const chapterPlayedVerses = playedVerses.get(selectedChapter?.id || 0) || new Set();
    const isPlayedVerse = chapterPlayedVerses.has(verse.verseNumber);

    // Check if this is verse 1 and contains Bismillah (except Surah 9)
    const bismillahVariations = [
      'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
      'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ',
      'بسم الله الرحمن الرحيم',
      'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ'
    ];
    
    const isFirstVerse = verse.verseNumber === 1;
    const verseText = verse.text || 'Arabic text not available';
    
    let bismillahText = '';
    let remainingText = verseText;
    
    if (isFirstVerse && selectedChapter?.id !== 9) {
      // Try to find and extract Bismillah
      for (const bismillah of bismillahVariations) {
        if (verseText.includes(bismillah)) {
          bismillahText = bismillah;
          remainingText = verseText.replace(bismillah, '').trim();
          break;
        }
      }
      
      // If no exact match found, look for "الرَّحِيمِ" or "الرحيم" which ends Bismillah
      if (!bismillahText) {
        const rahimVariations = ['ٱلرَّحِيمِ', 'الرَّحِيمِ', 'الرحيم'];
        for (const rahim of rahimVariations) {
          const rahimIndex = verseText.indexOf(rahim);
          if (rahimIndex !== -1 && rahimIndex < 50) {
            // Found Rahim within first 50 chars, likely the end of Bismillah
            bismillahText = verseText.substring(0, rahimIndex + rahim.length).trim();
            remainingText = verseText.substring(rahimIndex + rahim.length).trim();
            break;
          }
        }
      }
    }

    const verseTextColor = isCurrentVerse ? '#2E7D32' : isPlayedVerse ? '#F57C00' : PAPER_TEXT;
    
    // Landscape layout: Full width Arabic on top, translation below (optimized for landscape)
    if (isLandscape) {
      const landscapeFontScale = 1.25; // Larger in landscape for better readability
      return (
        <View 
          style={[
            styles.verseContainer,
            styles.verseContainerLandscape,
            t.id === 'parchment-classic' && styles.verseContainerParchment,
          ]}
        >
          <LinearGradient
            colors={verseCardColors}
            style={[styles.verseContainerGradient, styles.verseContainerGradientLandscape]}
          >
          {/* Header row with verse number and controls */}
          <View style={[styles.verseHeader, styles.verseHeaderLandscape]}>
            <View style={[styles.verseNumberBadge, isCurrentVerse && styles.verseNumberBadgeActive, isPlayedVerse && !isCurrentVerse && styles.verseNumberBadgePlayed]}>
              <View style={styles.verseNumberOverlay} pointerEvents="none">
                <Text style={[styles.verseRubElHizb, { color: ICON_GOLD, fontSize: 36 }]}>{RUB_EL_HIZB}</Text>
              </View>
              <View style={styles.verseNumberOverlay} pointerEvents="none">
                <Text style={[
                  styles.verseNumberText,
                  styles.verseNumberTextLandscape,
                  { color: PAPER_TEXT },
                  isCurrentVerse && styles.verseNumberTextActive,
                  isPlayedVerse && !isCurrentVerse && styles.verseNumberTextPlayed
                ]}>
                  {verse.verseNumber}
                </Text>
              </View>
            </View>
            
            {isCurrentVerse && (
              <View style={[styles.playingIndicator, { backgroundColor: '#4CAF50' }]}>
                <IconSymbol name="play.fill" size={12} color="#FFFFFF" />
              </View>
            )}
            
            {isPlayedVerse && !isCurrentVerse && (
              <View style={[styles.playedIndicator, { backgroundColor: '#FF9800' }]}>
                <IconSymbol name="checkmark" size={12} color="#FFFFFF" />
              </View>
            )}
          </View>

          {/* Full width Arabic text */}
          {bismillahText && (
            <View style={{ marginBottom: 12 }}>
              <TajweedText
                text={bismillahText}
                enableTajweed={settings.enableTajweed}
                isDarkMode={isDarkReader}
                style={[
                  styles.arabicText, 
                  { 
                    fontSize: fontSizes.arabic * landscapeFontScale,
                    lineHeight: fontSizes.lineHeightArabic * landscapeFontScale,
                    color: verseTextColor,
                    fontFamily: currentFontFamily,
                    textAlign: 'center',
                    flexWrap: 'wrap',
                    flexShrink: 1,
                  }
                ]}
              />
            </View>
          )}

          {remainingText && (
            <View style={{ alignSelf: 'stretch' }}>
              <TajweedText
                text={remainingText}
                enableTajweed={settings.enableTajweed}
                isDarkMode={isDarkReader}
                style={[
                  styles.arabicText, 
                  { 
                    fontSize: fontSizes.arabic * landscapeFontScale,
                    lineHeight: fontSizes.lineHeightArabic * landscapeFontScale,
                    color: verseTextColor,
                    fontFamily: currentFontFamily,
                    flexWrap: 'wrap',
                    flexShrink: 1,
                  }
                ]}
              />
            </View>
          )}
          
          {/* Full width translation below (only when show translation is on) */}
          {settings.showTranslation && (
            <Text style={[
              styles.translationText, 
              { 
                fontSize: fontSizes.translation * landscapeFontScale,
                lineHeight: fontSizes.lineHeightTranslation * landscapeFontScale,
                color: verseTextColor === PAPER_TEXT ? PAPER_TEXT_SECONDARY : verseTextColor
              }
            ]}>
              {verse.translation || 'Translation not available'}
            </Text>
          )}
          </LinearGradient>
        </View>
      );
    }

    // Portrait layout (original)
    return (
      <View 
        style={[styles.verseContainer, t.id === 'parchment-classic' && styles.verseContainerParchment]}
      >
        <LinearGradient
          colors={verseCardColors}
          style={styles.verseContainerGradient}
        >
        <View style={styles.verseHeader}>
          <View style={[styles.verseNumberBadge, isCurrentVerse && styles.verseNumberBadgeActive, isPlayedVerse && !isCurrentVerse && styles.verseNumberBadgePlayed]}>
            <View style={styles.verseNumberOverlay} pointerEvents="none">
              <Text style={[styles.verseRubElHizb, { color: ICON_GOLD }]}>{RUB_EL_HIZB}</Text>
            </View>
            <View style={styles.verseNumberOverlay} pointerEvents="none">
              <Text style={[styles.verseNumberText, { color: PAPER_TEXT }, isCurrentVerse && styles.verseNumberTextActive, isPlayedVerse && !isCurrentVerse && styles.verseNumberTextPlayed]}>
                {verse.verseNumber}
              </Text>
            </View>
          </View>
          
          {isCurrentVerse && (
            <View style={[styles.playingIndicator, { backgroundColor: '#4CAF50' }]}>
              <IconSymbol 
                name="play.fill" 
                size={12} 
                color="#FFFFFF" 
              />
            </View>
          )}
          
          {isPlayedVerse && !isCurrentVerse && (
            <View style={[styles.playedIndicator, { backgroundColor: '#FF9800' }]}>
              <IconSymbol 
                name="checkmark" 
                size={12} 
                color="#FFFFFF" 
              />
            </View>
          )}
        </View>

        {/* Render Bismillah separately if it exists */}
        {bismillahText && (
          <View style={{ marginBottom: 16 }}>
            <TajweedText
              text={bismillahText}
              enableTajweed={settings.enableTajweed}
              isDarkMode={isDarkReader}
              style={[
                styles.arabicText, 
                { 
                  fontSize: fontSizes.arabic,
                  lineHeight: fontSizes.lineHeightArabic,
                  color: verseTextColor,
                  fontFamily: currentFontFamily,
                  textAlign: 'center',
                  flexWrap: 'wrap',
                  flexShrink: 1,
                }
              ]}
            />
          </View>
        )}

        {/* Render remaining text */}
        {remainingText && (
          <View style={{ alignSelf: 'stretch' }}>
            <TajweedText
              text={remainingText}
              enableTajweed={settings.enableTajweed}
              isDarkMode={isDarkReader}
              style={[
                styles.arabicText, 
                { 
                  fontSize: fontSizes.arabic,
                  lineHeight: fontSizes.lineHeightArabic,
                  color: verseTextColor,
                  fontFamily: currentFontFamily,
                  flexWrap: 'wrap',
                  flexShrink: 1,
                }
              ]}
            />
          </View>
        )}
        
        {settings.showTranslation && (
          <Text style={[
            styles.translationText, 
            { 
              fontSize: fontSizes.translation,
              lineHeight: fontSizes.lineHeightTranslation,
              color: verseTextColor === PAPER_TEXT ? PAPER_TEXT_SECONDARY : verseTextColor
            }
          ]}>
            {verse.translation || 'Translation not available'}
          </Text>
        )}
        </LinearGradient>
        </View>
      );
    }, [audioState, selectedChapter, playedVerses, fontSizes, settings.enableTajweed, settings.showTranslation, theme, currentFontFamily, isLandscape, verseCardColors, PAPER_TEXT, PAPER_TEXT_SECONDARY, isDarkReader, t.id]);

  // Key extractor for FlatList
  const keyExtractor = useCallback((item: Verse) => `verse-${item.id}`, []);

  // FlatList header component
  const renderHeader = useCallback(() => (
    <>
      {/* Hide header in landscape for more reading space */}
      {!isLandscape && (
        <View style={[styles.header, { backgroundColor: 'transparent' }]}>
          <Text style={[styles.title, { color: PAPER_TEXT }]}>
            القرآن الكريم
          </Text>
          <Text style={[styles.subtitle, { color: PAPER_TEXT_SECONDARY }]}>
            The Holy Quran
          </Text>
        </View>
      )}

      {/* Loading State */}
      {isLoading && (
        <View style={[styles.loadingContainer, { backgroundColor: 'transparent' }]}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: PAPER_TEXT_SECONDARY }]}>
            Loading chapter...
          </Text>
        </View>
      )}

      {/* Empty State */}
      {!isLoading && !currentChapter && !isLoadingChapters && (
        <View style={[styles.emptyContainer, { backgroundColor: 'transparent' }]}>
          <IconSymbol name="book" size={64} color={PAPER_TEXT_SECONDARY} />
          <Text style={[styles.emptyText, { color: PAPER_TEXT_SECONDARY }]}>
            Select a chapter to begin reading
          </Text>
        </View>
      )}
    </>
  ), [colors.tint, isLoadingChapters, isLoading, currentChapter, isLandscape]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: PAPER_BG }]}>
        <GestureDetector style={{ flex: 1 }} gesture={tapGesture}>
          <FlatList
        ref={flatListRef}
        data={currentChapter?.verses || []}
        renderItem={renderVerse}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ 
          paddingTop: isLandscape ? insets.top + 80 : insets.top + 165,
          paddingBottom: selectedChapter ? (isLandscape ? 120 : 280) : 20,
          paddingLeft: isLandscape ? Math.max(24, insets.left) : 16,
          paddingRight: isLandscape ? Math.max(24, insets.right) : 16,
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onContentSizeChange={() => {
          const offset = pendingScrollOffsetRef.current;
          if (offset != null && offset > 0 && flatListRef.current && !restoreAppliedRef.current) {
            try {
              flatListRef.current.scrollToOffset({ offset, animated: false });
              scrollPositionRef.current = offset;
              lastUserScrollYRef.current = offset;
              restoreAppliedRef.current = true;
              pendingScrollOffsetRef.current = null;
              setPendingScrollY(null);
              setHasRestoredPosition(true);
            } catch (_) {}
          }
        }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={5}
        windowSize={10}
        onScrollToIndexFailed={(info) => {
          // Handle scroll to index failure gracefully
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({ 
              index: info.index, 
              animated: true,
              viewPosition: 0.3 
            });
          });
        }}
      />
        </GestureDetector>

      {/* Sticky Chapter Selector */}
      <View style={[
        styles.stickyChapterSelector, 
        isLandscape && styles.stickyChapterSelectorLandscape,
        { 
          backgroundColor: PAPER_BG,
          borderBottomColor: 'rgba(44,36,22,0.12)',
          paddingTop: isLandscape ? insets.top + 8 : insets.top + 16,
          paddingLeft: isLandscape ? Math.max(20, insets.left) : undefined,
          paddingRight: isLandscape ? Math.max(20, insets.right) : undefined,
        }
      ]}>
        <View style={styles.stickyBackAndDropdown}>
          <TouchableOpacity
            style={styles.backToLandingButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
            accessibilityLabel="Back to Quran"
            accessibilityRole="button"
          >
            <IconSymbol name="chevron.left" size={24} color={PAPER_TEXT} />
            <Text style={[styles.backToLandingLabel, { color: PAPER_TEXT }]}>Back</Text>
          </TouchableOpacity>
          <View style={styles.stickyDropdownWrap}>
          <Dropdown
            items={dropdownItems}
            selectedItem={selectedDropdownItem}
            onSelect={(item) => {
              const chapter = chapterMap.get(item.id);
              if (chapter) {
                setIsLoading(true);
                handleChapterSelect(chapter);
              }
            }}
            placeholder="Select a chapter"
            disabled={isLoadingChapters || isLoading}
            leftIcon={<Text style={[styles.chapterDropdownIcon, { color: ICON_GOLD }, isLandscape && { fontSize: 32 }]}>{RUB_EL_HIZB}</Text>}
            buttonStyle={[styles.chapterDropdownButton, { backgroundColor: PAPER_CARD }, isLandscape && styles.chapterDropdownButtonLandscape]}
            triggerTextColor={PAPER_TEXT}
            triggerPlaceholderColor={PAPER_TEXT_SECONDARY}
            triggerChevronColor={PAPER_TEXT_SECONDARY}
            listBackgroundColor={PAPER_CARD}
            listBorderColor="rgba(255,255,255,0.1)"
            itemTextColor={PAPER_TEXT}
            itemSelectedBackgroundColor="#2E7D32"
            itemSelectedTextColor={PAPER_TEXT}
            itemBorderColor="rgba(255,255,255,0.08)"
          />
          </View>
        </View>
        
        {/* Compact audio controls + progress bar in landscape */}
        {isLandscape && currentChapter && (
          <View style={styles.landscapeAudioControls}>
            {/* Chapter progress bar */}
            <View style={styles.landscapeProgressContainer}>
              <View style={styles.landscapeProgressTrack}>
                <View 
                  style={[
                    styles.landscapeProgressFill,
                    { 
                      width: `${(audioState.currentVerse && currentChapter?.verses?.length
                        ? Math.min(100, (audioState.currentVerse / currentChapter.verses.length) * 100)
                        : 0)}%` 
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.landscapeProgressText, { color: PAPER_TEXT }]}>
                {audioState.currentVerse && currentChapter?.verses
                  ? `Verse ${audioState.currentVerse} / ${currentChapter.verses.length}`
                  : '—'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.landscapePlayButton}
              onPress={handlePlayPause}
              activeOpacity={0.7}
            >
              <IconSymbol 
                name={audioState.isPlaying ? "pause.circle.fill" : "play.circle.fill"}
                size={48}
                color={audioState.isPlaying ? '#E57373' : '#4CAF50'}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Bottom Tabs Navigation – tap anywhere to toggle visibility */}
      {selectedChapter && !isLandscape && (
        <Animated.View 
          style={[
            styles.bottomTabsContainer,
            {
              backgroundColor: TAB_BAR_BG,
              borderTopColor: 'rgba(0,0,0,0.12)',
              paddingBottom: insets.bottom,
              transform: [{ translateY: bottomTabsAnim }],
            }
          ]}
        >
          {/* Audio Status Bar */}
          {audioState.isPlaying && audioState.currentVerse && (
            <View style={[
              styles.audioStatusBar, 
              { 
                backgroundColor: audioState.currentChapter === selectedChapter?.id 
                  ? 'rgba(138,154,130,0.25)' 
                  : 'rgba(198,40,40,0.2)',
                borderBottomColor: 'rgba(255,255,255,0.06)' 
              }
            ]}>
              <View style={styles.audioStatusContent}>
                <IconSymbol 
                  name="waveform" 
                  size={16} 
                  color={audioState.currentChapter === selectedChapter?.id ? TAB_ACTIVE_BG : '#E57373'} 
                />
                <Text style={[styles.audioStatusText, { color: '#E8E6E3' }]}>
                  {audioState.currentChapter === selectedChapter?.id ? (
                    `Now Playing: Verse ${audioState.currentVerse} of ${currentChapter?.verses.length}`
                  ) : (
                    `Playing from different chapter - Select the playing chapter or stop audio`
                  )}
                </Text>
              </View>
            </View>
          )}
          
          {/* Tab Buttons (Play, Tajweed, Fonts — back to landing is via top Back button) */}
          <View style={styles.tabButtons}>
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handlePlayPause();
              }}
              activeOpacity={0.8}
              disabled={isLoadingAudio}
            >
              {isLoadingAudio ? (
                <ActivityIndicator size="small" color={ICON_GOLD} />
              ) : (
                <IconSymbol 
                  name={audioState.isPlaying ? 'pause.circle' : (activeTab === 'play' ? 'play.circle.fill' : 'play.circle')}
                  size={IS_IPAD ? 60 : 50}
                  color={audioState.isPlaying ? '#C62828' : (activeTab === 'play' ? '#4CAF50' : TAB_INACTIVE)}
                />
              )}
              <View style={[styles.tabIndicator, { backgroundColor: activeTab === 'play' ? '#4CAF50' : 'transparent' }]} />
              <Text style={[
                styles.tabButtonText,
                {
                  color: audioState.isPlaying ? '#E57373' : isLoadingAudio ? ICON_GOLD : (activeTab === 'play' ? '#4CAF50' : TAB_INACTIVE),
                  fontWeight: activeTab === 'play' ? '600' : '400',
                }
              ]}>
                {isLoadingAudio ? 'Loading...' : audioState.isPlaying ? 'Pause' : 'Play Surah'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => {
                const newTab = activeTab === 'tajweed' ? 'play' : 'tajweed';
                handleTabChange(newTab);
              }}
              activeOpacity={0.6}
            >
              <IconSymbol 
                name="book.closed"
                size={IS_IPAD ? 40 : 30} 
                color={activeTab === 'tajweed' ? TAB_ACTIVE : TAB_INACTIVE} 
              />
              <View style={[styles.tabIndicator, { backgroundColor: activeTab === 'tajweed' ? TAB_ACTIVE : 'transparent' }]} />
              <Text style={[
                styles.tabButtonText,
                { color: activeTab === 'tajweed' ? TAB_ACTIVE : TAB_INACTIVE, fontWeight: activeTab === 'tajweed' ? '600' : '400' }
              ]}>
                Tajweed
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => {
                const newTab = activeTab === 'fonts' ? 'play' : 'fonts';
                handleTabChange(newTab);
              }}
              activeOpacity={0.6}
            >
              <IconSymbol 
                name="textformat.size"
                size={IS_IPAD ? 40 : 30} 
                color={activeTab === 'fonts' ? TAB_ACTIVE : TAB_INACTIVE} 
              />
              <View style={[styles.tabIndicator, { backgroundColor: activeTab === 'fonts' ? TAB_ACTIVE : 'transparent' }]} />
              <Text style={[
                styles.tabButtonText,
                { color: activeTab === 'fonts' ? TAB_ACTIVE : TAB_INACTIVE, fontWeight: activeTab === 'fonts' ? '600' : '400' }
              ]}>
                Quran Font
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content - Only show when tab bar expanded */}
          {selectedChapter && (activeTab === 'tajweed' || activeTab === 'fonts') && (
            <View style={[styles.tabContent, { backgroundColor: TAB_BAR_BG }]}>
              {/* Tajweed Tab */}
              {activeTab === 'tajweed' && (
              <View style={styles.scrollTabContent}>
                <View style={styles.scrollHeader}>
                  <Text style={[styles.tabContentTitle, { color: TAB_CONTENT_TEXT }]}>
                    Tajweed Settings
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={[
                    styles.scrollActionButton,
                    { 
                      backgroundColor: settings.enableTajweed ? TAB_ACTIVE_BG : 'rgba(255,255,255,0.08)',
                      borderColor: 'rgba(255,255,255,0.15)',
                      borderWidth: settings.enableTajweed ? 0 : 1,
                    }
                  ]}
                  onPress={() => {
                    toggleTajweed();
                  }}
                  activeOpacity={0.7}
                >
                  <IconSymbol 
                    name={settings.enableTajweed ? "checkmark.circle.fill" : "circle"} 
                    size={20} 
                    color={settings.enableTajweed ? TAB_ACTIVE_TEXT : TAB_INACTIVE} 
                  />
                  <Text style={[
                    styles.scrollActionButtonText,
                    { color: settings.enableTajweed ? TAB_ACTIVE_TEXT : TAB_CONTENT_TEXT }
                  ]}>
                    {settings.enableTajweed ? 'Tajweed Enabled' : 'Enable Tajweed'}
                  </Text>
                </TouchableOpacity>

                {settings.enableTajweed && (
                  <View style={{ marginTop: 16 }}>
                    <TajweedLegend />
                  </View>
                )}
              </View>
            )}

            {/* Fonts Tab */}
            {activeTab === 'fonts' && (
              <View style={styles.fontsTabContent}>
                <Text style={[styles.tabContentTitle, { color: TAB_CONTENT_TEXT }]}>
                  Quran Fonts
                </Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.fontsList}
                  contentContainerStyle={styles.fontsListContent}
                  removeClippedSubviews={true}
                >
                  {fontOptions.map((font) => (
                    <TouchableOpacity
                      key={font.id}
                      style={[
                        styles.fontCard,
                        {
                          backgroundColor: settings.selectedFont === font.id ? TAB_ACTIVE_BG : 'rgba(255,255,255,0.08)',
                          borderColor: 'rgba(255,255,255,0.15)'
                        }
                      ]}
                      onPress={() => {
                        updateFont(font.id);
                      }}
                      activeOpacity={0.6}
                    >
                      <Text style={[
                        styles.fontPreview,
                        {
                          fontFamily: font.fontFamily,
                          color: settings.selectedFont === font.id ? '#1A1A1A' : TAB_CONTENT_TEXT
                        }
                      ]}>
                        بِسْمِ اللَّهِ
                      </Text>
                      <Text 
                        numberOfLines={1}
                        style={[
                          styles.fontCardName,
                          { color: settings.selectedFont === font.id ? TAB_ACTIVE_TEXT : TAB_CONTENT_TEXT }
                        ]}
                      >
                        {font.name}
                      </Text>
                      {settings.selectedFont === font.id && (
                        <View style={styles.selectedBadge}>
                          <IconSymbol name="checkmark.circle.fill" size={16} color={TAB_ACTIVE_TEXT} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              )}
            </View>
          )}
        </Animated.View>
      )}

      {/* Resume mode popover - appears when app loads with saved position, dismisses on select */}
      {showResumePopover && selectedChapter && (
        <View style={[styles.resumePopover, { bottom: insets.bottom + 110, backgroundColor: TAB_BAR_BG }]}>
          <Text style={[styles.resumePopoverLabel, { color: TAB_CONTENT_TEXT }]}>Resume</Text>
          <View style={styles.resumePopoverRow}>
            <TouchableOpacity
              style={[
                styles.resumePopoverButton,
                { backgroundColor: settings.resumeMode === 'read' ? TAB_ACTIVE_BG : 'rgba(255,255,255,0.08)' }
              ]}
              onPress={() => {
                updateResumeMode('read');
                scrollToLastReadPosition();
                setShowResumePopover(false);
              }}
              activeOpacity={0.7}
            >
              <IconSymbol name="book" size={18} color={settings.resumeMode === 'read' ? TAB_ACTIVE_TEXT : TAB_INACTIVE} />
              <Text style={[styles.resumePopoverButtonText, { color: settings.resumeMode === 'read' ? TAB_ACTIVE_TEXT : TAB_CONTENT_TEXT }]}>Read</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.resumePopoverButton,
                { backgroundColor: settings.resumeMode === 'listen' ? TAB_ACTIVE_BG : 'rgba(255,255,255,0.08)' }
              ]}
              onPress={() => {
                updateResumeMode('listen');
                scrollToLastPlayedVerse();
                setShowResumePopover(false);
              }}
              activeOpacity={0.7}
            >
              <IconSymbol name="play.circle" size={18} color={settings.resumeMode === 'listen' ? TAB_ACTIVE_TEXT : TAB_INACTIVE} />
              <Text style={[styles.resumePopoverButtonText, { color: settings.resumeMode === 'listen' ? TAB_ACTIVE_TEXT : TAB_CONTENT_TEXT }]}>Listen</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
        {t.id === 'parchment-classic' && <PaperTextureOverlay />}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  stickyChapterSelector: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
    zIndex: 1000,
  },
  stickyBackAndDropdown: {
    flexDirection: 'column',
    width: '100%',
  },
  backToLandingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingRight: 8,
    marginBottom: 8,
    gap: 4,
    alignSelf: 'flex-start',
  },
  backToLandingLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  stickyDropdownWrap: {
    width: '100%',
  },
  chapterDropdownButton: {
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 9999,
    paddingVertical: 4,
    minHeight: 36,
    shadowColor: '#2C2416',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  chapterDropdownIcon: {
    fontSize: 32,
    fontFamily: Fonts.primary,
  },
  header: {
    padding: 16,
    paddingVertical: 2,
    alignItems: 'center',
    marginTop: 0,
  },
  title: {
    fontSize: IS_IPAD ? 62 : 36,
    fontWeight: 'bold',
    fontFamily: Fonts.primary,
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: IS_IPAD ? 1 : 0.5,
  },
  subtitle: {
    fontSize: IS_IPAD ? 30 : 16,
    fontFamily: Fonts.roboto,
    opacity: 0.7,
    textAlign: 'center',
    fontWeight: '400',
  },
  controlsContainer: {
    padding: 12,
    paddingTop: 32,
    gap: 10,
  },
  displayOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  optionButtonText: {
    fontSize: 14,
    fontFamily: Fonts.roboto,
    fontWeight: '600',
  },
  tajweedLegendContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  chapterInfo: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 12,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  chapterTitle: {
    fontSize: IS_IPAD ? 34 : 22,
    fontFamily: Fonts.roboto,
    fontWeight: '900',
    marginBottom: 4,
  },
  chapterSubtitle: {
    fontSize: IS_IPAD ? 22 : 15,
    fontFamily: Fonts.roboto,
    opacity: 0.9,
    marginBottom: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: IS_IPAD ? 20 : 16,
    fontFamily: Fonts.roboto,
  },
  versesContainer: {
    padding: 12,
    paddingTop: 10,
    overflow: 'visible',
  },
  verseContainer: {
    marginBottom: 14,
    marginHorizontal: 2,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 0,
    shadowColor: '#2C2416',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
  },
  verseContainerParchment: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  verseContainerGradient: {
    paddingTop: 20,
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderRadius: 24,
  },
  verseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    minHeight: 36,
    paddingTop: 4,
  },
  verseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseNumberBadge: {
    width: 52,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: 'transparent',
    borderWidth: 0,
    overflow: 'visible',
  },
  verseNumberBadgeActive: {
    backgroundColor: 'rgba(76,175,80,0.15)',
  },
  verseNumberBadgePlayed: {
    backgroundColor: 'rgba(255,152,0,0.12)',
  },
  verseRubElHizb: {
    fontSize: 44,
    fontFamily: Fonts.primary,
    textAlign: 'center',
    width: 52,
    includeFontPadding: false,
  },
  verseNumberOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: 52,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verseNumberText: {
    fontSize: 15,
    fontFamily: Fonts.roboto,
    fontWeight: '900',
    textAlign: 'center',
    includeFontPadding: false,
    minWidth: 52,
    transform: [{ translateY: 5 }],
  },
  verseNumberTextActive: {
    color: '#2E7D32',
  },
  verseNumberTextPlayed: {
    color: '#E65100',
  },
  verseNumberTextLandscape: {
    transform: [{ translateY: 1 }],
  },
  playingIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arabicText: {
    fontSize: IS_IPAD ? 44 : 30,
    fontFamily: Fonts.primary,
    fontWeight: '900',
    marginTop: 4,
    marginBottom: 8,
    textAlign: 'right',
    direction: 'rtl',
    includeFontPadding: false,
    paddingTop: 2,
    flexWrap: 'wrap',
    width: '100%',
  },
  translationText: {
    fontSize: IS_IPAD ? 22 : 16,
    fontFamily: Fonts.roboto,
    opacity: 0.9,
    includeFontPadding: false,
    flexWrap: 'wrap',
    width: '100%',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: IS_IPAD ? 22 : 16,
    fontFamily: Fonts.roboto,
    textAlign: 'center',
    opacity: 0.7,
  },
  // Bottom Tabs – tap anywhere to toggle visibility
  bottomTabsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 0.5,
    paddingTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 16,
  },
  audioStatusBar: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  audioStatusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  audioStatusText: {
    fontSize: 13,
    fontFamily: Fonts.roboto,
    fontWeight: '600',
  },
  tabButtons: {
    flexDirection: 'row',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 3,
  },
  tabIndicator: {
    height: 1.5,
    width: 20,
    borderRadius: 1,
    alignSelf: 'center',
    marginTop: 1,
    marginBottom: 0,
  },
  tabButtonText: {
    fontSize: IS_IPAD ? 18 : 14,
    fontWeight: '700',
    fontFamily: Fonts.roboto,
  },
  resumePopover: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  resumePopoverLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.9,
  },
  resumePopoverRow: {
    flexDirection: 'row',
    gap: 10,
  },
  resumePopoverButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resumePopoverButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Fonts.roboto,
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  tabContentTitle: {
    fontSize: IS_IPAD ? 24 : 18,
    fontFamily: Fonts.roboto,
    fontWeight: '700',
    marginBottom: 12,
  },
  // Scroll Tab
  scrollTabContent: {
    gap: 12,
  },
  scrollHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  scrollStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  scrollStatusText: {
    fontSize: 11,
    fontFamily: Fonts.roboto,
    fontWeight: '600',
    color: 'white',
  },
  speedControls: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  speedButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedButtonText: {
    fontSize: 14,
    fontFamily: Fonts.roboto,
    fontWeight: '600',
  },
  scrollControlButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  scrollActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  scrollActionButtonText: {
    color: 'white',
    fontSize: IS_IPAD ? 18 : 16,
    fontFamily: Fonts.roboto,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // Fonts Tab
  fontsTabContent: {
    gap: 14,
  },
  fontsList: {
    maxHeight: IS_IPAD ? 160 : 130,
  },
  fontsListContent: {
    gap: IS_IPAD ? 24 : 16,
    paddingRight: 16,
  },
  fontCard: {
    width: IS_IPAD ? 160 : 120,
    height: IS_IPAD ? 120 : 90,
    borderRadius: 16,
    borderWidth: 2,
    padding: IS_IPAD ? 14 : 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  fontPreview: {
    fontSize: IS_IPAD ? 34 : 24,
    marginBottom: 10,
    textAlign: 'center',
  },
  fontCardName: {
    fontSize: IS_IPAD ? 16 : 13,
    fontFamily: Fonts.roboto,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  // Landscape styles
  stickyChapterSelectorLandscape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  chapterDropdownButtonLandscape: {
    flex: 1,
    maxWidth: '90%',
  },
  landscapeAudioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    marginLeft: 16,
    gap: 12,
  },
  landscapeProgressContainer: {
    flex: 1,
    minWidth: 0,
  },
  landscapeProgressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  landscapeProgressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  landscapeProgressText: {
    fontSize: 11,
    fontFamily: Fonts.roboto,
    fontWeight: '500',
  },
  landscapePlayButton: {
    marginLeft: 0,
    marginRight: 8,
  },
  verseContainerLandscape: {
    marginBottom: 10,
  },
  verseContainerGradientLandscape: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  verseHeaderLandscape: {
    marginBottom: 8,
  },
});

export default function QuranScreen() {
  return <QuranScreenContent />;
}