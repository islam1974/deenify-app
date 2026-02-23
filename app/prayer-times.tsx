import LocationWrapper from '@/components/LocationWrapper';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts } from '@/constants/theme';
import { useLocation } from '@/contexts/LocationContext';
import { usePrayerNotifications } from '@/contexts/PrayerNotificationContext';
import { usePrayerSettings } from '@/contexts/PrayerSettingsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PrayerTimesService } from '@/services/PrayerTimesService';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_IPAD = false; // Set true when deploying on iPad
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
  const { settings: prayerSettings, updateSettings: updatePrayerSettings, getCalculationMethodInfo } = usePrayerSettings();
  const { scheduleNotifications, settings: notificationSettings } = usePrayerNotifications();
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
  const [disclaimerVisible, setDisclaimerVisible] = useState(false);

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

  // Reschedule notifications when azan settings change (if notifications are enabled)
  useEffect(() => {
    if (notificationSettings.enabled) {
      scheduleNotifications();
    }
  }, [prayerSettings.azanSettings]);

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

  const getTimeUntilNextPrayer = (): string | null => {
    const nextPrayer = getNextPrayer();
    if (!nextPrayer) return null;

    const timeWithoutPeriod = nextPrayer.time.replace(' AM', '').replace(' PM', '');
    const [prayerHours, prayerMinutes] = timeWithoutPeriod.split(':').map(Number);
    let prayerTimeMinutes = prayerHours * 60 + prayerMinutes;
    if (nextPrayer.time.includes('AM') && prayerHours === 12) {
      prayerTimeMinutes = prayerMinutes;
    } else if (nextPrayer.time.includes('PM') && prayerHours !== 12) {
      prayerTimeMinutes = (prayerHours + 12) * 60 + prayerMinutes;
    }

    const tz = location?.timezone || locationTimezone;
    const nowMinutes = tz
      ? PrayerTimesService.getNowInTimezone(tz).timeMinutes
      : (() => {
          const now = new Date();
          const s = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
          const [h, m] = s.split(':').map(Number);
          return h * 60 + m;
        })();

    let diffMinutes = prayerTimeMinutes - nowMinutes;
    if (diffMinutes <= 0) diffMinutes += 24 * 60;
    const diffHours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    if (diffHours > 0) {
      return `${diffHours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const nextPrayer = getNextPrayer();
  const timeUntilNext = getTimeUntilNextPrayer();
  const { requestLocation } = useLocation();

  return (
    <View style={[styles.container, { backgroundColor: '#070d1b' }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 2 }]}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={IS_IPAD ? 40 : 32} color="#FFFFFF" />
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
              color="#FFFFFF" 
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

        {/* Simple Location and Calculation Method Info */}
        <View style={[styles.simpleInfoCard, { backgroundColor: '#252560', borderColor: colors.border }]}>
          <View style={styles.simpleInfoRow}>
            <IconSymbol name="location.fill" size={IS_IPAD ? 18 : 15} color="rgba(255,255,255,0.92)" />
            <Text style={[styles.simpleInfoText, { color: 'rgba(255,255,255,0.92)' }]}>
              {location ? (
                location.city && location.city !== 'Unknown City'
                  ? `${location.city}, ${location.country}`
                  : location.locality
                  ? `${location.locality}, ${location.country}`
                  : location.country
              ) : 'New York, USA'}
            </Text>
          </View>
          <View style={styles.simpleInfoRow}>
            <IconSymbol name="clock.fill" size={IS_IPAD ? 18 : 15} color="rgba(255,255,255,0.92)" />
            <Text style={[styles.simpleInfoText, { color: 'rgba(255,255,255,0.92)' }]}>
              {getCalculationMethodInfo(prayerSettings.calculationMethod).name}
            </Text>
          </View>
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

        {/* Disclaimer trigger - just below next prayer card */}
        <TouchableOpacity
          style={styles.disclaimerTrigger}
          onPress={() => setDisclaimerVisible(true)}
          activeOpacity={0.7}
        >
          <IconSymbol name="info.circle.fill" size={IS_IPAD ? 20 : 16} color="rgba(255,255,255,0.7)" />
          <Text style={styles.disclaimerTriggerText}>Note about prayer times</Text>
        </TouchableOpacity>

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
          <LinearGradient
            colors={['#5a6068', '#454b52']}
            style={[styles.prayerTimesCard, { borderColor: colors.border }]}
          >
            <Text style={[styles.cardTitle, { color: '#FFFFFF' }]}>All Prayer Times</Text>
            {prayerTimes.map((prayer, index) => {
              const isNext = nextPrayer?.name === prayer.name;
              const prayerKey = prayer.name as keyof typeof prayerSettings.azanSettings;
              const isAzanEnabled = prayerSettings.azanSettings[prayerKey] ?? true;
              
              return (
                <View 
                  key={index} 
                  style={[
                    styles.prayerRow, 
                    { borderBottomColor: 'rgba(255, 255, 255, 0.2)' },
                    isNext && styles.prayerRowNext,
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
                  <View style={styles.prayerTimeContainer}>
                    <Text style={[styles.prayerTime, { color: '#FFFFFF' }]}>
                      {prayer.time}
                    </Text>
                    <View style={styles.azanToggleContainer}>
                      <Text style={[styles.azanLabel, { color: '#FFFFFF' }]}>Reminder</Text>
                      <View style={styles.switchWrapper}>
                        <Switch
                          value={isAzanEnabled}
                          onValueChange={async (value) => {
                            await updatePrayerSettings({
                              azanSettings: {
                                ...prayerSettings.azanSettings,
                                [prayerKey]: value,
                              },
                            });
                          }}
                          trackColor={{ false: 'rgba(255, 255, 255, 0.3)', true: '#4CAF50' }}
                          thumbColor={isAzanEnabled ? '#FFFFFF' : '#f4f3f4'}
                          ios_backgroundColor="rgba(255, 255, 255, 0.3)"
                        />
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </LinearGradient>
        )}

      </ScrollView>

      {/* Disclaimer modal */}
      <Modal
        visible={disclaimerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDisclaimerVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setDisclaimerVisible(false)}>
          <Pressable style={styles.disclaimerModalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.disclaimerModalHeader}>
              <IconSymbol name="info.circle.fill" size={IS_IPAD ? 28 : 24} color="#4CAF50" />
              <Text style={styles.disclaimerModalTitle}>Note about prayer times</Text>
            </View>
            <Text style={styles.disclaimerModalText}>
              Your area might use some other calculation method and prayer times can differ. Please always verify with your area's prayer times and keep us informed of any discrepancies.
            </Text>
            <TouchableOpacity
              style={[styles.disclaimerModalButton, { backgroundColor: '#4CAF50' }]}
              onPress={() => setDisclaimerVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.disclaimerModalButtonText}>Got it</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
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
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginTop: IS_IPAD ? 12 : 8,
  },
  backText: {
    fontSize: IS_IPAD ? 18 : 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 3,
  },
  headerTitleContainer: {
    alignItems: 'center',
    marginTop: 0,
  },
  headerTitle: {
    fontSize: IS_IPAD ? 56 : 40,
    fontFamily: Fonts.secondary,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 2,
    letterSpacing: IS_IPAD ? 1.5 : 1,
  },
  headerSubtitle: {
    fontSize: IS_IPAD ? 24 : 18,
    color: '#FFFFFF',
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
    borderRadius: 16,
    marginTop: 4,
  },
  todayButtonText: {
    fontSize: IS_IPAD ? 16 : 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  simpleInfoCard: {
    borderRadius: IS_IPAD ? 22 : 18,
    borderWidth: 0,
    padding: IS_IPAD ? 10 : 8,
    marginBottom: IS_IPAD ? 16 : 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  simpleInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: IS_IPAD ? 4 : 3,
  },
  simpleInfoText: {
    fontSize: IS_IPAD ? 14 : IS_SMALL_PHONE ? 11 : 12,
    marginLeft: 6,
    flex: 1,
    fontWeight: '500',
  },
  infoCard: {
    borderRadius: IS_IPAD ? 24 : 20,
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
    borderRadius: IS_IPAD ? 24 : 20,
    padding: IS_IPAD ? 24 : 22,
    minHeight: IS_IPAD ? 140 : 120,
    marginBottom: IS_IPAD ? 16 : 14,
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
    fontSize: IS_IPAD ? 22 : 16,
    fontFamily: Fonts.secondary,
    fontWeight: '800',
    marginBottom: 10,
    opacity: 0.95,
  },
  nextPrayerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextPrayerName: {
    fontSize: IS_IPAD ? 34 : 26,
    fontFamily: Fonts.secondary,
    fontWeight: '900',
    marginBottom: 5,
  },
  nextPrayerArabic: {
    fontSize: IS_IPAD ? 30 : 20,
    fontFamily: Fonts.primary,
  },
  nextPrayerTimeContainer: {
    alignItems: 'flex-end',
  },
  nextPrayerTime: {
    fontSize: IS_IPAD ? 44 : 34,
    fontFamily: Fonts.secondary,
    fontWeight: '900',
  },
  timeRemaining: {
    fontSize: IS_IPAD ? 17 : 13,
    marginTop: 3,
    opacity: 0.82,
    fontFamily: Fonts.secondary,
    fontWeight: '600',
  },
  prayerTimesCard: {
    borderRadius: IS_IPAD ? 28 : 24,
    overflow: 'hidden',
    borderWidth: 0,
    padding: IS_IPAD ? 18 : 12,
    marginBottom: IS_IPAD ? 16 : 14,
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
    fontSize: IS_IPAD ? 32 : 20,
    fontFamily: Fonts.secondary,
    fontWeight: '900',
    marginBottom: IS_IPAD ? 16 : 14,
    color: '#FFFFFF',
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: IS_IPAD ? 13 : 11,
    borderBottomWidth: 1,
  },
  prayerRowNext: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    paddingLeft: 10,
  },
  prayerNameContainer: {
    flex: 1,
  },
  prayerName: {
    fontSize: IS_IPAD ? 30 : 20,
    fontFamily: Fonts.secondary,
    fontWeight: '800',
    marginBottom: 2,
    color: '#FFFFFF',
  },
  prayerArabic: {
    fontSize: IS_IPAD ? 26 : 18,
    fontFamily: Fonts.primary,
    opacity: 0.9,
    color: '#FFFFFF',
  },
  prayerTimeContainer: {
    alignItems: 'flex-end',
  },
  prayerTime: {
    fontSize: IS_IPAD ? 28 : 20,
    fontFamily: Fonts.secondary,
    fontWeight: '800',
    marginBottom: IS_IPAD ? 5 : 4,
    color: '#FFFFFF',
  },
  azanToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: IS_IPAD ? 10 : 8,
  },
  azanLabel: {
    fontSize: IS_IPAD ? 18 : 14,
    fontWeight: '600',
    opacity: 0.9,
    color: '#FFFFFF',
  },
  switchWrapper: {
    transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }],
  },
  settingsCard: {
    borderRadius: 20,
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
  disclaimerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    marginHorizontal: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  disclaimerTriggerText: {
    fontSize: IS_IPAD ? 15 : 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  disclaimerModalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1a1d24',
    borderRadius: 24,
    padding: IS_IPAD ? 28 : 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  disclaimerModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  disclaimerModalTitle: {
    fontSize: IS_IPAD ? 22 : 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  disclaimerModalText: {
    fontSize: IS_IPAD ? 16 : 14,
    lineHeight: IS_IPAD ? 24 : 22,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 24,
  },
  disclaimerModalButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  disclaimerModalButtonText: {
    color: '#FFFFFF',
    fontSize: IS_IPAD ? 17 : 15,
    fontWeight: '600',
  },
});

