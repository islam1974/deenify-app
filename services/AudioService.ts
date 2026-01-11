import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import QuranService from './QuranService';

export interface AudioState {
  isPlaying: boolean;
  currentVerse: number | null;
  currentChapter: number | null;
  duration: number;
  position: number;
}

class AudioService {
  private sound: Audio.Sound | null = null;
  private nextSound: Audio.Sound | null = null; // Preloaded next verse for gapless playback
  private nextPreparedVerseIndex: number = -1; // Which verse index the nextSound corresponds to
  private currentAudioUrl: string | null = null;
  private listeners: ((state: AudioState) => void)[] = [];
  private currentSurah: any = null;
  private currentVerseIndex: number = 0;
  private currentReciterAudioUrl: string | undefined = undefined;
  private isTransitioning: boolean = false; // Flag to prevent overlapping verse transitions
  private isProcessingFinish: boolean = false; // Flag to prevent multiple didJustFinish handlers
  private state: AudioState = {
    isPlaying: false,
    currentVerse: null,
    currentChapter: null,
    duration: 0,
    position: 0
  };

  constructor() {
    this.setupAudio();
  }

  private async setupAudio() {
    try {
      console.log('🎵 Setting up audio configuration...');
      
      // Check if Audio is available
      if (!Audio) {
        throw new Error('Audio module is not available');
      }
      
      const audioMode = {
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      };
      
      console.log('🎵 Audio mode configuration:', audioMode);
      await Audio.setAudioModeAsync(audioMode);
      
      console.log('✅ Audio setup completed successfully');
      console.log('🎵 Audio module status:', {
        isAvailable: !!Audio,
        hasSound: !!Audio.Sound,
        hasAV: !!Audio.AV
      });
    } catch (error) {
      console.error('❌ Error setting up audio:', error);
      console.error('❌ Audio setup error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        audioAvailable: !!Audio
      });
    }
  }

  private async testNetworkConnectivity(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://www.google.com', { 
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.log('❌ Network connectivity test failed:', error);
      return false;
    }
  }

  private useAudioFallback(verseNumber: number, chapterNumber: number) {
    console.log('🎵 Creating audio notification fallback...');
    this.state = {
      ...this.state,
      isPlaying: true,
      currentVerse: verseNumber,
      currentChapter: chapterNumber
    };
    this.notifyListeners();
    
    // Simulate audio playback duration (8 seconds for better UX)
    setTimeout(() => {
      this.state = {
        ...this.state,
        isPlaying: false,
        currentVerse: null,
        currentChapter: null
      };
      this.notifyListeners();
      console.log('✅ Audio notification fallback completed');
    }, 8000);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  addListener(listener: (state: AudioState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private getReciterAudioSources(chapterNumber: number, verseNumber: number, reciterId?: string): string[] {
    const reciterAudioSources: Record<string, string[]> = {
      'alafasy': [
        `https://www.everyayah.com/data/Alafasy_128kbps/${String(chapterNumber).padStart(3, '0')}${String(verseNumber).padStart(3, '0')}.mp3`,
        `https://www.everyayah.com/data/Alafasy_64kbps/${String(chapterNumber).padStart(3, '0')}${String(verseNumber).padStart(3, '0')}.mp3`,
      ],
      'husary': [
        `https://www.everyayah.com/data/Husary_128kbps/${String(chapterNumber).padStart(3, '0')}${String(verseNumber).padStart(3, '0')}.mp3`,
        `https://www.everyayah.com/data/Husary_64kbps/${String(chapterNumber).padStart(3, '0')}${String(verseNumber).padStart(3, '0')}.mp3`,
      ],
      'abdul_basit_mujawwad': [
        `https://www.everyayah.com/data/Abdul_Basit_Mujawwad_128kbps/${String(chapterNumber).padStart(3, '0')}${String(verseNumber).padStart(3, '0')}.mp3`,
        `https://www.everyayah.com/data/Abdul_Basit_Mujawwad_64kbps/${String(chapterNumber).padStart(3, '0')}${String(verseNumber).padStart(3, '0')}.mp3`,
      ],
      'salah_al_budair': [
        `https://www.everyayah.com/data/Salah_Al_Budair_128kbps/${String(chapterNumber).padStart(3, '0')}${String(verseNumber).padStart(3, '0')}.mp3`,
        `https://www.everyayah.com/data/Salah_Al_Budair_64kbps/${String(chapterNumber).padStart(3, '0')}${String(verseNumber).padStart(3, '0')}.mp3`,
      ],
      'default': [
        `https://www.everyayah.com/data/Alafasy_128kbps/${String(chapterNumber).padStart(3, '0')}${String(verseNumber).padStart(3, '0')}.mp3`,
        `https://www.everyayah.com/data/Alafasy_64kbps/${String(chapterNumber).padStart(3, '0')}${String(verseNumber).padStart(3, '0')}.mp3`,
      ],
    };

    const selectedReciter = reciterId || 'alafasy';
    return reciterAudioSources[selectedReciter] || reciterAudioSources['default'];
  }

  private async preloadNextVerse() {
    try {
      if (!this.currentSurah) return;
      const upcomingIndex = this.currentVerseIndex + 1;
      if (upcomingIndex > this.currentSurah.verses.length - 1) return;

      // Start preloading even if we already have a preloaded verse
      // This ensures we're always ready with the next verse
      // Only skip if we've already preloaded this specific verse
      if (this.nextSound && this.nextPreparedVerseIndex === upcomingIndex) return;

      const nextVerse = this.currentSurah.verses[upcomingIndex];
      const sources = this.getReciterAudioSources(this.currentSurah.id, nextVerse.verseNumber, this.currentReciterAudioUrl);
      
      // Clean any stale preloaded sound after getting new sources to minimize gap
      if (this.nextSound) {
        try {
          const status = await this.nextSound.getStatusAsync();
          if (status.isLoaded) {
            await this.nextSound.unloadAsync();
          }
        } catch {}
        this.nextSound = null;
      }

      let preloaded: Audio.Sound | null = null;
      for (let i = 0; i < sources.length; i++) {
        try {
          const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Preload timeout')), 1500)); // Reduced timeout
          const createPromise = Audio.Sound.createAsync(
            { uri: sources[i] },
            {
              shouldPlay: false,
              isLooping: false,
              volume: 1.0,
              rate: 1.0,
              shouldCorrectPitch: true,
              progressUpdateIntervalMillis: 200,
            },
            null,
            true // Download first
          );
          const { sound } = await Promise.race([createPromise, timeoutPromise]);
          // Skip status check to reduce latency - the download flag ensures it's ready
          preloaded = sound;
          break;
        } catch {
          continue;
        }
      }

      if (preloaded) {
        this.nextSound = preloaded;
        this.nextPreparedVerseIndex = upcomingIndex;
        // Do not attach status update until promoted to current to avoid duplicate callbacks
      }
    } catch (e) {
      // Ignore preload errors; we'll fall back to normal load
    }
  }

  async playVerse(audioUrl: string, chapterNumber: number, verseNumber: number, reciterId?: string) {
    try {
      const isContinuousMode = this.currentSurah !== null;
      console.log(`🎵 playVerse called - Chapter: ${chapterNumber}, Verse: ${verseNumber}, Continuous: ${isContinuousMode}`);
      
      // Stop current audio completely if playing
      if (this.sound) {
        try {
          const status = await this.sound.getStatusAsync();
          if (status.isLoaded) {
            // Critical: Remove callback FIRST to prevent any more updates
            this.sound.setOnPlaybackStatusUpdate(null);
            await this.sound.stopAsync();
            await this.sound.unloadAsync();
          }
        } catch (error) {
          console.log('⚠️ Error stopping previous audio:', error);
        }
        this.sound = null;
      }

      // If same verse is clicked, toggle play/pause
      if (this.currentAudioUrl === audioUrl && this.state.isPlaying) {
        await this.pause();
        return;
      }
      
      // Reset processing flag (but preserve continuous mode context)
      this.isProcessingFinish = false;

      // Skip network test - audio loading will fail fast if no network
      // Load audio immediately

      const audioSources = this.getReciterAudioSources(chapterNumber, verseNumber, reciterId);

      let sound: Audio.Sound | null = null;
      let lastError: Error | null = null;

      // Try each audio source until one works
      for (let i = 0; i < audioSources.length; i++) {
        const source = audioSources[i];
        try {
          // Create a timeout promise for faster failure recovery
          const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Audio loading timeout')), 3000) // Reduced from 5000ms to 3000ms
          );
          
          // Create the audio loading promise - auto-play for faster startup
          const audioPromise = Audio.Sound.createAsync(
            { uri: source },
            { 
              shouldPlay: true, // Auto-play as soon as loaded
              isLooping: false,
              volume: 1.0,
              rate: 1.0,
              shouldCorrectPitch: true,
              progressUpdateIntervalMillis: 500, // More frequent updates for smoother transitions
            },
            this.onPlaybackStatusUpdate.bind(this)
          );
          
          // Race between audio loading and timeout
          const { sound: newSound } = await Promise.race([audioPromise, timeoutPromise]);
          
          // Test if the audio actually loaded
          const status = await newSound.getStatusAsync();
          
          if (status.isLoaded) {
            sound = newSound;
            break; // Success, exit loop
          } else {
            await newSound.unloadAsync();
            continue;
          }
        } catch (error) {
          lastError = error as Error;
          continue; // Try next source
        }
      }

      if (!sound) {
        this.useAudioFallback(verseNumber, chapterNumber);
        return;
      }

      this.sound = sound;
      this.currentAudioUrl = audioUrl;
      
      this.state = {
        ...this.state,
        isPlaying: true,
        currentVerse: verseNumber,
        currentChapter: chapterNumber
      };
      
      this.notifyListeners();

      // Proactively preload the next verse for gapless playback (only in continuous mode)
      if (this.currentSurah) {
        console.log('🔄 Preloading next verse for continuous playback...');
        this.preloadNextVerse();
      }
    } catch (error) {
      console.error('❌ Error playing verse:', error);
      this.state = {
        ...this.state,
        isPlaying: false,
        currentVerse: null,
        currentChapter: null
      };
      this.notifyListeners();
      throw error;
    }
  }

  async pause() {
    if (this.sound) {
      try {
        const status = await this.sound.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await this.sound.pauseAsync();
          this.state = { ...this.state, isPlaying: false };
          this.notifyListeners();
          console.log('⏸️ Audio paused');
        } else {
          console.log('⏸️ Cannot pause - audio not playing or not loaded');
        }
      } catch (error) {
        console.error('❌ Error pausing audio:', error);
      }
    }
  }

  async resume() {
    if (this.sound) {
      try {
        const status = await this.sound.getStatusAsync();
        if (status.isLoaded) {
          await this.sound.playAsync();
          this.state = { ...this.state, isPlaying: true };
          this.notifyListeners();
          console.log('▶️ Audio resumed');
        } else {
          console.log('⚠️ Cannot resume - sound not loaded');
        }
      } catch (error) {
        console.error('❌ Error resuming audio:', error);
      }
    }
  }

  async stop() {
    console.log('🎵 Stopping audio...');
    
    // Clean up current sound
    if (this.sound) {
      try {
        // Check if sound is loaded before trying to stop
        const status = await this.sound.getStatusAsync();
        
        if (status.isLoaded) {
          console.log('🎵 Sound is loaded, stopping...');
          // Remove callback first to prevent any more updates
          this.sound.setOnPlaybackStatusUpdate(null);
          await this.sound.stopAsync();
          await this.sound.unloadAsync();
          console.log('🎵 Audio stopped and unloaded successfully');
        } else {
          console.log('🎵 Sound already unloaded, just clearing reference');
        }
      } catch (error) {
        console.error('❌ Error stopping/unloading audio:', error);
        // Try to unload anyway in case it's in a weird state
        try {
          await this.sound.unloadAsync();
        } catch (unloadError) {
          console.log('🎵 Could not unload, sound may already be unloaded');
        }
      }
      this.sound = null;
      this.currentAudioUrl = null;
      this.currentReciterAudioUrl = null;
    }
    
    // Clear any preloaded next sound
    if (this.nextSound) {
      try {
        const status = await this.nextSound.getStatusAsync();
        if (status.isLoaded) {
          await this.nextSound.unloadAsync();
        }
      } catch {}
      this.nextSound = null;
      this.nextPreparedVerseIndex = -1;
    }

    // Clear surah playback state
    this.currentSurah = null;
    this.currentVerseIndex = 0;
    this.isTransitioning = false; // Reset transition lock
    this.isProcessingFinish = false; // Reset finish processing flag
    
    // Update state
    this.state = {
      isPlaying: false,
      currentVerse: null,
      currentChapter: null,
      duration: 0,
      position: 0
    };
    this.notifyListeners();
  }

  async playFullSurah(chapter: any, reciterId?: string) {
    try {
      if (chapter.verses && chapter.verses.length > 0) {
        console.log('🎵 Starting full surah playback');
        console.log('📖 Chapter:', chapter.nameTransliterated || chapter.name);
        console.log('📊 Total verses:', chapter.verses.length);
        console.log('🎙️ Reciter:', reciterId || 'default');
        
        // Reset all flags
        this.isTransitioning = false;
        this.isProcessingFinish = false;
        
        // Set up automatic progression through verses FIRST
        this.setupSurahPlayback(chapter, reciterId);
        
        // Start with the first verse
        const firstVerse = chapter.verses[0];
        console.log('▶️ Playing first verse:', firstVerse.verseNumber);
        
        await this.playVerse(firstVerse.audioUrl, chapter.id, firstVerse.verseNumber, reciterId);
        console.log('✅ First verse started, continuous mode enabled');
      }
    } catch (error) {
      console.error('❌ Error playing full surah:', error);
      this.state = {
        ...this.state,
        isPlaying: false,
        currentVerse: null,
        currentChapter: null
      };
      this.notifyListeners();
      throw error;
    }
  }

  private setupSurahPlayback(chapter: any, reciterId?: string) {
    console.log('🔧 Setting up continuous surah playback mode');
    this.currentSurah = chapter;
    this.currentVerseIndex = 0;
    this.currentReciterAudioUrl = reciterId || undefined;
    console.log('✅ Surah context initialized:', {
      chapter: chapter.nameTransliterated || chapter.name,
      verses: chapter.verses.length,
      reciter: reciterId || 'default'
    });
  }

  private async playNextVerse() {
    // Prevent overlapping calls
    if (this.isTransitioning) {
      console.log('⚠️ Already transitioning to next verse, ignoring duplicate call');
      return;
    }
    
    if (!this.currentSurah || this.currentVerseIndex >= this.currentSurah.verses.length - 1) {
      // End of surah
      console.log('🏁 End of surah reached');
      this.isTransitioning = false;
      await this.stop();
      return;
    }
    
    this.isTransitioning = true; // Lock to prevent concurrent calls
    console.log(`🔄 Transitioning from verse ${this.currentVerseIndex + 1} to ${this.currentVerseIndex + 2}`);
    
    try {
      const targetIndex = this.currentVerseIndex + 1;
      const nextVerse = this.currentSurah.verses[targetIndex];
      
      console.log(`⏭️ Playing next verse: ${nextVerse.verseNumber} (${targetIndex + 1}/${this.currentSurah.verses.length})`);
      
      // Update index BEFORE playing to ensure context is correct
      this.currentVerseIndex = targetIndex;
      
      // Play the verse (this will also set up the status callback)
      await this.playVerse(
        nextVerse.audioUrl!, 
        this.currentSurah.id, 
        nextVerse.verseNumber, 
        this.currentReciterAudioUrl
      );
      
      console.log('✅ Next verse started successfully');
      this.isTransitioning = false; // Unlock
      
    } catch (error) {
      console.error('❌ Error playing next verse:', error);
      this.isTransitioning = false; // Unlock even on error
      
      // Try to continue with the verse after next
      if (this.currentSurah && this.currentVerseIndex < this.currentSurah.verses.length - 1) {
        console.log('⏭️ Skipping problematic verse, trying next one...');
        setTimeout(() => this.playNextVerse(), 100);
      } else {
        // Stop playback if we're at the end or can't continue
        await this.stop();
      }
    }
  }

  private onPlaybackStatusUpdate = async (status: any) => {
    if (status.isLoaded) {
      this.state = {
        ...this.state,
        duration: status.durationMillis || 0,
        position: status.positionMillis || 0,
        isPlaying: status.isPlaying || false
      };

      // If playback finished
      if (status.didJustFinish && !this.isProcessingFinish) {
        this.isProcessingFinish = true; // Prevent duplicate calls
        console.log('🎵 Verse finished, checking for next verse...');
        console.log('📖 Current surah context:', this.currentSurah ? `${this.currentSurah.nameTransliterated} (${this.currentVerseIndex + 1}/${this.currentSurah.verses.length})` : 'None');
        
        // Check if we're in continuous playback mode
        if (this.currentSurah && this.currentVerseIndex < this.currentSurah.verses.length - 1) {
          console.log('⏭️ Auto-advancing to next verse...');
          
          // Small delay to ensure clean transition
          setTimeout(async () => {
            try {
              await this.playNextVerse();
            } catch (error) {
              console.error('❌ Error in auto-advance:', error);
            } finally {
              this.isProcessingFinish = false;
            }
          }, 100);
        } else {
          console.log('🎵 End of surah or single verse playback');
          this.isProcessingFinish = false;
          this.state = {
            ...this.state,
            isPlaying: false,
            currentVerse: null,
            currentChapter: null
          };
          this.notifyListeners();
        }
      }

      this.notifyListeners();
    }
  };

  getCurrentState(): AudioState {
    return { ...this.state };
  }

  async cleanup() {
    console.log('🎵 Cleaning up AudioService...');
    try {
      await this.stop();
    } catch (error) {
      console.error('❌ Error during cleanup stop:', error);
    }
    this.listeners = [];
    this.currentSurah = null;
    this.currentVerseIndex = 0;
    this.currentReciterAudioUrl = undefined;
    this.isTransitioning = false;
    this.isProcessingFinish = false;
    if (this.nextSound) {
      try {
        const status = await this.nextSound.getStatusAsync();
        if (status.isLoaded) {
          await this.nextSound.unloadAsync();
        }
      } catch {}
      this.nextSound = null;
      this.nextPreparedVerseIndex = -1;
    }
  }
}

export default new AudioService();
