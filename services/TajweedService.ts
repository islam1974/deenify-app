// Tajweed Service - Color codes Quranic Arabic text according to recitation rules
// Color scheme follows standard Tajweed Mushaf coloring

export interface TajweedSegment {
  text: string;
  rule: TajweedRule;
  color: string;
}

export type TajweedRule = 
  | 'normal'           // Black - Regular text
  | 'tafkheem'         // Red - Heavy/thick letters (ر, ق, ط, etc.)
  | 'ghunnah'          // Blue - Nasal sound (م, ن with certain marks)
  | 'ikhfa'            // Green - Hiding (tanween/noon saakin before certain letters)
  | 'silent'           // Gray - Silent letters (not pronounced)
  | 'mad'              // Orange - Elongation (ā, ū, ī sounds)
  | 'idghaam'          // Purple - Merging sounds
  | 'iqlab'            // Pink - Conversion (noon to meem)
  | 'qalqalah'         // Light blue - Echoing sound (ق ط ب ج د)
  | 'hamzat_wasl';     // Green - Connecting hamza

class TajweedService {
  // Cache for parsed Tajweed segments (key: text + isDarkMode)
  private cache: Map<string, TajweedSegment[]> = new Map();
  private readonly MAX_CACHE_SIZE = 200; // Cache up to 200 verses

  // Tajweed color scheme
  private readonly COLORS = {
    normal: '#FFFFFF',          // White/Black depending on theme
    tafkheem: '#E53935',        // Red - Heavy letters
    ghunnah: '#1E88E5',         // Blue - Nasal sound  
    ikhfa: '#43A047',           // Green - Hiding
    silent: '#9E9E9E',          // Gray - Silent
    mad: '#FB8C00',             // Orange - Elongation
    idghaam: '#8E24AA',         // Purple - Merging
    iqlab: '#EC407A',           // Pink - Conversion
    qalqalah: '#26C6DA',        // Light Blue - Echoing
    hamzat_wasl: '#66BB6A',     // Light Green - Connecting hamza
  };

  // Heavy letters for Tafkheem (خ ص ض غ ط ظ ق)
  private readonly HEAVY_LETTERS = ['خ', 'ص', 'ض', 'غ', 'ط', 'ق', 'ظ'];

  // Qalqalah letters (ق ط ب ج د)
  private readonly QALQALAH_LETTERS = ['ق', 'ط', 'ب', 'ج', 'د'];

  // Letters that cause Ikhfa with Noon Saakin/Tanween
  private readonly IKHFA_LETTERS = ['ت', 'ث', 'ج', 'د', 'ذ', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ف', 'ق', 'ك'];

  // Ghunnah letters
  private readonly GHUNNAH_LETTERS = ['ن', 'م'];

  // Mad (elongation) markers
  private readonly MAD_MARKERS = ['ا', 'و', 'ي', 'ى', 'آ', 'أ', 'إ', 'ؤ', 'ئ'];

  // Arabic diacritical marks
  private readonly DIACRITICS = [
    '\u064B', // Tanween Fath
    '\u064C', // Tanween Damm
    '\u064D', // Tanween Kasr
    '\u064E', // Fatha
    '\u064F', // Damma
    '\u0650', // Kasra
    '\u0651', // Shadda
    '\u0652', // Sukun
    '\u0653', // Maddah
    '\u0654', // Hamza above
    '\u0655', // Hamza below
    '\u0656', // Subscript alef
    '\u0657', // Inverted damma
    '\u0658', // Mark noon ghunna
  ];

  /**
   * Parse Arabic Quranic text and apply Tajweed rules
   * Returns array of text segments with their colors
   */
  parseTajweed(arabicText: string, isDarkMode: boolean = false): TajweedSegment[] {
    // Check cache first
    const cacheKey = `${arabicText}_${isDarkMode}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const segments: TajweedSegment[] = [];
    const chars = Array.from(arabicText);
    let i = 0;

    // Adjust normal color based on theme
    const normalColor = isDarkMode ? '#FFFFFF' : '#000000';

    while (i < chars.length) {
      const char = chars[i];
      const nextChar = i < chars.length - 1 ? chars[i + 1] : '';
      const prevChar = i > 0 ? chars[i - 1] : '';

      // Collect current character with its diacritics
      let currentSegment = char;
      let j = i + 1;
      while (j < chars.length && this.isDiacritic(chars[j])) {
        currentSegment += chars[j];
        j++;
      }

      let rule: TajweedRule = 'normal';
      let color = normalColor;

      // Check for Mad (elongation)
      if (this.MAD_MARKERS.includes(char)) {
        // Check if it's followed by sukun or specific patterns
        const hasMad = this.hasMaddah(currentSegment) || 
                       (this.isAlef(char) && this.hasFatha(prevChar)) ||
                       (char === 'و' && this.hasDamma(prevChar)) ||
                       (char === 'ي' && this.hasKasra(prevChar)) ||
                       (char === 'ى' && this.hasKasra(prevChar));
        
        if (hasMad) {
          rule = 'mad';
          color = this.COLORS.mad;
        }
      }

      // Check for Heavy letters (Tafkheem)
      if (this.HEAVY_LETTERS.includes(char)) {
        rule = 'tafkheem';
        color = this.COLORS.tafkheem;
      }

      // Check for Qalqalah
      if (this.QALQALAH_LETTERS.includes(char) && this.hasSukun(currentSegment)) {
        rule = 'qalqalah';
        color = this.COLORS.qalqalah;
      }

      // Check for Ghunnah (Noon/Meem with Shadda or followed by similar letter)
      if (this.GHUNNAH_LETTERS.includes(char)) {
        const hasShadda = this.hasShadda(currentSegment);
        const followedBySame = nextChar === char;
        const hasTanween = this.hasTanween(currentSegment);
        
        if (hasShadda || followedBySame || hasTanween) {
          rule = 'ghunnah';
          color = this.COLORS.ghunnah;
        }
      }

      // Check for Ikhfa (Noon Saakin/Tanween before Ikhfa letters)
      if (char === 'ن' && this.hasSukun(currentSegment)) {
        const nextLetter = this.getNextLetter(chars, j);
        if (nextLetter && this.IKHFA_LETTERS.includes(nextLetter)) {
          rule = 'ikhfa';
          color = this.COLORS.ikhfa;
        }
      }

      // Check for Iqlab (Noon Saakin/Tanween before Baa)
      if ((char === 'ن' && this.hasSukun(currentSegment)) || this.hasTanween(currentSegment)) {
        const nextLetter = this.getNextLetter(chars, j);
        if (nextLetter === 'ب') {
          rule = 'iqlab';
          color = this.COLORS.iqlab;
        }
      }

      // Check for Silent letters (Small Alef, etc.)
      if (this.isSilentLetter(char, currentSegment)) {
        rule = 'silent';
        color = this.COLORS.silent;
      }

      // Check for Idghaam (Noon Saakin followed by يرملون)
      if (char === 'ن' && this.hasSukun(currentSegment)) {
        const nextLetter = this.getNextLetter(chars, j);
        if (nextLetter && 'يرملو'.includes(nextLetter)) {
          rule = 'idghaam';
          color = this.COLORS.idghaam;
        }
      }

      segments.push({
        text: currentSegment,
        rule,
        color,
      });

      i = j;
    }

    // Store in cache (with LRU eviction)
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(cacheKey, segments);

    return segments;
  }

  /**
   * Clear the Tajweed parsing cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  // Helper methods
  private isDiacritic(char: string): boolean {
    return this.DIACRITICS.includes(char);
  }

  private hasMaddah(text: string): boolean {
    return text.includes('\u0653'); // Maddah sign
  }

  private hasSukun(text: string): boolean {
    return text.includes('\u0652'); // Sukun
  }

  private hasShadda(text: string): boolean {
    return text.includes('\u0651'); // Shadda
  }

  private hasFatha(text: string): boolean {
    return text.includes('\u064E'); // Fatha
  }

  private hasDamma(text: string): boolean {
    return text.includes('\u064F'); // Damma
  }

  private hasKasra(text: string): boolean {
    return text.includes('\u0650'); // Kasra
  }

  private hasTanween(text: string): boolean {
    return text.includes('\u064B') || // Tanween Fath
           text.includes('\u064C') || // Tanween Damm
           text.includes('\u064D');   // Tanween Kasr
  }

  private isAlef(char: string): boolean {
    return ['ا', 'أ', 'إ', 'آ'].includes(char);
  }

  private isSilentLetter(char: string, segment: string): boolean {
    // Small Alef (Alef Khanjariyah) - often silent
    if (char === 'ٰ' || segment.includes('\u0670')) {
      return true;
    }
    return false;
  }

  private getNextLetter(chars: string[], startIndex: number): string | null {
    for (let i = startIndex; i < chars.length; i++) {
      if (!this.isDiacritic(chars[i]) && chars[i].trim() !== '') {
        return chars[i];
      }
    }
    return null;
  }

  /**
   * Get color for a specific Tajweed rule
   */
  getColor(rule: TajweedRule): string {
    return this.COLORS[rule];
  }

  /**
   * Get all Tajweed colors
   */
  getAllColors() {
    return { ...this.COLORS };
  }

  /**
   * Get legend for Tajweed rules
   */
  getLegend(): Array<{ rule: TajweedRule; color: string; name: string; description: string }> {
    return [
      {
        rule: 'tafkheem',
        color: this.COLORS.tafkheem,
        name: 'Tafkheem',
        description: 'Heavy/thick letters (خ ص ض غ ط ق ظ)',
      },
      {
        rule: 'ghunnah',
        color: this.COLORS.ghunnah,
        name: 'Ghunnah',
        description: 'Nasal sound with م or ن',
      },
      {
        rule: 'ikhfa',
        color: this.COLORS.ikhfa,
        name: 'Ikhfa',
        description: 'Hiding - Noon Saakin before specific letters',
      },
      {
        rule: 'mad',
        color: this.COLORS.mad,
        name: 'Mad',
        description: 'Elongation - Stretched vowels',
      },
      {
        rule: 'qalqalah',
        color: this.COLORS.qalqalah,
        name: 'Qalqalah',
        description: 'Echoing sound (ق ط ب ج د) with Sukun',
      },
      {
        rule: 'idghaam',
        color: this.COLORS.idghaam,
        name: 'Idghaam',
        description: 'Merging - Noon Saakin followed by يرملون',
      },
      {
        rule: 'iqlab',
        color: this.COLORS.iqlab,
        name: 'Iqlab',
        description: 'Conversion - Noon to Meem before ب',
      },
      {
        rule: 'silent',
        color: this.COLORS.silent,
        name: 'Silent',
        description: 'Silent letters not pronounced',
      },
    ];
  }
}

export default new TajweedService();

