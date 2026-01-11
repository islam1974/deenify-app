import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';
export type TextDirection = 'rtl' | 'ltr';
export type QuranFont = 'kfgqpc_uthmani' | 'amiri_quran' | 'scheherazade' | 'me_quran' | 'vazeh_quran';
export type Reciter = 'alafasy' | 'husary' | 'abdul_basit_mujawwad' | 'salah_al_budair';
export type Translator = 'sahih' | 'asad' | 'pickthall' | 'yusufali' | 'shakir' | 'muhammad' | 'clear' | 'dr_mohsen' | 'khan' | 'maududi' | 'quran_project' | 'sarwar' | 'taqi_usmani' | 'wahiduddin' | 'arabic_muyassar' | 'urdu_jalandhry' | 'french_hamidullah' | 'german_bubenheim' | 'spanish_cortes' | 'turkish_ali' | 'indonesian_bahasa' | 'malay_abdullah' | 'chinese_simplified' | 'japanese_saito' | 'russian_krachkovsky' | 'persian_ansarian' | 'bengali_muhiuddin' | 'bengali_zohurul';

export interface ReciterOption {
  id: Reciter;
  name: string;
  arabicName: string;
  description: string;
  audioUrl: string;
}

export interface TranslatorOption {
  id: Translator;
  name: string;
  language: string;
  description: string;
  apiCode: string;
}

export interface QuranFontOption {
  id: QuranFont;
  name: string;
  description: string;
  fontFamily: string;
  apiCode: string;
}

interface QuranSettings {
  fontSize: FontSize;
  textDirection: TextDirection;
  showArabic: boolean;
  showTranslation: boolean;
  autoPlay: boolean;
  enableTajweed: boolean; // New setting for Tajweed color coding
  bookmarks: string[];
  selectedReciter: Reciter;
  selectedTranslator: Translator;
  selectedFont: QuranFont; // New setting for Quran font
}

interface QuranSettingsContextType {
  settings: QuranSettings;
  updateFontSize: (size: FontSize) => void;
  updateTextDirection: (direction: TextDirection) => void;
  toggleArabic: () => void;
  toggleTranslation: () => void;
  toggleAutoPlay: () => void;
  toggleTajweed: () => void; // New method for Tajweed toggle
  addBookmark: (verseId: string) => void;
  removeBookmark: (verseId: string) => void;
  isBookmarked: (verseId: string) => boolean;
  updateReciter: (reciter: Reciter) => void;
  updateTranslator: (translator: Translator) => void;
  updateFont: (font: QuranFont) => void; // New method for font selection
  getReciterOptions: () => ReciterOption[];
  getTranslatorOptions: () => TranslatorOption[];
  getFontOptions: () => QuranFontOption[]; // New method for font options
}

const defaultSettings: QuranSettings = {
  fontSize: 'medium',
  textDirection: 'rtl',
  showArabic: true,
  showTranslation: true,
  autoPlay: false,
  enableTajweed: true, // Default to true for Tajweed coloring
  bookmarks: [],
  selectedReciter: 'alafasy',
  selectedTranslator: 'sahih',
  selectedFont: 'kfgqpc_uthmani', // Default to Noto Naskh Arabic
};

console.log(`🔧 Default Quran settings:`, defaultSettings);

const QuranSettingsContext = createContext<QuranSettingsContextType | undefined>(undefined);

export function QuranSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<QuranSettings>(defaultSettings);

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
      console.log(`📱 Loading Quran settings from AsyncStorage...`);
      const storedSettings = await AsyncStorage.getItem('quranSettings');
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        console.log(`✅ Loaded Quran settings:`, parsedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      } else {
        console.log(`⚠️ No stored Quran settings found, using defaults`);
      }
    } catch (error) {
      console.error('❌ Error loading Quran settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      console.log(`💾 Saving Quran settings`);
      await AsyncStorage.setItem('quranSettings', JSON.stringify(settings));
      console.log(`✅ Settings saved successfully`);
    } catch (error) {
      console.error('❌ Error saving Quran settings:', error);
    }
  };

  const updateFontSize = (fontSize: FontSize) => {
    setSettings(prev => ({ ...prev, fontSize }));
  };

  const updateTextDirection = (textDirection: TextDirection) => {
    setSettings(prev => ({ ...prev, textDirection }));
  };

  const toggleArabic = () => {
    setSettings(prev => ({ ...prev, showArabic: !prev.showArabic }));
  };

  const toggleTranslation = () => {
    setSettings(prev => ({ ...prev, showTranslation: !prev.showTranslation }));
  };

  const toggleAutoPlay = () => {
    setSettings(prev => ({ ...prev, autoPlay: !prev.autoPlay }));
  };

  const toggleTajweed = () => {
    setSettings(prev => {
      const newValue = !prev.enableTajweed;
      console.log(`🎨 toggleTajweed: ${prev.enableTajweed} → ${newValue}`);
      return { ...prev, enableTajweed: newValue };
    });
  };

  const addBookmark = (verseId: string) => {
    setSettings(prev => ({
      ...prev,
      bookmarks: [...prev.bookmarks.filter(id => id !== verseId), verseId]
    }));
  };

  const removeBookmark = (verseId: string) => {
    setSettings(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.filter(id => id !== verseId)
    }));
  };

  const isBookmarked = (verseId: string) => {
    return settings.bookmarks.includes(verseId);
  };

  const updateReciter = (selectedReciter: Reciter) => {
    console.log(`🔄 RECITER UPDATE:`);
    console.log(`   - Previous reciter: ${settings.selectedReciter}`);
    console.log(`   - New reciter: ${selectedReciter}`);
    console.log(`   - Available reciters:`, getReciterOptions().map(r => r.id));
    setSettings(prev => {
      const newSettings = { ...prev, selectedReciter };
      console.log(`   - Updated settings:`, newSettings);
      return newSettings;
    });
  };

  const updateTranslator = (selectedTranslator: Translator) => {
    setSettings(prev => ({ ...prev, selectedTranslator }));
  };

  const updateFont = (selectedFont: QuranFont) => {
    setSettings(prev => ({ ...prev, selectedFont }));
  };

  const getReciterOptions = (): ReciterOption[] => [
    // CONFIRMED WORKING RECITERS ONLY
    {
      id: 'alafasy',
      name: 'Mishary Rashid Alafasy',
      arabicName: 'مشاري راشد العفاسي',
      description: 'Popular reciter with clear pronunciation',
      audioUrl: 'https://www.everyayah.com/data/Alafasy_128kbps/'
    },
    {
      id: 'husary',
      name: 'Mahmoud Khalil Al-Husary',
      arabicName: 'محمود خليل الحصري',
      description: 'Classic recitation with traditional style',
      audioUrl: 'https://www.everyayah.com/data/Husary_128kbps/'
    },
    {
      id: 'abdul_basit_mujawwad',
      name: 'Abdul Basit Mujawwad',
      arabicName: 'عبد الباسط مجود',
      description: 'Classic reciter with melodious style',
      audioUrl: 'https://www.everyayah.com/data/Abdul_Basit_Mujawwad_128kbps/'
    },
    {
      id: 'salah_al_budair',
      name: 'Salah Al Budair',
      arabicName: 'صلاح البدير',
      description: 'Imam of Masjid an-Nabawi, Medina',
      audioUrl: 'https://www.everyayah.com/data/Salah_Al_Budair_128kbps/'
    }
  ];

  const getTranslatorOptions = (): TranslatorOption[] => [
    // English translations
    {
      id: 'sahih',
      name: 'Sahih International',
      language: 'English',
      description: 'Clear and accurate modern translation',
      apiCode: 'en.sahih'
    },
    {
      id: 'asad',
      name: 'Muhammad Asad',
      language: 'English',
      description: 'Thoughtful translation with commentary',
      apiCode: 'en.asad'
    },
    {
      id: 'pickthall',
      name: 'Marmaduke Pickthall',
      language: 'English',
      description: 'Classic English translation',
      apiCode: 'en.pickthall'
    },
    {
      id: 'yusufali',
      name: 'Abdullah Yusuf Ali',
      language: 'English',
      description: 'Comprehensive translation with notes',
      apiCode: 'en.yusufali'
    },
    {
      id: 'shakir',
      name: 'M.H. Shakir',
      language: 'English',
      description: 'Simple and direct translation',
      apiCode: 'en.shakir'
    },
    {
      id: 'muhammad',
      name: 'Muhammad Taqi-ud-Din Al-Hilali',
      language: 'English',
      description: 'Authentic translation with explanations',
      apiCode: 'en.hilali'
    },
    {
      id: 'clear',
      name: 'Clear Quran',
      language: 'English',
      description: 'Modern, clear English translation',
      apiCode: 'en.clear'
    },
    {
      id: 'dr_mohsen',
      name: 'Dr. Mohsen Khan',
      language: 'English',
      description: 'Medical doctor and Islamic scholar translation',
      apiCode: 'en.mohsin'
    },
    {
      id: 'khan',
      name: 'Muhammad Khan',
      language: 'English',
      description: 'Simple and accessible translation',
      apiCode: 'en.khan'
    },
    {
      id: 'maududi',
      name: 'Abul Ala Maududi',
      language: 'English',
      description: 'Translation with extensive commentary',
      apiCode: 'en.maududi'
    },
    {
      id: 'quran_project',
      name: 'The Quran Project',
      language: 'English',
      description: 'Modern collaborative translation',
      apiCode: 'en.quranproject'
    },
    {
      id: 'sarwar',
      name: 'Muhammad Sarwar',
      language: 'English',
      description: 'Clear and straightforward translation',
      apiCode: 'en.sarwar'
    },
    {
      id: 'taqi_usmani',
      name: 'Muhammad Taqi Usmani',
      language: 'English',
      description: 'Contemporary Islamic scholar translation',
      apiCode: 'en.usmani'
    },
    {
      id: 'wahiduddin',
      name: 'Wahiduddin Khan',
      language: 'English',
      description: 'Modern interpretation with contemporary relevance',
      apiCode: 'en.wahiduddin'
    },
    
    // Arabic translations
    {
      id: 'arabic_muyassar',
      name: 'Arabic Muyassar',
      language: 'Arabic',
      description: 'Simplified Arabic explanation',
      apiCode: 'ar.muyassar'
    },
    
    // Urdu translations
    {
      id: 'urdu_jalandhry',
      name: 'Fateh Muhammad Jalandhry',
      language: 'Urdu',
      description: 'Classic Urdu translation',
      apiCode: 'ur.jalandhry'
    },
    
    // French translations
    {
      id: 'french_hamidullah',
      name: 'Muhammad Hamidullah',
      language: 'French',
      description: 'Classic French translation',
      apiCode: 'fr.hamidullah'
    },
    
    // German translations
    {
      id: 'german_bubenheim',
      name: 'Frank Bubenheim',
      language: 'German',
      description: 'Modern German translation',
      apiCode: 'de.bubenheim'
    },
    
    // Spanish translations
    {
      id: 'spanish_cortes',
      name: 'Julio Cortes',
      language: 'Spanish',
      description: 'Classic Spanish translation',
      apiCode: 'es.cortes'
    },
    
    // Turkish translations
    {
      id: 'turkish_ali',
      name: 'Ali Bulaç',
      language: 'Turkish',
      description: 'Modern Turkish translation',
      apiCode: 'tr.ali'
    },
    
    // Indonesian translations
    {
      id: 'indonesian_bahasa',
      name: 'Indonesian Language',
      language: 'Indonesian',
      description: 'Modern Indonesian translation',
      apiCode: 'id.bahasa'
    },
    
    // Malay translations
    {
      id: 'malay_abdullah',
      name: 'Abdullah Muhammad Basmeih',
      language: 'Malay',
      description: 'Official Malaysian translation',
      apiCode: 'ms.abdullah'
    },
    
    // Chinese translations
    {
      id: 'chinese_simplified',
      name: 'Chinese Simplified',
      language: 'Chinese',
      description: 'Simplified Chinese translation',
      apiCode: 'zh.simplified'
    },
    
    // Japanese translations
    {
      id: 'japanese_saito',
      name: 'Japanese Translation',
      language: 'Japanese',
      description: 'Japanese translation',
      apiCode: 'ja.saito'
    },
    
    // Russian translations
    {
      id: 'russian_krachkovsky',
      name: 'Ignaty Krachkovsky',
      language: 'Russian',
      description: 'Classic Russian translation',
      apiCode: 'ru.krachkovsky'
    },
    
    // Persian translations
    {
      id: 'persian_ansarian',
      name: 'Hussain Ansarian',
      language: 'Persian',
      description: 'Modern Persian translation',
      apiCode: 'fa.ansarian'
    },
    
    // Bengali translations
    {
      id: 'bengali_muhiuddin',
      name: 'Muhiuddin Khan',
      language: 'Bengali',
      description: 'Classic Bengali translation with clear language',
      apiCode: 'bn.bengali'
    },
    {
      id: 'bengali_zohurul',
      name: 'Zohurul Hoque',
      language: 'Bengali',
      description: 'Modern Bengali translation with contemporary language',
      apiCode: 'bn.hoque'
    }
  ];

  const getFontOptions = (): QuranFontOption[] => [
    {
      id: 'kfgqpc_uthmani',
      name: 'Uthmanic Hafs',
      description: 'Official Madinah Mushaf - Used in the King Fahd Complex printing',
      fontFamily: 'NotoNaskhArabic-Regular',
      apiCode: 'quran-uthmani'
    },
    {
      id: 'amiri_quran',
      name: 'Amiri',
      description: 'Traditional Naskh style - Classic Arabic calligraphy',
      fontFamily: 'Amiri-Regular',
      apiCode: 'quran-simple'
    },
    {
      id: 'scheherazade',
      name: 'Scheherazade',
      description: 'Modern Naskh style - Clear and easy to read',
      fontFamily: 'ScheherazadeNew-Regular',
      apiCode: 'quran-uthmani'
    },
    {
      id: 'me_quran',
      name: 'Indo-Pak Nastaliq',
      description: 'Traditional Indo-Pak style - Popular in South Asia',
      fontFamily: 'NotoSansArabic-Regular',
      apiCode: 'quran-simple'
    },
    {
      id: 'vazeh_quran',
      name: 'Simplified Arabic',
      description: 'Modern simplified style - Optimized for digital screens',
      fontFamily: 'Amiri-Bold',
      apiCode: 'quran-simple'
    }
  ];

  const value: QuranSettingsContextType = {
    settings,
    updateFontSize,
    updateTextDirection,
    toggleArabic,
    toggleTranslation,
    toggleAutoPlay,
    toggleTajweed,
    addBookmark,
    removeBookmark,
    isBookmarked,
    updateReciter,
    updateTranslator,
    updateFont,
    getReciterOptions,
    getTranslatorOptions,
    getFontOptions,
  };

  return (
    <QuranSettingsContext.Provider value={value}>
      {children}
    </QuranSettingsContext.Provider>
  );
}

export function useQuranSettings() {
  const context = useContext(QuranSettingsContext);
  if (context === undefined) {
    throw new Error('useQuranSettings must be used within a QuranSettingsProvider');
  }
  return context;
}
