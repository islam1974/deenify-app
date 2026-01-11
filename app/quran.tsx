import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Dropdown from '@/components/ui/dropdown';
import { Colors, Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import QuranService, { Chapter, ChapterWithVerses, Verse } from '@/services/QuranService';
import AudioService from '@/services/AudioService';
import { useQuranSettings } from '@/contexts/QuranSettingsContext';
import TajweedText from '@/components/TajweedText';
import TajweedLegend from '@/components/TajweedLegend';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_IPAD = Platform.OS === 'ios' ? Boolean((Platform as any).isPad) : SCREEN_WIDTH >= 768;
const IS_SMALL_PHONE = SCREEN_WIDTH < 400;
const READING_POSITIONS_KEY = 'quran_reading_positions_v1';

type ReadingPosition = {
  chapterId: number;
  scrollY: number;
  lastPlayedVerse: number | null;
  timestamp: number;
  reciter: string;
  translator: string;
  font: string;
};

type BottomTab = 'dashboard' | 'play' | 'tajweed' | 'fonts';

function QuranScreenContent() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = Colors[((theme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const { settings, getReciterOptions, getTranslatorOptions, getFontOptions, toggleTranslation, toggleArabic, updateReciter, updateTranslator, updateFont, toggleTajweed } = useQuranSettings();
  const reciterOptions = getReciterOptions();
  const translatorOptions = getTranslatorOptions();
  const fontOptions = getFontOptions();
  const insets = useSafeAreaInsets();
  
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
  }, [loadChapters, loadReadingPositions]);
  
  // Scroll refs
  const flatListRef = useRef<FlatList>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollPositionRef = useRef<number>(0); // Track scroll position for auto-scroll
  const [hasRestoredPosition, setHasRestoredPosition] = useState(false);
  const [pendingScrollY, setPendingScrollY] = useState<number | null>(null);
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const readingPositionsRef = useRef<Record<string, ReadingPosition>>({});
  const [initialChapterResolved, setInitialChapterResolved] = useState(false);

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
    
    return () => {
      unsubscribe();
      if (scrollIntervalRef.current !== null) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
        setIsAutoScrolling(false);
      }
    };
  }, []);

  // Save position when leaving the screen
  useEffect(() => {
    return () => {
      saveReadingPosition();
    };
  }, [saveReadingPosition]);

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


  // Removed scroll handler - player is now always visible

  // Save reading position to AsyncStorage
  const saveReadingPosition = useCallback(async () => {
    try {
      if (selectedChapter && scrollPosition !== undefined) {
        const key = String(selectedChapter.id);
        const positionData: ReadingPosition = {
          chapterId: selectedChapter.id,
          scrollY: scrollPosition,
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
    scrollPosition,
    audioState.currentVerse,
    settings.selectedReciter,
    settings.selectedTranslator,
    settings.selectedFont,
    persistReadingPositions,
  ]);

  // Save position whenever scroll changes (with throttling)
  const handleScroll = useCallback((event: any) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    setScrollPosition(yOffset);
    scrollPositionRef.current = yOffset; // Update ref for auto-scroll
  }, []);

  // Save position when chapter, scroll, or verse changes
  useEffect(() => {
    if (selectedChapter && scrollPosition >= 0) {
      // Debounce the save to avoid too many writes
      const timer = setTimeout(() => {
        saveReadingPosition();
      }, 1000); // Save 1 second after scroll stops
      
      return () => clearTimeout(timer);
    }
  }, [selectedChapter, scrollPosition, audioState.currentVerse]);

  // Restore scroll position after verses are loaded
  useEffect(() => {
    if (currentChapter && currentChapter.verses && currentChapter.verses.length > 0 && pendingScrollY !== null && !hasRestoredPosition) {
      const timer = setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({ 
            offset: pendingScrollY, 
            animated: false
          });
          scrollPositionRef.current = pendingScrollY;
        }
        setPendingScrollY(null);
        setHasRestoredPosition(true);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [currentChapter, pendingScrollY, hasRestoredPosition]);

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
      
      // Only try to restore position on initial chapter load
      if (!skipPositionRestore && !hasRestoredPosition) {
        const savedPosition = getSavedPositionForChapter(chapterNumber);
        if (savedPosition) {
          setPendingScrollY(savedPosition.scrollY);
        } else {
          setPendingScrollY(null);
        }
        setHasRestoredPosition(true);
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
      setSelectedChapter(chapter);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error switching chapter:', error);
      // Still proceed with chapter change even if stop fails
      setHasRestoredPosition(false);
      setPendingScrollY(null);
      setSelectedChapter(chapter);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [saveReadingPosition]);

  const handleVersePlay = useCallback(async (verse: Verse) => {
    if (!selectedChapter) return;
    
    try {
      console.log('🎵 Playing single verse (manual tap):', {
        chapter: selectedChapter.id,
        verse: verse.verseNumber,
        audioUrl: verse.audioUrl,
        reciter: settings.selectedReciter
      });
      
      // Stop any continuous playback and clear context
      await AudioService.stop();
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await AudioService.playVerse(verse.audioUrl!, selectedChapter.id, verse.verseNumber, settings.selectedReciter);
      console.log('✅ Single verse play initiated');
    } catch (error) {
      console.error('❌ Error playing verse:', error);
      Alert.alert('Audio Error', 'Failed to play audio. Please check your internet connection and try again.');
    }
  }, [selectedChapter, settings.selectedReciter]);

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
      label: `${chapter.id}. ${chapter.nameTransliterated} (${chapter.name})`,
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
      // Debug: Log the verse text to see what we're working with
      console.log(`Chapter ${selectedChapter?.id} verse 1:`, verseText.substring(0, 60));
      
      // Try to find and extract Bismillah
      for (const bismillah of bismillahVariations) {
        if (verseText.includes(bismillah)) {
          bismillahText = bismillah;
          remainingText = verseText.replace(bismillah, '').trim();
          console.log(`✅ Found Bismillah variation in chapter ${selectedChapter?.id}`);
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
            console.log(`✅ Extracted Bismillah by finding Rahim in chapter ${selectedChapter?.id}`);
            break;
          }
        }
      }
      
      console.log(`Bismillah: "${bismillahText}"`);
      console.log(`Remaining: "${remainingText.substring(0, 20)}..."`);
    }

    return (
      <TouchableOpacity 
        style={[styles.verseContainer, { backgroundColor: '#000000' }]}
        onPress={() => handleVersePlay(verse)}
        activeOpacity={0.7}
      >
        <View style={styles.verseHeader}>
          <View style={[
            styles.verseNumber, 
            { 
              backgroundColor: isCurrentVerse ? '#4CAF50' : 
                              isPlayedVerse ? '#FFEB3B' : '#2196F3' 
            }
          ]}>
            <Text style={[styles.verseNumberText, { color: '#FFFFFF' }]}>
              {verse.verseNumber}
            </Text>
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
            <View style={[styles.playedIndicator, { backgroundColor: '#FFEB3B' }]}>
              <IconSymbol 
                name="checkmark" 
                size={12} 
                color="#000000" 
              />
            </View>
          )}
          
          {/* Play button for verse */}
          <TouchableOpacity 
            style={styles.versePlayButton}
            onPress={() => handleVersePlay(verse)}
            activeOpacity={0.6}
          >
            <IconSymbol 
              name={isCurrentVerse && audioState.isPlaying ? "pause.circle.fill" : "play.circle.fill"}
              size={28} 
              color={isCurrentVerse ? '#4CAF50' : '#2196F3'} 
            />
          </TouchableOpacity>
        </View>

        {/* Render Bismillah separately if it exists */}
        {bismillahText && (
          <View style={{ marginBottom: 16 }}>
            <TajweedText
              text={bismillahText}
              enableTajweed={settings.enableTajweed}
              isDarkMode={theme === 'dark'}
              style={[
                styles.arabicText, 
                { 
                  fontSize: fontSizes.arabic,
                  lineHeight: fontSizes.lineHeightArabic,
                  color: isCurrentVerse ? '#4CAF50' : isPlayedVerse ? '#FFEB3B' : '#FFFFFF',
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
              isDarkMode={theme === 'dark'}
              style={[
                styles.arabicText, 
                { 
                  fontSize: fontSizes.arabic,
                  lineHeight: fontSizes.lineHeightArabic,
                  color: isCurrentVerse ? '#4CAF50' : isPlayedVerse ? '#FFEB3B' : '#FFFFFF',
                  fontFamily: currentFontFamily,
                  flexWrap: 'wrap',
                  flexShrink: 1,
                }
              ]}
            />
          </View>
        )}
        
        <Text style={[
          styles.translationText, 
          { 
            fontSize: fontSizes.translation,
            lineHeight: fontSizes.lineHeightTranslation,
            color: isCurrentVerse ? '#4CAF50' : isPlayedVerse ? '#FFEB3B' : '#FFFFFF'
          }
        ]}>
          {verse.translation || 'Translation not available'}
        </Text>
      </TouchableOpacity>
    );
  }, [audioState, selectedChapter, playedVerses, fontSizes, settings.enableTajweed, theme, currentFontFamily, handleVersePlay]);

  // Key extractor for FlatList
  const keyExtractor = useCallback((item: Verse) => `verse-${item.id}`, []);

  // FlatList header component
  const renderHeader = useCallback(() => (
    <>
      <View style={[styles.header, { backgroundColor: '#000000' }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          القرآن الكريم
        </Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          The Holy Quran
        </Text>
      </View>

      {/* Loading State */}
      {isLoading && (
        <View style={[styles.loadingContainer, { backgroundColor: '#000000' }]}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading chapter...
          </Text>
        </View>
      )}

      {/* Empty State */}
      {!isLoading && !currentChapter && !isLoadingChapters && (
        <View style={[styles.emptyContainer, { backgroundColor: '#000000' }]}>
          <IconSymbol name="book" size={64} color={colors.icon} />
          <Text style={[styles.emptyText, { color: colors.text }]}>
            Select a chapter to begin reading
          </Text>
        </View>
      )}
    </>
  ), [colors, isLoadingChapters, isLoading, currentChapter]);

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <FlatList
        ref={flatListRef}
        data={currentChapter?.verses || []}
        renderItem={renderVerse}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ 
          paddingTop: insets.top + 180,
          paddingBottom: selectedChapter ? 280 : 20 
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={5}
        windowSize={10}
      />

      {/* Sticky Chapter Selector */}
      <View style={[styles.stickyChapterSelector, { 
        backgroundColor: colors.background,
        borderBottomColor: colors.border,
        paddingTop: insets.top + 16,
      }]}>
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
        />
      </View>

      {/* Bottom Tabs Navigation */}
      {selectedChapter && (
        <View 
          style={[
            styles.bottomTabsContainer,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingBottom: insets.bottom,
            }
          ]}
        >
          {/* Audio Status Bar */}
          {audioState.isPlaying && audioState.currentVerse && (
            <View style={[
              styles.audioStatusBar, 
              { 
                backgroundColor: audioState.currentChapter === selectedChapter?.id 
                  ? colors.tint + '20' 
                  : '#FF5722' + '20',
                borderBottomColor: colors.border 
              }
            ]}>
              <View style={styles.audioStatusContent}>
                <IconSymbol 
                  name="waveform" 
                  size={16} 
                  color={audioState.currentChapter === selectedChapter?.id ? colors.tint : '#FF5722'} 
                />
                <Text style={[styles.audioStatusText, { color: colors.text }]}>
                  {audioState.currentChapter === selectedChapter?.id ? (
                    `Now Playing: Verse ${audioState.currentVerse} of ${currentChapter?.verses.length}`
                  ) : (
                    `Playing from different chapter - Select the playing chapter or stop audio`
                  )}
                </Text>
              </View>
            </View>
          )}
          
          {/* Tab Buttons */}
          <View style={styles.tabButtons}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'dashboard' && styles.tabButtonActive
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(drawer)');
              }}
              activeOpacity={0.8}
            >
              <IconSymbol 
                name="house.fill" 
                size={IS_IPAD ? 40 : 30} 
                color={activeTab === 'dashboard' ? colors.tint : colors.icon} 
              />
              <Text style={[
                styles.tabButtonText,
                { color: activeTab === 'dashboard' ? colors.tint : colors.icon }
              ]}>
                Dashboard
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'play' && styles.tabButtonActive
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handlePlayPause();
              }}
              activeOpacity={0.8}
              disabled={isLoadingAudio}
            >
              {isLoadingAudio ? (
                <ActivityIndicator size="small" color={colors.tint} />
              ) : (
                <IconSymbol 
                  name={audioState.isPlaying ? "pause.circle.fill" : "play.circle.fill"}
                  size={IS_IPAD ? 40 : 30} 
                  color={audioState.isPlaying ? '#FF5722' : colors.icon} 
                />
              )}
              <Text style={[
                styles.tabButtonText,
                { color: audioState.isPlaying ? '#FF5722' : isLoadingAudio ? colors.tint : colors.icon }
              ]}>
                {isLoadingAudio ? 'Loading...' : audioState.isPlaying ? 'Pause' : 'Play Surah'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'tajweed' && styles.tabButtonActive
              ]}
              onPress={() => {
                const newTab = activeTab === 'tajweed' ? 'play' : 'tajweed';
                handleTabChange(newTab);
              }}
              activeOpacity={0.6}
            >
              <IconSymbol 
                name="paintbrush.fill" 
                size={IS_IPAD ? 40 : 30} 
                color={activeTab === 'tajweed' ? colors.tint : colors.icon} 
              />
              <Text style={[
                styles.tabButtonText,
                { color: activeTab === 'tajweed' ? colors.tint : colors.icon }
              ]}>
                Tajweed
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'fonts' && styles.tabButtonActive
              ]}
              onPress={() => {
                const newTab = activeTab === 'fonts' ? 'play' : 'fonts';
                handleTabChange(newTab);
              }}
              activeOpacity={0.6}
            >
              <IconSymbol 
                name="textformat" 
                size={IS_IPAD ? 40 : 30} 
                color={activeTab === 'fonts' ? colors.tint : colors.icon} 
              />
              <Text style={[
                styles.tabButtonText,
                { color: activeTab === 'fonts' ? colors.tint : colors.icon }
              ]}>
                Fonts
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content - Only show when there's content */}
          {selectedChapter && (activeTab === 'tajweed' || activeTab === 'fonts') && (
            <View style={styles.tabContent}>
              {/* Tajweed Tab */}
              {activeTab === 'tajweed' && (
              <View style={styles.scrollTabContent}>
                <View style={styles.scrollHeader}>
                  <Text style={[styles.tabContentTitle, { color: colors.text }]}>
                    Tajweed Settings
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={[
                    styles.scrollActionButton,
                    { 
                      backgroundColor: settings.enableTajweed ? colors.tint : colors.background,
                      borderColor: colors.border,
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
                    color={settings.enableTajweed ? "white" : colors.text} 
                  />
                  <Text style={[
                    styles.scrollActionButtonText,
                    { color: settings.enableTajweed ? "white" : colors.text }
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
                <Text style={[styles.tabContentTitle, { color: colors.text }]}>
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
                          backgroundColor: settings.selectedFont === font.id ? colors.tint : colors.background,
                          borderColor: colors.border
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
                          color: settings.selectedFont === font.id ? 'white' : colors.text
                        }
                      ]}>
                        بِسْمِ اللَّهِ
                      </Text>
                      <Text 
                        numberOfLines={1}
                        style={[
                          styles.fontCardName,
                          { color: settings.selectedFont === font.id ? 'white' : colors.text }
                        ]}
                      >
                        {font.name}
                      </Text>
                      {settings.selectedFont === font.id && (
                        <View style={styles.selectedBadge}>
                          <IconSymbol name="checkmark.circle.fill" size={16} color="white" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              )}
            </View>
          )}
        </View>
      )}
    </LinearGradient>
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
  header: {
    padding: 16,
    paddingVertical: 8,
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
    marginBottom: 4,
    paddingTop: 20,
    paddingHorizontal: 10,
    paddingBottom: 12,
    borderRadius: 8,
    backgroundColor: '#000000', // Always black background
    overflow: 'visible',
  },
  verseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    minHeight: 36,
    paddingTop: 4,
  },
  versePlayButton: {
    padding: 4,
    marginLeft: 'auto',
  },
  verseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseNumberText: {
    fontSize: 14,
    fontFamily: Fonts.roboto,
    fontWeight: '900',
    color: '#FFFFFF',
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
    color: '#FFFFFF', // Default white text
    includeFontPadding: false,
    paddingTop: 2,
    flexWrap: 'wrap',
    width: '100%',
  },
  translationText: {
    fontSize: IS_IPAD ? 22 : 16,
    fontFamily: Fonts.roboto,
    opacity: 0.9,
    color: '#FFFFFF', // Default white text
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
  // Bottom Tabs Styles
  bottomTabsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  audioStatusBar: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  tabButtonActive: {
    borderBottomWidth: 4,
    borderBottomColor: '#4CAF50',
  },
  tabButtonText: {
    fontSize: IS_IPAD ? 18 : 14,
    fontWeight: '700',
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
});

export default function QuranScreen() {
  return <QuranScreenContent />;
}