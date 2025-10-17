import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

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
            top: insets.top + 50, // Add safe area padding + extra space
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
    height: height / 2.2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
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
    top: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1C40F',
    shadowColor: '#F1C40F',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 25, // Increased glow radius
    shadowOpacity: 1, // Maximum glow
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8, // Android shadow
  },
  crescentText: {
    fontSize: 24,
  },
  textContainer: {
    alignItems: 'center',
    zIndex: 10,
  },
  heroText: {
    fontSize: 44,
    fontFamily: 'CormorantGaramond-Bold',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 24,
    fontFamily: 'CormorantGaramond-SemiBold',
    textAlign: 'center',
    opacity: 0.9,
    letterSpacing: 0.5,
  },
});

export default AnimatedHeroMessage;
