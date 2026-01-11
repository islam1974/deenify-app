import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PrivacyNoticeModalProps {
  visible: boolean;
  onAccept: () => void;
}

export default function PrivacyNoticeModal({
  visible,
  onAccept,
}: PrivacyNoticeModalProps) {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const colors = Colors[((colorScheme ?? 'light' as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];

  const handleViewFullPolicy = () => {
    onAccept(); // Accept and close modal
    router.push('/privacy-policy');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.iconContainer}>
            <IconSymbol name="lock.shield.fill" size={48} color={colors.tint} />
          </View>
          
          <Text style={[styles.title, { color: colors.text }]}>
            Welcome to Deenify
          </Text>
          
          <Text style={[styles.subtitle, { color: colors.text }]}>
            Your Islamic Companion
          </Text>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={[styles.message, { color: colors.text }]}>
              Before you begin, here's how we protect your privacy:
            </Text>
            
            <View style={styles.benefits}>
              <View style={styles.benefitItem}>
                <IconSymbol name="checkmark.circle.fill" size={20} color={colors.tint} />
                <Text style={[styles.benefitText, { color: colors.text }]}>
                  <Text style={styles.bold}>All data stays on your device</Text> - We never send your information to external servers
                </Text>
              </View>
              
              <View style={styles.benefitItem}>
                <IconSymbol name="checkmark.circle.fill" size={20} color={colors.tint} />
                <Text style={[styles.benefitText, { color: colors.text }]}>
                  <Text style={styles.bold}>Location is optional</Text> - Use manual location if you prefer
                </Text>
              </View>
              
              <View style={styles.benefitItem}>
                <IconSymbol name="checkmark.circle.fill" size={20} color={colors.tint} />
                <Text style={[styles.benefitText, { color: colors.text }]}>
                  <Text style={styles.bold}>No third-party sharing</Text> - Your data is never sold or shared
                </Text>
              </View>
              
              <View style={styles.benefitItem}>
                <IconSymbol name="checkmark.circle.fill" size={20} color={colors.tint} />
                <Text style={[styles.benefitText, { color: colors.text }]}>
                  <Text style={styles.bold}>Full control</Text> - Disable any feature at any time in Settings
                </Text>
              </View>
            </View>

            <View style={[styles.infoBox, { backgroundColor: colors.tint + '15', borderColor: colors.tint }]}>
              <IconSymbol name="info.circle.fill" size={20} color={colors.tint} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                Deenify uses location to calculate prayer times and show Qibla direction. 
                This is completely optional and processed locally on your device.
              </Text>
            </View>
          </ScrollView>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.textButton]}
              onPress={handleViewFullPolicy}
            >
              <Text style={[styles.textButtonText, { color: colors.tint }]}>
                View Full Privacy Policy
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.acceptButton, { backgroundColor: colors.tint }]}
              onPress={onAccept}
            >
              <Text style={[styles.acceptButtonText, { color: colors.background }]}>
                Got It, Let's Start
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
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.7,
  },
  content: {
    maxHeight: 300,
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '600',
  },
  benefits: {
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  benefitText: {
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  bold: {
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'flex-start',
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    lineHeight: 18,
  },
  buttonContainer: {
    marginTop: 20,
  },
  textButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  textButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  acceptButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});

