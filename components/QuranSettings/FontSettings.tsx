import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useQuranSettings, QuranFont } from '@/contexts/QuranSettingsContext';

export default function FontSettings() {
  const colorScheme = useColorScheme();
  const colors = Colors[(((colorScheme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const { settings, updateFont, getFontOptions } = useQuranSettings();

  const fontOptions = getFontOptions();

  const handleFontSelect = (font: QuranFont) => {
    updateFont(font);
    const selectedFont = fontOptions.find(opt => opt.id === font);
    Alert.alert(
      'Font Updated',
      `Quran text font has been set to ${selectedFont?.name}`,
      [{ text: 'OK' }]
    );
  };

  const getPreviewText = () => {
    return 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
  };

  const getSelectedFontFamily = () => {
    const selectedFont = fontOptions.find(opt => opt.id === settings.selectedFont);
    return selectedFont?.fontFamily || 'NotoNaskhArabic-Regular';
  };

  const getFontSizeForPreview = () => {
    switch (settings.fontSize) {
      case 'small': return 20;
      case 'medium': return 24;
      case 'large': return 30;
      case 'extra-large': return 36;
      default: return 30;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Quran Font Settings
        </Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Choose your preferred Arabic font for Quran text
        </Text>
      </View>

      <View style={styles.previewSection}>
        <Text style={[styles.previewTitle, { color: colors.text }]}>
          Preview:
        </Text>
        <View style={[styles.previewContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[
            styles.previewText,
            { 
              color: colors.text,
              fontFamily: getSelectedFontFamily(),
              fontSize: getFontSizeForPreview()
            }
          ]}>
            {getPreviewText()}
          </Text>
          <Text style={[styles.previewTranslation, { color: colors.text }]}>
            In the name of Allah, the Entirely Merciful, the Especially Merciful.
          </Text>
        </View>
      </View>

      <View style={styles.optionsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Select Font:
        </Text>
        
        {fontOptions.map((option, index) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionItem,
              { 
                borderColor: colors.border,
                backgroundColor: settings.selectedFont === option.id ? colors.tint + '20' : colors.background
              }
            ]}
            onPress={() => handleFontSelect(option.id)}
            activeOpacity={0.7}
          >
            <View style={styles.optionLeft}>
              <View style={[
                styles.optionIcon,
                { backgroundColor: settings.selectedFont === option.id ? colors.tint : colors.border }
              ]}>
                <Text style={[
                  styles.optionIconText,
                  { 
                    color: settings.selectedFont === option.id ? colors.background : colors.text,
                    fontFamily: option.fontFamily
                  }
                ]}>
                  ب
                </Text>
              </View>
              <View style={styles.optionText}>
                <Text style={[
                  styles.optionLabel,
                  { color: colors.text }
                ]}>
                  {option.name}
                </Text>
                <Text style={[
                  styles.optionDescription,
                  { color: colors.text }
                ]}>
                  {option.description}
                </Text>
              </View>
            </View>
            
            {settings.selectedFont === option.id && (
              <IconSymbol name="checkmark.circle.fill" size={24} color={colors.tint} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoSection}>
        <View style={[styles.infoCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <IconSymbol name="info.circle" size={20} color={colors.tint} />
          <View style={styles.infoText}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              Font Information
            </Text>
            <Text style={[styles.infoDescription, { color: colors.text }]}>
              Experience the Quran with authentic Arabic fonts. Choose from traditional Madinah Mushaf style, Indo-Pak Nastaliq scripts, or modern digital optimized fonts for your reading preference.
            </Text>
          </View>
        </View>
        
        <View style={[styles.warningCard, { backgroundColor: colors.tint + '10', borderColor: colors.tint + '30' }]}>
          <IconSymbol name="exclamationmark.triangle" size={20} color={colors.tint} />
          <View style={styles.infoText}>
            <Text style={[styles.warningTitle, { color: colors.tint }]}>
              Font Features
            </Text>
            <Text style={[styles.warningDescription, { color: colors.text }]}>
              Choose from 8 authentic Quran fonts including Uthmani HAFS (Madinah Mushaf), Indo-Pak styles (Me Quran, PDMS Saleem, Al Qalam), and modern options (Amiri, Scheherazade, Vazeh).
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 22,
  },
  previewSection: {
    padding: 20,
    paddingTop: 10,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  previewContainer: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  previewText: {
    fontSize: 28,
    lineHeight: 44,
    textAlign: 'center',
    marginBottom: 12,
    direction: 'rtl',
  },
  previewTranslation: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    opacity: 0.8,
    fontStyle: 'italic',
  },
  optionsSection: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionIconText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  infoSection: {
    padding: 20,
    paddingTop: 10,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  warningCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'flex-start',
    marginTop: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  warningDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
});
