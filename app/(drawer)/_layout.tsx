import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/theme';

export default function DrawerLayout() {
  const { theme } = useTheme();
  const colors = Colors[((theme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
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
          drawerLabelStyle: {
            marginLeft: 0,
            fontSize: 18,
            fontWeight: '600',
          },
          drawerItemStyle: {
            paddingVertical: 12,
            marginVertical: 4,
          },
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: 'Home',
            drawerLabel: 'Home',
            drawerIcon: ({ color }) => (
              <IconSymbol name="house.fill" size={26} color={color} />
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
              <IconSymbol name="gear" size={26} color={color} />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

