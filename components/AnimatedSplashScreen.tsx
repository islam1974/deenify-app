import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  Extrapolate,
  runOnJS,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const IS_IPAD = width >= 768;

interface AnimatedSplashScreenProps {
  onAnimationFinish: () => void;
}

export default function AnimatedSplashScreen({ onAnimationFinish }: AnimatedSplashScreenProps) {
  const insets = useSafeAreaInsets();
  
  // Animation values
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoRotation = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(50);
  const crescentScale = useSharedValue(0);
  const crescentOpacity = useSharedValue(0);
  const starsOpacity = useSharedValue(0);
  const gradientOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const shimmerOpacity = useSharedValue(0);
  const geometricOpacity = useSharedValue(0);
  const geometricRotation = useSharedValue(0);

  useEffect(() => {
    // Start animations sequence
    const startAnimations = () => {
      // Gradient fade in
      gradientOpacity.value = withTiming(1, { duration: 500 });
      
      // Geometric patterns animation
      geometricOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));
      geometricRotation.value = withRepeat(
        withTiming(360, { duration: 20000, easing: Easing.linear }),
        -1,
        false
      );
      
      // Logo entrance animation
      logoScale.value = withSequence(
        withTiming(0.8, { duration: 800 }),
        withTiming(1, { duration: 300 })
      );
      logoOpacity.value = withTiming(1, { duration: 800 });
      logoRotation.value = withTiming(360, { duration: 1200 });
      
      // Crescent moon animation
      crescentScale.value = withDelay(400, withTiming(1, { duration: 600 }));
      crescentOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
      
      // Stars twinkle animation
      starsOpacity.value = withDelay(800, withTiming(1, { duration: 400 }));
      
      // Pulse animation for logo
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      
      // Shimmer effect
      shimmerOpacity.value = withDelay(1200, withRepeat(
        withSequence(
          withTiming(1, { duration: 800 }),
          withTiming(0, { duration: 800 })
        ),
        2,
        false
      ));
      
      
      // Text animation
      textOpacity.value = withDelay(1000, withTiming(1, { duration: 600 }));
      textTranslateY.value = withDelay(1000, withTiming(0, { duration: 600 }));
      
      // Finish animation after 4 seconds
      setTimeout(() => {
        runOnJS(onAnimationFinish)();
      }, 4000);
    };

    startAnimations();
  }, [onAnimationFinish]);

  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: logoScale.value * pulseScale.value },
        { rotate: `${logoRotation.value}deg` },
      ],
      opacity: logoOpacity.value,
    };
  });

  const logoImageAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
    };
  });

  const shimmerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: shimmerOpacity.value,
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
      transform: [{ translateY: textTranslateY.value }],
    };
  });

  const crescentAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: crescentScale.value }],
      opacity: crescentOpacity.value,
    };
  });

  const starsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: starsOpacity.value,
    };
  });

  const gradientAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: gradientOpacity.value,
    };
  });

  const geometricAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: geometricOpacity.value,
      transform: [{ rotate: `${geometricRotation.value}deg` }],
    };
  });

  // Star component for twinkling effect
  const Star = ({ size, left, top, delay }: { size: number; left: number; top: number; delay: number }) => {
    const starOpacity = useSharedValue(0);
    const starScale = useSharedValue(0);

    useEffect(() => {
      starOpacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
      starScale.value = withDelay(delay, withTiming(1, { duration: 300 }));
    }, [delay]);

    const starAnimatedStyle = useAnimatedStyle(() => {
      return {
        opacity: starOpacity.value,
        transform: [{ scale: starScale.value }],
      };
    });

    return (
      <Animated.View
        style={[
          styles.star,
          {
            width: size,
            height: size,
            left,
            top,
          },
          starAnimatedStyle,
        ]}
      />
    );
  };

  // Geometric pattern component
  const GeometricPattern = () => {
    return (
      <Animated.View style={[styles.geometricPattern, geometricAnimatedStyle]}>
        <View style={styles.geometricShape1} />
        <View style={styles.geometricShape2} />
        <View style={styles.geometricShape3} />
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#07C589" />
      
      {/* Animated gradient background */}
      <Animated.View style={[StyleSheet.absoluteFill, gradientAnimatedStyle]}>
        <LinearGradient
          colors={['#07C589', '#08d89c', '#09ebb0', '#07C589']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Geometric patterns */}
      <GeometricPattern />

      {/* Crescent moon */}
      <Animated.View style={[styles.crescentContainer, crescentAnimatedStyle]}>
        <View style={styles.crescent} />
      </Animated.View>

      {/* Twinkling stars */}
      <Animated.View style={[StyleSheet.absoluteFill, starsAnimatedStyle]}>
        <Star size={4} left={width * 0.2} top={height * 0.15} delay={800} />
        <Star size={6} left={width * 0.8} top={height * 0.2} delay={900} />
        <Star size={3} left={width * 0.15} top={height * 0.3} delay={1000} />
        <Star size={5} left={width * 0.85} top={height * 0.35} delay={1100} />
        <Star size={4} left={width * 0.1} top={height * 0.5} delay={1200} />
        <Star size={6} left={width * 0.9} top={height * 0.55} delay={1300} />
        <Star size={3} left={width * 0.25} top={height * 0.7} delay={1400} />
        <Star size={5} left={width * 0.75} top={height * 0.75} delay={1500} />
      </Animated.View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Logo */}
        <Animated.View style={logoImageAnimatedStyle}>
          <Image
            source={require('@/assets/images/Deenifylogo.png')}
            style={styles.logoImage}
            contentFit="contain"
          />
        </Animated.View>

        {/* App name */}
        <Animated.View style={[textAnimatedStyle, { marginTop: IS_IPAD ? -120 : width <= 375 ? -60 : width < 410 ? -80 : -100 }]}>
          <Text style={styles.appName}>Deenify</Text>
          <Text style={styles.tagline}>Your Islamic Companion</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07C589',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoImage: {
    width: IS_IPAD ? 700 : width <= 375 ? 400 : width < 410 ? 500 : 600,
    height: IS_IPAD ? 700 : width <= 375 ? 400 : width < 410 ? 500 : 600,
    marginBottom: IS_IPAD ? -80 : width <= 375 ? -30 : width < 410 ? -40 : -50,
  },
  appName: {
    fontSize: IS_IPAD ? 120 : width <= 375 ? 60 : width < 410 ? 76 : 100,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 0,
    letterSpacing: IS_IPAD ? 6 : width <= 375 ? 2 : width < 410 ? 3 : 4,
    fontFamily: 'Amiri-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    paddingHorizontal: 10,
  },
  tagline: {
    fontSize: IS_IPAD ? 36 : width <= 375 ? 18 : width < 410 ? 22 : 28,
    color: '#ffffff',
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'CormorantGaramond-Italic',
    letterSpacing: 1,
    marginTop: IS_IPAD ? -15 : width <= 375 ? -5 : width < 410 ? -8 : -10,
    paddingHorizontal: 10,
  },
  crescent: {
    width: width <= 375 ? 60 : 80,
    height: width <= 375 ? 60 : 80,
    borderRadius: width <= 375 ? 30 : 40,
    backgroundColor: '#f4f4f4',
    position: 'relative',
  },
  crescentContainer: {
    position: 'absolute',
    top: height * 0.1,
    right: width * 0.1,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 50,
    shadowColor: '#ffffff',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomDecoration: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  arabicText: {
    fontSize: 18,
    color: '#4a9eff',
    textAlign: 'center',
    fontFamily: 'NotoNaskhArabic-Regular',
    opacity: 0.8,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 60,
  },
  geometricPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  geometricShape1: {
    position: 'absolute',
    top: height * 0.2,
    left: width * 0.1,
    width: width <= 375 ? 40 : 60,
    height: width <= 375 ? 40 : 60,
    borderWidth: 2,
    borderColor: '#4a9eff',
    borderRadius: width <= 375 ? 20 : 30,
    transform: [{ rotate: '45deg' }],
  },
  geometricShape2: {
    position: 'absolute',
    top: height * 0.6,
    right: width * 0.1,
    width: width <= 375 ? 30 : 40,
    height: width <= 375 ? 30 : 40,
    borderWidth: 2,
    borderColor: '#4a9eff',
    borderRadius: width <= 375 ? 15 : 20,
    transform: [{ rotate: '45deg' }],
  },
  geometricShape3: {
    position: 'absolute',
    bottom: height * 0.2,
    left: width * 0.2,
    width: width <= 375 ? 35 : 50,
    height: width <= 375 ? 35 : 50,
    borderWidth: 2,
    borderColor: '#4a9eff',
    borderRadius: width <= 375 ? 17.5 : 25,
    transform: [{ rotate: '45deg' }],
  },
});