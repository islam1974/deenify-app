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
import { usePrayerSettings, CalculationMethod } from '@/contexts/PrayerSettingsContext';
import * as Haptics from 'expo-haptics';

export default function CalculationMethodSettings() {
  const { settings, updateSettings, getCalculationMethodInfo } = usePrayerSettings();
  const [modalVisible, setModalVisible] = useState(false);

  const calculationMethods: CalculationMethod[] = [
    'MWL',
    'ISNA',
    'UmmAlQura',
    'Karachi',
    'Egyptian',
    'Tehran',
    'Kuwait',
    'Qatar',
    'Singapore',
    'France',
    'Turkey',
    'Russia',
    'Dubai',
    'Morocco',
    'Tunisia',
    'Algeria',
  ];

  const handleMethodSelect = async (method: CalculationMethod) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await updateSettings({ calculationMethod: method });
      setModalVisible(false);
    } catch (error) {
      console.error('Error updating calculation method:', error);
    }
  };

  const currentMethodInfo = getCalculationMethodInfo(settings.calculationMethod);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CALCULATION METHOD</Text>
        <Text style={styles.subtitle}>طريقة الحساب</Text>
        <Text style={styles.description}>
          Choose the calculation method for determining prayer times. Different methods use various angles for Fajr and Isha prayers.
        </Text>
      </View>

      <View style={styles.currentMethodContainer}>
        <Text style={styles.currentMethodLabel}>CURRENT METHOD</Text>
        <View style={styles.currentMethodCard}>
          <LinearGradient
            colors={['rgba(0, 255, 136, 0.1)', 'rgba(0, 255, 136, 0.05)']}
            style={styles.currentMethodGradient}
          >
            <View style={styles.currentMethodContent}>
              <IconSymbol name="clock.fill" size={24} color="#00FF88" />
              <View style={styles.currentMethodText}>
                <Text style={styles.currentMethodName}>{currentMethodInfo.name}</Text>
                <Text style={styles.currentMethodDescription}>{currentMethodInfo.description}</Text>
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
          <Text style={styles.selectButtonText}>SELECT METHOD</Text>
          <IconSymbol name="chevron.right" size={16} color="#000000" />
        </LinearGradient>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>SELECT CALCULATION METHOD</Text>
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

          <ScrollView style={styles.methodsList} showsVerticalScrollIndicator={false}>
            {calculationMethods.map((method) => {
              const methodInfo = getCalculationMethodInfo(method);
              const isSelected = method === settings.calculationMethod;

              return (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.methodCard,
                    isSelected && styles.selectedMethodCard,
                  ]}
                  onPress={() => handleMethodSelect(method)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      isSelected
                        ? ['rgba(0, 255, 136, 0.2)', 'rgba(0, 255, 136, 0.1)']
                        : ['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.1)']
                    }
                    style={styles.methodCardGradient}
                  >
                    <View style={styles.methodContent}>
                      <View style={styles.methodInfo}>
                        <Text style={[
                          styles.methodName,
                          isSelected && styles.selectedMethodName
                        ]}>
                          {methodInfo.name}
                        </Text>
                        <Text style={[
                          styles.methodDescription,
                          isSelected && styles.selectedMethodDescription
                        ]}>
                          {methodInfo.description}
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
  currentMethodContainer: {
    marginBottom: 30,
  },
  currentMethodLabel: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: Fonts.secondary,
    color: '#00FF88',
    marginBottom: 10,
    letterSpacing: 1,
  },
  currentMethodCard: {
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#00FF88',
  },
  currentMethodGradient: {
    padding: 20,
  },
  currentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  currentMethodText: {
    flex: 1,
  },
  currentMethodName: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: Fonts.secondary,
    color: '#00FF88',
    marginBottom: 4,
    textShadowColor: '#00FF88',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  currentMethodDescription: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Fonts.secondary,
    color: '#FFFFFF',
    opacity: 0.8,
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
  methodsList: {
    flex: 1,
    padding: 20,
  },
  methodCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
  },
  selectedMethodCard: {
    borderColor: '#00FF88',
    borderWidth: 2,
  },
  methodCardGradient: {
    padding: 20,
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: Fonts.secondary,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  selectedMethodName: {
    color: '#00FF88',
    textShadowColor: '#00FF88',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  methodDescription: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Fonts.secondary,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  selectedMethodDescription: {
    color: '#00CCFF',
    opacity: 0.9,
  },
  selectedIndicator: {
    marginLeft: 10,
  },
});

