import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TouchableOpacity, Text } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/theme';
import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_IPAD = Platform.OS === 'ios' ? Boolean((Platform as any).isPad) : SCREEN_WIDTH >= 768;

export default function DrawerLayout() {
  const { theme } = useTheme();
  const colors = Colors[((theme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={({ navigation }) => ({
          drawerActiveBackgroundColor: colors.tint + '20',
          drawerActiveTintColor: colors.tint,
          drawerInactiveTintColor: colors.text,
          drawerStyle: {
            backgroundColor: colors.background,
          },
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
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
                <IconSymbol name="chevron.left.circle.fill" size={IS_IPAD ? 40 : 32} color={colors.text} />
                <Text
                  style={{
                    fontSize: IS_IPAD ? 22 : 18,
                    fontWeight: '800',
                    color: colors.text,
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
          name="index"
          options={{
            title: 'Home',
            drawerLabel: 'Home',
            drawerIcon: ({ color }) => (
              <IconSymbol name="house.fill" size={IS_IPAD ? 32 : 28} color={color} />
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
              <IconSymbol name="gear" size={IS_IPAD ? 32 : 28} color={color} />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

