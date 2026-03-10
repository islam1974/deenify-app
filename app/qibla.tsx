import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Easing, ActivityIndicator, Alert, ScrollView, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocation } from '@/contexts/LocationContext';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_IPAD = Platform.OS === 'ios' && (Platform.isPad === true || SCREEN_WIDTH >= 768);
const IS_IPHONE_SE = !IS_IPAD && SCREEN_WIDTH <= 375;
const COMPASS_SIZE = IS_IPAD ? 620 : IS_IPHONE_SE ? 300 : 380;
const COMPASS_CENTER = COMPASS_SIZE / 2;
const NUMBER_RADIUS = COMPASS_SIZE * (170 / 380);

interface QiblaData {
  direction: number;
  distance: number;
}

export default function QiblaScreen() {
  const { theme } = useTheme();
  const colors = Colors[((theme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const isDarkMode = theme === 'dark';
  const screenBackground = isDarkMode ? '#070d1b' : '#F3F4F6';
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
  const smoothedHeading = useRef<number>(0);
  const lastHeadingUpdate = useRef<number>(0);

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
        Magnetometer.setUpdateInterval(200); // Increased interval to reduce jitter
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
          
          // Apply calibration offset to correct for device-specific magnetic declination
          // Adjust this value if your device/location shows incorrect heading
          // (e.g. -10 for UK, -3 was too small; increase magnitude to subtract more)
          const calibrationOffset = -10; // Corrects ~7° error (actual 61° vs displayed 68°)
          angle = (angle + calibrationOffset + 360) % 360;
          
          // Apply exponential smoothing (low-pass filter) to reduce jitter
          // Alpha value controls smoothing: lower = more smoothing, higher = more responsive
          const alpha = 0.3; // Smoothing factor (0.1-0.5 works well)
          const currentTime = Date.now();
          
          // Calculate shortest angular distance for proper circular smoothing
          let diff = angle - smoothedHeading.current;
          if (diff > 180) diff -= 360;
          if (diff < -180) diff += 360;
          
          smoothedHeading.current = (smoothedHeading.current + diff * alpha + 360) % 360;
          
          // Only update if enough time has passed or significant change
          const timeSinceLastUpdate = currentTime - lastHeadingUpdate.current;
          const angleChange = Math.abs(diff);
          
          if (timeSinceLastUpdate > 50 || angleChange > 2) {
            setHeading(smoothedHeading.current);
            lastHeadingUpdate.current = currentTime;
            
            // Smooth rotation animation with longer duration
            // Rotate compass opposite to heading so North marker points to actual north
            Animated.timing(compassRotation, {
              toValue: -smoothedHeading.current,
              duration: 300, // Longer duration for smoother animation
              useNativeDriver: true,
              easing: Easing.out(Easing.quad), // Smoother easing curve
            }).start();
          }
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

  /**
   * Calculate Qibla direction from any location worldwide
   * 
   * This uses the forward azimuth formula which works anywhere on Earth:
   * - Uses spherical trigonometry to find the shortest path to Mecca
   * - Works for all coordinates (North/South poles, equators, etc.)
   * - Handles date line crossings correctly
   * - Accounts for Earth's curvature (doesn't use flat map projection)
   * 
   * @param lat - User's latitude (degrees)
   * @param lon - User's longitude (degrees)
   */
  const calculateQiblaDirection = (lat: number, lon: number) => {
    // Kaaba coordinates (Mecca, Saudi Arabia) - fixed reference point
    const kaabaLat = 21.4225;
    const kaabaLon = 39.8262;
    
    // Convert to radians for trigonometric calculations
    const lat1 = lat * Math.PI / 180;
    const lat2 = kaabaLat * Math.PI / 180;
    const dLon = (kaabaLon - lon) * Math.PI / 180;
    
    // Forward azimuth formula - calculates initial bearing to Mecca
    // This works for ANY two points on a sphere (Earth)
    // y = sin(difference in longitude) * cos(destination latitude)
    // x = cos(starting latitude) * sin(destination latitude) - 
    //     sin(starting latitude) * cos(destination latitude) * cos(difference in longitude)
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - 
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    
    // Convert bearing to degrees (0-360, where 0 = North)
    let qiblaDirection = Math.atan2(y, x) * 180 / Math.PI;
    
    // Normalize to 0-360 degrees (ensures positive values)
    qiblaDirection = (qiblaDirection + 360) % 360;
    
    // Calculate distance to Kaaba using Haversine formula
    // Also works worldwide - calculates great circle distance on a sphere
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
    
    // Trigger haptic only when screen is focused (avoids haptic when navigating away)
    if (aligned && !previousAlignmentRef.current) {
      if (isFocused) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
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
      <View style={[styles.container, { backgroundColor: screenBackground }]}>
        <View
          style={[styles.header, { backgroundColor: screenBackground, paddingTop: insets.top + 10 }]}
        >
          <TouchableOpacity 
            style={[styles.backButton, IS_IPAD && styles.backButtonIpad]}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left.circle.fill" size={IS_IPAD ? 60 : 48} color={isDarkMode ? '#FFFFFF' : '#1F2937'} />
            <Text style={[styles.backText, IS_IPAD && styles.backTextIpad, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, IS_IPAD && { fontSize: 22 }, { color: colors.text }]}>
            Finding Qibla direction...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: screenBackground }]}>
        <View
          style={[styles.header, { backgroundColor: screenBackground, paddingTop: insets.top + 10 }]}
        >
          <TouchableOpacity 
            style={[styles.backButton, IS_IPAD && styles.backButtonIpad]}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left.circle.fill" size={IS_IPAD ? 60 : 48} color={isDarkMode ? '#FFFFFF' : '#1F2937'} />
            <Text style={[styles.backText, IS_IPAD && styles.backTextIpad, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={IS_IPAD ? 64 : 48} color={colors.tint} />
          <Text style={[styles.errorText, IS_IPAD && { fontSize: 20, marginBottom: 28 }, { color: colors.text }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, IS_IPAD && styles.retryButtonIpad, { backgroundColor: colors.tint }]}
            onPress={initializeQibla}
          >
            <Text style={[styles.retryButtonText, IS_IPAD && styles.retryButtonTextIpad, { color: colors.background }]}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: screenBackground }]}>
      {/* Header */}
      <View
        style={[styles.header, IS_IPAD && styles.headerIpad, { backgroundColor: screenBackground, paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity 
          style={[styles.backButton, IS_IPAD && styles.backButtonIpad]}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left.circle.fill" size={IS_IPAD ? 60 : 48} color={isDarkMode ? '#FFFFFF' : '#1F2937'} />
          <Text style={[styles.backText, IS_IPAD && styles.backTextIpad, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, IS_IPAD && styles.scrollContentIpad]}
        showsVerticalScrollIndicator={false}
      >
        {/* Location Info */}
        <View style={[styles.infoCard, IS_IPAD && styles.infoCardIpad, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={[styles.infoRow, IS_IPAD && styles.infoRowIpad]}>
            <IconSymbol name="location.fill" size={IS_IPAD ? 28 : 20} color={colors.tint} />
            <Text style={[styles.infoText, IS_IPAD && styles.infoTextIpad, { color: colors.text }]}>
              {locationInfo || 'Fetching location...'}
            </Text>
          </View>
          {qiblaData && (
            <>
              <View style={[styles.infoRow, IS_IPAD && styles.infoRowIpad]}>
                <IconSymbol name="arrow.up.circle.fill" size={IS_IPAD ? 28 : 20} color={colors.tint} />
                <Text style={[styles.infoText, IS_IPAD && styles.infoTextIpad, { color: colors.text }]}>
                  Qibla: {Math.round(qiblaData.direction)}° ({getDirectionText(qiblaData.direction)})
                </Text>
              </View>
              <View style={[styles.infoRow, IS_IPAD && styles.infoRowIpad]}>
                <IconSymbol name="map.fill" size={IS_IPAD ? 28 : 20} color={colors.tint} />
                <Text style={[styles.infoText, IS_IPAD && styles.infoTextIpad, { color: colors.text }]}>
                  Distance: {Math.round(qiblaData.distance)} km to Makkah
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Title Section */}
        <View style={[styles.titleSection, IS_IPAD && styles.titleSectionIpad]}>
          <Text style={[styles.headerTitle, IS_IPAD && styles.headerTitleIpad, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>Qibla Direction</Text>
          <Text style={[styles.headerSubtitle, IS_IPAD && styles.headerSubtitleIpad, { color: isDarkMode ? '#D9E3F5' : '#1F2937' }]}>اتجاه القبلة</Text>
        </View>

        {/* Compass */}
        <View style={[styles.compassContainer, (IS_IPAD || IS_IPHONE_SE) && { height: COMPASS_SIZE + (IS_IPHONE_SE ? 40 : 80) }]}>
          <Animated.View
            style={[
              styles.compassWrapper,
              (IS_IPAD || IS_IPHONE_SE) && { width: COMPASS_SIZE, height: COMPASS_SIZE },
              {
                transform: [{ rotate: compassRotation.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg'],
                }) }],
              },
            ]}
          >
            <View style={[styles.compass, { borderColor: colors.border }, (IS_IPAD || IS_IPHONE_SE) && { width: COMPASS_SIZE, height: COMPASS_SIZE, borderRadius: COMPASS_SIZE / 2, borderWidth: IS_IPHONE_SE ? 5 : 8 }]}>
              {/* Degree numbers for all positions */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((degree) => {
                const radian = (degree - 90) * (Math.PI / 180);
                const numberX = Math.cos(radian) * NUMBER_RADIUS;
                const numberY = Math.sin(radian) * NUMBER_RADIUS;
                
                return (
                  <Animated.View
                    key={degree}
                    style={[
                      styles.degreeNumberContainer,
                      IS_IPAD && { width: 56, height: 28, marginLeft: -28, marginTop: -14 },
                      IS_IPHONE_SE && { width: 44, height: 22, marginLeft: -22, marginTop: -11 },
                      {
                        left: COMPASS_CENTER + numberX,
                        top: COMPASS_CENTER + numberY,
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
                    <Text style={[styles.degreeNumber, { color: colors.text }, IS_IPAD && { fontSize: 18 }, IS_IPHONE_SE && { fontSize: 12 }]}>
                      {degree}°
                    </Text>
                  </Animated.View>
                );
              })}
              
              {/* North indicator */}
              <Animated.View 
                style={[
                  styles.northIndicator,
                  IS_IPAD && { top: 32, width: 78, height: 78, borderRadius: 39 },
                  IS_IPHONE_SE && { top: 16, width: 40, height: 40, borderRadius: 20 },
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
                <Text style={[styles.northText, { color: colors.background }, IS_IPAD && { fontSize: 48 }, IS_IPHONE_SE && { fontSize: 24 }]}>N</Text>
              </Animated.View>
              
              {/* Direction markers */}
              <Animated.Text 
                style={[
                  styles.directionMarker, 
                  styles.eastMarker,
                  IS_IPAD && { right: 48, fontSize: 48 },
                  IS_IPHONE_SE && { right: 24, fontSize: 24 },
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
                  IS_IPAD && { bottom: 48, fontSize: 48 },
                  IS_IPHONE_SE && { bottom: 24, fontSize: 24 },
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
                  IS_IPAD && { left: 48, fontSize: 48 },
                  IS_IPHONE_SE && { left: 24, fontSize: 24 },
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
              <View style={[styles.compassCircle, { borderColor: colors.border }, IS_IPAD && { width: 390, height: 390, borderRadius: 195 }, IS_IPHONE_SE && { width: 189, height: 189, borderRadius: 94.5 }]} />
              <View style={[styles.compassCircleInner, { borderColor: colors.border }, IS_IPAD && { width: 326, height: 326, borderRadius: 163 }, IS_IPHONE_SE && { width: 158, height: 158, borderRadius: 79 }]} />
            </View>
          </Animated.View>

          {/* Device heading needle (red, shows where you're facing) */}
          <View style={styles.needleContainer}>
            <View style={[styles.needleWrapper, IS_IPAD && { width: 10, height: 230 }, IS_IPHONE_SE && { width: 5, height: 110 }]}>
              {/* North end (red, pointed) */}
              <View style={[styles.needleNorth, IS_IPAD && { borderLeftWidth: 10, borderRightWidth: 10, borderBottomWidth: 115 }, IS_IPHONE_SE && { borderLeftWidth: 5, borderRightWidth: 5, borderBottomWidth: 55 }]} />
              {/* South end (white/gray, pointed) */}
              <View style={[styles.needleSouth, { borderBottomColor: colors.border }, IS_IPAD && { borderLeftWidth: 10, borderRightWidth: 10, borderTopWidth: 115 }, IS_IPHONE_SE && { borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 55 }]} />
            </View>
          </View>

          {/* Qibla indicator (Kaaba image points to Mecca) */}
          {qiblaData && (
            <View
              style={[
                styles.qiblaArrowContainer,
                IS_IPAD && { paddingTop: 54 },
                IS_IPHONE_SE && { paddingTop: 42 },
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
                <View style={[styles.qiblaImageWrapper, IS_IPAD && { width: 58, height: 58 }, IS_IPHONE_SE && { width: 44, height: 44 }]}>
                  <Image
                    source={require('@/assets/images/Mecca.png')}
                    style={[styles.qiblaImage, IS_IPAD && { width: 58, height: 58 }, IS_IPHONE_SE && { width: 44, height: 44 }]}
                    resizeMode="contain"
                  />
                </View>
              </Animated.View>
            </View>
          )}

          {/* Center dot */}
          <View style={[styles.centerDot, { backgroundColor: colors.tint }, IS_IPAD && { width: 16, height: 16, borderRadius: 8 }, IS_IPHONE_SE && { width: 10, height: 10, borderRadius: 5 }]} />
        </View>

        {/* Alignment Status */}
        {isMagnetometerAvailable && qiblaData && (
          <View style={[styles.statusCard, IS_IPAD && styles.statusCardIpad, { backgroundColor: '#000000' }]}>
            <Text style={[styles.statusText, IS_IPAD && styles.statusTextIpad, { color: '#FFFFFF' }]}>
              {getQiblaAlignment()}
            </Text>
            <Text style={[styles.headingText, IS_IPAD && styles.headingTextIpad, { color: '#FFFFFF' }]}>
              Current heading: {Math.round(heading)}°
            </Text>
          </View>
        )}

        {/* Instructions */}
        <View style={[styles.instructionsCard, IS_IPAD && styles.instructionsCardIpad, { backgroundColor: colors.background, borderColor: colors.border, marginBottom: insets.bottom + 20 }]}>
          <Text style={[styles.instructionsTitle, IS_IPAD && styles.instructionsTitleIpad, { color: colors.text }]}>
            Instructions:
          </Text>
          <Text style={[styles.instructionsText, IS_IPAD && styles.instructionsTextIpad, { color: colors.text }]}>
            • Hold your device flat and parallel to the ground
          </Text>
          <Text style={[styles.instructionsText, IS_IPAD && styles.instructionsTextIpad, { color: colors.text }]}>
            • Rotate yourself until the Kaaba image points upward
          </Text>
          <Text style={[styles.instructionsText, IS_IPAD && styles.instructionsTextIpad, { color: colors.text }]}>
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
  headerIpad: {
    paddingBottom: 12,
    paddingHorizontal: 28,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    marginTop: 6,
  },
  backText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 6,
  },
  backButtonIpad: {
    marginBottom: 12,
    marginTop: 10,
  },
  backTextIpad: {
    fontSize: 24,
    marginLeft: 10,
  },
  headerTitleContainer: {
    alignItems: 'center',
    marginTop: 2,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  titleSectionIpad: {
    marginBottom: 28,
    marginTop: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerTitleIpad: {
    fontSize: 42,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Fonts.primary,
  },
  headerSubtitleIpad: {
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  scrollContentIpad: {
    padding: 28,
    paddingBottom: 48,
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
  },
  infoCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  infoCardIpad: {
    borderRadius: 16,
    padding: 22,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoRowIpad: {
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  infoTextIpad: {
    fontSize: 20,
    marginLeft: 12,
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
    borderTopColor: '#D4AF37',
    borderLeftColor: '#D4AF37',
    borderRightColor: '#B8860B',
    borderBottomColor: '#B8860B',
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
  statusCardIpad: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  statusTextIpad: {
    fontSize: 20,
    marginBottom: 6,
  },
  headingText: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.9,
  },
  headingTextIpad: {
    fontSize: 18,
  },
  instructionsCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  instructionsCardIpad: {
    borderRadius: 16,
    padding: 22,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  instructionsTitleIpad: {
    fontSize: 22,
    marginBottom: 16,
  },
  instructionsText: {
    fontSize: 14,
    marginBottom: 6,
    opacity: 0.8,
  },
  instructionsTextIpad: {
    fontSize: 20,
    marginBottom: 10,
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
  retryButtonIpad: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  retryButtonTextIpad: {
    fontSize: 20,
  },
});

