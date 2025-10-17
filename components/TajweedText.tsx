import React, { useMemo } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import TajweedService, { TajweedSegment } from '@/services/TajweedService';

interface TajweedTextProps {
  text: string;
  style?: any;
  isDarkMode?: boolean;
  enableTajweed?: boolean;
}

function TajweedText({ 
  text, 
  style, 
  isDarkMode = false,
  enableTajweed = true 
}: TajweedTextProps) {
  
  // Memoize the parsed segments to avoid re-parsing on every render
  const segments: TajweedSegment[] = useMemo(() => {
    if (!enableTajweed) {
      return [];
    }
    return TajweedService.parseTajweed(text, isDarkMode);
  }, [text, isDarkMode, enableTajweed]);

  if (!enableTajweed) {
    // Return plain text if Tajweed is disabled
    return <Text style={style}>{text}</Text>;
  }

  return (
    <Text style={style}>
      {segments.map((segment, index) => (
        <Text
          key={index}
          style={{ color: segment.color }}
        >
          {segment.text}
        </Text>
      ))}
    </Text>
  );
}

// Memoize the entire component to prevent unnecessary re-renders
export default React.memo(TajweedText);

const styles = StyleSheet.create({
  // Styles are passed from parent component
});

