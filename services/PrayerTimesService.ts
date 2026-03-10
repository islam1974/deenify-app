import { Coordinates, CalculationMethod, Madhab, PrayerTimes as AdhanPrayerTimes } from 'adhan';

export interface PrayerTime {
  name: string;
  time: string;
  arabic: string;
  next: boolean;
}

export interface TimezoneInfo {
  timezone: string;
  offset: string;
  isDST: boolean;
}

export interface YearlyPrayerTime {
  date: string;
  readable: string;
  timings: PrayerTime[];
}

interface PrayerTimesResponse {
  code: number;
  status: string;
  data: {
    timings: {
      Fajr: string;
      Sunrise: string;
      Dhuhr: string;
      Asr: string;
      Maghrib: string;
      Isha: string;
    };
    date: {
      readable: string;
      timestamp: string;
    };
    meta: {
      timezone: string;
      method: {
        id: number;
        name: string;
        params: any;
      };
    };
  };
}

const CACHE_KEY_COORDS = 'prayer_times_cache_coords';
const CACHE_KEY_CITY = 'prayer_times_cache_city';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CachedPrayerTimes {
  times: PrayerTime[];
  timestamp: number;
  key: string;
}

export class PrayerTimesService {
  private static readonly API_BASE_URL = 'https://api.aladhan.com/v1';
  private static cacheCoords: CachedPrayerTimes | null = null;
  private static cacheCity: CachedPrayerTimes | null = null;

  private static getCachedCoords(lat: number, lon: number, dateStr: string): PrayerTime[] | null {
    const key = `${lat.toFixed(2)},${lon.toFixed(2)},${dateStr}`;
    const c = PrayerTimesService.cacheCoords;
    if (c && c.key === key && Date.now() - c.timestamp < CACHE_TTL_MS) return c.times;
    return null;
  }

  private static setCacheCoords(lat: number, lon: number, dateStr: string, times: PrayerTime[]) {
    PrayerTimesService.cacheCoords = {
      times,
      timestamp: Date.now(),
      key: `${lat.toFixed(2)},${lon.toFixed(2)},${dateStr}`,
    };
  }

  private static getCachedCity(city: string, country: string, dateStr: string): PrayerTime[] | null {
    const key = `${city},${country},${dateStr}`;
    const c = PrayerTimesService.cacheCity;
    if (c && c.key === key && Date.now() - c.timestamp < CACHE_TTL_MS) return c.times;
    return null;
  }

  private static setCacheCity(city: string, country: string, dateStr: string, times: PrayerTime[]) {
    PrayerTimesService.cacheCity = { times, timestamp: Date.now(), key: `${city},${country},${dateStr}` };
  }

  private static formatTime24to12(time24: string): string {
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHours = h % 12 || 12;
    return `${String(displayHours).padStart(2, '0')}:${String(m || 0).padStart(2, '0')} ${period}`;
  }

  private static async fetchFromUmmahAPI(
    latitude: number,
    longitude: number,
    madhab: string
  ): Promise<PrayerTime[]> {
    const madhabParam = madhab === 'Hanafi' ? 'Hanafi' : 'Shafi';
    const url = `https://www.ummahapi.com/api/prayer-times?lat=${latitude}&lng=${longitude}&madhab=${madhabParam}&method=MuslimWorldLeague`;
    const res = await fetch(url);
    const json = await res.json();
    if (!json?.success || !json?.data?.prayer_times) throw new Error('UmmahAPI invalid response');
    const pt = json.data.prayer_times;
    const times: PrayerTime[] = [
      { name: 'Fajr', time: this.formatTime24to12(pt.fajr), arabic: 'الفجر', next: false },
      { name: 'Sunrise', time: this.formatTime24to12(pt.sunrise), arabic: 'الشروق', next: false },
      { name: 'Dhuhr', time: this.formatTime24to12(pt.dhuhr), arabic: 'الظهر', next: false },
      { name: 'Asr', time: this.formatTime24to12(pt.asr), arabic: 'العصر', next: false },
      { name: 'Maghrib', time: this.formatTime24to12(pt.maghrib), arabic: 'المغرب', next: false },
      { name: 'Isha', time: this.formatTime24to12(pt.isha), arabic: 'العشاء', next: false },
    ];
    const nextIdx = this.getNextPrayerIndex(times, new Date());
    if (nextIdx >= 0 && nextIdx < times.length) times[nextIdx].next = true;
    return times;
  }

  private static calculateWithAdhan(
    latitude: number,
    longitude: number,
    date: Date,
    calculationMethod: string,
    madhab: string
  ): PrayerTime[] {
    const coords = new Coordinates(latitude, longitude);
    const params =
      calculationMethod === 'Karachi'
        ? CalculationMethod.Karachi()
        : calculationMethod === 'ISNA'
          ? CalculationMethod.NorthAmerica()
          : calculationMethod === 'Egyptian'
            ? CalculationMethod.Egyptian()
            : CalculationMethod.MuslimWorldLeague();
    if (madhab === 'Hanafi') params.madhab = Madhab.Hanafi;
    const pt = new AdhanPrayerTimes(coords, date, params);
    const format = (d: Date) =>
      d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const times: PrayerTime[] = [
      { name: 'Fajr', time: format(pt.fajr), arabic: 'الفجر', next: false },
      { name: 'Sunrise', time: format(pt.sunrise), arabic: 'الشروق', next: false },
      { name: 'Dhuhr', time: format(pt.dhuhr), arabic: 'الظهر', next: false },
      { name: 'Asr', time: format(pt.asr), arabic: 'العصر', next: false },
      { name: 'Maghrib', time: format(pt.maghrib), arabic: 'المغرب', next: false },
      { name: 'Isha', time: format(pt.isha), arabic: 'العشاء', next: false },
    ];
    const nextIdx = this.getNextPrayerIndex(times, new Date());
    if (nextIdx >= 0 && nextIdx < times.length) times[nextIdx].next = true;
    return times;
  }

  private static async fetchPrayerTimesJson(url: string, retries = 3): Promise<PrayerTimesResponse> {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const res = await fetch(url);
        const data: PrayerTimesResponse = await res.json();
        if (data?.code === 200) return data;
        const msg = data?.message || `API error ${data?.code ?? res.status}`;
        const isServerError =
          msg.includes('ring-balancer') ||
          msg.includes('unexpected error') ||
          msg.includes('upstream') ||
          msg.includes('invalid response');
        lastError = new Error(isServerError ? 'Prayer times service is temporarily unavailable.' : msg);
        if (attempt < retries - 1) {
          await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
        }
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
        if (attempt < retries - 1) {
          await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
        }
      }
    }
    throw lastError || new Error('Request failed');
  }

  // Calculation method mappings for Aladhan API
  private static readonly CALCULATION_METHODS = {
    MWL: 3,        // Muslim World League
    ISNA: 2,       // Islamic Society of North America
    UmmAlQura: 4,  // Umm Al-Qura University, Makkah
    Karachi: 1,    // University of Islamic Sciences, Karachi
    Egyptian: 5,   // Egyptian General Authority of Survey
    Tehran: 6,     // Institute of Geophysics, University of Tehran
    Kuwait: 8,     // Kuwait
    Qatar: 9,      // Qatar
    Singapore: 11, // Majlis Ugama Islam Singapura
    France: 12,    // Union des organisations islamiques de France
    Turkey: 13,    // Diyanet İşleri Başkanlığı
    Russia: 14,    // Spiritual Administration of Muslims of Russia
    Dubai: 15,     // UAE
    Morocco: 16,   // Morocco
    Tunisia: 17,   // Tunisia
    Algeria: 18,   // Algeria
  };

  static async getPrayerTimesWithTimezone(
    latitude: number,
    longitude: number,
    date?: Date,
    calculationMethod: string = 'MWL',
    madhab: string = 'Standard'
  ): Promise<{ times: PrayerTime[]; timezone: string }> {
    const times = await this.getPrayerTimes(latitude, longitude, date, calculationMethod, madhab);
    const timezoneInfo = await this.getTimezoneInfo(latitude, longitude);
    return {
      times,
      timezone: timezoneInfo?.timezone || ''
    };
  }

  static async getPrayerTimes(
    latitude: number,
    longitude: number,
    date?: Date,
    calculationMethod: string = 'MWL',
    madhab: string = 'Standard'
  ): Promise<PrayerTime[]> {
    const currentDate = date || new Date();
    const dateString = currentDate.toISOString().split('T')[0];

    const cached = this.getCachedCoords(latitude, longitude, dateString);
    if (cached) return cached;

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new Error('Invalid location coordinates');
    }

    const methodId = this.CALCULATION_METHODS[calculationMethod as keyof typeof this.CALCULATION_METHODS] || 3;
    let url = `${this.API_BASE_URL}/timings/${dateString}?latitude=${latitude}&longitude=${longitude}&method=${methodId}`;
    if (madhab === 'Hanafi') url += '&school=1';
    else url += '&school=0';

    try {
      let data: PrayerTimesResponse;
      try {
        data = await this.fetchPrayerTimesJson(url);
      } catch (aladhanErr: any) {
        console.warn('Aladhan API failed, trying UmmahAPI:', aladhanErr?.message);
        try {
          const fallbackTimes = await this.fetchFromUmmahAPI(latitude, longitude, madhab);
          this.setCacheCoords(latitude, longitude, dateString, fallbackTimes);
          console.log('✅ Prayer times from UmmahAPI (fallback)');
          return fallbackTimes;
        } catch (ummahErr) {
          console.warn('UmmahAPI failed, using offline calculation:', ummahErr);
          const offlineTimes = this.calculateWithAdhan(
            latitude,
            longitude,
            currentDate,
            calculationMethod,
            madhab
          );
          this.setCacheCoords(latitude, longitude, dateString, offlineTimes);
          console.log('✅ Prayer times from Adhan (offline fallback)');
          return offlineTimes;
        }
      }

      console.log(`✅ API Response (Aladhan):`, {
        timings: data.data.timings,
        timezone: data.data.meta.timezone,
        method: data.data.meta.method.name
      });
      console.log(`🕐 Raw API Timings:`, data.data.timings);
      console.log(`📊 Device timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
      console.log(`⏰ Device current time: ${new Date().toLocaleString()}`);
      console.log(`📊 API reported timezone: ${data.data.meta.timezone}`);
      
      const timings = data.data.timings;
      const currentTime = new Date();
      
      // Use API times directly - the API returns times in the correct local timezone
      // No manual adjustments needed
      const prayerTimes: PrayerTime[] = [
        {
          name: 'Fajr',
          time: this.formatTime(timings.Fajr),
          arabic: 'الفجر',
          next: false,
        },
        {
          name: 'Sunrise',
          time: this.formatTime(timings.Sunrise),
          arabic: 'الشروق',
          next: false,
        },
        {
          name: 'Dhuhr',
          time: this.formatTime(timings.Dhuhr),
          arabic: 'الظهر',
          next: false,
        },
        {
          name: 'Asr',
          time: this.formatTime(timings.Asr),
          arabic: 'العصر',
          next: false,
        },
        {
          name: 'Maghrib',
          time: this.formatTime(timings.Maghrib),
          arabic: 'المغرب',
          next: false,
        },
        {
          name: 'Isha',
          time: this.formatTime(timings.Isha),
          arabic: 'العشاء',
          next: false,
        },
      ];

      // Determine which prayer is next
      const nextPrayerIndex = this.getNextPrayerIndex(prayerTimes, currentTime);
      if (nextPrayerIndex !== -1 && nextPrayerIndex < prayerTimes.length) {
        prayerTimes[nextPrayerIndex].next = true;
      }

      if (data.data.meta?.timezone) {
        console.log(`Prayer times fetched for timezone: ${data.data.meta.timezone}`);
        this.logDSTStatus();
      }

      this.setCacheCoords(latitude, longitude, dateString, prayerTimes);
      return prayerTimes;
    } catch (error: any) {
      console.error('Error fetching prayer times:', error);
      const fallback = this.cacheCoords?.times ?? null;
      if (fallback) {
        console.log('📦 Using cached prayer times after error');
        return fallback;
      }
      const msg =
        error?.message?.includes('Network') || error?.name === 'TypeError'
          ? 'Failed to fetch prayer times. Please check your internet connection.'
          : error?.message || 'Prayer times temporarily unavailable. Please try again.';
      throw new Error(msg);
    }
  }

  static async getPrayerTimesByCity(
    city: string,
    country: string,
    date?: Date,
    calculationMethod: string = 'MWL',
    madhab: string = 'Standard'
  ): Promise<PrayerTime[]> {
    const currentDate = date || new Date();
    const dateString = currentDate.toISOString().split('T')[0];

    const cached = this.getCachedCity(city, country, dateString);
    if (cached) return cached;

    const methodId = this.CALCULATION_METHODS[calculationMethod as keyof typeof this.CALCULATION_METHODS] || 3;
    let url = `${this.API_BASE_URL}/timingsByCity/${dateString}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${methodId}`;
    if (madhab === 'Hanafi') url += '&school=1';
    else url += '&school=0';

    const CITY_COORDS: Record<string, [number, number]> = {
      'London,United Kingdom': [51.5074, -0.1278],
      'New York,USA': [40.7128, -74.006],
      'New York,United States': [40.7128, -74.006],
      'Los Angeles,USA': [34.0522, -118.2437],
      'Chicago,USA': [41.8781, -87.6298],
      'Toronto,Canada': [43.6532, -79.3832],
      'Sydney,Australia': [-33.8688, 151.2093],
      'Dubai,United Arab Emirates': [25.2048, 55.2708],
      'Dhaka,Bangladesh': [23.8103, 90.4125],
      'Karachi,Pakistan': [24.8607, 67.0011],
      'Istanbul,Turkey': [41.0082, 28.9784],
      'Cairo,Egypt': [30.0444, 31.2357],
      'Riyadh,Saudi Arabia': [24.7136, 46.6753],
      'Kuala Lumpur,Malaysia': [3.139, 101.6869],
      'Jakarta,Indonesia': [-6.2088, 106.8456],
    };

    try {
      let data: PrayerTimesResponse;
      try {
        data = await this.fetchPrayerTimesJson(url);
      } catch (aladhanErr: any) {
        const key = `${city},${country}`;
        const coords = CITY_COORDS[key] || CITY_COORDS[`${city},${country.replace(/\s/g, '')}`];
        if (coords) {
          console.warn('Aladhan city API failed, using coordinates fallback:', key);
          return this.getPrayerTimes(coords[0], coords[1], currentDate, calculationMethod, madhab);
        }
        const fallback = this.cacheCity?.times ?? this.cacheCoords?.times ?? null;
        if (fallback) {
          console.log('📦 Using cached prayer times');
          return fallback;
        }
        throw aladhanErr;
      }

      const timings = data.data.timings;
      const currentTime = new Date();
      
      // Use API times directly - the API returns times in the correct local timezone
      // No manual adjustments needed
      const prayerTimes: PrayerTime[] = [
        {
          name: 'Fajr',
          time: this.formatTime(timings.Fajr),
          arabic: 'الفجر',
          next: false,
        },
        {
          name: 'Sunrise',
          time: this.formatTime(timings.Sunrise),
          arabic: 'الشروق',
          next: false,
        },
        {
          name: 'Dhuhr',
          time: this.formatTime(timings.Dhuhr),
          arabic: 'الظهر',
          next: false,
        },
        {
          name: 'Asr',
          time: this.formatTime(timings.Asr),
          arabic: 'العصر',
          next: false,
        },
        {
          name: 'Maghrib',
          time: this.formatTime(timings.Maghrib),
          arabic: 'المغرب',
          next: false,
        },
        {
          name: 'Isha',
          time: this.formatTime(timings.Isha),
          arabic: 'العشاء',
          next: false,
        },
      ];

      // Determine which prayer is next
      const nextPrayerIndex = this.getNextPrayerIndex(prayerTimes, currentTime);
      if (nextPrayerIndex !== -1 && nextPrayerIndex < prayerTimes.length) {
        prayerTimes[nextPrayerIndex].next = true;
      }

      if (data.data.meta?.timezone) {
        console.log(`Prayer times fetched for timezone: ${data.data.meta.timezone}`);
        this.logDSTStatus();
      }

      this.setCacheCity(city, country, dateString, prayerTimes);
      return prayerTimes;
    } catch (error: any) {
      console.error('Error fetching prayer times by city:', error);
      const fallback = this.cacheCity?.times ?? this.cacheCoords?.times ?? null;
      if (fallback) {
        console.log('📦 Using cached prayer times after error');
        return fallback;
      }
      const msg =
        error?.message?.includes('Network') || error?.name === 'TypeError'
          ? 'Failed to fetch prayer times. Please check your internet connection.'
          : error?.message || 'Prayer times temporarily unavailable. Please try again.';
      throw new Error(msg);
    }
  }

  /**
   * Get timezone information for a location
   */
  static async getTimezoneInfo(latitude: number, longitude: number): Promise<TimezoneInfo | null> {
    try {
      const dateString = new Date().toISOString().split('T')[0];
      const url = `${this.API_BASE_URL}/timings/${dateString}?latitude=${latitude}&longitude=${longitude}`;
      
      const response = await fetch(url);
      const data: PrayerTimesResponse = await response.json();

      if (data.code !== 200 || !data.data.meta) {
        return null;
      }

      const timezone = data.data.meta.timezone;
      const isDST = this.isDaylightSavingTime();
      const offset = this.getTimezoneOffset();

      return {
        timezone,
        offset,
        isDST,
      };
    } catch (error) {
      console.error('Error fetching timezone info:', error);
      return null;
    }
  }

  /**
   * Check if current date is in Daylight Saving Time
   */
  private static isDaylightSavingTime(): boolean {
    const now = new Date();
    const january = new Date(now.getFullYear(), 0, 1);
    const july = new Date(now.getFullYear(), 6, 1);
    const stdTimezoneOffset = Math.max(january.getTimezoneOffset(), july.getTimezoneOffset());
    return now.getTimezoneOffset() < stdTimezoneOffset;
  }

  /**
   * Check if current date is in Daylight Saving Time (public version)
   */
  static isDSTActive(date: Date): boolean {
    const now = date;
    const january = new Date(now.getFullYear(), 0, 1);
    const july = new Date(now.getFullYear(), 6, 1);
    const stdTimezoneOffset = Math.max(january.getTimezoneOffset(), july.getTimezoneOffset());
    return now.getTimezoneOffset() < stdTimezoneOffset;
  }

  /**
   * Get current time in a specific IANA timezone (e.g. Asia/Dhaka).
   * Use this so "current time" and "next prayer" use the location's time, not device time.
   */
  static getNowInTimezone(timezone: string): { hours: number; minutes: number; timeMinutes: number } {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(new Date());
    const hours = parseInt(parts.find(p => p.type === 'hour')?.value ?? '0', 10);
    const minutes = parseInt(parts.find(p => p.type === 'minute')?.value ?? '0', 10);
    return { hours, minutes, timeMinutes: hours * 60 + minutes };
  }

  /**
   * Get current timezone offset as string
   */
  private static getTimezoneOffset(): string {
    const offset = -new Date().getTimezoneOffset();
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset >= 0 ? '+' : '-';
    return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Log DST status for debugging
   */
  private static logDSTStatus(): void {
    const isDST = this.isDaylightSavingTime();
    const offset = this.getTimezoneOffset();
    
    if (isDST) {
      console.log(`🌞 Daylight Saving Time (DST) is ACTIVE - Current offset: ${offset}`);
      console.log(`   (e.g., BST in UK, CEST in Europe)`);
    } else {
      console.log(`🌙 Standard Time is active - Current offset: ${offset}`);
      console.log(`   (e.g., GMT in UK, CET in Europe)`);
    }
  }

  private static formatTime(timeString: string): string {
    if (!timeString || typeof timeString !== 'string') return '--:-- --';
    const parts = timeString.split(':').map(Number);
    let hours = Math.floor(parts[0] ?? 0);
    let minutes = Math.floor(parts[1] ?? 0);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return '--:-- --';
    hours = Math.max(0, Math.min(23, hours));
    minutes = Math.max(0, Math.min(59, minutes));
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
  }


  static async getYearlyPrayerTimes(
    latitude: number,
    longitude: number,
    year: number = new Date().getFullYear()
  ): Promise<YearlyPrayerTime[]> {
    try {
      const yearlyData: YearlyPrayerTime[] = [];
      
      // Get prayer times for each month of the year
      for (let month = 0; month < 12; month++) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month, day);
          const dateString = date.toISOString().split('T')[0];
          
          try {
            const url = `${this.API_BASE_URL}/timings/${dateString}?latitude=${latitude}&longitude=${longitude}&method=2`;
            const response = await fetch(url);
            const data: PrayerTimesResponse = await response.json();

            if (data.code === 200) {
              const timings = data.data.timings;
              const currentTime = new Date();
              
              const prayerTimes: PrayerTime[] = [
                {
                  name: 'Fajr',
                  time: this.formatTime(timings.Fajr),
                  arabic: 'الفجر',
                  next: false,
                },
                {
                  name: 'Sunrise',
                  time: this.formatTime(timings.Sunrise),
                  arabic: 'الشروق',
                  next: false,
                },
                {
                  name: 'Dhuhr',
                  time: this.formatTime(timings.Dhuhr),
                  arabic: 'الظهر',
                  next: false,
                },
                {
                  name: 'Asr',
                  time: this.formatTime(timings.Asr),
                  arabic: 'العصر',
                  next: false,
                },
                {
                  name: 'Maghrib',
                  time: this.formatTime(timings.Maghrib),
                  arabic: 'المغرب',
                  next: false,
                },
                {
                  name: 'Isha',
                  time: this.formatTime(timings.Isha),
                  arabic: 'العشاء',
                  next: false,
                },
              ];

              yearlyData.push({
                date: dateString,
                readable: date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }),
                timings: prayerTimes,
              });
            }
          } catch (error) {
            console.warn(`Failed to fetch prayer times for ${dateString}:`, error);
          }
        }
      }

      return yearlyData;
    } catch (error) {
      console.error('Error fetching yearly prayer times:', error);
      throw new Error('Failed to fetch yearly prayer times. Please check your internet connection.');
    }
  }

  static async getYearlyPrayerTimesByCity(
    city: string,
    country: string,
    year: number = new Date().getFullYear()
  ): Promise<YearlyPrayerTime[]> {
    try {
      const yearlyData: YearlyPrayerTime[] = [];
      
      // Get prayer times for each month of the year
      for (let month = 0; month < 12; month++) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month, day);
          const dateString = date.toISOString().split('T')[0];
          
          try {
            const url = `${this.API_BASE_URL}/timingsByCity/${dateString}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=2`;
            const response = await fetch(url);
            const data: PrayerTimesResponse = await response.json();

            if (data.code === 200) {
              const timings = data.data.timings;
              
              const prayerTimes: PrayerTime[] = [
                {
                  name: 'Fajr',
                  time: this.formatTime(timings.Fajr),
                  arabic: 'الفجر',
                  next: false,
                },
                {
                  name: 'Sunrise',
                  time: this.formatTime(timings.Sunrise),
                  arabic: 'الشروق',
                  next: false,
                },
                {
                  name: 'Dhuhr',
                  time: this.formatTime(timings.Dhuhr),
                  arabic: 'الظهر',
                  next: false,
                },
                {
                  name: 'Asr',
                  time: this.formatTime(timings.Asr),
                  arabic: 'العصر',
                  next: false,
                },
                {
                  name: 'Maghrib',
                  time: this.formatTime(timings.Maghrib),
                  arabic: 'المغرب',
                  next: false,
                },
                {
                  name: 'Isha',
                  time: this.formatTime(timings.Isha),
                  arabic: 'العشاء',
                  next: false,
                },
              ];

              yearlyData.push({
                date: dateString,
                readable: date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }),
                timings: prayerTimes,
              });
            }
          } catch (error) {
            console.warn(`Failed to fetch prayer times for ${dateString}:`, error);
          }
        }
      }

      return yearlyData;
    } catch (error) {
      console.error('Error fetching yearly prayer times by city:', error);
      throw new Error('Failed to fetch yearly prayer times. Please check your internet connection.');
    }
  }

  private static getNextPrayerIndex(prayerTimes: PrayerTime[], currentTime: Date): number {
    const currentTimeString = currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const [currentHours, currentMinutes] = currentTimeString.split(':').map(Number);
    const currentTimeMinutes = currentHours * 60 + currentMinutes;

    // Find the next prayer that hasn't passed yet
    for (let i = 0; i < prayerTimes.length; i++) {
      const prayerTime = prayerTimes[i];
      const timeWithoutPeriod = prayerTime.time.replace(' AM', '').replace(' PM', '');
      const [prayerHours, prayerMinutes] = timeWithoutPeriod.split(':').map(Number);
      
      // Convert to 24-hour format for comparison
      let prayerTimeMinutes = prayerHours * 60 + prayerMinutes;
      
      // Handle AM/PM conversion
      if (prayerTime.time.includes('AM') && prayerHours === 12) {
        prayerTimeMinutes = prayerMinutes; // 12:XX AM = 00:XX
      } else if (prayerTime.time.includes('PM') && prayerHours !== 12) {
        prayerTimeMinutes = (prayerHours + 12) * 60 + prayerMinutes; // Convert to 24-hour
      }
      
      if (prayerTimeMinutes > currentTimeMinutes) {
        return i;
      }
    }

    // If no prayer time is found for today, return the first prayer of the next day (Fajr)
    return 0;
  }
}
