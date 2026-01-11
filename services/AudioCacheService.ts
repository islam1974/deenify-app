import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

// Type definitions
interface CachedSound {
  sound: Audio.Sound | null;
  timestamp: number;
}

interface CacheMetadata {
  [key: string]: {
    timestamp: number;
  }
}

/**
 * Audio Cache Service for managing audio playback with caching
 */
export class AudioCacheService {
  private static instance: AudioCacheService;

  // Private fields
  private cache: Map<string, CachedSound> = new Map();
  private initialized = false;

  // Constants
  private static readonly CACHE_KEY = 'audio_cache_metadata';
  private static readonly MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
  private static readonly MAX_SIZE = 100; // Maximum number of cached items  
  private static readonly PRELOAD_COUNT = 2; // Number of items to preload

  private constructor() {
    // Private constructor to enforce singleton
  }
  
  private cache: Map<string, CacheEntry>;
  private initialized: boolean;

  constructor() {
    this.cache = new Map();
    this.initialized = false;
    this.initialize().catch(console.error);
  }

  private async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      const savedCache = await AsyncStorage.getItem(AudioCacheService.CACHE_KEY);
      if (savedCache) {
        const cacheData = JSON.parse(savedCache);
        // Only restore the cache metadata
        Object.entries(cacheData).forEach(([url, entry]: [string, any]) => {
          if (Date.now() - entry.timestamp < AudioCacheService.MAX_CACHE_AGE) {
            this.cache.set(url, { url, sound: null, timestamp: entry.timestamp });
          }
        });
      }
    } catch (error) {
      console.error('Failed to initialize audio cache:', error);
    } finally {
      this.initialized = true;
    }
  }

  async getSound(url: string): Promise<Audio.Sound | null> {
    await this.initialize();
    
    const cached = this.cache.get(url);
    if (cached) {
      if (Date.now() - cached.timestamp > AudioCacheService.MAX_CACHE_AGE) {
        this.cache.delete(url);
        return null;
      }
      return cached.sound;
    }
    return null;
  }

  async cacheSound(url: string, sound: Audio.Sound): Promise<void> {
    await this.initialize();
    
    try {
      // Remove oldest items if cache is full
      if (this.cache.size >= AudioCacheService.MAX_CACHE_SIZE) {
        const oldest = [...this.cache.entries()]
          .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0];
        if (oldest) {
          const [oldestUrl] = oldest;
          await this.removeFromCache(oldestUrl);
        }
      }

      this.cache.set(url, { url, sound, timestamp: Date.now() });
      await this.saveCacheMetadata();
    } catch (error) {
      console.error('Failed to cache sound:', error);
    }
  }

  private async removeFromCache(url: string): Promise<void> {
    const cached = this.cache.get(url);
    if (cached?.sound) {
      try {
        await cached.sound.unloadAsync();
      } catch (error) {
        console.error('Failed to unload sound:', error);
      }
    }
    this.cache.delete(url);
    await this.saveCacheMetadata();
  }

  private async saveCacheMetadata(): Promise<void> {
    try {
      const metadata = Object.fromEntries(
        [...this.cache.entries()].map(([url, entry]) => [
          url,
          { timestamp: entry.timestamp, url: entry.url }
        ])
      );
      await AsyncStorage.setItem(AudioCacheService.CACHE_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.error('Failed to save cache metadata:', error);
    }
  }

  async preloadSounds(urls: string[]): Promise<void> {
    await this.initialize();
    
    const preloadCount = Math.min(urls.length, AudioCacheService.PRELOAD_COUNT);
    const preloadPromises = urls
      .slice(0, preloadCount)
      .map(async (url) => {
        if (!this.cache.has(url)) {
          try {
            const { sound } = await Audio.Sound.createAsync(
              { uri: url },
              { shouldPlay: false }
            );
            await this.cacheSound(url, sound);
          } catch (error) {
            console.error('Failed to preload sound:', error);
          }
        }
      });
    
    await Promise.all(preloadPromises);
  }

  async cleanup(): Promise<void> {
    // Unload all cached sounds
    const cleanupPromises = [...this.cache.keys()].map(url => this.removeFromCache(url));
    await Promise.all(cleanupPromises);
    
    try {
      await AsyncStorage.removeItem(AudioCacheService.CACHE_KEY);
    } catch (error) {
      console.error('Failed to clear cache metadata:', error);
    }
  }
}

// Helper function to get the cache directory
async function getCacheDirectory() {
  try {
    // Try to access FileSystem directory
    const dirInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory || '');
    if (dirInfo.exists) {
      return `${dirInfo.uri}/audio-cache/`;
    }
    return null;
  } catch (error) {
    console.error('Error getting cache directory:', error);
    return null;
  }
}

interface CacheEntry {
  uri: string;
  timestamp: number;
  size: number;
}

class AudioCacheService {
  private static readonly CACHE_PREFIX = 'audio_cache_';
  private static readonly CACHE_INDEX_KEY = 'audio_cache_index';
  private static readonly CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
  private static readonly CACHE_MAX_SIZE = 500 * 1024 * 1024; // 500MB
  
  private cacheIndex: { [key: string]: CacheEntry } = {};
  private cacheDir: string;
  private isInitialized = false;

  constructor() {
    // Initialize cache directory path using ExpoFileSystem base directory
    this.cacheDir = FileSystem.cacheDirectory ? `${FileSystem.cacheDirectory}audio_cache/` : '/audio_cache/';
    this.initialize();
  }

  private async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Ensure cache directory exists
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.cacheDir, { intermediates: true });
      }

      // Load cache index
      const indexJson = await AsyncStorage.getItem(AudioCacheService.CACHE_INDEX_KEY);
      if (indexJson) {
        this.cacheIndex = JSON.parse(indexJson);
        await this.cleanCache(); // Clean old entries on startup
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio cache:', error);
    }
  }

  async getCachedUri(originalUri: string): Promise<string | null> {
    await this.initialize();
    
    const cacheKey = this.getCacheKey(originalUri);
    const entry = this.cacheIndex[cacheKey];
    
    if (entry) {
      const cachedPath = `${this.cacheDir}${cacheKey}`;
      const fileInfo = await FileSystem.getInfoAsync(cachedPath);
      
      if (fileInfo.exists) {
        // Update last access time
        entry.timestamp = Date.now();
        await this.saveCacheIndex();
        return fileInfo.uri;
      } else {
        // Remove invalid entry
        delete this.cacheIndex[cacheKey];
        await this.saveCacheIndex();
      }
    }
    
    return null;
  }

  async cacheAudio(uri: string): Promise<string | null> {
    await this.initialize();
    
    try {
      const cacheKey = this.getCacheKey(uri);
      const cachedPath = `${this.cacheDir}${cacheKey}`;
      
      // Check if already cached
      const existingUri = await this.getCachedUri(uri);
      if (existingUri) return existingUri;
      
      // Download file
      const downloadResult = await FileSystem.downloadAsync(uri, cachedPath);
      
      if (downloadResult.status === 200) {
        const fileInfo = await FileSystem.getInfoAsync(cachedPath);
        
        // Update cache index
        this.cacheIndex[cacheKey] = {
          uri: uri,
          timestamp: Date.now(),
          size: fileInfo.size || 0
        };
        
        await this.saveCacheIndex();
        await this.enforceMaxSize();
        
        return downloadResult.uri;
      }
    } catch (error) {
      console.error('Failed to cache audio:', error);
    }
    
    return null;
  }

  private async cleanCache() {
    const now = Date.now();
    let hasChanges = false;
    
    for (const key of Object.keys(this.cacheIndex)) {
      const entry = this.cacheIndex[key];
      if (now - entry.timestamp > AudioCacheService.CACHE_MAX_AGE) {
        await this.removeEntry(key);
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      await this.saveCacheIndex();
    }
  }

  private async enforceMaxSize() {
    let totalSize = 0;
    const entries = Object.entries(this.cacheIndex)
      .map(([key, entry]) => ({ key, ...entry }))
      .sort((a, b) => b.timestamp - a.timestamp);
    
    for (const entry of entries) {
      totalSize += entry.size;
      if (totalSize > AudioCacheService.CACHE_MAX_SIZE) {
        await this.removeEntry(entry.key);
      }
    }
    
    await this.saveCacheIndex();
  }

  private async removeEntry(key: string) {
    try {
      const path = `${this.cacheDir}${key}`;
      await FileSystem.deleteAsync(path, { idempotent: true });
      delete this.cacheIndex[key];
    } catch (error) {
      console.error('Failed to remove cache entry:', error);
    }
  }

  private async saveCacheIndex() {
    try {
      await AsyncStorage.setItem(
        AudioCacheService.CACHE_INDEX_KEY,
        JSON.stringify(this.cacheIndex)
      );
    } catch (error) {
      console.error('Failed to save cache index:', error);
    }
  }

  private getCacheKey(uri: string): string {
    return uri.replace(/[^a-zA-Z0-9]/g, '_');
  }

  // Preload the next few verses
  async preloadVerses(uris: string[]) {
    const preloadCount = Math.min(uris.length, audioConfig.loading.preloadCount);
    const preloadPromises = uris
      .slice(0, preloadCount)
      .map(uri => this.cacheAudio(uri));
    
    await Promise.all(preloadPromises);
  }
}

export default new AudioCacheService();