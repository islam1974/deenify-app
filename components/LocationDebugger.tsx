import { Colors } from '@/constants/theme';
import { useLocation } from '@/contexts/LocationContext';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

/**
 * LocationDebugger - Temporary debugging component
 * Add this to any screen to see detailed location status
 * 
 * Usage:
 * import LocationDebugger from '@/components/LocationDebugger';
 * <LocationDebugger />
 */

export default function LocationDebugger() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { location, locationEnabled, isLoading, error, requestLocation } = useLocation();
  
  const [permissionStatus, setPermissionStatus] = useState<string>('checking...');
  const [servicesEnabled, setServicesEnabled] = useState<string>('checking...');
  const [rawLocation, setRawLocation] = useState<any>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      // Check permission status
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);

      // Check if services enabled
      const enabled = await Location.hasServicesEnabledAsync();
      setServicesEnabled(enabled ? 'Enabled' : 'Disabled');

      // Try to get raw location
      if (status === 'granted' && enabled) {
        try {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeout: 5000,
          });
          setRawLocation(loc.coords);
        } catch (err: any) {
          setRawLocation({ error: err.message });
        }
      }
    } catch (err: any) {
      Alert.alert('Debug Error', err.message);
    }
  };

  const handleRequestPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      if (status === 'granted') {
        await requestLocation();
        await checkStatus();
      }
    } catch (err: any) {
      Alert.alert('Permission Error', err.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.tint }]}>
      <Text style={[styles.title, { color: colors.tint }]}>🔍 Location Debug Info</Text>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Context Location Enabled:</Text>
          <Text style={[styles.value, { color: locationEnabled ? '#4CAF50' : '#FF6B6B' }]}>
            {locationEnabled ? '✅ Yes' : '❌ No'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Loading:</Text>
          <Text style={[styles.value, { color: isLoading ? '#FFA726' : colors.text }]}>
            {isLoading ? '⏳ Yes' : '✅ No'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>System Permission Status:</Text>
          <Text style={[styles.value, { color: permissionStatus === 'granted' ? '#4CAF50' : '#FF6B6B' }]}>
            {permissionStatus}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Location Services:</Text>
          <Text style={[styles.value, { color: servicesEnabled === 'Enabled' ? '#4CAF50' : '#FF6B6B' }]}>
            {servicesEnabled}
          </Text>
        </View>

        {error && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: '#FF6B6B' }]}>Error:</Text>
            <Text style={[styles.value, { color: '#FF6B6B' }]}>
              {error}
            </Text>
          </View>
        )}

        {location && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Context Location:</Text>
            <Text style={[styles.value, { color: '#4CAF50', fontSize: 12 }]}>
              Lat: {location.latitude.toFixed(6)}{'\n'}
              Lng: {location.longitude.toFixed(6)}{'\n'}
              City: {location.city}{'\n'}
              Country: {location.country}
              {location.locality && `\nLocality: ${location.locality}`}
            </Text>
          </View>
        )}

        {rawLocation && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Raw GPS Data:</Text>
            <Text style={[styles.value, { color: colors.text, fontSize: 12 }]}>
              {JSON.stringify(rawLocation, null, 2)}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.tint }]}
          onPress={handleRequestPermission}
        >
          <Text style={styles.buttonText}>Request Permission</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.tint }]}
          onPress={async () => {
            await requestLocation();
            await checkStatus();
          }}
        >
          <Text style={styles.buttonText}>Refresh Location</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#666' }]}
          onPress={checkStatus}
        >
          <Text style={styles.buttonText}>Check Status</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.help, { color: colors.text }]}>
        💡 If permission is "denied", go to{'\n'}
        Settings → Deenify → Location → Allow
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    maxHeight: 500,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  content: {
    marginBottom: 12,
  },
  section: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
  },
  buttons: {
    gap: 8,
    marginBottom: 12,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  help: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

