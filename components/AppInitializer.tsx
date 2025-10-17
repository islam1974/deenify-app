import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { usePrayerNotifications } from '@/contexts/PrayerNotificationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const PERMISSION_REQUESTED_KEY = 'prayerNotificationPermissionRequested';

export default function AppInitializer() {
  const { showPermissionModal } = usePrayerNotifications();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    checkAndShowPermissionRequest();
  }, []);

  const checkAndShowPermissionRequest = async () => {
    try {
      // Check if we've already requested permission
      const permissionRequested = await AsyncStorage.getItem(PERMISSION_REQUESTED_KEY);
      
      if (!permissionRequested) {
        // Show welcome screen first, then permission modal
        setShowWelcome(true);
      }
    } catch (error) {
      console.error('Error checking permission status:', error);
    }
  };

  const handleGetStarted = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Mark that we've requested permission
      await AsyncStorage.setItem(PERMISSION_REQUESTED_KEY, 'true');
      
      setShowWelcome(false);
      
      // Show permission modal after a short delay
      setTimeout(() => {
        showPermissionModal();
      }, 500);
    } catch (error) {
      console.error('Error handling get started:', error);
    }
  };

  const handleSkip = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Mark that we've requested permission (user chose to skip)
      await AsyncStorage.setItem(PERMISSION_REQUESTED_KEY, 'true');
      
      setShowWelcome(false);
    } catch (error) {
      console.error('Error handling skip:', error);
    }
  };

  if (!showWelcome) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <LinearGradient
        colors={['#0A0A0A', '#1A1A1A', '#2A2A2A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/* App Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBackground}>
            <IconSymbol name="moon.stars.fill" size={60} color="#00FF88" />
          </View>
        </View>

        {/* Welcome Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>WELCOME TO DEENIFY</Text>
          <Text style={styles.subtitle}>مرحباً بك في دينيفاي</Text>
          
          <Text style={styles.description}>
            Your personal Islamic companion for prayer times, Quran reading, and spiritual guidance.
          </Text>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <IconSymbol name="clock.fill" size={20} color="#00CCFF" />
              <Text style={styles.featureText}>Accurate Prayer Times</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol name="book.fill" size={20} color="#00CCFF" />
              <Text style={styles.featureText}>Quran Reading</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol name="bell.fill" size={20} color="#00CCFF" />
              <Text style={styles.featureText}>Prayer Notifications</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255, 107, 107, 0.2)', 'rgba(255, 107, 107, 0.1)']}
              style={styles.buttonGradient}
            >
              <Text style={styles.skipButtonText}>SKIP FOR NOW</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#00FF88', '#00CC6A']}
              style={styles.buttonGradient}
            >
              <Text style={styles.getStartedButtonText}>GET STARTED</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          Enable notifications to never miss your prayer times
        </Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 1000,
  },
  container: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 25,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#00FF88',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderWidth: 4,
    borderColor: '#00FF88',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00FF88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  contentContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    fontFamily: Fonts.roboto,
    color: '#00FF88',
    marginBottom: 8,
    textShadowColor: '#00FF88',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Fonts.primary,
    color: '#00CCFF',
    marginBottom: 25,
    textShadowColor: '#00CCFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.secondary,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    opacity: 0.9,
  },
  featuresContainer: {
    width: '100%',
    gap: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.secondary,
    color: '#FFFFFF',
    flex: 1,
    opacity: 0.9,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
    marginBottom: 20,
  },
  skipButton: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
  },
  getStartedButton: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: Fonts.secondary,
    color: '#FF6B6B',
    letterSpacing: 1,
    textShadowColor: '#FF6B6B',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  getStartedButtonText: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: Fonts.secondary,
    color: '#000000',
    letterSpacing: 1,
    textShadowColor: '#000000',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: Fonts.secondary,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.6,
  },
});
