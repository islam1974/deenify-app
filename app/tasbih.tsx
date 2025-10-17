import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput, Modal, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 60;

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
    arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ',
    translation: 'There is no god but Allah',
    transliteration: 'La ilaha illallah',
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
];

const targetOptions = [33, 100, 500, 1000];

export default function TasbihScreen() {
  const { theme } = useTheme();
  const colors = Colors[((theme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [count, setCount] = useState(0);
  const [selectedDhikrIndex, setSelectedDhikrIndex] = useState(0);
  const [customTarget, setCustomTarget] = useState<number>(100);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customInputValue, setCustomInputValue] = useState('100');
  const [selectedTarget, setSelectedTarget] = useState<number>(33);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
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
    } else {
      // Light haptic on each tap
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCount(0);
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (CARD_WIDTH + 20));
    if (index !== selectedDhikrIndex) {
      setSelectedDhikrIndex(index);
      setCount(0); // Reset count when changing dhikr
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleTargetSelect = (target: number) => {
    setSelectedTarget(target);
    setCount(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleCustomTarget = () => {
    const value = parseInt(customInputValue);
    if (value && value > 0) {
      setCustomTarget(value);
      setSelectedTarget(value);
      setCount(0);
      setShowCustomModal(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#EBF4F5', '#B5C6E0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.headerGradient, { paddingTop: insets.top }]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={28} color="#2C3E50" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Digital Tasbih</Text>
          <Text style={styles.headerSubtitle}>التسبيح الرقمي</Text>
        </View>
      </LinearGradient>

      {/* Dhikr Carousel */}
      <View style={styles.carouselWrapper}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + 20}
          decelerationRate="fast"
          contentContainerStyle={styles.carouselContent}
          onMomentumScrollEnd={handleScroll}
          style={styles.carousel}
        >
        {popularDhikr.map((dhikr, index) => (
          <View
            key={index}
            style={[
              styles.dhikrCard,
              { width: CARD_WIDTH },
              index === selectedDhikrIndex && styles.selectedCard,
            ]}
          >
            <Text style={styles.dhikrArabic}>{dhikr.arabic}</Text>
            <Text style={styles.dhikrTransliteration}>{dhikr.transliteration}</Text>
            <Text style={styles.dhikrTranslation}>{dhikr.translation}</Text>
          </View>
        ))}
        </ScrollView>
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

      {/* Counter Section */}
      <View style={[styles.counterContainer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={[styles.counterButton, { backgroundColor: '#000000' }]}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <Text style={styles.counterText}>{count}</Text>
        </TouchableOpacity>
        
        <Text style={[styles.progressText, { color: colors.text }]}>
          {count} / {target}
        </Text>

        <TouchableOpacity
          style={[styles.resetButton, { borderColor: colors.border }]}
          onPress={handleReset}
        >
          <Text style={[styles.resetText, { color: colors.text }]}>Reset</Text>
        </TouchableOpacity>

        {/* Success Animation */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  headerGradient: {
    paddingBottom: 3,
    paddingHorizontal: 15,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 5,
  },
  headerTitleContainer: {
    alignItems: 'center',
    marginTop: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 0,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#34495E',
    opacity: 0.8,
    fontFamily: Fonts.primary,
  },
  carouselWrapper: {
    marginTop: 20,
  },
  carousel: {
    maxHeight: 260,
  },
  carouselContent: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    gap: 20,
  },
  dhikrCard: {
    backgroundColor: '#000000',
    borderRadius: 50,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 15,
    borderWidth: 1,
    borderTopColor: '#333333',
    borderLeftColor: '#333333',
    borderRightColor: '#000000',
    borderBottomColor: '#000000',
  },
  selectedCard: {
    shadowOpacity: 0.7,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 16 },
    elevation: 20,
    transform: [{ scale: 1.03 }],
  },
  dhikrArabic: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 46,
    fontFamily: 'ScheherazadeNew-Regular',
  },
  dhikrTransliteration: {
    fontSize: 22,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
    opacity: 0.9,
    letterSpacing: 0.5,
  },
  dhikrTranslation: {
    fontSize: 18,
    fontFamily: 'CormorantGaramond-Italic',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 10,
    letterSpacing: 0.3,
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
    marginTop: 16,
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CCCCCC',
    opacity: 0.4,
  },
  activeIndicator: {
    width: 24,
    backgroundColor: '#000000',
    opacity: 1,
  },
  targetPickerContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  targetPickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  targetPickerContent: {
    gap: 12,
  },
  targetOption: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    minWidth: 70,
    alignItems: 'center',
  },
  selectedTargetOption: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  customTargetOption: {
    minWidth: 90,
  },
  targetOptionText: {
    fontSize: 16,
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
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  counterButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    borderWidth: 3,
    borderTopColor: '#404040',
    borderLeftColor: '#404040',
    borderRightColor: '#000000',
    borderBottomColor: '#000000',
  },
  counterText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 24,
  },
  resetButton: {
    marginTop: 24,
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 2,
  },
  resetText: {
    fontSize: 16,
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
    borderRadius: 20,
    padding: 24,
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
    fontSize: 48,
    marginBottom: 8,
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  successSubtext: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: '600',
  },
});

