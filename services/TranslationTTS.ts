import * as Speech from 'expo-speech';
import CloudTTS from './CloudTTS';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLOUD_TTS_CONFIG_KEY = '@deenify_cloud_tts_config';

export interface TranslationTTSState {
  isPlaying: boolean;
  currentText: string | null;
  currentLanguage: string | null;
}

export interface TTSVoice {
  id: string;
  name: string;
  language: string;
  quality: 'default' | 'enhanced';
  gender: 'male' | 'female' | 'unknown';
}

class TranslationTTSService {
  private listeners: ((state: TranslationTTSState) => void)[] = [];
  private state: TranslationTTSState = {
    isPlaying: false,
    currentText: null,
    currentLanguage: null,
  };
  private selectedVoice: string | null = null;
  private useCloudTTS: boolean = false;

  constructor() {
    this.setupSpeech();
  }

  private async setupSpeech() {
    try {
      console.log('🔊 Setting up Text-to-Speech service...');
      
      // Check if Speech is available
      if (!Speech) {
        throw new Error('Speech module is not available');
      }
      
      // Load Cloud TTS configuration
      await this.loadCloudTTSConfig();
      
      // Auto-select the best male voice for Quranic recitation
      await this.autoSelectMaleVoice();
      
      console.log('✅ Text-to-Speech service initialized');
    } catch (error) {
      console.error('❌ Error setting up Text-to-Speech:', error);
    }
  }

  // Load Cloud TTS configuration
  private async loadCloudTTSConfig(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(CLOUD_TTS_CONFIG_KEY);
      if (saved) {
        const config = JSON.parse(saved);
        this.useCloudTTS = config.enabled && config.provider !== 'system' && config.apiKey;
        
        if (this.useCloudTTS) {
          CloudTTS.configure({
            provider: config.provider,
            apiKey: config.apiKey,
            voice: config.voice,
          });
          console.log(`🔊 Cloud TTS enabled: ${config.provider}`);
        }
      }
    } catch (error) {
      console.error('❌ Error loading Cloud TTS config:', error);
    }
  }

  // Automatically select the best male voice
  private async autoSelectMaleVoice(): Promise<void> {
    try {
      const maleVoices = await this.getMaleVoices();
      
      if (maleVoices.length > 0) {
        // Select the first (best) male voice
        const bestMaleVoice = maleVoices[0];
        this.selectedVoice = bestMaleVoice.id;
        console.log(`🔊 Auto-selected male voice: ${bestMaleVoice.name} (${bestMaleVoice.quality})`);
      } else {
        // Fallback to any enhanced voice
        const allVoices = await this.getAvailableVoices();
        const enhancedVoice = allVoices.find(voice => voice.quality === 'enhanced');
        if (enhancedVoice) {
          this.selectedVoice = enhancedVoice.id;
          console.log(`🔊 Auto-selected enhanced voice: ${enhancedVoice.name}`);
        }
      }
    } catch (error) {
      console.error('❌ Error auto-selecting voice:', error);
    }
  }

  async speakTranslation(text: string, language: string = 'en-US'): Promise<void> {
    try {
      console.log(`🔊 Speaking translation: "${text.substring(0, 50)}..."`);
      console.log(`🔊 Language: ${language}`);
      
      // Check if Speech is available (Android specific check)
      const isSpeechAvailable = await Speech.isSpeakingAsync().catch(() => false);
      console.log(`🔊 Speech availability check: ${isSpeechAvailable !== undefined}`);
      
      // Stop any current speech first
      await this.stop();
      
      // Small delay to ensure previous speech is fully stopped
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Preprocess text for more natural speech
      const processedText = this.preprocessText(text);
      console.log(`🔊 Processed text length: ${processedText.length} characters`);
      console.log(`🔊 Using Cloud TTS: ${this.useCloudTTS}`);
      
      // Update state
      this.state = {
        isPlaying: true,
        currentText: text,
        currentLanguage: language,
      };
      this.notifyListeners();
      
      // Use Cloud TTS if configured, otherwise fallback to system TTS
      if (this.useCloudTTS) {
        console.log('🔊 Using Cloud TTS API for translation');
        await CloudTTS.speak(processedText, {
          onStart: () => {
            console.log('✅ Cloud TTS translation started');
            this.state = { ...this.state, isPlaying: true };
            this.notifyListeners();
          },
          onDone: () => {
            console.log('✅ Cloud TTS translation completed');
            this.state = {
              isPlaying: false,
              currentText: null,
              currentLanguage: null,
            };
            this.notifyListeners();
          },
          onError: (error) => {
            console.error('❌ Cloud TTS error, falling back to system TTS:', error);
            // Fallback to system TTS on error
            this.speakWithSystemTTS(processedText, language);
          },
        });
      } else {
        console.log('🔊 Using system TTS for translation');
        await this.speakWithSystemTTS(processedText, language);
      }
      
    } catch (error) {
      console.error('❌ Error speaking translation:', error);
      console.error('❌ Error details:', JSON.stringify(error));
      this.state = {
        isPlaying: false,
        currentText: null,
        currentLanguage: null,
      };
      this.notifyListeners();
      throw error;
    }
  }

  // Speak using system TTS
  private async speakWithSystemTTS(text: string, language: string): Promise<void> {
    const speechOptions: Speech.SpeechOptions = {
      language: language,
      pitch: 1.0,
      rate: 0.75,
      volume: 1.0,
      ...(this.selectedVoice ? { voice: this.selectedVoice } : {}),
      onStart: () => {
        console.log('✅ System TTS translation started');
        this.state = { ...this.state, isPlaying: true };
        this.notifyListeners();
      },
      onDone: () => {
        console.log('✅ System TTS translation completed');
        this.state = {
          isPlaying: false,
          currentText: null,
          currentLanguage: null,
        };
        this.notifyListeners();
      },
      onStopped: () => {
        console.log('⏹️ System TTS stopped');
        this.state = {
          isPlaying: false,
          currentText: null,
          currentLanguage: null,
        };
        this.notifyListeners();
      },
      onError: (error) => {
        console.error('❌ System TTS error:', error);
        this.state = {
          isPlaying: false,
          currentText: null,
          currentLanguage: null,
        };
        this.notifyListeners();
      },
    };
    
    await Speech.speak(text, speechOptions);
  }

  // Get available voices for better speech quality
  async getAvailableVoices(): Promise<TTSVoice[]> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices
        .filter(voice => voice.language.startsWith('en'))
        .map(voice => ({
          id: voice.identifier,
          name: voice.name,
          language: voice.language,
          quality: voice.quality === Speech.VoiceQuality.Enhanced ? 'enhanced' : 'default',
          gender: this.detectVoiceGender(voice.name) // Detect if voice is male/female
        }))
        .sort((a, b) => {
          // Prefer enhanced voices first
          if (a.quality === 'enhanced' && b.quality !== 'enhanced') return -1;
          if (b.quality === 'enhanced' && a.quality !== 'enhanced') return 1;
          // Then prefer male voices for Quranic recitation
          if (a.gender === 'male' && b.gender !== 'male') return -1;
          if (b.gender === 'male' && a.gender !== 'male') return 1;
          return a.name.localeCompare(b.name);
        });
    } catch (error) {
      console.error('❌ Error getting available voices:', error);
      return [];
    }
  }

  // Detect voice gender based on voice name
  private detectVoiceGender(voiceName: string): 'male' | 'female' | 'unknown' {
    const name = voiceName.toLowerCase();
    
    // Log for debugging
    console.log(`🔍 Detecting gender for voice: ${voiceName}`);
    
    // Common male voice indicators (iOS and Android)
    const maleIndicators = [
      // iOS voices
      'alex', 'daniel', 'fred', 'oliver', 'aaron', 'evan', 'nicky',
      // Android voices - pattern matching
      'male', '#male', 'man', 'guy', 'boy', '-male', '_male',
      // Common male names
      'david', 'mark', 'nick', 'paul', 'ralph', 'simon', 'tom',
      'alexander', 'michael', 'james', 'john', 'robert', 'george',
      'william', 'richard', 'charles', 'thomas', 'christopher', 'anthony',
      'matthew', 'donald', 'andrew', 'joseph', 'kenneth', 'kevin', 'ryan',
      'benjamin', 'logan', 'nathan', 'tyler', 'jacob', 'ethan', 'joshua',
      // Android TTS specific patterns
      'en-us-male', 'en-gb-male', 'en-au-male', 'en-in-male',
      'en_us_male', 'en_gb_male', 'en_au_male', 'en_in_male'
    ];
    
    // Common female voice indicators (iOS and Android)
    const femaleIndicators = [
      // iOS voices
      'samantha', 'susan', 'allison', 'ava', 'kate', 'tessa', 'moira',
      'karen', 'fiona', 'victoria', 'catherine', 'amelie',
      // Android voices - pattern matching
      'female', '#female', 'woman', 'lady', 'girl', '-female', '_female',
      // Common female names
      'linda', 'patricia', 'jennifer', 'elizabeth', 'maria', 'sarah',
      'lisa', 'nancy', 'helen', 'sandra', 'donna', 'carol', 'ruth',
      'sharon', 'michelle', 'laura', 'kimberly', 'deborah', 'dorothy',
      'zira', 'hazel', 'emily', 'anna', 'alice', 'lucy', 'sophie',
      'jessica', 'ashley', 'nicole', 'amanda', 'brittany', 'samantha',
      // Android TTS specific patterns
      'en-us-female', 'en-gb-female', 'en-au-female', 'en-in-female',
      'en_us_female', 'en_gb_female', 'en_au_female', 'en_in_female'
    ];
    
    // Check for male indicators first (prioritize for religious content)
    if (maleIndicators.some(indicator => name.includes(indicator))) {
      console.log(`✅ Detected MALE voice: ${voiceName}`);
      return 'male';
    }
    
    // Check for female indicators
    if (femaleIndicators.some(indicator => name.includes(indicator))) {
      console.log(`❌ Detected FEMALE voice: ${voiceName}`);
      return 'female';
    }
    
    console.log(`❓ Unknown gender for voice: ${voiceName}`);
    return 'unknown';
  }

  // Get male voices specifically
  async getMaleVoices(): Promise<TTSVoice[]> {
    const allVoices = await this.getAvailableVoices();
    return allVoices.filter(voice => voice.gender === 'male');
  }

  // Set preferred voice for more human-like speech
  async setVoice(voiceId: string): Promise<void> {
    this.selectedVoice = voiceId;
    console.log(`🔊 TTS Voice set to: ${voiceId}`);
  }

  // Get currently selected voice ID
  getSelectedVoice(): string | null {
    return this.selectedVoice;
  }

  // Preprocess text for more natural speech
  private preprocessText(text: string): string {
    return text
      // Add pauses for better rhythm
      .replace(/([.!?])\s+/g, '$1. ') // Add pause after sentences
      .replace(/([,;:])\s+/g, '$1, ') // Add short pause after commas
      // Improve pronunciation of common Quranic terms
      .replace(/\bAllah\b/gi, 'Allah') // Ensure proper pronunciation
      .replace(/\bMuhammad\b/gi, 'Muhammad') // Ensure proper pronunciation
      .replace(/\bQuran\b/gi, 'Quran') // Ensure proper pronunciation
      // Add emphasis for important terms
      .replace(/\b(Allah|God)\b/gi, '$1') // Keep emphasis on divine names
      // Remove excessive punctuation that might sound robotic
      .replace(/[{}[\]()]/g, '') // Remove brackets
      .replace(/[""]/g, '"') // Normalize quotes
      .replace(/['']/g, "'") // Normalize apostrophes
      // Ensure proper spacing
      .replace(/\s+/g, ' ')
      .trim();
  }

  async stop(): Promise<void> {
    try {
      console.log('🔊 Stopping translation speech...');
      
      // Stop Cloud TTS if enabled
      if (this.useCloudTTS) {
        await CloudTTS.stop();
      }
      
      // Stop system TTS
      await Speech.stop();
      
      this.state = {
        isPlaying: false,
        currentText: null,
        currentLanguage: null,
      };
      this.notifyListeners();
      
      console.log('🔊 Translation speech stopped successfully');
    } catch (error) {
      console.error('❌ Error stopping translation speech:', error);
    }
  }

  async pause(): Promise<void> {
    try {
      console.log('🔊 Pausing translation speech...');
      await Speech.pause();
      
      this.state = {
        ...this.state,
        isPlaying: false,
      };
      this.notifyListeners();
    } catch (error) {
      console.error('❌ Error pausing translation speech:', error);
    }
  }

  async resume(): Promise<void> {
    try {
      console.log('🔊 Resuming translation speech...');
      await Speech.resume();
      
      this.state = {
        ...this.state,
        isPlaying: true,
      };
      this.notifyListeners();
    } catch (error) {
      console.error('❌ Error resuming translation speech:', error);
    }
  }

  getCurrentState(): TranslationTTSState {
    return { ...this.state };
  }

  addListener(listener: (state: TranslationTTSState) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (error) {
        console.error('❌ Error notifying TTS listener:', error);
      }
    });
  }

  // Get language code based on translator
  getLanguageCode(translatorId: string): string {
    const languageMap: Record<string, string> = {
      'sahih': 'en-US',
      'pickthall': 'en-US',
      'yusufali': 'en-US',
      'shakir': 'en-US',
      'muhammad': 'en-US',
      'muhsin': 'en-US',
      'arberry': 'en-US',
      'clear': 'en-US',
      'daryabadi': 'en-US',
      'hilali': 'en-US',
      'itani': 'en-US',
      'maududi': 'en-US',
      'qaribullah': 'en-US',
      'sarwar': 'en-US',
      'wahiduddin': 'en-US',
      'bengali': 'bn-BD',
      'urdu': 'ur-PK',
      'french': 'fr-FR',
      'german': 'de-DE',
      'spanish': 'es-ES',
      'italian': 'it-IT',
      'dutch': 'nl-NL',
      'russian': 'ru-RU',
      'turkish': 'tr-TR',
      'persian': 'fa-IR',
      'indonesian': 'id-ID',
      'malay': 'ms-MY',
      'chinese': 'zh-CN',
      'japanese': 'ja-JP',
      'korean': 'ko-KR',
      'thai': 'th-TH',
      'vietnamese': 'vi-VN',
      'portuguese': 'pt-PT',
      'swedish': 'sv-SE',
      'norwegian': 'no-NO',
      'danish': 'da-DK',
      'finnish': 'fi-FI',
      'polish': 'pl-PL',
      'czech': 'cs-CZ',
      'hungarian': 'hu-HU',
      'romanian': 'ro-RO',
      'bulgarian': 'bg-BG',
      'croatian': 'hr-HR',
      'serbian': 'sr-RS',
      'slovak': 'sk-SK',
      'slovenian': 'sl-SI',
      'estonian': 'et-EE',
      'latvian': 'lv-LV',
      'lithuanian': 'lt-LT',
      'greek': 'el-GR',
      'hebrew': 'he-IL',
      'arabic': 'ar-SA',
    };
    
    return languageMap[translatorId] || 'en-US';
  }

  cleanup(): void {
    console.log('🔊 Cleaning up TranslationTTS service...');
    this.stop();
    this.listeners = [];
  }
}

export default new TranslationTTSService();

// Export types for use in other components
export type { TTSVoice, TranslationTTSState };
