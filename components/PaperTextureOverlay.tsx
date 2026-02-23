import React, { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

interface PaperTextureOverlayProps {
  /** When true, fills parent via onLayout (for small containers). Otherwise uses full screen. */
  fillParent?: boolean;
}

/**
 * Subtle paper-like texture overlay for Parchment Classic theme.
 * Uses a fine dot pattern to simulate aged manuscript paper grain.
 */
export default function PaperTextureOverlay({ fillParent = false }: PaperTextureOverlayProps = {}) {
  const { width: winW, height: winH } = useWindowDimensions();
  const [size, setSize] = useState(fillParent ? null : { width: winW, height: winH });

  const width = fillParent ? (size?.width ?? 1) : winW;
  const height = fillParent ? (size?.height ?? 1) : winH;

  const onLayout = (e: LayoutChangeEvent) => {
    if (!fillParent) return;
    const { width: w, height: h } = e.nativeEvent.layout;
    if (w > 0 && h > 0) setSize({ width: w, height: h });
  };

  const patternSize = 8;
  const dotOpacity = 0.035;

  if (fillParent && !size) {
    return <View style={StyleSheet.absoluteFill} onLayout={onLayout} pointerEvents="none" />;
  }

  return (
    <View style={StyleSheet.absoluteFill} onLayout={fillParent ? onLayout : undefined} pointerEvents="none">
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <Pattern
            id="paperGrain"
            width={patternSize}
            height={patternSize}
            patternUnits="userSpaceOnUse"
          >
            {/* Fine grain dots - simulates paper fiber texture */}
            {[
              [1, 1], [5, 2], [2, 5], [6, 6], [3, 3], [7, 1], [1, 6], [4, 4],
              [6, 3], [2, 2], [5, 5], [3, 7], [7, 4], [1, 4], [5, 7], [4, 1],
            ].map(([x, y], i) => (
              <Circle
                key={i}
                cx={x}
                cy={y}
                r={0.5}
                fill={`rgba(44, 36, 22, ${dotOpacity * (0.7 + (i % 3) * 0.2)})`}
              />
            ))}
          </Pattern>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill="url(#paperGrain)" />
      </Svg>
    </View>
  );
}
