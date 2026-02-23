import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Registers the playback service for background audio.
 * Uses dynamic import() so in Expo Go (missing native module) the load fails as a promise
 * rejection instead of a sync throw — no red box. Works in dev/production builds.
 */
export default function TrackPlayerRegistration() {
  useEffect(() => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') return;

    // Only skip when we're sure we're in Expo Go (no TrackPlayer there). Otherwise try to register (dev/standalone).
    const ownership = (Constants as { appOwnership?: string }).appOwnership;
    if (ownership === 'expo') return;
    if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return;

    const id = setTimeout(() => {
      import('react-native-track-player')
        .then((module) => {
          const TrackPlayer = module.default;
          const { PlaybackService } = require('../services/PlaybackService');
          TrackPlayer.registerPlaybackService(() => PlaybackService);
        })
        .catch(() => {
          if (__DEV__) {
            console.warn('TrackPlayer registration skipped (e.g. Expo Go)');
          }
        });
    }, 0);

    return () => clearTimeout(id);
  }, []);

  return null;
}
