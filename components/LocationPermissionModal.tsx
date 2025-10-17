import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface LocationPermissionModalProps {
  visible: boolean;
  onRequestPermission: () => void;
  onCancel: () => void;
}

export default function LocationPermissionModal({
  visible,
  onRequestPermission,
  onCancel,
}: LocationPermissionModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[((colorScheme ?? 'light' as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.iconContainer}>
            <IconSymbol name="location.fill" size={48} color={colors.tint} />
          </View>
          
          <Text style={[styles.title, { color: colors.text }]}>
            Location Permission Required
          </Text>
          
          <Text style={[styles.message, { color: colors.text }]}>
            Deenify needs access to your location to provide accurate prayer times for your area. 
            This helps ensure you never miss a prayer time.
          </Text>
          
          <View style={styles.benefits}>
            <View style={styles.benefitItem}>
              <IconSymbol name="checkmark.circle.fill" size={20} color={colors.tint} />
              <Text style={[styles.benefitText, { color: colors.text }]}>
                Accurate prayer times for your location
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <IconSymbol name="checkmark.circle.fill" size={20} color={colors.tint} />
              <Text style={[styles.benefitText, { color: colors.text }]}>
                Automatic updates when you travel
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <IconSymbol name="checkmark.circle.fill" size={20} color={colors.tint} />
              <Text style={[styles.benefitText, { color: colors.text }]}>
                Qibla direction based on your position
              </Text>
            </View>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={onCancel}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                Not Now
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.allowButton, { backgroundColor: colors.tint }]}
              onPress={onRequestPermission}
            >
              <Text style={[styles.allowButtonText, { color: colors.background }]}>
                Allow Location
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.8,
  },
  benefits: {
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    marginLeft: 12,
    fontSize: 14,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  allowButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  allowButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
