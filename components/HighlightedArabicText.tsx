import React, { useMemo } from 'react';
import { Text } from 'react-native';
import TajweedService, { TajweedSegment } from '@/services/TajweedService';

interface HighlightedArabicTextProps {
  text: string;
  style?: any;
  isDarkMode?: boolean;
  enableTajweed?: boolean;
  isPlaying?: boolean;
  audioPosition?: number; // Current position in milliseconds
  audioDuration?: number; // Total duration in milliseconds
  highlightColor?: string;
  normalColor?: string;
}

/**
 * Splits Arabic text into words, handling Arabic word boundaries correctly
 */
function splitArabicWords(text: string): string[] {
  // Split by spaces and Arabic punctuation, but keep them for proper rendering
  const parts = text.match(/([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\w]+|\s+|[،؛؟])/g) || [];
  return parts;
}

function HighlightedArabicText({
  text,
  style,
  isDarkMode = false,
  enableTajweed = true,
  isPlaying = false,
  audioPosition = 0,
  audioDuration = 0,
  highlightColor = '#4CAF50',
  normalColor,
}: HighlightedArabicTextProps) {
  
  // Split text into words (non-space parts)
  const words = useMemo(() => {
    const parts = splitArabicWords(text);
    return parts.filter(part => part.trim().length > 0 && !/[،؛؟]/.test(part));
  }, [text]);
  
  // Calculate which word should be highlighted
  const highlightedWordIndex = useMemo(() => {
    if (!isPlaying || audioDuration === 0 || words.length === 0) {
      return -1;
    }
    
    // Calculate base progress
    const baseProgress = audioPosition / audioDuration;
    
    // Add offset to compensate for lag (300ms + 25% ahead)
    const offsetMs = 300;
    const offsetPercent = 0.25;
    
    const adjustedPosition = audioPosition + offsetMs + (audioDuration * offsetPercent);
    const progress = Math.min(adjustedPosition / audioDuration, 1);
    
    const wordIndex = Math.ceil(progress * words.length);
    
    return Math.min(wordIndex, words.length - 1);
  }, [isPlaying, audioPosition, audioDuration, words.length]);
  
  // Parse Tajweed if enabled
  const tajweedSegments = useMemo(() => {
    if (!enableTajweed) {
      return null;
    }
    return TajweedService.parseTajweed(text, isDarkMode);
  }, [text, isDarkMode, enableTajweed]);
  
  // If not playing, render normally with Tajweed
  if (!isPlaying || audioDuration === 0) {
    if (!enableTajweed) {
      return <Text style={style}>{text}</Text>;
    }
    
    return (
      <Text style={style}>
        {tajweedSegments?.map((segment, index) => (
          <Text key={index} style={{ color: segment.color }}>
            {segment.text}
          </Text>
        ))}
      </Text>
    );
  }
  
  // Render with word-by-word highlighting
  const renderHighlightedText = () => {
    const elements: React.ReactNode[] = [];
    const regex = /([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\w]+|\s+|[،؛؟])/g;
    const parts = text.match(regex) || [text];
    let wordCount = 0;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isWord = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\w]/.test(part);
      const isHighlighted = isWord && wordCount === highlightedWordIndex;
      
      if (isWord) {
        const baseColor = normalColor || style?.color || '#FFFFFF';
        const wordColor = isHighlighted ? highlightColor : baseColor;
        
        let finalColor = wordColor;
        if (enableTajweed && tajweedSegments && !isHighlighted) {
          for (const segment of tajweedSegments) {
            if (segment.text.includes(part) || part.includes(segment.text)) {
              finalColor = segment.color;
              break;
            }
          }
        }
        
        elements.push(
          <Text 
            key={`part-${i}`} 
            style={{ 
              color: finalColor,
              backgroundColor: isHighlighted ? highlightColor + '40' : 'transparent',
              fontWeight: isHighlighted ? '900' : (style?.fontWeight || 'normal'),
            }}
          >
            {part}
          </Text>
        );
        wordCount++;
      } else {
        elements.push(
          <Text key={`part-${i}`} style={{ color: normalColor || style?.color || '#FFFFFF' }}>
            {part}
          </Text>
        );
      }
    }
    
    return elements;
  };
  
  return (
    <Text style={style}>
      {renderHighlightedText()}
    </Text>
  );
}

export default HighlightedArabicText;
