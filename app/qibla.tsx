import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Platform, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocation } from '@/contexts/LocationContext';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';

interface QiblaData {
  direction: number;
  distance: number;
}

export default function QiblaScreen() {
  const { theme } = useTheme();
  const colors = Colors[((theme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { location: contextLocation, locationEnabled } = useLocation();
  
  const [qiblaData, setQiblaData] = useState<QiblaData | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationInfo, setLocationInfo] = useState<string>('');
  const [isMagnetometerAvailable, setIsMagnetometerAvailable] = useState(true);
  const [isAligned, setIsAligned] = useState(false);
  
  const compassRotation = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const magnetometerSubscription = useRef<any>(null);
  const previousAlignmentRef = useRef<boolean>(false);

  useEffect(() => {
    initializeQibla();
    
    // Pulse animation for Kaaba icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      if (magnetometerSubscription.current) {
        magnetometerSubscription.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (contextLocation) {
      calculateQiblaDirection(contextLocation.latitude, contextLocation.longitude);
      setLocationInfo(`${contextLocation.city}, ${contextLocation.country}`);
    }
  }, [contextLocation]);

  const initializeQibla = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission is required to show Qibla direction');
        setIsLoading(false);
        return;
      }

      // Get current location if not available from context
      if (!contextLocation) {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        const { latitude, longitude } = currentLocation.coords;
        
        // Get city name
        const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocode.length > 0) {
          const place = geocode[0];
          setLocationInfo(`${place.city || place.region || 'Unknown'}, ${place.country || ''}`);
        }
        
        calculateQiblaDirection(latitude, longitude);
      }

      // Start magnetometer
      const isAvailable = await Magnetometer.isAvailableAsync();
      setIsMagnetometerAvailable(isAvailable);
      
      if (isAvailable) {
        Magnetometer.setUpdateInterval(100);
        magnetometerSubscription.current = Magnetometer.addListener((data) => {
          const { x, y, z } = data;
          
          // Calculate heading from magnetometer data
          // Different devices may have different coordinate systems
          // Try: atan2(y, x) for standard device orientation
          let angle = Math.atan2(y, x) * (180 / Math.PI);
          
          // Subtract 90 degrees to correct for device coordinate system
          // (compensates for axis alignment difference)
          angle = angle - 90;
          
          // Normalize to 0-360 degrees (0 = North, 90 = East, 180 = South, 270 = West)
          angle = (angle + 360) % 360;
          
          setHeading(angle);
          
          // Smooth rotation animation
          // Rotate compass opposite to heading so North marker points to actual north
          Animated.spring(compassRotation, {
            toValue: -angle,
            useNativeDriver: true,
            tension: 10,
            friction: 8,
          }).start();
        });
      } else {
        Alert.alert(
          'Compass Unavailable',
          'Your device does not support compass functionality. The direction will be shown without rotation.',
          [{ text: 'OK' }]
        );
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing Qibla:', err);
      setError('Failed to initialize Qibla direction');
      setIsLoading(false);
    }
  };

  const calculateQiblaDirection = (lat: number, lon: number) => {
    // Kaaba coordinates (Mecca, Saudi Arabia)
    const kaabaLat = 21.4225;
    const kaabaLon = 39.8262;
    
    // Convert to radians
    const lat1 = lat * Math.PI / 180;
    const lat2 = kaabaLat * Math.PI / 180;
    const dLon = (kaabaLon - lon) * Math.PI / 180;
    
    // Calculate bearing using the forward azimuth formula
    // This gives us the initial bearing (forward azimuth) which is what we need for Qibla
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - 
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    
    let qiblaDirection = Math.atan2(y, x) * 180 / Math.PI;
    
    // Normalize to 0-360 degrees
    qiblaDirection = (qiblaDirection + 360) % 360;
    
    // Calculate distance to Kaaba using Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = lat2 - lat1;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    setQiblaData({
      direction: qiblaDirection,
      distance: distance,
    });
  };

  const getDirectionText = (degree: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degree / 45) % 8;
    return directions[index];
  };

  const getQiblaAlignment = (): string => {
    if (!qiblaData) return '';
    
    const diff = Math.abs(heading - qiblaData.direction);
    const normalizedDiff = diff > 180 ? 360 - diff : diff;
    
    const aligned = normalizedDiff < 5;
    
    // Trigger haptic feedback when alignment changes
    if (aligned && !previousAlignmentRef.current) {
      // Just became aligned - trigger success haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsAligned(true);
    } else if (!aligned && previousAlignmentRef.current) {
      // Just lost alignment
      setIsAligned(false);
    }
    
    previousAlignmentRef.current = aligned;
    
    if (normalizedDiff < 5) {
      return 'Aligned with Qibla ✓';
    } else if (normalizedDiff < 15) {
      return 'Almost aligned';
    } else if (normalizedDiff < 45) {
      return 'Turn slightly';
    } else {
      return 'Keep turning';
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={['#EBF4F5', '#B5C6E0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.header, { paddingTop: insets.top + 10 }]}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={28} color="#2C3E50" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Qibla Direction</Text>
            <Text style={styles.headerSubtitle}>اتجاه القبلة</Text>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Finding Qibla direction...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={['#EBF4F5', '#B5C6E0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.header, { paddingTop: insets.top + 10 }]}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={28} color="#2C3E50" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Qibla Direction</Text>
            <Text style={styles.headerSubtitle}>اتجاه القبلة</Text>
          </View>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color={colors.tint} />
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.tint }]}
            onPress={initializeQibla}
          >
            <Text style={[styles.retryButtonText, { color: colors.background }]}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#EBF4F5', '#B5C6E0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={28} color="#2C3E50" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Qibla Direction</Text>
          <Text style={styles.headerSubtitle}>اتجاه القبلة</Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Location Info */}
        <View style={[styles.infoCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={styles.infoRow}>
            <IconSymbol name="location.fill" size={20} color={colors.tint} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {locationInfo || 'Fetching location...'}
            </Text>
          </View>
          {qiblaData && (
            <>
              <View style={styles.infoRow}>
                <IconSymbol name="arrow.up.circle.fill" size={20} color={colors.tint} />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  Qibla: {Math.round(qiblaData.direction)}° ({getDirectionText(qiblaData.direction)})
                </Text>
              </View>
              <View style={styles.infoRow}>
                <IconSymbol name="map.fill" size={20} color={colors.tint} />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  Distance: {Math.round(qiblaData.distance)} km to Makkah
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Compass */}
        <View style={styles.compassContainer}>
          <Animated.View
            style={[
              styles.compassWrapper,
              {
                transform: [{ rotate: compassRotation.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg'],
                }) }],
              },
            ]}
          >
            <View style={[styles.compass, { borderColor: colors.border }]}>
              {/* Degree numbers for all positions */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((degree) => {
                const radian = (degree - 90) * (Math.PI / 180);
                const numberRadius = 170; // Distance from center to number (moved outside)
                const numberX = Math.cos(radian) * numberRadius;
                const numberY = Math.sin(radian) * numberRadius;
                
                return (
                  <Animated.View
                    key={degree}
                    style={[
                      styles.degreeNumberContainer,
                      {
                        left: 190 + numberX,
                        top: 190 + numberY,
                        transform: [
                          { 
                            rotate: compassRotation.interpolate({
                              inputRange: [0, 360],
                              outputRange: ['0deg', '-360deg'],
                            }) 
                          }
                        ],
                      },
                    ]}
                  >
                    <Text style={[styles.degreeNumber, { color: colors.text }]}>
                      {degree}°
                    </Text>
                  </Animated.View>
                );
              })}
              
              {/* North indicator */}
              <Animated.View 
                style={[
                  styles.northIndicator, 
                  { 
                    backgroundColor: colors.tint,
                    transform: [
                      { 
                        rotate: compassRotation.interpolate({
                          inputRange: [0, 360],
                          outputRange: ['0deg', '-360deg'],
                        }) 
                      }
                    ],
                  }
                ]}
              >
                <Text style={[styles.northText, { color: colors.background }]}>N</Text>
              </Animated.View>
              
              {/* Direction markers */}
              <Animated.Text 
                style={[
                  styles.directionMarker, 
                  styles.eastMarker, 
                  { 
                    color: colors.text,
                    transform: [
                      { 
                        rotate: compassRotation.interpolate({
                          inputRange: [0, 360],
                          outputRange: ['0deg', '-360deg'],
                        }) 
                      }
                    ],
                  }
                ]}
              >
                E
              </Animated.Text>
              <Animated.Text 
                style={[
                  styles.directionMarker, 
                  styles.southMarker, 
                  { 
                    color: colors.text,
                    transform: [
                      { 
                        rotate: compassRotation.interpolate({
                          inputRange: [0, 360],
                          outputRange: ['0deg', '-360deg'],
                        }) 
                      }
                    ],
                  }
                ]}
              >
                S
              </Animated.Text>
              <Animated.Text 
                style={[
                  styles.directionMarker, 
                  styles.westMarker, 
                  { 
                    color: colors.text,
                    transform: [
                      { 
                        rotate: compassRotation.interpolate({
                          inputRange: [0, 360],
                          outputRange: ['0deg', '-360deg'],
                        }) 
                      }
                    ],
                  }
                ]}
              >
                W
              </Animated.Text>
              
              {/* Compass circle decorations */}
              <View style={[styles.compassCircle, { borderColor: colors.border }]} />
              <View style={[styles.compassCircleInner, { borderColor: colors.border }]} />
            </View>
          </Animated.View>

          {/* Device heading needle (red, shows where you're facing) */}
          <View style={styles.needleContainer}>
            <View style={styles.needleWrapper}>
              {/* North end (red, pointed) */}
              <View style={styles.needleNorth} />
              {/* South end (white/gray, pointed) */}
              <View style={[styles.needleSouth, { borderBottomColor: colors.border }]} />
            </View>
          </View>

          {/* Qibla indicator (Kaaba image points to Mecca) */}
          {qiblaData && (
            <View
              style={[
                styles.qiblaArrowContainer,
                {
                  transform: [
                    { 
                      rotate: `${qiblaData.direction - heading}deg`
                    }
                  ],
                },
              ]}
            >
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <View style={styles.qiblaImageWrapper}>
                  <Image 
                    source={require('@/assets/images/Mecca.png')} 
                    style={styles.qiblaImage}
                    resizeMode="contain"
                  />
                </View>
              </Animated.View>
            </View>
          )}

          {/* Center dot */}
          <View style={[styles.centerDot, { backgroundColor: colors.tint }]} />
        </View>

        {/* Alignment Status */}
        {isMagnetometerAvailable && qiblaData && (
          <View style={[styles.statusCard, { backgroundColor: '#000000' }]}>
            <Text style={[styles.statusText, { color: '#FFFFFF' }]}>
              {getQiblaAlignment()}
            </Text>
            <Text style={[styles.headingText, { color: '#FFFFFF' }]}>
              Current heading: {Math.round(heading)}°
            </Text>
          </View>
        )}

        {/* Instructions */}
        <View style={[styles.instructionsCard, { backgroundColor: colors.background, borderColor: colors.border, marginBottom: insets.bottom + 20 }]}>
          <Text style={[styles.instructionsTitle, { color: colors.text }]}>
            Instructions:
          </Text>
          <Text style={[styles.instructionsText, { color: colors.text }]}>
            • Hold your device flat and parallel to the ground
          </Text>
          <Text style={[styles.instructionsText, { color: colors.text }]}>
            • Rotate yourself until the Kaaba image points upward
          </Text>
          <Text style={[styles.instructionsText, { color: colors.text }]}>
            • Face the direction shown for Qibla
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 8,
    paddingHorizontal: 15,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 5,
  },
  headerTitleContainer: {
    alignItems: 'center',
    marginTop: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 0,
  },
    headerSubtitle: {
      fontSize: 20,
      color: '#000000',
      fontWeight: 'bold',
      opacity: 1,
      fontFamily: Fonts.primary,
    },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  infoCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
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
  compassContainer: {
    height: 420,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  compassWrapper: {
    width: 380,
    height: 380,
  },
  compass: {
    width: 380,
    height: 380,
    borderRadius: 190,
    borderWidth: 6,
    borderTopColor: '#404040',
    borderLeftColor: '#404040',
    borderRightColor: '#1a1a1a',
    borderBottomColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 25,
  },
  northIndicator: {
    position: 'absolute',
    top: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  northText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  directionMarker: {
    position: 'absolute',
    fontSize: 32,
    fontWeight: 'bold',
  },
  eastMarker: {
    right: 30,
  },
  southMarker: {
    bottom: 30,
  },
  westMarker: {
    left: 30,
  },
  compassCircle: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    opacity: 0.3,
  },
  compassCircleInner: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    opacity: 0.2,
  },
  needleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  needleWrapper: {
    width: 6,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  needleNorth: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 70,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FF4444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5,
  },
  needleSouth: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 70,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#CCCCCC',
    opacity: 0.7,
  },
  qiblaArrowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
  },
  qiblaImageWrapper: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  qiblaImage: {
    width: 35,
    height: 35,
  },
  centerDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusCard: {
    borderRadius: 8,
    padding: 8,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  statusText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headingText: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.9,
  },
  instructionsCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    marginBottom: 6,
    opacity: 0.8,
  },
  degreeMarker: {
    position: 'absolute',
  },
  majorDegreeMarker: {
    width: 4,
    height: 16,
    borderRadius: 2,
  },
  minorDegreeMarker: {
    width: 2,
    height: 10,
    borderRadius: 1,
    opacity: 0.6,
  },
  degreeNumberContainer: {
    position: 'absolute',
    width: 40,
    height: 20,
    marginLeft: -20,
    marginTop: -10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  degreeNumber: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

