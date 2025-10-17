import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AdhanSoundService, AdhanSoundSettings } from '@/services/AdhanSoundService';
import { usePrayerNotifications } from '@/contexts/PrayerNotificationContext';

interface AdhanSoundSettingsProps {
  onClose: () => void;
}

export default function AdhanSoundSettingsComponent({ onClose }: AdhanSoundSettingsProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[((colorScheme ?? 'light' as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const { playAdhanTaster, stopAdhan } = usePrayerNotifications();
  
  console.log('AdhanSoundSettingsComponent rendering...');
  
  const [settings, setSettings] = useState<AdhanSoundSettings>({
    enabled: true,
    volume: 0.8,
    selectedAdhan: 'adhan',
    autoPlay: false,
    prayers: {
      fajr: true,
      dhuhr: true,
      asr: true,
      maghrib: true,
      isha: true,
    },
  });
  
  const [playingTaster, setPlayingTaster] = useState<string | null>(null);

  useEffect(() => {
    console.log('AdhanSoundSettingsComponent useEffect running...');
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      console.log('Loading Adhan settings...');
      const currentSettings = await AdhanSoundService.getSettings();
      console.log('Current settings loaded:', currentSettings);
      // Ensure prayers property exists with default values
      const settingsWithPrayers = {
        ...currentSettings,
        prayers: currentSettings.prayers || {
          fajr: true,
          dhuhr: true,
          asr: true,
          maghrib: true,
          isha: true,
        },
      };
      console.log('Settings with prayers:', settingsWithPrayers);
      setSettings(settingsWithPrayers);
    } catch (error) {
      console.error('Error loading adhan settings:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<AdhanSoundSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await AdhanSoundService.updateSettings(newSettings);
    } catch (error) {
      console.error('Error updating adhan settings:', error);
      Alert.alert('Error', 'Failed to update adhan settings');
    }
  };


  const handlePlayTaster = async (adhanId: string) => {
    try {
      console.log('Starting adhan taster for:', adhanId);
      setPlayingTaster(adhanId);
      
      const success = await playAdhanTaster(adhanId);
      console.log('Adhan taster result:', success);
      
      if (success) {
        console.log('Adhan taster started successfully');
      } else {
        console.log('Adhan taster failed');
        Alert.alert('Error', `Failed to play ${adhanId} adhan. Please check your internet connection.`);
        setPlayingTaster(null);
      }
    } catch (error) {
      console.error('Error playing adhan taster:', error);
      Alert.alert('Error', 'Failed to play adhan taster');
      setPlayingTaster(null);
    }
  };


  const handleVolumeChange = (volume: number) => {
    updateSettings({ volume });
  };

  const handleAdhanSelection = (adhanId: string) => {
    updateSettings({ selectedAdhan: adhanId });
  };

  const handlePrayerToggle = (prayer: keyof typeof settings.prayers) => {
    const currentPrayers = settings.prayers || {
      fajr: true,
      dhuhr: true,
      asr: true,
      maghrib: true,
      isha: true,
    };
    const newPrayers = { ...currentPrayers, [prayer]: !currentPrayers[prayer] };
    updateSettings({ prayers: newPrayers });
  };

  const adhanOptions = AdhanSoundService.getAdhanOptions();

  return (
    <LinearGradient
      colors={['#FFFFFF', '#F8F9FA']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Adhan Sound Settings
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <IconSymbol name="xmark" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Enable/Disable Toggle */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>
              Enable Adhan Sound
            </Text>
            <Text style={[styles.settingDescription, { color: colors.text, opacity: 0.7 }]}>
              Play adhan when prayer time arrives
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.toggle,
              { backgroundColor: settings.enabled ? '#4CAF50' : '#E0E0E0' }
            ]}
            onPress={() => updateSettings({ enabled: !settings.enabled })}
          >
            <View
              style={[
                styles.toggleThumb,
                { transform: [{ translateX: settings.enabled ? 20 : 0 }] }
              ]}
            />
          </TouchableOpacity>
        </View>

        {/* Auto Play Toggle */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>
              Auto Play
            </Text>
            <Text style={[styles.settingDescription, { color: colors.text, opacity: 0.7 }]}>
              Automatically play adhan at prayer time
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.toggle,
              { backgroundColor: settings.autoPlay ? '#4CAF50' : '#E0E0E0' }
            ]}
            onPress={() => updateSettings({ autoPlay: !settings.autoPlay })}
          >
            <View
              style={[
                styles.toggleThumb,
                { transform: [{ translateX: settings.autoPlay ? 20 : 0 }] }
              ]}
            />
          </TouchableOpacity>
        </View>

        {/* Volume Control */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>
              Volume
            </Text>
            <Text style={[styles.settingDescription, { color: colors.text, opacity: 0.7 }]}>
              {Math.round(settings.volume * 100)}%
            </Text>
          </View>
          <View style={styles.volumeContainer}>
            <TouchableOpacity
              onPress={() => handleVolumeChange(Math.max(0, settings.volume - 0.1))}
              style={styles.volumeButton}
            >
              <IconSymbol name="minus" size={16} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.volumeBar}>
              <View
                style={[
                  styles.volumeFill,
                  { width: `${settings.volume * 100}%` }
                ]}
              />
            </View>
            <TouchableOpacity
              onPress={() => handleVolumeChange(Math.min(1, settings.volume + 0.1))}
              style={styles.volumeButton}
            >
              <IconSymbol name="plus" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Adhan Selection */}
        <View style={styles.settingSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Select Adhan Style
          </Text>
          {adhanOptions.map((adhan) => (
            <View key={adhan.id} style={styles.adhanOptionContainer}>
              <TouchableOpacity
                style={[
                  styles.adhanOption,
                  {
                    backgroundColor: settings.selectedAdhan === adhan.id ? '#E3F2FD' : '#F5F5F5',
                    borderColor: settings.selectedAdhan === adhan.id ? '#2196F3' : '#E0E0E0',
                  }
                ]}
                onPress={() => handleAdhanSelection(adhan.id)}
              >
                <View style={styles.adhanInfo}>
                  <Text style={[styles.adhanName, { color: colors.text }]}>
                    {adhan.name}
                  </Text>
                  <Text style={[styles.adhanDescription, { color: colors.text, opacity: 0.7 }]}>
                    {adhan.description}
                  </Text>
                </View>
                {settings.selectedAdhan === adhan.id && (
                  <IconSymbol name="checkmark" size={20} color="#2196F3" />
                )}
              </TouchableOpacity>
              
              {/* Taster Button */}
              <TouchableOpacity
                style={[
                  styles.tasterButton,
                  {
                    backgroundColor: playingTaster === adhan.id ? '#F44336' : '#4CAF50',
                  }
                ]}
                onPress={() => {
                  if (playingTaster === adhan.id) {
                    stopAdhan();
                    setPlayingTaster(null);
                  } else {
                    handlePlayTaster(adhan.id);
                  }
                }}
              >
                <IconSymbol 
                  name={playingTaster === adhan.id ? "stop.fill" : "play.fill"} 
                  size={16} 
                  color="#FFFFFF" 
                />
                <Text style={styles.tasterButtonText}>
                  {playingTaster === adhan.id ? 'Stop' : 'Taster'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Prayer Selection */}
        <View style={styles.settingSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Select Prayers for Adhan
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.text, opacity: 0.7 }]}>
            Choose which prayers you want the Adhan to play for
          </Text>
          
          {Object.entries(settings.prayers || {}).map(([prayer, enabled]) => (
            <View key={prayer} style={styles.prayerOptionContainer}>
              <TouchableOpacity
                style={[
                  styles.prayerOption,
                  {
                    backgroundColor: enabled ? '#E8F5E8' : '#F5F5F5',
                    borderColor: enabled ? '#4CAF50' : '#E0E0E0',
                  }
                ]}
                onPress={() => handlePrayerToggle(prayer as keyof typeof settings.prayers)}
              >
                <View style={styles.prayerInfo}>
                  <Text style={[styles.prayerName, { color: colors.text }]}>
                    {prayer.charAt(0).toUpperCase() + prayer.slice(1)}
                  </Text>
                  <Text style={[styles.prayerDescription, { color: colors.text, opacity: 0.7 }]}>
                    {enabled ? 'Adhan enabled' : 'Adhan disabled'}
                  </Text>
                </View>
                <View style={[
                  styles.checkbox,
                  {
                    backgroundColor: enabled ? '#4CAF50' : '#E0E0E0',
                  }
                ]}>
                  {enabled && (
                    <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 40,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
  },
  volumeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  volumeBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 2,
  },
  settingSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  adhanOptionContainer: {
    marginBottom: 15,
  },
  adhanOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  adhanInfo: {
    flex: 1,
  },
  adhanName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  adhanDescription: {
    fontSize: 14,
  },
  tasterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    minWidth: 80,
    justifyContent: 'center',
  },
  tasterButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 15,
  },
  prayerOptionContainer: {
    marginBottom: 10,
  },
  prayerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
  },
  prayerInfo: {
    flex: 1,
  },
  prayerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  prayerDescription: {
    fontSize: 14,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
