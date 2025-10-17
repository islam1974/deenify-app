import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Modal, Animated, Alert } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useLocation } from '@/contexts/LocationContext';
import { useQuranSettings, QuranSettingsProvider } from '@/contexts/QuranSettingsContext';
import { usePrayerNotifications, PrayerNotificationProvider } from '@/contexts/PrayerNotificationContext';
import { usePrayerSettings, PrayerSettingsProvider } from '@/contexts/PrayerSettingsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PrayerNotificationService } from '@/services/PrayerNotificationService';
import LocationWrapper from '@/components/LocationWrapper';
import FontSizeSettings from '@/components/QuranSettings/FontSizeSettings';
import TextDirectionSettings from '@/components/QuranSettings/TextDirectionSettings';
import BookmarksSettings from '@/components/QuranSettings/BookmarksSettings';
import ReciterSettings from '@/components/QuranSettings/ReciterSettings';
import TranslatorSettings from '@/components/QuranSettings/TranslatorSettings';
import TranslationPlaybackSettings from '@/components/QuranSettings/TranslationPlaybackSettings';
import TTSVoiceSettings from '@/components/QuranSettings/TTSVoiceSettings';
import CalculationMethodSettings from '@/components/PrayerSettings/CalculationMethodSettings';
import MadhabSettings from '@/components/PrayerSettings/MadhabSettings';
import PrayerNotificationPopup from '@/components/PrayerNotificationPopup';
import AdhanSoundSettingsComponent from '@/components/AdhanSoundSettings';

function SettingsScreenContent() {
  const { theme } = useTheme();
  const colors = Colors[((theme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const { location, locationEnabled, toggleLocationServices } = useLocation();
  const { settings } = useQuranSettings();
  const { 
    settings: prayerNotificationSettings, 
    updateSettings: updatePrayerSettings,
    showTestNotification,
    showPopup,
    popupVisible,
    popupData,
    hidePopup,
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
        {
          icon: 'speaker.wave.2.fill',
          title: 'Translation Playback',
          subtitle: settings.playTranslation ? 'Enabled' : 'Disabled',
          type: 'navigation',
          onPress: () => {
            setCurrentModal('translationPlayback');
            setModalVisible(true);
          },
        },
        {
          icon: 'person.wave.2.fill',
          title: 'TTS Voice',
          subtitle: 'Voice selection for translations',
          type: 'navigation',
          onPress: () => {
            setCurrentModal('ttsVoice');
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
          subtitle: 'Test prayer notification popup',
          type: 'navigation',
          onPress: async () => {
            await showTestNotification();
            // Also show popup for testing
            showPopup({
              prayerName: 'Fajr',
              prayerArabic: 'الفجر',
              prayerTime: '05:30 AM',
            });
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
        },
        {
          icon: 'star.fill',
          title: 'Rate App',
          subtitle: 'Rate us on the App Store',
          type: 'navigation',
        },
        {
          icon: 'envelope.fill',
          title: 'Contact Us',
          subtitle: 'Send feedback',
          type: 'navigation',
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
          {currentModal === 'translationPlayback' && <TranslationPlaybackSettings />}
          {currentModal === 'ttsVoice' && <TTSVoiceSettings />}
          {currentModal === 'calculationMethod' && <CalculationMethodSettings />}
          {currentModal === 'madhab' && <MadhabSettings />}
          {currentModal === 'adhanSettings' && <AdhanSoundSettingsComponent onClose={() => setModalVisible(false)} />}
        </View>
      </Modal>

      {/* Prayer Notification Popup */}
      {popupVisible && popupData && (
        <PrayerNotificationPopup
          visible={popupVisible}
          prayerName={popupData.prayerName}
          prayerArabic={popupData.prayerArabic}
          prayerTime={popupData.prayerTime}
          hadithText={popupData.hadithText}
          hadithSource={popupData.hadithSource}
          onDismiss={hidePopup}
          onOpenApp={() => {
            // Navigate to prayer times screen
            // You can add navigation logic here if needed
          }}
        />
      )}
    </ScrollView>
  );
}

export default function SettingsScreen() {
  return (
    <LocationWrapper>
      <QuranSettingsProvider>
        <PrayerSettingsProvider>
          <PrayerNotificationProvider>
            <SettingsScreenContent />
          </PrayerNotificationProvider>
        </PrayerSettingsProvider>
      </QuranSettingsProvider>
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
