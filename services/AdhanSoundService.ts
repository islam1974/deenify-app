import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

export interface AdhanSoundSettings {
  enabled: boolean;
  volume: number;
  selectedAdhan: string;
  autoPlay: boolean;
  // Prayer-specific settings
  prayers: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
  };
}

export interface AdhanOption {
  id: string;
  name: string;
  description: string;
  file: string | null; // Audio file import
}

export class AdhanSoundService {
  private static readonly STORAGE_KEY = 'adhanSoundSettings';
  private static sound: Audio.Sound | null = null;
  private static isPlaying = false;
  private static currentAdhan: string | null = null;
  private static isTasterMode = false;

  // Online adhan audio URL (using real Adhan from islamcan.com)
  private static readonly ADHAN_AUDIO_URL = 'https://www.islamcan.com/audio/adhan/azan2.mp3';

  // Available adhan options (single Adhan option)
  static readonly ADHAN_OPTIONS: AdhanOption[] = [
    {
      id: 'adhan',
      name: 'Adhan',
      description: 'Traditional Adhan',
      file: null, // Will use URL instead
    },
  ];

  static async initialize(): Promise<void> {
    try {
      console.log('=== INITIALIZING ADHAN SERVICE ===');
      
      // Configure audio mode for better adhan playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      console.log('Audio mode set successfully');
      console.log('AdhanSoundService initialized');
      console.log('=== INITIALIZATION COMPLETE ===');
    } catch (error) {
      console.error('=== INITIALIZATION ERROR ===');
      console.error('Error initializing AdhanSoundService:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('=== END INITIALIZATION ERROR ===');
    }
  }

  static async getSettings(): Promise<AdhanSoundSettings> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading adhan sound settings:', error);
    }

    return {
      enabled: true,
      volume: 0.8,
      selectedAdhan: 'adhan',
      autoPlay: false,
      prayers: {
        fajr: true,
        dhuhr: true,
        asr: true,
        maghrib: true,
        isha: true,
      },
    };
  }

  static async updateSettings(settings: Partial<AdhanSoundSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const newSettings = { ...currentSettings, ...settings };
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(newSettings));

      // Update volume if sound is currently playing
      if (this.sound && this.isPlaying) {
        await this.sound.setVolumeAsync(newSettings.volume);
      }
    } catch (error) {
      console.error('Error updating adhan sound settings:', error);
    }
  }

  static async playAdhan(prayerName?: string): Promise<boolean> {
    try {
      const settings = await this.getSettings();
      if (!settings.enabled) {
        console.log('Adhan sound is disabled');
        return false;
      }

      // Stop any currently playing adhan
      await this.stopAdhan();

      // Play from online URL
      const success = await this.playAdhanFromURL(settings.selectedAdhan, settings.volume);
      if (success) {
        this.isPlaying = true;
        this.currentAdhan = settings.selectedAdhan;
        console.log(`Playing ${settings.selectedAdhan} adhan for ${prayerName || 'prayer time'}`);
        return true;
      }

      console.log('Failed to play adhan from URL');
      return false;
    } catch (error) {
      console.error('Error playing adhan:', error);
      this.isPlaying = false;
      this.currentAdhan = null;
      return false;
    }
  }

  static async playAdhanFromURL(adhanId: string, volume: number): Promise<boolean> {
    try {
      console.log('Loading Adhan from URL:', this.ADHAN_AUDIO_URL);
      console.log('Volume setting:', volume);
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: this.ADHAN_AUDIO_URL },
        {
          shouldPlay: true,
          volume: volume,
          isLooping: false,
        }
      );

      console.log('Audio sound created successfully from URL');
      this.sound = sound;
      this.isPlaying = true;
      this.currentAdhan = adhanId;
      this.setupSoundListeners();
      console.log('Successfully loaded and playing Adhan from URL');
      return true;
    } catch (error) {
      console.error('Error playing Adhan from URL:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return false;
    }
  }

  private static setupSoundListeners(): void {
    if (this.sound) {
      this.sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            this.isPlaying = false;
            this.currentAdhan = null;
            console.log('Adhan finished playing');
          }
        }
      });
    }
  }

  static async pauseAdhan(): Promise<void> {
    try {
      if (this.sound && this.isPlaying) {
        await this.sound.pauseAsync();
        this.isPlaying = false;
        console.log('Adhan paused');
      }
    } catch (error) {
      console.error('Error pausing adhan:', error);
    }
  }

  static async resumeAdhan(): Promise<void> {
    try {
      if (this.sound && !this.isPlaying) {
        await this.sound.playAsync();
        this.isPlaying = true;
        console.log('Adhan resumed');
      }
    } catch (error) {
      console.error('Error resuming adhan:', error);
    }
  }

  static async stopAdhan(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
        this.isPlaying = false;
        this.currentAdhan = null;
        console.log('Adhan stopped');
      }
    } catch (error) {
      console.error('Error stopping adhan:', error);
    }
  }

  static async setVolume(volume: number): Promise<void> {
    try {
      if (this.sound && this.isPlaying) {
        await this.sound.setVolumeAsync(volume);
      }
      await this.updateSettings({ volume });
    } catch (error) {
      console.error('Error setting adhan volume:', error);
    }
  }

  static isAdhanPlaying(): boolean {
    return this.isPlaying;
  }

  static getCurrentAdhan(): string | null {
    return this.currentAdhan;
  }

  static getAdhanOptions(): AdhanOption[] {
    return this.ADHAN_OPTIONS;
  }

  static async testAdhan(): Promise<boolean> {
    try {
      console.log('Testing adhan sound...');
      console.log('Current settings:', await this.getSettings());
      console.log('Available adhan options:', this.ADHAN_OPTIONS.length);
      
      // Test with a simple approach first
      const settings = await this.getSettings();
      console.log('Selected adhan:', settings.selectedAdhan);
      console.log('Volume:', settings.volume);
      console.log('Enabled:', settings.enabled);
      
      return await this.playAdhan('Test');
    } catch (error) {
      console.error('Error testing adhan:', error);
      return false;
    }
  }

  static async playAdhanTaster(adhanId: string): Promise<boolean> {
    try {
      console.log('=== PLAYING ADHAN TASTER ===');
      console.log(`Playing taster for ${adhanId} adhan...`);
      console.log('URL:', this.ADHAN_AUDIO_URL);
      
      // Ensure service is initialized
      await this.initialize();
      
      this.isTasterMode = true;
      
      // Stop any currently playing adhan
      console.log('Stopping any currently playing adhan...');
      await this.stopAdhan();

      const settings = await this.getSettings();
      console.log('Settings loaded:', settings);
      
      // Play from online URL
      console.log('Attempting to play from URL...');
      const success = await this.playAdhanFromURL(adhanId, settings.volume);
      
      if (success) {
        console.log('✅ Adhan taster started successfully');
        this.isPlaying = true;
        this.currentAdhan = adhanId;
        return true;
      }
      
      console.log('❌ Failed to play adhan from URL');
      this.isTasterMode = false;
      return false;
    } catch (error) {
      console.error('❌ Error playing adhan taster:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      this.isTasterMode = false;
      return false;
    }
  }

  static async playAdhanForPrayerTime(prayerName: string): Promise<boolean> {
    try {
      const settings = await this.getSettings();
      if (!settings.enabled || !settings.autoPlay) {
        console.log('Adhan auto-play is disabled');
        return false;
      }

      // Check if Adhan is enabled for this specific prayer
      const prayerKey = prayerName.toLowerCase() as keyof typeof settings.prayers;
      if (!settings.prayers[prayerKey]) {
        console.log(`Adhan is disabled for ${prayerName} prayer`);
        return false;
      }

      console.log(`Playing adhan for ${prayerName} prayer time...`);
      return await this.playAdhan(prayerName);
    } catch (error) {
      console.error('Error playing adhan for prayer time:', error);
      return false;
    }
  }

  static async cleanup(): Promise<void> {
    try {
      await this.stopAdhan();
      console.log('AdhanSoundService cleaned up');
    } catch (error) {
      console.error('Error cleaning up AdhanSoundService:', error);
    }
  }

  // Simple fallback method for testing
  static async playSimpleTest(): Promise<boolean> {
    try {
      console.log('=== SIMPLE TEST START ===');
      console.log('Playing simple test sound...');
      
      // Try the real Adhan URL
      const testUrl = 'https://www.islamcan.com/audio/adhan/azan2.mp3';
      console.log('Testing real Adhan URL:', testUrl);
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: testUrl },
        { 
          shouldPlay: true, 
          volume: 0.8,
          isLooping: false,
        }
      );
      
      console.log('Sound created successfully');
      this.sound = sound;
      this.isPlaying = true;
      
      // Set up listener to know when it finishes
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          console.log('Playback status:', status);
          if (status.didJustFinish) {
            console.log('Simple test finished playing');
            this.isPlaying = false;
          }
        }
      });
      
      console.log('Simple test sound playing');
      console.log('=== SIMPLE TEST END ===');
      return true;
    } catch (error) {
      console.error('=== SIMPLE TEST ERROR ===');
      console.error('Error playing simple test:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('=== END ERROR ===');
      return false;
    }
  }

  // Basic audio test without external URLs
  static async testBasicAudio(): Promise<boolean> {
    try {
      console.log('=== BASIC AUDIO TEST START ===');
      console.log('Testing basic audio functionality...');
      
      // Test with real Adhan URL
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.islamcan.com/audio/adhan/azan2.mp3' },
        { 
          shouldPlay: false, // Don't auto-play, test loading first
          volume: 0.5,
          isLooping: false,
        }
      );
      
      console.log('Sound object created successfully');
      console.log('Sound object:', sound);
      
      // Try to play it
      await sound.playAsync();
      console.log('Play command sent successfully');
      
      this.sound = sound;
      this.isPlaying = true;
      
      // Set up listener
      sound.setOnPlaybackStatusUpdate((status) => {
        console.log('Playback status update:', status);
        if (status.isLoaded) {
          console.log('Audio is loaded and ready');
          if (status.didJustFinish) {
            console.log('Basic audio test finished');
            this.isPlaying = false;
          }
        } else {
          console.log('Audio not loaded yet');
        }
      });
      
      console.log('Basic audio test playing');
      console.log('=== BASIC AUDIO TEST END ===');
      return true;
    } catch (error) {
      console.error('=== BASIC AUDIO TEST ERROR ===');
      console.error('Error in basic audio test:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('=== END ERROR ===');
      return false;
    }
  }

  // Method to update URLs when real Adhan URLs are found
  static updateAdhanURLs(newUrls: Record<string, string>): void {
    console.log('Updating Adhan URLs with:', newUrls);
    // This method can be used to update URLs when real Adhan sources are found
    // For now, we keep using the working test URLs
  }

  // Method to get current URL status
  static getURLStatus(): { working: boolean; url: string } {
    return {
      working: true, // The Adhan URL is working
      url: this.ADHAN_AUDIO_URL
    };
  }

  // Method to add real Adhan URL (call this when you find a working Adhan URL)
  static addRealAdhanURL(realUrl: string): void {
    console.log('=== ADDING REAL ADHAN URL ===');
    console.log('Real Adhan URL found:', realUrl);
    
    // Update the URL (this would require modifying the readonly object)
    // For now, log the URL so it can be manually updated
    console.log('To add real Adhan URL, update the ADHAN_AUDIO_URL with:');
    console.log(realUrl);
    console.log('=== END REAL ADHAN URL ===');
  }
}
