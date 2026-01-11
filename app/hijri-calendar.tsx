import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import HijriCalendar from '@/components/HijriCalendar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_IPAD = Platform.OS === 'ios' ? Boolean((Platform as any).isPad) : SCREEN_WIDTH >= 768;
const IS_SMALL_PHONE = SCREEN_WIDTH < 380;

export default function HijriCalendarScreen() {
  const { theme } = useTheme();
  const colors = Colors[((theme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#EBF4F5', '#B5C6E0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.headerGradient, { paddingTop: insets.top + 2 }]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={IS_IPAD ? 32 : 24} color="#0B1120" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Hijri Calendar</Text>
          <Text style={styles.headerSubtitle}>التقويم الهجري</Text>
        </View>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.content}>
        <HijriCalendar />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 4,
    paddingHorizontal: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: IS_IPAD ? 6 : 2,
  },
  backText: {
    fontSize: IS_IPAD ? 22 : IS_SMALL_PHONE ? 16 : 18,
    fontFamily: Fonts.secondary,
    fontWeight: '800',
    color: '#0B1120',
    marginLeft: 6,
    letterSpacing: 0.4,
  },
  headerTitleContainer: {
    alignItems: 'center',
    marginTop: 0,
  },
  headerTitle: {
    fontSize: IS_IPAD ? 44 : IS_SMALL_PHONE ? 26 : 32,
    fontFamily: Fonts.secondary,
    fontWeight: '900',
    color: '#0B1120',
    marginBottom: 4,
    letterSpacing: IS_IPAD ? 1.2 : 0.8,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#34495E',
    opacity: 0.8,
    fontFamily: Fonts.primary,
  },
  content: {
    padding: 20,
  },
});

