import AsyncStorage from '@react-native-async-storage/async-storage';
import Notifications from '@/services/notificationsSafe';
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
        console.log('📅 Settings updated: Notifications enabled, rescheduling...');
        await this.schedulePrayerNotifications();
      } else {
        console.log('📅 Settings updated: Notifications disabled, cancelling...');
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

      const notificationIds: string[] = [];

      // Get individual prayer azan settings
      let azanSettings: { [key: string]: boolean } = {
        Fajr: true,
        Dhuhr: true,
        Asr: true,
        Maghrib: true,
        Isha: true,
      };
      
      try {
        const prayerSettings = await AsyncStorage.getItem('prayerSettings');
        if (prayerSettings) {
          const parsed = JSON.parse(prayerSettings);
          if (parsed.azanSettings) {
            azanSettings = parsed.azanSettings;
          }
        }
      } catch (error) {
        console.error('Error loading prayer azan settings:', error);
      }

      // Schedule notifications for the next 7 days
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + dayOffset);
        targetDate.setHours(0, 0, 0, 0);

        // Get prayer times for this day
        const prayerTimes = await this.getPrayerTimesForDate(targetDate);
        if (!prayerTimes || prayerTimes.length === 0) {
          console.log(`⚠️ No prayer times available for day ${dayOffset}`);
          continue;
        }

        console.log(`📅 Day ${dayOffset}: Found ${prayerTimes.length} prayer times`);

        for (const prayer of prayerTimes) {
          // Check if azan is enabled for this specific prayer
          const prayerKey = prayer.name as keyof typeof azanSettings;
          const isAzanEnabled = azanSettings[prayerKey] ?? true;
          
          if (!isAzanEnabled) {
            console.log(`⏭️ Skipping ${prayer.name} - azan disabled`);
            continue;
          }
          
          const notificationTime = this.calculateNotificationTime(prayer.time, settings.advanceMinutes, dayOffset);
          
          if (notificationTime && notificationTime > new Date()) {
            const msUntilNotification = notificationTime.getTime() - Date.now();
            const minutesUntil = Math.round(msUntilNotification / 60000);
            
            const notificationId = await this.scheduleNotification(prayer, notificationTime, settings.soundEnabled);
            if (notificationId) {
              notificationIds.push(notificationId);
              console.log(`✅ Scheduled ${prayer.name} for ${notificationTime.toLocaleString()} (in ${minutesUntil} minutes) - prayer at ${prayer.time}`);
            } else {
              console.error(`❌ Failed to schedule notification for ${prayer.name}`);
            }
          } else {
            console.log(`⏭️ Skipping ${prayer.name} - notification time ${notificationTime?.toLocaleString()} is in the past (now: ${new Date().toLocaleString()})`);
          }
        }
      }

      // Store notification IDs for cancellation
      await AsyncStorage.setItem(this.NOTIFICATION_IDS_KEY, JSON.stringify(notificationIds));
      
      // Verify scheduled notifications
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`✅ Successfully scheduled ${notificationIds.length} prayer notifications`);
      console.log(`📋 Total scheduled notifications in system: ${scheduled.length}`);
      
      // Log all scheduled prayer notifications for debugging
      for (const notif of scheduled) {
        if (notif.content.data?.type === 'prayer-notification') {
          const prayerName = notif.content.data.prayerName ?? 'Prayer';
          const prayerTimeFromData = notif.content.data.prayerTime;
          let triggerTimeStr: string;
          try {
            if (notif.trigger && typeof notif.trigger === 'object' && 'type' in notif.trigger && (notif.trigger as { type?: string }).type !== 'unknown') {
              const nextDate = await Notifications.getNextTriggerDateAsync(notif.trigger as Notifications.NotificationTriggerInput);
              triggerTimeStr = nextDate != null ? new Date(nextDate).toLocaleString() : (prayerTimeFromData ?? 'scheduled');
            } else {
              triggerTimeStr = prayerTimeFromData ?? 'scheduled';
            }
          } catch {
            triggerTimeStr = prayerTimeFromData ?? 'scheduled';
          }
          console.log(`   - ${prayerName} scheduled for: ${triggerTimeStr}`);
        }
      }
    } catch (error) {
      console.error('❌ Error scheduling prayer notifications:', error);
    }
  }

  private static async getPrayerTimesForDate(date: Date): Promise<PrayerTime[] | null> {
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
          date,
          prayerSettings.calculationMethod,
          prayerSettings.madhab
        );
      } else if (location && location.city) {
        return await PrayerTimesService.getPrayerTimesByCity(
          location.city, 
          location.country,
          date,
          prayerSettings.calculationMethod,
          prayerSettings.madhab
        );
      } else {
        // Use default location
        return await PrayerTimesService.getPrayerTimesByCity(
          'New York', 
          'USA',
          date,
          prayerSettings.calculationMethod,
          prayerSettings.madhab
        );
      }
    } catch (error) {
      console.error('Error getting prayer times for notifications:', error);
      return null;
    }
  }

  private static calculateNotificationTime(prayerTime: string, advanceMinutes: number, dayOffset: number = 0): Date | null {
    try {
      // Parse prayer time (format: "HH:MM AM/PM")
      const [timePart, period] = prayerTime.split(' ');
      if (!timePart || !period) {
        console.error(`Invalid prayer time format: ${prayerTime}`);
        return null;
      }
      
      const [hours, minutes] = timePart.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) {
        console.error(`Invalid hours/minutes in prayer time: ${prayerTime}`);
        return null;
      }
      
      let hour24 = hours;
      if (period === 'AM' && hours === 12) {
        hour24 = 0;
      } else if (period === 'PM' && hours !== 12) {
        hour24 = hours + 12;
      }

      const notificationDate = new Date();
      notificationDate.setDate(notificationDate.getDate() + dayOffset);
      notificationDate.setHours(hour24, minutes, 0, 0);
      
      // Subtract advance minutes
      notificationDate.setMinutes(notificationDate.getMinutes() - advanceMinutes);
      
      // If the notification time has passed (for today only), move it to tomorrow
      const now = new Date();
      if (dayOffset === 0 && notificationDate <= now) {
        // For today's prayers that have passed, schedule for tomorrow
        notificationDate.setDate(notificationDate.getDate() + 1);
        console.log(`⏰ Prayer time ${prayerTime} has passed today, scheduling for tomorrow`);
      }
      
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
        title: `${prayer.name} Prayer Time`,
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

      // Add Android-specific options (icon from app.json notification config is used by default)
      if (Platform.OS === 'android') {
        notificationContent.android = {
          channelId: 'prayer-times',
          sound: soundEnabled ? 'default' : undefined,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          vibrate: [0, 250, 250, 250],
          color: '#3a5a40',
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
          type: 'date' as const,
          date: notificationTime,
          ...(Platform.OS === 'android' && { channelId: 'prayer-times' }),
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
        title: 'Test: Fajr Prayer Time',
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
          type: 'timeInterval',
          seconds: 2,
        } as Notifications.TimeIntervalTriggerInput,
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
