import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_SMALL_PHONE = SCREEN_WIDTH < 400;
const IS_IPAD = Platform.OS === 'ios' && (Platform.isPad === true || SCREEN_WIDTH >= 768);
// iPhone 16 Pro (~402pt), not Plus/Max (~430pt+): use smaller circle
const IS_16_PRO_SIZE = SCREEN_WIDTH >= 393 && SCREEN_WIDTH < 420;
// iPhone SE and other short screens: use smaller circle so it fits
const IS_COMPACT_HEIGHT = SCREEN_HEIGHT < 700;
const CARD_SPACING = IS_IPAD ? 32 : 16;
const PHONE_SIDE_PADDING = 8;
const PHONE_CARD_WIDTH = Math.max(SCREEN_WIDTH * 0.82, SCREEN_WIDTH - 140);
const CARD_WIDTH = IS_IPAD
  ? Math.min(SCREEN_WIDTH - 160, 760)
  : PHONE_CARD_WIDTH;
const SIDE_SPACING = IS_IPAD ? 60 : PHONE_SIDE_PADDING;

interface DhikrItem {
  arabic: string;
  translation: string;
  transliteration: string;
  target: number;
}

const popularDhikr: DhikrItem[] = [
  {
    arabic: 'سُبْحَانَ اللهِ',
    translation: 'Glory be to Allah',
    transliteration: 'SubhanAllah',
    target: 33,
  },
  {
    arabic: 'الْحَمْدُ لِلَّهِ',
    translation: 'Praise be to Allah',
    transliteration: 'Alhamdulillah',
    target: 33,
  },
  {
    arabic: 'اللَّهُ أَكْبَرُ',
    translation: 'Allah is the Greatest',
    transliteration: 'Allahu Akbar',
    target: 34,
  },
  {
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    translation: 'Glory and praise be to Allah',
    transliteration: 'SubhanAllahi wa bihamdihi',
    target: 100,
  },
  {
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
    translation: 'Glory and praise be to Allah; glory be to Allah the Almighty',
    transliteration: 'SubhanAllahi wa bihamdihi, SubhanAllahil Azeem',
    target: 100,
  },
  {
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    translation: 'There is no power or strength except with Allah',
    transliteration: 'La hawla wa la quwwata illa billah',
    target: 33,
  },
  {
    arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    translation: 'Allah is sufficient for us, and He is the best disposer of affairs',
    transliteration: 'Hasbunallah wa ni\'mal wakeel',
    target: 33,
  },
  {
    arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ',
    translation: 'There is no god but Allah',
    transliteration: 'La ilaha illallah',
    target: 100,
  },
  {
    arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ',
    translation: 'There is no god but Allah, Muhammad is the Messenger of Allah',
    transliteration: 'La ilaha illallah Muhammadur Rasulullah',
    target: 100,
  },
  {
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ',
    translation: 'O Allah, send blessings upon Muhammad and the family of Muhammad',
    transliteration: 'Allahumma salli ala Muhammadin wa ala ali Muhammad',
    target: 100,
  },
  {
    arabic: 'لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
    translation: 'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers',
    transliteration: 'La ilaha illa anta subhanaka inni kuntu minaz-zalimin',
    target: 100,
  },
  {
    arabic: 'أَسْتَغْفِرُ اللَّهَ',
    translation: 'I seek forgiveness from Allah',
    transliteration: 'Astaghfirullah',
    target: 100,
  },
  {
    arabic: 'سُبْحَانَ اللَّهِ الْعَظِيمِ',
    translation: 'Glory be to Allah the Almighty',
    transliteration: 'SubhanAllahil Azeem',
    target: 33,
  },
  {
    arabic: 'رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ نَبِيًّا',
    translation: 'I am pleased with Allah as Lord, Islam as religion, and Muhammad as Prophet',
    transliteration: 'Raditu billahi Rabban wa bil-Islami deenan wa bi-Muhammadin Nabiyya',
    target: 3,
  },
];

const targetOptions = [33, 100, 500, 1000];

export default function TasbihScreen() {
  const { theme } = useTheme();
  const colors = Colors[((theme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDarkMode = theme === 'dark';
  const screenBackground = isDarkMode ? '#0d1b2a' : '#F3F4F6';
  const gradientColors = isDarkMode ? ['#0d1b2a', '#1e293b', '#2d3748'] as const : ['#F3F4F6', '#E5E7EB'] as const;
  const [count, setCount] = useState(0);
  const [selectedDhikrIndex, setSelectedDhikrIndex] = useState(0);
  const [customTarget, setCustomTarget] = useState<number>(100);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customInputValue, setCustomInputValue] = useState('100');
  const [selectedTarget, setSelectedTarget] = useState<number>(33);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const flatListRef = useRef<FlatList>(null);
  
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const confettiAnimations = useRef(
    Array.from({ length: 15 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;
  
  const currentDhikr = popularDhikr[selectedDhikrIndex];
  const target = selectedTarget;

  // Load saved progress on mount
  useEffect(() => {
    loadProgress();
  }, []);

  // Save progress whenever it changes
  useEffect(() => {
    saveProgress();
  }, [count, selectedDhikrIndex, selectedTarget, customTarget]);

  const loadProgress = async () => {
    try {
      const savedData = await AsyncStorage.getItem('tasbih_progress');
      if (savedData) {
        const { count: savedCount, dhikrIndex, target, custom } = JSON.parse(savedData);
        // Load the count so users can continue from where they left off
        setCount(savedCount || 0);
        setSelectedDhikrIndex(dhikrIndex || 0);
        setSelectedTarget(target || 33);
        if (custom) {
          setCustomTarget(custom);
        }
      }
    } catch (error) {
      console.error('Error loading tasbih progress:', error);
    }
  };

  const saveProgress = async () => {
    try {
      const data = {
        count,
        dhikrIndex: selectedDhikrIndex,
        target: selectedTarget,
        custom: customTarget,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem('tasbih_progress', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving tasbih progress:', error);
    }
  };

  const triggerSuccessAnimation = () => {
    setShowSuccessAnimation(true);
    
    // Success message animation
    Animated.sequence([
      Animated.parallel([
        Animated.spring(successScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(2000),
      Animated.parallel([
        Animated.timing(successScale, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(successOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setShowSuccessAnimation(false);
      successScale.setValue(0);
      successOpacity.setValue(0);
    });

    // Confetti animations
    confettiAnimations.forEach((anim, index) => {
      const randomX = (Math.random() - 0.5) * 300;
      const randomRotate = Math.random() * 720;
      
      Animated.parallel([
        Animated.timing(anim.translateY, {
          toValue: 400,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateX, {
          toValue: randomX,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(anim.rotate, {
          toValue: randomRotate,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(anim.opacity, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        anim.translateY.setValue(0);
        anim.translateX.setValue(0);
        anim.rotate.setValue(0);
        anim.opacity.setValue(1);
      });
    });
  };

  const handlePress = () => {
    const newCount = count + 1;
    setCount(newCount);
    
    // Haptic feedback
    if (newCount === target) {
      // Success haptic when reaching target
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      triggerSuccessAnimation();
      
      // Reset counter after a short delay to allow animation to start
      setTimeout(() => {
        setCount(0);
      }, 300);
    } else {
      // Light haptic on each tap
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCount(0);
    // Count will be saved automatically by the useEffect
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    // Account for ListHeaderComponent spacing; match snap interval
    const adjustedOffset = offsetX - SIDE_SPACING;
    const interval = CARD_WIDTH + CARD_SPACING;
    const scrollIndex = Math.round(adjustedOffset / interval);
    const index = Math.max(0, Math.min(scrollIndex, popularDhikr.length - 1));
    if (index !== selectedDhikrIndex && index >= 0 && index < popularDhikr.length) {
      setSelectedDhikrIndex(index);
      // Don't reset count - user can continue from where they left off
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleTargetSelect = (target: number) => {
    setSelectedTarget(target);
    // Don't reset count - user can continue from where they left off
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleCustomTarget = () => {
    const value = parseInt(customInputValue);
    if (value && value > 0) {
      setCustomTarget(value);
      setSelectedTarget(value);
      // Don't reset count - user can continue from where they left off
      setShowCustomModal(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      {/* Header */}
      <View
        style={[styles.headerGradient, { backgroundColor: 'transparent', paddingTop: insets.top }]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left.circle.fill" size={IS_IPAD ? 52 : 42} color={isDarkMode ? '#FFFFFF' : '#1F2937'} />
          <Text style={[styles.backText, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>Digital Tasbih</Text>
          <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#D9E3F5' : '#1F2937' }]}>التسبيح الرقمي</Text>
        </View>
      </View>

      {/* Dhikr Carousel */}
      <View style={styles.carouselWrapper}>
          <FlatList
          ref={flatListRef}
          data={popularDhikr}
          renderItem={({ item, index }) => {
            const isLongDhikr =
              item.transliteration.length > 35 ||
              item.translation.length > 55 ||
              item.arabic.length > 28;

            return (
            <View
              style={[
                styles.dhikrCard,
                { width: CARD_WIDTH },
                index === selectedDhikrIndex
                  ? styles.dhikrCardFrosted
                  : styles.dhikrCardUnselected,
                index === selectedDhikrIndex && styles.selectedCard,
                isLongDhikr && styles.longDhikrCard,
              ]}
            >
              <Text
                style={[
                  styles.dhikrArabic,
                  isLongDhikr && styles.longDhikrArabic,
                  index === selectedDhikrIndex && { color: '#FFFFFF', fontWeight: '900' },
                ]}
              >
                {item.arabic}
              </Text>
              <Text
                style={[
                  styles.dhikrTransliteration,
                  isLongDhikr && styles.longDhikrTransliteration,
                  index === selectedDhikrIndex && { color: '#FFFFFF', fontWeight: '900' },
                ]}
              >
                {item.transliteration}
              </Text>
              <Text
                style={[
                  styles.dhikrTranslation,
                  isLongDhikr && styles.longDhikrTranslation,
                  index === selectedDhikrIndex && { color: '#FFFFFF', fontWeight: '700' },
                ]}
              >
                {item.translation}
              </Text>
            </View>
            );
          }}
          keyExtractor={(item, index) => `dhikr-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + CARD_SPACING}
          snapToAlignment="center"
          decelerationRate="normal"
          bounces={true}
          overScrollMode="always"
          contentContainerStyle={[
            styles.carouselContent,
            { paddingHorizontal: SIDE_SPACING },
          ]}
          onMomentumScrollEnd={handleScroll}
          style={styles.carousel}
          scrollEnabled={true}
          nestedScrollEnabled={Platform.OS === 'android'}
          pagingEnabled={false}
          removeClippedSubviews={false}
          getItemLayout={(data, index) => ({
            length: CARD_WIDTH + CARD_SPACING,
            offset: (CARD_WIDTH + CARD_SPACING) * index,
            index,
          })}
          ItemSeparatorComponent={() => <View style={{ width: CARD_SPACING }} />}
          ListHeaderComponent={<View style={{ width: SIDE_SPACING }} />}
          ListFooterComponent={<View style={{ width: SIDE_SPACING }} />}
        />
      </View>

      {/* Indicator Dots */}
      <View style={styles.indicatorContainer}>
        {popularDhikr.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === selectedDhikrIndex && styles.activeIndicator,
            ]}
          />
        ))}
      </View>

      {/* Target Picker */}
      <View style={styles.targetPickerContainer}>
        <Text style={[styles.targetPickerLabel, { color: colors.text }]}>Target:</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.targetPickerContent}
        >
          {targetOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.targetOption,
                selectedTarget === option && styles.selectedTargetOption,
                { borderColor: colors.border },
              ]}
              onPress={() => handleTargetSelect(option)}
            >
              <Text
                style={[
                  styles.targetOptionText,
                  selectedTarget === option && styles.selectedTargetOptionText,
                  { color: selectedTarget === option ? '#FFFFFF' : colors.text },
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[
              styles.targetOption,
              styles.customTargetOption,
              !targetOptions.includes(selectedTarget) && styles.selectedTargetOption,
              { borderColor: colors.border },
            ]}
            onPress={() => setShowCustomModal(true)}
          >
            <Text
              style={[
                styles.targetOptionText,
                !targetOptions.includes(selectedTarget) && styles.selectedTargetOptionText,
                { color: !targetOptions.includes(selectedTarget) ? '#FFFFFF' : colors.text },
              ]}
            >
              {!targetOptions.includes(selectedTarget) ? customTarget : 'Custom'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Custom Target Modal */}
      <Modal
        visible={showCustomModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCustomModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Custom Target</Text>
            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
              value={customInputValue}
              onChangeText={setCustomInputValue}
              keyboardType="number-pad"
              placeholder="Enter target count"
              placeholderTextColor={colors.text + '60'}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton, { borderColor: colors.border }]}
                onPress={() => setShowCustomModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton, { backgroundColor: colors.tint }]}
                onPress={handleCustomTarget}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Set</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Counter Section – large tappable circle */}
      <View style={[styles.counterContainer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={styles.circleCounter}
          onPress={handlePress}
          activeOpacity={0.85}
        >
          <Text style={styles.circleCountText}>{count}</Text>
          <Text style={styles.circleTargetText}>of {target}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.resetButton, { borderColor: colors.border }]}
          onPress={handleReset}
        >
          <Text style={[styles.resetText, { color: colors.text }]}>Reset</Text>
        </TouchableOpacity>

        {/* Success Animation - stays inside content wrapper */}
        {showSuccessAnimation && (
          <>
            {/* Confetti */}
            {confettiAnimations.map((anim, index) => {
              const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
              const size = Math.random() * 8 + 6;
              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.confetti,
                    {
                      width: size,
                      height: size,
                      backgroundColor: colors[index % colors.length],
                      transform: [
                        { translateY: anim.translateY },
                        { translateX: anim.translateX },
                        { rotate: anim.rotate.interpolate({
                          inputRange: [0, 720],
                          outputRange: ['0deg', '720deg'],
                        }) },
                      ],
                      opacity: anim.opacity,
                    },
                  ]}
                />
              );
            })}
            
            {/* Success Message */}
            <Animated.View
              style={[
                styles.successMessage,
                {
                  transform: [{ scale: successScale }],
                  opacity: successOpacity,
                },
              ]}
            >
              <Text style={styles.successEmoji}>🎉</Text>
              <Text style={styles.successText}>Target Reached!</Text>
              <Text style={styles.successSubtext}>Alhamdulillah</Text>
            </Animated.View>
          </>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  contentWrapper: {
    flex: 1,
  },
  contentWrapperIpad: {
    flex: 1,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  headerGradient: {
    paddingBottom: IS_IPAD ? 12 : 3,
    paddingHorizontal: IS_IPAD ? 40 : 15,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: IS_IPAD ? 10 : 2,
    marginTop: IS_IPAD ? 24 : 12,
  },
  backText: {
    fontSize: IS_IPAD ? 20 : 16,
    fontWeight: '600',
    marginLeft: IS_IPAD ? 8 : 5,
  },
  headerTitleContainer: {
    alignItems: 'center',
    marginTop: IS_IPAD ? 10 : 8,
  },
  headerTitle: {
    fontSize: IS_IPAD ? 42 : 28,
    fontWeight: '900',
    fontFamily: Fonts.secondary,
    marginBottom: 0,
  },
  headerSubtitle: {
    fontSize: IS_IPAD ? 22 : 18,
    fontWeight: '900',
    fontFamily: Fonts.primary,
  },
  carouselWrapper: {
    marginTop: IS_SMALL_PHONE ? 2 : IS_IPAD ? 30 : 20,
    height: IS_SMALL_PHONE ? 200 : IS_IPAD ? 320 : 260,
  },
  carousel: {
    height: IS_SMALL_PHONE ? 200 : IS_IPAD ? 320 : 260,
    flexGrow: 0,
    flexShrink: 0,
  },
  carouselContent: {
    paddingVertical: IS_IPAD ? 20 : 10,
    alignItems: 'flex-start',
  },
  dhikrCard: {
    borderRadius: IS_IPAD ? 60 : 50,
    padding: IS_SMALL_PHONE ? 12 : IS_IPAD ? 32 : 24,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: IS_IPAD ? 'center' : 'flex-start',
    minHeight: IS_SMALL_PHONE ? 160 : IS_IPAD ? 220 : 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 16,
  },
  dhikrCardFrosted: {
    backgroundColor: 'rgba(0, 42, 22, 0.42)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    overflow: 'hidden',
  },
  dhikrCardUnselected: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  selectedCard: {
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 20,
    transform: [{ scale: 1.03 }],
  },
  longDhikrCard: {
    paddingVertical: IS_IPAD ? 22 : 16,
    minHeight: IS_IPAD ? 220 : 220,
  },
  dhikrArabic: {
    fontSize: IS_SMALL_PHONE ? 26 : IS_IPAD ? 40 : 34,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: IS_SMALL_PHONE ? 36 : IS_IPAD ? 56 : 46,
    fontFamily: 'ScheherazadeNew-Regular',
  },
  longDhikrArabic: {
    marginBottom: 4,
    lineHeight: IS_SMALL_PHONE ? 32 : IS_IPAD ? 50 : 40,
  },
  dhikrTransliteration: {
    fontSize: IS_SMALL_PHONE ? 18 : IS_IPAD ? 28 : 22,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
    opacity: 0.9,
    letterSpacing: 0.5,
  },
  longDhikrTransliteration: {
    fontSize: IS_SMALL_PHONE ? 16 : IS_IPAD ? 24 : 20,
    marginBottom: 4,
    lineHeight: IS_SMALL_PHONE ? 22 : IS_IPAD ? 30 : 24,
  },
  dhikrTranslation: {
    fontSize: IS_SMALL_PHONE ? 15 : IS_IPAD ? 24 : 18,
    fontFamily: 'CormorantGaramond-Italic',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  longDhikrTranslation: {
    fontSize: IS_SMALL_PHONE ? 14 : IS_IPAD ? 20 : 16,
    marginBottom: 4,
    lineHeight: IS_SMALL_PHONE ? 20 : IS_IPAD ? 28 : 22,
  },
  targetBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  targetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: IS_SMALL_PHONE ? 4 : IS_IPAD ? 20 : 16,
    gap: IS_IPAD ? 12 : 8,
  },
  indicator: {
    width: IS_IPAD ? 10 : 8,
    height: IS_IPAD ? 10 : 8,
    borderRadius: IS_IPAD ? 5 : 4,
    backgroundColor: '#CCCCCC',
    opacity: 0.4,
  },
  activeIndicator: {
    width: IS_IPAD ? 30 : 24,
    backgroundColor: '#000000',
    opacity: 1,
  },
  targetPickerContainer: {
    paddingHorizontal: IS_IPAD ? 60 : 20,
    marginTop: IS_SMALL_PHONE ? 2 : IS_IPAD ? 24 : 16,
    marginBottom: IS_SMALL_PHONE ? 8 : IS_IPAD ? 16 : 8,
    alignSelf: IS_IPAD ? 'center' : 'stretch',
    width: '100%',
    maxWidth: IS_IPAD ? 600 : undefined,
  },
  targetPickerLabel: {
    fontSize: IS_IPAD ? 20 : 16,
    fontWeight: '600',
    marginBottom: IS_IPAD ? 16 : 12,
  },
  targetPickerContent: {
    gap: IS_IPAD ? 16 : 12,
  },
  targetOption: {
    paddingHorizontal: IS_IPAD ? 36 : 22,
    paddingVertical: IS_IPAD ? 18 : 12,
    borderRadius: IS_IPAD ? 24 : 20,
    borderWidth: 2,
    minWidth: IS_IPAD ? 140 : 80,
    alignItems: 'center',
  },
  selectedTargetOption: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  customTargetOption: {
    minWidth: IS_IPAD ? 160 : 100,
  },
  targetOptionText: {
    fontSize: IS_IPAD ? 26 : 18,
    fontWeight: '600',
  },
  selectedTargetOptionText: {
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelButton: {
    borderWidth: 2,
  },
  modalConfirmButton: {
    // backgroundColor set dynamically
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  counterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: IS_IPAD ? 48 : 20,
    paddingTop: IS_SMALL_PHONE ? 5 : IS_IPAD ? 36 : 40,
    width: '100%',
    maxWidth: IS_IPAD ? 680 : undefined,
    alignSelf: 'center',
  },
  circleCounter: {
    width: IS_COMPACT_HEIGHT ? 118 : IS_SMALL_PHONE ? 140 : IS_IPAD ? 260 : IS_16_PRO_SIZE ? 125 : 180,
    height: IS_COMPACT_HEIGHT ? 118 : IS_SMALL_PHONE ? 140 : IS_IPAD ? 260 : IS_16_PRO_SIZE ? 125 : 180,
    borderRadius: IS_COMPACT_HEIGHT ? 59 : IS_SMALL_PHONE ? 70 : IS_IPAD ? 130 : IS_16_PRO_SIZE ? 63 : 90,
    marginTop: IS_SMALL_PHONE ? 8 : IS_IPAD ? 16 : 20,
    backgroundColor: 'rgba(0, 42, 22, 0.46)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 16,
  },
  circleCountText: {
    fontSize: IS_COMPACT_HEIGHT ? 36 : IS_SMALL_PHONE ? 42 : IS_IPAD ? 80 : IS_16_PRO_SIZE ? 38 : 56,
    fontWeight: '900',
    color: '#FFD700',
    fontFamily: Fonts.secondary,
  },
  circleTargetText: {
    fontSize: IS_COMPACT_HEIGHT ? 10 : IS_SMALL_PHONE ? 11 : IS_IPAD ? 18 : IS_16_PRO_SIZE ? 10 : 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  progressText: {
    fontSize: IS_SMALL_PHONE ? 16 : IS_IPAD ? 22 : 20,
    fontWeight: '600',
    marginTop: IS_SMALL_PHONE ? 8 : IS_IPAD ? 24 : 24,
  },
  resetButton: {
    marginTop: IS_SMALL_PHONE ? 4 : IS_IPAD ? 10 : 6,
    marginBottom: 0,
    paddingHorizontal: IS_SMALL_PHONE ? 14 : IS_IPAD ? 28 : 20,
    paddingVertical: IS_SMALL_PHONE ? 4 : IS_IPAD ? 10 : 6,
    borderRadius: 18,
    borderWidth: 2,
  },
  resetText: {
    fontSize: IS_SMALL_PHONE ? 12 : IS_IPAD ? 16 : 14,
    fontWeight: '600',
  },
  confetti: {
    position: 'absolute',
    top: -50,
    borderRadius: 4,
  },
  successMessage: {
    position: 'absolute',
    backgroundColor: '#000000',
    borderRadius: IS_IPAD ? 26 : 20,
    padding: IS_IPAD ? 32 : 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  successEmoji: {
    fontSize: IS_IPAD ? 64 : 48,
    marginBottom: 8,
  },
  successText: {
    fontSize: IS_IPAD ? 28 : 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  successSubtext: {
    fontSize: IS_IPAD ? 20 : 16,
    color: '#FFD700',
    fontWeight: '600',
  },
});

