import LocationWrapper from '@/components/LocationWrapper';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useLocation } from '@/contexts/LocationContext';
import { usePrayerSettings } from '@/contexts/PrayerSettingsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PrayerTimesService } from '@/services/PrayerTimesService';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_IPAD = Platform.OS === 'ios' ? Boolean((Platform as any).isPad) : SCREEN_WIDTH >= 768;
const IS_SMALL_PHONE = SCREEN_WIDTH < 400;

interface PrayerTime {
  name: string;
  time: string;
  arabic: string;
  next: boolean;
}

function PrayerTimesContent() {
  const { theme } = useTheme();
  const colors = Colors[((theme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { location, locationEnabled } = useLocation();
  const { settings: prayerSettings } = usePrayerSettings();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hijriDate, setHijriDate] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDST, setIsDST] = useState(false);
  const [timezoneOffset, setTimezoneOffset] = useState('');
  const [locationTimezone, setLocationTimezone] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Check DST status and update timezone offset
  const checkDST = async () => {
    const now = new Date();
    const january = new Date(now.getFullYear(), 0, 1);
    const july = new Date(now.getFullYear(), 6, 1);
    const stdTimezoneOffset = Math.max(january.getTimezoneOffset(), july.getTimezoneOffset());
    const isDSTActive = now.getTimezoneOffset() < stdTimezoneOffset;
    setIsDST(isDSTActive);

    // Get timezone offset
    // If we have a location timezone, calculate offset for that timezone
    if (locationTimezone && location) {
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: locationTimezone,
          timeZoneName: 'longOffset'
        });
        const parts = formatter.formatToParts(now);
        const offsetPart = parts.find(part => part.type === 'timeZoneName');
        
        if (offsetPart) {
          // Parse offset like "GMT+1" or "GMT-5"
          const match = offsetPart.value.match(/GMT([+-])(\d+)/);
          if (match) {
            const sign = match[1];
            const hours = match[2].padStart(2, '0');
            setTimezoneOffset(`UTC${sign}${hours}:00`);
            return;
          }
        }
      } catch (err) {
        console.log('Could not get timezone offset for location timezone');
      }
    }

    // Fallback to device timezone offset
    const offset = -now.getTimezoneOffset();
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset >= 0 ? '+' : '-';
    setTimezoneOffset(`UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchPrayerTimes();
    fetchHijriDate();
  }, [location, locationEnabled, prayerSettings, selectedDate]);

  useEffect(() => {
    checkDST();
  }, [locationTimezone]);

  const fetchPrayerTimes = async () => {
    console.log('🕌 fetchPrayerTimes called with:', { location, locationEnabled, prayerSettings, selectedDate });
    
    if (!location && !locationEnabled) {
      try {
        console.log('📍 Using default location: New York, USA');
        const defaultPrayerTimes = await PrayerTimesService.getPrayerTimesByCity('New York', 'USA', selectedDate);
        setPrayerTimes(defaultPrayerTimes);
        // Set default timezone
        setLocationTimezone('America/New_York');
      } catch (err) {
        console.error('Error loading default prayer times:', err);
        setError('Failed to load prayer times');
      }
      return;
    }

    if (!location) {
      console.log('⚠️ No location available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let times: PrayerTime[];
      let timezoneFromAPI = '';
      
      // Validate coordinates before using them
      if (location.latitude !== 0 && location.longitude !== 0) {
        if (location.latitude >= -90 && location.latitude <= 90 && 
            location.longitude >= -180 && location.longitude <= 180) {
          console.log(`🔍 Using GPS coordinates: ${location.latitude}, ${location.longitude}`);
          const result = await PrayerTimesService.getPrayerTimesWithTimezone(
            location.latitude, 
            location.longitude,
            selectedDate,
            prayerSettings.calculationMethod,
            prayerSettings.madhab
          );
          times = result.times;
          timezoneFromAPI = result.timezone;
        } else {
          console.error(`❌ Invalid coordinates: ${location.latitude}, ${location.longitude}`);
          // Fallback to city-based lookup
          console.log(`🔍 Falling back to city lookup: ${location.city}, ${location.country}`);
          times = await PrayerTimesService.getPrayerTimesByCity(
            location.city, 
            location.country,
            selectedDate,
            prayerSettings.calculationMethod,
            prayerSettings.madhab
          );
          // Try to get timezone for city
          const timezoneInfo = await PrayerTimesService.getTimezoneInfo(location.latitude, location.longitude);
          if (timezoneInfo) {
            timezoneFromAPI = timezoneInfo.timezone;
          }
        }
      } else {
        console.log(`🔍 Using city lookup: ${location.city}, ${location.country}`);
        times = await PrayerTimesService.getPrayerTimesByCity(
          location.city, 
          location.country,
          selectedDate,
          prayerSettings.calculationMethod,
          prayerSettings.madhab
        );
      }
      
      console.log('✅ Prayer times fetched:', times);
      console.log(`🕐 Current device time: ${new Date().toLocaleString()}`);
      console.log(`📱 Times received from API:`, times);
      setPrayerTimes(times);
      
      // Update location timezone if we got it from API
      if (timezoneFromAPI) {
        setLocationTimezone(timezoneFromAPI);
      }
    } catch (err) {
      console.error('❌ Error fetching prayer times:', err);
      setError('Failed to load prayer times');
    } finally {
      setIsLoading(false);
    }
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = () => {
    const today = new Date();
    return selectedDate.toDateString() === today.toDateString();
  };

  const fetchHijriDate = async () => {
    try {
      const today = selectedDate;
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      
      const response = await fetch(`https://api.aladhan.com/v1/gToH?date=${day}-${month}-${year}`);
      const data = await response.json();
      
      if (data.code === 200 && data.data) {
        const hijri = data.data.hijri;
        setHijriDate(`${hijri.day} ${hijri.month.ar} ${hijri.year}`);
      }
    } catch (err) {
      console.error('Error fetching Hijri date:', err);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log('🔄 Refreshing prayer times...');
      
      // Force clear cached location and request fresh GPS data
      if (locationEnabled) {
        console.log('📍 Requesting fresh GPS location...');
        await requestLocation();
        // Wait for location to update in state before fetching
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      console.log('📍 Current location state:', { location, locationEnabled });
      
      // Now fetch prayer times with updated location
      await fetchPrayerTimes();
      console.log('✅ Refresh complete');
    } catch (err) {
      console.error('❌ Error refreshing:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getNextPrayer = (): PrayerTime | null => {
    // Only show "next prayer" if viewing today's date
    if (!isToday()) {
      return null;
    }
    
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

  const getTimeUntilNextPrayer = (): string | null => {
    const nextPrayer = getNextPrayer();
    if (!nextPrayer) return null;

    const now = new Date();
    const timeWithoutPeriod = nextPrayer.time.replace(' AM', '').replace(' PM', '');
    const [prayerHours, prayerMinutes] = timeWithoutPeriod.split(':').map(Number);
    
    let prayerTimeHours = prayerHours;
    if (nextPrayer.time.includes('AM') && prayerHours === 12) {
      prayerTimeHours = 0;
    } else if (nextPrayer.time.includes('PM') && prayerHours !== 12) {
      prayerTimeHours = prayerHours + 12;
    }
    
    const prayerTime = new Date();
    prayerTime.setHours(prayerTimeHours, prayerMinutes, 0, 0);
    
    if (prayerTime <= now) {
      prayerTime.setDate(prayerTime.getDate() + 1);
    }

    const diffMs = prayerTime.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    } else {
      return `${diffMinutes}m`;
    }
  };

  const nextPrayer = getNextPrayer();
  const timeUntilNext = getTimeUntilNextPrayer();
  const { requestLocation } = useLocation();

  return (
    <View style={[styles.container, { backgroundColor: '#7d9b1c' }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 2 }]}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={IS_IPAD ? 40 : 32} color="#2C3E50" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={isRefreshing}
          >
            <IconSymbol 
              name="arrow.clockwise" 
              size={IS_IPAD ? 34 : 28} 
              color="#2C3E50" 
            />
          </TouchableOpacity>
        </View>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Prayer Times</Text>
          <Text style={styles.headerSubtitle}>أوقات الصلاة</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date Navigation */}
        <View style={styles.dateNavigation}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={goToPreviousDay}
          >
            <IconSymbol name="chevron.left" size={IS_IPAD ? 48 : 36} color="#061536" />
          </TouchableOpacity>
          
          <View style={styles.dateDisplay}>
            <Text style={styles.dateText}>
              {selectedDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
            {!isToday() && (
              <TouchableOpacity 
                style={styles.todayButton}
                onPress={goToToday}
              >
                <Text style={styles.todayButtonText}>Today</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={goToNextDay}
          >
            <IconSymbol name="chevron.right" size={IS_IPAD ? 48 : 36} color="#061536" />
          </TouchableOpacity>
        </View>

        {/* Location and Date Info */}
        <View style={[styles.infoCard, { backgroundColor: '#2c2a8d', borderColor: colors.border }]}>
          <View style={styles.infoRow}>
            <IconSymbol name="location.fill" size={IS_IPAD ? 26 : 20} color="#FFFFFF" />
            <Text style={[styles.infoText, { color: '#FFFFFF' }]}>
              {location ? (
                location.city && location.city !== 'Unknown City'
                  ? `${location.city}, ${location.country}`
                  : location.locality
                  ? `${location.locality}, ${location.country}`
                  : location.country
              ) : 'New York, USA'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <IconSymbol name="calendar" size={IS_IPAD ? 26 : 20} color="#FFFFFF" />
            <Text style={[styles.infoText, { color: '#FFFFFF' }]}>
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <IconSymbol name="clock.fill" size={IS_IPAD ? 26 : 20} color="#FFFFFF" />
            <Text style={[styles.infoText, { color: '#FFFFFF' }]}>
              {locationTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone} ({timezoneOffset})
            </Text>
          </View>
          {hijriDate && (
            <View style={styles.infoRow}>
              <IconSymbol name="moon.stars.fill" size={IS_IPAD ? 26 : 20} color="#FFFFFF" />
              <Text style={[styles.infoText, { color: '#FFFFFF', fontFamily: Fonts.primary }]}>
                {hijriDate}
              </Text>
            </View>
          )}
        </View>

      {/* Next Prayer Card */}
      {nextPrayer && (
        <View style={[styles.nextPrayerCard, { backgroundColor: '#021f5d', borderColor: colors.border }]}>
          <Text style={[styles.nextPrayerLabel, { color: '#FFFFFF' }]}>
            Next Prayer
          </Text>
          <View style={styles.nextPrayerInfo}>
            <View>
              <Text style={[styles.nextPrayerName, { color: '#FFFFFF' }]}>
                {nextPrayer.name}
              </Text>
              <Text style={[styles.nextPrayerArabic, { color: '#FFFFFF' }]}>
                {nextPrayer.arabic}
              </Text>
            </View>
            <View style={styles.nextPrayerTimeContainer}>
              <Text style={[styles.nextPrayerTime, { color: '#FFFFFF' }]}>
                {nextPrayer.time}
              </Text>
              {timeUntilNext && (
                <Text style={[styles.timeRemaining, { color: '#FFFFFF' }]}>
                  in {timeUntilNext}
                </Text>
              )}
            </View>
          </View>
        </View>
      )}

        {/* All Prayer Times */}
      {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.tint} />
            <Text style={[styles.loadingText, { color: colors.text }]}>Loading prayer times...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <IconSymbol name="exclamationmark.triangle" size={32} color={colors.tint} />
            <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
          </View>
        ) : (
          <View style={[styles.prayerTimesCard, { backgroundColor: '#4743e2', borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: '#FFFFFF' }]}>All Prayer Times</Text>
            {prayerTimes.map((prayer, index) => {
              const isNext = nextPrayer?.name === prayer.name;
              return (
                <View 
                  key={index} 
                  style={[
                    styles.prayerRow, 
                    { borderBottomColor: 'rgba(255, 255, 255, 0.2)' }
                  ]}
                >
                  <View style={styles.prayerNameContainer}>
                    <Text style={[styles.prayerName, { color: '#FFFFFF' }]}>
                      {prayer.name}
                    </Text>
                    <Text style={[styles.prayerArabic, { color: '#FFFFFF' }]}>
                      {prayer.arabic}
                    </Text>
                  </View>
                  <Text style={[styles.prayerTime, { color: '#FFFFFF' }]}>
                    {prayer.time}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export default function PrayerTimesScreen() {
  return (
    <LocationWrapper>
      <PrayerTimesContent />
    </LocationWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 6,
    paddingHorizontal: 15,
    backgroundColor: 'transparent',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: IS_IPAD ? 12 : 8,
  },
  refreshButton: {
    padding: IS_IPAD ? 12 : 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginTop: IS_IPAD ? 12 : 8,
  },
  backText: {
    fontSize: IS_IPAD ? 18 : 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 3,
  },
  headerTitleContainer: {
    alignItems: 'center',
    marginTop: 0,
  },
  headerTitle: {
    fontSize: IS_IPAD ? 48 : 32,
    fontFamily: Fonts.secondary,
    fontWeight: '900',
    color: '#0B1120',
    marginBottom: 2,
    letterSpacing: IS_IPAD ? 1.5 : 1,
  },
  headerSubtitle: {
    fontSize: IS_IPAD ? 20 : 15,
    color: '#1F2937',
    opacity: 0.85,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: IS_IPAD ? 24 : 16,
    maxWidth: IS_IPAD ? 900 : undefined,
    alignSelf: IS_IPAD ? 'center' : 'auto',
    width: IS_IPAD ? '90%' : undefined,
    backgroundColor: '#070d1b',
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: IS_IPAD ? 24 : 16,
    paddingHorizontal: 8,
  },
  navButton: {
    width: IS_IPAD ? 68 : 52,
    height: IS_IPAD ? 68 : 52,
    borderRadius: IS_IPAD ? 34 : 26,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  dateDisplay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  dateText: {
    fontSize: IS_IPAD ? 24 : 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  todayButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: IS_IPAD ? 20 : 16,
    paddingVertical: IS_IPAD ? 8 : 6,
    borderRadius: 12,
    marginTop: 4,
  },
  todayButtonText: {
    fontSize: IS_IPAD ? 16 : 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoCard: {
    borderRadius: IS_IPAD ? 16 : 12,
    borderWidth: 0,
    padding: IS_IPAD ? 24 : 16,
    marginBottom: IS_IPAD ? 24 : 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 30,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: IS_IPAD ? 12 : 8,
  },
  infoText: {
    fontSize: IS_IPAD ? 22 : IS_SMALL_PHONE ? 15 : 17,
    marginLeft: 8,
    flex: 1,
  },
  nextPrayerCard: {
    borderRadius: IS_IPAD ? 16 : 12,
    padding: IS_IPAD ? 28 : 20,
    marginBottom: IS_IPAD ? 24 : 20,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 30,
  },
  nextPrayerLabel: {
    fontSize: IS_IPAD ? 28 : 20,
    fontFamily: Fonts.secondary,
    fontWeight: '800',
    marginBottom: 16,
    opacity: 0.95,
  },
  nextPrayerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextPrayerName: {
    fontSize: IS_IPAD ? 44 : 32,
    fontFamily: Fonts.secondary,
    fontWeight: '900',
    marginBottom: 8,
  },
  nextPrayerArabic: {
    fontSize: IS_IPAD ? 36 : 24,
    fontFamily: Fonts.primary,
  },
  nextPrayerTimeContainer: {
    alignItems: 'flex-end',
  },
  nextPrayerTime: {
    fontSize: IS_IPAD ? 48 : 36,
    fontFamily: Fonts.secondary,
    fontWeight: '900',
  },
  timeRemaining: {
    fontSize: IS_IPAD ? 26 : 18,
    marginTop: 6,
    opacity: 0.95,
    fontFamily: Fonts.secondary,
    fontWeight: '700',
  },
  prayerTimesCard: {
    borderRadius: IS_IPAD ? 20 : 16,
    borderWidth: 0,
    padding: IS_IPAD ? 24 : 16,
    marginBottom: IS_IPAD ? 24 : 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 30,
  },
  cardTitle: {
    fontSize: IS_IPAD ? 42 : 26,
    fontFamily: Fonts.secondary,
    fontWeight: '900',
    marginBottom: IS_IPAD ? 24 : 20,
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: IS_IPAD ? 16 : 12,
    borderBottomWidth: 1,
  },
  prayerNameContainer: {
    flex: 1,
  },
  prayerName: {
    fontSize: IS_IPAD ? 36 : 24,
    fontFamily: Fonts.secondary,
    fontWeight: '800',
    marginBottom: 2,
  },
  prayerArabic: {
    fontSize: IS_IPAD ? 30 : 22,
    fontFamily: Fonts.primary,
    opacity: 0.9,
  },
  prayerTime: {
    fontSize: IS_IPAD ? 34 : 24,
    fontFamily: Fonts.secondary,
    fontWeight: '800',
  },
  settingsCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: IS_IPAD ? 60 : 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: IS_IPAD ? 18 : 14,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: IS_IPAD ? 60 : 40,
  },
  errorText: {
    marginTop: 12,
    fontSize: IS_IPAD ? 18 : 14,
    textAlign: 'center',
  },
});

