import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Drawer } from 'expo-router/drawer';
import { Dimensions, Platform, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_IPAD = false; // Set true when deploying on iPad

export default function DrawerLayout() {
  const { theme } = useTheme();
  const colors = Colors[((theme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={({ navigation }) => ({
          drawerActiveBackgroundColor: colors.tint + '30',
          drawerActiveTintColor: '#FFFFFF',
          drawerInactiveTintColor: 'rgba(255,255,255,0.85)',
          drawerStyle: {
            backgroundColor: '#101828',
          },
          sceneContainerStyle: {
            backgroundColor: '#101828',
          },
          headerStyle: {
            backgroundColor: '#101828',
          },
          headerBackground: () => (
            <View style={{ flex: 1, backgroundColor: '#101828' }} />
          ),
          headerTintColor: '#FFFFFF',
          headerLeft: () => (
            navigation.canGoBack() ? (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: IS_IPAD ? 18 : 16,
                  paddingVertical: IS_IPAD ? 10 : 8,
                  marginLeft: IS_IPAD ? -6 : -4,
                  marginTop: IS_IPAD ? -4 : -2,
                  borderRadius: 999,
                  gap: 12,
                  backgroundColor: 'transparent',
                }}
                activeOpacity={0.7}
              >
                <IconSymbol name="chevron.left.circle.fill" size={IS_IPAD ? 44 : 36} color="#FFFFFF" />
                <Text
                  style={{
                    fontSize: IS_IPAD ? 22 : 18,
                    fontWeight: '800',
                    color: '#FFFFFF',
                    letterSpacing: 0.3,
                  }}
                >
                  Back
                </Text>
              </TouchableOpacity>
            ) : null
          ),
          drawerLabelStyle: {
            marginLeft: 0,
            fontSize: IS_IPAD ? 24 : 20,
            fontWeight: '700',
          },
          drawerItemStyle: {
            paddingVertical: 12,
            marginVertical: 4,
          },
        })}
      >
        <Drawer.Screen
          name="(stack)"
          options={{
            title: 'Home',
            drawerLabel: 'Home',
            drawerIcon: ({ color }) => (
              <IconSymbol name="house.fill" size={IS_IPAD ? 36 : 30} color={color} />
            ),
            headerShown: false,
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: 'Settings',
            drawerLabel: 'Settings',
            drawerIcon: ({ color }) => (
              <IconSymbol name="gear" size={IS_IPAD ? 36 : 30} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="ramadan-tracker"
          options={{
            title: 'Ramadan Tracker',
            drawerLabel: 'Ramadan Tracker',
            drawerIcon: ({ color }) => (
              <IconSymbol name="moon.fill" size={IS_IPAD ? 36 : 30} color={color} />
            ),
            headerShown: false,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

