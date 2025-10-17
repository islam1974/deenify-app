import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLocation } from '@/contexts/LocationContext';
import { usePrayerSettings } from '@/contexts/PrayerSettingsContext';
import { PrayerTimesService } from '@/services/PrayerTimesService';

interface PrayerTime {
  name: string;
  time: string;
  arabic: string;
  next: boolean;
}

export default function PrayerInfoWidget() {
  const colorScheme = useColorScheme();
  const colors = Colors[((colorScheme ?? 'light' as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const { location, locationEnabled } = useLocation();
  const { settings: prayerSettings } = usePrayerSettings();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    fetchPrayerTimes();
  }, [location, locationEnabled, prayerSettings]);

  const fetchPrayerTimes = async () => {
    console.log('Fetching prayer times...', { location, locationEnabled });
    
    if (!location && !locationEnabled) {
      // Use default location when location is disabled
      try {
        console.log('Using default location: New York, USA');
        const defaultPrayerTimes = await PrayerTimesService.getPrayerTimesByCity('New York', 'USA');
        setPrayerTimes(defaultPrayerTimes);
        console.log('Default prayer times loaded:', defaultPrayerTimes);
      } catch (err) {
        console.error('Error loading default prayer times:', err);
        setError('Failed to load prayer times');
      }
      return;
    }

    if (!location) {
      console.log('No location available, skipping prayer times fetch');
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

  const getCurrentPrayer = (): PrayerTime | null => {
    const now = new Date();
    const currentTimeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const [currentHours, currentMinutes] = currentTimeString.split(':').map(Number);
    const currentTimeMinutes = currentHours * 60 + currentMinutes;

    // Check if we're currently in a prayer time window
    for (let i = 0; i < prayerTimes.length; i++) {
      const currentPrayer = prayerTimes[i];
      const nextPrayer = prayerTimes[(i + 1) % prayerTimes.length];
      
      const currentPrayerTimeWithoutPeriod = currentPrayer.time.replace(' AM', '').replace(' PM', '');
      const nextPrayerTimeWithoutPeriod = nextPrayer.time.replace(' AM', '').replace(' PM', '');
      const [currentPrayerHours, currentPrayerMinutes] = currentPrayerTimeWithoutPeriod.split(':').map(Number);
      const [nextPrayerHours, nextPrayerMinutes] = nextPrayerTimeWithoutPeriod.split(':').map(Number);
      
      // Convert to 24-hour format
      let currentPrayerTimeMinutes = currentPrayerHours * 60 + currentPrayerMinutes;
      let nextPrayerTimeMinutes = nextPrayerHours * 60 + nextPrayerMinutes;
      
      // Handle AM/PM conversion
      if (currentPrayer.time.includes('AM') && currentPrayerHours === 12) {
        currentPrayerTimeMinutes = currentPrayerMinutes; // 12:XX AM = 00:XX
      } else if (currentPrayer.time.includes('PM') && currentPrayerHours !== 12) {
        currentPrayerTimeMinutes = (currentPrayerHours + 12) * 60 + currentPrayerMinutes;
      }
      
      if (nextPrayer.time.includes('AM') && nextPrayerHours === 12) {
        nextPrayerTimeMinutes = nextPrayerMinutes; // 12:XX AM = 00:XX
      } else if (nextPrayer.time.includes('PM') && nextPrayerHours !== 12) {
        nextPrayerTimeMinutes = (nextPrayerHours + 12) * 60 + nextPrayerMinutes;
      }
      
      // Handle case where next prayer is the next day (e.g., Isha to Fajr)
      if (nextPrayerTimeMinutes < currentPrayerTimeMinutes) {
        nextPrayerTimeMinutes += 24 * 60; // Add 24 hours
      }
      
      // Check if current time is between current prayer and next prayer
      if (currentTimeMinutes >= currentPrayerTimeMinutes && currentTimeMinutes < nextPrayerTimeMinutes) {
        return currentPrayer;
      }
    }

    return null;
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

    // Find the next prayer that hasn't passed yet
    for (let i = 0; i < prayerTimes.length; i++) {
      const prayer = prayerTimes[i];
      const timeWithoutPeriod = prayer.time.replace(' AM', '').replace(' PM', '');
      const [prayerHours, prayerMinutes] = timeWithoutPeriod.split(':').map(Number);
      
      // Convert to 24-hour format for comparison
      let prayerTimeMinutes = prayerHours * 60 + prayerMinutes;
      
      // Handle AM/PM conversion
      if (prayer.time.includes('AM') && prayerHours === 12) {
        prayerTimeMinutes = prayerMinutes; // 12:XX AM = 00:XX
      } else if (prayer.time.includes('PM') && prayerHours !== 12) {
        prayerTimeMinutes = (prayerHours + 12) * 60 + prayerMinutes; // Convert to 24-hour
      }
      
      if (prayerTimeMinutes > currentTimeMinutes) {
        return prayer;
      }
    }

    // If no prayer time is found for today, return the first prayer of the next day (Fajr)
    return prayerTimes[0];
  };

  const getTimeUntilNextPrayer = (): string | null => {
    const nextPrayer = getNextPrayer();
    if (!nextPrayer) return null;

    const now = new Date();
    const timeWithoutPeriod = nextPrayer.time.replace(' AM', '').replace(' PM', '');
    const [prayerHours, prayerMinutes] = timeWithoutPeriod.split(':').map(Number);
    
    // Convert to 24-hour format for calculation
    let prayerTimeHours = prayerHours;
    if (nextPrayer.time.includes('AM') && prayerHours === 12) {
      prayerTimeHours = 0; // 12:XX AM = 00:XX
    } else if (nextPrayer.time.includes('PM') && prayerHours !== 12) {
      prayerTimeHours = prayerHours + 12; // Convert to 24-hour
    }
    
    const prayerTime = new Date();
    prayerTime.setHours(prayerTimeHours, prayerMinutes, 0, 0);
    
    // If prayer time is tomorrow (past midnight)
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


  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: colors.tint }]}>
            <Image 
              source={require('@/assets/images/prayer-times-icon.png')} 
              style={styles.headerIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Prayer Times
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading...
          </Text>
        </View>
      </View>
    );
  }

  if (error || prayerTimes.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: colors.tint }]}>
            <Image 
              source={require('@/assets/images/prayer-times-icon.png')} 
              style={styles.headerIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Prayer Times
          </Text>
        </View>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={24} color={colors.tint} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            Unable to load prayer times
          </Text>
        </View>
      </View>
    );
  }

  const currentPrayer = getCurrentPrayer();
  const nextPrayer = getNextPrayer();
  const timeUntilNext = getTimeUntilNextPrayer();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={styles.cardBackground}>
        <Image 
          source={require('@/assets/images/prayer-times-icon.png')} 
          style={styles.cardBackgroundImage}
          resizeMode="cover"
        />
        <View style={styles.cardContent}>
          <Text style={[styles.title, { color: colors.text }]}>
            Prayer Times
          </Text>
          <Text style={[styles.location, { color: colors.text }]}>
            {location ? (location.locality || location.city) : 'New York'}
          </Text>
        </View>
      </View>


      {currentPrayer && (
        <View style={[styles.currentPrayerContainer, { backgroundColor: colors.tint }]}>
          <View style={styles.prayerInfo}>
            <Text style={[styles.prayerName, { color: colors.background }]}>
              {currentPrayer.name}
            </Text>
            <Text style={[styles.prayerArabic, { color: colors.background }]}>
              {currentPrayer.arabic}
            </Text>
          </View>
          <Text style={[styles.prayerTime, { color: colors.background }]}>
            {currentPrayer.time}
          </Text>
        </View>
      )}

      {nextPrayer && (
        <View style={[styles.nextPrayerContainer, { borderColor: colors.border, backgroundColor: '#3ea66b' }]}>
          <View style={styles.prayerInfo}>
            <Text style={[styles.nextPrayerLabel, { color: '#ffffff' }]}>
              Next Prayer
            </Text>
            <Text style={[styles.prayerName, { color: '#ffffff' }]}>
              {nextPrayer.name}
            </Text>
            <Text style={[styles.prayerArabic, { color: '#ffffff' }]}>
              {nextPrayer.arabic}
            </Text>
            {timeUntilNext && (
              <Text style={[styles.timeUntil, { color: '#ffffff' }]}>
                in {timeUntilNext}
              </Text>
            )}
          </View>
          <Text style={[styles.prayerTime, { color: '#ffffff' }]}>
            {nextPrayer.time}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardBackground: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  cardBackgroundImage: {
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  cardContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 250,
  },
  headerIcon: {
    width: 200,
    height: 200,
  },
  iconCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Roboto-Bold',
    textAlign: 'center',
    color: '#000',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  location: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    color: '#000',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginTop: 8,
  },
  currentPrayerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  nextPrayerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  prayerInfo: {
    flex: 1,
  },
  prayerName: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Roboto-Bold',
    marginBottom: 2,
  },
  prayerArabic: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Fonts.primary,
  },
  nextPrayerLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Roboto-Bold',
    marginBottom: 2,
  },
  timeUntil: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Roboto-Bold',
    marginTop: 2,
  },
  prayerTime: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Roboto-Bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    opacity: 0.7,
  },
});
