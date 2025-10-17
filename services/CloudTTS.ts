import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Speech from 'expo-speech';

// Cloud TTS Service with fallback to system TTS
// Supports Google Cloud TTS, OpenAI TTS, and ElevenLabs

export type CloudTTSProvider = 'google' | 'openai' | 'elevenlabs' | 'system';

export interface CloudTTSConfig {
  provider: CloudTTSProvider;
  apiKey?: string;
  voice?: string;
}

export interface CloudTTSVoice {
  id: string;
  name: string;
  provider: CloudTTSProvider;
  gender: 'male' | 'female';
  language: string;
  description: string;
}

class CloudTTSService {
  private config: CloudTTSConfig = {
    provider: 'system', // Default to system TTS (no API key needed)
  };
  
  private currentSound: Audio.Sound | null = null;
  private isPlaying: boolean = false;

  // List of high-quality male voices from different providers
  private readonly MALE_VOICES: CloudTTSVoice[] = [
    // Google Cloud TTS - Neural voices (most natural)
    {
      id: 'en-US-Neural2-D',
      name: 'Google Neural Male (US)',
      provider: 'google',
      gender: 'male',
      language: 'en-US',
      description: 'Natural male voice with clear pronunciation',
    },
    {
      id: 'en-US-Neural2-J',
      name: 'Google Neural Male Alt (US)',
      provider: 'google',
      gender: 'male',
      language: 'en-US',
      description: 'Alternative natural male voice',
    },
    {
      id: 'en-GB-Neural2-D',
      name: 'Google Neural Male (UK)',
      provider: 'google',
      gender: 'male',
      language: 'en-GB',
      description: 'British male voice',
    },
    // OpenAI TTS
    {
      id: 'alloy',
      name: 'OpenAI Alloy (Male)',
      provider: 'openai',
      gender: 'male',
      language: 'en-US',
      description: 'Neutral, balanced male voice',
    },
    {
      id: 'echo',
      name: 'OpenAI Echo (Male)',
      provider: 'openai',
      gender: 'male',
      language: 'en-US',
      description: 'Clear, articulate male voice',
    },
    {
      id: 'onyx',
      name: 'OpenAI Onyx (Male)',
      provider: 'openai',
      gender: 'male',
      language: 'en-US',
      description: 'Deep, resonant male voice',
    },
    // ElevenLabs (premium quality)
    {
      id: 'adam',
      name: 'ElevenLabs Adam (Male)',
      provider: 'elevenlabs',
      gender: 'male',
      language: 'en-US',
      description: 'Premium quality male voice',
    },
  ];

  // Configure the TTS provider
  configure(config: CloudTTSConfig): void {
    this.config = { ...this.config, ...config };
    console.log(`🔊 CloudTTS configured: ${config.provider} ${config.voice ? `voice: ${config.voice}` : ''}`);
  }

  // Get available male voices
  getAvailableMaleVoices(provider?: CloudTTSProvider): CloudTTSVoice[] {
    if (provider) {
      return this.MALE_VOICES.filter(v => v.provider === provider);
    }
    return this.MALE_VOICES;
  }

  // Speak text using cloud TTS or fallback to system
  async speak(text: string, options?: { onStart?: () => void; onDone?: () => void; onError?: (error: any) => void }): Promise<void> {
    try {
      console.log(`🔊 CloudTTS speaking with provider: ${this.config.provider}`);
      
      // Stop any current playback
      await this.stop();

      if (this.config.provider === 'system') {
        // Use system TTS (fallback)
        await this.speakWithSystemTTS(text, options);
      } else {
        // Use cloud TTS API
        await this.speakWithCloudAPI(text, options);
      }
    } catch (error) {
      console.error('❌ CloudTTS error, falling back to system TTS:', error);
      options?.onError?.(error);
      // Fallback to system TTS on error
      await this.speakWithSystemTTS(text, options);
    }
  }

  // Speak using system TTS (free, no API key needed)
  private async speakWithSystemTTS(text: string, options?: { onStart?: () => void; onDone?: () => void }): Promise<void> {
    this.isPlaying = true;
    options?.onStart?.();

    await Speech.speak(text, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.75,
      onStart: () => {
        console.log('✅ System TTS started');
      },
      onDone: () => {
        console.log('✅ System TTS completed');
        this.isPlaying = false;
        options?.onDone?.();
      },
      onError: (error) => {
        console.error('❌ System TTS error:', error);
        this.isPlaying = false;
      },
    });
  }

  // Speak using cloud API (requires API key)
  private async speakWithCloudAPI(text: string, options?: { onStart?: () => void; onDone?: () => void; onError?: (error: any) => void }): Promise<void> {
    if (!this.config.apiKey) {
      throw new Error('API key required for cloud TTS');
    }

    let audioUrl: string;

    switch (this.config.provider) {
      case 'google':
        audioUrl = await this.generateGoogleTTS(text);
        break;
      case 'openai':
        audioUrl = await this.generateOpenAITTS(text);
        break;
      case 'elevenlabs':
        audioUrl = await this.generateElevenLabsTTS(text);
        break;
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }

    // Play the audio file
    await this.playAudio(audioUrl, options);
  }

  // Generate audio using Google Cloud TTS
  private async generateGoogleTTS(text: string): Promise<string> {
    const voice = this.config.voice || 'en-US-Neural2-D';
    
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: 'en-US',
            name: voice,
          },
          audioConfig: {
            audioEncoding: 'MP3',
            pitch: 0,
            speakingRate: 0.9, // Slightly slower for better comprehension
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google TTS API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Save audio to temp file
    const audioBase64 = data.audioContent;
    const fileUri = `${FileSystem.cacheDirectory}tts_${Date.now()}.mp3`;
    await FileSystem.writeAsStringAsync(fileUri, audioBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return fileUri;
  }

  // Generate audio using OpenAI TTS
  private async generateOpenAITTS(text: string): Promise<string> {
    const voice = this.config.voice || 'onyx';
    
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1', // or 'tts-1-hd' for higher quality
        input: text,
        voice: voice,
        speed: 0.9, // Slightly slower
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI TTS API error: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        const fileUri = `${FileSystem.cacheDirectory}tts_${Date.now()}.mp3`;
        await FileSystem.writeAsStringAsync(fileUri, base64data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        resolve(fileUri);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });
  }

  // Generate audio using ElevenLabs TTS
  private async generateElevenLabsTTS(text: string): Promise<string> {
    const voiceId = this.config.voice || '21m00Tcm4TlvDq8ikWAM'; // Adam voice
    
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': this.config.apiKey!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs TTS API error: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        const fileUri = `${FileSystem.cacheDirectory}tts_${Date.now()}.mp3`;
        await FileSystem.writeAsStringAsync(fileUri, base64data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        resolve(fileUri);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });
  }

  // Play audio file
  private async playAudio(uri: string, options?: { onStart?: () => void; onDone?: () => void }): Promise<void> {
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true },
      (status) => {
        if (status.isLoaded && status.didJustFinish) {
          console.log('✅ Cloud TTS audio completed');
          this.isPlaying = false;
          options?.onDone?.();
          
          // Clean up the sound and temp file
          sound.unloadAsync();
          FileSystem.deleteAsync(uri, { idempotent: true });
        }
      }
    );

    this.currentSound = sound;
    this.isPlaying = true;
    options?.onStart?.();
  }

  // Stop current playback
  async stop(): Promise<void> {
    try {
      // Stop system TTS
      await Speech.stop();
      
      // Stop audio playback
      if (this.currentSound) {
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
        this.currentSound = null;
      }
      
      this.isPlaying = false;
      console.log('🔊 CloudTTS stopped');
    } catch (error) {
      console.error('❌ Error stopping CloudTTS:', error);
    }
  }

  // Check if currently playing
  getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export default new CloudTTSService();

