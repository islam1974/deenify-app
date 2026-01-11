import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AboutScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = Colors[((theme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];

  const appVersion = '1.0.0';
  const buildNumber = '1';

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>About</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Logo & Name */}
        <View style={styles.logoSection}>
          <View style={[styles.logoContainer, { backgroundColor: colors.tint + '20' }]}>
            <Text style={styles.logoEmoji}>🕌</Text>
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>Deenify</Text>
          <Text style={[styles.tagline, { color: colors.text }]}>Your Islamic Companion</Text>
          <Text style={[styles.arabicTagline, { color: colors.text }]}>رفيقك الإسلامي</Text>
        </View>

        {/* Version Info */}
        <View style={[styles.versionCard, { backgroundColor: colors.tint + '10', borderColor: colors.border }]}>
          <View style={styles.versionRow}>
            <Text style={[styles.versionLabel, { color: colors.text }]}>Version</Text>
            <Text style={[styles.versionValue, { color: colors.text }]}>{appVersion}</Text>
          </View>
          <View style={styles.versionRow}>
            <Text style={[styles.versionLabel, { color: colors.text }]}>Build</Text>
            <Text style={[styles.versionValue, { color: colors.text }]}>{buildNumber}</Text>
          </View>
        </View>

        {/* About Text */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About Deenify</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Deenify is a comprehensive Islamic companion app designed to help Muslims practice their faith 
            with ease and convenience. From accurate prayer times to Quran reading, Qibla direction, and more, 
            Deenify brings essential Islamic tools right to your fingertips.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Built with privacy and simplicity in mind, Deenify keeps all your data locally on your device 
            and never shares it with third parties. Your spiritual journey is personal, and we respect that.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Features</Text>
          
          <View style={styles.featureItem}>
            <IconSymbol name="clock.fill" size={24} color={colors.tint} />
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>Prayer Times</Text>
              <Text style={[styles.featureDescription, { color: colors.text }]}>
                Accurate prayer times with multiple calculation methods
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <IconSymbol name="book.fill" size={24} color={colors.tint} />
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>Quran Reader</Text>
              <Text style={[styles.featureDescription, { color: colors.text }]}>
                Complete Quran with translations and audio recitations
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <IconSymbol name="location.fill" size={24} color={colors.tint} />
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>Qibla Direction</Text>
              <Text style={[styles.featureDescription, { color: colors.text }]}>
                Find the direction to Mecca from anywhere
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>📿</Text>
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>Digital Tasbih</Text>
              <Text style={[styles.featureDescription, { color: colors.text }]}>
                Keep track of your dhikr and remembrance
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>🕌</Text>
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>Mosque Finder</Text>
              <Text style={[styles.featureDescription, { color: colors.text }]}>
                Locate nearby mosques easily
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <IconSymbol name="calendar" size={24} color={colors.tint} />
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>Hijri Calendar</Text>
              <Text style={[styles.featureDescription, { color: colors.text }]}>
                Islamic calendar with important dates
              </Text>
            </View>
          </View>
        </View>

        {/* Mission Statement */}
        <View style={[styles.quoteCard, { backgroundColor: colors.tint + '15', borderColor: colors.tint }]}>
          <IconSymbol name="quote.opening" size={24} color={colors.tint} />
          <Text style={[styles.quoteText, { color: colors.text }]}>
            "Verily, in the remembrance of Allah do hearts find rest."
          </Text>
          <Text style={[styles.quoteReference, { color: colors.text }]}>
            — Quran 13:28
          </Text>
        </View>

        {/* Credits */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Acknowledgments</Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Deenify uses the following resources and APIs:
          </Text>
          <Text style={[styles.creditItem, { color: colors.text }]}>
            • Quran text and audio from Quran.com
          </Text>
          <Text style={[styles.creditItem, { color: colors.text }]}>
            • Prayer times from Aladhan API
          </Text>
          <Text style={[styles.creditItem, { color: colors.text }]}>
            • Hadith collections from various authentic sources
          </Text>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Get in Touch</Text>
          
          <TouchableOpacity
            style={[styles.contactButton, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => handleOpenLink('mailto:support@deenify.app')}
          >
            <IconSymbol name="envelope.fill" size={20} color={colors.tint} />
            <Text style={[styles.contactButtonText, { color: colors.text }]}>
              support@deenify.app
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.contactButton, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => router.push('/privacy-policy')}
          >
            <IconSymbol name="lock.shield.fill" size={20} color={colors.tint} />
            <Text style={[styles.contactButtonText, { color: colors.text }]}>
              Privacy Policy
            </Text>
          </TouchableOpacity>
        </View>

        {/* Made with Love */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.text }]}>
            Made with ❤️ for the Muslim community
          </Text>
          <Text style={[styles.copyrightText, { color: colors.text }]}>
            © 2025 Deenify. All rights reserved.
          </Text>
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
  logoSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 50,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    opacity: 0.8,
    marginBottom: 4,
  },
  arabicTagline: {
    fontSize: 16,
    opacity: 0.6,
  },
  versionCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  versionLabel: {
    fontSize: 15,
    opacity: 0.7,
  },
  versionValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
    opacity: 0.9,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.7,
  },
  quoteCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    marginBottom: 32,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 12,
  },
  quoteReference: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  creditItem: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 6,
    opacity: 0.8,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  contactButtonText: {
    fontSize: 15,
    marginLeft: 12,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 15,
    marginBottom: 8,
  },
  copyrightText: {
    fontSize: 13,
    opacity: 0.6,
  },
  bottomPadding: {
    height: 20,
  },
});

