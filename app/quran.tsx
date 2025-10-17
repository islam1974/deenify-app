import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Alert, Animated } from 'react-native';
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
import { QuranSettingsProvider, useQuranSettings } from '@/contexts/QuranSettingsContext';
import TajweedText from '@/components/TajweedText';
import TajweedLegend from '@/components/TajweedLegend';

const { width: screenWidth } = Dimensions.get('window');
const scaleFactor = screenWidth / 375;

type BottomTab = 'play' | 'autoscroll' | 'fonts' | 'dashboard';

function QuranScreenContent() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = Colors[((theme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const { settings, getReciterOptions, getTranslatorOptions, getFontOptions, toggleTranslation, toggleArabic, updateReciter, updateTranslator, togglePlayTranslation, updateFont } = useQuranSettings();
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
  const [activeTab, setActiveTab] = useState<BottomTab>('play');
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(1); // Speed multiplier
  
  // Scroll and animation refs
  const reciterScrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const autoScrollRef = useRef<number | null>(null); // RAF ID for auto-scroll
  const lastScrollTimeRef = useRef<number>(0);
  const [hasRestoredPosition, setHasRestoredPosition] = useState(false);
  const [pendingScrollY, setPendingScrollY] = useState<number | null>(null);

  // Load chapters on mount
  useEffect(() => {
    loadChapters();
    loadLastReadingPosition();
    
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
      // Cleanup auto-scroll on unmount
      if (autoScrollRef.current !== null) {
        cancelAnimationFrame(autoScrollRef.current);
      }
    };
  }, []);

  // Save position when leaving the screen
  useEffect(() => {
    return () => {
      // Save on unmount only
      if (selectedChapter && scrollPosition >= 0) {
        const positionData = {
          chapterId: selectedChapter.id,
          scrollY: scrollPosition,
          lastPlayedVerse: audioState.currentVerse || null,
          lastReciter: settings.selectedReciter,
          timestamp: Date.now()
        };
        AsyncStorage.setItem('quran_reading_position', JSON.stringify(positionData))
          .then(() => console.log('📖 Saved position on unmount:', positionData))
          .catch(err => console.error('Error saving on unmount:', err));
      }
    };
  }, [selectedChapter, scrollPosition, audioState.currentVerse, settings.selectedReciter]);

  // Update translation settings when they change
  useEffect(() => {
    console.log(`🔊 Updating AudioService translation settings: playTranslation=${settings.playTranslation}, translator=${settings.selectedTranslator}`);
    AudioService.setTranslationSettings(settings.playTranslation, settings.selectedTranslator);
  }, [settings.playTranslation, settings.selectedTranslator]);

  // Load chapter when selected
  useEffect(() => {
    if (selectedChapter) {
      loadChapter(selectedChapter.id);
    }
  }, [selectedChapter]);

  // Reload chapter when translator or font changes
  useEffect(() => {
    if (selectedChapter) {
      loadChapter(selectedChapter.id);
    }
  }, [settings.selectedTranslator, settings.selectedFont]);


  // Removed scroll handler - player is now always visible

  // Save reading position to AsyncStorage
  const saveReadingPosition = async () => {
    try {
      if (selectedChapter && scrollPosition !== undefined) {
        const positionData = {
          chapterId: selectedChapter.id,
          scrollY: scrollPosition,
          lastPlayedVerse: audioState.currentVerse || null,
          lastReciter: settings.selectedReciter,
          timestamp: Date.now()
        };
        await AsyncStorage.setItem('quran_reading_position', JSON.stringify(positionData));
        console.log('📖 Saved reading position:', positionData);
      }
    } catch (error) {
      console.error('Error saving reading position:', error);
    }
  };

  // Load last reading position from AsyncStorage
  const loadLastReadingPosition = async () => {
    try {
      const savedPosition = await AsyncStorage.getItem('quran_reading_position');
      if (savedPosition) {
        const positionData = JSON.parse(savedPosition);
        console.log('📖 Loaded reading position:', positionData);
        return positionData;
      }
    } catch (error) {
      console.error('Error loading reading position:', error);
    }
    return null;
  };

  // Restore scroll position after chapter loads
  const restoreScrollPosition = (scrollY: number) => {
    // Wait longer for verses to fully render, especially with Tajweed
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: scrollY, animated: true });
        console.log('📖 Restored scroll position to:', scrollY);
      }
    }, 800); // Increased delay to allow full render
  };

  // Save position whenever scroll changes (with throttling)
  const handleScroll = useCallback((event: any) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    setScrollPosition(yOffset);
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
      console.log('📖 Verses loaded, will restore scroll to:', pendingScrollY);
      console.log('📖 Total verses:', currentChapter.verses.length);
      
      // Try multiple times with increasing delays
      const delays = [500, 1000, 1500, 2000];
      delays.forEach((delay, index) => {
        setTimeout(() => {
          if (scrollViewRef.current) {
            console.log(`📖 Scroll attempt ${index + 1} at ${delay}ms to position:`, pendingScrollY);
            scrollViewRef.current.scrollTo({ 
              y: pendingScrollY, 
              animated: index === delays.length - 1 // Only animate the last one
            });
          }
        }, delay);
      });
      
      // Mark as restored after first attempt
      setTimeout(() => {
        setPendingScrollY(null);
        setHasRestoredPosition(true);
      }, 2500);
    }
  }, [currentChapter, pendingScrollY, hasRestoredPosition]);

  const loadChapters = async () => {
    try {
      setIsLoadingChapters(true);
      const chaptersData = await QuranService.getChapters();
      setChapters(chaptersData);
      
      // Try to restore last reading position
      const savedPosition = await loadLastReadingPosition();
      if (savedPosition && savedPosition.chapterId) {
        const savedChapter = chaptersData.find(c => c.id === savedPosition.chapterId);
        if (savedChapter) {
          console.log('📖 Restoring last read chapter:', savedChapter.name);
          setSelectedChapter(savedChapter);
          // Scroll position will be restored after chapter loads
          return;
        }
      }
      
      // Select first chapter by default if no saved position
      if (chaptersData.length > 0) {
        setSelectedChapter(chaptersData[0]);
      }
    } catch (error) {
      console.error('Error loading chapters:', error);
      Alert.alert('Error', 'Failed to load Quran chapters. Please check your internet connection.');
    } finally {
      setIsLoadingChapters(false);
    }
  };

  const loadChapter = async (chapterNumber: number, skipPositionRestore: boolean = false) => {
    try {
      setIsLoading(true);
      const chapterData = await QuranService.getChapterWithTranslation(chapterNumber, settings.selectedTranslator, settings.selectedReciter, settings.selectedFont);
      setCurrentChapter(chapterData);
      
      // Restore scroll position if this is the saved chapter
      if (!skipPositionRestore) {
        const savedPosition = await loadLastReadingPosition();
        if (savedPosition && savedPosition.chapterId === chapterNumber && savedPosition.scrollY > 100) {
          // Show a prompt to continue from where they left off
          Alert.alert(
            '📖 Continue Reading?',
            `You were previously at this position in ${selectedChapter?.nameTransliterated}. Would you like to continue from where you left off?`,
            [
              {
                text: 'Start from Beginning',
                onPress: () => {
                  scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                  setHasRestoredPosition(true);
                },
                style: 'cancel'
              },
              {
                text: 'Continue',
                onPress: () => {
                  // Set pending scroll position - will be applied after verses render
                  setPendingScrollY(savedPosition.scrollY);
                  
                  // If there was a last played verse, offer to resume audio
                  if (savedPosition.lastPlayedVerse) {
                    setTimeout(() => {
                      Alert.alert(
                        '🎵 Resume Audio?',
                        `You were listening to verse ${savedPosition.lastPlayedVerse}. Would you like to continue?`,
                        [
                          { text: 'No, thanks', style: 'cancel' },
                          {
                            text: 'Resume',
                            onPress: async () => {
                              if (currentChapter) {
                                const verse = currentChapter.verses.find(v => v.verseNumber === savedPosition.lastPlayedVerse);
                                if (verse && verse.audioUrl) {
                                  await AudioService.playVerse(verse.audioUrl, chapterNumber, verse.verseNumber, settings.selectedReciter);
                                }
                              }
                            }
                          }
                        ]
                      );
                    }, 1000);
                  }
                }
              }
            ]
          );
        } else {
          setHasRestoredPosition(true);
        }
      }
    } catch (error) {
      console.error('Error loading chapter:', error);
      Alert.alert('Error', 'Failed to load chapter. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleChapterSelect = useCallback((chapter: Chapter) => {
    setSelectedChapter(chapter);
    setHasRestoredPosition(false); // Reset so we can show continue prompt for new chapter
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleVersePlay = useCallback(async (verse: Verse) => {
    if (!selectedChapter) return;
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      console.log('🎵 User clicked verse play button:', {
        verseNumber: verse.verseNumber,
        chapterId: selectedChapter.id,
        reciter: settings.selectedReciter,
        audioUrl: verse.audioUrl
      });
      
      await AudioService.playVerse(verse.audioUrl!, selectedChapter.id, verse.verseNumber, settings.selectedReciter);
    } catch (error) {
      console.error('❌ Error playing verse:', error);
      
      // More detailed error message based on error type
      let errorMessage = 'Unable to play audio for this verse.';
      let errorDetails = '';
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorDetails = 'The audio file took too long to load. Please check your internet connection and try again.';
        } else if (error.message.includes('network')) {
          errorDetails = 'Network connectivity issue. Please check your internet connection.';
        } else if (error.message.includes('permission')) {
          errorDetails = 'Audio permission denied. Please check your device audio settings.';
        } else {
          errorDetails = `Error: ${error.message}`;
        }
      } else {
        errorDetails = 'Unknown error occurred. Please try again.';
      }
      
      Alert.alert(
        'Audio Playback Error', 
        `${errorMessage}\n\n${errorDetails}\n\nTroubleshooting:\n• Check your internet connection\n• Try a different reciter\n• Restart the app if the issue persists`,
        [
          { text: 'Try Again', onPress: () => handleVersePlay(verse) },
          { text: 'OK' }
        ]
      );
    }
  }, [selectedChapter, settings.selectedReciter]);

  const handleStopAudio = useCallback(async () => {
    try {
      await AudioService.stop();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('❌ Error stopping audio:', error);
    }
  }, []);

  const handlePlayPause = useCallback(async () => {
    try {
      console.log('🎵 User clicked play/pause button');
      const currentState = AudioService.getCurrentState();
      console.log('🎵 Current audio state:', currentState);
      
      if (currentState.isPlaying || currentState.isPlayingTranslation) {
        console.log('🎵 Pausing current audio...');
        await AudioService.pause();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else if (currentState.currentChapter && currentState.currentVerse) {
        console.log('🎵 Resuming current verse...');
        // Resume current verse
        await AudioService.resume();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else if (currentChapter && currentChapter.verses.length > 0) {
        console.log('🎵 Starting full surah playback with continuous recitation...');
        // Start playing the entire surah from the beginning with selected reciter
        setIsLoadingAudio(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        // Use playFullSurah for continuous playback
        await AudioService.playFullSurah(currentChapter, settings.selectedReciter);
      } else {
        // No chapter loaded
        Alert.alert(
          'No Chapter Selected',
          'Please select a chapter from the dropdown to start playing audio.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error with play/pause:', error);
      // Show error to user
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(
        'Audio Playback Error',
        `Failed to play audio: ${errorMessage}\n\nPlease check your internet connection and try again.`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoadingAudio(false);
    }
  }, [currentChapter, settings.selectedReciter]);

  // Debug function to test audio directly
  const handleDebugAudio = useCallback(async () => {
    try {
      console.log('🧪 Testing audio with debug function...');
      const testUrl = 'https://www.everyayah.com/data/Alafasy_128kbps/001001.mp3';
      await AudioService.playVerse(testUrl, 1, 1, 'alafasy');
    } catch (error) {
      console.error('❌ Debug audio test failed:', error);
      Alert.alert('Debug Audio Test', `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  // Test reciter availability
  const testReciterAvailability = useCallback(async (reciterId: string) => {
    try {
      console.log(`🧪 Testing reciter availability: ${reciterId}`);
      const testUrl = `https://www.everyayah.com/data/${reciterId.charAt(0).toUpperCase() + reciterId.slice(1)}_128kbps/001001.mp3`;
      const response = await fetch(testUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.log(`❌ Reciter ${reciterId} not available:`, error);
      return false;
    }
  }, []);

  // Auto-scroll with requestAnimationFrame (smoother)
  const performAutoScroll = useCallback(() => {
    const currentTime = Date.now();
    const deltaTime = currentTime - lastScrollTimeRef.current;
    
    if (deltaTime > 16) { // ~60fps
      const scrollAmount = autoScrollSpeed * 1.5; // pixels per frame
      
      scrollViewRef.current?.scrollTo({
        y: scrollPosition + scrollAmount,
        animated: false
      });
      
      setScrollPosition(prev => prev + scrollAmount);
      lastScrollTimeRef.current = currentTime;
    }
    
    autoScrollRef.current = requestAnimationFrame(performAutoScroll);
  }, [autoScrollSpeed, scrollPosition]);

  const startAutoScroll = useCallback(() => {
    if (autoScrollRef.current !== null) return; // Already running
    
    console.log('🔄 Starting auto-scroll with speed:', autoScrollSpeed);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    lastScrollTimeRef.current = Date.now();
    autoScrollRef.current = requestAnimationFrame(performAutoScroll);
  }, [performAutoScroll, autoScrollSpeed]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRef.current === null) return; // Not running
    
    console.log('⏸️ Stopping auto-scroll');
    cancelAnimationFrame(autoScrollRef.current);
    autoScrollRef.current = null;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    setAutoScrollSpeed(speed);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // If auto-scrolling, restart with new speed
    const wasScrolling = autoScrollRef.current !== null;
    if (wasScrolling) {
      stopAutoScroll();
      setTimeout(() => startAutoScroll(), 50);
    }
  }, [startAutoScroll, stopAutoScroll]);

  // Auto-scroll when audio is playing (including translation)
  useEffect(() => {
    const isAudioActive = audioState.isPlaying || audioState.isPlayingTranslation;
    const isScrolling = autoScrollRef.current !== null;
    
    if (isAudioActive && !isScrolling) {
      console.log('🎵 Audio started playing, starting auto-scroll');
      startAutoScroll();
    } else if (!isAudioActive && isScrolling) {
      console.log('⏸️ Audio stopped/paused, stopping auto-scroll');
      stopAutoScroll();
    }
  }, [audioState.isPlaying, audioState.isPlayingTranslation, startAutoScroll, stopAutoScroll]);

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

  // Get dynamic font sizes based on settings
  const getFontSizes = useCallback(() => {
    const baseLineHeightArabic = 44;
    const baseLineHeightTranslation = 24;
    
    switch (settings.fontSize) {
      case 'small':
        return {
          arabic: 20,
          translation: 12,
          lineHeightArabic: baseLineHeightArabic * (20/28),
          lineHeightTranslation: baseLineHeightTranslation * (12/16),
        };
      case 'medium':
        return {
          arabic: 24,
          translation: 14,
          lineHeightArabic: baseLineHeightArabic * (24/28),
          lineHeightTranslation: baseLineHeightTranslation * (14/16),
        };
      case 'large':
        return {
          arabic: 28,
          translation: 16,
          lineHeightArabic: baseLineHeightArabic,
          lineHeightTranslation: baseLineHeightTranslation,
        };
      case 'extra-large':
        return {
          arabic: 32,
          translation: 18,
          lineHeightArabic: baseLineHeightArabic * (32/28),
          lineHeightTranslation: baseLineHeightTranslation * (18/16),
        };
      default:
        return {
          arabic: 28,
          translation: 16,
          lineHeightArabic: baseLineHeightArabic,
          lineHeightTranslation: baseLineHeightTranslation,
        };
    }
  }, [settings.fontSize]);

  const dropdownItems = useMemo(() => 
    chapters.map(chapter => ({
      id: chapter.id,
      label: `${chapter.id}. ${chapter.nameTransliterated} (${chapter.name})`,
      value: chapter.name
    })), [chapters]);

  const currentReciter = useMemo(() => {
    const foundReciter = reciterOptions.find(r => r.id === settings.selectedReciter);
    const fallbackReciter = reciterOptions[0] || {
      id: 'alafasy',
      name: 'Mishary Rashid Alafasy',
      arabicName: 'مشاري راشد العفاسي',
      description: 'Popular reciter with clear pronunciation',
      audioUrl: 'https://verses.quran.com/7/'
    };
    return foundReciter || fallbackReciter;
  }, [reciterOptions, settings.selectedReciter]);

  // Auto-scroll reciter name
  useEffect(() => {
    const startAnimation = () => {
      reciterScrollX.setValue(0);
      Animated.loop(
        Animated.timing(reciterScrollX, {
          toValue: -150,
          duration: 8000,
          useNativeDriver: true,
        }),
        { resetBeforeIteration: true }
      ).start();
    };

    if (selectedChapter) {
      startAnimation();
    }

    return () => {
      reciterScrollX.stopAnimation();
    };
  }, [selectedChapter, currentReciter]);

  const renderVerse = useCallback((verse: Verse) => {
    // Highlight verse if it's currently playing (either Arabic or translation)
    const isCurrentVerse = (audioState.isPlaying || audioState.isPlayingTranslation) && 
                          audioState.currentVerse === verse.verseNumber && 
                          audioState.currentChapter === selectedChapter?.id;
    const chapterPlayedVerses = playedVerses.get(selectedChapter?.id || 0) || new Set();
    const isPlayedVerse = chapterPlayedVerses.has(verse.verseNumber);
    const fontSizes = getFontSizes();
    
    // Get current font family
    const currentFont = fontOptions.find(f => f.id === settings.selectedFont);
    const fontFamily = currentFont?.fontFamily || 'NotoNaskhArabic-Regular';

    return (
      <View key={verse.id} style={[
        styles.verseContainer, 
        { 
          backgroundColor: '#000000' // Always black background
        }
      ]}>
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
        </View>

        {settings.showArabic && (
          <TajweedText
            text={verse.text || 'Arabic text not available'}
            enableTajweed={settings.enableTajweed}
            isDarkMode={theme === 'dark'}
            style={[
              styles.arabicText, 
              { 
                fontSize: fontSizes.arabic,
                lineHeight: fontSizes.lineHeightArabic,
                color: isCurrentVerse ? '#4CAF50' : isPlayedVerse ? '#FFEB3B' : '#FFFFFF',
                fontFamily: fontFamily
              }
            ]}
          />
        )}
        
        {settings.showTranslation && (
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
        )}
      </View>
    );
  }, [audioState, selectedChapter, playedVerses, getFontSizes, settings.showArabic, settings.showTranslation, settings.selectedFont, settings.enableTajweed, theme, fontOptions]);

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={{ 
          paddingTop: insets.top + 10,
          paddingBottom: selectedChapter ? 200 : 20 
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        stickyHeaderIndices={[1]}
      >

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          القرآن الكريم
        </Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          The Holy Quran
        </Text>
      </View>

      {/* Sticky Chapter Selector */}
      <View style={[styles.stickyChapterSelector, { 
        backgroundColor: colors.background,
        borderBottomColor: colors.border,
        paddingTop: insets.top + 20
      }]}>
        <Dropdown
          items={dropdownItems}
          selectedItem={dropdownItems.find(item => item.id === selectedChapter?.id) || null}
          onSelect={(item) => {
            const chapter = chapters.find(c => c.id === item.id);
            if (chapter) handleChapterSelect(chapter);
          }}
          placeholder="Select a chapter"
          disabled={isLoadingChapters}
        />
      </View>

      {/* Display Controls */}
      <View style={styles.controlsContainer}>
        {/* Display Options */}
        <View style={styles.displayOptions}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              { 
                backgroundColor: settings.showArabic ? colors.tint : colors.background,
                borderColor: colors.border
              }
            ]}
            onPress={handleToggleArabic}
          >
            <Text style={[
              styles.optionButtonText,
              { color: settings.showArabic ? colors.background : colors.text }
            ]}>
              Arabic
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              { 
                backgroundColor: settings.showTranslation ? colors.tint : colors.background,
                borderColor: colors.border
              }
            ]}
            onPress={handleToggleTranslation}
          >
            <Text style={[
              styles.optionButtonText,
              { color: settings.showTranslation ? colors.background : colors.text }
            ]}>
              Translation
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tajweed Legend Button */}
        {settings.showArabic && (
          <View style={styles.tajweedLegendContainer}>
            <TajweedLegend />
          </View>
        )}
      </View>

      {/* Chapter Info */}
      {selectedChapter && (
        <View style={[styles.chapterInfo, { backgroundColor: '#1C0118' }]}>
          <Text style={[styles.chapterTitle, { color: 'white' }]}>
            {selectedChapter.nameTransliterated}
          </Text>
          <Text style={[styles.chapterSubtitle, { color: 'white' }]}>
            {selectedChapter.name} • {selectedChapter.versesCount} verses • {selectedChapter.revelationPlace}
          </Text>
        </View>
      )}

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading chapter...
          </Text>
        </View>
      )}

      {/* Verses */}
      {currentChapter && !isLoading && (
        <View style={styles.versesContainer}>
          {currentChapter.verses.map(renderVerse)}
        </View>
      )}


      {/* Empty State */}
      {!isLoading && !currentChapter && !isLoadingChapters && (
        <View style={styles.emptyContainer}>
          <IconSymbol name="book" size={64} color={colors.icon} />
          <Text style={[styles.emptyText, { color: colors.text }]}>
            Select a chapter to begin reading
          </Text>
        </View>
      )}
    </ScrollView>

      {/* Bottom Tabs Navigation - Always visible */}
      {selectedChapter && (
        <View 
          style={[
            styles.bottomTabsContainer,
            {
              backgroundColor: '#1C0118',
              borderColor: colors.border,
              paddingBottom: insets.bottom, // Account for safe area
            }
          ]}
        >
          {/* Tab Buttons */}
          <View style={styles.tabButtons}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'dashboard' && styles.tabButtonActive
              ]}
              onPress={() => {
                router.push('/(drawer)');
              }}
              activeOpacity={0.8}
            >
              <IconSymbol 
                name="house.fill" 
                size={20} 
                color={activeTab === 'dashboard' ? '#9C27B0' : 'rgba(255,255,255,0.5)'} 
              />
              <Text style={[
                styles.tabButtonText,
                { color: activeTab === 'dashboard' ? '#9C27B0' : 'rgba(255,255,255,0.5)' }
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
                setActiveTab('play');
              }}
              activeOpacity={0.8}
            >
              <IconSymbol 
                name="play.circle.fill" 
                size={20} 
                color={activeTab === 'play' ? '#4CAF50' : 'rgba(255,255,255,0.5)'} 
              />
              <Text style={[
                styles.tabButtonText,
                { color: activeTab === 'play' ? '#4CAF50' : 'rgba(255,255,255,0.5)' }
              ]}>
                Play
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'autoscroll' && styles.tabButtonActive
              ]}
              onPress={() => {
                setActiveTab('autoscroll');
              }}
              activeOpacity={0.8}
            >
              <IconSymbol 
                name="arrow.down.circle.fill" 
                size={20} 
                color={activeTab === 'autoscroll' ? '#2196F3' : 'rgba(255,255,255,0.5)'} 
              />
              <Text style={[
                styles.tabButtonText,
                { color: activeTab === 'autoscroll' ? '#2196F3' : 'rgba(255,255,255,0.5)' }
              ]}>
                Auto Scroll
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'fonts' && styles.tabButtonActive
              ]}
              onPress={() => {
                setActiveTab('fonts');
              }}
              activeOpacity={0.8}
            >
              <IconSymbol 
                name="textformat" 
                size={20} 
                color={activeTab === 'fonts' ? '#FF9800' : 'rgba(255,255,255,0.5)'} 
              />
              <Text style={[
                styles.tabButtonText,
                { color: activeTab === 'fonts' ? '#FF9800' : 'rgba(255,255,255,0.5)' }
              ]}>
                Fonts
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {/* Play Tab */}
            {activeTab === 'play' && (
              <View style={styles.playTabContent}>
                <View style={styles.compactPlayerHeader}>
                  <View style={styles.compactPlayerInfo}>
                    <Text style={[styles.compactPlayerTitle, { color: 'white' }]}>
                      {audioState.isPlaying || audioState.isPlayingTranslation ? 
                        (audioState.isPlayingTranslation && !audioState.isPlaying ? 'Playing Translation' : 'Now Playing') 
                        : 'Audio Player'}
                    </Text>
                    
                    {/* Auto-Scrolling Reciter Name */}
                    <View style={styles.scrollingReciterContainer}>
                      <View style={styles.scrollingReciterMask}>
                        <Animated.View 
                          style={[
                            styles.scrollingReciterContent,
                            {
                              transform: [{
                                translateX: reciterScrollX
                              }]
                            }
                          ]}
                        >
                          <Text style={[styles.scrollingReciterName, { color: 'rgba(255,255,255,0.9)' }]}>
                            {currentReciter?.name || 'Mishary Rashid Alafasy'}
                          </Text>
                          <Text style={[styles.scrollingReciterArabic, { color: 'rgba(255,255,255,0.7)' }]}>
                            • {currentReciter?.arabicName || 'مشاري راشد العفاسي'}
                          </Text>
                          {/* Duplicate for seamless loop */}
                          <Text style={[styles.scrollingReciterName, { color: 'rgba(255,255,255,0.9)' }]}>
                            {currentReciter?.name || 'Mishary Rashid Alafasy'}
                          </Text>
                          <Text style={[styles.scrollingReciterArabic, { color: 'rgba(255,255,255,0.7)' }]}>
                            • {currentReciter?.arabicName || 'مشاري راشد العفاسي'}
                          </Text>
                        </Animated.View>
                      </View>
                    </View>
                    
                    {audioState.currentVerse ? (
                      <Text style={[styles.compactPlayerSubtitle, { color: 'rgba(255,255,255,0.6)' }]}>
                        {selectedChapter.nameTransliterated} - Verse {audioState.currentVerse}
                      </Text>
                    ) : (
                      <Text style={[styles.compactPlayerSubtitle, { color: 'rgba(255,255,255,0.6)' }]}>
                        {selectedChapter.nameTransliterated}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Compact Controls */}
                <View style={styles.compactControls}>
                  <TouchableOpacity
                    style={[styles.compactPlayButton, { backgroundColor: isLoadingAudio ? '#2196F3' : audioState.isPlaying ? '#FF5722' : '#4CAF50' }]}
                    onPress={handlePlayPause}
                    activeOpacity={0.8}
                    disabled={isLoadingAudio}
                  >
                    <IconSymbol
                      name={isLoadingAudio ? "arrow.clockwise" : audioState.isPlaying ? "pause.fill" : "play.fill"}
                      size={22}
                      color="white"
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.compactStopButton, { backgroundColor: '#666' }]}
                    onPress={handleStopAudio}
                    activeOpacity={0.8}
                    disabled={isLoadingAudio}
                  >
                    <IconSymbol
                      name="stop.fill"
                      size={18}
                      color="white"
                    />
                  </TouchableOpacity>
                  
                  {/* Progress Bar */}
                  {(() => {
                    const chapterPlayedVerses = playedVerses.get(selectedChapter.id) || new Set();
                    return chapterPlayedVerses.size > 0 && (
                      <View style={styles.compactProgressContainer}>
                        <View style={[styles.compactProgressBar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                          <View 
                            style={[
                              styles.compactProgressFill, 
                              { 
                                backgroundColor: '#4CAF50',
                                width: `${(chapterPlayedVerses.size / selectedChapter.versesCount) * 100}%`
                              }
                            ]} 
                          />
                        </View>
                      </View>
                    );
                  })()}
                </View>
              </View>
            )}

            {/* Auto Scroll Tab */}
            {activeTab === 'autoscroll' && (
              <View style={styles.autoScrollTabContent}>
                <View style={styles.autoScrollHeader}>
                  <Text style={[styles.tabContentTitle, { color: 'white' }]}>
                    Auto Scroll Speed
                  </Text>
                  <View style={[
                    styles.autoScrollStatusBadge,
                    { backgroundColor: (audioState.isPlaying || audioState.isPlayingTranslation) ? '#4CAF50' : 'rgba(255,255,255,0.2)' }
                  ]}>
                    <IconSymbol
                      name={(audioState.isPlaying || audioState.isPlayingTranslation) ? "arrow.down.circle.fill" : "pause.circle.fill"}
                      size={12}
                      color="white"
                    />
                    <Text style={styles.autoScrollStatusText}>
                      {(audioState.isPlaying || audioState.isPlayingTranslation) ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
                
                <Text style={[styles.autoScrollHint, { color: 'rgba(255,255,255,0.6)' }]}>
                  Auto-scroll activates when audio is playing
                </Text>
                
                <View style={styles.autoScrollControls}>
                  <View style={styles.speedControlContainer}>
                    <Text style={[styles.speedLabel, { color: 'rgba(255,255,255,0.8)' }]}>
                      Current Speed: {autoScrollSpeed}x
                    </Text>
                    <View style={styles.speedButtons}>
                      {[0.5, 1, 1.5, 2, 3].map((speed) => (
                        <TouchableOpacity
                          key={speed}
                          style={[
                            styles.speedButton,
                            { 
                              backgroundColor: autoScrollSpeed === speed ? '#2196F3' : 'rgba(255,255,255,0.1)',
                              borderColor: autoScrollSpeed === speed ? '#2196F3' : 'rgba(255,255,255,0.3)'
                            }
                          ]}
                          onPress={() => handleSpeedChange(speed)}
                          activeOpacity={0.7}
                        >
                          <Text style={[
                            styles.speedButtonText,
                            { color: autoScrollSpeed === speed ? 'white' : 'rgba(255,255,255,0.7)' }
                          ]}>
                            {speed}x
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Fonts Tab */}
            {activeTab === 'fonts' && (
              <View style={styles.fontsTabContent}>
                <Text style={[styles.tabContentTitle, { color: 'white' }]}>
                  Quran Fonts
                </Text>
                
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.fontsList}
                  contentContainerStyle={styles.fontsListContent}
                >
                  {fontOptions.map((font) => (
                    <TouchableOpacity
                      key={font.id}
                      style={[
                        styles.fontCard,
                        {
                          backgroundColor: settings.selectedFont === font.id ? '#FF9800' : 'rgba(255,255,255,0.1)',
                          borderColor: settings.selectedFont === font.id ? '#FF9800' : 'rgba(255,255,255,0.2)'
                        }
                      ]}
                      onPress={() => {
                        updateFont(font.id);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.fontPreview,
                        {
                          fontFamily: font.fontFamily,
                          color: settings.selectedFont === font.id ? 'white' : 'rgba(255,255,255,0.9)'
                        }
                      ]}>
                        بِسْمِ اللَّهِ
                      </Text>
                      <Text 
                        numberOfLines={2}
                        style={[
                          styles.fontCardName,
                          { color: settings.selectedFont === font.id ? 'white' : 'rgba(255,255,255,0.8)' }
                        ]}
                      >
                        {font.name}
                      </Text>
                      {settings.selectedFont === font.id && (
                        <View style={styles.selectedBadge}>
                          <IconSymbol name="checkmark.circle.fill" size={20} color="white" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollView: {
    flex: 1,
  },
  backButtonContainer: {
    position: 'absolute',
    left: 0,
    zIndex: 10,
    elevation: 10,
  },
  backButton: {
    width: Math.max(40, 44 * scaleFactor),
    height: Math.max(40, 44 * scaleFactor),
    borderRadius: Math.max(20, 22 * scaleFactor),
    borderWidth: 2,
    backgroundColor: '#2E933C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    marginTop: Math.max(60, 70 * scaleFactor),
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: Fonts.primary,
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.roboto,
    opacity: 0.7,
    textAlign: 'center',
  },
  controlsContainer: {
    padding: 20,
    paddingTop: 10,
    gap: 15,
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
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  chapterTitle: {
    fontSize: 20,
    fontFamily: Fonts.roboto,
    fontWeight: '900',
    marginBottom: 4,
  },
  chapterSubtitle: {
    fontSize: 14,
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
    fontSize: 16,
    fontFamily: Fonts.roboto,
  },
  versesContainer: {
    padding: 20,
    paddingTop: 10,
  },
  verseContainer: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#000000', // Always black background
  },
  verseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
    fontSize: 28,
    fontFamily: Fonts.primary,
    fontWeight: '900',
    lineHeight: 44,
    marginBottom: 8,
    textAlign: 'right',
    direction: 'rtl',
    color: '#FFFFFF', // Default white text
  },
  translationText: {
    fontSize: 16,
    fontFamily: Fonts.roboto,
    lineHeight: 24,
    opacity: 0.9,
    color: '#FFFFFF', // Default white text
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
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
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  tabButtons: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 4,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonText: {
    fontSize: 10,
    fontFamily: Fonts.roboto,
    fontWeight: '600',
  },
  tabContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  playTabContent: {
    // Container for play tab content
  },
  autoScrollTabContent: {
    gap: 8,
  },
  autoScrollHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  autoScrollStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  autoScrollStatusText: {
    fontSize: 10,
    fontFamily: Fonts.roboto,
    fontWeight: '600',
    color: 'white',
  },
  autoScrollHint: {
    fontSize: 10,
    fontFamily: Fonts.roboto,
    marginBottom: 8,
  },
  fontsTabContent: {
    gap: 8,
  },
  tabContentTitle: {
    fontSize: 12,
    fontFamily: Fonts.roboto,
    fontWeight: '700',
    marginBottom: 0,
  },
  autoScrollControls: {
    gap: 8,
  },
  speedControlContainer: {
    gap: 8,
  },
  speedLabel: {
    fontSize: 11,
    fontFamily: Fonts.roboto,
    fontWeight: '600',
  },
  speedButtons: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  speedButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedButtonText: {
    fontSize: 12,
    fontFamily: Fonts.roboto,
    fontWeight: '600',
  },
  fontsList: {
    maxHeight: 120,
  },
  fontsListContent: {
    gap: 10,
    paddingRight: 10,
  },
  fontCard: {
    width: 120,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  fontPreview: {
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  fontCardName: {
    fontSize: 9,
    fontFamily: Fonts.roboto,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  compactPlayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  compactPlayerInfo: {
    flex: 1,
  },
  compactPlayerTitle: {
    fontSize: 12,
    fontFamily: Fonts.roboto,
    fontWeight: '700',
    marginBottom: 1,
  },
  compactPlayerSubtitle: {
    fontSize: 10,
    fontFamily: Fonts.roboto,
    opacity: 0.8,
  },
  scrollingReciterContainer: {
    height: 14,
    marginVertical: 1,
    overflow: 'hidden',
  },
  scrollingReciterMask: {
    flex: 1,
    overflow: 'hidden',
  },
  scrollingReciterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  scrollingReciterName: {
    fontSize: 11,
    fontFamily: Fonts.roboto,
    fontWeight: '600',
    marginRight: 6,
  },
  scrollingReciterArabic: {
    fontSize: 10,
    fontFamily: Fonts.primary,
    fontWeight: '500',
    textAlign: 'right',
    direction: 'rtl',
  },
  compactControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  compactPlayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactStopButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactProgressContainer: {
    flex: 1,
    marginLeft: 6,
  },
  compactProgressBar: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  compactProgressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
});

export default function QuranScreen() {
  return (
    <QuranSettingsProvider>
      <QuranScreenContent />
    </QuranSettingsProvider>
  );
}