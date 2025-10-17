import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useQuranSettings } from '@/contexts/QuranSettingsContext';

export default function TranslationPlaybackSettings() {
  const colorScheme = useColorScheme();
  const colors = Colors[((colorScheme ?? 'light' as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const { settings, togglePlayTranslation } = useQuranSettings();

  console.log(`🔧 TranslationPlaybackSettings rendered - playTranslation: ${settings.playTranslation}`);

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.header}>
        <IconSymbol name="speaker.wave.2.fill" size={24} color={colors.tint} />
        <Text style={[styles.title, { color: colors.text }]}>Translation Playback</Text>
      </View>
      
      <Text style={[styles.description, { color: colors.secondaryText }]}>
        Play translation audio after Arabic recitation
      </Text>
      
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>
            Auto-play Translation
          </Text>
          <Text style={[styles.settingDescription, { color: colors.secondaryText }]}>
            Automatically play translation in your selected language after each Arabic verse
          </Text>
        </View>
        
        <Switch
          value={settings.playTranslation}
          onValueChange={() => {
            console.log(`🎛️ Switch tapped! Current value: ${settings.playTranslation}`);
            togglePlayTranslation();
          }}
          trackColor={{ false: colors.border, true: colors.tint }}
          thumbColor={settings.playTranslation ? '#fff' : colors.secondaryText}
        />
      </View>
      
      {settings.playTranslation && (
        <View style={[styles.infoBox, { backgroundColor: colors.tint + '20', borderColor: colors.tint }]}>
          <IconSymbol name="info.circle.fill" size={16} color={colors.tint} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Translation will be played in {settings.selectedTranslator} language using Text-to-Speech
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
  infoText: {
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
});
