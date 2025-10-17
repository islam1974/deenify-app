import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Chapter {
  id: number;
  name: string;
  nameTransliterated: string;
  nameTranslated: string;
  versesCount: number;
  revelationOrder: number;
  revelationPlace: 'makkah' | 'madinah';
}

export interface Verse {
  id: number;
  verseNumber: number;
  text: string;
  translation: string;
  transliteration?: string;
  audioUrl?: string;
}

export interface ChapterWithVerses extends Chapter {
  verses: Verse[];
}

class QuranService {
  private baseUrl = 'https://api.alquran.cloud/v1';
  private audioBaseUrl = 'https://www.everyayah.com/data/Alafasy_128kbps/';
  private chaptersCache: Chapter[] | null = null;
  private chaptersCacheKey = 'quran_chapters_cache';
  private chaptersCacheExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  
  // Static fallback chapters list for instant loading
  private staticChapters: Chapter[] = [
    { id: 1, name: 'الفاتحة', nameTransliterated: 'Al-Fatihah', nameTranslated: 'The Opener', versesCount: 7, revelationOrder: 5, revelationPlace: 'makkah' },
    { id: 2, name: 'البقرة', nameTransliterated: 'Al-Baqarah', nameTranslated: 'The Cow', versesCount: 286, revelationOrder: 87, revelationPlace: 'madinah' },
    { id: 3, name: 'آل عمران', nameTransliterated: 'Ali \'Imran', nameTranslated: 'Family of Imran', versesCount: 200, revelationOrder: 89, revelationPlace: 'madinah' },
    { id: 4, name: 'النساء', nameTransliterated: 'An-Nisa', nameTranslated: 'The Women', versesCount: 176, revelationOrder: 92, revelationPlace: 'madinah' },
    { id: 5, name: 'المائدة', nameTransliterated: 'Al-Ma\'idah', nameTranslated: 'The Table Spread', versesCount: 120, revelationOrder: 112, revelationPlace: 'madinah' },
    { id: 6, name: 'الأنعام', nameTransliterated: 'Al-An\'am', nameTranslated: 'The Cattle', versesCount: 165, revelationOrder: 55, revelationPlace: 'makkah' },
    { id: 7, name: 'الأعراف', nameTransliterated: 'Al-A\'raf', nameTranslated: 'The Heights', versesCount: 206, revelationOrder: 39, revelationPlace: 'makkah' },
    { id: 8, name: 'الأنفال', nameTransliterated: 'Al-Anfal', nameTranslated: 'The Spoils of War', versesCount: 75, revelationOrder: 88, revelationPlace: 'madinah' },
    { id: 9, name: 'التوبة', nameTransliterated: 'At-Tawbah', nameTranslated: 'The Repentance', versesCount: 129, revelationOrder: 113, revelationPlace: 'madinah' },
    { id: 10, name: 'يونس', nameTransliterated: 'Yunus', nameTranslated: 'Jonah', versesCount: 109, revelationOrder: 51, revelationPlace: 'makkah' },
    { id: 11, name: 'هود', nameTransliterated: 'Hud', nameTranslated: 'Hud', versesCount: 123, revelationOrder: 52, revelationPlace: 'makkah' },
    { id: 12, name: 'يوسف', nameTransliterated: 'Yusuf', nameTranslated: 'Joseph', versesCount: 111, revelationOrder: 53, revelationPlace: 'makkah' },
    { id: 13, name: 'الرعد', nameTransliterated: 'Ar-Ra\'d', nameTranslated: 'The Thunder', versesCount: 43, revelationOrder: 96, revelationPlace: 'madinah' },
    { id: 14, name: 'ابراهيم', nameTransliterated: 'Ibrahim', nameTranslated: 'Abraham', versesCount: 52, revelationOrder: 72, revelationPlace: 'makkah' },
    { id: 15, name: 'الحجر', nameTransliterated: 'Al-Hijr', nameTranslated: 'The Rocky Tract', versesCount: 99, revelationOrder: 54, revelationPlace: 'makkah' },
    { id: 16, name: 'النحل', nameTransliterated: 'An-Nahl', nameTranslated: 'The Bee', versesCount: 128, revelationOrder: 70, revelationPlace: 'makkah' },
    { id: 17, name: 'الإسراء', nameTransliterated: 'Al-Isra', nameTranslated: 'The Night Journey', versesCount: 111, revelationOrder: 50, revelationPlace: 'makkah' },
    { id: 18, name: 'الكهف', nameTransliterated: 'Al-Kahf', nameTranslated: 'The Cave', versesCount: 110, revelationOrder: 69, revelationPlace: 'makkah' },
    { id: 19, name: 'مريم', nameTransliterated: 'Maryam', nameTranslated: 'Mary', versesCount: 98, revelationOrder: 44, revelationPlace: 'makkah' },
    { id: 20, name: 'طه', nameTransliterated: 'Taha', nameTranslated: 'Ta-Ha', versesCount: 135, revelationOrder: 45, revelationPlace: 'makkah' },
    { id: 21, name: 'الأنبياء', nameTransliterated: 'Al-Anbya', nameTranslated: 'The Prophets', versesCount: 112, revelationOrder: 73, revelationPlace: 'makkah' },
    { id: 22, name: 'الحج', nameTransliterated: 'Al-Hajj', nameTranslated: 'The Pilgrimage', versesCount: 78, revelationOrder: 103, revelationPlace: 'madinah' },
    { id: 23, name: 'المؤمنون', nameTransliterated: 'Al-Mu\'minun', nameTranslated: 'The Believers', versesCount: 118, revelationOrder: 74, revelationPlace: 'makkah' },
    { id: 24, name: 'النور', nameTransliterated: 'An-Nur', nameTranslated: 'The Light', versesCount: 64, revelationOrder: 102, revelationPlace: 'madinah' },
    { id: 25, name: 'الفرقان', nameTransliterated: 'Al-Furqan', nameTranslated: 'The Criterion', versesCount: 77, revelationOrder: 42, revelationPlace: 'makkah' },
    { id: 26, name: 'الشعراء', nameTransliterated: 'Ash-Shu\'ara', nameTranslated: 'The Poets', versesCount: 227, revelationOrder: 47, revelationPlace: 'makkah' },
    { id: 27, name: 'النمل', nameTransliterated: 'An-Naml', nameTranslated: 'The Ant', versesCount: 93, revelationOrder: 48, revelationPlace: 'makkah' },
    { id: 28, name: 'القصص', nameTransliterated: 'Al-Qasas', nameTranslated: 'The Stories', versesCount: 88, revelationOrder: 49, revelationPlace: 'makkah' },
    { id: 29, name: 'العنكبوت', nameTransliterated: 'Al-\'Ankabut', nameTranslated: 'The Spider', versesCount: 69, revelationOrder: 85, revelationPlace: 'makkah' },
    { id: 30, name: 'الروم', nameTransliterated: 'Ar-Rum', nameTranslated: 'The Romans', versesCount: 60, revelationOrder: 84, revelationPlace: 'makkah' },
    { id: 31, name: 'لقمان', nameTransliterated: 'Luqman', nameTranslated: 'Luqman', versesCount: 34, revelationOrder: 57, revelationPlace: 'makkah' },
    { id: 32, name: 'السجدة', nameTransliterated: 'As-Sajdah', nameTranslated: 'The Prostration', versesCount: 30, revelationOrder: 75, revelationPlace: 'makkah' },
    { id: 33, name: 'الأحزاب', nameTransliterated: 'Al-Ahzab', nameTranslated: 'The Combined Forces', versesCount: 73, revelationOrder: 90, revelationPlace: 'madinah' },
    { id: 34, name: 'سبإ', nameTransliterated: 'Saba', nameTranslated: 'Sheba', versesCount: 54, revelationOrder: 58, revelationPlace: 'makkah' },
    { id: 35, name: 'فاطر', nameTransliterated: 'Fatir', nameTranslated: 'Originator', versesCount: 45, revelationOrder: 43, revelationPlace: 'makkah' },
    { id: 36, name: 'يس', nameTransliterated: 'Ya-Sin', nameTranslated: 'Ya Sin', versesCount: 83, revelationOrder: 41, revelationPlace: 'makkah' },
    { id: 37, name: 'الصافات', nameTransliterated: 'As-Saffat', nameTranslated: 'Those who set the Ranks', versesCount: 182, revelationOrder: 56, revelationPlace: 'makkah' },
    { id: 38, name: 'ص', nameTransliterated: 'Sad', nameTranslated: 'The Letter "Saad"', versesCount: 88, revelationOrder: 38, revelationPlace: 'makkah' },
    { id: 39, name: 'الزمر', nameTransliterated: 'Az-Zumar', nameTranslated: 'The Troops', versesCount: 75, revelationOrder: 59, revelationPlace: 'makkah' },
    { id: 40, name: 'غافر', nameTransliterated: 'Ghafir', nameTranslated: 'The Forgiver', versesCount: 85, revelationOrder: 60, revelationPlace: 'makkah' },
    { id: 41, name: 'فصلت', nameTransliterated: 'Fussilat', nameTranslated: 'Explained in Detail', versesCount: 54, revelationOrder: 61, revelationPlace: 'makkah' },
    { id: 42, name: 'الشورى', nameTransliterated: 'Ash-Shuraa', nameTranslated: 'The Consultation', versesCount: 53, revelationOrder: 62, revelationPlace: 'makkah' },
    { id: 43, name: 'الزخرف', nameTransliterated: 'Az-Zukhruf', nameTranslated: 'The Ornaments of Gold', versesCount: 89, revelationOrder: 63, revelationPlace: 'makkah' },
    { id: 44, name: 'الدخان', nameTransliterated: 'Ad-Dukhan', nameTranslated: 'The Smoke', versesCount: 59, revelationOrder: 64, revelationPlace: 'makkah' },
    { id: 45, name: 'الجاثية', nameTransliterated: 'Al-Jathiyah', nameTranslated: 'The Crouching', versesCount: 37, revelationOrder: 65, revelationPlace: 'makkah' },
    { id: 46, name: 'الأحقاف', nameTransliterated: 'Al-Ahqaf', nameTranslated: 'The Wind-Curved Sandhills', versesCount: 35, revelationOrder: 66, revelationPlace: 'makkah' },
    { id: 47, name: 'محمد', nameTransliterated: 'Muhammad', nameTranslated: 'Muhammad', versesCount: 38, revelationOrder: 95, revelationPlace: 'madinah' },
    { id: 48, name: 'الفتح', nameTransliterated: 'Al-Fath', nameTranslated: 'The Victory', versesCount: 29, revelationOrder: 111, revelationPlace: 'madinah' },
    { id: 49, name: 'الحجرات', nameTransliterated: 'Al-Hujurat', nameTranslated: 'The Rooms', versesCount: 18, revelationOrder: 106, revelationPlace: 'madinah' },
    { id: 50, name: 'ق', nameTransliterated: 'Qaf', nameTranslated: 'The Letter "Qaf"', versesCount: 45, revelationOrder: 34, revelationPlace: 'makkah' },
    { id: 51, name: 'الذاريات', nameTransliterated: 'Adh-Dhariyat', nameTranslated: 'The Winnowing Winds', versesCount: 60, revelationOrder: 67, revelationPlace: 'makkah' },
    { id: 52, name: 'الطور', nameTransliterated: 'At-Tur', nameTranslated: 'The Mount', versesCount: 49, revelationOrder: 76, revelationPlace: 'makkah' },
    { id: 53, name: 'النجم', nameTransliterated: 'An-Najm', nameTranslated: 'The Star', versesCount: 62, revelationOrder: 23, revelationPlace: 'makkah' },
    { id: 54, name: 'القمر', nameTransliterated: 'Al-Qamar', nameTranslated: 'The Moon', versesCount: 55, revelationOrder: 37, revelationPlace: 'makkah' },
    { id: 55, name: 'الرحمن', nameTransliterated: 'Ar-Rahman', nameTranslated: 'The Beneficent', versesCount: 78, revelationOrder: 97, revelationPlace: 'madinah' },
    { id: 56, name: 'الواقعة', nameTransliterated: 'Al-Waqi\'ah', nameTranslated: 'The Inevitable', versesCount: 96, revelationOrder: 46, revelationPlace: 'makkah' },
    { id: 57, name: 'الحديد', nameTransliterated: 'Al-Hadid', nameTranslated: 'The Iron', versesCount: 29, revelationOrder: 94, revelationPlace: 'madinah' },
    { id: 58, name: 'المجادلة', nameTransliterated: 'Al-Mujadila', nameTranslated: 'The Pleading Woman', versesCount: 22, revelationOrder: 105, revelationPlace: 'madinah' },
    { id: 59, name: 'الحشر', nameTransliterated: 'Al-Hashr', nameTranslated: 'The Exile', versesCount: 24, revelationOrder: 101, revelationPlace: 'madinah' },
    { id: 60, name: 'الممتحنة', nameTransliterated: 'Al-Mumtahanah', nameTranslated: 'She that is to be examined', versesCount: 13, revelationOrder: 91, revelationPlace: 'madinah' },
    { id: 61, name: 'الصف', nameTransliterated: 'As-Saf', nameTranslated: 'The Ranks', versesCount: 14, revelationOrder: 109, revelationPlace: 'madinah' },
    { id: 62, name: 'الجمعة', nameTransliterated: 'Al-Jumu\'ah', nameTranslated: 'The Congregation, Friday', versesCount: 11, revelationOrder: 110, revelationPlace: 'madinah' },
    { id: 63, name: 'المنافقون', nameTransliterated: 'Al-Munafiqun', nameTranslated: 'The Hypocrites', versesCount: 11, revelationOrder: 104, revelationPlace: 'madinah' },
    { id: 64, name: 'التغابن', nameTransliterated: 'At-Taghabun', nameTranslated: 'The Mutual Disillusion', versesCount: 18, revelationOrder: 108, revelationPlace: 'madinah' },
    { id: 65, name: 'الطلاق', nameTransliterated: 'At-Talaq', nameTranslated: 'The Divorce', versesCount: 12, revelationOrder: 99, revelationPlace: 'madinah' },
    { id: 66, name: 'التحريم', nameTransliterated: 'At-Tahrim', nameTranslated: 'The Prohibition', versesCount: 12, revelationOrder: 107, revelationPlace: 'madinah' },
    { id: 67, name: 'الملك', nameTransliterated: 'Al-Mulk', nameTranslated: 'The Sovereignty', versesCount: 30, revelationOrder: 77, revelationPlace: 'makkah' },
    { id: 68, name: 'القلم', nameTransliterated: 'Al-Qalam', nameTranslated: 'The Pen', versesCount: 52, revelationOrder: 2, revelationPlace: 'makkah' },
    { id: 69, name: 'الحاقة', nameTransliterated: 'Al-Haqqah', nameTranslated: 'The Reality', versesCount: 52, revelationOrder: 78, revelationPlace: 'makkah' },
    { id: 70, name: 'المعارج', nameTransliterated: 'Al-Ma\'arij', nameTranslated: 'The Ascending Stairways', versesCount: 44, revelationOrder: 79, revelationPlace: 'makkah' },
    { id: 71, name: 'نوح', nameTransliterated: 'Nuh', nameTranslated: 'Noah', versesCount: 28, revelationOrder: 71, revelationPlace: 'makkah' },
    { id: 72, name: 'الجن', nameTransliterated: 'Al-Jinn', nameTranslated: 'The Jinn', versesCount: 28, revelationOrder: 40, revelationPlace: 'makkah' },
    { id: 73, name: 'المزمل', nameTransliterated: 'Al-Muzzammil', nameTranslated: 'The Enshrouded One', versesCount: 20, revelationOrder: 3, revelationPlace: 'makkah' },
    { id: 74, name: 'المدثر', nameTransliterated: 'Al-Muddaththir', nameTranslated: 'The Cloaked One', versesCount: 56, revelationOrder: 4, revelationPlace: 'makkah' },
    { id: 75, name: 'القيامة', nameTransliterated: 'Al-Qiyamah', nameTranslated: 'The Resurrection', versesCount: 40, revelationOrder: 31, revelationPlace: 'makkah' },
    { id: 76, name: 'الانسان', nameTransliterated: 'Al-Insan', nameTranslated: 'The Man', versesCount: 31, revelationOrder: 98, revelationPlace: 'madinah' },
    { id: 77, name: 'المرسلات', nameTransliterated: 'Al-Mursalat', nameTranslated: 'The Emissaries', versesCount: 50, revelationOrder: 33, revelationPlace: 'makkah' },
    { id: 78, name: 'النبإ', nameTransliterated: 'An-Naba', nameTranslated: 'The Tidings', versesCount: 40, revelationOrder: 80, revelationPlace: 'makkah' },
    { id: 79, name: 'النازعات', nameTransliterated: 'An-Nazi\'at', nameTranslated: 'Those who drag forth', versesCount: 46, revelationOrder: 81, revelationPlace: 'makkah' },
    { id: 80, name: 'عبس', nameTransliterated: '\'Abasa', nameTranslated: 'He Frowned', versesCount: 42, revelationOrder: 24, revelationPlace: 'makkah' },
    { id: 81, name: 'التكوير', nameTransliterated: 'At-Takwir', nameTranslated: 'The Overthrowing', versesCount: 29, revelationOrder: 7, revelationPlace: 'makkah' },
    { id: 82, name: 'الإنفطار', nameTransliterated: 'Al-Infitar', nameTranslated: 'The Cleaving', versesCount: 19, revelationOrder: 82, revelationPlace: 'makkah' },
    { id: 83, name: 'المطففين', nameTransliterated: 'Al-Mutaffifin', nameTranslated: 'The Defrauding', versesCount: 36, revelationOrder: 86, revelationPlace: 'makkah' },
    { id: 84, name: 'الإنشقاق', nameTransliterated: 'Al-Inshiqaq', nameTranslated: 'The Sundering', versesCount: 25, revelationOrder: 83, revelationPlace: 'makkah' },
    { id: 85, name: 'البروج', nameTransliterated: 'Al-Buruj', nameTranslated: 'The Mansions of the Stars', versesCount: 22, revelationOrder: 27, revelationPlace: 'makkah' },
    { id: 86, name: 'الطارق', nameTransliterated: 'At-Tariq', nameTranslated: 'The Nightcommer', versesCount: 17, revelationOrder: 36, revelationPlace: 'makkah' },
    { id: 87, name: 'الأعلى', nameTransliterated: 'Al-A\'la', nameTranslated: 'The Most High', versesCount: 19, revelationOrder: 8, revelationPlace: 'makkah' },
    { id: 88, name: 'الغاشية', nameTransliterated: 'Al-Ghashiyah', nameTranslated: 'The Overwhelming', versesCount: 26, revelationOrder: 68, revelationPlace: 'makkah' },
    { id: 89, name: 'الفجر', nameTransliterated: 'Al-Fajr', nameTranslated: 'The Dawn', versesCount: 30, revelationOrder: 10, revelationPlace: 'makkah' },
    { id: 90, name: 'البلد', nameTransliterated: 'Al-Balad', nameTranslated: 'The City', versesCount: 20, revelationOrder: 35, revelationPlace: 'makkah' },
    { id: 91, name: 'الشمس', nameTransliterated: 'Ash-Shams', nameTranslated: 'The Sun', versesCount: 15, revelationOrder: 26, revelationPlace: 'makkah' },
    { id: 92, name: 'الليل', nameTransliterated: 'Al-Layl', nameTranslated: 'The Night', versesCount: 21, revelationOrder: 9, revelationPlace: 'makkah' },
    { id: 93, name: 'الضحى', nameTransliterated: 'Ad-Duhaa', nameTranslated: 'The Morning Hours', versesCount: 11, revelationOrder: 11, revelationPlace: 'makkah' },
    { id: 94, name: 'الشرح', nameTransliterated: 'Ash-Sharh', nameTranslated: 'The Relief', versesCount: 8, revelationOrder: 12, revelationPlace: 'makkah' },
    { id: 95, name: 'التين', nameTransliterated: 'At-Tin', nameTranslated: 'The Fig', versesCount: 8, revelationOrder: 28, revelationPlace: 'makkah' },
    { id: 96, name: 'العلق', nameTransliterated: 'Al-\'Alaq', nameTranslated: 'The Clot', versesCount: 19, revelationOrder: 1, revelationPlace: 'makkah' },
    { id: 97, name: 'القدر', nameTransliterated: 'Al-Qadr', nameTranslated: 'The Power', versesCount: 5, revelationOrder: 25, revelationPlace: 'makkah' },
    { id: 98, name: 'البينة', nameTransliterated: 'Al-Bayyinah', nameTranslated: 'The Clear Proof', versesCount: 8, revelationOrder: 100, revelationPlace: 'madinah' },
    { id: 99, name: 'الزلزلة', nameTransliterated: 'Az-Zalzalah', nameTranslated: 'The Earthquake', versesCount: 8, revelationOrder: 93, revelationPlace: 'madinah' },
    { id: 100, name: 'العاديات', nameTransliterated: 'Al-\'Adiyat', nameTranslated: 'The Courser', versesCount: 11, revelationOrder: 14, revelationPlace: 'makkah' },
    { id: 101, name: 'القارعة', nameTransliterated: 'Al-Qari\'ah', nameTranslated: 'The Calamity', versesCount: 11, revelationOrder: 30, revelationPlace: 'makkah' },
    { id: 102, name: 'التكاثر', nameTransliterated: 'At-Takathur', nameTranslated: 'The Rivalry in world increase', versesCount: 8, revelationOrder: 16, revelationPlace: 'makkah' },
    { id: 103, name: 'العصر', nameTransliterated: 'Al-\'Asr', nameTranslated: 'The Declining Day', versesCount: 3, revelationOrder: 13, revelationPlace: 'makkah' },
    { id: 104, name: 'الهمزة', nameTransliterated: 'Al-Humazah', nameTranslated: 'The Traducer', versesCount: 9, revelationOrder: 32, revelationPlace: 'makkah' },
    { id: 105, name: 'الفيل', nameTransliterated: 'Al-Fil', nameTranslated: 'The Elephant', versesCount: 5, revelationOrder: 19, revelationPlace: 'makkah' },
    { id: 106, name: 'قريش', nameTransliterated: 'Quraysh', nameTranslated: 'Quraysh', versesCount: 4, revelationOrder: 29, revelationPlace: 'makkah' },
    { id: 107, name: 'الماعون', nameTransliterated: 'Al-Ma\'un', nameTranslated: 'The Small kindnesses', versesCount: 7, revelationOrder: 17, revelationPlace: 'makkah' },
    { id: 108, name: 'الكوثر', nameTransliterated: 'Al-Kawthar', nameTranslated: 'The Abundance', versesCount: 3, revelationOrder: 15, revelationPlace: 'makkah' },
    { id: 109, name: 'الكافرون', nameTransliterated: 'Al-Kafirun', nameTranslated: 'The Disbelievers', versesCount: 6, revelationOrder: 18, revelationPlace: 'makkah' },
    { id: 110, name: 'النصر', nameTransliterated: 'An-Nasr', nameTranslated: 'The Divine Support', versesCount: 3, revelationOrder: 114, revelationPlace: 'madinah' },
    { id: 111, name: 'المسد', nameTransliterated: 'Al-Masad', nameTranslated: 'The Palm Fiber', versesCount: 5, revelationOrder: 6, revelationPlace: 'makkah' },
    { id: 112, name: 'الإخلاص', nameTransliterated: 'Al-Ikhlas', nameTranslated: 'The Sincerity', versesCount: 4, revelationOrder: 22, revelationPlace: 'makkah' },
    { id: 113, name: 'الفلق', nameTransliterated: 'Al-Falaq', nameTranslated: 'The Daybreak', versesCount: 5, revelationOrder: 20, revelationPlace: 'makkah' },
    { id: 114, name: 'الناس', nameTransliterated: 'An-Nas', nameTranslated: 'Mankind', versesCount: 6, revelationOrder: 21, revelationPlace: 'makkah' },
  ];
  
  // Get available reciters from Al Quran Cloud API
  async getAvailableReciters(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/edition/format/audio`);
      const data = await response.json();
      
      if (data.status === 'OK') {
        return data.data;
      }
      throw new Error('Failed to fetch reciters');
    } catch (error) {
      console.error('Error fetching reciters:', error);
      return [];
    }
  }

  // Get available translations from Al Quran Cloud API
  async getAvailableTranslations(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/edition/format/text`);
      const data = await response.json();
      
      if (data.status === 'OK') {
        return data.data;
      }
      throw new Error('Failed to fetch translations');
    } catch (error) {
      console.error('Error fetching translations:', error);
      return [];
    }
  }
  
  // Popular Quran API endpoints with caching
  async getChapters(): Promise<Chapter[]> {
    try {
      // 1. Check memory cache first (instant)
      if (this.chaptersCache) {
        console.log('📖 Returning chapters from memory cache');
        return this.chaptersCache;
      }

      // 2. Check AsyncStorage cache (very fast)
      try {
        const cachedData = await AsyncStorage.getItem(this.chaptersCacheKey);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          const cacheAge = Date.now() - parsed.timestamp;
          
          // If cache is still valid, use it
          if (cacheAge < this.chaptersCacheExpiry) {
            console.log('📖 Returning chapters from storage cache');
            this.chaptersCache = parsed.data;
            
            // Refresh cache in background (optional, for keeping data fresh)
            this.refreshChaptersInBackground();
            
            return parsed.data;
          } else {
            console.log('📖 Cache expired, using static data and fetching fresh data');
          }
        }
      } catch (cacheError) {
        console.log('📖 Cache read failed, using static data');
      }

      // 3. Return static chapters immediately (instant UI load)
      console.log('📖 Returning static chapters for instant load');
      this.chaptersCache = this.staticChapters;
      
      // 4. Fetch from API in background to update cache
      this.refreshChaptersInBackground();
      
      return this.staticChapters;
    } catch (error) {
      console.error('Error fetching chapters:', error);
      
      // Try to return stale cache as fallback
      try {
        const cachedData = await AsyncStorage.getItem(this.chaptersCacheKey);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          console.log('📖 Returning stale cache as fallback');
          return parsed.data;
        }
      } catch (fallbackError) {
        console.error('Fallback cache also failed');
      }
      
      // Final fallback: return static chapters
      console.log('📖 Returning static chapters as final fallback');
      return this.staticChapters;
    }
  }
  
  // Background refresh to keep cache updated without blocking UI
  private refreshChaptersInBackground() {
    fetch(`${this.baseUrl}/meta`)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'OK') {
          const chapters = data.data.surahs.references.map((surah: any) => ({
            id: surah.number,
            name: surah.name,
            nameTransliterated: surah.englishName,
            nameTranslated: surah.englishNameTranslation,
            versesCount: surah.numberOfAyahs,
            revelationOrder: surah.revelationOrder,
            revelationPlace: surah.revelationType === 'Meccan' ? 'makkah' : 'madinah'
          }));

          // Update memory cache
          this.chaptersCache = chapters;

          // Update AsyncStorage cache
          AsyncStorage.setItem(
            this.chaptersCacheKey,
            JSON.stringify({
              data: chapters,
              timestamp: Date.now()
            })
          ).catch(err => console.error('Failed to cache chapters:', err));

          console.log('📖 Background refresh completed');
        }
      })
      .catch(error => {
        console.log('📖 Background refresh failed (silent):', error.message);
        // Silently fail - we already have static chapters loaded
      });
  }

  async getChapter(chapterNumber: number, translation: string = 'en.sahih'): Promise<ChapterWithVerses> {
    try {
      // Fetch chapter info
      const chapterResponse = await fetch(`${this.baseUrl}/surah/${chapterNumber}`);
      const chapterData = await chapterResponse.json();
      
      if (chapterData.status !== 'OK') {
        throw new Error('Failed to fetch chapter');
      }

      // Fetch Arabic verses
      const arabicResponse = await fetch(`${this.baseUrl}/surah/${chapterNumber}`);
      const arabicData = await arabicResponse.json();
      
      // Fetch verses with translation
      const versesResponse = await fetch(`${this.baseUrl}/surah/${chapterNumber}/${translation}`);
      const versesData = await versesResponse.json();
      
      if (versesData.status !== 'OK' || arabicData.status !== 'OK') {
        throw new Error('Failed to fetch verses');
      }

      const surah = chapterData.data;
      const verses = versesData.data.ayahs.map((ayah: any, index: number) => ({
        id: ayah.numberInSurah,
        verseNumber: ayah.numberInSurah,
        text: arabicData.data.ayahs[index]?.text || ayah.text, // Arabic text
        translation: ayah.text, // English translation
        audioUrl: `${this.audioBaseUrl}${String(chapterNumber).padStart(3, '0')}${String(ayah.numberInSurah).padStart(3, '0')}.mp3`
      }));

      return {
        id: surah.number,
        name: surah.name,
        nameTransliterated: surah.englishName,
        nameTranslated: surah.englishNameTranslation,
        versesCount: surah.numberOfAyahs,
        revelationOrder: surah.revelationOrder,
        revelationPlace: surah.revelationType === 'Meccan' ? 'makkah' : 'madinah',
        verses: verses
      };
    } catch (error) {
      console.error('Error fetching chapter:', error);
      throw error;
    }
  }

  async getVerseAudio(chapterNumber: number, verseNumber: number, reciterId: string = 'alafasy'): Promise<string> {
    const chapterPadded = String(chapterNumber).padStart(3, '0');
    const versePadded = String(verseNumber).padStart(3, '0');
    
    // COMPREHENSIVE reciter mapping with multiple sources
    const reciterAudioUrls: Record<string, string> = {
      // Primary reciters - EveryAyah (most reliable)
      'alafasy': 'https://www.everyayah.com/data/Alafasy_128kbps/',
      'husary': 'https://www.everyayah.com/data/Husary_128kbps/',
      'shuraim': 'https://www.everyayah.com/data/Shuraim_128kbps/',
      'mishary': 'https://www.everyayah.com/data/Mishary_128kbps/',
      'ajamy': 'https://www.everyayah.com/data/Ajamy_128kbps/',
      'khalid_al_jalil': 'https://www.everyayah.com/data/Khalid_Al_Jalil_128kbps/',
      'abdul_basit': 'https://www.everyayah.com/data/Abdul_Basit_Murattal_128kbps/',
      
      // Additional popular reciters
      'sudais': 'https://www.everyayah.com/data/Sudais_128kbps/',
      'maher': 'https://www.everyayah.com/data/Maher_128kbps/',
      'abdul_basit_murattal': 'https://www.everyayah.com/data/Abdul_Basit_Murattal_128kbps/',
      
      // More reciters from EveryAyah
      'muhammad_siddiq_minshawi': 'https://www.everyayah.com/data/Minshawy_128kbps/',
      'saad_al_ghamdi': 'https://www.everyayah.com/data/Saad_Al_Ghamdi_128kbps/',
      'yasser_ad_dussary': 'https://www.everyayah.com/data/Yasser_Ad_Dussary_128kbps/',
      'yasser_al_dosari': 'https://www.everyayah.com/data/Yasser_Al_Dosari_128kbps/',
      'muhammad_jibreel': 'https://www.everyayah.com/data/Muhammad_Jibreel_128kbps/',
      'ibrahim_al_dosari': 'https://www.everyayah.com/data/Ibrahim_Al_Dosari_128kbps/',
      'hani_rifai': 'https://www.everyayah.com/data/Hani_Rifai_128kbps/',
      'ahmed_ajamy': 'https://www.everyayah.com/data/Ahmed_Ajamy_128kbps/',
      'bandar_baleelah': 'https://www.everyayah.com/data/Bandar_Baleelah_128kbps/',
      'fares_abbad': 'https://www.everyayah.com/data/Fares_Abbad_128kbps/',
      'khalid_qahtani': 'https://www.everyayah.com/data/Khalid_Qahtani_128kbps/',
      'mohammad_ayyoub': 'https://www.everyayah.com/data/Mohammad_Ayyoub_128kbps/',
      'mohammad_jibreel': 'https://www.everyayah.com/data/Mohammad_Jibreel_128kbps/',
      'mohammad_siddiq_minshawi': 'https://www.everyayah.com/data/Mohammad_Siddiq_Minshawi_128kbps/',
      'muhammad_al_luhaidan': 'https://www.everyayah.com/data/Muhammad_Al_Luhaidan_128kbps/',
      'salah_al_budair': 'https://www.everyayah.com/data/Salah_Al_Budair_128kbps/',
      'salah_rashed': 'https://www.everyayah.com/data/Salah_Rashed_128kbps/',
      'tareq_ibrahim': 'https://www.everyayah.com/data/Tareq_Ibrahim_128kbps/',
      'younis_ali': 'https://www.everyayah.com/data/Younis_Ali_128kbps/',
      'yusuf_ibn_noor_muhammad': 'https://www.everyayah.com/data/Yusuf_Ibn_Noor_Muhammad_128kbps/',
      'zakaria_ibn_ghulam_ahmad': 'https://www.everyayah.com/data/Zakaria_Ibn_Ghulam_Ahmad_128kbps/',
      
      // Fallback to Alafasy if reciter not found
    };
    
    const baseUrl = reciterAudioUrls[reciterId] || reciterAudioUrls['alafasy'];
    return `${baseUrl}${chapterPadded}${versePadded}.mp3`;
  }

  // Get English audio for a verse (using reliable TTS approach since English audio APIs are limited)
  async getVerseEnglishAudio(chapterNumber: number, verseNumber: number, translatorId: string = 'pickthall'): Promise<string> {
    // Since English audio APIs are limited, we'll use TTS approach
    // This method will be used to get the translation text for TTS
    const chapterPadded = String(chapterNumber).padStart(3, '0');
    const versePadded = String(verseNumber).padStart(3, '0');
    
    console.log(`🔊 Getting English translation for Chapter ${chapterNumber}, Verse ${verseNumber}`);
    console.log(`🔊 Translator: ${translatorId}`);
    
    // Return a placeholder - the actual TTS will be handled in AudioService
    return `tts://${chapterNumber}/${verseNumber}/${translatorId}`;
  }

  // Alternative API for better translations with font support
  async getChapterWithTranslation(chapterNumber: number, translatorId: string = 'sahih', reciterId: string = 'alafasy', fontId: string = 'uthmani'): Promise<ChapterWithVerses> {
    try {
      // Enhanced translator mapping with Al Quran Cloud supported translations
      const translatorMap: Record<string, string> = {
        // English translations
        'sahih': 'en.sahih',
        'asad': 'en.asad',
        'pickthall': 'en.pickthall',
        'yusufali': 'en.yusufali',
        'shakir': 'en.shakir',
        'muhammad': 'en.hilali',
        'clear': 'en.clear',
        'dr_mohsen': 'en.mohsin',
        'fooladvand': 'en.fooladvand',
        'ghali': 'en.ghali',
        'itani': 'en.itani',
        'khan': 'en.khan',
        'maududi': 'en.maududi',
        'muhammad_asad': 'en.asad',
        'muhammad_taqi': 'en.hilali',
        'qaribullah': 'en.qaribullah',
        'quran_project': 'en.quranproject',
        'sarwar': 'en.sarwar',
        'tahir_ul_qadri': 'en.tahir',
        'taqi_usmani': 'en.usmani',
        'wahiduddin': 'en.wahiduddin',
        'yusuf_ali': 'en.yusufali',
        
        // Arabic translations
        'arabic_muyassar': 'ar.muyassar',
        'arabic_simple': 'ar.simple',
        'arabic_wordbyword': 'ar.wordbyword',
        
        // Other languages
        'urdu_jalandhry': 'ur.jalandhry',
        'urdu_mehmood': 'ur.mehmood',
        'urdu_muhammad': 'ur.muhammad',
        'urdu_qadri': 'ur.qadri',
        'urdu_salahuddin': 'ur.salahuddin',
        'urdu_tahir': 'ur.tahir',
        'urdu_taqi': 'ur.taqi',
        'urdu_taqi_usmani': 'ur.usmani',
        'urdu_wahiduddin': 'ur.wahiduddin',
        'urdu_yusuf': 'ur.yusuf',
        
        // French
        'french_hamidullah': 'fr.hamidullah',
        'french_muhammad': 'fr.muhammad',
        
        // German
        'german_bubenheim': 'de.bubenheim',
        'german_khoury': 'de.khoury',
        
        // Spanish
        'spanish_cortes': 'es.cortes',
        'spanish_garcia': 'es.garcia',
        
        // Turkish
        'turkish_ali': 'tr.ali',
        'turkish_bulac': 'tr.bulac',
        'turkish_diyanet': 'tr.diyanet',
        'turkish_ozturk': 'tr.ozturk',
        'turkish_vakfi': 'tr.vakfi',
        'turkish_yazir': 'tr.yazir',
        
        // Indonesian
        'indonesian_bahasa': 'id.bahasa',
        'indonesian_muhammad': 'id.muhammad',
        
        // Malay
        'malay_abdullah': 'ms.abdullah',
        'malay_basmeih': 'ms.basmeih',
        
        // Chinese
        'chinese_simplified': 'zh.simplified',
        'chinese_traditional': 'zh.traditional',
        
        // Japanese
        'japanese_saito': 'ja.saito',
        
        // Russian
        'russian_krachkovsky': 'ru.krachkovsky',
        'russian_magomed': 'ru.magomed',
        'russian_osmanov': 'ru.osmanov',
        'russian_porokhova': 'ru.porokhova',
        
        // Persian
        'persian_ansarian': 'fa.ansarian',
        'persian_ayati': 'fa.ayati',
        'persian_fooladvand': 'fa.fooladvand',
        'persian_ghomshei': 'fa.ghomshei',
        'persian_khorramdel': 'fa.khorramdel',
        'persian_khorramshahi': 'fa.khorramshahi',
        'persian_makarem': 'fa.makarem',
        'persian_moezzi': 'fa.moezzi',
        'persian_mojtabavi': 'fa.mojtabavi',
        'persian_qaraati': 'fa.qaraati',
        'persian_qazvini': 'fa.qazvini',
        'persian_sadeqi': 'fa.sadeqi',
        'persian_salehi': 'fa.salehi',
        
        // Bengali
        'bengali_muhiuddin': 'bn.bengali',
        'bengali_zohurul': 'bn.hoque'
      };
      
      const translationCode = translatorMap[translatorId] || 'en.sahih';
      
      // Font mapping for different Quran text formats
      const fontMap: Record<string, string> = {
        'kfgqpc_uthmani': 'quran-uthmani',
        'amiri_quran': 'quran-simple', 
        'scheherazade': 'quran-uthmani',
        'me_quran': 'quran-simple',
        'vazeh_quran': 'quran-simple'
      };
      
      const fontCode = fontMap[fontId] || 'quran-uthmani';
      
      console.log(`Fetching chapter ${chapterNumber} with translation: ${translationCode} and font: ${fontCode}`);
      
      // Fetch Arabic text with specific font format
      const arabicResponse = await fetch(`${this.baseUrl}/surah/${chapterNumber}/${fontCode}`);
      const arabicData = await arabicResponse.json();
      
      // Fetch English translation
      const translationResponse = await fetch(`${this.baseUrl}/surah/${chapterNumber}/${translationCode}`);
      const translationData = await translationResponse.json();
      
      if (arabicData.status !== 'OK') {
        console.error('Arabic data fetch failed:', arabicData);
        throw new Error('Failed to fetch Arabic text');
      }
      
      if (translationData.status !== 'OK') {
        console.error('Translation data fetch failed:', translationData);
        throw new Error(`Failed to fetch translation for ${translationCode}`);
      }

      console.log(`Successfully fetched ${arabicData.data.ayahs.length} Arabic verses and ${translationData.data.ayahs.length} translation verses`);

      const surah = arabicData.data;
      const verses = await Promise.all(
        translationData.data.ayahs.map(async (ayah: any, index: number) => ({
          id: ayah.numberInSurah,
          verseNumber: ayah.numberInSurah,
          text: arabicData.data.ayahs[index]?.text || ayah.text, // Arabic text
          translation: ayah.text, // English translation
          audioUrl: await this.getVerseAudio(chapterNumber, ayah.numberInSurah, reciterId)
        }))
      );

      return {
        id: surah.number,
        name: surah.name,
        nameTransliterated: surah.englishName,
        nameTranslated: surah.englishNameTranslation,
        versesCount: surah.numberOfAyahs,
        revelationOrder: surah.revelationOrder,
        revelationPlace: surah.revelationType === 'Meccan' ? 'makkah' : 'madinah',
        verses: verses
      };
    } catch (error) {
      console.error('Error fetching chapter with translation:', error);
      throw error;
    }
  }
}

export default new QuranService();
