import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { AdhanSoundService } from './AdhanSoundService';
import { HadithService } from './HadithService';
import { PrayerTimesService } from './PrayerTimesService';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface PrayerNotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  advanceMinutes: number;
  adhanEnabled: boolean;
  adhanAutoPlay: boolean;
}

interface PrayerTime {
  name: string;
  time: string;
  arabic: string;
  next: boolean;
}

export class PrayerNotificationService {
  private static readonly STORAGE_KEY = 'prayerNotificationSettings';
  private static readonly NOTIFICATION_IDS_KEY = 'scheduledNotificationIds';

  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        // Request permissions with proper dialog for both iOS and Android
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowAnnouncements: true,
          },
          android: {
            allowAlert: true,
            allowSound: true,
            allowBadge: true,
          },
        });
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permission denied by user');
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        try {
          await Notifications.setNotificationChannelAsync('prayer-times', {
            name: 'Prayer Times',
            description: 'Notifications for Islamic prayer times',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#3a5a40',
            sound: 'default',
            enableVibrate: true,
            enableLights: true,
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          });
          console.log('Android notification channel created successfully');
        } catch (channelError) {
          console.error('Error creating notification channel:', channelError);
          // Continue anyway, channel creation might fail on older Android versions
        }
      }

      console.log('Notification permissions granted');
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  static async getSettings(): Promise<PrayerNotificationSettings> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }

    return {
      enabled: false,
      soundEnabled: true,
      advanceMinutes: 5,
      adhanEnabled: true,
      adhanAutoPlay: false,
    };
  }

  static async updateSettings(settings: Partial<PrayerNotificationSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const newSettings = { ...currentSettings, ...settings };
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(newSettings));

      // Reschedule notifications if enabled
      if (newSettings.enabled) {
        await this.schedulePrayerNotifications();
      } else {
        await this.cancelAllNotifications();
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  }

  static async schedulePrayerNotifications(): Promise<void> {
    try {
      const settings = await this.getSettings();
      if (!settings.enabled) {
        return;
      }

      // Cancel existing notifications
      await this.cancelAllNotifications();

      // Get current prayer times
      const prayerTimes = await this.getCurrentPrayerTimes();
      if (!prayerTimes || prayerTimes.length === 0) {
        console.log('No prayer times available for notifications');
        return;
      }

      const notificationIds: string[] = [];

      for (const prayer of prayerTimes) {
        const notificationTime = this.calculateNotificationTime(prayer.time, settings.advanceMinutes);
        
        if (notificationTime && notificationTime > new Date()) {
          const notificationId = await this.scheduleNotification(prayer, notificationTime, settings.soundEnabled);
          if (notificationId) {
            notificationIds.push(notificationId);
          }
        }
      }

      // Store notification IDs for cancellation
      await AsyncStorage.setItem(this.NOTIFICATION_IDS_KEY, JSON.stringify(notificationIds));
      
      console.log(`Scheduled ${notificationIds.length} prayer notifications`);
    } catch (error) {
      console.error('Error scheduling prayer notifications:', error);
    }
  }

  private static async getCurrentPrayerTimes(): Promise<PrayerTime[] | null> {
    try {
      // Try to get location from AsyncStorage or use default
      const locationData = await AsyncStorage.getItem('savedLocation');
      let location = null;
      
      if (locationData) {
        location = JSON.parse(locationData);
      }

      // Get prayer settings
      const prayerSettingsData = await AsyncStorage.getItem('prayerSettings');
      let prayerSettings = { calculationMethod: 'MWL', madhab: 'Standard' };
      
      if (prayerSettingsData) {
        prayerSettings = JSON.parse(prayerSettingsData);
      }

      if (location && location.latitude !== 0 && location.longitude !== 0) {
        return await PrayerTimesService.getPrayerTimes(
          location.latitude, 
          location.longitude, 
          undefined,
          prayerSettings.calculationMethod,
          prayerSettings.madhab
        );
      } else if (location && location.city) {
        return await PrayerTimesService.getPrayerTimesByCity(
          location.city, 
          location.country,
          undefined,
          prayerSettings.calculationMethod,
          prayerSettings.madhab
        );
      } else {
        // Use default location
        return await PrayerTimesService.getPrayerTimesByCity(
          'New York', 
          'USA',
          undefined,
          prayerSettings.calculationMethod,
          prayerSettings.madhab
        );
      }
    } catch (error) {
      console.error('Error getting prayer times for notifications:', error);
      return null;
    }
  }

  private static calculateNotificationTime(prayerTime: string, advanceMinutes: number): Date | null {
    try {
      // Parse prayer time (format: "HH:MM AM/PM")
      const [timePart, period] = prayerTime.split(' ');
      const [hours, minutes] = timePart.split(':').map(Number);
      
      let hour24 = hours;
      if (period === 'AM' && hours === 12) {
        hour24 = 0;
      } else if (period === 'PM' && hours !== 12) {
        hour24 = hours + 12;
      }

      const notificationDate = new Date();
      notificationDate.setHours(hour24, minutes, 0, 0);
      
      // Subtract advance minutes
      notificationDate.setMinutes(notificationDate.getMinutes() - advanceMinutes);
      
      return notificationDate;
    } catch (error) {
      console.error('Error calculating notification time:', error);
      return null;
    }
  }

  private static async scheduleNotification(
    prayer: PrayerTime, 
    notificationTime: Date, 
    soundEnabled: boolean
  ): Promise<string | null> {
    try {
      // Get a random prayer-related Hadith
      const hadith = HadithService.getPrayerSpecificHadith(prayer.name);
      const hadithText = HadithService.formatHadithForNotification(hadith) || "May Allah accept your prayers.";
      
      const notificationContent: Notifications.NotificationContentInput = {
        title: `🕌 ${prayer.name} Prayer Time`,
        body: `It's time for ${prayer.name} prayer (${prayer.arabic})\n\n📖 ${hadithText}`,
        sound: soundEnabled ? 'default' : false,
        data: {
          prayerName: prayer.name,
          prayerArabic: prayer.arabic,
          prayerTime: prayer.time,
          hadithText: hadithText,
          hadithSource: hadith?.source || '',
          type: 'prayer-notification',
        },
      };

      // Add Android-specific channel ID
      if (Platform.OS === 'android') {
        notificationContent.android = {
          channelId: 'prayer-times',
          sound: soundEnabled ? 'default' : undefined,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          vibrate: [0, 250, 250, 250],
          color: '#3a5a40',
          icon: 'notification_icon',
        };
      }

      // Add iOS-specific configuration
      if (Platform.OS === 'ios') {
        notificationContent.ios = {
          sound: soundEnabled ? 'default' : undefined,
          badge: 1,
        };
      }
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: {
          date: notificationTime,
        },
      });

      const preview = hadithText.length > 50 ? hadithText.substring(0, 50) + '...' : hadithText;
      console.log(`Scheduled notification for ${prayer.name} with Hadith: ${preview}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    try {
      // Cancel scheduled notifications
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      for (const notification of scheduledNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }

      // Clear stored notification IDs
      await AsyncStorage.removeItem(this.NOTIFICATION_IDS_KEY);
      
      console.log('Cancelled all prayer notifications');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  static async showTestNotification(): Promise<void> {
    try {
      // Check permissions first
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log('Current notification permission status:', existingStatus);
      
      if (existingStatus !== 'granted') {
        console.log('Requesting notification permissions...');
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
          android: {
            allowAlert: true,
            allowSound: true,
            allowBadge: true,
          },
        });
        console.log('New notification permission status:', status);
        
        if (status !== 'granted') {
          console.error('Notification permission not granted');
          return;
        }
      }

      // Create notification channel for Android if it doesn't exist
      if (Platform.OS === 'android') {
        try {
          await Notifications.setNotificationChannelAsync('prayer-times', {
            name: 'Prayer Times',
            description: 'Notifications for Islamic prayer times',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#3a5a40',
            sound: 'default',
            enableVibrate: true,
            enableLights: true,
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          });
          console.log('Android notification channel ensured');
        } catch (channelError) {
          console.error('Error creating notification channel:', channelError);
        }
      }
      
      // Get a random prayer-related Hadith for test
      const hadith = HadithService.getPrayerSpecificHadith('Fajr');
      const hadithText = HadithService.formatHadithForNotification(hadith) || "May Allah accept your prayers.";
      
      const notificationContent: Notifications.NotificationContentInput = {
        title: '🕌 Test: Fajr Prayer Time',
        body: `It's time for Fajr prayer (الفجر)\n\n📖 ${hadithText}`,
        sound: 'default',
        data: {
          prayerName: 'Fajr',
          prayerArabic: 'الفجر',
          prayerTime: '05:30 AM',
          hadithText: hadithText,
          hadithSource: hadith?.source || '',
          type: 'prayer-notification',
        },
      };

      // Add Android-specific channel ID
      if (Platform.OS === 'android') {
        notificationContent.android = {
          channelId: 'prayer-times',
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          vibrate: [0, 250, 250, 250],
          color: '#3a5a40',
        };
      }

      // Add iOS-specific configuration
      if (Platform.OS === 'ios') {
        notificationContent.ios = {
          sound: 'default',
          badge: 1,
        };
      }
      
      await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: {
          seconds: 2,
        },
      });
      
      console.log('Test notification scheduled successfully');
    } catch (error) {
      console.error('Error showing test notification:', error);
    }
  }

  static async playAdhanForPrayer(prayerName: string): Promise<boolean> {
    try {
      const settings = await this.getSettings();
      if (!settings.adhanEnabled) {
        console.log('Adhan sound is disabled');
        return false;
      }

      return await AdhanSoundService.playAdhanForPrayerTime(prayerName);
    } catch (error) {
      console.error('Error playing adhan for prayer:', error);
      return false;
    }
  }

  static async initializeAdhanService(): Promise<void> {
    try {
      await AdhanSoundService.initialize();
      console.log('Adhan service initialized');
    } catch (error) {
      console.error('Error initializing adhan service:', error);
    }
  }
}
