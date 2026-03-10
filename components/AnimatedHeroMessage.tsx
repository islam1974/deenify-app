import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const IS_IPAD = Platform.OS === 'ios' && (Platform.isPad === true || width >= 768);
const IS_IPAD_MINI = IS_IPAD && Math.min(width, height) <= 800; // iPad mini (~744pt portrait)
const IS_IPAD_11 = IS_IPAD && Math.min(width, height) <= 900 && !IS_IPAD_MINI; // 11-inch iPad (834pt portrait)
const IS_SMALL_PHONE = !IS_IPAD && width < 400;
const IS_LARGE_PHONE = !IS_IPAD && width >= 414;
const IS_PRO_MAX = !IS_IPAD && width >= 430;
const IS_IPHONE_16_PRO = !IS_IPAD && width >= 390 && width < 428; // iPhone 16 Pro range (390-427px)

const AnimatedHeroMessage = () => {
  const { theme } = useTheme();
  const colors = Colors[((theme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const insets = useSafeAreaInsets();
  
  // Fallback for theme errors
  if (!theme || !colors) {
    return (
      <View style={styles.container}>
        <Text style={styles.heroText}>Welcome to Deenify</Text>
        <Text style={styles.subtitle}>Your companion in faith</Text>
      </View>
    );
  }
  
  // Animation values
  const glowAnim = useRef(new Animated.Value(0.8)).current;
  const starAnimations = useRef(
    Array.from({ length: 35 }, () => new Animated.Value(0))
  ).current;
  const crescentGlow = useRef(new Animated.Value(0.3)).current;
  const textScale = useRef(new Animated.Value(0.9)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  // Generate random star positions - memoized to prevent regeneration
  const stars = useMemo(() => 
    Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      left: Math.random() * width,
      top: Math.random() * (height / 2),
      size: Math.random() * 4 + 2, // Increased size range
      delay: Math.random() * 2000,
      brightness: Math.random() * 0.8 + 0.2, // Add brightness variation
    })), []
  );

  useEffect(() => {
    let isMounted = true;
    
    // Main glow animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Crescent glow animation
    const crescentAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(crescentGlow, {
          toValue: 0.8,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(crescentGlow, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    // Text entrance animation
    const textAnimation = Animated.parallel([
      Animated.timing(textScale, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);

    // Star twinkling animations
    const starAnimationsArray = stars.map((star, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(star.delay),
          Animated.timing(starAnimations[index], {
            toValue: star.brightness, // Use individual brightness
            duration: 600, // Faster twinkling
            useNativeDriver: true,
          }),
          Animated.timing(starAnimations[index], {
            toValue: star.brightness * 0.2, // Brighter minimum
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
    });

    // Start all animations only if component is still mounted
    if (isMounted) {
      glowAnimation.start();
      crescentAnimation.start();
      textAnimation.start();
      starAnimationsArray.forEach((anim: Animated.CompositeAnimation) => anim.start());
    }

    return () => {
      isMounted = false;
      glowAnimation.stop();
      crescentAnimation.stop();
      textAnimation.stop();
      starAnimationsArray.forEach((anim: Animated.CompositeAnimation) => anim.stop());
    };
  }, [stars, glowAnim, crescentGlow, textScale, textOpacity, starAnimations]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Background Stars */}
      {stars && stars.map((star, index) => (
        <Animated.View
          key={`star-${star.id}`}
          style={[
            styles.star,
            {
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              borderRadius: star.size / 2,
              opacity: starAnimations[index] || 0,
              shadowOpacity: starAnimations[index] || 0,
            },
          ]}
        />
      ))}

      {/* Glowing Crescent Moon */}
      <Animated.View
        style={[
          styles.crescentMoon,
          {
            top: insets.top + (IS_IPAD_MINI ? 8 : IS_IPAD_11 ? 12 : IS_IPAD ? 24 : 16),
            opacity: crescentGlow,
            shadowOpacity: crescentGlow,
            transform: [{ scale: glowAnim }],
          },
        ]}
      >
        <Text style={styles.crescentText}>🌙</Text>
      </Animated.View>

      {/* Main Hero Message */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            transform: [{ scale: textScale }],
            opacity: textOpacity,
            marginTop: IS_IPAD_MINI ? 36 : IS_IPAD_11 ? 24 : IS_IPAD ? -10 : IS_PRO_MAX ? -12 : IS_LARGE_PHONE ? -14 : -18,
          },
        ]}
      >
        <Text style={[styles.heroText, { color: colors.text }]}>
          Welcome to Deenify
        </Text>
        <Text style={[styles.subtitle, { 
          color: colors.text,
          textShadowColor: 'rgba(0, 0, 0, 0.5)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 3,
        }]}>
          Your companion in faith
        </Text>
      </Animated.View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: IS_IPAD_MINI ? height / 2 : IS_IPAD_11 ? height / 2.2 : IS_IPAD ? height / 2.8 : IS_SMALL_PHONE ? height / 3 : IS_LARGE_PHONE ? height / 2.8 : height / 2.5,
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    paddingTop: IS_IPAD_MINI ? 40 : IS_IPAD_11 ? 60 : IS_IPAD ? 100 : IS_SMALL_PHONE ? 45 : IS_LARGE_PHONE ? 55 : 60,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#fff',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1, // Maximum glow
    shadowRadius: 10, // Increased glow radius
    elevation: 6, // Android shadow
  },
  crescentMoon: {
    position: 'absolute',
    top: IS_IPAD_MINI ? 28 : IS_IPAD_11 ? 36 : IS_IPAD ? 60 : 40,
    width: IS_IPAD_MINI ? 48 : IS_IPAD_11 ? 72 : IS_IPAD ? 100 : IS_SMALL_PHONE ? 50 : IS_PRO_MAX ? 66 : 60,
    height: IS_IPAD_MINI ? 48 : IS_IPAD_11 ? 72 : IS_IPAD ? 100 : IS_SMALL_PHONE ? 50 : IS_PRO_MAX ? 66 : 60,
    borderRadius: IS_IPAD_MINI ? 24 : IS_IPAD_11 ? 36 : IS_IPAD ? 50 : IS_SMALL_PHONE ? 25 : IS_PRO_MAX ? 33 : 30,
    backgroundColor: '#F1C40F',
    shadowColor: '#F1C40F',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: IS_IPAD_MINI ? 20 : IS_IPAD_11 ? 30 : IS_IPAD ? 40 : IS_SMALL_PHONE ? 20 : IS_PRO_MAX ? 28 : 25,
    shadowOpacity: 1,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  crescentText: {
    fontSize: IS_IPAD_MINI ? 22 : IS_IPAD_11 ? 34 : IS_IPAD ? 44 : IS_SMALL_PHONE ? 20 : IS_PRO_MAX ? 26 : 24,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    paddingHorizontal: IS_IPAD_MINI ? 28 : IS_IPAD_11 ? 32 : 0,
    maxWidth: IS_IPAD_MINI ? width * 0.92 : IS_IPAD_11 ? width * 0.9 : undefined,
  },
  heroText: {
    fontSize: IS_IPAD_MINI ? 60 : IS_IPAD_11 ? 74 : IS_IPAD ? 88 : IS_SMALL_PHONE ? 36 : IS_PRO_MAX ? 44 : IS_IPHONE_16_PRO ? 38 : IS_LARGE_PHONE ? 44 : 52,
    fontFamily: 'CormorantGaramond-Bold',
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: IS_IPAD_MINI ? 10 : IS_IPAD_11 ? 8 : IS_IPAD ? 4 : IS_PRO_MAX ? 6 : IS_LARGE_PHONE ? 6 : 8,
    letterSpacing: IS_IPAD_MINI ? 0.5 : IS_IPAD_11 ? 1 : IS_IPAD ? 2 : 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    paddingHorizontal: IS_IPAD_MINI ? 20 : IS_IPAD_11 ? 24 : IS_SMALL_PHONE ? 20 : 0,
  },
  subtitle: {
    fontSize: IS_IPAD_MINI ? 26 : IS_IPAD_11 ? 30 : IS_IPAD ? 36 : IS_SMALL_PHONE ? 18 : IS_PRO_MAX ? 22 : IS_LARGE_PHONE ? 22 : 24,
    fontFamily: 'CormorantGaramond-SemiBold',
    textAlign: 'center',
    opacity: 0.9,
    letterSpacing: 0.5,
    paddingHorizontal: IS_IPAD_MINI ? 20 : IS_IPAD_11 ? 24 : IS_SMALL_PHONE ? 20 : 0,
    marginTop: IS_IPAD_MINI ? 8 : IS_IPAD_11 ? 6 : IS_IPAD ? 4 : IS_PRO_MAX ? 5 : IS_LARGE_PHONE ? 4 : 2,
  },
});

export default AnimatedHeroMessage;
