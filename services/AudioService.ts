import type { Track } from 'react-native-track-player';
import { Audio } from 'expo-av';
import Constants, { ExecutionEnvironment } from 'expo-constants';

// TrackPlayer is only available in development/standalone builds, not in Expo Go.
// Only require() when we're certain we're NOT in Expo Go; otherwise the require throws and shows a red box.
let trackPlayerModule: typeof import('react-native-track-player') | null = null;

/** Only skip TrackPlayer when we're sure we're in Expo Go (no native module there). */
function isExpoGo(): boolean {
  const ownership = (Constants as { appOwnership?: string }).appOwnership;
  if (ownership === 'expo') return true;
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return true;
  return false;
}

function getTrackPlayer(): typeof import('react-native-track-player') | null {
  if (isExpoGo()) return null;
  if (trackPlayerModule === null) {
    try {
      trackPlayerModule = require('react-native-track-player');
    } catch {
      return null;
    }
  }
  return trackPlayerModule;
}

export interface AudioState {
  isPlaying: boolean;
  currentVerse: number | null;
  currentChapter: number | null;
  duration: number;
  position: number;
}

class AudioService {
  private listeners: ((state: AudioState) => void)[] = [];
  private surahCompletionListeners: ((chapterNumber: number) => void)[] = [];
  private currentSurah: any = null;
  private currentVerseIndex: number = 0;
  private isInitialized: boolean = false;
  private state: AudioState = {
    isPlaying: false,
    currentVerse: null,
    currentChapter: null,
    duration: 0,
    position: 0
  };

  /** Expo-AV fallback when TrackPlayer is unavailable (e.g. Android / Expo Go). */
  private expoAvSound: Audio.Sound | null = null;
  private expoAvVerseIndex: number = 0;
  private useExpoAvFallback: boolean = false;

  constructor() {
    // Don't call setupTrackPlayer() here — it would require() TrackPlayer on module load
    // and crash in Expo Go. Setup runs lazily in ensureInitialized() when playback is first used.
  }

  /** Set Android/iOS audio mode so playback works (required on Android). */
  private async setAudioMode(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        interruptionModeIOS: 1,
        interruptionModeAndroid: 1,
      });
    } catch (e) {
      if (__DEV__) console.warn('Audio.setAudioModeAsync failed:', e);
    }
  }

  private async setupTrackPlayer() {
    await this.setAudioMode();

    const TP = getTrackPlayer();
    if (!TP) {
      this.useExpoAvFallback = true;
      this.isInitialized = true;
      if (__DEV__) console.log('🎵 Using expo-av fallback (TrackPlayer not available)');
      return;
    }

    try {
      const TrackPlayer = TP.default;
      const { State, Event, Capability, AppKilledPlaybackBehavior } = TP;
      console.log('🎵 Setting up Track Player for background audio...');

      try {
        const playbackState = await TrackPlayer.getPlaybackState();
        if (playbackState.state !== State.None) {
          this.isInitialized = true;
          this.setupEventListeners();
          return;
        }
      } catch {}

      await TrackPlayer.setupPlayer({
        waitForBuffer: true,
        autoHandleInterruptions: true,
        minBuffer: 30,
        maxBuffer: 90,
        playBuffer: 1,
        backBuffer: 2,
      });

      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
        ],
        compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext],
        android: {
          appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        },
      });

      this.isInitialized = true;
      this.setupEventListeners();
      console.log('✅ Track Player setup completed');
    } catch (error) {
      console.error('❌ Track Player setup failed:', error);
    }
  }

  private setupEventListeners() {
    const TP = getTrackPlayer();
    if (!TP) return;
    const TrackPlayer = TP.default;
    const { State, Event } = TP;

    TrackPlayer.addEventListener(Event.PlaybackState, async (data) => {
      this.state = { ...this.state, isPlaying: data.state === State.Playing };
      this.notifyListeners();
    });

    TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, (data) => {
      this.state = {
        ...this.state,
        position: data.position * 1000,
        duration: data.duration * 1000,
      };
      this.notifyListeners();
    });

    TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () => {
      if (this.currentSurah) {
        this.notifySurahCompletion(this.currentSurah.id);
        this.state = {
          ...this.state,
          isPlaying: false,
          currentVerse: null,
          currentChapter: null,
        };
        this.notifyListeners();
      }
    });

    TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (data) => {
      if (data.track?.id) {
        const parts = String(data.track.id).split('-');
        const chapterNumber = parseInt(parts[0], 10);
        const verseNumber = parseInt(parts[1], 10);
        // Verse 0 = Bismillah; display as verse 1 for highlighting
        const displayVerse = verseNumber === 0 ? 1 : verseNumber;

        if (this.currentSurah && verseNumber > 0) {
          const verseIdx = this.currentSurah.verses.findIndex((v: any) => v.verseNumber === verseNumber);
          if (verseIdx !== -1) this.currentVerseIndex = verseIdx;
        } else if (this.currentSurah && verseNumber === 0) {
          this.currentVerseIndex = 0; // Bismillah before verse 1
        }

        this.state = {
          ...this.state,
          currentVerse: displayVerse,
          currentChapter: chapterNumber,
        };
        this.notifyListeners();
      }
    });
  }

  private async ensureInitialized() {
    if (!this.isInitialized) {
      await this.setupTrackPlayer();
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  private notifyListeners() {
    this.listeners.forEach(l => l(this.state));
  }

  addListener(listener: (state: AudioState) => void) {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  addSurahCompletionListener(listener: (chapterNumber: number) => void) {
    this.surahCompletionListeners.push(listener);
    return () => { this.surahCompletionListeners = this.surahCompletionListeners.filter(l => l !== listener); };
  }

  private notifySurahCompletion(chapterNumber: number) {
    this.surahCompletionListeners.forEach(l => l(chapterNumber));
  }

  private getReciterAudioSources(chapterNumber: number, verseNumber: number, reciterId?: string): string[] {
    const sources: Record<string, string[]> = {
      alafasy: [
        `https://www.everyayah.com/data/Alafasy_128kbps/${String(chapterNumber).padStart(3, '0')}${String(verseNumber).padStart(3, '0')}.mp3`,
        `https://www.everyayah.com/data/Alafasy_64kbps/${String(chapterNumber).padStart(3, '0')}${String(verseNumber).padStart(3, '0')}.mp3`,
      ],
      husary: [
        `https://www.everyayah.com/data/Husary_128kbps/${String(chapterNumber).padStart(3, '0')}${String(verseNumber).padStart(3, '0')}.mp3`,
        `https://www.everyayah.com/data/Husary_64kbps/${String(chapterNumber).padStart(3, '0')}${String(verseNumber).padStart(3, '0')}.mp3`,
      ],
      abdul_basit_mujawwad: [
        `https://www.everyayah.com/data/Abdul_Basit_Mujawwad_128kbps/${String(chapterNumber).padStart(3, '0')}${String(verseNumber).padStart(3, '0')}.mp3`,
        `https://www.everyayah.com/data/Abdul_Basit_Mujawwad_64kbps/${String(chapterNumber).padStart(3, '0')}${String(verseNumber).padStart(3, '0')}.mp3`,
      ],
      default: [
        `https://www.everyayah.com/data/Alafasy_128kbps/${String(chapterNumber).padStart(3, '0')}${String(verseNumber).padStart(3, '0')}.mp3`,
        `https://www.everyayah.com/data/Alafasy_64kbps/${String(chapterNumber).padStart(3, '0')}${String(verseNumber).padStart(3, '0')}.mp3`,
      ],
    };
    return sources[reciterId || 'alafasy'] || sources.default;
  }

  private getReciterName(reciterId?: string): string {
    const names: Record<string, string> = {
      alafasy: 'Mishary Rashid Alafasy',
      husary: 'Mahmoud Khalil Al-Husary',
      abdul_basit_mujawwad: 'Abdul Basit (Mujawwad)',
      default: 'Mishary Rashid Alafasy',
    };
    return names[reciterId || 'alafasy'] || names.default;
  }

  async playVerse(audioUrl: string, chapterNumber: number, verseNumber: number, reciterId?: string) {
    await this.ensureInitialized();

    if (this.useExpoAvFallback) {
      await this.stop();
      const sources = this.getReciterAudioSources(chapterNumber, verseNumber, reciterId);
      try {
        const { sound } = await Audio.Sound.createAsync({ uri: sources[0] });
        this.expoAvSound = sound;
        await sound.playAsync();
        this.state = { ...this.state, isPlaying: true, currentVerse: verseNumber, currentChapter: chapterNumber };
        this.notifyListeners();
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync().catch(() => {});
            this.expoAvSound = null;
            this.state = { ...this.state, isPlaying: false, currentVerse: null, currentChapter: null };
            this.notifyListeners();
          }
        });
      } catch (error) {
        console.error('❌ Error playing verse (expo-av):', error);
        this.state = { ...this.state, isPlaying: false, currentVerse: null, currentChapter: null };
        this.notifyListeners();
        throw error;
      }
      return;
    }

    const TP = getTrackPlayer();
    if (!TP) return;
    const TrackPlayer = TP.default;

    try {
      await TrackPlayer.reset();
      const sources = this.getReciterAudioSources(chapterNumber, verseNumber, reciterId);
      const track: Track = {
        id: `${chapterNumber}-${verseNumber}`,
        url: sources[0],
        title: `Verse ${verseNumber}`,
        artist: this.getReciterName(reciterId),
        album: `Surah ${chapterNumber}`,
      };
      await TrackPlayer.add(track);
      await TrackPlayer.play();
      this.state = { ...this.state, isPlaying: true, currentVerse: verseNumber, currentChapter: chapterNumber };
      this.notifyListeners();
    } catch (error) {
      console.error('❌ Error playing verse:', error);
      this.state = { ...this.state, isPlaying: false, currentVerse: null, currentChapter: null };
      this.notifyListeners();
      throw error;
    }
  }

  async pause() {
    if (this.expoAvSound) {
      try {
        await this.expoAvSound.pauseAsync();
        this.state = { ...this.state, isPlaying: false };
        this.notifyListeners();
      } catch (error) {
        console.error('❌ Error pausing (expo-av):', error);
      }
      return;
    }
    const TP = getTrackPlayer();
    if (!TP) return;
    try {
      await this.ensureInitialized();
      await TP.default.pause();
      this.state = { ...this.state, isPlaying: false };
      this.notifyListeners();
    } catch (error) {
      console.error('❌ Error pausing:', error);
    }
  }

  async resume() {
    if (this.expoAvSound) {
      try {
        await this.expoAvSound.playAsync();
        this.state = { ...this.state, isPlaying: true };
        this.notifyListeners();
      } catch (error) {
        console.error('❌ Error resuming (expo-av):', error);
      }
      return;
    }
    const TP = getTrackPlayer();
    if (!TP) return;
    try {
      await this.ensureInitialized();
      await TP.default.play();
      this.state = { ...this.state, isPlaying: true };
      this.notifyListeners();
    } catch (error) {
      console.error('❌ Error resuming:', error);
    }
  }

  async stop() {
    if (this.expoAvSound) {
      try {
        await this.expoAvSound.stopAsync();
        await this.expoAvSound.unloadAsync();
      } catch {}
      this.expoAvSound = null;
      this.currentSurah = null;
      this.currentVerseIndex = 0;
      this.state = { isPlaying: false, currentVerse: null, currentChapter: null, duration: 0, position: 0 };
      this.notifyListeners();
      return;
    }
    if (isExpoGo()) return;
    const TP = getTrackPlayer();
    if (!TP) return;
    try {
      await this.ensureInitialized();
      await TP.default.stop();
      await TP.default.reset();
      this.currentSurah = null;
      this.currentVerseIndex = 0;
      this.state = { isPlaying: false, currentVerse: null, currentChapter: null, duration: 0, position: 0 };
      this.notifyListeners();
    } catch (error) {
      console.error('❌ Error stopping:', error);
    }
  }

  /** Surah 1 has Bismillah as verse 1; Surah 9 (At-Tawbah) has no Bismillah; others use verse 0 (XXX000.mp3). */
  private needsBismillahBeforeSurah(chapterId: number): boolean {
    return chapterId !== 1 && chapterId !== 9;
  }

  async playFullSurah(chapter: any, reciterId?: string) {
    await this.ensureInitialized();

    if (!chapter.verses?.length) throw new Error('No verses');

    this.currentSurah = chapter;
    this.currentVerseIndex = 0;

    // Build play list: Bismillah (verse 0) first when needed, then verses 1,2,3...
    const needsBismillah = this.needsBismillahBeforeSurah(chapter.id);
    const playItems: { verseNumber: number }[] = needsBismillah
      ? [{ verseNumber: 0 }, ...chapter.verses.map((v: any) => ({ verseNumber: v.verseNumber }))]
      : chapter.verses.map((v: any) => ({ verseNumber: v.verseNumber }));

    if (this.useExpoAvFallback) {
      await this.stop();
      this.currentSurah = chapter;
      this.currentVerseIndex = 0;
      const playNext = async () => {
        if (!this.currentSurah || this.currentVerseIndex >= playItems.length) {
          this.notifySurahCompletion(chapter.id);
          this.state = { ...this.state, isPlaying: false, currentVerse: null, currentChapter: null };
          this.notifyListeners();
          return;
        }
        const item = playItems[this.currentVerseIndex];
        const displayVerse = item.verseNumber === 0 ? 1 : item.verseNumber;
        const sources = this.getReciterAudioSources(chapter.id, item.verseNumber, reciterId);
        try {
          const { sound } = await Audio.Sound.createAsync({ uri: sources[1] ?? sources[0] });
          this.expoAvSound = sound;
          this.state = { ...this.state, isPlaying: true, currentVerse: displayVerse, currentChapter: chapter.id };
          this.notifyListeners();
          await sound.playAsync();
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              sound.unloadAsync().catch(() => {});
              this.expoAvSound = null;
              this.currentVerseIndex++;
              playNext();
            }
          });
        } catch (error) {
          console.error('❌ Error playing verse (expo-av):', error);
          this.state = { ...this.state, isPlaying: false, currentVerse: null, currentChapter: null };
          this.notifyListeners();
        }
      };
      await playNext();
      return;
    }

    const TP = getTrackPlayer();
    if (!TP) return;
    const TrackPlayer = TP.default;

    try {
      await TrackPlayer.reset();
      const tracks: Track[] = playItems.map((item, idx) => {
        const sources = this.getReciterAudioSources(chapter.id, item.verseNumber, reciterId);
        const title = item.verseNumber === 0 ? 'Bismillah' : `Verse ${item.verseNumber}`;
        return {
          id: `${chapter.id}-${item.verseNumber}-${idx}`,
          url: sources[1] ?? sources[0],
          title,
          artist: this.getReciterName(reciterId),
          album: chapter.nameTransliterated || chapter.name || `Surah ${chapter.id}`,
        };
      });
      await TrackPlayer.add(tracks);
      await TrackPlayer.play();
      const firstVerse = playItems[0].verseNumber === 0 ? 1 : playItems[0].verseNumber;
      this.state = { ...this.state, isPlaying: true, currentVerse: firstVerse, currentChapter: chapter.id };
      this.notifyListeners();
    } catch (error) {
      console.error('❌ Error playing full surah:', error);
      this.state = { ...this.state, isPlaying: false, currentVerse: null, currentChapter: null };
      this.notifyListeners();
      throw error;
    }
  }

  getCurrentState(): AudioState {
    return { ...this.state };
  }

  async cleanup() {
    if (isExpoGo()) {
      this.listeners = [];
      this.surahCompletionListeners = [];
      this.currentSurah = null;
      this.currentVerseIndex = 0;
      return;
    }
    try {
      await this.stop();
    } catch (error) {
      console.error('❌ Cleanup error:', error);
    }
    this.listeners = [];
    this.surahCompletionListeners = [];
    this.currentSurah = null;
    this.currentVerseIndex = 0;
  }
}

export default new AudioService();
