import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocation } from '@/contexts/LocationContext';
import { usePrayerSettings } from '@/contexts/PrayerSettingsContext';
import { PrayerTimesService, type PrayerTime as PrayerTimeType, type TimezoneInfo } from '@/services/PrayerTimesService';
import LocationWrapper from '@/components/LocationWrapper';

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

  // Check DST status
  const checkDST = () => {
    const now = new Date();
    const january = new Date(now.getFullYear(), 0, 1);
    const july = new Date(now.getFullYear(), 6, 1);
    const stdTimezoneOffset = Math.max(january.getTimezoneOffset(), july.getTimezoneOffset());
    const isDSTActive = now.getTimezoneOffset() < stdTimezoneOffset;
    setIsDST(isDSTActive);

    // Get timezone offset
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
    checkDST();
  }, [location, locationEnabled, prayerSettings]);

  const fetchPrayerTimes = async () => {
    if (!location && !locationEnabled) {
      try {
        const defaultPrayerTimes = await PrayerTimesService.getPrayerTimesByCity('New York', 'USA');
        setPrayerTimes(defaultPrayerTimes);
      } catch (err) {
        console.error('Error loading default prayer times:', err);
        setError('Failed to load prayer times');
      }
      return;
    }

    if (!location) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let times: PrayerTime[];
      
      if (location.latitude !== 0 && location.longitude !== 0) {
        times = await PrayerTimesService.getPrayerTimes(
          location.latitude, 
          location.longitude,
          undefined,
          prayerSettings.calculationMethod,
          prayerSettings.madhab
        );
      } else {
        times = await PrayerTimesService.getPrayerTimesByCity(
          location.city, 
          location.country,
          undefined,
          prayerSettings.calculationMethod,
          prayerSettings.madhab
        );
      }
      
      setPrayerTimes(times);
    } catch (err) {
      setError('Failed to load prayer times');
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
      // Request fresh location
      await requestLocation();
      // Wait a moment for location to update, then fetch prayer times
      setTimeout(() => {
        fetchPrayerTimes();
        setIsRefreshing(false);
      }, 1000);
    } catch (err) {
      console.error('Error refreshing:', err);
      setIsRefreshing(false);
    }
  };

  const getNextPrayer = (): PrayerTime | null => {
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#EBF4F5', '#B5C6E0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + 2 }]}
      >
        <View style={styles.headerTopRow}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={22} color="#2C3E50" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={isRefreshing}
          >
            <IconSymbol 
              name="arrow.clockwise" 
              size={20} 
              color="#2C3E50" 
            />
          </TouchableOpacity>
        </View>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Prayer Times</Text>
          <Text style={styles.headerSubtitle}>أوقات الصلاة</Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Location and Date Info */}
        <View style={[styles.infoCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={styles.infoRow}>
            <IconSymbol name="location.fill" size={20} color={colors.tint} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {location ? (
                location.locality 
                  ? `${location.locality}, ${location.country}`
                  : `${location.city}, ${location.country}`
              ) : 'New York, USA'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <IconSymbol name="calendar" size={20} color={colors.tint} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <IconSymbol name={isDST ? "sun.max.fill" : "moon.fill"} size={20} color={isDST ? "#FF9500" : colors.tint} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {timezoneOffset} {isDST ? '(BST/DST Active)' : '(Standard Time)'}
            </Text>
          </View>
          {hijriDate && (
            <View style={styles.infoRow}>
              <IconSymbol name="moon.stars.fill" size={20} color={colors.tint} />
              <Text style={[styles.infoText, { color: colors.text, fontFamily: Fonts.primary }]}>
                {hijriDate}
              </Text>
            </View>
          )}
        </View>

      {/* Next Prayer Card */}
      {nextPrayer && (
        <View style={[styles.nextPrayerCard, { backgroundColor: '#FFFFFF', borderColor: colors.border }]}>
          <Text style={[styles.nextPrayerLabel, { color: '#000000' }]}>
            Next Prayer
          </Text>
          <View style={styles.nextPrayerInfo}>
            <View>
              <Text style={[styles.nextPrayerName, { color: '#000000' }]}>
                {nextPrayer.name}
              </Text>
              <Text style={[styles.nextPrayerArabic, { color: '#000000' }]}>
                {nextPrayer.arabic}
              </Text>
            </View>
            <View style={styles.nextPrayerTimeContainer}>
              <Text style={[styles.nextPrayerTime, { color: '#000000' }]}>
                {nextPrayer.time}
              </Text>
              {timeUntilNext && (
                <Text style={[styles.timeRemaining, { color: '#000000' }]}>
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
          <View style={[styles.prayerTimesCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>All Prayer Times</Text>
            {prayerTimes.map((prayer, index) => {
              const isNext = nextPrayer?.name === prayer.name;
              return (
                <View 
                  key={index} 
                  style={[
                    styles.prayerRow, 
                    { borderBottomColor: colors.border },
                    isNext && { backgroundColor: colors.tint + '20' }
                  ]}
                >
                  <View style={styles.prayerNameContainer}>
                    <Text style={[styles.prayerName, { color: colors.text }]}>
                      {prayer.name}
                    </Text>
                    <Text style={[styles.prayerArabic, { color: colors.text }]}>
                      {prayer.arabic}
                    </Text>
                  </View>
                  <Text style={[styles.prayerTime, { color: colors.text }]}>
                    {prayer.time}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Settings Info */}
        <View style={[styles.settingsCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.settingsTitle, { color: colors.text }]}>Calculation Settings</Text>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Method:</Text>
            <Text style={[styles.settingValue, { color: colors.tint }]}>{prayerSettings.calculationMethod}</Text>
          </View>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Madhab:</Text>
            <Text style={[styles.settingValue, { color: colors.tint }]}>{prayerSettings.madhab}</Text>
          </View>
        </View>
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
  },
  refreshButton: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 3,
  },
  headerTitleContainer: {
    alignItems: 'center',
    marginTop: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 1,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#34495E',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  nextPrayerCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  nextPrayerLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    opacity: 0.9,
  },
  nextPrayerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextPrayerName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nextPrayerArabic: {
    fontSize: 20,
    fontFamily: Fonts.primary,
  },
  nextPrayerTimeContainer: {
    alignItems: 'flex-end',
  },
  nextPrayerTime: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  timeRemaining: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.9,
  },
  prayerTimesCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  prayerNameContainer: {
    flex: 1,
  },
  prayerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  prayerArabic: {
    fontSize: 14,
    fontFamily: Fonts.primary,
    opacity: 0.8,
  },
  prayerTime: {
    fontSize: 16,
    fontWeight: 'bold',
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
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
});

