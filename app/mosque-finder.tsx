import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useLocation } from '@/contexts/LocationContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Linking, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

const RADIUS_MILES = 5;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MOSQUE_CACHE_TTL_MS = 10 * 60 * 1000;
const mosqueCache = new Map<string, { mosques: Mosque[]; timestamp: number }>();

function getCacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(3)}_${lon.toFixed(3)}`;
}
const IS_IPAD = false; // Set true when deploying on iPad
const IS_SMALL_PHONE = SCREEN_WIDTH < 380;

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
  const { location: contextLocation, locationEnabled, requestLocation, error: contextError } = useLocation();
  const mapRef = useRef<MapView>(null);
  const scrollRef = useRef<ScrollView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchCount, setSearchCount] = useState(0);
  const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null);

  const isInitializedRef = useRef(false);
  const lastSearchedRef = useRef<{ lat: number; lon: number } | null>(null);
  const isSearchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clear mosque cache on mount so fresh queries use updated logic (e.g. new Overpass query, radius filter)
  useEffect(() => {
    mosqueCache.clear();
  }, []);

  // Initialize location from context or request fresh location (only once)
  useEffect(() => {
    if (!isInitializedRef.current) {
      initializeLocation();
      isInitializedRef.current = true;
    }
  }, []);

  // Update location when context location changes (only if location actually changed)
  useEffect(() => {
    if (contextLocation && contextLocation.latitude !== 0 && contextLocation.longitude !== 0 && isInitializedRef.current) {
      const locationObj: Location.LocationObject = {
        coords: {
          latitude: contextLocation.latitude,
          longitude: contextLocation.longitude,
          altitude: null,
          accuracy: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };
      const locationChanged = !lastSearchedRef.current ||
        Math.abs(lastSearchedRef.current.lat - contextLocation.latitude) > 0.0001 ||
        Math.abs(lastSearchedRef.current.lon - contextLocation.longitude) > 0.0001;
      if (locationChanged) {
        setErrorMsg(null);
        setLocation(locationObj);
        if (!isSearchingRef.current) {
          searchNearbyMosques(contextLocation.latitude, contextLocation.longitude);
        }
      }
    }
  }, [contextLocation?.latitude, contextLocation?.longitude]);

  // If we're waiting for context and context reports an error, show it
  useEffect(() => {
    if (isInitializedRef.current && !location && contextError && contextLocation == null) {
      setErrorMsg(contextError);
    }
  }, [contextError, contextLocation, location]);

  const initializeLocation = async () => {
    setErrorMsg(null); // Clear previous error on retry
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setErrorMsg('Location services are disabled. Please enable them in Settings.');
        setLoading(false);
        return;
      }

      // Prefer device location; accept cached fix (helps when GPS is weak indoors).
      try {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          ...({ maximumAge: 60000 } as any),
        });
        const loc = currentLocation.coords;
        if (loc.latitude != null && loc.longitude != null && Math.abs(loc.latitude) <= 90 && Math.abs(loc.longitude) <= 180) {
          setErrorMsg(null);
          setLocation(currentLocation);
          if (!isSearchingRef.current) {
            await searchNearbyMosques(loc.latitude, loc.longitude);
          }
          return;
        }
      } catch (gpsError: any) {
        console.warn('📍 getCurrentPositionAsync failed, trying context fallback:', gpsError?.message);
      }

      // Fallback: use context location if valid (e.g. simulator override, or saved from home)
      if (contextLocation && contextLocation.latitude !== 0 && contextLocation.longitude !== 0) {
        const locationObj: Location.LocationObject = {
          coords: {
            latitude: contextLocation.latitude,
            longitude: contextLocation.longitude,
            altitude: null,
            accuracy: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        };
        setLocation(locationObj);
        if (!isSearchingRef.current) {
          await searchNearbyMosques(contextLocation.latitude, contextLocation.longitude);
        }
        return;
      }

      // Context not ready yet: trigger context to fetch (LocationContext will update state when done)
      // Our useEffect on contextLocation will pick up the result when it arrives
      if (locationEnabled) {
        await requestLocation();
        return; // Don't set error - wait for context update; useEffect will set location when ready
      }

      setErrorMsg('Could not get your location. Please ensure location services are on and try again.');
    } catch (error: any) {
      const msg = error?.message?.toLowerCase() ?? '';
      if (msg.includes('timeout')) {
        setErrorMsg('Location timed out. GPS can be weak indoors—try near a window or outdoors, then tap Try Again.');
      } else if (msg.includes('permission') || msg.includes('denied')) {
        setErrorMsg('Permission to access location was denied');
      } else {
        setErrorMsg('Error getting location. Please check your location services and try again.');
      }
      console.error('Mosque finder location error:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchNearbyMosques = async (latitude: number, longitude: number, skipCache = false) => {
    let lat = Number(latitude);
    let lon = Number(longitude);
    const valid =
      Number.isFinite(lat) && Number.isFinite(lon) &&
      Math.abs(lat) <= 90 && Math.abs(lon) <= 180 &&
      (lat !== 0 || lon !== 0);
    if (!valid) {
      lat = 51.5074;
      lon = -0.1278;
      console.warn('⚠️ Invalid location, using London as fallback');
    }

    const searchKey = getCacheKey(lat, lon);
    const lastKey = lastSearchedRef.current ? getCacheKey(lastSearchedRef.current.lat, lastSearchedRef.current.lon) : null;
    if (isSearchingRef.current) return;
    if (!skipCache && searchKey === lastKey) return;

    const cached = !skipCache && mosqueCache.get(searchKey);
    if (cached && Date.now() - cached.timestamp < MOSQUE_CACHE_TTL_MS) {
      setMosques(cached.mosques);
      setSearchCount(cached.mosques.length);
      setLoading(false);
      lastSearchedRef.current = { lat, lon };
      return;
    }

    try {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      isSearchingRef.current = true;
      setLoading(true);
      setErrorMsg(null);

      const radiusMeters = Math.ceil(RADIUS_MILES * 1609.34);
      const query = `[out:json][timeout:15];(node["amenity"="place_of_worship"]["religion"~"muslim|islam",i](around:${radiusMeters},${lat},${lon});way["amenity"="place_of_worship"]["religion"~"muslim|islam",i](around:${radiusMeters},${lat},${lon});relation["amenity"="place_of_worship"]["religion"~"muslim|islam",i](around:${radiusMeters},${lat},${lon});node["amenity"="mosque"](around:${radiusMeters},${lat},${lon});way["amenity"="mosque"](around:${radiusMeters},${lat},${lon});node["building"="mosque"](around:${radiusMeters},${lat},${lon});way["building"="mosque"](around:${radiusMeters},${lat},${lon}););out center 200;`;

      const OVERPASS_URLS = [
        'https://overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter',
      ];
      const FETCH_TIMEOUT_MS = 25000;

      let data: any;
      let lastErr: Error | null = null;

      for (const url of OVERPASS_URLS) {
        if (signal.aborted) break;
        try {
          const timeoutId = setTimeout(() => abortControllerRef.current?.abort(), FETCH_TIMEOUT_MS);
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'data=' + encodeURIComponent(query),
            signal,
          });
          clearTimeout(timeoutId);
          if (!res.ok) {
            lastErr = new Error(res.status === 504 ? 'Server timed out. Tap Retry or pull to refresh.' : `HTTP ${res.status}`);
            continue;
          }
          data = await res.json();
          if (data.error) {
            lastErr = new Error(data.error || 'Overpass error');
            continue;
          }
          lastErr = null;
          break;
        } catch (e: any) {
          lastErr = e?.name === 'AbortError' ? e : (e || lastErr);
          if (e?.name === 'AbortError') break;
        }
      }

      if (lastErr) throw lastErr;
      if (!data?.elements?.length) {
        setMosques([]);
        setSearchCount(0);
        setLoading(false);
        setRefreshing(false);
        setErrorMsg('No mosques found within 5 miles. Pull to refresh or tap Retry.');
        lastSearchedRef.current = { lat, lon };
        return;
      }

      const isLikelyMosque = (tags: any): boolean => {
        if (!tags) return false;
        const amenity = String(tags.amenity ?? '').toLowerCase();
        const religion = String(tags.religion ?? '').toLowerCase();
        const building = String(tags.building ?? '').toLowerCase();
        const name = String(tags.name ?? tags['name:en'] ?? tags['name:ar'] ?? '').toLowerCase();
        if (amenity === 'mosque' || building === 'mosque') return true;
        if (religion.includes('muslim') || religion.includes('islam')) return true;
        if (name.includes('mosque') || name.includes('masjid') || name.includes('islamic')) return true;
        return false;
      };

      const list: Mosque[] = [];
      for (const el of data.elements) {
        const elat = el.lat ?? el.center?.lat;
        const elon = el.lon ?? el.center?.lon;
        if (elat == null || elon == null || !Number.isFinite(elat) || !Number.isFinite(elon)) continue;
        const tags = el?.tags ?? {};
        if (!isLikelyMosque(tags)) continue;
        const distance = calculateDistance(lat, lon, elat, elon);
        if (distance > RADIUS_MILES) continue;
        list.push({
          id: `${el.type ?? 'node'}-${el.id}`,
          name: tags.name || tags['name:en'] || tags['name:ar'] || 'Unnamed Mosque',
          address: formatAddress(tags),
          latitude: elat,
          longitude: elon,
          distance,
          phone: tags.phone || tags['contact:phone'],
          website: tags.website || tags['contact:website'],
        });
      }
      list.sort((a, b) => a.distance - b.distance);

      setMosques(list);
      setSearchCount(list.length);
      setErrorMsg(null);
      mosqueCache.set(searchKey, { mosques: list, timestamp: Date.now() });
      lastSearchedRef.current = { lat, lon };
    } catch (error: any) {
      if (error?.name === 'AbortError' || error?.message?.includes('abort')) return;
      console.error('Error fetching mosques:', error);
      const msg = error?.message ?? '';
      const friendly = msg.includes('504') || msg.includes('timed out')
        ? 'Server timed out. Pull to refresh or tap Retry.'
        : `Failed to fetch nearby mosques: ${msg || 'Network error'}. Check internet and tap Retry.`;
      setErrorMsg(friendly);
      setMosques([]);
      setSearchCount(0);
    } finally {
      isSearchingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatAddress = (tags: any): string => {
    if (!tags || typeof tags !== 'object') return 'Address not available';
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
    setRefreshing(true);
    if (location && location.coords.latitude !== 0 && location.coords.longitude !== 0) {
      await searchNearbyMosques(location.coords.latitude, location.coords.longitude, true);
      return;
    }
    if (contextLocation && contextLocation.latitude !== 0 && contextLocation.longitude !== 0) {
      await searchNearbyMosques(contextLocation.latitude, contextLocation.longitude, true);
      return;
    }
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setRefreshing(false);
        return;
      }
      const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation(currentLocation);
      await searchNearbyMosques(currentLocation.coords.latitude, currentLocation.coords.longitude, true);
    } catch {
      setErrorMsg('Error getting location. Please check your location services.');
      setRefreshing(false);
    }
  }, [contextLocation, location]);

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

  // Full-screen loader only while waiting for location (map shows as soon as we have it)
  if (!location && !errorMsg) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: colors.background }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={28} color={colors.text} />
            <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Mosque Finder</Text>
          </View>
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Getting your location...
          </Text>
        </View>
      </View>
    );
  }

  if (errorMsg && !location) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: colors.background }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={28} color={colors.text} />
            <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Mosque Finder</Text>
          </View>
        </View>
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
      <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: colors.background }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={28} color={colors.text} />
          <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Mosque Finder</Text>
          {__DEV__ && <Text style={[styles.bundleHint, { color: colors.text }]}>• latest</Text>}
        </View>
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
              radius={RADIUS_MILES * 1609.34}
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
                  <View style={[styles.marker, selectedMosque?.id === mosque.id && styles.selectedMarker]} />
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
        {errorMsg ? (
          <View style={styles.inlineErrorContainer}>
            <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#FFB020" />
            <Text style={[styles.inlineErrorText, { color: colors.text }]}>
              {errorMsg}
            </Text>
          </View>
        ) : null}

        {mosques.length === 0 ? (
          loading ? (
            <View style={styles.findingState}>
              <ActivityIndicator size="small" color={colors.tint} />
              <Text style={[styles.findingText, { color: colors.text }]}>
                Finding mosques within 5 miles...
              </Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <IconSymbol name="map" size={64} color={colors.icon} />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No mosques within 5 miles
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.text }]}>
                Pull to refresh or try again when you have a better GPS signal
              </Text>
              {location && (
                <TouchableOpacity
                  style={[styles.retryButton, { backgroundColor: colors.tint, marginTop: 16 }]}
                  onPress={() => searchNearbyMosques(location.coords.latitude, location.coords.longitude, true)}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              )}
            </View>
          )
        ) : (
          <>
            <View style={styles.listHeader}>
              <Text style={[styles.listHeaderTitle, { color: colors.text }]}>
                {mosques.length} mosque{mosques.length !== 1 ? 's' : ''} within 5 mi
              </Text>
              <Text style={[styles.listHeaderSubtitle, { color: colors.text }]}>
                Closest to furthest
              </Text>
            </View>
            {mosques.map((mosque, index) => (
            <TouchableOpacity
              key={mosque.id}
              style={[
                styles.mosqueCard,
                { borderColor: colors.border },
                selectedMosque?.id === mosque.id && styles.selectedMosqueCard
              ]}
              onPress={() => onMosqueCardPress(mosque)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={theme === 'dark' ? ['#363638', '#2A2A2C'] : ['#FFFFFF', '#F0F2F5']}
                style={styles.mosqueCardGradient}
              >
              <View style={styles.mosqueCardContent}>
                <View style={styles.mosqueHeader}>
                  <View style={[styles.rankBadge, { backgroundColor: colors.tint }]}>
                    <Text style={styles.rankBadgeText}>{index + 1}</Text>
                  </View>
                  <View style={styles.mosqueHeaderInfo}>
                    <Text style={[styles.mosqueName, { color: colors.text }]}>
                      {mosque.name}
                    </Text>
                    <View style={styles.distanceBadge}>
                      <IconSymbol name="location.fill" size={12} color="#5FC9A3" />
                      <Text style={[styles.mosqueDistance, { color: '#5FC9A3' }]}>
                        {mosque.distance.toFixed(1)} mi
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={[styles.mosqueAddress, { color: colors.text }]}>
                  {mosque.address}
                </Text>

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
              </LinearGradient>
            </TouchableOpacity>
            ))}
          </>
        )}
        <View style={styles.attributionContainer}>
          <Text
            style={[styles.attributionText, { color: colors.text }]}
            onPress={() => Linking.openURL('https://www.openstreetmap.org/copyright')}
          >
            Mosque data © OpenStreetMap contributors
          </Text>
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
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
    fontSize: IS_IPAD ? 22 : IS_SMALL_PHONE ? 16 : 18,
    fontWeight: '800',
    marginLeft: 6,
  },
  headerTitleContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  headerTitle: {
    fontSize: IS_IPAD ? 44 : IS_SMALL_PHONE ? 26 : 32,
    fontFamily: Fonts.secondary,
    fontWeight: '900',
    marginBottom: 0,
    letterSpacing: IS_IPAD ? 1.2 : 0.8,
  },
  bundleHint: {
    fontSize: 10,
    opacity: 0.6,
    marginTop: 2,
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
  listHeader: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  listHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  listHeaderSubtitle: {
    fontSize: 13,
    opacity: 0.75,
    marginTop: 2,
  },
  attributionContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  attributionText: {
    fontSize: 11,
    opacity: 0.6,
    textDecorationLine: 'underline',
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  mosqueCardGradient: {
    flex: 1,
    overflow: 'hidden',
  },
  selectedMosqueCard: {
    borderWidth: 3,
    borderColor: '#5FC9A3',
    shadowColor: '#5FC9A3',
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
  findingState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 32,
    marginTop: 24,
  },
  findingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  inlineErrorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 176, 32, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 176, 32, 0.4)',
  },
  inlineErrorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
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

