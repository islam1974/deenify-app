import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { usePrayerSettings, Madhab } from '@/contexts/PrayerSettingsContext';
import * as Haptics from 'expo-haptics';

export default function MadhabSettings() {
  const { settings, updateSettings, getMadhabInfo } = usePrayerSettings();
  const [modalVisible, setModalVisible] = useState(false);

  const madhabs: Madhab[] = ['Standard', 'Hanafi'];

  const handleMadhabSelect = async (madhab: Madhab) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await updateSettings({ madhab });
      setModalVisible(false);
    } catch (error) {
      console.error('Error updating madhab:', error);
    }
  };

  const currentMadhabInfo = getMadhabInfo(settings.madhab);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MADHAB (JURISTIC METHOD)</Text>
        <Text style={styles.subtitle}>المذهب الفقهي</Text>
        <Text style={styles.description}>
          Choose the juristic method for calculating Asr prayer time. This affects when Asr prayer begins.
        </Text>
      </View>

      <View style={styles.currentMadhabContainer}>
        <Text style={styles.currentMadhabLabel}>CURRENT MADHAB</Text>
        <View style={styles.currentMadhabCard}>
          <LinearGradient
            colors={['rgba(0, 255, 136, 0.1)', 'rgba(0, 255, 136, 0.05)']}
            style={styles.currentMadhabGradient}
          >
            <View style={styles.currentMadhabContent}>
              <IconSymbol name="book.fill" size={24} color="#00FF88" />
              <View style={styles.currentMadhabText}>
                <Text style={styles.currentMadhabName}>{currentMadhabInfo.name}</Text>
                <Text style={styles.currentMadhabDescription}>{currentMadhabInfo.description}</Text>
                <Text style={styles.currentMadhabMethod}>{currentMadhabInfo.asrMethod}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>

      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setModalVisible(true);
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#00FF88', '#00CC6A']}
          style={styles.selectButtonGradient}
        >
          <Text style={styles.selectButtonText}>SELECT MADHAB</Text>
          <IconSymbol name="chevron.right" size={16} color="#000000" />
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <View style={styles.infoCard}>
          <IconSymbol name="info.circle.fill" size={20} color="#00CCFF" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>About Madhabs</Text>
            <Text style={styles.infoDescription}>
              Different Islamic schools of thought have varying opinions on when Asr prayer begins. 
              Choose the method that aligns with your practice.
            </Text>
          </View>
        </View>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>SELECT MADHAB</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setModalVisible(false);
              }}
            >
              <IconSymbol name="xmark" size={24} color="#00FF88" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.madhabsList} showsVerticalScrollIndicator={false}>
            {madhabs.map((madhab) => {
              const madhabInfo = getMadhabInfo(madhab);
              const isSelected = madhab === settings.madhab;

              return (
                <TouchableOpacity
                  key={madhab}
                  style={[
                    styles.madhabCard,
                    isSelected && styles.selectedMadhabCard,
                  ]}
                  onPress={() => handleMadhabSelect(madhab)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      isSelected
                        ? ['rgba(0, 255, 136, 0.2)', 'rgba(0, 255, 136, 0.1)']
                        : ['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.1)']
                    }
                    style={styles.madhabCardGradient}
                  >
                    <View style={styles.madhabContent}>
                      <View style={styles.madhabInfo}>
                        <Text style={[
                          styles.madhabName,
                          isSelected && styles.selectedMadhabName
                        ]}>
                          {madhabInfo.name}
                        </Text>
                        <Text style={[
                          styles.madhabDescription,
                          isSelected && styles.selectedMadhabDescription
                        ]}>
                          {madhabInfo.description}
                        </Text>
                        <Text style={[
                          styles.madhabMethod,
                          isSelected && styles.selectedMadhabMethod
                        ]}>
                          {madhabInfo.asrMethod}
                        </Text>
                      </View>
                      {isSelected && (
                        <View style={styles.selectedIndicator}>
                          <IconSymbol name="checkmark.circle.fill" size={20} color="#00FF88" />
                        </View>
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    fontFamily: Fonts.roboto,
    color: '#00FF88',
    marginBottom: 8,
    textShadowColor: '#00FF88',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Fonts.primary,
    color: '#00CCFF',
    marginBottom: 15,
    textShadowColor: '#00CCFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.secondary,
    color: '#FFFFFF',
    lineHeight: 24,
    opacity: 0.9,
  },
  currentMadhabContainer: {
    marginBottom: 30,
  },
  currentMadhabLabel: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: Fonts.secondary,
    color: '#00FF88',
    marginBottom: 10,
    letterSpacing: 1,
  },
  currentMadhabCard: {
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#00FF88',
  },
  currentMadhabGradient: {
    padding: 20,
  },
  currentMadhabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  currentMadhabText: {
    flex: 1,
  },
  currentMadhabName: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: Fonts.secondary,
    color: '#00FF88',
    marginBottom: 4,
    textShadowColor: '#00FF88',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  currentMadhabDescription: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Fonts.secondary,
    color: '#FFFFFF',
    marginBottom: 4,
    opacity: 0.8,
  },
  currentMadhabMethod: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Fonts.secondary,
    color: '#00CCFF',
    opacity: 0.9,
  },
  selectButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  selectButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 10,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: Fonts.secondary,
    color: '#000000',
    letterSpacing: 1,
  },
  infoContainer: {
    marginTop: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0, 204, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 204, 255, 0.3)',
    gap: 15,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: Fonts.secondary,
    color: '#00CCFF',
    marginBottom: 8,
    textShadowColor: '#00CCFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  infoDescription: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Fonts.secondary,
    color: '#FFFFFF',
    lineHeight: 20,
    opacity: 0.9,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 255, 136, 0.2)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    fontFamily: Fonts.roboto,
    color: '#00FF88',
    letterSpacing: 1,
  },
  closeButton: {
    padding: 8,
  },
  madhabsList: {
    flex: 1,
    padding: 20,
  },
  madhabCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
  },
  selectedMadhabCard: {
    borderColor: '#00FF88',
    borderWidth: 2,
  },
  madhabCardGradient: {
    padding: 20,
  },
  madhabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  madhabInfo: {
    flex: 1,
  },
  madhabName: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: Fonts.secondary,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  selectedMadhabName: {
    color: '#00FF88',
    textShadowColor: '#00FF88',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  madhabDescription: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Fonts.secondary,
    color: '#FFFFFF',
    marginBottom: 4,
    opacity: 0.7,
  },
  selectedMadhabDescription: {
    color: '#00CCFF',
    opacity: 0.9,
  },
  madhabMethod: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Fonts.secondary,
    color: '#FFFFFF',
    opacity: 0.6,
  },
  selectedMadhabMethod: {
    color: '#00CCFF',
    opacity: 0.8,
  },
  selectedIndicator: {
    marginLeft: 10,
  },
});

