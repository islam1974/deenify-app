import { Audio } from 'expo-av';

// Shared audio configuration for optimal playback
export const audioConfig = {
  mode: {
    allowsRecordingIOS: false,
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
    interruptionModeIOS: 1, // INTERRUPTION_MODE_IOS_DO_NOT_MIX
    interruptionModeAndroid: 1, // INTERRUPTION_MODE_ANDROID_DO_NOT_MIX
  },
  playback: {
    shouldPlay: true,
    isLooping: false,
    volume: 1.0,
    rate: 1.0,
    shouldCorrectPitch: true,
    progressUpdateIntervalMillis: 200,
  },
  loading: {
    downloadFirst: true,     // Download before playing for smoother playback
    timeoutMs: 1500,        // Faster timeout for better UX
    retryCount: 2,          // Number of retries before failing
    preloadCount: 2,        // Number of verses to preload ahead
  }
};

// Initialize audio system with optimal settings
export async function initializeAudio() {
  try {
    await Audio.setAudioModeAsync(audioConfig.mode);
    return true;
  } catch (error) {
    console.error('Failed to initialize audio:', error);
    return false;
  }
}

// Create consistent audio object with optimal settings
export async function createAudioObject(uri: string, onPlaybackStatus?: (status: any) => void) {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      {
        ...audioConfig.playback,
        positionMillis: 0,
      },
      onPlaybackStatus,
      audioConfig.loading.downloadFirst
    );
    return sound;
  } catch (error) {
    console.error('Failed to create audio object:', error);
    return null;
  }
}

// Helper to handle audio loading with timeout and retries
export async function loadAudioWithRetry(uri: string, onPlaybackStatus?: (status: any) => void) {
  let lastError = null;
  
  for (let i = 0; i < audioConfig.loading.retryCount; i++) {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Audio loading timeout')), audioConfig.loading.timeoutMs)
      );
      
      const loadPromise = createAudioObject(uri, onPlaybackStatus);
      const sound = await Promise.race([loadPromise, timeoutPromise]);
      
      if (sound) {
        return sound;
      }
    } catch (error) {
      lastError = error;
      console.log(`Retry ${i + 1} failed:`, error);
      continue;
    }
  }
  
  throw lastError || new Error('Failed to load audio after retries');
}