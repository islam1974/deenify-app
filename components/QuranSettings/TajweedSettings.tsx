import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useQuranSettings } from '@/contexts/QuranSettingsContext';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TajweedSettings() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { settings, toggleTajweed } = useQuranSettings();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconSymbol name="paintbrush.fill" size={24} color={colors.tint} />
        <Text style={[styles.title, { color: colors.text }]}>
          Tajweed Colors
        </Text>
      </View>
      
      <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
        <View style={styles.settingLeft}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            Enable Tajweed
          </Text>
          <Text style={[styles.settingDescription, { color: colors.text }]}>
            Color-code Arabic text by recitation rules
          </Text>
        </View>
        <Switch
          value={settings.enableTajweed}
          onValueChange={toggleTajweed}
          trackColor={{ false: '#767577', true: colors.tint + '80' }}
          thumbColor={settings.enableTajweed ? colors.tint : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
        />
      </View>

      {settings.enableTajweed && (
        <View style={[styles.infoBox, { backgroundColor: colors.tint + '15', borderColor: colors.tint + '40' }]}>
          <IconSymbol name="info.circle.fill" size={16} color={colors.tint} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Tap the "Tajweed" button below to see what each color means
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.85,
  },
});

