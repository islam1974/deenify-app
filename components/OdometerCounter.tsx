import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface OdometerCounterProps {
  value: number;
  digitCount?: number;
  fontSize?: number;
  textColor?: string;
}

const OdometerDigit: React.FC<{
  digit: number;
  fontSize: number;
  textColor: string;
}> = ({ digit, fontSize, textColor }) => {
  // Initialize with the current digit value
  const [animatedValue] = useState(() => new Animated.Value(digit));
  const prevDigit = useRef(digit);

  useEffect(() => {
    if (prevDigit.current !== digit) {
      const fromValue = prevDigit.current;
      const toValue = digit;
      
      // Reset to 0 animation (quick)
      if (digit === 0 && prevDigit.current > digit) {
        animatedValue.setValue(fromValue);
        Animated.timing(animatedValue, {
          toValue: 10, // Go past 9 to create rolling effect
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          animatedValue.setValue(0);
          prevDigit.current = 0;
        });
      } 
      // Normal increment animation
      else {
        Animated.spring(animatedValue, {
          toValue: toValue,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }).start();
      }
      
      prevDigit.current = digit;
    }
  }, [digit, animatedValue]);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    outputRange: [0, -fontSize * 1.2, -fontSize * 2.4, -fontSize * 3.6, -fontSize * 4.8, 
                  -fontSize * 6, -fontSize * 7.2, -fontSize * 8.4, -fontSize * 9.6, 
                  -fontSize * 10.8, -fontSize * 12],
  });

  return (
    <View style={[styles.digitContainer, { height: fontSize * 1.2, width: fontSize * 0.8 }]}> 
      <Animated.View style={{ transform: [{ translateY }] }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num, idx) => (
          <Text
            key={idx}
            style={[
              styles.digit,
              { 
                fontSize, 
                color: textColor,
                height: fontSize * 1.2,
                lineHeight: fontSize * 1.2,
              },
            ]}
          >
            {num}
          </Text>
        ))}
      </Animated.View>
      {/* Gloss and inset shadow overlays for odometer window depth */}
      <View pointerEvents="none" style={styles.digitGlossTop} />
      <View pointerEvents="none" style={styles.digitShadowBottom} />
    </View>
  );
};

export const OdometerCounter: React.FC<OdometerCounterProps> = ({
  value,
  digitCount = 4,
  fontSize = 42,
  textColor = '#FFFFFF',
}) => {
  // Show a single zero when value is 0; otherwise respect digitCount padding if provided
  const displayValue = value === 0 ? '0' : (digitCount ? value.toString().padStart(digitCount, '0') : value.toString());
  const digits = displayValue.split('').map(Number);

  return (
    <View style={styles.container}>
      <View style={styles.odometerContainer}>
        {digits.map((digit, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <View
                style={{
                  width: 2,
                  height: fontSize * 1.2,
                  backgroundColor: '#0b0d11',
                  marginHorizontal: 2,
                  borderLeftWidth: StyleSheet.hairlineWidth,
                  borderLeftColor: 'rgba(255,255,255,0.06)',
                  borderRightWidth: StyleSheet.hairlineWidth,
                  borderRightColor: 'rgba(0,0,0,0.6)',
                }}
              />
            )}
            <OdometerDigit
              digit={digit}
              fontSize={fontSize}
              textColor={textColor}
            />
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  odometerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f1115',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#1f2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  digitContainer: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginHorizontal: 2,
    borderRadius: 8,
    backgroundColor: '#0b0d11',
    borderWidth: 1,
    borderTopColor: '#1f2937',
    borderLeftColor: '#1f2937',
    borderRightColor: '#0a0a0a',
    borderBottomColor: '#0a0a0a',
  },
  digit: {
    fontWeight: '900',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  digitGlossTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  digitShadowBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
});

