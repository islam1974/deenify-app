import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      requestLocation();
    }
  }, [locationEnabled]);

  const loadLocationSettings = async () => {
    try {
      const enabled = await AsyncStorage.getItem('locationEnabled');
      if (enabled !== null) {
        setLocationEnabled(JSON.parse(enabled));
      }
      
      const savedLocation = await AsyncStorage.getItem('savedLocation');
      if (savedLocation) {
        setLocation(JSON.parse(savedLocation));
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
        setError('Location permission denied');
        return;
      }

      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = locationResult.coords;

      // Reverse geocoding to get city and country
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const address = reverseGeocode[0];
      
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

      setLocation(locationData);
      await AsyncStorage.setItem('savedLocation', JSON.stringify(locationData));
    } catch (error) {
      console.error('Error getting location:', error);
      setError('Failed to get location');
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
