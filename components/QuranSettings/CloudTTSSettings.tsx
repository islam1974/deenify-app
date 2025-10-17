import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import CloudTTS, { CloudTTSProvider, CloudTTSVoice } from '@/services/CloudTTS';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLOUD_TTS_CONFIG_KEY = '@deenify_cloud_tts_config';

interface CloudTTSConfig {
  enabled: boolean;
  provider: CloudTTSProvider;
  apiKey: string;
  voice: string;
}

export default function CloudTTSSettings() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [config, setConfig] = useState<CloudTTSConfig>({
    enabled: false,
    provider: 'system',
    apiKey: '',
    voice: '',
  });
  
  const [availableVoices, setAvailableVoices] = useState<CloudTTSVoice[]>([]);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    // Update available voices when provider changes
    if (config.provider !== 'system') {
      const voices = CloudTTS.getAvailableMaleVoices(config.provider);
      setAvailableVoices(voices);
      
      // Auto-select first voice if none selected
      if (!config.voice && voices.length > 0) {
        setConfig(prev => ({ ...prev, voice: voices[0].id }));
      }
    }
  }, [config.provider]);

  const loadConfig = async () => {
    try {
      const saved = await AsyncStorage.getItem(CLOUD_TTS_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setConfig(parsed);
        
        // Apply configuration to CloudTTS service
        if (parsed.enabled && parsed.provider !== 'system') {
          CloudTTS.configure({
            provider: parsed.provider,
            apiKey: parsed.apiKey,
            voice: parsed.voice,
          });
        }
      }
    } catch (error) {
      console.error('Error loading Cloud TTS config:', error);
    }
  };

  const saveConfig = async (newConfig: CloudTTSConfig) => {
    try {
      await AsyncStorage.setItem(CLOUD_TTS_CONFIG_KEY, JSON.stringify(newConfig));
      setConfig(newConfig);
      
      // Apply configuration to CloudTTS service
      if (newConfig.enabled && newConfig.provider !== 'system') {
        CloudTTS.configure({
          provider: newConfig.provider,
          apiKey: newConfig.apiKey,
          voice: newConfig.voice,
        });
      } else {
        // Use system TTS
        CloudTTS.configure({ provider: 'system' });
      }
      
      console.log('✅ Cloud TTS config saved');
    } catch (error) {
      console.error('❌ Error saving Cloud TTS config:', error);
      Alert.alert('Error', 'Failed to save configuration');
    }
  };

  const testVoice = async () => {
    if (!config.enabled || !config.apiKey) {
      Alert.alert('Error', 'Please enable Cloud TTS and enter an API key');
      return;
    }

    setIsTestingVoice(true);
    
    try {
      await CloudTTS.speak(
        'In the name of Allah, the Most Gracious, the Most Merciful. This is a test of the text-to-speech voice.',
        {
          onStart: () => console.log('Test started'),
          onDone: () => {
            setIsTestingVoice(false);
            Alert.alert('Success', 'Voice test completed!');
          },
          onError: (error) => {
            setIsTestingVoice(false);
            Alert.alert('Error', `Voice test failed: ${error.message}`);
          },
        }
      );
    } catch (error: any) {
      setIsTestingVoice(false);
      Alert.alert('Error', `Voice test failed: ${error.message}`);
    }
  };

  const renderProviderCard = (provider: CloudTTSProvider, name: string, description: string, isFree: boolean) => {
    const isSelected = config.provider === provider;
    
    return (
      <TouchableOpacity
        key={provider}
        style={[
          styles.providerCard,
          {
            backgroundColor: isSelected ? colors.tint + '20' : colors.background,
            borderColor: isSelected ? colors.tint : colors.border,
          },
        ]}
        onPress={() => setConfig(prev => ({ ...prev, provider }))}
        activeOpacity={0.7}
      >
        <View style={styles.providerHeader}>
          <View style={styles.providerInfo}>
            <Text style={[styles.providerName, { color: isSelected ? colors.tint : colors.text }]}>
              {name}
            </Text>
            {isFree && (
              <View style={[styles.freeBadge, { backgroundColor: '#4CAF50' }]}>
                <Text style={styles.freeBadgeText}>Free</Text>
              </View>
            )}
          </View>
          {isSelected && (
            <IconSymbol name="checkmark.circle.fill" size={24} color={colors.tint} />
          )}
        </View>
        <Text style={[styles.providerDescription, { color: colors.text }]}>
          {description}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={true}
    >
      <View style={styles.header}>
        <IconSymbol name="cloud" size={24} color={colors.tint} />
        <Text style={[styles.title, { color: colors.text }]}>
          Cloud TTS Settings
        </Text>
      </View>

      <View style={[styles.infoBox, { backgroundColor: colors.tint + '20', borderColor: colors.tint }]}>
        <IconSymbol name="info.circle.fill" size={16} color={colors.tint} />
        <Text style={[styles.infoText, { color: colors.text }]}>
          Use professional cloud-based Text-to-Speech for more natural-sounding male voices. System TTS is free but cloud providers offer better quality.
        </Text>
      </View>

      {/* Enable/Disable Toggle */}
      <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            Enable Cloud TTS
          </Text>
          <Text style={[styles.settingDescription, { color: colors.text }]}>
            Use cloud API for better voice quality
          </Text>
        </View>
        <Switch
          value={config.enabled}
          onValueChange={(value) => {
            const newConfig = { ...config, enabled: value };
            saveConfig(newConfig);
          }}
          trackColor={{ false: colors.border, true: colors.tint + '80' }}
          thumbColor={config.enabled ? colors.tint : colors.text + '40'}
        />
      </View>

      {/* Provider Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Select Provider
        </Text>
        
        {renderProviderCard(
          'system',
          'System TTS (Built-in)',
          'Use device\'s built-in text-to-speech. No API key required.',
          true
        )}
        
        {renderProviderCard(
          'google',
          'Google Cloud TTS',
          'High-quality neural voices. Free tier: 1M characters/month.',
          true
        )}
        
        {renderProviderCard(
          'openai',
          'OpenAI TTS',
          'Natural-sounding voices. Requires OpenAI API key (paid).',
          false
        )}
        
        {renderProviderCard(
          'elevenlabs',
          'ElevenLabs',
          'Premium quality voices. Best for professional use (paid).',
          false
        )}
      </View>

      {/* API Key Input (only for cloud providers) */}
      {config.provider !== 'system' && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            API Configuration
          </Text>
          
          <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <IconSymbol name="key.fill" size={20} color={colors.text + '80'} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder={`Enter ${config.provider.toUpperCase()} API Key`}
              placeholderTextColor={colors.text + '60'}
              value={config.apiKey}
              onChangeText={(apiKey) => setConfig(prev => ({ ...prev, apiKey }))}
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.tint }]}
            onPress={() => saveConfig(config)}
            activeOpacity={0.7}
          >
            <IconSymbol name="checkmark.circle.fill" size={20} color="white" />
            <Text style={styles.saveButtonText}>Save Configuration</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Voice Selection */}
      {config.provider !== 'system' && availableVoices.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Select Voice ({availableVoices.length} available)
          </Text>
          
          {availableVoices.map((voice) => (
            <TouchableOpacity
              key={voice.id}
              style={[
                styles.voiceItem,
                {
                  backgroundColor: config.voice === voice.id ? colors.tint + '20' : colors.background,
                  borderColor: config.voice === voice.id ? colors.tint : colors.border,
                },
              ]}
              onPress={() => setConfig(prev => ({ ...prev, voice: voice.id }))}
              activeOpacity={0.7}
            >
              <View style={styles.voiceInfo}>
                <Text style={[
                  styles.voiceName,
                  { color: config.voice === voice.id ? colors.tint : colors.text }
                ]}>
                  {voice.name}
                </Text>
                <Text style={[styles.voiceDescription, { color: colors.text }]}>
                  {voice.description}
                </Text>
              </View>
              {config.voice === voice.id && (
                <IconSymbol name="checkmark.circle.fill" size={24} color={colors.tint} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Test Voice Button */}
      {config.enabled && config.apiKey && (
        <TouchableOpacity
          style={[
            styles.testButton,
            { backgroundColor: colors.tint },
            isTestingVoice && styles.testButtonDisabled,
          ]}
          onPress={testVoice}
          disabled={isTestingVoice}
          activeOpacity={0.7}
        >
          <IconSymbol 
            name={isTestingVoice ? "waveform" : "speaker.wave.2.fill"} 
            size={20} 
            color="white" 
          />
          <Text style={styles.testButtonText}>
            {isTestingVoice ? 'Playing Test...' : 'Test Voice'}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    marginBottom: 24,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
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
  providerCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  freeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  freeBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  providerDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  voiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  voiceInfo: {
    flex: 1,
  },
  voiceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  voiceDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

