import AnimatedHeroMessage from '@/components/AnimatedHeroMessage';
import LocationWrapper from '@/components/LocationWrapper';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useLocation } from '@/contexts/LocationContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Hadith, hadiths } from '@/data/hadithData';
import { PrayerTimesService } from '@/services/PrayerTimesService';
import QuranService from '@/services/QuranService';
import { getRamadanStartGregorian, getTargetRamadanYear } from '@/services/RamadanService';
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_IPAD = Platform.OS === 'ios' && (Platform.isPad === true || SCREEN_WIDTH >= 768);
const IS_IPAD_MINI = IS_IPAD && Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) <= 800;
const IS_IPAD_11 = IS_IPAD && Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) <= 900 && !IS_IPAD_MINI;
const IS_SMALL_PHONE = !IS_IPAD && SCREEN_WIDTH < 400;
const IS_LARGE_PHONE = !IS_IPAD && SCREEN_WIDTH >= 414;
const IS_PRO_MAX = !IS_IPAD && SCREEN_WIDTH >= 430;
// Phone: ensure 2 cards + gap fit within (SCREEN_WIDTH - quickActions padding - grid padding)
const PHONE_PADDING = IS_SMALL_PHONE ? 20 + 20 : 20 + 40; // quickActions 10*2 + grid horizontal
const PHONE_GAP = IS_SMALL_PHONE ? 22 : 28;
const CARD_SIZE = IS_IPAD
  ? Math.min((SCREEN_WIDTH - 120) / 3, 240) // iPad: 3 columns, 240px max
  : Math.min((SCREEN_WIDTH - PHONE_PADDING - PHONE_GAP) / 2, 175); // Phone: 2 columns, fit without stacking

interface QuickAction {
  title: string;
  icon: string;
  route: string;
  color: string;
}

// Set to true to preview Ramadan-in-progress layout (Ramadan Day X, Suhoor/Iftar). Set back to false when done.
const FORCE_RAMADAN_PREVIEW = false;

function LanyardCard() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = Colors[((theme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const { location, locationEnabled } = useLocation();
  const [prayerTimes, setPrayerTimes] = useState<any[]>([]);
  const [locationTimezone, setLocationTimezone] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hijriDate, setHijriDate] = useState<string>('');
  const [daysUntilRamadan, setDaysUntilRamadan] = useState<number | null>(null);
  const [ramadanStartDate, setRamadanStartDate] = useState<string>('');
  const [ramadanStartDateObj, setRamadanStartDateObj] = useState<Date | null>(null);

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
        const result = await PrayerTimesService.getPrayerTimesWithTimezone(
          location.latitude,
          location.longitude
        );
        times = result.times;
        setLocationTimezone(result.timezone || '');
      } else {
        times = await PrayerTimesService.getPrayerTimesByCity(location.city, location.country);
        setLocationTimezone('');
      }
      setPrayerTimes(times);
    } catch (err) {
      console.error('Error fetching prayer times:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRamadanCountdown = async (hijriInfo: {
    year: string;
    month: { number: string };
    day: string;
  }) => {
    try {
      const hijriYearNumber = parseInt(hijriInfo.year, 10);
      const hijriMonthNumber = parseInt(hijriInfo.month.number, 10);
      const hijriDayNumber = parseInt(hijriInfo.day, 10);
      const targetHijriYear = getTargetRamadanYear(hijriYearNumber, hijriMonthNumber, hijriDayNumber);

      const gregorianStr = await getRamadanStartGregorian(targetHijriYear);
      let ramadanDate: Date | null = null;
      if (gregorianStr) {
        const [y, m, d] = gregorianStr.split('-').map(Number);
        ramadanDate = new Date(y, m - 1, d);
      }

      if (ramadanDate) {
        const today = new Date();
        ramadanDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        let diffDays = Math.ceil(
          (ramadanDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays < 0 || (hijriMonthNumber === 9 && hijriDayNumber >= 1)) {
          diffDays = 0;
        }

        setDaysUntilRamadan(diffDays);
        setRamadanStartDateObj(ramadanDate);
        setRamadanStartDate(
          ramadanDate.toLocaleDateString(undefined, {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })
        );
        return;
      }

      setDaysUntilRamadan(null);
      setRamadanStartDate('');
      setRamadanStartDateObj(null);
    } catch (error) {
      console.error('Error calculating Ramadan countdown:', error);
      setDaysUntilRamadan(null);
      setRamadanStartDate('');
      setRamadanStartDateObj(null);
    }
  };

  const HIJRI_MONTHS = [
    'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
    'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah',
  ];

  const fetchHijriDate = async () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const applyHijri = (h: { year: string; month: { number: string } | { number?: string }; day: string }) => {
      const m = parseInt(h.month?.number ?? '1', 10);
      const monthName = HIJRI_MONTHS[m - 1] || 'Unknown';
      setHijriDate(`${h.day} ${monthName} ${h.year} AH`);
      return calculateRamadanCountdown({ year: h.year, month: { number: String(m) }, day: h.day });
    };

    try {
      const res = await fetch(`https://api.aladhan.com/v1/gToH?date=${day}-${month}-${year}`);
      const data = await res.json();
      if (data.code === 200 && data.data?.hijri) {
        await applyHijri(data.data.hijri);
        return;
      }
    } catch (_) {}

    try {
      const res = await fetch(`https://www.ummahapi.com/api/hijri-date?date=${dateStr}`);
      const json = await res.json();
      const hijri = json?.data?.hijri;
      if (hijri?.year && hijri?.month != null && hijri?.day != null) {
        await applyHijri({
          year: String(hijri.year),
          month: { number: String(hijri.month) },
          day: String(hijri.day),
        });
        return;
      }
    } catch (_) {}

    const gregorianDate = new Date();
    const gy = gregorianDate.getFullYear();
    const hijriYear = Math.round(1446 + (gy - 2025));
    const hijriMonth = gregorianDate.getMonth() + 1;
    const hijriDay = gregorianDate.getDate();
    setHijriDate(`${hijriDay} ${HIJRI_MONTHS[hijriMonth - 1] || 'Unknown'} ${hijriYear} AH`);
    await calculateRamadanCountdown({
      year: String(hijriYear),
      month: { number: String(hijriMonth) },
      day: String(hijriDay),
    });
  };

  const getCurrentPrayer = () => {
    const tz = location?.timezone || locationTimezone;
    const currentTimeMinutes = tz
      ? PrayerTimesService.getNowInTimezone(tz).timeMinutes
      : (() => {
          const now = new Date();
          const s = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
          const [h, m] = s.split(':').map(Number);
          return h * 60 + m;
        })();

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
    const tz = location?.timezone || locationTimezone;
    const currentTimeMinutes = tz
      ? PrayerTimesService.getNowInTimezone(tz).timeMinutes
      : (() => {
          const now = new Date();
          const s = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
          const [h, m] = s.split(':').map(Number);
          return h * 60 + m;
        })();

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

  const tz = location?.timezone || locationTimezone;
  const formatTime = (date: Date) => {
    if (tz) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: tz,
      });
    }
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    if (tz) {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: tz,
      });
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRamadanDay = (): number | null => {
    if (!ramadanStartDateObj || daysUntilRamadan !== 0) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(ramadanStartDateObj);
    start.setHours(0, 0, 0, 0);
    const diffMs = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0 || diffDays >= 30) return null;
    return diffDays + 1;
  };

  const parseTimeToMinutes = (timeStr: string): number => {
    const m = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!m) return 0;
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12;
    if (m[3].toUpperCase() === 'AM' && h === 12) h = 0;
    return h * 60 + min;
  };

  const getUntilIftarString = (): string | null => {
    const maghrib = prayerTimes.find((p) => p.name === 'Maghrib');
    const fajr = prayerTimes.find((p) => p.name === 'Fajr');
    if (!maghrib || !fajr) return null;
    const tz = location?.timezone || locationTimezone;
    const nowMinutes = tz
      ? PrayerTimesService.getNowInTimezone(tz).timeMinutes
      : currentTime.getHours() * 60 + currentTime.getMinutes();
    const maghribMinutes = parseTimeToMinutes(maghrib.time);
    const fajrMinutes = parseTimeToMinutes(fajr.time);
    if (nowMinutes < maghribMinutes) {
      const diff = maghribMinutes - nowMinutes;
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      return `⏳ ${h}h ${m}m until Iftar`;
    }
    const minutesUntilFajr = (24 * 60 - nowMinutes) + fajrMinutes;
    const h = Math.floor(minutesUntilFajr / 60);
    const m = minutesUntilFajr % 60;
    return `⏳ ${h}h ${m}m until Suhoor`;
  };

  /** Live countdown in hours, minutes, seconds (updates every second with currentTime). */
  const getCountdownToIftarOrSuhoor = (): { label: string; hours: number; minutes: number; seconds: number } | null => {
    const maghrib = prayerTimes.find((p) => p.name === 'Maghrib');
    const fajr = prayerTimes.find((p) => p.name === 'Fajr');
    if (!maghrib || !fajr) return null;
    const now = currentTime.getTime();
    const y = currentTime.getFullYear();
    const mo = currentTime.getMonth();
    const d = currentTime.getDate();
    const maghribMinutes = parseTimeToMinutes(maghrib.time);
    const fajrMinutes = parseTimeToMinutes(fajr.time);
    const maghribHour = Math.floor(maghribMinutes / 60);
    const maghribMin = maghribMinutes % 60;
    const fajrHour = Math.floor(fajrMinutes / 60);
    const fajrMin = fajrMinutes % 60;
    const targetMaghrib = new Date(y, mo, d, maghribHour, maghribMin, 0).getTime();
    let targetMs: number;
    let label: string;
    if (now < targetMaghrib) {
      targetMs = targetMaghrib;
      label = 'until Iftar';
    } else {
      const targetFajr = new Date(y, mo, d + 1, fajrHour, fajrMin, 0).getTime();
      targetMs = targetFajr;
      label = 'until Suhoor';
    }
    let diffMs = targetMs - now;
    if (diffMs <= 0) return null;
    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { label, hours, minutes, seconds };
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

          {daysUntilRamadan !== null && (
            Platform.OS === 'android' ? (
            <View style={[styles.ramadanCountdown, styles.ramadanCountdownAndroid]}>
              <View style={styles.ramadanCountdownInner}>
              {(FORCE_RAMADAN_PREVIEW || (daysUntilRamadan === 0 && getRamadanDay() !== null)) ? (
                <View style={styles.ramadanInProgress}>
                  <Text style={styles.ramadanDayHeader}>
                    Ramadan Day {FORCE_RAMADAN_PREVIEW ? 7 : getRamadanDay()}
                  </Text>
                  <View style={styles.ramadanTimesBlock}>
                    <View style={styles.ramadanTimeRow}>
                      <Text style={styles.ramadanTimeLabel}>Iftar</Text>
                      <Text style={styles.ramadanTimeValue}>
                        {prayerTimes.find((p) => p.name === 'Maghrib')?.time ?? '--'}
                      </Text>
                    </View>
                    <View style={styles.ramadanTimeRow}>
                      <Text style={styles.ramadanTimeLabel}>Suhoor ends</Text>
                      <Text style={styles.ramadanTimeValue}>
                        {prayerTimes.find((p) => p.name === 'Fajr')?.time ?? '--'}
                      </Text>
                    </View>
                  </View>
                  {(() => {
                    const countdown = getCountdownToIftarOrSuhoor();
                    const fallback = getUntilIftarString();
                    if (countdown) {
                      const { label, hours, minutes, seconds } = countdown;
                      const pad = (n: number) => String(n).padStart(2, '0');
                      return (
                        <View style={styles.ramadanCountdownPill}>
                          <Text style={styles.ramadanCountdownPillText}>
                            ⏳ {hours}h {pad(minutes)}m {pad(seconds)}s {label}
                          </Text>
                        </View>
                      );
                    }
                    if (fallback) {
                      return (
                        <View style={styles.ramadanCountdownPill}>
                          <Text style={styles.ramadanCountdownPillText}>{fallback}</Text>
                        </View>
                      );
                    }
                    return null;
                  })()}
                </View>
              ) : (
                <>
                  <Text style={styles.ramadanCountdownLabel}>
                    {daysUntilRamadan === 0 ? 'Ramadan Mubarak!' : 'Days Until Ramadan'}
                  </Text>
                  {daysUntilRamadan > 0 ? (
                    <View style={styles.ramadanCountdownValueContainer}>
                      <Text style={styles.ramadanCountdownValue}>{daysUntilRamadan}</Text>
                      <Text style={styles.ramadanCountdownUnits}>days</Text>
                    </View>
                  ) : (
                    <Text style={styles.ramadanCountdownSubtitle}>Ramadan has begun</Text>
                  )}
                  {ramadanStartDate ? (
                    <Text style={styles.ramadanStartDate}>
                      {daysUntilRamadan === 0 ? `Started ${ramadanStartDate}` : `Starts ${ramadanStartDate}`}
                    </Text>
                  ) : null}
                </>
              )}
              </View>
              <TouchableOpacity
                style={styles.ramadanTrackerLink}
                onPress={() => router.push('/ramadan-tracker')}
                activeOpacity={0.7}
              >
                <Text style={[styles.ramadanTrackerLinkText, { color: '#059669' }]}>Ramadan Tracker</Text>
                <IconSymbol name="chevron.right" size={18} color="#059669" />
              </TouchableOpacity>
            </View>
            ) : (
            <LinearGradient
              colors={['rgba(35, 18, 75, 0.7)', 'rgba(25, 10, 55, 0.8)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ramadanCountdown}
            >
              <View style={styles.ramadanCountdownInner}>
              {(FORCE_RAMADAN_PREVIEW || (daysUntilRamadan === 0 && getRamadanDay() !== null)) ? (
                <View style={styles.ramadanInProgress}>
                  <Text style={styles.ramadanDayHeader}>
                    Ramadan Day {FORCE_RAMADAN_PREVIEW ? 7 : getRamadanDay()}
                  </Text>
                  <View style={styles.ramadanTimesBlock}>
                    <View style={styles.ramadanTimeRow}>
                      <Text style={styles.ramadanTimeLabel}>Iftar</Text>
                      <Text style={styles.ramadanTimeValue}>
                        {prayerTimes.find((p) => p.name === 'Maghrib')?.time ?? '--'}
                      </Text>
                    </View>
                    <View style={styles.ramadanTimeRow}>
                      <Text style={styles.ramadanTimeLabel}>Suhoor ends</Text>
                      <Text style={styles.ramadanTimeValue}>
                        {prayerTimes.find((p) => p.name === 'Fajr')?.time ?? '--'}
                      </Text>
                    </View>
                  </View>
                  {(() => {
                    const countdown = getCountdownToIftarOrSuhoor();
                    const fallback = getUntilIftarString();
                    if (countdown) {
                      const { label, hours, minutes, seconds } = countdown;
                      const pad = (n: number) => String(n).padStart(2, '0');
                      return (
                        <View style={styles.ramadanCountdownPill}>
                          <Text style={styles.ramadanCountdownPillText}>
                            ⏳ {hours}h {pad(minutes)}m {pad(seconds)}s {label}
                          </Text>
                        </View>
                      );
                    }
                    if (fallback) {
                      return (
                        <View style={styles.ramadanCountdownPill}>
                          <Text style={styles.ramadanCountdownPillText}>{fallback}</Text>
                        </View>
                      );
                    }
                    return null;
                  })()}
                </View>
              ) : (
                <>
                  <Text style={styles.ramadanCountdownLabel}>
                    {daysUntilRamadan === 0 ? 'Ramadan Mubarak!' : 'Days Until Ramadan'}
                  </Text>
                  {daysUntilRamadan > 0 ? (
                    <View style={styles.ramadanCountdownValueContainer}>
                      <Text style={styles.ramadanCountdownValue}>{daysUntilRamadan}</Text>
                      <Text style={styles.ramadanCountdownUnits}>days</Text>
                    </View>
                  ) : (
                    <Text style={styles.ramadanCountdownSubtitle}>Ramadan has begun</Text>
                  )}
                  {ramadanStartDate ? (
                    <Text style={styles.ramadanStartDate}>
                      {daysUntilRamadan === 0 ? `Started ${ramadanStartDate}` : `Starts ${ramadanStartDate}`}
                    </Text>
                  ) : null}
                </>
              )}
              </View>
              <TouchableOpacity
                style={styles.ramadanTrackerLink}
                onPress={() => router.push('/ramadan-tracker')}
                activeOpacity={0.7}
              >
                <Text style={[styles.ramadanTrackerLinkText, { color: '#059669' }]}>Ramadan Tracker</Text>
                <IconSymbol name="chevron.right" size={18} color="#059669" />
              </TouchableOpacity>
            </LinearGradient>
            )
          )}
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
              <LinearGradient
                colors={['#4CAF50', '#2E7D32', '#1B5E20']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Image
                source={require('@/assets/images/prayer-times-icon.png')}
                style={[styles.prayerTimesCardBackground, { opacity: 0.75 }]}
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
  const [passage, setPassage] = useState<{ text: string; reference: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadRandomVerse = async () => {
      try {
        const chapterNum = Math.floor(Math.random() * 114) + 1;
        const chapter = await QuranService.getChapterWithTranslation(chapterNum, 'sahih');
        if (cancelled || !chapter.verses?.length) return;
        const verse = chapter.verses[Math.floor(Math.random() * chapter.verses.length)];
        if (cancelled) return;
        setPassage({
          text: verse.translation || verse.text,
          reference: `Quran ${chapterNum}:${verse.verseNumber}`,
        });
      } catch {
        if (!cancelled) {
          setPassage({
            text: 'And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose.',
            reference: 'Quran 65:3',
          });
        }
      }
    };
    loadRandomVerse();
    return () => { cancelled = true; };
  }, []);

  const quickActions: QuickAction[] = [
    { title: 'Full Prayer Times', icon: 'clock.fill', route: '/prayer-times', color: '#4CAF50' },
    { title: 'Qibla Direction', icon: 'location.fill', route: '/qibla', color: '#2196F3' },
    { title: 'Quran', icon: 'book.fill', route: '/(drawer)/(stack)/quran-landing', color: '#9C27B0' },
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
          {passage ? `"${passage.text}"` : '...'}
        </Text>
        <Text style={[styles.verseReference, { color: colors.tint }]}>
          {passage ? `- ${passage.reference}` : ''}
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
            contentContainerStyle={[
              { paddingBottom: 16, flexGrow: 1 },
              IS_IPAD && { paddingHorizontal: 48, paddingBottom: 32 },
            ]}
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
              <IconSymbol name="list.bullet" size={IS_IPAD ? 38 : 28} color="#2C3E50" />
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
    padding: IS_IPAD ? 32 : 10,
    maxWidth: IS_IPAD ? 900 : undefined,
    alignSelf: IS_IPAD ? 'center' : 'auto',
    width: IS_IPAD ? '100%' : undefined,
  },
  sectionTitle: {
    fontSize: IS_IPAD ? 28 : IS_LARGE_PHONE ? 22 : 20,
    fontWeight: 'bold',
    marginBottom: IS_IPAD ? 20 : IS_LARGE_PHONE ? 12 : 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: IS_IPAD ? 24 : IS_SMALL_PHONE ? 10 : 20,
    gap: IS_IPAD ? 48 : IS_SMALL_PHONE ? 22 : 28,
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
    marginBottom: IS_IPAD ? 36 : 26,
  },
  cardTitle: {
    fontSize: IS_IPAD ? 20 : IS_SMALL_PHONE ? 14 : IS_LARGE_PHONE ? 18 : 16,
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
    marginHorizontal: IS_IPAD ? 40 : 24,
    marginTop: 16,
    marginBottom: 8,
    maxWidth: IS_IPAD ? 1100 : undefined,
    alignSelf: IS_IPAD ? 'center' : 'auto',
    width: IS_IPAD ? '92%' : undefined,
  },
  lanyardCard: {
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
    borderRadius: 36,
    padding: IS_IPAD ? 28 : 18,
  },
  lanyardContent: {
    alignItems: 'center',
  },
  lanyardHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  lanyardTitle: {
    fontSize: IS_IPAD ? 34 : 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: IS_IPAD ? 4 : 2,
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  lanyardLocation: {
    fontSize: IS_IPAD ? 24 : 16,
    color: '#FFFFFF',
    fontWeight: '700',
    opacity: 0.9,
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  lanyardTimes: {
    width: '100%',
    marginBottom: 12,
  },
  lanyardTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  lanyardTimeLabel: {
    fontSize: IS_IPAD ? 24 : 16,
    color: '#FFFFFF',
    fontWeight: '800',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  lanyardTimeValue: {
    fontSize: IS_IPAD ? 24 : 16,
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
    paddingVertical: 4,
  },
  lanyardDateLabel: {
    fontSize: IS_IPAD ? 22 : 14,
    color: '#FFFFFF',
    fontWeight: '800',
    opacity: 0.9,
  },
  lanyardDateValue: {
    fontSize: IS_IPAD ? 22 : 14,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  lanyardLoadingText: {
    fontSize: IS_IPAD ? 24 : 18,
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
    padding: 16,
  },
  ramadanCountdown: {
    width: '100%',
    marginTop: 14,
    paddingVertical: IS_IPAD ? 14 : 10,
    paddingHorizontal: IS_IPAD ? 20 : 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 12,
  },
  ramadanCountdownAndroid: {
    backgroundColor: 'rgba(45, 18, 110, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowOpacity: 0.35,
    elevation: 12,
  },
  ramadanCountdownInner: {
    width: '100%',
    alignItems: 'center',
  },
  ramadanCountdownLabel: {
    fontSize: IS_IPAD ? 24 : 17,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    textAlign: 'center',
    width: '100%',
  },
  ramadanInProgress: {
    width: '100%',
    alignItems: 'center',
  },
  ramadanDayHeader: {
    fontSize: IS_IPAD ? 26 : 19,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    width: '100%',
  },
  ramadanTimesBlock: {
    width: '100%',
    marginBottom: 10,
  },
  ramadanTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  ramadanTimeLabel: {
    fontSize: IS_IPAD ? 22 : 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },
  ramadanTimeValue: {
    fontSize: IS_IPAD ? 22 : 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ramadanCountdownPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 28,
    maxWidth: '100%',
    alignSelf: 'center',
  },
  ramadanCountdownPillText: {
    fontSize: IS_IPAD ? 21 : 15,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  ramadanCountdownValueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
    justifyContent: 'center',
  },
  ramadanCountdownValue: {
    fontSize: IS_IPAD ? 62 : 42,
    fontWeight: '900',
    color: '#FFFFFF',
    marginRight: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 2, height: 4 },
    textShadowRadius: 4,
  },
  ramadanCountdownUnits: {
    fontSize: IS_IPAD ? 26 : 18,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: IS_IPAD ? 6 : 4,
  },
  ramadanCountdownSubtitle: {
    fontSize: IS_IPAD ? 24 : 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
    width: '100%',
  },
  ramadanStartDate: {
    fontSize: IS_IPAD ? 22 : 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    width: '100%',
  },
  ramadanTrackerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    gap: 4,
  },
  ramadanTrackerLinkText: {
    fontSize: IS_IPAD ? 22 : 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
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
    maxWidth: IS_IPAD ? 480 : 400,
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
    paddingTop: IS_IPAD ? 88 : 72,
    paddingLeft: IS_IPAD ? 12 : 20,
    paddingBottom: 10,
  },
  menuButtonContainer: {
    alignItems: 'flex-start',
  },
  menuIconContainer: {
    width: IS_IPAD ? 64 : 48,
    height: IS_IPAD ? 64 : 48,
    borderRadius: IS_IPAD ? 32 : 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
  },
  menuButtonText: {
    marginTop: IS_IPAD ? 6 : 4,
    marginLeft: IS_IPAD ? 6 : 5,
    fontSize: IS_IPAD ? 22 : 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bismillahContainer: {
    alignItems: 'center',
    paddingHorizontal: IS_IPAD ? 40 : 20,
    paddingVertical: IS_IPAD_MINI ? 10 : IS_IPAD_11 ? 12 : IS_IPAD ? 16 : 10,
    marginTop: IS_IPAD_MINI ? -320 : IS_IPAD_11 ? -260 : IS_IPAD ? -180 : IS_SMALL_PHONE ? -80 : IS_LARGE_PHONE ? -160 : -220,
    zIndex: 10,
  },
  bismillahText: {
    fontSize: IS_IPAD ? 56 : IS_SMALL_PHONE ? 30 : IS_LARGE_PHONE ? 46 : 42,
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
    fontSize: IS_IPAD ? 26 : IS_SMALL_PHONE ? 15 : IS_LARGE_PHONE ? 21 : 19,
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


