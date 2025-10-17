import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

interface PermissionRequestModalProps {
  visible: boolean;
  onAllow: () => void;
  onDeny: () => void;
}

export default function PermissionRequestModal({
  visible,
  onAllow,
  onDeny,
}: PermissionRequestModalProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      // Add haptic feedback when modal appears
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Exit animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleAllow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAllow();
  };

  const handleDeny = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDeny();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['#0A0A0A', '#1A1A1A', '#2A2A2A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientContainer}
          >
            {/* Notification Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <IconSymbol name="bell.fill" size={40} color="#00FF88" />
              </View>
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
              <Text style={styles.title}>PRAYER NOTIFICATIONS</Text>
              <Text style={styles.subtitle}>إشعارات الصلاة</Text>
              
              <Text style={styles.description}>
                Deenify would like to send you prayer time notifications to help you stay connected with your daily prayers.
              </Text>

              <View style={styles.benefitsContainer}>
                <View style={styles.benefitItem}>
                  <IconSymbol name="clock.fill" size={16} color="#00CCFF" />
                  <Text style={styles.benefitText}>Get notified 5 minutes before each prayer</Text>
                </View>
                <View style={styles.benefitItem}>
                  <IconSymbol name="moon.stars.fill" size={16} color="#00CCFF" />
                  <Text style={styles.benefitText}>Beautiful popup with prayer information</Text>
                </View>
                <View style={styles.benefitItem}>
                  <IconSymbol name="speaker.wave.2.fill" size={16} color="#00CCFF" />
                  <Text style={styles.benefitText}>Optional adhan sound notifications</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.denyButton}
                onPress={handleDeny}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(255, 107, 107, 0.2)', 'rgba(255, 107, 107, 0.1)']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.denyButtonText}>DON'T ALLOW</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.allowButton}
                onPress={handleAllow}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#00FF88', '#00CC6A']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.allowButtonText}>ALLOW</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <Text style={styles.footerText}>
              You can change this setting anytime in Settings
            </Text>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: screenWidth * 0.9,
    maxWidth: 400,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#00FF88',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  gradientContainer: {
    padding: 30,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderWidth: 3,
    borderColor: '#00FF88',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00FF88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 15,
  },
  contentContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    fontFamily: Fonts.roboto,
    color: '#00FF88',
    marginBottom: 5,
    textShadowColor: '#00FF88',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Fonts.primary,
    color: '#00CCFF',
    marginBottom: 20,
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
    marginBottom: 25,
    opacity: 0.9,
  },
  benefitsContainer: {
    width: '100%',
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 14,
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
    marginBottom: 15,
  },
  denyButton: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
  },
  allowButton: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  denyButtonText: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: Fonts.secondary,
    color: '#FF6B6B',
    letterSpacing: 1,
    textShadowColor: '#FF6B6B',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  allowButtonText: {
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
