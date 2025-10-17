import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useQuranSettings, QuranFont } from '@/contexts/QuranSettingsContext';

interface QuranReaderProps {
  ayah: string;
  verseNumber?: number;
  translation?: string;
  onPlay?: () => void;
  isPlaying?: boolean;
}

export default function QuranReader({ 
  ayah, 
  verseNumber, 
  translation, 
  onPlay, 
  isPlaying = false 
}: QuranReaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[(((colorScheme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const { settings, updateFont, getFontOptions } = useQuranSettings();
  const [showFontPicker, setShowFontPicker] = useState(false);
  
  const fontOptions = getFontOptions();
  const currentFont = fontOptions.find(f => f.id === settings.selectedFont);
  const fontFamily = currentFont?.fontFamily || 'NotoNaskhArabic-Regular';

  // Get dynamic font sizes based on settings
  const getFontSizes = () => {
    const baseLineHeightArabic = 40;
    const baseLineHeightTranslation = 24;
    
    switch (settings.fontSize) {
      case 'small':
        return {
          arabic: 20,
          translation: 12,
          lineHeightArabic: baseLineHeightArabic * (20/24),
          lineHeightTranslation: baseLineHeightTranslation * (12/16),
        };
      case 'medium':
        return {
          arabic: 24,
          translation: 14,
          lineHeightArabic: baseLineHeightArabic,
          lineHeightTranslation: baseLineHeightTranslation * (14/16),
        };
      case 'large':
        return {
          arabic: 28,
          translation: 16,
          lineHeightArabic: baseLineHeightArabic * (28/24),
          lineHeightTranslation: baseLineHeightTranslation,
        };
      case 'extra-large':
        return {
          arabic: 32,
          translation: 18,
          lineHeightArabic: baseLineHeightArabic * (32/24),
          lineHeightTranslation: baseLineHeightTranslation * (18/16),
        };
      default:
        return {
          arabic: 24,
          translation: 16,
          lineHeightArabic: baseLineHeightArabic,
          lineHeightTranslation: baseLineHeightTranslation,
        };
    }
  };

  const fontSizes = getFontSizes();

  const handleFontSelect = (font: QuranFont) => {
    updateFont(font);
    setShowFontPicker(false);
  };

  return (
    <View style={styles.container}>
      {/* Font Picker Button */}
      <TouchableOpacity 
        style={[styles.fontButton, { backgroundColor: colors.tint }]}
        onPress={() => setShowFontPicker(true)}
        activeOpacity={0.8}
      >
        <IconSymbol name="textformat" size={16} color="white" />
        <Text style={styles.fontButtonText}>
          {currentFont?.name || 'Font'}
        </Text>
        <IconSymbol name="chevron.down" size={12} color="white" />
      </TouchableOpacity>

      {/* Verse Content */}
      <View style={[styles.verseContainer, { backgroundColor: colors.background }]}>
        {verseNumber && (
          <View style={[styles.verseNumberContainer, { backgroundColor: colors.tint }]}>
            <Text style={styles.verseNumberText}>{verseNumber}</Text>
          </View>
        )}
        
        <Text style={[
          styles.arabicText,
          { 
            color: colors.text,
            fontFamily: fontFamily,
            fontSize: fontSizes.arabic,
            lineHeight: fontSizes.lineHeightArabic
          }
        ]}>
          {ayah}
        </Text>
        
        {translation && (
          <Text style={[
            styles.translationText, 
            { 
              color: colors.text,
              fontSize: fontSizes.translation,
              lineHeight: fontSizes.lineHeightTranslation
            }
          ]}>
            {translation}
          </Text>
        )}
        
        {onPlay && (
          <TouchableOpacity 
            style={[styles.playButton, { backgroundColor: colors.tint }]}
            onPress={onPlay}
            activeOpacity={0.8}
          >
            <IconSymbol 
              name={isPlaying ? "pause.fill" : "play.fill"} 
              size={20} 
              color="white" 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Font Picker Modal */}
      <Modal
        visible={showFontPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFontPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select Font
              </Text>
              <TouchableOpacity 
                onPress={() => setShowFontPicker(false)}
                style={styles.closeButton}
              >
                <IconSymbol name="xmark" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.fontList}>
              {fontOptions.map((font) => (
                <TouchableOpacity
                  key={font.id}
                  style={[
                    styles.fontOption,
                    { 
                      backgroundColor: settings.selectedFont === font.id ? colors.tint + '20' : 'transparent',
                      borderColor: colors.border
                    }
                  ]}
                  onPress={() => handleFontSelect(font.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.fontOptionLeft}>
                    <View style={[
                      styles.fontPreview,
                      { borderColor: colors.border }
                    ]}>
                      <Text style={[
                        styles.fontPreviewText,
                        { 
                          fontFamily: font.fontFamily,
                          color: colors.text,
                          fontSize: fontSizes.arabic * 0.6 // Smaller preview size
                        }
                      ]}>
                        بِسْمِ اللَّهِ
                      </Text>
                    </View>
                    <View style={styles.fontInfo}>
                      <Text style={[styles.fontName, { color: colors.text }]}>
                        {font.name}
                      </Text>
                      <Text style={[styles.fontDescription, { color: colors.text }]}>
                        {font.description}
                      </Text>
                    </View>
                  </View>
                  
                  {settings.selectedFont === font.id && (
                    <IconSymbol name="checkmark.circle.fill" size={24} color={colors.tint} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fontButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  fontButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
  },
  verseContainer: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    position: 'relative',
  },
  verseNumberContainer: {
    position: 'absolute',
    top: -10,
    right: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  arabicText: {
    fontSize: 24,
    lineHeight: 40,
    textAlign: 'right',
    direction: 'rtl',
    marginBottom: 12,
  },
  translationText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
    opacity: 0.8,
    marginBottom: 16,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  fontList: {
    maxHeight: 400,
  },
  fontOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  fontOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fontPreview: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  fontPreviewText: {
    fontSize: 16,
    textAlign: 'center',
  },
  fontInfo: {
    flex: 1,
  },
  fontName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  fontDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
});
