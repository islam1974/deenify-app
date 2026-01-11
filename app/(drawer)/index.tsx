import AnimatedHeroMessage from '@/components/AnimatedHeroMessage';
import LocationWrapper from '@/components/LocationWrapper';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useLocation } from '@/contexts/LocationContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Hadith, hadiths } from '@/data/hadithData';
import { PrayerTimesService } from '@/services/PrayerTimesService';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Reanimated, {
    Extrapolate,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_IPAD = Platform.OS === 'ios' ? Boolean((Platform as any).isPad) : SCREEN_WIDTH >= 768;
const IS_SMALL_PHONE = SCREEN_WIDTH < 400;
const IS_LARGE_PHONE = !IS_IPAD && SCREEN_WIDTH >= 414;
const CARD_SIZE = IS_IPAD 
  ? Math.min((SCREEN_WIDTH - 120) / 3, 240) // iPad: 3 columns, larger cards
  : Math.min((SCREEN_WIDTH - 80) / 2, 175); // Phone: 2 columns, slightly larger

interface QuickAction {
  title: string;
  icon: string;
  route: string;
  color: string;
}

function LanyardCard() {
  const { theme } = useTheme();
  const colors = Colors[((theme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const { location, locationEnabled } = useLocation();
  const [prayerTimes, setPrayerTimes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hijriDate, setHijriDate] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchPrayerTimes();
    fetchHijriDate();
  }, [location, locationEnabled]);

  const fetchPrayerTimes = async () => {
    if (!location && !locationEnabled) {
      try {
        const defaultPrayerTimes = await PrayerTimesService.getPrayerTimesByCity('New York', 'USA');
        setPrayerTimes(defaultPrayerTimes);
      } catch (err) {
        console.error('Error loading default prayer times:', err);
      }
      return;
    }

    if (!location) return;

    setIsLoading(true);
    try {
      let times: any[];
      
      if (location.latitude !== 0 && location.longitude !== 0) {
        times = await PrayerTimesService.getPrayerTimes(location.latitude, location.longitude);
      } else {
        times = await PrayerTimesService.getPrayerTimesByCity(location.city, location.country);
      }
      
      setPrayerTimes(times);
    } catch (err) {
      console.error('Error fetching prayer times:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHijriDate = async () => {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      
      // Using Aladhan API for accurate Hijri date
      const response = await fetch(`https://api.aladhan.com/v1/gToH?date=${day}-${month}-${year}`);
      const data = await response.json();
      
      if (data.code === 200 && data.data) {
        const hijri = data.data.hijri;
        const hijriMonths = [
          'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
          'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
          'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
        ];
        
        const monthName = hijriMonths[parseInt(hijri.month.number) - 1];
        setHijriDate(`${hijri.day} ${monthName} ${hijri.year} AH`);
      }
    } catch (err) {
      console.error('Error fetching Hijri date:', err);
      // Fallback to approximate calculation
      const gregorianDate = new Date();
      const hijriYear = gregorianDate.getFullYear() - 622;
      const hijriMonth = gregorianDate.getMonth() + 1;
      const hijriDay = gregorianDate.getDate();
      
      const hijriMonths = [
        'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
        'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
        'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
      ];
      
      setHijriDate(`${hijriDay} ${hijriMonths[hijriMonth - 1]} ${hijriYear} AH`);
    }
  };

  const getCurrentPrayer = () => {
    const now = new Date();
    const currentTimeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const [currentHours, currentMinutes] = currentTimeString.split(':').map(Number);
    const currentTimeMinutes = currentHours * 60 + currentMinutes;

    for (let i = 0; i < prayerTimes.length; i++) {
      const currentPrayer = prayerTimes[i];
      const nextPrayer = prayerTimes[(i + 1) % prayerTimes.length];
      
      const currentPrayerTimeWithoutPeriod = currentPrayer.time.replace(' AM', '').replace(' PM', '');
      const nextPrayerTimeWithoutPeriod = nextPrayer.time.replace(' AM', '').replace(' PM', '');
      const [currentPrayerHours, currentPrayerMinutes] = currentPrayerTimeWithoutPeriod.split(':').map(Number);
      const [nextPrayerHours, nextPrayerMinutes] = nextPrayerTimeWithoutPeriod.split(':').map(Number);
      
      let currentPrayerTimeMinutes = currentPrayerHours * 60 + currentPrayerMinutes;
      let nextPrayerTimeMinutes = nextPrayerHours * 60 + nextPrayerMinutes;
      
      if (currentPrayer.time.includes('AM') && currentPrayerHours === 12) {
        currentPrayerTimeMinutes = currentPrayerMinutes;
      } else if (currentPrayer.time.includes('PM') && currentPrayerHours !== 12) {
        currentPrayerTimeMinutes = (currentPrayerHours + 12) * 60 + currentPrayerMinutes;
      }
      
      if (nextPrayer.time.includes('AM') && nextPrayerHours === 12) {
        nextPrayerTimeMinutes = nextPrayerMinutes;
      } else if (nextPrayer.time.includes('PM') && nextPrayerHours !== 12) {
        nextPrayerTimeMinutes = (nextPrayerHours + 12) * 60 + nextPrayerMinutes;
      }
      
      if (nextPrayerTimeMinutes < currentPrayerTimeMinutes) {
        nextPrayerTimeMinutes += 24 * 60;
      }
      
      if (currentTimeMinutes >= currentPrayerTimeMinutes && currentTimeMinutes < nextPrayerTimeMinutes) {
        return currentPrayer;
      }
    }

    return null;
  };

  const getNextPrayer = () => {
    const now = new Date();
    const currentTimeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const [currentHours, currentMinutes] = currentTimeString.split(':').map(Number);
    const currentTimeMinutes = currentHours * 60 + currentMinutes;

    for (let i = 0; i < prayerTimes.length; i++) {
      const prayer = prayerTimes[i];
      const timeWithoutPeriod = prayer.time.replace(' AM', '').replace(' PM', '');
      const [prayerHours, prayerMinutes] = timeWithoutPeriod.split(':').map(Number);
      
      let prayerTimeMinutes = prayerHours * 60 + prayerMinutes;
      
      if (prayer.time.includes('AM') && prayerHours === 12) {
        prayerTimeMinutes = prayerMinutes;
      } else if (prayer.time.includes('PM') && prayerHours !== 12) {
        prayerTimeMinutes = (prayerHours + 12) * 60 + prayerMinutes;
      }
      
      if (prayerTimeMinutes > currentTimeMinutes) {
        return prayer;
      }
    }

    return prayerTimes[0];
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };


  const currentPrayer = getCurrentPrayer();
  const nextPrayer = getNextPrayer();

  if (isLoading) {
    return (
      <View style={styles.lanyardCardWrapper}>
        <View style={styles.lanyardCard}>
          <LinearGradient
            colors={['#4A1FCC', '#5D2DE6', '#4A1FCC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.lanyardGradient}
          >
            <Text style={styles.lanyardLoadingText}>Loading prayer times...</Text>
          </LinearGradient>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.lanyardCardWrapper}>
      <View style={styles.lanyardCard}>
        <LinearGradient
          colors={['#4A1FCC', '#5D2DE6', '#4A1FCC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.lanyardGradient}
        >
        <View style={styles.lanyardContent}>
          <View style={styles.lanyardHeader}>
            <Text style={styles.lanyardTitle}>Prayer Times</Text>
            <Text style={styles.lanyardLocation}>
              {location ? `${location.city}` : 'New York'}
            </Text>
          </View>
          
          <View style={styles.lanyardTimes}>
            <View style={styles.lanyardTimeRow}>
              <Text style={styles.lanyardTimeLabel}>Current Time</Text>
              <Text style={styles.lanyardTimeValue}>{formatTime(currentTime)}</Text>
            </View>
            
            {currentPrayer && (
              <View style={styles.lanyardTimeRow}>
                <Text style={styles.lanyardTimeLabel}>Current Prayer</Text>
                <Text style={styles.lanyardTimeValue}>{currentPrayer.name} - {currentPrayer.time}</Text>
              </View>
            )}
            
            {nextPrayer && (
              <View style={styles.lanyardTimeRow}>
                <Text style={styles.lanyardTimeLabel}>Next Prayer</Text>
                <Text style={styles.lanyardTimeValue}>{nextPrayer.name} - {nextPrayer.time}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.lanyardDates}>
            <View style={styles.lanyardDateRow}>
              <Text style={styles.lanyardDateLabel}>Gregorian</Text>
              <Text style={styles.lanyardDateValue}>{formatDate(currentTime)}</Text>
            </View>
            
            <View style={styles.lanyardDateRow}>
              <Text style={styles.lanyardDateLabel}>Hijri</Text>
              <Text style={styles.lanyardDateValue}>{hijriDate || 'Loading...'}</Text>
            </View>
          </View>
        </View>
        </LinearGradient>
      </View>
    </View>
  );
}

function AnimatedCircularCard({ action, index, scrollY }: { action: QuickAction; index: number; scrollY: any }) {
  const { theme } = useTheme();
  const colors = Colors[((theme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const scale = useSharedValue(0.95);
  const opacity = useSharedValue(0);
  const shadowOpacity = useSharedValue(0.3);
  const rotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const titleScale = useSharedValue(0.8);
  const titleOpacity = useSharedValue(0);
  
  // Calculate the position for scroll reveal animation
  const cardHeight = 160; // Approximate height of each card including spacing
  const startPosition = index * cardHeight + 100; // Start animation when card comes into view

  useEffect(() => {
    // Keep initial values hidden - only scroll reveal will show them
    scale.value = 0.8;
    opacity.value = 0;
    titleScale.value = 0.7;
    titleOpacity.value = 0;
    
    // Subtle continuous micro-animation
    rotation.value = withRepeat(
      withTiming(1, { duration: 4000 }),
      -1,
      true
    );
    
    // Subtle pulse animation for image cards
    if (action.title === 'Full Prayer Times' || action.title === 'Qibla Direction' || 
        action.title === 'Quran' || action.title === 'Tasbih Counter') {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 2000 }),
          withTiming(1, { duration: 2000 })
        ),
        -1,
        false
      );
    }
  }, [scale, opacity, index]);

  const animatedStyle = useAnimatedStyle(() => {
    const rotateZ = rotation.value * 2; // Very subtle rotation (±2 degrees)
    const shadowIntensity = shadowOpacity.value;
    const baseScale = scale.value * pulseScale.value;
    
    // Progressive scroll-based reveal animation
    const scrollRevealOpacity = interpolate(
      scrollY.value,
      [startPosition - 100, startPosition + 150],
      [0, 1], // Start at 0% opacity for progressive reveal
      Extrapolate.CLAMP
    );
    
    const scrollRevealScale = interpolate(
      scrollY.value,
      [startPosition - 100, startPosition + 150],
      [0.9, 1], // Start at 90% scale, end at 100% (normal size)
      Extrapolate.CLAMP
    );
    
    const scrollRevealTranslateY = interpolate(
      scrollY.value,
      [startPosition - 100, startPosition + 150],
      [30, 0], // Subtle translation for better visibility
      Extrapolate.CLAMP
    );
    
    // Ensure last 3 cards always reveal (fallback for scroll trigger issues)
    const finalOpacity = index >= 3 ? 1 : scrollRevealOpacity;
    const finalScale = index >= 3 ? 1 : scrollRevealScale;
    
    return {
      transform: [
        { scale: finalScale },
        { rotateZ: `${rotateZ}deg` },
        { translateY: scrollRevealTranslateY }
      ],
      opacity: finalOpacity,
      shadowOpacity: shadowIntensity,
    };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    // Progressive scroll-based reveal animation for title
    const titleScrollOpacity = interpolate(
      scrollY.value,
      [startPosition - 50, startPosition + 175],
      [0, 1], // Start at 0% opacity for progressive reveal
      Extrapolate.CLAMP
    );
    
    const titleScrollScale = interpolate(
      scrollY.value,
      [startPosition - 50, startPosition + 175],
      [0.7, 1], // Start at 70% scale for smoother effect
      Extrapolate.CLAMP
    );
    
    // Ensure last 3 card titles always reveal
    const finalTitleOpacity = index >= 3 ? 1 : titleScrollOpacity;
    const finalTitleScale = index >= 3 ? 1 : titleScrollScale;
    
    return {
      transform: [{ scale: finalTitleScale }],
      opacity: finalTitleOpacity,
    };
  });

  const router = useRouter();
  
  const handlePressIn = () => {
    scale.value = withTiming(0.94, { duration: 100 });
    shadowOpacity.value = withTiming(0.15, { duration: 100 });
    titleScale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1.02, { damping: 8, stiffness: 100 });
    shadowOpacity.value = withTiming(0.4, { duration: 150 });
    titleScale.value = withSpring(1.05, { damping: 8, stiffness: 100 });
    
    // Reset to normal after a brief moment
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 10, stiffness: 120 });
      shadowOpacity.value = withTiming(0.3, { duration: 200 });
      titleScale.value = withSpring(1, { damping: 10, stiffness: 120 });
    }, 100);
  };

  const handlePress = () => {
    // Navigate to the route
    setTimeout(() => {
      router.push(action.route as any);
    }, 150);
  };

  return (
    <Reanimated.View style={animatedStyle}>
      <View style={styles.cardWithTitle}>
        <TouchableOpacity
          style={[styles.actionCard, { borderWidth: 0 }]}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          {action.title === 'Full Prayer Times' ? (
            <View style={styles.prayerTimesCardContainer}>
              <Image 
                source={require('@/assets/images/prayer-times-icon.png')} 
                style={styles.prayerTimesCardBackground}
                resizeMode="cover"
              />
            </View>
          ) : action.title === 'Qibla Direction' ? (
            <View style={styles.qiblaCardContainer}>
              <Image 
                source={require('@/assets/images/Qibla.jpeg')} 
                style={styles.qiblaCardBackground}
                resizeMode="cover"
              />
            </View>
          ) : action.title === 'Quran' ? (
            <View style={styles.quranCardContainer}>
              <Image 
                source={require('@/assets/images/Quran.png')} 
                style={styles.quranCardBackground}
                resizeMode="cover"
              />
            </View>
          ) : action.title === 'Tasbih Counter' ? (
            <View style={styles.tasbihCardContainer}>
              <Image 
                source={require('@/assets/images/Tasbih-icon.png')} 
                style={styles.tasbihCardBackground}
                resizeMode="cover"
              />
            </View>
          ) : action.title === 'Duas' ? (
            <View style={styles.duasCardContainer}>
              <Image 
                source={require('@/assets/images/Duas.png')} 
                style={styles.duasCardBackground}
                resizeMode="cover"
              />
            </View>
          ) : action.title === 'Hadith' ? (
            <View style={styles.hadithCardContainer}>
              <Image 
                source={require('@/assets/images/Hadith.png')} 
                style={styles.hadithCardBackground}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View style={[styles.circularActionCard, { backgroundColor: action.color }]}>
              <View style={styles.circularCardContent}>
                <IconSymbol name={action.icon as any} size={32} color={colors.text} />
              </View>
            </View>
          )}
        </TouchableOpacity>
        <Reanimated.Text style={[styles.cardTitle, titleAnimatedStyle, { color: colors.text }]}>
          {action.title === 'Full Prayer Times' ? 'Prayer Times' :
           action.title === 'Qibla Direction' ? 'Qibla Direction' :
           action.title === 'Quran' ? 'Quran' :
           action.title === 'Tasbih Counter' ? 'Tasbih' :
           action.title === 'Duas' ? 'Duas' :
           action.title === 'Hadith' ? 'Hadith' : action.title}
        </Reanimated.Text>
      </View>
    </Reanimated.View>
  );
}

function HomeScreenContent({ scrollY }: { scrollY: any }) {
  const { theme, isDark } = useTheme();
  const colors = Colors[((theme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const router = useRouter();

  const quickActions: QuickAction[] = [
    { title: 'Full Prayer Times', icon: 'clock.fill', route: '/prayer-times', color: '#4CAF50' },
    { title: 'Qibla Direction', icon: 'location.fill', route: '/qibla', color: '#2196F3' },
    { title: 'Quran', icon: 'book.fill', route: '/quran', color: '#9C27B0' },
    { title: 'Tasbih Counter', icon: 'circle.grid.3x3.fill', route: '/tasbih', color: '#FF9800' },
    { title: 'Duas', icon: 'hands.sparkles.fill', route: '/duas', color: '#E91E63' },
    { title: 'Hadith', icon: 'quote.bubble.fill', route: '/hadith', color: '#607D8B' },
  ];

  return (
    <>
      <View style={styles.quickActions}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Quick Actions
        </Text>
        <View style={styles.grid}>
          {quickActions.map((action, index) => (
            <AnimatedCircularCard key={index} action={action} index={index} scrollY={scrollY} />
          ))}
        </View>
      </View>

      <View style={[styles.verseContainer, { backgroundColor: 'transparent' }]}>
        <Text style={[styles.verseText, { color: colors.text }]}>
          "And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose. Allah has already set for everything a [decreed] extent."
        </Text>
        <Text style={[styles.verseReference, { color: colors.tint }]}>
          - Quran 65:3
        </Text>
      </View>
    </>
  );
}

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const colors = Colors[((theme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollY = useSharedValue(0);
  
  // Hadith popup state
  const [showHadithPopup, setShowHadithPopup] = useState(false);
  const [randomHadith, setRandomHadith] = useState<Hadith | null>(null);
  const [popupScale] = useState(new Animated.Value(0));
  const [popupOpacity] = useState(new Animated.Value(0));


  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Show random hadith popup on component mount
  const showRandomHadith = () => {
    // Select a random hadith from all collections
    const randomIndex = Math.floor(Math.random() * hadiths.length);
    const selectedHadith = hadiths[randomIndex];
    setRandomHadith(selectedHadith);
    setShowHadithPopup(true);
    
    // Animate popup appearance
    Animated.parallel([
      Animated.timing(popupScale, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(popupOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeHadithPopup = () => {
    Animated.parallel([
      Animated.timing(popupScale, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(popupOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowHadithPopup(false);
    });
  };

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle pulse animation for the greeting
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Show hadith popup after a delay
    const hadithTimer = setTimeout(showRandomHadith, 2000);
    
    return () => {
      pulseAnimation.stop();
      clearTimeout(hadithTimer);
    };
  }, []);

  return (
    <LocationWrapper>
      <LinearGradient
        colors={['#101828', '#101828']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.iridescentBackground}
      >
        {/* Animated Hadith Popup */}
        <Modal
          visible={showHadithPopup}
          transparent={true}
          animationType="none"
          onRequestClose={closeHadithPopup}
        >
          <Animated.View 
            style={[
              styles.popupOverlay,
              {
                opacity: popupOpacity,
              }
            ]}
          >
            <TouchableOpacity 
              style={styles.popupOverlayTouchable}
              activeOpacity={1}
              onPress={closeHadithPopup}
            >
              <Animated.View
                style={[
                  styles.popupContainer,
                  {
                    transform: [{ scale: popupScale }],
                  }
                ]}
              >
                <TouchableOpacity activeOpacity={1}>
                  <LinearGradient
                    colors={['#FFFFFF', '#F8F9FA']}
                    style={styles.popupContent}
                  >
                    <View style={styles.popupHeader}>
                      <Text style={styles.popupTitle}>Daily Hadith</Text>
                      <TouchableOpacity 
                        onPress={closeHadithPopup}
                        style={styles.closeButton}
                      >
                        <IconSymbol name="xmark" size={20} color="#666666" />
                      </TouchableOpacity>
                    </View>
                    
                    {randomHadith && (
                      <View style={styles.popupHadithContent}>
                        <Text style={styles.popupHadithText}>
                          "{randomHadith.text}"
                        </Text>
                        {randomHadith.arabic && (
                          <Text style={styles.popupHadithArabic}>
                            {randomHadith.arabic}
                          </Text>
                        )}
                        <View style={styles.popupHadithMeta}>
                          <Text style={styles.popupNarrator}>
                            - {randomHadith.narrator}
                          </Text>
                          <Text style={styles.popupSource}>
                            {randomHadith.source}
                            {randomHadith.bookNumber && randomHadith.hadithNumber && 
                              ` ${randomHadith.bookNumber}:${randomHadith.hadithNumber}`}
                          </Text>
                        </View>
                      </View>
                    )}
                    
                    <View style={styles.popupFooter}>
                      <TouchableOpacity 
                        onPress={closeHadithPopup}
                        style={styles.popupCloseButton}
                      >
                        <Text style={styles.popupCloseButtonText}>Continue</Text>
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        </Modal>

        <View style={[styles.container, { backgroundColor: '#101828' }]}>
          <Reanimated.ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
            bounces={true}
            alwaysBounceVertical={true}
            scrollEnabled={true}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
          >
        {/* More Menu Button */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <View style={styles.menuButtonContainer}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#FFFFFF' }]}>
              <IconSymbol name="line.3.horizontal" size={IS_IPAD ? 32 : 28} color="#2C3E50" />
            </View>
            <Text style={styles.menuButtonText}>More</Text>
          </View>
        </TouchableOpacity>

        {/* Animated Hero Message */}
        <AnimatedHeroMessage />

        {/* Bismillah */}
        <View style={styles.bismillahContainer}>
          <Text style={styles.bismillahText}>بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</Text>
          <Text style={styles.bismillahTranslation}>In the Name of Allah, the Most Gracious, the Most Merciful</Text>
        </View>
        <LanyardCard />
        <HomeScreenContent scrollY={scrollY} />
        </Reanimated.ScrollView>
        </View>
      </LinearGradient>
    </LocationWrapper>
  );
}

const styles = StyleSheet.create({
  iridescentBackground: {
    flex: 1,
  },
  borderContainer: {
    flex: 1,
    margin: 15,
    borderRadius: 20,
    borderWidth: 8,
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    position: 'relative',
  },
  container: {
    flex: 1,
  },
  quickActions: {
    padding: IS_IPAD ? 20 : 10,
    maxWidth: IS_IPAD ? 1000 : undefined,
    alignSelf: IS_IPAD ? 'center' : 'auto',
  },
  sectionTitle: {
    fontSize: IS_IPAD ? 28 : 20,
    fontWeight: 'bold',
    marginBottom: IS_IPAD ? 20 : 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: IS_IPAD ? 40 : IS_SMALL_PHONE ? 10 : 20,
    gap: IS_IPAD ? 30 : IS_SMALL_PHONE ? 15 : 20,
  },
  actionCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 25,
    },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWithTitle: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: IS_IPAD ? 20 : IS_SMALL_PHONE ? 14 : 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  actionGradient: {
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  prayerTimesCardContainer: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: CARD_SIZE / 2,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 20,
  },
  prayerTimesCardBackground: {
    width: '100%',
    height: '100%',
  },
  qiblaCardContainer: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: CARD_SIZE / 2,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 25,
    },
    shadowOpacity: 0.7,
    shadowRadius: 40,
    elevation: 35,
  },
  qiblaCardBackground: {
    width: '100%',
    height: '100%',
  },
  quranCardContainer: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: CARD_SIZE / 2,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 25,
    },
    shadowOpacity: 0.7,
    shadowRadius: 40,
    elevation: 35,
  },
  quranCardBackground: {
    width: '100%',
    height: '100%',
  },
  tasbihCardContainer: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: CARD_SIZE / 2,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 25,
    },
    shadowOpacity: 0.7,
    shadowRadius: 40,
    elevation: 35,
  },
  tasbihCardBackground: {
    width: '100%',
    height: '100%',
  },
  duasCardContainer: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: CARD_SIZE / 2,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 25,
    },
    shadowOpacity: 0.7,
    shadowRadius: 40,
    elevation: 35,
  },
  duasCardBackground: {
    width: '100%',
    height: '100%',
  },
  hadithCardContainer: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: CARD_SIZE / 2,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 25,
    },
    shadowOpacity: 0.7,
    shadowRadius: 40,
    elevation: 35,
  },
  hadithCardBackground: {
    width: '100%',
    height: '100%',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: Fonts.secondary,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  circularActionCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: CARD_SIZE / 2,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 20,
  },
  circularCardContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  circularCardTitle: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: Fonts.secondary,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  verseContainer: {
    margin: IS_IPAD ? 20 : 10,
    padding: IS_IPAD ? 24 : 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    maxWidth: IS_IPAD ? 800 : undefined,
    alignSelf: IS_IPAD ? 'center' : 'auto',
  },
  verseText: {
    fontSize: IS_IPAD ? 20 : 16,
    lineHeight: IS_IPAD ? 32 : 24,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  verseReference: {
    fontSize: IS_IPAD ? 18 : 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  lanyardCardWrapper: {
    marginHorizontal: IS_IPAD ? 40 : 10,
    marginTop: 20,
    marginBottom: 10,
    maxWidth: IS_IPAD ? 900 : undefined,
    alignSelf: IS_IPAD ? 'center' : 'auto',
    width: IS_IPAD ? '85%' : undefined,
  },
  lanyardCard: {
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    // Black shadow (bottom-right)
    shadowColor: '#000000',
    shadowOffset: {
      width: 30,
      height: 30,
    },
    shadowOpacity: 0.25,
    shadowRadius: 48,
    elevation: 20,
  },
  lanyardGradient: {
    borderRadius: 30,
    padding: IS_IPAD ? 40 : 24,
  },
  lanyardContent: {
    alignItems: 'center',
  },
  lanyardHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  lanyardTitle: {
    fontSize: IS_IPAD ? 36 : 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: IS_IPAD ? 8 : 5,
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  lanyardLocation: {
    fontSize: IS_IPAD ? 24 : 18,
    color: '#FFFFFF',
    fontWeight: '700',
    opacity: 0.9,
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  lanyardTimes: {
    width: '100%',
    marginBottom: 20,
  },
  lanyardTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  lanyardTimeLabel: {
    fontSize: IS_IPAD ? 24 : 18,
    color: '#FFFFFF',
    fontWeight: '800',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  lanyardTimeValue: {
    fontSize: IS_IPAD ? 24 : 18,
    color: '#FFFFFF',
    fontWeight: '900',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  lanyardDates: {
    width: '100%',
  },
  lanyardDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  lanyardDateLabel: {
    fontSize: IS_IPAD ? 22 : 16,
    color: '#FFFFFF',
    fontWeight: '800',
    opacity: 0.9,
  },
  lanyardDateValue: {
    fontSize: IS_IPAD ? 22 : 16,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  lanyardLoadingText: {
    fontSize: IS_IPAD ? 24 : 20,
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
    padding: 20,
  },
  // Popup styles
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  popupOverlayTouchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  popupContent: {
    padding: 0,
  },
  popupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupHadithContent: {
    padding: 20,
  },
  popupHadithText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2C3E50',
    fontStyle: 'italic',
    marginBottom: 15,
    textAlign: 'center',
  },
  popupHadithArabic: {
    fontSize: 18,
    lineHeight: 28,
    color: '#0077b6',
    textAlign: 'right',
    marginBottom: 15,
    fontFamily: 'System',
  },
  popupHadithMeta: {
    alignItems: 'center',
  },
  popupNarrator: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  popupSource: {
    fontSize: 12,
    color: '#7F8C8D',
    opacity: 0.8,
  },
  popupFooter: {
    padding: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  popupCloseButton: {
    backgroundColor: '#0077b6',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
  },
  popupCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  menuButton: {
    paddingTop: 60,
    paddingLeft: 20,
    paddingBottom: 10,
  },
  menuButtonContainer: {
    alignItems: 'flex-start',
  },
  menuIconContainer: {
    width: IS_IPAD ? 56 : 48,
    height: IS_IPAD ? 56 : 48,
    borderRadius: IS_IPAD ? 28 : 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
  },
  menuButtonText: {
    marginTop: 4,
    marginLeft: 5,
    fontSize: IS_IPAD ? 18 : 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bismillahContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: IS_IPAD ? -120 : IS_SMALL_PHONE ? -60 : IS_LARGE_PHONE ? -140 : -180,
    zIndex: 10,
  },
  bismillahText: {
    fontSize: IS_IPAD ? 56 : IS_SMALL_PHONE ? 30 : 42,
    color: '#FFFFFF',
    fontFamily: 'Amiri-Bold',
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: IS_IPAD ? 12 : IS_SMALL_PHONE ? 10 : 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
    opacity: 0.9,
  },
  bismillahTranslation: {
    fontSize: IS_IPAD ? 26 : IS_SMALL_PHONE ? 15 : 19,
    color: '#FFFFFF',
    fontFamily: 'CormorantGaramond-Italic',
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.85,
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

