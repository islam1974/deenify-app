import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useLocation } from '@/contexts/LocationContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Linking, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Circle, Marker, UrlTile } from 'react-native-maps';
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
const IS_IPAD = Platform.OS === 'ios' && (Platform.isPad === true || SCREEN_WIDTH >= 768);
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

  // Keep mosque cache across mounts for faster repeat visits; users can pull-to-refresh for fresh data

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

  // Android: if location never arrives (e.g. emulator, slow GPS), run one search with fallback coords so the screen isn't stuck
  const runFallbackLocationSearch = useCallback(() => {
    const fallbackLat = 51.5074;
    const fallbackLon = -0.1278;
    setErrorMsg(null);
    setLocation({
      coords: { latitude: fallbackLat, longitude: fallbackLon, altitude: null, accuracy: null, altitudeAccuracy: null, heading: null, speed: null },
      timestamp: Date.now(),
    });
    searchNearbyMosques(fallbackLat, fallbackLon, true);
    setErrorMsg('Using default location (London). Tap Retry or enable location for your area.');
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const t = setTimeout(() => {
      if (lastSearchedRef.current != null) return;
      if (isSearchingRef.current) return;
      const lat = location?.coords?.latitude ?? contextLocation?.latitude;
      const lon = location?.coords?.longitude ?? contextLocation?.longitude;
      if (lat != null && lon != null && (lat !== 0 || lon !== 0)) return;
      runFallbackLocationSearch();
    }, 2500);
    return () => clearTimeout(t);
  }, []);

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

      // Use context location immediately if available (fast path - no GPS wait)
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
          searchNearbyMosques(contextLocation.latitude, contextLocation.longitude); // Non-blocking
        }
        return;
      }

      // No context: try device GPS (Low accuracy for faster fix)
      try {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
          ...({ maximumAge: 120000 } as any),
        });
        const loc = pos.coords;
        if (loc.latitude != null && loc.longitude != null && Math.abs(loc.latitude) <= 90 && Math.abs(loc.longitude) <= 180) {
          setErrorMsg(null);
          setLocation(pos);
          if (!isSearchingRef.current) {
            searchNearbyMosques(loc.latitude, loc.longitude);
          }
          return;
        }
      } catch (_) {}
      if (locationEnabled) {
        await requestLocation();
        return;
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
      const query = `[out:json][timeout:10];(node["amenity"="place_of_worship"]["religion"~"muslim|islam",i](around:${radiusMeters},${lat},${lon});way["amenity"="place_of_worship"]["religion"~"muslim|islam",i](around:${radiusMeters},${lat},${lon});node["amenity"="mosque"](around:${radiusMeters},${lat},${lon});way["amenity"="mosque"](around:${radiusMeters},${lat},${lon});node["building"="mosque"](around:${radiusMeters},${lat},${lon});way["building"="mosque"](around:${radiusMeters},${lat},${lon}););out center 200;`;

      const OVERPASS_URLS = [
        'https://overpass.kumi.systems/api/interpreter',
        'https://overpass-api.de/api/interpreter',
        'https://overpass.openstreetmap.ru/api/interpreter',
      ];
      const FETCH_TIMEOUT_MS = 18000;
      // Many Overpass servers require a User-Agent; Android can send an empty or blocked one
      const FETCH_HEADERS: Record<string, string> = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'Deenify/1.0 (Islamic companion app; OpenStreetMap Overpass client)',
      };

      let data: any;
      let lastErr: Error | null = null;

      for (const url of OVERPASS_URLS) {
        if (signal.aborted) break;
        try {
          const timeoutId = setTimeout(() => abortControllerRef.current?.abort(), FETCH_TIMEOUT_MS);
          const res = await fetch(url, {
            method: 'POST',
            headers: FETCH_HEADERS,
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
        <View style={[styles.header, IS_IPAD && styles.headerIpad, { paddingTop: insets.top + 10, backgroundColor: colors.background }]}>
          <TouchableOpacity 
            style={[styles.backButton, IS_IPAD && styles.backButtonIpad]}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={IS_IPAD ? 36 : 28} color={colors.text} />
            <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
          </TouchableOpacity>
          <View style={[styles.headerTitleContainer, IS_IPAD && styles.headerTitleContainerIpad]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Mosque Finder</Text>
          </View>
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Getting your location...
          </Text>
          {Platform.OS === 'android' && (
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.tint, marginTop: 20 }]}
              onPress={runFallbackLocationSearch}
            >
              <Text style={styles.retryButtonText}>Use default location</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  if (errorMsg && !location) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, IS_IPAD && styles.headerIpad, { paddingTop: insets.top + 10, backgroundColor: colors.background }]}>
          <TouchableOpacity 
            style={[styles.backButton, IS_IPAD && styles.backButtonIpad]}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={IS_IPAD ? 36 : 28} color={colors.text} />
            <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
          </TouchableOpacity>
          <View style={[styles.headerTitleContainer, IS_IPAD && styles.headerTitleContainerIpad]}>
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
          {Platform.OS === 'android' && (
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.tint, marginTop: 12 }]}
              onPress={runFallbackLocationSearch}
            >
              <Text style={styles.retryButtonText}>Use default location</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, IS_IPAD && styles.headerIpad, { paddingTop: insets.top + 10, backgroundColor: colors.background }]}>
        <TouchableOpacity 
          style={[styles.backButton, IS_IPAD && styles.backButtonIpad]}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={IS_IPAD ? 36 : 28} color={colors.text} />
          <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
        </TouchableOpacity>
        <View style={[styles.headerTitleContainer, IS_IPAD && styles.headerTitleContainerIpad]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Mosque Finder</Text>
          {__DEV__ && <Text style={[styles.bundleHint, { color: colors.text }]}>• latest</Text>}
        </View>
      </View>

      {/* Map View */}
      {location && (
        <View style={[styles.mapContainer, IS_IPAD && styles.mapContainerIpad]}>
          <MapView
            ref={mapRef}
            style={styles.map}
            mapType={Platform.OS === 'android' ? 'none' : 'standard'}
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
            {/* On Android use OSM tiles (no Google API key). iOS uses Apple Maps. */}
            {Platform.OS === 'android' && (
              <UrlTile
                urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                shouldReplaceMapContent
                maximumZ={19}
                flipY={false}
              />
            )}
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
              style={[styles.fitButton, IS_IPAD && styles.fitButtonIpad, { backgroundColor: colors.cardBackground }]}
              onPress={fitMapToMarkers}
            >
              <IconSymbol name="location.viewfinder" size={IS_IPAD ? 32 : 24} color={colors.tint} />
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView 
        ref={scrollRef}
        style={[styles.listContainer, IS_IPAD && styles.listContainerIpad]}
        contentContainerStyle={IS_IPAD ? styles.listContentIpad : undefined}
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
            <View style={[styles.listHeader, IS_IPAD && styles.listHeaderIpad]}>
              <Text style={[styles.listHeaderTitle, IS_IPAD && styles.listHeaderTitleIpad, { color: colors.text }]}>
                {mosques.length} mosque{mosques.length !== 1 ? 's' : ''} within 5 mi
              </Text>
              <Text style={[styles.listHeaderSubtitle, IS_IPAD && styles.listHeaderSubtitleIpad, { color: colors.text }]}>
                Closest to furthest
              </Text>
            </View>
            {mosques.map((mosque, index) => (
            <TouchableOpacity
              key={mosque.id}
              style={[
                styles.mosqueCard,
                IS_IPAD && styles.mosqueCardIpad,
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
                <View style={[styles.mosqueCardContent, IS_IPAD && styles.mosqueCardContentIpad]}>
                <View style={styles.mosqueHeader}>
                  <View style={[styles.rankBadge, IS_IPAD && styles.rankBadgeIpad, { backgroundColor: colors.tint }]}>
                    <Text style={[styles.rankBadgeText, IS_IPAD && styles.rankBadgeTextIpad]}>{index + 1}</Text>
                  </View>
                  <View style={styles.mosqueHeaderInfo}>
                    <Text style={[styles.mosqueName, IS_IPAD && styles.mosqueNameIpad, { color: colors.text }]}>
                      {mosque.name}
                    </Text>
                    <View style={styles.distanceBadge}>
                      <IconSymbol name="location.fill" size={IS_IPAD ? 18 : 12} color="#5FC9A3" />
                      <Text style={[styles.mosqueDistance, IS_IPAD && styles.mosqueDistanceIpad, { color: '#5FC9A3' }]}>
                        {mosque.distance.toFixed(1)} mi
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={[styles.mosqueAddress, IS_IPAD && styles.mosqueAddressIpad, { color: colors.text }]}>
                  {mosque.address}
                </Text>

                <View style={[styles.actionButtons, IS_IPAD && styles.actionButtonsIpad]}>
                  <TouchableOpacity
                    style={[styles.actionButton, IS_IPAD && styles.actionButtonIpad, { backgroundColor: colors.tint }]}
                    onPress={(e) => {
                      e.stopPropagation();
                      openInMaps(mosque);
                    }}
                    activeOpacity={0.7}
                  >
                    <IconSymbol name="map.fill" size={IS_IPAD ? 24 : 18} color="#FFFFFF" />
                    <Text style={[styles.actionButtonText, IS_IPAD && styles.actionButtonTextIpad]}>Directions</Text>
                  </TouchableOpacity>

                  {mosque.phone && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonSecondary, IS_IPAD && styles.actionButtonIpad, { borderColor: colors.border }]}
                      onPress={(e) => {
                        e.stopPropagation();
                        callMosque(mosque.phone!);
                      }}
                      activeOpacity={0.7}
                    >
                      <IconSymbol name="phone.fill" size={IS_IPAD ? 24 : 18} color={colors.text} />
                      <Text style={[styles.actionButtonTextSecondary, IS_IPAD && styles.actionButtonTextSecondaryIpad, { color: colors.text }]}>Call</Text>
                    </TouchableOpacity>
                  )}

                  {mosque.website && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonSecondary, IS_IPAD && styles.actionButtonIpad, { borderColor: colors.border }]}
                      onPress={(e) => {
                        e.stopPropagation();
                        openWebsite(mosque.website!);
                      }}
                      activeOpacity={0.7}
                    >
                      <IconSymbol name="globe" size={IS_IPAD ? 24 : 18} color={colors.text} />
                      <Text style={[styles.actionButtonTextSecondary, IS_IPAD && styles.actionButtonTextSecondaryIpad, { color: colors.text }]}>Website</Text>
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
  headerIpad: {
    paddingBottom: 12,
    paddingHorizontal: 28,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  backButtonIpad: {
    marginTop: 8,
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
  headerTitleContainerIpad: {
    marginTop: 20,
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
  listHeaderIpad: {
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  listHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  listHeaderTitleIpad: {
    fontSize: 24,
  },
  listHeaderSubtitle: {
    fontSize: 13,
    opacity: 0.75,
    marginTop: 2,
  },
  listHeaderSubtitleIpad: {
    fontSize: 18,
    marginTop: 4,
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
  rankBadgeIpad: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 16,
  },
  rankBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  rankBadgeTextIpad: {
    fontSize: 18,
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
  mapContainerIpad: {
    height: 320,
    margin: 24,
    borderRadius: 20,
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
  fitButtonIpad: {
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  listContainerIpad: {
    padding: 28,
  },
  listContentIpad: {
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
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
  mosqueCardIpad: {
    borderRadius: 20,
    marginBottom: 22,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 20,
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
  mosqueCardContentIpad: {
    padding: 24,
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
  mosqueNameIpad: {
    fontSize: 24,
    marginBottom: 8,
    lineHeight: 30,
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
  mosqueDistanceIpad: {
    fontSize: 18,
  },
  mosqueAddress: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
    marginBottom: 16,
  },
  mosqueAddressIpad: {
    fontSize: 19,
    lineHeight: 26,
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButtonsIpad: {
    gap: 12,
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
  actionButtonIpad: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 14,
    gap: 8,
    minWidth: 120,
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
  actionButtonTextIpad: {
    fontSize: 18,
  },
  actionButtonTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonTextSecondaryIpad: {
    fontSize: 18,
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

