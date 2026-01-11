import FontLoader from '@/components/FontLoader';
import PrivacyNoticeModal from '@/components/PrivacyNoticeModal';
import SplashScreenManager from '@/components/SplashScreenManager';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LocationProvider } from '@/contexts/LocationContext';
import { PrayerNotificationProvider } from '@/contexts/PrayerNotificationContext';
import { PrayerSettingsProvider } from '@/contexts/PrayerSettingsContext';
import { PrivacyProvider, usePrivacy } from '@/contexts/PrivacyContext';
import { QuranSettingsProvider } from '@/contexts/QuranSettingsContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Tabs } from 'expo-router';
import React from 'react';
import { Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_IPAD = Platform.OS === 'ios' ? Boolean((Platform as any).isPad) : SCREEN_WIDTH >= 768;
const TAB_ICON_SIZE = IS_IPAD ? 48 : 22;
const MOSQUE_ICON_SIZE = IS_IPAD ? 52 : 24;

function TabBarIcon({ name, color }: { name: string; color: string }) {
  return <IconSymbol name={name as any} size={TAB_ICON_SIZE} color={color} />;
}

function MosqueTabIcon({ color }: { color: string }) {
  return <MaterialCommunityIcons name="mosque" size={MOSQUE_ICON_SIZE} color={color} />;
}

function TabNavigator() {
  const insets = useSafeAreaInsets();
  const { showPrivacyNotice, acceptPrivacyPolicy } = usePrivacy();
  
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
            paddingBottom: insets.bottom,
            paddingTop: IS_IPAD ? 12 : 4,
            height: (IS_IPAD ? 68 : 54) + insets.bottom,
            overflow: 'visible',
          },
          tabBarItemStyle: {
            paddingVertical: 6,
            paddingHorizontal: IS_IPAD ? 16 : 4,
            minWidth: IS_IPAD ? 100 : 64,
          },
          tabBarActiveTintColor: '#2E7D32',
          tabBarInactiveTintColor: '#000000',
          tabBarLabelStyle: {
            fontSize: 13,
            fontWeight: '700',
            marginTop: 10,
            letterSpacing: 0.35,
            lineHeight: 18,
            textAlign: 'center',
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
                <Tabs.Screen
                  name="privacy-policy"
                  options={{
                    href: null, // Hide from tab bar
                  }}
                />
                <Tabs.Screen
                  name="about"
                  options={{
                    href: null, // Hide from tab bar
                  }}
                />
      </Tabs>
      
      {/* First Launch Privacy Notice */}
      <PrivacyNoticeModal
        visible={showPrivacyNotice}
        onAccept={acceptPrivacyPolicy}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <FontLoader>
      <ThemeProvider>
        <PrivacyProvider>
          <LocationProvider>
            <PrayerSettingsProvider>
              <PrayerNotificationProvider>
                <QuranSettingsProvider>
                  <SplashScreenManager>
                    <TabNavigator />
                  </SplashScreenManager>
                </QuranSettingsProvider>
              </PrayerNotificationProvider>
            </PrayerSettingsProvider>
          </LocationProvider>
        </PrivacyProvider>
      </ThemeProvider>
    </FontLoader>
  );
}