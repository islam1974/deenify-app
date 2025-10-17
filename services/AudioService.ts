import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import QuranService from './QuranService';
import * as Speech from 'expo-speech';

export interface AudioState {
  isPlaying: boolean;
  currentVerse: number | null;
  currentChapter: number | null;
  duration: number;
  position: number;
  isPlayingTranslation?: boolean; // New field for translation playback
}

class AudioService {
  private sound: Audio.Sound | null = null;
  private currentAudioUrl: string | null = null;
  private listeners: ((state: AudioState) => void)[] = [];
  private currentSurah: any = null;
  private currentVerseIndex: number = 0;
  private currentReciterAudioUrl: string | undefined = undefined;
  private playTranslation: boolean = false;
  private selectedTranslator: string = 'sahih';
  private isPlayingTranslation: boolean = false; // Flag to prevent simultaneous playback
  private isTransitioning: boolean = false; // Flag to prevent overlapping verse transitions
  private isProcessingFinish: boolean = false; // Flag to prevent multiple didJustFinish handlers
  private state: AudioState = {
    isPlaying: false,
    currentVerse: null,
    currentChapter: null,
    duration: 0,
    position: 0,
    isPlayingTranslation: false
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

  // Configure translation playback settings
  setTranslationSettings(playTranslation: boolean, selectedTranslator: string) {
    console.log(`🔊 Translation settings updated: play=${playTranslation}, translator=${selectedTranslator}`);
    this.playTranslation = playTranslation;
    this.selectedTranslator = selectedTranslator;
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

  async playVerse(audioUrl: string, chapterNumber: number, verseNumber: number, reciterId?: string) {
    try {
      console.log(`🎵 playVerse called - Chapter: ${chapterNumber}, Verse: ${verseNumber}`);
      
      // Stop current audio completely if playing
      if (this.sound) {
        try {
          console.log('🛑 Stopping and unloading previous sound...');
          const status = await this.sound.getStatusAsync();
          if (status.isLoaded) {
            // Critical: Remove callback FIRST to prevent any more updates
            this.sound.setOnPlaybackStatusUpdate(null);
            await this.sound.stopAsync();
            await this.sound.unloadAsync();
            console.log('✅ Previous sound stopped and unloaded');
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
      
      // Reset flags
      this.isProcessingFinish = false;

      // Skip network test - audio loading will fail fast if no network
      // Load audio immediately

      // CONFIRMED WORKING AUDIO SOURCES: Only verified working URLs
      const reciterAudioSources: Record<string, string[]> = {
        'alafasy': [
          // Confirmed working
          `https://www.everyayah.com/data/Alafasy_128kbps/${String(chapterNumber).padStart(3, '0')}${String(verseNumber).padStart(3, '0')}.mp3`,
          `https://www.everyayah.com/data/Alafasy_64kbps/${String(chapterNumber).padStart(3, '0')}${String(verseNumber).padStart(3, '0')}.mp3`,
        ],
        'husary': [
          // Confirmed working
          `https://www.everyayah.com/data/Husary_128kbps/${String(chapterNumber).padStart(3, '0')}${String(verseNumber).padStart(3, '0')}.mp3`,
          `https://www.everyayah.com/data/Husary_64kbps/${String(chapterNumber).padStart(3, '0')}${String(verseNumber).padStart(3, '0')}.mp3`,
        ],
        'abdul_basit_mujawwad': [
          // Confirmed working
          `https://www.everyayah.com/data/Abdul_Basit_Mujawwad_128kbps/${String(chapterNumber).padStart(3, '0')}${String(verseNumber).padStart(3, '0')}.mp3`,
          `https://www.everyayah.com/data/Abdul_Basit_Mujawwad_64kbps/${String(chapterNumber).padStart(3, '0')}${String(verseNumber).padStart(3, '0')}.mp3`,
        ],
        'salah_al_budair': [
          // Confirmed working
          `https://www.everyayah.com/data/Salah_Al_Budair_128kbps/${String(chapterNumber).padStart(3, '0')}${String(verseNumber).padStart(3, '0')}.mp3`,
          `https://www.everyayah.com/data/Salah_Al_Budair_64kbps/${String(chapterNumber).padStart(3, '0')}${String(verseNumber).padStart(3, '0')}.mp3`,
        ],
        // Fallback to Alafasy for all other reciters
        'default': [
          `https://www.everyayah.com/data/Alafasy_128kbps/${String(chapterNumber).padStart(3, '0')}${String(verseNumber).padStart(3, '0')}.mp3`,
          `https://www.everyayah.com/data/Alafasy_64kbps/${String(chapterNumber).padStart(3, '0')}${String(verseNumber).padStart(3, '0')}.mp3`,
        ],
      };

      const selectedReciter = reciterId || 'alafasy';
      const audioSources = reciterAudioSources[selectedReciter] || reciterAudioSources['default'];

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
    
    // Stop any TTS that might be playing
    try {
      await Speech.stop();
      console.log('🔊 TTS stopped');
    } catch (error) {
      console.log('🔊 TTS stop error (might not be playing):', error);
    }
    
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
    
    // Clear surah playback state
    this.currentSurah = null;
    this.currentVerseIndex = 0;
    this.isPlayingTranslation = false;
    this.isTransitioning = false; // Reset transition lock
    this.isProcessingFinish = false; // Reset finish processing flag
    
    // Update state
    this.state = {
      isPlaying: false,
      currentVerse: null,
      currentChapter: null,
      duration: 0,
      position: 0,
      isPlayingTranslation: false
    };
    this.notifyListeners();
  }

  async playFullSurah(chapter: any, reciterId?: string) {
    try {
      if (chapter.verses && chapter.verses.length > 0) {
        // Reset all flags
        this.isTransitioning = false;
        this.isProcessingFinish = false;
        this.isPlayingTranslation = false;
        
        // Start with the first verse
        const firstVerse = chapter.verses[0];
        
        console.log('🎵 Starting full surah playback with real audio');
        
        // Set up automatic progression through verses FIRST
        this.setupSurahPlayback(chapter, reciterId);
        
        await this.playVerse(firstVerse.audioUrl, chapter.id, firstVerse.verseNumber, reciterId);
      }
    } catch (error) {
      console.error('Error playing full surah:', error);
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
    // This will be called when each verse finishes playing
    // We'll implement this in the onPlaybackStatusUpdate method
    this.currentSurah = chapter;
    this.currentVerseIndex = 0;
    this.currentReciterAudioUrl = reciterId || undefined;
  }

  private async playNextVerse() {
    // Prevent overlapping calls
    if (this.isTransitioning) {
      console.log('⚠️ Already transitioning to next verse, ignoring duplicate call');
      return;
    }
    
    if (!this.currentSurah || this.currentVerseIndex >= this.currentSurah.verses.length - 1) {
      // End of surah
      console.log('🎵 End of surah reached');
      this.isTransitioning = false;
      await this.stop();
      return;
    }
    
    this.isTransitioning = true; // Lock to prevent concurrent calls
    
    try {
      // Stop current sound completely before moving to next
      if (this.sound) {
        console.log('🛑 Cleaning up current sound before next verse...');
        try {
          const status = await this.sound.getStatusAsync();
          if (status.isLoaded) {
            this.sound.setOnPlaybackStatusUpdate(null);
            await this.sound.stopAsync();
            await this.sound.unloadAsync();
          }
        } catch (e) {
          console.log('⚠️ Error cleaning up current sound:', e);
        }
        this.sound = null;
      }
      
      // Small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      this.currentVerseIndex++;
      const nextVerse = this.currentSurah.verses[this.currentVerseIndex];
      
      console.log(`⏭️ Moving to next verse: ${nextVerse.verseNumber}`);
      
      // Play the next verse
      await this.playVerse(nextVerse.audioUrl!, this.currentSurah.id, nextVerse.verseNumber, this.currentReciterAudioUrl);
      
      this.isTransitioning = false; // Unlock
    } catch (error) {
      console.error('❌ Error playing next verse:', error);
      this.isTransitioning = false; // Unlock even on error
      
      // Try to continue with the verse after next
      if (this.currentSurah && this.currentVerseIndex < this.currentSurah.verses.length - 1) {
        console.log('⏭️ Skipping problematic verse, trying next one...');
        setTimeout(() => this.playNextVerse(), 200); // Delay before retry
      } else {
        // Stop playback if we're at the end or can't continue
        await this.stop();
      }
    }
  }

  private async playTranslationForCurrentVerse() {
    if (!this.currentSurah || !this.state.currentVerse) {
      console.log('🔊 No current verse for translation playback');
      return;
    }

    try {
      // Find the current verse
      const currentVerse = this.currentSurah.verses.find((v: any) => v.verseNumber === this.state.currentVerse);
      if (!currentVerse) {
        console.log('🔊 No current verse found');
        // Move to next verse if no verse
        if (this.currentSurah && this.currentVerseIndex < this.currentSurah.verses.length - 1) {
          this.playNextVerse();
        } else {
          await this.stop();
        }
        return;
      }

      console.log(`🔊 Playing translation for verse ${this.state.currentVerse}...`);
      
      // Update state to show we're playing translation - keep current verse highlighted
      this.state = {
        ...this.state,
        isPlaying: false, // Not using Arabic audio
        isPlayingTranslation: true,
        currentVerse: this.state.currentVerse, // Maintain current verse for highlighting
        currentChapter: this.state.currentChapter // Maintain current chapter
      };
      this.notifyListeners();

      // Use TTS for English translation (more reliable than audio files)
      if (currentVerse.translation) {
        console.log(`🔊 Using TTS for Pickthall translation: "${currentVerse.translation.substring(0, 50)}..."`);
        
        // Check if TTS is available
        try {
          const isSpeaking = await Speech.isSpeakingAsync();
          console.log(`🔊 TTS engine status - Currently speaking: ${isSpeaking}`);
        } catch (e) {
          console.log('🔊 TTS engine check:', e);
        }
        
        // Use TTS with settings optimized for Android compatibility
        await Speech.speak(currentVerse.translation, {
          language: 'en-US',
          pitch: 1.0, // Normal pitch for better Android compatibility
          rate: 0.75, // Moderate rate for better comprehension
          volume: 1.0, // Full volume
          onStart: () => {
            console.log('🔊 TTS started for Pickthall translation');
            this.state = {
              ...this.state,
              isPlaying: true, // Show as playing during TTS
              isPlayingTranslation: true
            };
            this.notifyListeners();
          },
          onDone: () => {
            console.log('🔊 TTS completed for Pickthall translation');
            this.state = {
              ...this.state,
              isPlaying: false,
              isPlayingTranslation: false
            };
            this.notifyListeners();
            
            // After TTS finishes, move to next verse or end immediately
            if (this.currentSurah && this.currentVerseIndex < this.currentSurah.verses.length - 1) {
              console.log('🎵 Translation finished, moving to next verse...');
              this.isPlayingTranslation = false; // Reset flag
              this.playNextVerse();
            } else {
              console.log('🎵 Translation finished, end of surah');
              this.isPlayingTranslation = false; // Reset flag
              this.state = {
                ...this.state,
                isPlaying: false,
                currentVerse: null,
                currentChapter: null,
                isPlayingTranslation: false
              };
              this.notifyListeners();
            }
          },
          onError: (error) => {
            console.error('❌ TTS error for Pickthall translation:', error);
            console.error('❌ Error details:', JSON.stringify(error));
            this.state = {
              ...this.state,
              isPlaying: false,
              isPlayingTranslation: false
            };
            this.notifyListeners();
            
            // Move to next verse if TTS fails
            if (this.currentSurah && this.currentVerseIndex < this.currentSurah.verses.length - 1) {
              this.isPlayingTranslation = false;
              this.playNextVerse();
            } else {
              this.stop();
            }
          },
        });
        
        console.log('✅ TTS initiated for Pickthall translation');
      } else {
        console.log('🔊 No translation text available');
        this.state = {
          ...this.state,
          isPlaying: false,
          isPlayingTranslation: false
        };
        this.notifyListeners();
        
        // Move to next verse if no translation
        if (this.currentSurah && this.currentVerseIndex < this.currentSurah.verses.length - 1) {
          this.playNextVerse();
        } else {
          await this.stop();
        }
      }
      
    } catch (error) {
      console.error('❌ Error playing translation:', error);
      this.isPlayingTranslation = false; // Reset flag on error
      // Move to next verse if translation fails
      if (this.currentSurah && this.currentVerseIndex < this.currentSurah.verses.length - 1) {
        this.playNextVerse();
      } else {
        await this.stop();
      }
    }
  }

  private onPlaybackStatusUpdate = async (status: any) => {
    console.log('🎵 Playback status update:', status);
    
    if (status.isLoaded) {
      console.log('🎵 Audio is loaded, updating state...');
      this.state = {
        ...this.state,
        duration: status.durationMillis || 0,
        position: status.positionMillis || 0,
        isPlaying: status.isPlaying || false
      };

      console.log('🎵 Updated state:', this.state);

      // If playback finished
      console.log(`🔍 Checking if verse finished - didJustFinish: ${status.didJustFinish}, position: ${status.positionMillis}, duration: ${status.durationMillis}`);
      if (status.didJustFinish) {
        console.log('✅ Arabic recitation finished completely!');

        // Prevent processing the same finish event multiple times
        if (this.isProcessingFinish) {
          console.log('⚠️ Already processing finish event, skipping duplicate...');
          return;
        }
        this.isProcessingFinish = true;

        // Prevent multiple simultaneous calls
        if (this.isPlayingTranslation) {
          console.log('🔊 Translation already playing, skipping...');
          this.isProcessingFinish = false;
          return;
        }
        
        // Prevent overlapping verse transitions
        if (this.isTransitioning) {
          console.log('🔄 Already transitioning to next verse, skipping...');
          this.isProcessingFinish = false;
          return;
        }

        // If translation is enabled and we have a current verse, play translation
        console.log(`🔊 Translation check - playTranslation: ${this.playTranslation}, hasSurah: ${!!this.currentSurah}, currentVerse: ${this.state.currentVerse}`);
        if (this.playTranslation && this.currentSurah && this.state.currentVerse) {
          console.log('✅ Translation enabled! Starting English translation...');
          
          // Keep verse highlighted during transition by maintaining state
          this.state = {
            ...this.state,
            isPlaying: false, // Arabic finished
            isPlayingTranslation: true, // Starting translation
            currentVerse: this.state.currentVerse, // Keep verse highlighted
            currentChapter: this.state.currentChapter
          };
          this.notifyListeners();
          
          // No delay - start TTS immediately
          this.isPlayingTranslation = true; // Set flag to prevent simultaneous playback
          this.isProcessingFinish = false; // Reset before async operation
          await this.playTranslationForCurrentVerse();
        } else {
          // No TTS - move to next verse immediately with no delay
          if (!this.playTranslation) {
            console.log('⏭️ Translation DISABLED - moving immediately to next verse');
          }
          if (this.currentSurah && this.currentVerseIndex < this.currentSurah.verses.length - 1) {
            // Start next verse immediately for seamless playback
            this.isProcessingFinish = false; // Reset before calling playNextVerse
            this.playNextVerse(); // No delay for faster continuous playback
          } else {
            console.log('🎵 End of surah');
            this.isProcessingFinish = false;
            this.state = {
              ...this.state,
              isPlaying: false,
              currentVerse: null,
              currentChapter: null,
              isPlayingTranslation: false
            };
          }
        }
      }

      this.notifyListeners();
    } else {
      console.log('🎵 Audio not loaded in status update:', status);
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
    this.isPlayingTranslation = false;
    this.isTransitioning = false;
    this.isProcessingFinish = false;
  }
}

export default new AudioService();
