/**
 * Safe wrapper for expo-notifications. In Expo Go (SDK 53+) push notifications
 * were removed, so we never load the native module there and export stubs instead.
 */
import Constants, { ExecutionEnvironment } from 'expo-constants';

function isExpoGo(): boolean {
  const ownership = (Constants as { appOwnership?: string }).appOwnership;
  if (ownership === 'expo') return true;
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return true;
  return false;
}

type Subscription = { remove: () => void };

const noopSubscription: Subscription = { remove: () => {} };

const stubs = {
  setNotificationHandler: () => {},
  getPermissionsAsync: async () => ({ status: 'undetermined' as const, granted: false, canAskAgain: true }) as const,
  requestPermissionsAsync: async () => ({ status: 'denied' as const, granted: false }) as const,
  setNotificationChannelAsync: async () => {},
  getAllScheduledNotificationsAsync: async () => [] as any[],
  getNextTriggerDateAsync: async () => null as number | null,
  scheduleNotificationAsync: async () => 'stub' as string,
  cancelScheduledNotificationAsync: async () => {},
  cancelAllScheduledNotificationsAsync: async () => {},
  addNotificationReceivedListener: () => noopSubscription,
  addNotificationResponseReceivedListener: () => noopSubscription,
  AndroidImportance: { HIGH: 4, DEFAULT: 3 } as any,
  AndroidNotificationVisibility: { PUBLIC: 1 } as any,
  AndroidNotificationPriority: { HIGH: 1 } as any,
};

let NotificationsModule: typeof stubs;

if (isExpoGo()) {
  NotificationsModule = stubs;
} else {
  try {
    NotificationsModule = require('expo-notifications');
  } catch {
    NotificationsModule = stubs;
  }
}

export const Notifications = NotificationsModule;
export default Notifications;
