import AdhanSoundSettingsComponent from '@/components/AdhanSoundSettings';
import LocationWrapper from '@/components/LocationWrapper';
import CalculationMethodSettings from '@/components/PrayerSettings/CalculationMethodSettings';
import MadhabSettings from '@/components/PrayerSettings/MadhabSettings';
import BookmarksSettings from '@/components/QuranSettings/BookmarksSettings';
import FontSizeSettings from '@/components/QuranSettings/FontSizeSettings';
import ReciterSettings from '@/components/QuranSettings/ReciterSettings';
import TextDirectionSettings from '@/components/QuranSettings/TextDirectionSettings';
import TranslatorSettings from '@/components/QuranSettings/TranslatorSettings';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useLocation } from '@/contexts/LocationContext';
import { PrayerNotificationProvider, usePrayerNotifications } from '@/contexts/PrayerNotificationContext';
import { PrayerSettingsProvider, usePrayerSettings } from '@/contexts/PrayerSettingsContext';
import { useQuranSettings } from '@/contexts/QuranSettingsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

function SettingsScreenContent() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = Colors[((theme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const { location, locationEnabled, toggleLocationServices } = useLocation();
  const { settings } = useQuranSettings();
  const { 
    settings: prayerNotificationSettings, 
    updateSettings: updatePrayerSettings,
    showTestNotification,
    showPermissionModal,
  } = usePrayerNotifications();
  const { settings: prayerSettings } = usePrayerSettings();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentModal, setCurrentModal] = useState<'fontSize' | 'textDirection' | 'bookmarks' | 'reciter' | 'translator' | 'calculationMethod' | 'madhab' | 'adhanSettings' | null>(null);

  const settingsSections = [
    {
      title: 'Prayer Settings',
      items: [
        {
          icon: 'bell.fill',
          title: 'Prayer Notifications',
          subtitle: prayerNotificationSettings.enabled ? 'Notifications enabled' : 'Get notified for prayer times',
          type: 'switch',
          value: prayerNotificationSettings.enabled,
          onToggle: async () => {
            const newEnabled = !prayerNotificationSettings.enabled;
            if (newEnabled) {
              // Show permission modal when enabling notifications
              showPermissionModal();
            } else {
              // Disable notifications
              await updatePrayerSettings({ enabled: false });
            }
          },
        },
        {
          icon: 'location.fill',
          title: 'Location Services',
          subtitle: location ? `${location.city}, ${location.country}` : 'Use GPS for accurate prayer times',
          type: 'switch',
          value: locationEnabled,
          onToggle: () => toggleLocationServices(!locationEnabled),
        },
        {
          icon: 'speaker.wave.2.fill',
          title: 'Adhan Sound',
          subtitle: prayerNotificationSettings.adhanEnabled ? 'Adhan enabled' : 'Play adhan for prayer times',
          type: 'navigation',
          onPress: () => {
            setCurrentModal('adhanSettings');
            setModalVisible(true);
          },
        },
        {
          icon: 'clock.fill',
          title: 'Calculation Method',
          subtitle: prayerSettings.calculationMethod,
          type: 'navigation',
          onPress: () => {
            setCurrentModal('calculationMethod');
            setModalVisible(true);
          },
        },
        {
          icon: 'book.fill',
          title: 'Madhab (Juristic Method)',
          subtitle: prayerSettings.madhab,
          type: 'navigation',
          onPress: () => {
            setCurrentModal('madhab');
            setModalVisible(true);
          },
        },
      ],
    },
    {
      title: 'Quran Settings',
      items: [
        {
          icon: 'textformat.size',
          title: 'Font Size',
          subtitle: settings.fontSize.charAt(0).toUpperCase() + settings.fontSize.slice(1),
          type: 'navigation',
          onPress: () => {
            setCurrentModal('fontSize');
            setModalVisible(true);
          },
        },
        {
          icon: 'text.alignleft',
          title: 'Text Direction',
          subtitle: settings.textDirection === 'rtl' ? 'Right to Left' : 'Left to Right',
          type: 'navigation',
          onPress: () => {
            setCurrentModal('textDirection');
            setModalVisible(true);
          },
        },
        {
          icon: 'bookmark.fill',
          title: 'Bookmarks',
          subtitle: `${settings.bookmarks.length} saved verses`,
          type: 'navigation',
          onPress: () => {
            setCurrentModal('bookmarks');
            setModalVisible(true);
          },
        },
        {
          icon: 'person.wave.2.fill',
          title: 'Reciter',
          subtitle: 'Choose audio reciter',
          type: 'navigation',
          onPress: () => {
            setCurrentModal('reciter');
            setModalVisible(true);
          },
        },
        {
          icon: 'globe',
          title: 'Translator',
          subtitle: 'Choose English translation',
          type: 'navigation',
          onPress: () => {
            setCurrentModal('translator');
            setModalVisible(true);
          },
        },
      ],
    },
    {
      title: 'App Settings',
      items: [
        {
          icon: 'globe',
          title: 'Language',
          subtitle: 'English',
          type: 'navigation',
        },
        {
          icon: 'bell.badge.fill',
          title: 'Test Notification',
          subtitle: 'Test prayer notification',
          type: 'navigation',
          onPress: async () => {
            await showTestNotification();
          },
        },
      ],
    },
    {
      title: 'Privacy & Legal',
      items: [
        {
          icon: 'lock.shield.fill',
          title: 'Privacy Policy',
          subtitle: 'How we protect your data',
          type: 'navigation',
          onPress: () => {
            router.push('/privacy-policy');
          },
        },
        {
          icon: 'hand.raised.fill',
          title: 'Data & Permissions',
          subtitle: 'Manage app permissions',
          type: 'navigation',
          onPress: () => {
            Alert.alert(
              'Data & Permissions',
              'All your data is stored locally on your device. To manage app permissions:\n\n' +
              '• iOS: Settings > Deenify > Permissions\n' +
              '• Android: Settings > Apps > Deenify > Permissions\n\n' +
              'You can change location, notification, and other permissions at any time.',
              [{ text: 'OK' }]
            );
          },
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: 'info.circle.fill',
          title: 'About Deenify',
          subtitle: 'Version 1.0.0',
          type: 'navigation',
          onPress: () => {
            router.push('/about');
          },
        },
        {
          icon: 'star.fill',
          title: 'Rate App',
          subtitle: 'Rate us on the App Store',
          type: 'navigation',
          onPress: () => {
            // TODO: Replace with your actual App Store ID when published
            Alert.alert(
              'Rate Deenify',
              'Thank you for using Deenify! Once the app is published, you can rate us on the App Store to help other Muslims discover this app.',
              [{ text: 'OK' }]
            );
            // Uncomment and replace APP_ID when published:
            // const storeUrl = Platform.OS === 'ios' 
            //   ? 'https://apps.apple.com/app/id[APP_ID]'
            //   : 'https://play.google.com/store/apps/details?id=com.deenify.app';
            // Linking.openURL(storeUrl);
          },
        },
        {
          icon: 'envelope.fill',
          title: 'Contact Us',
          subtitle: 'Send feedback',
          type: 'navigation',
          onPress: () => {
            Alert.alert(
              'Contact Us',
              'Choose how you would like to reach us:',
              [
                {
                  text: 'Email Support',
                  onPress: () => {
                    const email = 'support@deenify.app';
                    const subject = 'Feedback for Deenify';
                    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
                    require('react-native').Linking.openURL(url).catch(() => {
                      Alert.alert('Error', 'Could not open email app');
                    });
                  },
                },
                {
                  text: 'Report Issue',
                  onPress: () => {
                    const email = 'support@deenify.app';
                    const subject = 'Issue Report - Deenify';
                    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
                    require('react-native').Linking.openURL(url).catch(() => {
                      Alert.alert('Error', 'Could not open email app');
                    });
                  },
                },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          },
        },
      ],
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Settings
        </Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          الإعدادات
        </Text>
      </View>

      {settingsSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {section.title}
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={[
                  styles.settingItem,
                  itemIndex !== section.items.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
                ]}
                disabled={item.type === 'switch'}
                onPress={item.onPress}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.tint }]}>
                    <IconSymbol name={item.icon as any} size={20} color={colors.background} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.settingSubtitle, { color: colors.text }]}>
                      {item.subtitle}
                    </Text>
                  </View>
                </View>
                <View style={styles.settingRight}>
                  {item.type === 'switch' && 'value' in item && 'onToggle' in item ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: colors.border, true: colors.tint }}
                      thumbColor={colors.background}
                    />
                  ) : (
                    <IconSymbol name="chevron.right" size={16} color={colors.text} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Modal for Quran Settings */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <IconSymbol name="xmark" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          {currentModal === 'fontSize' && <FontSizeSettings />}
          {currentModal === 'textDirection' && <TextDirectionSettings />}
          {currentModal === 'bookmarks' && <BookmarksSettings />}
          {currentModal === 'reciter' && <ReciterSettings />}
          {currentModal === 'translator' && <TranslatorSettings />}
          {currentModal === 'calculationMethod' && <CalculationMethodSettings />}
          {currentModal === 'madhab' && <MadhabSettings />}
          {currentModal === 'adhanSettings' && <AdhanSoundSettingsComponent onClose={() => setModalVisible(false)} />}
        </View>
      </Modal>

    </ScrollView>
  );
}

export default function SettingsScreen() {
  return (
    <LocationWrapper>
      <PrayerSettingsProvider>
        <PrayerNotificationProvider>
          <SettingsScreenContent />
        </PrayerNotificationProvider>
      </PrayerSettingsProvider>
    </LocationWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 5,
  },
  sectionContent: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  settingRight: {
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    paddingTop: 60,
  },
  closeButton: {
    padding: 8,
  },
});
