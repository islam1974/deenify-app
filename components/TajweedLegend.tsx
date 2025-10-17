import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import TajweedService from '@/services/TajweedService';

export default function TajweedLegend() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showLegend, setShowLegend] = useState(false);

  const legend = TajweedService.getLegend();

  return (
    <>
      {/* Floating Button */}
      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: colors.tint }]}
        onPress={() => setShowLegend(true)}
        activeOpacity={0.8}
      >
        <IconSymbol name="info.circle.fill" size={20} color="white" />
        <Text style={styles.floatingButtonText}>Tajweed</Text>
      </TouchableOpacity>

      {/* Legend Modal */}
      <Modal
        visible={showLegend}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLegend(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={styles.headerLeft}>
                <IconSymbol name="book.fill" size={24} color={colors.tint} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Tajweed Rules
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowLegend(false)}
                style={styles.closeButton}
              >
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.legendList} showsVerticalScrollIndicator={false}>
              <View style={[styles.infoBox, { backgroundColor: colors.tint + '20', borderColor: colors.tint }]}>
                <IconSymbol name="info.circle.fill" size={16} color={colors.tint} />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  Tajweed colors help you learn proper Quranic recitation by highlighting pronunciation rules.
                </Text>
              </View>

              {legend.map((item, index) => (
                <View
                  key={index}
                  style={[styles.legendItem, { borderBottomColor: colors.border }]}
                >
                  <View style={styles.legendLeft}>
                    <View
                      style={[styles.colorDot, { backgroundColor: item.color }]}
                    />
                    <View style={styles.legendTextContainer}>
                      <Text style={[styles.legendName, { color: colors.text }]}>
                        {item.name}
                      </Text>
                      <Text style={[styles.legendDescription, { color: colors.text }]}>
                        {item.description}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}

              <View style={[styles.tipBox, { backgroundColor: colors.tint + '10', borderColor: colors.tint + '40' }]}>
                <IconSymbol name="lightbulb.fill" size={20} color={colors.tint} />
                <View style={styles.tipTextContainer}>
                  <Text style={[styles.tipTitle, { color: colors.text }]}>
                    Pro Tip
                  </Text>
                  <Text style={[styles.tipText, { color: colors.text }]}>
                    Listen to the reciter while following the colored text to learn proper Tajweed pronunciation.
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  legendList: {
    padding: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  legendItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginTop: 2,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  legendDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 20,
    gap: 12,
  },
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
});

