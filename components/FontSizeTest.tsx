import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useQuranSettings } from '@/contexts/QuranSettingsContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function FontSizeTest() {
  const colorScheme = useColorScheme();
  const colors = Colors[(((colorScheme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const { settings } = useQuranSettings();

  const getFontSizes = () => {
    switch (settings.fontSize) {
      case 'small':
        return {
          arabic: 20,
          translation: 12,
        };
      case 'medium':
        return {
          arabic: 24,
          translation: 14,
        };
      case 'large':
        return {
          arabic: 28,
          translation: 16,
        };
      case 'extra-large':
        return {
          arabic: 32,
          translation: 18,
        };
      default:
        return {
          arabic: 28,
          translation: 16,
        };
    }
  };

  const fontSizes = getFontSizes();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Font Size Test
        </Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Current Setting: {settings.fontSize.toUpperCase()}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Arabic Text (Current Size)
        </Text>
        <View style={[styles.textContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Text style={[
            styles.arabicText,
            { 
              color: colors.text,
              fontSize: fontSizes.arabic,
              fontFamily: 'NotoNaskhArabic-Regular'
            }
          ]}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </Text>
          <Text style={[styles.sizeLabel, { color: colors.text }]}>
            Size: {fontSizes.arabic}px
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Translation Text (Current Size)
        </Text>
        <View style={[styles.textContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Text style={[
            styles.translationText,
            { 
              color: colors.text,
              fontSize: fontSizes.translation
            }
          ]}>
            In the name of Allah, the Entirely Merciful, the Especially Merciful.
          </Text>
          <Text style={[styles.sizeLabel, { color: colors.text }]}>
            Size: {fontSizes.translation}px
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Size Comparison
        </Text>
        
        {['small', 'medium', 'large', 'extra-large'].map((size) => {
          const testFontSizes = getFontSizes();
          const isCurrentSize = size === settings.fontSize;
          
          return (
            <View 
              key={size}
              style={[
                styles.comparisonContainer, 
                { 
                  backgroundColor: isCurrentSize ? colors.tint + '20' : colors.cardBackground,
                  borderColor: isCurrentSize ? colors.tint : colors.border
                }
              ]}
            >
              <Text style={[styles.comparisonLabel, { color: colors.text }]}>
                {size.toUpperCase()} ({testFontSizes.arabic}px)
              </Text>
              <Text style={[
                styles.comparisonText,
                { 
                  color: colors.text,
                  fontSize: testFontSizes.arabic,
                  fontFamily: 'NotoNaskhArabic-Regular'
                }
              ]}>
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  textContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  arabicText: {
    textAlign: 'center',
    marginBottom: 8,
    direction: 'rtl',
  },
  translationText: {
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  sizeLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  comparisonContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 8,
  },
  comparisonLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  comparisonText: {
    textAlign: 'center',
    direction: 'rtl',
  },
});
