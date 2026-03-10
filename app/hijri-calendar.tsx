import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import HijriCalendar from '@/components/HijriCalendar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_IPAD = Platform.OS === 'ios' && (Platform.isPad === true || SCREEN_WIDTH >= 768);
const IS_SMALL_PHONE = SCREEN_WIDTH < 380;

export default function HijriCalendarScreen() {
  const { theme } = useTheme();
  const colors = Colors[((theme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, IS_IPAD && styles.headerIpad, { paddingTop: insets.top + 2, backgroundColor: colors.background }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={IS_IPAD ? 36 : 28} color={colors.text} />
          <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Hijri Calendar</Text>
          <Text style={[styles.headerSubtitle, IS_IPAD && styles.headerSubtitleIpad, { color: colors.secondaryText }]}>التقويم الهجري</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={[styles.content, IS_IPAD && styles.contentIpad]}>
        <HijriCalendar />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 4,
    paddingHorizontal: 10,
  },
  headerIpad: {
    paddingBottom: 12,
    paddingHorizontal: 28,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: IS_IPAD ? 6 : 2,
    marginTop: 16,
  },
  backText: {
    fontSize: IS_IPAD ? 24 : IS_SMALL_PHONE ? 17 : 20,
    fontFamily: Fonts.secondary,
    fontWeight: '800',
    marginLeft: 8,
    letterSpacing: 0.4,
  },
  headerTitleContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  headerTitle: {
    fontSize: IS_IPAD ? 44 : IS_SMALL_PHONE ? 26 : 32,
    fontFamily: Fonts.secondary,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: IS_IPAD ? 1.2 : 0.8,
  },
  headerSubtitle: {
    fontSize: 20,
    opacity: 0.8,
    fontFamily: Fonts.primary,
  },
  content: {
    padding: 20,
  },
  contentIpad: {
    padding: 32,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  headerSubtitleIpad: {
    fontSize: 26,
  },
});

