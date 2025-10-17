import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface PrayerNotificationPopupProps {
  visible: boolean;
  prayerName: string;
  prayerArabic: string;
  prayerTime: string;
  hadithText?: string;
  hadithSource?: string;
  onDismiss: () => void;
  onOpenApp?: () => void;
}

export default function PrayerNotificationPopup({
  visible,
  prayerName,
  prayerArabic,
  prayerTime,
  hadithText,
  hadithSource,
  onDismiss,
  onOpenApp,
}: PrayerNotificationPopupProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[((colorScheme ?? 'light' as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];

  const handleDismiss = () => {
    onDismiss();
  };

  const handleOpenApp = () => {
    if (onOpenApp) {
      onOpenApp();
    }
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconSymbol name="moon.fill" size={24} color="#4CAF50" />
            </View>
            <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
              <IconSymbol name="xmark" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>
              Prayer Time
            </Text>
            
            <Text style={[styles.prayerName, { color: colors.text }]}>
              {prayerName}
            </Text>
            
            <Text style={[styles.prayerArabic, { color: '#4CAF50' }]}>
              {prayerArabic}
            </Text>
            
            <Text style={[styles.prayerTime, { color: colors.text, opacity: 0.7 }]}>
              {prayerTime}
            </Text>
            
            {hadithText && (
              <View style={styles.hadithContainer}>
                <View style={styles.hadithHeader}>
                  <IconSymbol name="book.fill" size={16} color="#4CAF50" />
                  <Text style={[styles.hadithTitle, { color: '#4CAF50' }]}>
                    Hadith
                  </Text>
                </View>
                <Text style={[styles.hadithText, { color: colors.text }]}>
                  {hadithText}
                </Text>
                {hadithSource && (
                  <Text style={[styles.hadithSource, { color: colors.text, opacity: 0.6 }]}>
                    - {hadithSource}
                  </Text>
                )}
              </View>
            )}
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.dismissButton, { borderColor: colors.border }]}
              onPress={handleDismiss}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>
                Dismiss
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.openButton, { backgroundColor: '#4CAF50' }]}
              onPress={handleOpenApp}
            >
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                Open App
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
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
  },
  prayerName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  prayerArabic: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  prayerTime: {
    fontSize: 16,
    fontWeight: '500',
  },
  hadithContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  hadithHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  hadithTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  hadithText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  hadithSource: {
    fontSize: 12,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissButton: {
    borderWidth: 1,
  },
  openButton: {
    // backgroundColor set inline
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});