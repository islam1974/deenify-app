import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Colors, Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface Mosque {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance: number;
  phone?: string;
  website?: string;
}

const RADIUS_OPTIONS = [1, 2, 5, 10, 15, 20]; // miles

// Dark map style for better visibility in dark mode
const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#242f3e" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#746855" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#242f3e" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#17263c" }]
  }
];

export default function MosqueFinderScreen() {
  const { theme } = useTheme();
  const colors = Colors[((theme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const scrollRef = useRef<ScrollView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedRadius, setSelectedRadius] = useState(5); // default 5 miles
  const [searchCount, setSearchCount] = useState(0);
  const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null);

  useEffect(() => {
    initializeLocation();
  }, []);

  useEffect(() => {
    if (location && !loading) {
      searchNearbyMosques(location.coords.latitude, location.coords.longitude, selectedRadius);
    }
  }, [selectedRadius]);

  const initializeLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation);
      await searchNearbyMosques(currentLocation.coords.latitude, currentLocation.coords.longitude, selectedRadius);
    } catch (error) {
      setErrorMsg('Error getting location. Please check your location services.');
      console.error(error);
      setLoading(false);
    }
  };

  const searchNearbyMosques = async (latitude: number, longitude: number, radiusMiles: number) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      // Convert miles to meters for API
      const radiusMeters = radiusMiles * 1609.34;
      
      // Using Overpass API (OpenStreetMap) - free, no API key required
      // Try multiple Overpass API servers for redundancy
      const overpassUrls = [
        'https://overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter',
        'https://overpass.openstreetmap.ru/api/interpreter'
      ];
      
      const query = `
        [out:json][timeout:60];
        (
          node["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${latitude},${longitude});
          way["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${latitude},${longitude});
          relation["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${latitude},${longitude});
        );
        out center;
      `;

      let data = null;
      let lastError = null;

      // Try each server until one works
      for (const overpassUrl of overpassUrls) {
        try {
          console.log(`Trying Overpass API: ${overpassUrl}`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

          const response = await fetch(overpassUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'data=' + encodeURIComponent(query),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
          }

          data = await response.json();
          console.log('Successfully fetched mosques:', data.elements?.length || 0);
          break; // Success, exit loop
        } catch (err: any) {
          console.error(`Failed with ${overpassUrl}:`, err.message);
          lastError = err;
          // Continue to next server
        }
      }

      if (!data) {
        throw new Error(lastError?.message || 'All API servers failed');
      }

      if (!data.elements || data.elements.length === 0) {
        setMosques([]);
        setSearchCount(0);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      // Process the results
      const processedMosques: Mosque[] = data.elements
        .map((element: any) => {
          const lat = element.lat || element.center?.lat;
          const lon = element.lon || element.center?.lon;
          
          if (!lat || !lon) return null;

          const distance = calculateDistance(latitude, longitude, lat, lon);
          
          return {
            id: element.id.toString(),
            name: element.tags?.name || element.tags?.['name:en'] || element.tags?.['name:ar'] || 'Unnamed Mosque',
            address: formatAddress(element.tags),
            latitude: lat,
            longitude: lon,
            distance: distance,
            phone: element.tags?.phone || element.tags?.['contact:phone'],
            website: element.tags?.website || element.tags?.['contact:website'],
          };
        })
        .filter((mosque: Mosque | null) => mosque !== null)
        .sort((a: Mosque, b: Mosque) => a.distance - b.distance);

      setMosques(processedMosques);
      setSearchCount(processedMosques.length);
    } catch (error: any) {
      console.error('Error fetching mosques:', error);
      setErrorMsg(`Failed to fetch nearby mosques: ${error.message || 'Network error'}. Please check your internet connection and try again.`);
      setMosques([]);
      setSearchCount(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatAddress = (tags: any): string => {
    if (!tags) return 'Address not available';
    
    const parts = [];
    if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
    if (tags['addr:street']) parts.push(tags['addr:street']);
    if (tags['addr:city']) parts.push(tags['addr:city']);
    if (tags['addr:state']) parts.push(tags['addr:state']);
    if (tags['addr:postcode']) parts.push(tags['addr:postcode']);
    
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const onRefresh = useCallback(async () => {
    if (!location) return;
    setRefreshing(true);
    await searchNearbyMosques(location.coords.latitude, location.coords.longitude, selectedRadius);
  }, [location, selectedRadius]);

  const openInMaps = (mosque: Mosque) => {
    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
    });
    const url = Platform.select({
      ios: `${scheme}?q=${mosque.latitude},${mosque.longitude}`,
      android: `${scheme}${mosque.latitude},${mosque.longitude}?q=${mosque.latitude},${mosque.longitude}(${encodeURIComponent(mosque.name)})`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  const callMosque = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const openWebsite = (website: string) => {
    Linking.openURL(website);
  };

  const onMarkerPress = (mosque: Mosque) => {
    setSelectedMosque(mosque);
    // Center map on selected mosque
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: mosque.latitude,
        longitude: mosque.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 300);
    }
  };

  const onMosqueCardPress = (mosque: Mosque) => {
    setSelectedMosque(mosque);
    // Center map on selected mosque
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: mosque.latitude,
        longitude: mosque.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 300);
    }
  };

  const fitMapToMarkers = () => {
    if (mapRef.current && mosques.length > 0 && location) {
      const coordinates = [
        { latitude: location.coords.latitude, longitude: location.coords.longitude },
        ...mosques.map(m => ({ latitude: m.latitude, longitude: m.longitude }))
      ];
      
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
        animated: true,
      });
    }
  };

  useEffect(() => {
    if (mosques.length > 0 && location) {
      setTimeout(() => fitMapToMarkers(), 500);
    }
  }, [mosques]);

  if (loading && mosques.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={['#006B5E', '#00A693']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGradient, { paddingTop: insets.top + 10 }]}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={28} color="#FFFFFF" />
            <Text style={[styles.backText, { color: '#FFFFFF' }]}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>Mosque Finder</Text>
          </View>
        </LinearGradient>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Finding nearby mosques...
          </Text>
        </View>
      </View>
    );
  }

  if (errorMsg && !location) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={['#006B5E', '#00A693']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGradient, { paddingTop: insets.top + 10 }]}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={28} color="#FFFFFF" />
            <Text style={[styles.backText, { color: '#FFFFFF' }]}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>Mosque Finder</Text>
          </View>
        </LinearGradient>
        <View style={styles.centerContent}>
          <IconSymbol name="location.slash" size={64} color="#FF6B6B" />
          <Text style={[styles.errorText, { color: colors.text }]}>
            {errorMsg}
          </Text>
          <Text style={[styles.errorSubtext, { color: colors.text }]}>
            Please enable location services to find nearby mosques
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.tint }]}
            onPress={initializeLocation}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#006B5E', '#00A693']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={28} color="#FFFFFF" />
          <Text style={[styles.backText, { color: '#FFFFFF' }]}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>Mosque Finder</Text>
        </View>
      </LinearGradient>

      {/* Search Info Bar */}
      <View style={[styles.infoBar, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <View style={styles.infoBarContent}>
          <View style={styles.resultCountContainer}>
            <IconSymbol name="mappin.and.ellipse" size={20} color={colors.tint} />
            <Text style={[styles.resultCountText, { color: colors.text }]}>
              {searchCount} {searchCount === 1 ? 'mosque' : 'mosques'} found
            </Text>
          </View>
          {loading && <ActivityIndicator size="small" color={colors.tint} />}
        </View>
      </View>

      {/* Radius Selector */}
      <View style={[styles.radiusSelectorContainer, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.radiusSelectorLabel, { color: colors.text }]}>
          Search Radius:
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.radiusScroll}
          contentContainerStyle={styles.radiusScrollContent}
        >
          {RADIUS_OPTIONS.map((radius) => (
            <TouchableOpacity
              key={radius}
              style={[
                styles.radiusOption,
                selectedRadius === radius && { backgroundColor: colors.tint },
                selectedRadius !== radius && { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }
              ]}
              onPress={() => setSelectedRadius(radius)}
              disabled={loading}
            >
              <Text style={[
                styles.radiusOptionText,
                selectedRadius === radius ? { color: '#FFFFFF', fontWeight: '700' } : { color: colors.text }
              ]}>
                {radius} mi
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map View */}
      {location && (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            showsUserLocation
            showsMyLocationButton
            customMapStyle={theme === 'dark' ? darkMapStyle : []}
          >
            {/* User Location Circle - showing search radius */}
            <Circle
              center={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              radius={selectedRadius * 1609.34} // Convert miles to meters
              strokeColor="rgba(0, 166, 147, 0.5)"
              fillColor="rgba(0, 166, 147, 0.1)"
              strokeWidth={2}
            />

            {/* Mosque Markers */}
            {mosques.map((mosque) => (
              <Marker
                key={mosque.id}
                coordinate={{
                  latitude: mosque.latitude,
                  longitude: mosque.longitude,
                }}
                onPress={() => onMarkerPress(mosque)}
                pinColor="#006B5E"
              >
                <View style={styles.markerContainer}>
                  <View style={[styles.marker, selectedMosque?.id === mosque.id && styles.selectedMarker]}>
                    <Text style={styles.markerEmoji}>🕌</Text>
                  </View>
                </View>
              </Marker>
            ))}
          </MapView>

          {/* Fit to markers button */}
          {mosques.length > 0 && (
            <TouchableOpacity
              style={[styles.fitButton, { backgroundColor: colors.cardBackground }]}
              onPress={fitMapToMarkers}
            >
              <IconSymbol name="location.viewfinder" size={24} color={colors.tint} />
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView 
        ref={scrollRef}
        style={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
          />
        }
      >
        {mosques.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="map" size={64} color={colors.icon} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No mosques found nearby
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.text }]}>
              Try adjusting your search radius or pull to refresh
            </Text>
          </View>
        ) : (
          mosques.map((mosque) => (
            <TouchableOpacity
              key={mosque.id}
              style={[
                styles.mosqueCard,
                { backgroundColor: colors.cardBackground, borderColor: colors.border },
                selectedMosque?.id === mosque.id && styles.selectedMosqueCard
              ]}
              onPress={() => onMosqueCardPress(mosque)}
              activeOpacity={0.7}
            >
              <View style={styles.mosqueCardContent}>
                <View style={styles.mosqueHeader}>
                  <View style={[styles.iconCircle, { backgroundColor: '#006B5E' + '20' }]}>
                    <Text style={styles.mosqueEmoji}>🕌</Text>
                  </View>
                  <View style={styles.mosqueHeaderInfo}>
                    <Text style={[styles.mosqueName, { color: colors.text }]}>
                      {mosque.name}
                    </Text>
                    <View style={styles.distanceBadge}>
                      <IconSymbol name="location.fill" size={12} color="#00A693" />
                      <Text style={[styles.mosqueDistance, { color: '#00A693' }]}>
                        {mosque.distance.toFixed(1)} miles away
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={[styles.mosqueAddress, { color: colors.text }]}>
                  {mosque.address}
                </Text>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.tint }]}
                    onPress={(e) => {
                      e.stopPropagation();
                      openInMaps(mosque);
                    }}
                    activeOpacity={0.7}
                  >
                    <IconSymbol name="map.fill" size={18} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Directions</Text>
                  </TouchableOpacity>

                  {mosque.phone && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonSecondary, { borderColor: colors.border }]}
                      onPress={(e) => {
                        e.stopPropagation();
                        callMosque(mosque.phone!);
                      }}
                      activeOpacity={0.7}
                    >
                      <IconSymbol name="phone.fill" size={18} color={colors.text} />
                      <Text style={[styles.actionButtonTextSecondary, { color: colors.text }]}>Call</Text>
                    </TouchableOpacity>
                  )}

                  {mosque.website && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonSecondary, { borderColor: colors.border }]}
                      onPress={(e) => {
                        e.stopPropagation();
                        openWebsite(mosque.website!);
                      }}
                      activeOpacity={0.7}
                    >
                      <IconSymbol name="globe" size={18} color={colors.text} />
                      <Text style={[styles.actionButtonTextSecondary, { color: colors.text }]}>Website</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 2,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  headerTitleContainer: {
    alignItems: 'center',
    marginTop: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 0,
  },
  headerSubtitle: {
    fontSize: 11,
    fontFamily: Fonts.primary,
  },
  infoBar: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  infoBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultCountText: {
    fontSize: 15,
    fontWeight: '600',
  },
  radiusSelectorContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  radiusSelectorLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  radiusScroll: {
    marginHorizontal: -5,
  },
  radiusScrollContent: {
    paddingHorizontal: 5,
    gap: 10,
  },
  radiusOption: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  radiusOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  mapContainer: {
    height: 200,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 3,
    borderColor: '#006B5E',
  },
  selectedMarker: {
    borderColor: '#FF6B6B',
    borderWidth: 4,
    transform: [{ scale: 1.2 }],
  },
  markerEmoji: {
    fontSize: 20,
  },
  fitButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  mosqueCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedMosqueCard: {
    borderWidth: 3,
    borderColor: '#00A693',
    shadowColor: '#00A693',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  mosqueCardContent: {
    padding: 16,
  },
  mosqueHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  mosqueHeaderInfo: {
    flex: 1,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mosqueEmoji: {
    fontSize: 28,
  },
  mosqueName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 24,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mosqueDistance: {
    fontSize: 13,
    fontWeight: '600',
  },
  mosqueAddress: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
    flex: 1,
    minWidth: 100,
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 15,
    opacity: 0.7,
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 50,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    opacity: 0.7,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 22,
  },
});

