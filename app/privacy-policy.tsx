import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = Colors[((theme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];

  const lastUpdated = 'October 21, 2025';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.lastUpdated, { color: colors.text }]}>
          Last updated: {lastUpdated}
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Introduction</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Welcome to Deenify. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy explains how we handle your information when you use our app.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Data We Collect</Text>
          
          <Text style={[styles.subsectionTitle, { color: colors.text }]}>Location Information</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>What we collect:</Text> GPS coordinates, city, country, and neighborhood information
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>Why we collect it:</Text> To calculate accurate prayer times for your location, 
            provide Qibla direction, and help you find nearby mosques
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>When we collect it:</Text> Only when you grant location permission and enable location services
          </Text>

          <Text style={[styles.subsectionTitle, { color: colors.text }]}>Local Storage Data</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Quran bookmarks and reading progress
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Prayer time settings (calculation method, madhab)
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • App preferences (theme, font size, notification settings)
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Tasbih counter history
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>How We Use Your Data</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>Prayer Times:</Text> Calculate accurate prayer times based on your location
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>Qibla Direction:</Text> Determine the correct direction to Mecca from your location
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>Mosque Finder:</Text> Show nearby mosques relative to your position
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>Notifications:</Text> Send prayer time reminders if you enable them
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>Personalization:</Text> Save your preferences and settings for a better experience
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Storage & Security</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>Local Storage Only:</Text> All your data is stored locally on your device. 
            We do not send your location or personal information to any external servers.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>No Third-Party Sharing:</Text> We do not share, sell, or transfer your 
            location data or any other personal information to third parties.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>No Cloud Backup:</Text> Your data remains on your device and is not backed up 
            to any cloud services by our app.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Privacy Rights</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            You have complete control over your data:
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>Disable Location:</Text> Turn off location services at any time in Settings
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>Manual Location:</Text> Enter your location manually instead of using GPS
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>Delete Data:</Text> Uninstalling the app removes all stored data from your device
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>Opt-Out Notifications:</Text> Disable prayer notifications at any time in Settings
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>Revoke Permissions:</Text> Change app permissions through your device settings
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Permissions We Request</Text>
          
          <Text style={[styles.subsectionTitle, { color: colors.text }]}>Location (Optional)</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Required for prayer times, Qibla direction, and mosque finder. You can use the app without 
            granting location permission by manually entering your city.
          </Text>

          <Text style={[styles.subsectionTitle, { color: colors.text }]}>Notifications (Optional)</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Required to receive prayer time reminders. Entirely optional and can be disabled at any time.
          </Text>

          <Text style={[styles.subsectionTitle, { color: colors.text }]}>Audio/Media (Optional)</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Used to play Quran recitations and adhan (call to prayer). No data is collected from this permission.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Third-Party Services</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Deenify uses the following third-party services:
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>Prayer Times API:</Text> We use external APIs to calculate prayer times 
            based on your location. Only your coordinates are sent (not stored by us or the API).
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • <Text style={styles.bold}>Quran & Hadith Content:</Text> Islamic content is fetched from public APIs 
            and cached locally. No personal data is shared.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Children's Privacy</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Deenify is designed for general audiences and does not knowingly collect personal information from children. 
            The app does not require user accounts and stores all data locally on the device.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Retention</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • All data is stored locally on your device
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • Data persists until you disable location services, clear app data, or uninstall the app
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            • No data is retained by us or any third parties
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Changes to This Policy</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We may update this privacy policy from time to time. Any changes will be reflected with a new 
            "Last updated" date. We encourage you to review this policy periodically.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Us</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            If you have any questions about this privacy policy or how we handle your data, please contact us:
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Email: suhel_islam@yahoo.co.uk
          </Text>
        </View>

        <View style={styles.section}>
          <View style={[styles.highlightBox, { backgroundColor: colors.tint + '15', borderColor: colors.tint }]}>
            <IconSymbol name="checkmark.shield.fill" size={24} color={colors.tint} />
            <Text style={[styles.highlightText, { color: colors.text }]}>
              Your privacy is important to us. Deenify is designed with privacy in mind - all your data 
              stays on your device and is never shared with anyone.
            </Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  lastUpdated: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 8,
    opacity: 0.9,
  },
  bold: {
    fontWeight: '600',
  },
  highlightBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 8,
  },
  highlightText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
});

