import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useQuranSettings, FontSize } from '@/contexts/QuranSettingsContext';

const fontSizeOptions = [
  { value: 'small' as FontSize, label: 'Small', size: 20, description: 'Compact reading' },
  { value: 'medium' as FontSize, label: 'Medium', size: 24, description: 'Standard reading' },
  { value: 'large' as FontSize, label: 'Large', size: 26, description: 'Easy reading' },
  { value: 'extra-large' as FontSize, label: 'Extra Large', size: 28, description: 'Accessible reading' },
];

export default function FontSizeSettings() {
  const colorScheme = useColorScheme();
  const colors = Colors[(((colorScheme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const { settings, updateFontSize } = useQuranSettings();

  const handleFontSizeSelect = (fontSize: FontSize) => {
    updateFontSize(fontSize);
    Alert.alert(
      'Font Size Updated',
      `Arabic text font size has been set to ${fontSizeOptions.find(opt => opt.value === fontSize)?.label}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Font Size Settings
        </Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Choose your preferred Arabic text size
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
              fontSize: fontSizeOptions.find(opt => opt.value === settings.fontSize)?.size || 24
            }
          ]}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </Text>
          <Text style={[styles.previewTranslation, { color: colors.text }]}>
            In the name of Allah, the Entirely Merciful, the Especially Merciful.
          </Text>
        </View>
      </View>

      <View style={styles.optionsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Select Font Size:
        </Text>
        
        {fontSizeOptions.map((option, index) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionItem,
              { 
                borderColor: colors.border,
                backgroundColor: settings.fontSize === option.value ? colors.tint + '20' : colors.background
              }
            ]}
            onPress={() => handleFontSizeSelect(option.value)}
            activeOpacity={0.7}
          >
            <View style={styles.optionLeft}>
              <View style={[
                styles.optionIcon,
                { backgroundColor: settings.fontSize === option.value ? colors.tint : colors.border }
              ]}>
                <Text style={[
                  styles.optionIconText,
                  { color: settings.fontSize === option.value ? colors.background : colors.text }
                ]}>
                  A
                </Text>
              </View>
              <View style={styles.optionText}>
                <Text style={[
                  styles.optionLabel,
                  { color: colors.text }
                ]}>
                  {option.label}
                </Text>
                <Text style={[
                  styles.optionDescription,
                  { color: colors.text }
                ]}>
                  {option.description} ({option.size}px)
                </Text>
              </View>
            </View>
            
            {settings.fontSize === option.value && (
              <IconSymbol name="checkmark.circle.fill" size={24} color={colors.tint} />
            )}
          </TouchableOpacity>
        ))}
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
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  previewSection: {
    padding: 20,
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
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  previewTranslation: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  optionsSection: {
    padding: 20,
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
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionIconText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
});
