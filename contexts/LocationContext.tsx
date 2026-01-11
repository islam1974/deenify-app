import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  locality?: string; // Specific neighborhood/district
  sublocality?: string; // More specific area within locality
}

interface LocationContextType {
  location: LocationData | null;
  locationEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => Promise<void>;
  toggleLocationServices: (enabled: boolean) => Promise<void>;
  setManualLocation: (city: string, country: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLocationSettings();
  }, []);

  useEffect(() => {
    if (locationEnabled && !location) {
      console.log('🔄 Location enabled but no location data, requesting...');
      requestLocation();
    }
  }, [locationEnabled, location]);

  const loadLocationSettings = async () => {
    try {
      const enabled = await AsyncStorage.getItem('locationEnabled');
      if (enabled !== null) {
        setLocationEnabled(JSON.parse(enabled));
      }
      
      const savedLocation = await AsyncStorage.getItem('savedLocation');
      if (savedLocation) {
        const parsed = JSON.parse(savedLocation);
        // Validate saved location data
        if (parsed.latitude && parsed.longitude && 
            parsed.latitude >= -90 && parsed.latitude <= 90 && 
            parsed.longitude >= -180 && parsed.longitude <= 180) {
          setLocation(parsed);
          console.log('📍 Loaded saved location:', parsed);
        } else {
          console.warn('⚠️ Invalid saved location data, will fetch fresh location');
          // Clear invalid location data
          await AsyncStorage.removeItem('savedLocation');
        }
      }
      // Don't set a default location - let the user choose
    } catch (error) {
      console.error('Error loading location settings:', error);
      // Don't set a default location on error either
    }
  };

  const requestLocation = async () => {
    if (!locationEnabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('❌ Location permission denied');
        setError('Location permission denied');
        return;
      }

      // Check if location services are enabled
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        console.error('❌ Location services are disabled');
        setError('Location services are disabled. Please enable location services in your device settings.');
        return;
      }

      console.log('📍 Requesting current position...');
      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, // Changed from High to Balanced for better reliability
        timeout: 10000, // 10 second timeout
        maximumAge: 60000, // Accept location up to 60 seconds old
      });
      
      console.log('📍 Raw GPS data received:', locationResult.coords);

      const { latitude, longitude } = locationResult.coords;

      // Reverse geocoding to get city and country
      let reverseGeocode;
      try {
        reverseGeocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
      } catch (geocodeError) {
        console.warn('⚠️ Reverse geocoding failed, using coordinates only:', geocodeError);
        // Use coordinates only if geocoding fails
        const locationData: LocationData = {
          latitude,
          longitude,
          city: 'Unknown City',
          country: 'Unknown Country',
        };
        setLocation(locationData);
        await AsyncStorage.setItem('savedLocation', JSON.stringify(locationData));
        return;
      }

      const address = reverseGeocode[0];
      
      if (!address) {
        console.warn('⚠️ No address found for location');
        const locationData: LocationData = {
          latitude,
          longitude,
          city: 'Unknown City',
          country: 'Unknown Country',
        };
        setLocation(locationData);
        await AsyncStorage.setItem('savedLocation', JSON.stringify(locationData));
        return;
      }
      
      // Get the most specific location name available
      // Priority: sublocality > district > city > subregion
      const locality = address.sublocality || address.district;
      const city = address.city || address.subregion || 'Unknown City';
      const country = address.country || 'Unknown Country';

      const locationData: LocationData = {
        latitude,
        longitude,
        city,
        country,
        locality,
        sublocality: address.sublocality,
      };

      console.log(`📍 Location fetched:`, {
        latitude,
        longitude,
        city,
        country,
        locality,
        sublocality: address.sublocality,
      });

      setLocation(locationData);
      await AsyncStorage.setItem('savedLocation', JSON.stringify(locationData));
    } catch (error: any) {
      console.error('Error getting location:', error);
      // Provide more specific error messages
      let errorMessage = 'Failed to get location';
      if (error?.message) {
        if (error.message.includes('location services')) {
          errorMessage = 'Location services are disabled. Please enable them in your device settings.';
        } else if (error.message.includes('permission')) {
          errorMessage = 'Location permission is required. Please grant location permission.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Location request timed out. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLocationServices = async (enabled: boolean) => {
    setLocationEnabled(enabled);
    await AsyncStorage.setItem('locationEnabled', JSON.stringify(enabled));
    
    if (enabled) {
      await requestLocation();
    } else {
      setLocation(null);
      await AsyncStorage.removeItem('savedLocation');
    }
  };

  const setManualLocation = (city: string, country: string) => {
    const locationData: LocationData = {
      latitude: 0, // Will be resolved by the API
      longitude: 0,
      city,
      country,
      locality: undefined,
      sublocality: undefined,
    };
    setLocation(locationData);
    AsyncStorage.setItem('savedLocation', JSON.stringify(locationData));
  };

  const value: LocationContextType = {
    location,
    locationEnabled,
    isLoading,
    error,
    requestLocation,
    toggleLocationServices,
    setManualLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};
