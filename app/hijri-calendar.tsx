import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import HijriCalendar from '@/components/HijriCalendar';

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
          <IconSymbol name="chevron.left" size={20} color="#2C3E50" />
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
    marginBottom: 2,
  },
  backText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 3,
  },
  headerTitleContainer: {
    alignItems: 'center',
    marginTop: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 1,
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

