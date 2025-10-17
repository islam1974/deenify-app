import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useQuranSettings, Reciter } from '@/contexts/QuranSettingsContext';

export default function ReciterSettings() {
  const colorScheme = useColorScheme();
  const colors = Colors[((colorScheme ?? 'light' as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const { settings, updateReciter, getReciterOptions } = useQuranSettings();
  const reciterOptions = getReciterOptions();

  const handleReciterSelect = (reciterId: Reciter) => {
    const selectedReciter = reciterOptions.find(r => r.id === reciterId);
    updateReciter(reciterId);
    Alert.alert(
      'Reciter Updated',
      `Audio recitation has been set to ${selectedReciter?.name}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Choose Reciter
        </Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Select your preferred Quran reciter
        </Text>
      </View>

      <View style={styles.currentSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Currently Selected:
        </Text>
        {(() => {
          const currentReciter = reciterOptions.find(r => r.id === settings.selectedReciter);
          return currentReciter && (
            <View style={[styles.currentCard, { backgroundColor: colors.tint + '20', borderColor: colors.tint }]}>
              <View style={styles.currentHeader}>
                <View style={[styles.playButton, { backgroundColor: colors.tint }]}>
                  <IconSymbol name="play.fill" size={16} color={colors.background} />
                </View>
                <View style={styles.currentInfo}>
                  <Text style={[styles.currentName, { color: colors.text }]}>
                    {currentReciter.name}
                  </Text>
                  <Text style={[styles.currentArabicName, { color: colors.text }]}>
                    {currentReciter.arabicName}
                  </Text>
                </View>
              </View>
              <Text style={[styles.currentDescription, { color: colors.text }]}>
                {currentReciter.description}
              </Text>
            </View>
          );
        })()}
      </View>

      <View style={styles.optionsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Available Reciters:
        </Text>
        
        {reciterOptions.map((reciter, index) => (
          <TouchableOpacity
            key={reciter.id}
            style={[
              styles.reciterItem,
              { 
                borderColor: colors.border,
                backgroundColor: settings.selectedReciter === reciter.id ? colors.tint + '20' : colors.background
              }
            ]}
            onPress={() => handleReciterSelect(reciter.id)}
            activeOpacity={0.7}
          >
            <View style={styles.reciterLeft}>
              <View style={[
                styles.reciterIcon,
                { backgroundColor: settings.selectedReciter === reciter.id ? colors.tint : colors.border }
              ]}>
                <IconSymbol 
                  name="person.wave.2.fill" 
                  size={20} 
                  color={settings.selectedReciter === reciter.id ? colors.background : colors.text} 
                />
              </View>
              <View style={styles.reciterText}>
                <Text style={[
                  styles.reciterName,
                  { color: colors.text }
                ]}>
                  {reciter.name}
                </Text>
                <Text style={[
                  styles.reciterArabicName,
                  { color: colors.text }
                ]}>
                  {reciter.arabicName}
                </Text>
                <Text style={[
                  styles.reciterDescription,
                  { color: colors.text }
                ]}>
                  {reciter.description}
                </Text>
              </View>
            </View>
            
            {settings.selectedReciter === reciter.id && (
              <IconSymbol name="checkmark.circle.fill" size={24} color={colors.tint} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoSection}>
        <View style={[styles.infoCard, { backgroundColor: colors.tint + '10', borderColor: colors.tint }]}>
          <IconSymbol name="info.circle.fill" size={20} color={colors.tint} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            The selected reciter will be used for all audio playback in the Quran section. Each reciter has their own unique style and pronunciation.
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
  playButton: {
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
  currentArabicName: {
    fontSize: 14,
    opacity: 0.8,
  },
  currentDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  optionsSection: {
    padding: 20,
    paddingTop: 0,
  },
  reciterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  reciterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reciterIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reciterText: {
    flex: 1,
  },
  reciterName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  reciterArabicName: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 2,
  },
  reciterDescription: {
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
