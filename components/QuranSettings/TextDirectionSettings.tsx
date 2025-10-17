import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useQuranSettings, TextDirection } from '@/contexts/QuranSettingsContext';

const directionOptions = [
  { 
    value: 'rtl' as TextDirection, 
    label: 'Right to Left', 
    icon: 'arrow.right',
    description: 'Traditional Arabic reading direction',
    example: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'
  },
  { 
    value: 'ltr' as TextDirection, 
    label: 'Left to Right', 
    icon: 'arrow.left',
    description: 'Modern reading direction',
    example: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'
  },
];

export default function TextDirectionSettings() {
  const colorScheme = useColorScheme();
  const colors = Colors[((colorScheme ?? 'light' as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const { settings, updateTextDirection } = useQuranSettings();

  const handleDirectionSelect = (direction: TextDirection) => {
    updateTextDirection(direction);
    Alert.alert(
      'Text Direction Updated',
      `Arabic text direction has been set to ${directionOptions.find(opt => opt.value === direction)?.label}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Text Direction Settings
        </Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Choose how Arabic text is displayed
        </Text>
      </View>

      <View style={styles.previewSection}>
        <Text style={[styles.previewTitle, { color: colors.text }]}>
          Current Preview:
        </Text>
        <View style={[styles.previewContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[
            styles.previewText,
            { 
              color: colors.text,
              textAlign: settings.textDirection === 'rtl' ? 'right' : 'left',
              direction: settings.textDirection
            }
          ]}>
            {directionOptions.find(opt => opt.value === settings.textDirection)?.example}
          </Text>
          <Text style={[styles.previewTranslation, { color: colors.text }]}>
            In the name of Allah, the Entirely Merciful, the Especially Merciful.
          </Text>
        </View>
      </View>

      <View style={styles.optionsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Select Text Direction:
        </Text>
        
        {directionOptions.map((option, index) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionItem,
              { 
                borderColor: colors.border,
                backgroundColor: settings.textDirection === option.value ? colors.tint + '20' : colors.background
              }
            ]}
            onPress={() => handleDirectionSelect(option.value)}
            activeOpacity={0.7}
          >
            <View style={styles.optionLeft}>
              <View style={[
                styles.optionIcon,
                { backgroundColor: settings.textDirection === option.value ? colors.tint : colors.border }
              ]}>
                <IconSymbol 
                  name={option.icon as any} 
                  size={20} 
                  color={settings.textDirection === option.value ? colors.background : colors.text} 
                />
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
                  {option.description}
                </Text>
              </View>
            </View>
            
            {settings.textDirection === option.value && (
              <IconSymbol name="checkmark.circle.fill" size={24} color={colors.tint} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoSection}>
        <View style={[styles.infoCard, { backgroundColor: colors.tint + '10', borderColor: colors.tint }]}>
          <IconSymbol name="info.circle.fill" size={20} color={colors.tint} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Right to Left (RTL) is the traditional Arabic reading direction and is recommended for the best reading experience.
          </Text>
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
  },
  previewText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
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
  infoSection: {
    padding: 20,
    paddingTop: 0,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
    lineHeight: 20,
  },
});
