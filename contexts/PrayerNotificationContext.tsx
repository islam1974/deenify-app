import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { PrayerNotificationService } from '@/services/PrayerNotificationService';
import { AdhanSoundService } from '@/services/AdhanSoundService';
import PermissionRequestModal from '@/components/PermissionRequestModal';

interface PrayerNotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  advanceMinutes: number;
  adhanEnabled: boolean;
  adhanAutoPlay: boolean;
}

interface PrayerNotificationContextType {
  settings: PrayerNotificationSettings;
  updateSettings: (settings: Partial<PrayerNotificationSettings>) => Promise<void>;
  showTestNotification: () => Promise<void>;
  scheduleNotifications: () => Promise<void>;
  cancelNotifications: () => Promise<void>;
  popupVisible: boolean;
  popupData: {
    prayerName: string;
    prayerArabic: string;
    prayerTime: string;
    hadithText?: string;
    hadithSource?: string;
  } | null;
  showPopup: (data: { prayerName: string; prayerArabic: string; prayerTime: string; hadithText?: string; hadithSource?: string }) => void;
  hidePopup: () => void;
  permissionModalVisible: boolean;
  showPermissionModal: () => void;
  hidePermissionModal: () => void;
  requestPermissions: () => Promise<boolean>;
  playAdhan: (prayerName?: string) => Promise<boolean>;
  stopAdhan: () => Promise<void>;
  testAdhan: () => Promise<boolean>;
  playSimpleTest: () => Promise<boolean>;
  testBasicAudio: () => Promise<boolean>;
  playAdhanTaster: (adhanId: string) => Promise<boolean>;
  playAdhanForPrayerTime: (prayerName: string) => Promise<boolean>;
}

const PrayerNotificationContext = createContext<PrayerNotificationContextType | undefined>(undefined);

export function PrayerNotificationProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PrayerNotificationSettings>({
    enabled: false,
    soundEnabled: true,
    advanceMinutes: 5,
    adhanEnabled: true,
    adhanAutoPlay: false,
  });
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupData, setPopupData] = useState<{
    prayerName: string;
    prayerArabic: string;
    prayerTime: string;
  } | null>(null);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    setupNotificationListener();
    initializeAdhanService();
  }, []);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && settings.enabled) {
        // Reschedule notifications when app becomes active
        scheduleNotifications();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [settings.enabled]);

  const loadSettings = async () => {
    try {
      const loadedSettings = await PrayerNotificationService.getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Error loading prayer notification settings:', error);
    }
  };

  const setupNotificationListener = () => {
    // Handle notifications received while app is foregrounded
    const notificationListener = Notifications.addNotificationReceivedListener(async notification => {
      const data = notification.request.content.data;
      if (data?.type === 'prayer-notification') {
        console.log('Prayer notification received:', data);
        
        // Show popup
        showPopup({
          prayerName: data.prayerName as string,
          prayerArabic: data.prayerArabic as string,
          prayerTime: data.prayerTime as string,
          hadithText: data.hadithText as string | undefined,
          hadithSource: data.hadithSource as string | undefined,
        });
        
        // Play Adhan if enabled
        try {
          const success = await playAdhanForPrayerTime(data.prayerName as string);
          if (success) {
            console.log('Adhan played successfully for', data.prayerName);
          } else {
            console.log('Adhan not played for', data.prayerName, '(disabled or failed)');
          }
        } catch (error) {
          console.error('Error playing Adhan for notification:', error);
        }
      }
    });

    // Handle notification taps
    const responseListener = Notifications.addNotificationResponseReceivedListener(async response => {
      const data = response.notification.request.content.data;
      if (data?.type === 'prayer-notification') {
        console.log('Prayer notification tapped:', data);
        
        // Show popup
        showPopup({
          prayerName: data.prayerName as string,
          prayerArabic: data.prayerArabic as string,
          prayerTime: data.prayerTime as string,
          hadithText: data.hadithText as string | undefined,
          hadithSource: data.hadithSource as string | undefined,
        });
        
        // Play Adhan if enabled
        try {
          const success = await playAdhanForPrayerTime(data.prayerName as string);
          if (success) {
            console.log('Adhan played successfully for tapped notification:', data.prayerName);
          } else {
            console.log('Adhan not played for tapped notification:', data.prayerName, '(disabled or failed)');
          }
        } catch (error) {
          console.error('Error playing Adhan for tapped notification:', error);
        }
      }
    });

    return () => {
      notificationListener?.remove();
      responseListener?.remove();
    };
  };

  const updateSettings = async (newSettings: Partial<PrayerNotificationSettings>) => {
    try {
      await PrayerNotificationService.updateSettings(newSettings);
      const updatedSettings = await PrayerNotificationService.getSettings();
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating prayer notification settings:', error);
    }
  };

  const showTestNotification = async () => {
    try {
      await PrayerNotificationService.showTestNotification();
    } catch (error) {
      console.error('Error showing test notification:', error);
    }
  };

  const scheduleNotifications = async () => {
    try {
      await PrayerNotificationService.schedulePrayerNotifications();
    } catch (error) {
      console.error('Error scheduling prayer notifications:', error);
    }
  };

  const cancelNotifications = async () => {
    try {
      await PrayerNotificationService.cancelAllNotifications();
    } catch (error) {
      console.error('Error cancelling prayer notifications:', error);
    }
  };

  const showPopup = (data: { prayerName: string; prayerArabic: string; prayerTime: string; hadithText?: string; hadithSource?: string }) => {
    setPopupData(data);
    setPopupVisible(true);
  };

  const hidePopup = () => {
    setPopupVisible(false);
    setPopupData(null);
  };

  const showPermissionModal = () => {
    setPermissionModalVisible(true);
  };

  const hidePermissionModal = () => {
    setPermissionModalVisible(false);
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const granted = await PrayerNotificationService.requestPermissions();
      if (granted) {
        // Schedule notifications if permissions are granted
        await scheduleNotifications();
      }
      return granted;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  const initializeAdhanService = async () => {
    try {
      await AdhanSoundService.initialize();
      console.log('Adhan service initialized in context');
    } catch (error) {
      console.error('Error initializing adhan service:', error);
    }
  };

  const playAdhan = async (prayerName?: string): Promise<boolean> => {
    try {
      if (!settings.adhanEnabled) {
        console.log('Adhan is disabled in settings');
        return false;
      }
      return await AdhanSoundService.playAdhan(prayerName);
    } catch (error) {
      console.error('Error playing adhan:', error);
      return false;
    }
  };

  const stopAdhan = async (): Promise<void> => {
    try {
      await AdhanSoundService.stopAdhan();
    } catch (error) {
      console.error('Error stopping adhan:', error);
    }
  };

  const testAdhan = async (): Promise<boolean> => {
    try {
      return await AdhanSoundService.testAdhan();
    } catch (error) {
      console.error('Error testing adhan:', error);
      return false;
    }
  };

  const playSimpleTest = async (): Promise<boolean> => {
    try {
      return await AdhanSoundService.playSimpleTest();
    } catch (error) {
      console.error('Error playing simple test:', error);
      return false;
    }
  };

  const testBasicAudio = async (): Promise<boolean> => {
    try {
      return await AdhanSoundService.testBasicAudio();
    } catch (error) {
      console.error('Error testing basic audio:', error);
      return false;
    }
  };

  const playAdhanTaster = async (adhanId: string): Promise<boolean> => {
    try {
      return await AdhanSoundService.playAdhanTaster(adhanId);
    } catch (error) {
      console.error('Error playing adhan taster:', error);
      return false;
    }
  };

  const playAdhanForPrayerTime = async (prayerName: string): Promise<boolean> => {
    try {
      return await AdhanSoundService.playAdhanForPrayerTime(prayerName);
    } catch (error) {
      console.error('Error playing adhan for prayer time:', error);
      return false;
    }
  };

  const handlePermissionAllow = async () => {
    hidePermissionModal();
    const granted = await requestPermissions();
    if (granted) {
      await updateSettings({ enabled: true });
    }
  };

  const handlePermissionDeny = () => {
    hidePermissionModal();
    // Keep notifications disabled
  };

  const value: PrayerNotificationContextType = {
    settings,
    updateSettings,
    showTestNotification,
    scheduleNotifications,
    cancelNotifications,
    popupVisible,
    popupData,
    showPopup,
    hidePopup,
    permissionModalVisible,
    showPermissionModal,
    hidePermissionModal,
    requestPermissions,
    playAdhan,
    stopAdhan,
    testAdhan,
    playSimpleTest,
    testBasicAudio,
    playAdhanTaster,
    playAdhanForPrayerTime,
  };

  return (
    <PrayerNotificationContext.Provider value={value}>
      {children}
      <PermissionRequestModal
        visible={permissionModalVisible}
        onAllow={handlePermissionAllow}
        onDeny={handlePermissionDeny}
      />
    </PrayerNotificationContext.Provider>
  );
}

export function usePrayerNotifications() {
  const context = useContext(PrayerNotificationContext);
  if (context === undefined) {
    throw new Error('usePrayerNotifications must be used within a PrayerNotificationProvider');
  }
  return context;
}
