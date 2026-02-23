import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CalculationMethod = 
  | 'MWL' // Muslim World League
  | 'ISNA' // Islamic Society of North America
  | 'UmmAlQura' // Umm Al-Qura University, Makkah
  | 'Karachi' // University of Islamic Sciences, Karachi
  | 'Egyptian' // Egyptian General Authority of Survey
  | 'Tehran' // Institute of Geophysics, University of Tehran
  | 'Kuwait' // Kuwait
  | 'Qatar' // Qatar
  | 'Singapore' // Majlis Ugama Islam Singapura
  | 'France' // Union des organisations islamiques de France
  | 'Turkey' // Diyanet İşleri Başkanlığı
  | 'Russia' // Spiritual Administration of Muslims of Russia
  | 'Dubai' // UAE
  | 'Morocco' // Morocco
  | 'Tunisia' // Tunisia
  | 'Algeria' // Algeria
  | 'Kuwait' // Kuwait
  | 'Qatar' // Qatar
  | 'Singapore' // Singapore
  | 'France' // France
  | 'Turkey' // Turkey
  | 'Russia' // Russia
  | 'Dubai' // UAE
  | 'Morocco' // Morocco
  | 'Tunisia' // Tunisia
  | 'Algeria'; // Algeria

export type Madhab = 'Standard' | 'Hanafi';

export interface PrayerSettings {
  calculationMethod: CalculationMethod;
  madhab: Madhab;
  azanSettings: {
    Fajr: boolean;
    Dhuhr: boolean;
    Asr: boolean;
    Maghrib: boolean;
    Isha: boolean;
  };
}

interface PrayerSettingsContextType {
  settings: PrayerSettings;
  updateSettings: (settings: Partial<PrayerSettings>) => Promise<void>;
  getCalculationMethodInfo: (method: CalculationMethod) => {
    name: string;
    description: string;
    fajrAngle: number;
    ishaAngle: number;
    ishaInterval?: number;
  };
  getMadhabInfo: (madhab: Madhab) => {
    name: string;
    description: string;
    asrMethod: string;
  };
}

const defaultSettings: PrayerSettings = {
  calculationMethod: 'MWL',
  madhab: 'Standard',
  azanSettings: {
    Fajr: true,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true,
  },
};

const PrayerSettingsContext = createContext<PrayerSettingsContextType | undefined>(undefined);

export function PrayerSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PrayerSettings>(defaultSettings);

  // Load settings from storage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Save settings to storage whenever they change
  useEffect(() => {
    saveSettings();
  }, [settings]);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem('prayerSettings');
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        console.log('📱 Loaded prayer settings:', parsedSettings);
        // Merge with defaults to ensure azanSettings exists
        const mergedSettings = {
          ...defaultSettings,
          ...parsedSettings,
          azanSettings: {
            ...defaultSettings.azanSettings,
            ...(parsedSettings.azanSettings || {}),
          },
        };
        setSettings(mergedSettings);
      } else {
        console.log('📱 No stored prayer settings found, using defaults');
      }
    } catch (error) {
      console.error('Error loading prayer settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      console.log('💾 Saving prayer settings:', settings);
      await AsyncStorage.setItem('prayerSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving prayer settings:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<PrayerSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const getCalculationMethodInfo = (method: CalculationMethod) => {
    const methods = {
      MWL: {
        name: 'Muslim World League',
        description: 'Fajr: 18°, Isha: 17°',
        fajrAngle: 18,
        ishaAngle: 17,
      },
      ISNA: {
        name: 'Islamic Society of North America',
        description: 'Fajr: 15°, Isha: 15°',
        fajrAngle: 15,
        ishaAngle: 15,
      },
      UmmAlQura: {
        name: 'Umm Al-Qura University, Makkah',
        description: 'Fajr: 18.5°, Isha: 90 min after Maghrib',
        fajrAngle: 18.5,
        ishaAngle: 0,
        ishaInterval: 90,
      },
      Karachi: {
        name: 'University of Islamic Sciences, Karachi',
        description: 'Fajr: 18°, Isha: 18°',
        fajrAngle: 18,
        ishaAngle: 18,
      },
      Egyptian: {
        name: 'Egyptian General Authority of Survey',
        description: 'Fajr: 19.5°, Isha: 17.5°',
        fajrAngle: 19.5,
        ishaAngle: 17.5,
      },
      Tehran: {
        name: 'Institute of Geophysics, University of Tehran',
        description: 'Fajr: 17.7°, Isha: 14°',
        fajrAngle: 17.7,
        ishaAngle: 14,
      },
      Kuwait: {
        name: 'Kuwait',
        description: 'Fajr: 18°, Isha: 17.5°',
        fajrAngle: 18,
        ishaAngle: 17.5,
      },
      Qatar: {
        name: 'Qatar',
        description: 'Fajr: 18°, Isha: 18°',
        fajrAngle: 18,
        ishaAngle: 18,
      },
      Singapore: {
        name: 'Majlis Ugama Islam Singapura',
        description: 'Fajr: 20°, Isha: 18°',
        fajrAngle: 20,
        ishaAngle: 18,
      },
      France: {
        name: 'Union des organisations islamiques de France',
        description: 'Fajr: 12°, Isha: 12°',
        fajrAngle: 12,
        ishaAngle: 12,
      },
      Turkey: {
        name: 'Diyanet İşleri Başkanlığı',
        description: 'Fajr: 18°, Isha: 17°',
        fajrAngle: 18,
        ishaAngle: 17,
      },
      Russia: {
        name: 'Spiritual Administration of Muslims of Russia',
        description: 'Fajr: 16°, Isha: 15°',
        fajrAngle: 16,
        ishaAngle: 15,
      },
      Dubai: {
        name: 'UAE',
        description: 'Fajr: 19.5°, Isha: 90 min after Maghrib',
        fajrAngle: 19.5,
        ishaAngle: 0,
        ishaInterval: 90,
      },
      Morocco: {
        name: 'Morocco',
        description: 'Fajr: 19°, Isha: 17°',
        fajrAngle: 19,
        ishaAngle: 17,
      },
      Tunisia: {
        name: 'Tunisia',
        description: 'Fajr: 18°, Isha: 18°',
        fajrAngle: 18,
        ishaAngle: 18,
      },
      Algeria: {
        name: 'Algeria',
        description: 'Fajr: 18°, Isha: 17°',
        fajrAngle: 18,
        ishaAngle: 17,
      },
    };

    return methods[method];
  };

  const getMadhabInfo = (madhab: Madhab) => {
    const madhabs = {
      Standard: {
        name: 'Standard (Shafi\'i, Maliki, Hanbali)',
        description: 'Asr begins when shadow equals object length',
        asrMethod: 'Shadow = Object Length',
      },
      Hanafi: {
        name: 'Hanafi',
        description: 'Asr begins when shadow is twice object length',
        asrMethod: 'Shadow = 2 × Object Length',
      },
    };

    return madhabs[madhab];
  };

  const value: PrayerSettingsContextType = {
    settings,
    updateSettings,
    getCalculationMethodInfo,
    getMadhabInfo,
  };

  return (
    <PrayerSettingsContext.Provider value={value}>
      {children}
    </PrayerSettingsContext.Provider>
  );
}

export function usePrayerSettings() {
  const context = useContext(PrayerSettingsContext);
  if (context === undefined) {
    throw new Error('usePrayerSettings must be used within a PrayerSettingsProvider');
  }
  return context;
}

