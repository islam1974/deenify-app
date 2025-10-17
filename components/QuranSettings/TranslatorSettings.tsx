import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useQuranSettings, Translator } from '@/contexts/QuranSettingsContext';

export default function TranslatorSettings() {
  const colorScheme = useColorScheme();
  const colors = Colors[((colorScheme ?? 'light' as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const { settings, updateTranslator, getTranslatorOptions } = useQuranSettings();
  const translatorOptions = getTranslatorOptions();

  const handleTranslatorSelect = (translatorId: Translator) => {
    const selectedTranslator = translatorOptions.find(t => t.id === translatorId);
    updateTranslator(translatorId);
    Alert.alert(
      'Translator Updated',
      `Translation has been set to ${selectedTranslator?.name}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Choose Translator
        </Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Select your preferred English translation
        </Text>
      </View>

      <View style={styles.currentSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Currently Selected:
        </Text>
        {(() => {
          const currentTranslator = translatorOptions.find(t => t.id === settings.selectedTranslator);
          return currentTranslator && (
            <View style={[styles.currentCard, { backgroundColor: colors.tint + '20', borderColor: colors.tint }]}>
              <View style={styles.currentHeader}>
                <View style={[styles.translateIcon, { backgroundColor: colors.tint }]}>
                  <IconSymbol name="globe" size={16} color={colors.background} />
                </View>
                <View style={styles.currentInfo}>
                  <Text style={[styles.currentName, { color: colors.text }]}>
                    {currentTranslator.name}
                  </Text>
                  <Text style={[styles.currentLanguage, { color: colors.text }]}>
                    {currentTranslator.language}
                  </Text>
                </View>
              </View>
              <Text style={[styles.currentDescription, { color: colors.text }]}>
                {currentTranslator.description}
              </Text>
            </View>
          );
        })()}
      </View>

      <View style={styles.previewSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Translation Preview:
        </Text>
        <View style={[styles.previewContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.arabicText, { color: colors.text }]}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </Text>
          <Text style={[styles.translationText, { color: colors.text }]}>
            In the name of Allah, the Entirely Merciful, the Especially Merciful.
          </Text>
          <Text style={[styles.translatorLabel, { color: colors.text }]}>
            — {translatorOptions.find(t => t.id === settings.selectedTranslator)?.name}
          </Text>
        </View>
      </View>

      <View style={styles.optionsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Available Translations:
        </Text>
        
        {translatorOptions.map((translator, index) => (
          <TouchableOpacity
            key={translator.id}
            style={[
              styles.translatorItem,
              { 
                borderColor: colors.border,
                backgroundColor: settings.selectedTranslator === translator.id ? colors.tint + '20' : colors.background
              }
            ]}
            onPress={() => handleTranslatorSelect(translator.id)}
            activeOpacity={0.7}
          >
            <View style={styles.translatorLeft}>
              <View style={[
                styles.translatorIcon,
                { backgroundColor: settings.selectedTranslator === translator.id ? colors.tint : colors.border }
              ]}>
                <IconSymbol 
                  name="book.fill" 
                  size={20} 
                  color={settings.selectedTranslator === translator.id ? colors.background : colors.text} 
                />
              </View>
              <View style={styles.translatorText}>
                <Text style={[
                  styles.translatorName,
                  { color: colors.text }
                ]}>
                  {translator.name}
                </Text>
                <Text style={[
                  styles.translatorLanguage,
                  { color: colors.text }
                ]}>
                  {translator.language}
                </Text>
                <Text style={[
                  styles.translatorDescription,
                  { color: colors.text }
                ]}>
                  {translator.description}
                </Text>
              </View>
            </View>
            
            {settings.selectedTranslator === translator.id && (
              <IconSymbol name="checkmark.circle.fill" size={24} color={colors.tint} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoSection}>
        <View style={[styles.infoCard, { backgroundColor: colors.tint + '10', borderColor: colors.tint }]}>
          <IconSymbol name="info.circle.fill" size={20} color={colors.tint} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Each translation offers a unique perspective and style. You can change the translator at any time, and the new translation will be applied immediately.
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
  currentSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  currentCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  currentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  translateIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  currentInfo: {
    flex: 1,
  },
  currentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  currentLanguage: {
    fontSize: 14,
    opacity: 0.8,
  },
  currentDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  previewSection: {
    padding: 20,
    paddingTop: 0,
  },
  previewContainer: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  arabicText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 12,
    lineHeight: 32,
  },
  translationText: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
    lineHeight: 20,
  },
  translatorLabel: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  optionsSection: {
    padding: 20,
    paddingTop: 0,
  },
  translatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  translatorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  translatorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  translatorText: {
    flex: 1,
  },
  translatorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  translatorLanguage: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 2,
  },
  translatorDescription: {
    fontSize: 12,
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
