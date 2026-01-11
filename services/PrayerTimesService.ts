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

export class PrayerTimesService {
  private static readonly API_BASE_URL = 'https://api.aladhan.com/v1';
  
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
    try {
      const currentDate = date || new Date();
      const dateString = currentDate.toISOString().split('T')[0];
      
      // Get calculation method ID
      const methodId = this.CALCULATION_METHODS[calculationMethod as keyof typeof this.CALCULATION_METHODS] || 3;
      
      // Build URL with calculation method and madhab
      // API automatically handles timezone and DST based on coordinates
      let url = `${this.API_BASE_URL}/timings/${dateString}?latitude=${latitude}&longitude=${longitude}&method=${methodId}`;
      
      // Add madhab parameter for Asr calculation
      if (madhab === 'Hanafi') {
        url += '&school=1'; // Hanafi school
      } else {
        url += '&school=0'; // Standard school (Shafi'i, Maliki, Hanbali)
      }
      
      // Validate coordinates are within reasonable bounds
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        console.error(`❌ Invalid coordinates: ${latitude}, ${longitude}`);
        throw new Error('Invalid location coordinates');
      }
      
      console.log(`🌍 Fetching prayer times for coordinates: ${latitude}, ${longitude}`);
      console.log(`📅 Date: ${dateString}`);
      console.log(`🔗 API URL: ${url}`);
      
      const response = await fetch(url);
      const data: PrayerTimesResponse = await response.json();

      if (data.code !== 200) {
        console.error('❌ API Error:', data);
        throw new Error(`Failed to fetch prayer times: ${data.status}`);
      }
      
      console.log(`✅ API Response:`, {
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

      // Log timezone info for debugging DST
      if (data.data.meta && data.data.meta.timezone) {
        console.log(`Prayer times fetched for timezone: ${data.data.meta.timezone}`);
        this.logDSTStatus();
      }

      return prayerTimes;
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      throw new Error('Failed to fetch prayer times. Please check your internet connection.');
    }
  }

  static async getPrayerTimesByCity(
    city: string,
    country: string,
    date?: Date,
    calculationMethod: string = 'MWL',
    madhab: string = 'Standard'
  ): Promise<PrayerTime[]> {
    try {
      const currentDate = date || new Date();
      const dateString = currentDate.toISOString().split('T')[0];
      
      // Get calculation method ID
      const methodId = this.CALCULATION_METHODS[calculationMethod as keyof typeof this.CALCULATION_METHODS] || 3;
      
      // Build URL with calculation method and madhab
      // API automatically handles timezone and DST/BST based on city location
      let url = `${this.API_BASE_URL}/timingsByCity/${dateString}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${methodId}`;
      
      // Add madhab parameter for Asr calculation
      if (madhab === 'Hanafi') {
        url += '&school=1'; // Hanafi school
      } else {
        url += '&school=0'; // Standard school (Shafi'i, Maliki, Hanbali)
      }
      
      const response = await fetch(url);
      const data: PrayerTimesResponse = await response.json();

      if (data.code !== 200) {
        throw new Error('Failed to fetch prayer times');
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

      // Log timezone info for debugging DST
      if (data.data.meta && data.data.meta.timezone) {
        console.log(`Prayer times fetched for timezone: ${data.data.meta.timezone}`);
        this.logDSTStatus();
      }

      return prayerTimes;
    } catch (error) {
      console.error('Error fetching prayer times by city:', error);
      throw new Error('Failed to fetch prayer times. Please check your internet connection.');
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
    // Convert from 24-hour format to 12-hour format
    const [hours, minutes] = timeString.split(':').map(Number);
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
