import { Hadith } from '@/data/hadithData';

// API endpoints
const HADITH_API_BASE = 'https://hadithapi.com/api';

// Cache for API responses to reduce network calls
interface CacheItem {
  data: any;
  timestamp: number;
}

const cache: Map<string, CacheItem> = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Fallback hadiths for when API is unavailable (offline mode)
const FALLBACK_PRAYER_HADITHS: Hadith[] = [
  {
    id: '1',
    text: "The Prophet (ﷺ) said: 'The first matter that the slave will be brought to account for on the Day of Judgment is the prayer. If it is sound, then the rest of his deeds will be sound. And if it is bad, then the rest of his deeds will be bad.'",
    arabic: "إِنَّ أَوَّلَ مَا يُحَاسَبُ بِهِ الْعَبْدُ يَوْمَ الْقِيَامَةِ الصَّلاَةُ فَإِنْ صَلَحَتْ فَقَدْ أَفْلَحَ وَأَنْجَحَ وَإِنْ فَسَدَتْ فَقَدْ خَابَ وَخَسِرَ",
    narrator: "Prophet Muhammad (ﷺ)",
    collection: "Sunan al-Tirmidhi",
    source: "Sunan al-Tirmidhi",
    subcategory: "Prayer",
  },
  {
    id: '2',
    text: "The Prophet (ﷺ) said: 'Prayer is light, charity is proof, patience is illumination, and the Quran is a proof on your behalf or against you.'",
    arabic: "الصَّلاَةُ نُورٌ وَالصَّدَقَةُ بُرْهَانٌ وَالصَّبْرُ ضِيَاءٌ وَالْقُرْآنُ حُجَّةٌ لَكَ أَوْ عَلَيْكَ",
    narrator: "Prophet Muhammad (ﷺ)",
    collection: "Sahih Muslim",
    source: "Sahih Muslim",
    subcategory: "Prayer",
  },
  {
    id: '3',
    text: "The Prophet (ﷺ) said: 'Between a man and disbelief is the abandonment of prayer.'",
    arabic: "بَيْنَ الرَّجُلِ وَبَيْنَ الْكُفْرِ تَرْكُ الصَّلاَةِ",
    narrator: "Prophet Muhammad (ﷺ)",
    collection: "Sahih Muslim",
    source: "Sahih Muslim",
    subcategory: "Prayer",
  },
  {
    id: '4',
    text: "The Prophet (ﷺ) said: 'The covenant between us and them is prayer. Whoever abandons it has disbelieved.'",
    arabic: "الْعَهْدُ الَّذِي بَيْنَنَا وَبَيْنَهُمُ الصَّلاَةُ فَمَنْ تَرَكَهَا فَقَدْ كَفَرَ",
    narrator: "Prophet Muhammad (ﷺ)",
    collection: "Sunan al-Tirmidhi",
    source: "Sunan al-Tirmidhi",
    subcategory: "Prayer",
  },
  {
    id: '5',
    text: "The Prophet (ﷺ) said: 'Whoever prays the two cool prayers (Asr and Fajr) will enter Paradise.'",
    arabic: "مَنْ صَلَّى الْبَرْدَيْنِ دَخَلَ الْجَنَّةَ",
    narrator: "Prophet Muhammad (ﷺ)",
    collection: "Sahih al-Bukhari",
    source: "Sahih al-Bukhari",
    subcategory: "Prayer",
  },
  {
    id: '6',
    text: "The Prophet (ﷺ) said: 'Prayer in congregation is twenty-seven times more superior to prayer offered alone.'",
    arabic: "صَلاَةُ الْجَمَاعَةِ أَفْضَلُ مِنْ صَلاَةِ الْفَذِّ بِسَبْعٍ وَعِشْرِينَ دَرَجَةً",
    narrator: "Prophet Muhammad (ﷺ)",
    collection: "Sahih al-Bukhari",
    source: "Sahih al-Bukhari",
    subcategory: "Prayer",
  },
];

export class HadithService {
  /**
   * Fetch hadiths by collection and book
   */
  static async fetchHadithsByBook(collection: string, book: string, page: number = 1): Promise<any> {
    try {
      const cacheKey = `${collection}-${book}-${page}`;
      
      // Check cache first
      const cached = cache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        return cached.data;
      }

      // Map collection names to API collection names
      const collectionMap: { [key: string]: string } = {
        'Sahih al-Bukhari': 'bukhari',
        'Sahih Muslim': 'muslim',
        'Sunan Abu Dawood': 'abudawud',
        'Jamiʿ at-Tirmidhi': 'tirmidhi',
        'Sunan an-Nasa\'i': 'nasai',
        'Sunan Ibn Majah': 'ibnmajah',
      };

      const apiCollection = collectionMap[collection] || 'bukhari';
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(
        `${HADITH_API_BASE}/${apiCollection}/${book}?page=${page}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.log(`API returned status ${response.status} for hadiths endpoint (may be temporarily unavailable)`);
        return null;
      }

      const data = await response.json();
      
      // Cache the response
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      // Don't log network errors as errors - they're expected when offline
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Hadith API request timed out (offline or slow network)');
      } else {
        console.log('Hadith API unavailable (using offline fallback hadiths)');
      }
      return null;
    }
  }

  /**
   * Fetch books for a collection
   */
  static async fetchBooks(collection: string): Promise<any[]> {
    try {
      const cacheKey = `books-${collection}`;
      
      const cached = cache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        return cached.data;
      }

      const collectionMap: { [key: string]: string } = {
        'Sahih al-Bukhari': 'bukhari',
        'Sahih Muslim': 'muslim',
        'Sunan Abu Dawood': 'abudawud',
        'Jamiʿ at-Tirmidhi': 'tirmidhi',
        'Sunan an-Nasa\'i': 'nasai',
        'Sunan Ibn Majah': 'ibnmajah',
      };

      const apiCollection = collectionMap[collection] || 'bukhari';
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${HADITH_API_BASE}/${apiCollection}/books`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.log(`API returned status ${response.status} for books endpoint (may be temporarily unavailable)`);
        return [];
      }

      const data = await response.json();
      
      cache.set(cacheKey, {
        data: data.books || [],
        timestamp: Date.now(),
      });

      return data.books || [];
    } catch (error) {
      // Don't log network errors as errors - they're expected when offline
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Hadith API request timed out (offline or slow network)');
      } else {
        console.log('Hadith API unavailable (using offline fallback hadiths)');
      }
      return [];
    }
  }

  /**
   * Get a random hadith from a specific collection and category
   */
  static async getRandomHadithFromCategory(collection: string, category: string): Promise<Hadith | null> {
    try {
      // For now, fetch from first book - can be expanded
      const books = await this.fetchBooks(collection);
      if (books.length === 0) return null;

      const randomBook = books[Math.floor(Math.random() * books.length)];
      const data = await this.fetchHadithsByBook(collection, randomBook.bookNumber, 1);
      
      if (!data || !data.hadiths || data.hadiths.length === 0) return null;

      const randomHadith = data.hadiths[Math.floor(Math.random() * data.hadiths.length)];
      
      return {
        id: randomHadith.hadithNumber,
        text: randomHadith.englishNarrator || randomHadith.english || '',
        arabic: randomHadith.arabic || '',
        narrator: randomHadith.narrator || 'Prophet Muhammad (PBUH)',
        collection: collection,
        subcategory: category,
        source: collection,
        bookNumber: randomHadith.bookNumber?.toString(),
        hadithNumber: randomHadith.hadithNumber?.toString(),
      };
    } catch (error) {
      console.error('Error getting random hadith:', error);
      return null;
    }
  }
  
  /**
   * Get a random Hadith related to prayer/salah
   */
  static async getRandomPrayerHadith(): Promise<Hadith | null> {
    try {
      return await this.getRandomHadithFromCategory('Sahih al-Bukhari', 'Salah (Prayer)');
    } catch (error) {
      console.error('Error getting random prayer Hadith:', error);
      return null;
    }
  }
  
  /**
   * Get a random Hadith (any category)
   */
  static async getRandomHadith(): Promise<Hadith | null> {
    try {
      return await this.getRandomHadithFromCategory('Sahih al-Bukhari', 'Iman (Faith)');
    } catch (error) {
      console.error('Error getting random Hadith:', error);
      return null;
    }
  }
  
  /**
   * Get prayer-specific Hadith based on prayer name
   */
  static getPrayerSpecificHadith(prayerName: string): Hadith | null {
    try {
      // Use fallback hadiths directly for reliability (no API dependency)
      const randomIndex = Math.floor(Math.random() * FALLBACK_PRAYER_HADITHS.length);
      return FALLBACK_PRAYER_HADITHS[randomIndex];
    } catch (error) {
      console.error('Error getting prayer-specific Hadith:', error);
      return FALLBACK_PRAYER_HADITHS[0]; // Return first hadith as ultimate fallback
    }
  }
  
  /**
   * Get prayer-specific Hadith with API fallback (async version)
   */
  static async getPrayerSpecificHadithAsync(prayerName: string): Promise<Hadith | null> {
    try {
      // Try to get from API first
      const prayerHadith = await this.getRandomPrayerHadith();
      if (prayerHadith) {
        return prayerHadith;
      }
      
      // Fallback to offline hadiths if API fails
      return this.getPrayerSpecificHadith(prayerName);
    } catch (error) {
      console.error('Error getting prayer-specific Hadith from API:', error);
      // Return offline fallback
      return this.getPrayerSpecificHadith(prayerName);
    }
  }
  
  /**
   * Format Hadith for notification display
   */
  static formatHadithForNotification(hadith: Hadith | null): string {
    if (!hadith || !hadith.text) {
      return "May Allah accept your prayers and grant you peace.";
    }
    
    // Truncate long Hadith for notification
    const maxLength = 120;
    let hadithText = hadith.text;
    
    if (hadithText && hadithText.length > maxLength) {
      hadithText = hadithText.substring(0, maxLength) + '...';
    }
    
    return hadithText || "May Allah accept your prayers and grant you peace.";
  }

  /**
   * Clear cache (useful for debugging or forcing refresh)
   */
  static clearCache(): void {
    cache.clear();
  }
}
