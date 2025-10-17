import { Stack, Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/theme';
import { LocationProvider } from '@/contexts/LocationContext';
import { PrayerSettingsProvider } from '@/contexts/PrayerSettingsContext';
import { PrayerNotificationProvider } from '@/contexts/PrayerNotificationContext';
import { QuranSettingsProvider } from '@/contexts/QuranSettingsContext';
import FontLoader from '@/components/FontLoader';

function TabBarIcon({ name, color, size = 24 }: { name: string; color: string; size?: number }) {
  return <IconSymbol name={name as any} size={size} color={color} />;
}

function MosqueTabIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Text style={{ fontSize: size }}>
      🕌
    </Text>
  );
}

function TabNavigator() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: insets.bottom,
          paddingTop: 8,
          height: 60 + insets.bottom,
        },
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: '#000000',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
                <Tabs.Screen
                  name="(drawer)"
                  options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color }) => <TabBarIcon name="house.fill" color={color} />,
                  }}
                />
                <Tabs.Screen
                  name="hijri-calendar"
                  options={{
                    title: 'Hijri Calendar',
                    tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
                  }}
                />
                <Tabs.Screen
                  name="mosque-finder"
                  options={{
                    title: 'Mosque Finder',
                    tabBarIcon: ({ color }) => <MosqueTabIcon color={color} />,
                  }}
                />
                <Tabs.Screen
                  name="quran"
                  options={{
                    href: null, // Hide from tab bar
                    tabBarStyle: { display: 'none' }, // Hide bottom tab bar on this screen
                  }}
                />
                <Tabs.Screen
                  name="prayer-times"
                  options={{
                    href: null, // Hide from tab bar
                  }}
                />
                <Tabs.Screen
                  name="qibla"
                  options={{
                    href: null, // Hide from tab bar
                  }}
                />
                <Tabs.Screen
                  name="tasbih"
                  options={{
                    href: null, // Hide from tab bar
                  }}
                />
                <Tabs.Screen
                  name="duas"
                  options={{
                    href: null, // Hide from tab bar
                  }}
                />
                <Tabs.Screen
                  name="hadith"
                  options={{
                    href: null, // Hide from tab bar
                  }}
                />
                <Tabs.Screen
                  name="modal"
                  options={{
                    href: null, // Hide from tab bar
                  }}
                />
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <FontLoader>
      <ThemeProvider>
        <LocationProvider>
          <PrayerSettingsProvider>
            <PrayerNotificationProvider>
              <QuranSettingsProvider>
                <TabNavigator />
              </QuranSettingsProvider>
            </PrayerNotificationProvider>
          </PrayerSettingsProvider>
        </LocationProvider>
      </ThemeProvider>
    </FontLoader>
  );
}