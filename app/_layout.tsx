import ErrorBoundary from '@/components/ErrorBoundary';
import FontLoader from '@/components/FontLoader';
import TrackPlayerRegistration from '@/components/TrackPlayerRegistration';
import PrivacyNoticeModal from '@/components/PrivacyNoticeModal';
import SplashScreenManager from '@/components/SplashScreenManager';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LocationProvider } from '@/contexts/LocationContext';
import { PrayerNotificationProvider } from '@/contexts/PrayerNotificationContext';
import { PrayerSettingsProvider } from '@/contexts/PrayerSettingsContext';
import { PrivacyProvider, usePrivacy } from '@/contexts/PrivacyContext';
import { QuranSettingsProvider } from '@/contexts/QuranSettingsContext';
import { QuranThemeProvider } from '@/contexts/QuranThemeContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Tabs, usePathname, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { Dimensions, Platform, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Keep native splash visible until we explicitly hide it (prevents white screen)
SplashScreen.preventAutoHideAsync().catch(() => {});

let SCREEN_WIDTH = 390;
let SCREEN_HEIGHT = 844;
try {
  const window = Dimensions.get('window');
  if (typeof window?.width === 'number') SCREEN_WIDTH = window.width;
  if (typeof window?.height === 'number') SCREEN_HEIGHT = window.height;
} catch {
  // Dimensions can throw before native bridge is ready (e.g. Expo Go / dev)
}

const IS_IPAD = false; // Set true when deploying on iPad
const IS_PRO_MAX = SCREEN_WIDTH >= 430; // iPhone 16 Pro Max, Plus
const TAB_ICON_SIZE = IS_IPAD ? 52 : IS_PRO_MAX ? 30 : 26;
// iPhone SE and other short screens: add more bottom padding so tab bar isn't cut off
const IS_COMPACT_HEIGHT = SCREEN_HEIGHT < 700;
const TAB_BAR_BOTTOM_EXTRA = Platform.OS === 'ios' ? (IS_COMPACT_HEIGHT ? 20 : 8) : IS_COMPACT_HEIGHT ? 12 : 4;
const TAB_LABEL_FONT_SIZE = IS_PRO_MAX ? 13 : 12;
const TAB_BAR_BASE_HEIGHT = IS_IPAD ? 60 : IS_PRO_MAX ? 52 : 48;

type SFSymbolName = 'house.fill' | 'house' | 'calendar.circle.fill' | 'calendar.circle' | 'location.fill' | 'location';

function TabBarIcon({ activeName, inactiveName, focused, color }: { activeName: SFSymbolName; inactiveName: SFSymbolName; focused: boolean; color: string }) {
  return <IconSymbol name={focused ? activeName : inactiveName} size={TAB_ICON_SIZE} color={color} />;
}

function TabBarLabel({ title, focused, color }: { title: string; focused: boolean; color: string }) {
  return (
    <Text
      style={{
        fontSize: TAB_LABEL_FONT_SIZE,
        fontWeight: focused ? '700' : '600',
        color,
        opacity: focused ? 1 : 0.85,
        marginTop: 4,
        textAlign: 'center',
      }}
    >
      {title}
    </Text>
  );
}

function TabNavigator() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showPrivacyNotice, acceptPrivacyPolicy } = usePrivacy();
  const pathname = usePathname();
  const isQuranReader = pathname?.includes('/quran') && !pathname?.includes('quran-landing');
  const isOnQuranScreen = pathname?.includes('quran-landing') || pathname?.includes('/quran');

  // Lock orientation to portrait for all screens except Quran
  useEffect(() => {
    const isQuranScreen = pathname === '/quran' || pathname?.includes('/quran');
    if (!isQuranScreen) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
    }
  }, [pathname]);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 0.5,
            borderTopColor: 'rgba(0,0,0,0.08)',
            paddingBottom: insets.bottom + TAB_BAR_BOTTOM_EXTRA,
            paddingTop: IS_IPAD ? 8 : IS_PRO_MAX ? 4 : 2,
            height: TAB_BAR_BASE_HEIGHT + insets.bottom + TAB_BAR_BOTTOM_EXTRA,
            overflow: 'visible',
            display: isQuranReader ? 'none' : 'flex',
          },
          tabBarItemStyle: {
            paddingVertical: IS_PRO_MAX ? 6 : 4,
            paddingHorizontal: IS_IPAD ? 16 : IS_PRO_MAX ? 6 : 4,
            minWidth: IS_IPAD ? 100 : IS_PRO_MAX ? 72 : 64,
          },
          tabBarActiveTintColor: '#2E7D32',
          tabBarInactiveTintColor: '#000000',
          tabBarLabelStyle: {
            fontSize: TAB_LABEL_FONT_SIZE,
            fontWeight: '600',
            marginTop: 4,
            textAlign: 'center',
          },
          tabBarButton: (props) => {
            const focused = props.accessibilityState?.selected;
            return (
              <TouchableOpacity
                {...props}
                style={[
                  props.style,
                  focused && {
                    backgroundColor: 'rgba(46,125,50,0.14)',
                    borderRadius: 20,
                    marginHorizontal: 6,
                    marginVertical: 4,
                  },
                ]}
              />
            );
          },
        }}
      >
                <Tabs.Screen
                  name="(drawer)"
                  options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ focused, color }) => <TabBarIcon activeName="house.fill" inactiveName="house" focused={focused} color={color} />,
                    tabBarLabel: ({ focused, color }) => <TabBarLabel title="Dashboard" focused={focused} color={color} />,
                    tabBarButton: (props) => {
                      const onPress = () => {
                        if (isOnQuranScreen) {
                          router.dismissAll();
                        } else {
                          props.onPress?.();
                        }
                      };
                      const focused = props.accessibilityState?.selected;
                      return (
                        <TouchableOpacity
                          {...props}
                          onPress={onPress}
                          style={[
                            props.style,
                            focused && {
                              backgroundColor: 'rgba(46,125,50,0.14)',
                              borderRadius: 20,
                              marginHorizontal: 6,
                              marginVertical: 4,
                            },
                          ]}
                        />
                      );
                    },
                  }}
                />
                <Tabs.Screen
                  name="hijri-calendar"
                  options={{
                    title: 'Hijri Calendar',
                    tabBarIcon: ({ focused, color }) => <TabBarIcon activeName="calendar.circle.fill" inactiveName="calendar.circle" focused={focused} color={color} />,
                    tabBarLabel: ({ focused, color }) => <TabBarLabel title="Hijri Calendar" focused={focused} color={color} />,
                  }}
                />
                <Tabs.Screen
                  name="mosque-finder"
                  options={{
                    title: 'Mosque Finder',
                    tabBarIcon: ({ focused, color }) => <TabBarIcon activeName="location.fill" inactiveName="location" focused={focused} color={color} />,
                    tabBarLabel: ({ focused, color }) => <TabBarLabel title="Mosque Finder" focused={focused} color={color} />,
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
    <ErrorBoundary>
      <FontLoader>
        <ThemeProvider>
          <PrivacyProvider>
            <LocationProvider>
              <PrayerSettingsProvider>
                <PrayerNotificationProvider>
                  <QuranSettingsProvider>
                    <QuranThemeProvider>
                    <SplashScreenManager>
                      <TrackPlayerRegistration />
                      <TabNavigator />
                    </SplashScreenManager>
                    </QuranThemeProvider>
                  </QuranSettingsProvider>
                </PrayerNotificationProvider>
              </PrayerSettingsProvider>
            </LocationProvider>
          </PrivacyProvider>
        </ThemeProvider>
      </FontLoader>
    </ErrorBoundary>
  );
}