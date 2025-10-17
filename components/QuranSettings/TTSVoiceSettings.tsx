import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import TranslationTTS, { TTSVoice } from '@/services/TranslationTTS';

export default function TTSVoiceSettings() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [voices, setVoices] = useState<TTSVoice[]>([]);
  const [maleVoices, setMaleVoices] = useState<TTSVoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    try {
      setIsLoading(true);
      const [allVoices, maleVoicesList] = await Promise.all([
        TranslationTTS.getAvailableVoices(),
        TranslationTTS.getMaleVoices()
      ]);
      
      setVoices(allVoices);
      setMaleVoices(maleVoicesList);
      
      console.log(`🔊 Loaded ${allVoices.length} total voices, ${maleVoicesList.length} male voices`);
      
      // Get current selected voice
      const currentVoice = TranslationTTS.getSelectedVoice();
      console.log(`🔊 Current selected voice: ${currentVoice}`);
      
      // If no voice is selected and male voices are available, auto-select the first male voice
      if (!currentVoice && maleVoicesList.length > 0) {
        const firstMaleVoice = maleVoicesList[0];
        console.log(`🔊 Auto-selecting first male voice: ${firstMaleVoice.name}`);
        await TranslationTTS.setVoice(firstMaleVoice.id);
        setSelectedVoice(firstMaleVoice.id);
      } else if (currentVoice) {
        setSelectedVoice(currentVoice);
      }
    } catch (error) {
      console.error('❌ Error loading voices:', error);
      Alert.alert('Error', 'Failed to load available voices');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceSelect = async (voice: TTSVoice) => {
    try {
      await TranslationTTS.setVoice(voice.id);
      setSelectedVoice(voice.id);
      console.log(`🔊 Selected voice: ${voice.name} (${voice.gender})`);
    } catch (error) {
      console.error('❌ Error selecting voice:', error);
      Alert.alert('Error', 'Failed to set voice');
    }
  };

  const renderVoiceItem = (voice: TTSVoice) => {
    const isSelected = selectedVoice === voice.id;
    const isMale = voice.gender === 'male';
    
    return (
      <TouchableOpacity
        key={voice.id}
        style={[
          styles.voiceItem,
          {
            backgroundColor: isSelected ? colors.tint + '20' : colors.background,
            borderColor: isSelected ? colors.tint : colors.border,
          }
        ]}
        onPress={() => handleVoiceSelect(voice)}
        activeOpacity={0.7}
      >
        <View style={styles.voiceInfo}>
          <Text style={[
            styles.voiceName,
            { 
              color: isSelected ? colors.tint : colors.text,
              fontWeight: isSelected ? '700' : '500'
            }
          ]}>
            {voice.name}
          </Text>
          <View style={styles.voiceDetails}>
            <Text style={[styles.voiceDetail, { color: colors.text }]}>
              {voice.language} • {voice.quality}
            </Text>
            {isMale && (
              <View style={[styles.maleBadge, { backgroundColor: '#4CAF50' }]}>
                <Text style={styles.maleBadgeText}>Male</Text>
              </View>
            )}
          </View>
        </View>
        
        {isSelected && (
          <IconSymbol name="checkmark.circle.fill" size={24} color={colors.tint} />
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading available voices...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={true}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <IconSymbol name="speaker.wave.2.fill" size={24} color={colors.tint} />
        <Text style={[styles.title, { color: colors.text }]}>
          TTS Voice Settings
        </Text>
      </View>

      <View style={[styles.infoBox, { backgroundColor: colors.tint + '20', borderColor: colors.tint }]}>
        <IconSymbol name="info.circle.fill" size={16} color={colors.tint} />
        <Text style={[styles.infoText, { color: colors.text }]}>
          Choose a voice for translation text-to-speech. Male voices are recommended for Quranic recitation.
        </Text>
      </View>

      {/* Male Voices Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <IconSymbol name="person.fill" size={18} color="#4CAF50" />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Male Voices ({maleVoices.length})
          </Text>
        </View>
        
        {maleVoices.length > 0 ? (
          maleVoices.map(renderVoiceItem)
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No male voices available
            </Text>
          </View>
        )}
      </View>

      {/* All Voices Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <IconSymbol name="person.2.fill" size={18} color={colors.tint} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            All Voices ({voices.length})
          </Text>
        </View>
        
        {voices.length > 0 ? (
          voices.map(renderVoiceItem)
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No voices available
            </Text>
          </View>
        )}
      </View>
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
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
    marginBottom: 4,
  },
  voiceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceDetail: {
    fontSize: 12,
    opacity: 0.7,
  },
  maleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  maleBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  emptyState: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    opacity: 0.7,
  },
});
