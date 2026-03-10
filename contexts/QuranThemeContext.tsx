import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';

export type QuranThemeId = 'night-manuscript' | 'parchment-classic' | 'emerald-garden';

export interface QuranTheme {
  id: QuranThemeId;
  name: string;
  description: string;
  background: string;
  backgroundGradient?: [string, string];
  /** Landing radial gradient stops [center, 0.4, 0.7, edge] */
  landingRadial?: [string, string, string, string];
  card: string;
  cardLifted?: string;
  /** Stats/ledger block gradient or solid */
  statsBlockColors?: [string, string];
  arabicText: string;
  translationText: string;
  accent: string;
  accentMuted?: string;
  divider: string;
  dividerOpacity?: number;
  label: string;
  number: string;
  verseBadgeGold: string;
  borderRadius: number;
  /** Primary button background (landing) */
  primaryButtonBg?: string;
  /** Continue button background (landing) */
  continueButtonBg?: string;
  /** Reader tab bar background */
  tabBarBg?: string;
  /** Reader verse card gradient */
  verseCardColors?: [string, string];
  /** Reader tab selected state background */
  tabActiveBg?: string;
  /** Reader tab selected state text (for contrast) */
  tabActiveText?: string;
}

export const QURAN_THEMES: Record<QuranThemeId, QuranTheme> = {
  'night-manuscript': {
    id: 'night-manuscript',
    name: 'Night Manuscript',
    description: 'Masjid at night. Gold ink on dark sky.',
    background: '#0B0B0D',
    landingRadial: ['#0B0B0D', '#0B0B0D', '#080809', '#060607'],
    card: '#121316',
    statsBlockColors: ['#15171A', '#121316'],
    arabicText: '#F1F1F1',
    translationText: 'rgba(241,241,241,0.85)',
    accent: '#C8A44D',
    divider: '#C8A44D',
    dividerOpacity: 0.2,
    label: '#E8E6E3',
    number: '#C8A44D',
    verseBadgeGold: '#F0D078',
    borderRadius: 13,
    primaryButtonBg: '#1A1A1E',
    continueButtonBg: 'rgba(24, 26, 30, 0.9)',
    tabBarBg: '#1A1C20',
    verseCardColors: ['#15171A', '#121316'],
    tabActiveBg: 'rgba(200, 164, 77, 0.25)',
    tabActiveText: '#F1F1F1',
  },
  'parchment-classic': {
    id: 'parchment-classic',
    name: 'Parchment Classic',
    description: 'Ottoman manuscript. Ink on aged paper.',
    background: '#E2D9C4',
    landingRadial: ['#E2D9C4', '#DDD3BC', '#D8CDB4', '#D2C6AB'],
    card: '#D2C6AB',
    statsBlockColors: ['#CDC0A3', '#C7B99A'],
    arabicText: '#0A0A0A',
    translationText: 'rgba(0,0,0,0.88)',
    accent: '#5C4A1F',
    divider: '#B5A88E',
    dividerOpacity: 0.5,
    label: '#0A0A0A',
    number: '#5C4A1F',
    verseBadgeGold: '#5C4A1F',
    borderRadius: 13,
    primaryButtonBg: '#2C2416',
    continueButtonBg: 'rgba(44, 36, 22, 0.85)',
    tabBarBg: '#C7B99A',
    verseCardColors: ['#CFC4A5', '#C4B896'],
    tabActiveBg: 'rgba(92, 74, 31, 0.35)',
    tabActiveText: '#0A0A0A',
  },
  'emerald-garden': {
    id: 'emerald-garden',
    name: 'Emerald Garden',
    description: 'Reflective Ramadan evening. Calm and dignified.',
    background: '#0E3B2E',
    backgroundGradient: ['#0E3B2E', '#1B4D3E'],
    landingRadial: ['#1F5A34', '#1a4a2e', '#153d26', '#0E3B22'],
    card: 'rgba(14, 59, 46, 0.75)',
    cardLifted: 'rgba(27, 77, 62, 0.9)',
    statsBlockColors: ['#1B4D3E', '#0E3B2E'],
    arabicText: '#F1EFE7',
    translationText: 'rgba(241,239,231,0.9)',
    accent: '#C8A44D',
    divider: 'rgba(200, 164, 77, 0.35)',
    dividerOpacity: 0.35,
    label: '#F1EFE7',
    number: '#C8A44D',
    verseBadgeGold: '#F0D078',
    borderRadius: 13,
    primaryButtonBg: '#1F5A34',
    continueButtonBg: 'rgba(45, 85, 65, 0.85)',
    tabBarBg: '#0E3B2E',
    verseCardColors: ['#1c4a3c', '#164638'],
    tabActiveBg: 'rgba(200, 164, 77, 0.25)',
    tabActiveText: '#F1EFE7',
  },
};

const STORAGE_KEY = 'deenify_quran_theme';

interface QuranThemeContextType {
  theme: QuranTheme;
  themeId: QuranThemeId;
  setTheme: (id: QuranThemeId) => void;
  opacity: Animated.Value;
}

const QuranThemeContext = createContext<QuranThemeContextType | undefined>(undefined);

export function QuranThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<QuranThemeId>('emerald-garden');
  const opacity = useRef(new Animated.Value(1)).current;

  const theme = QURAN_THEMES[themeId];

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored && stored in QURAN_THEMES) {
          setThemeIdState(stored as QuranThemeId);
        }
      } catch {
        // use default
      }
    };
    load();
  }, []);

  const setTheme = useCallback(async (id: QuranThemeId) => {
    if (id === themeId) return;

    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 0.3,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();

    setThemeIdState(id);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore
    }
  }, [themeId, opacity]);

  return (
    <QuranThemeContext.Provider
      value={{
        theme,
        themeId,
        setTheme,
        opacity,
      }}
    >
      {children}
    </QuranThemeContext.Provider>
  );
}

export function useQuranTheme() {
  const ctx = useContext(QuranThemeContext);
  if (ctx === undefined) {
    throw new Error('useQuranTheme must be used within QuranThemeProvider');
  }
  return ctx;
}
