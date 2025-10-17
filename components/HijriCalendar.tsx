import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
  monthNameEn: string;
  gregorianDate: Date;
}

interface IslamicEvent {
  name: string;
  date: string;
  hijriDate: string;
  description: string;
  icon: string;
  isToday?: boolean;
  daysUntil?: number;
  hijriDay?: number;
  hijriMonth?: number;
  hijriYear?: number;
}

interface CalendarDay {
  hijriDay: number;
  gregorianDay: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  hasEvent: boolean;
  events: IslamicEvent[];
  gregorianDate: Date;
}

const HijriCalendar = () => {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
  const [todayEvents, setTodayEvents] = useState<IslamicEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<IslamicEvent[]>([]);
  const [allEvents, setAllEvents] = useState<IslamicEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  // Hijri month names in Arabic and English
  const hijriMonths = [
    { ar: 'محرم', en: 'Muharram' },
    { ar: 'صفر', en: 'Safar' },
    { ar: 'ربيع الأول', en: 'Rabi\' al-awwal' },
    { ar: 'ربيع الثاني', en: 'Rabi\' al-thani' },
    { ar: 'جمادى الأولى', en: 'Jumada al-awwal' },
    { ar: 'جمادى الآخرة', en: 'Jumada al-akhirah' },
    { ar: 'رجب', en: 'Rajab' },
    { ar: 'شعبان', en: 'Sha\'ban' },
    { ar: 'رمضان', en: 'Ramadan' },
    { ar: 'شوال', en: 'Shawwal' },
    { ar: 'ذو القعدة', en: 'Dhu al-Qi\'dah' },
    { ar: 'ذو الحجة', en: 'Dhu al-Hijjah' },
  ];

  // Comprehensive Islamic events data
  const islamicEventsData = [
    {
      "month": "Muharram",
      "events": [
        { "day": 1, "title": "Islamic New Year", "description": "First day of the Hijri year" },
        { "day": 10, "title": "Day of Ashura", "description": "Commemorates the deliverance of Musa (AS). Sunnah to fast on 9th and 10th or 10th and 11th." }
      ]
    },
    {
      "month": "Rabi' al-Awwal",
      "events": [
        { "day": 12, "title": "Mawlid al-Nabi", "description": "Many Muslims commemorate the birth of Prophet Muhammad ﷺ" }
      ]
    },
    {
      "month": "Rajab",
      "events": [
        { "day": 27, "title": "Isra and Mi'raj", "description": "Night Journey and Ascension of the Prophet ﷺ" }
      ]
    },
    {
      "month": "Sha'ban",
      "events": [
        { "day": 15, "title": "Laylat al-Bara'ah", "description": "Night of Forgiveness (observed in many regions)" }
      ]
    },
    {
      "month": "Ramadan",
      "events": [
        { "day": 1, "title": "Start of Ramadan", "description": "Beginning of the fasting month" },
        { "day": 27, "title": "Laylat al-Qadr (commonly observed)", "description": "Night of Decree, better than 1000 months (falls in last 10 nights)" }
      ]
    },
    {
      "month": "Shawwal",
      "events": [
        { "day": 1, "title": "Eid al-Fitr", "description": "Festival marking the end of Ramadan" },
        { "day": 2, "title": "Six Fasts of Shawwal", "description": "Voluntary fasting in the first six days of Shawwal" }
      ]
    },
    {
      "month": "Dhul Hijjah",
      "events": [
        { "day": 1, "title": "Start of Dhul Hijjah", "description": "First 10 days are the best days of the year" },
        { "day": 9, "title": "Day of Arafah", "description": "Key day of Hajj. Sunnah to fast for non-pilgrims." },
        { "day": 10, "title": "Eid al-Adha", "description": "Festival of Sacrifice" },
        { "day": 11, "title": "Days of Tashreeq", "description": "Takbeer after every prayer until 13th Dhul Hijjah" }
      ]
    }
  ];

  // Accurate Hijri to Gregorian date mapping for 2025-2026
  const accurateHijriDates: { [key: string]: string } = {
    // 1447 AH (2025-2026)
    '1447-01-01': '2025-06-26', // Muharram 1, 1447 - Islamic New Year
    '1447-01-10': '2025-07-05', // Muharram 10, 1447 - Ashura
    '1447-03-12': '2025-09-03', // Rabi' al-Awwal 12, 1447 - Mawlid al-Nabi
    '1447-07-27': '2025-01-16', // Rajab 27, 1447 - Isra and Mi'raj
    '1447-08-15': '2025-02-13', // Sha'ban 15, 1447 - Laylat al-Bara'ah
    '1447-09-01': '2025-02-28', // Ramadan 1, 1447 - Start of Ramadan
    '1447-09-27': '2025-03-26', // Ramadan 27, 1447 - Laylat al-Qadr
    '1447-10-01': '2025-03-30', // Shawwal 1, 1447 - Eid al-Fitr
    '1447-10-02': '2025-03-31', // Shawwal 2, 1447 - Six Fasts of Shawwal
    '1447-12-01': '2025-05-26', // Dhul Hijjah 1, 1447 - Start of Dhul Hijjah
    '1447-12-09': '2025-06-03', // Dhul Hijjah 9, 1447 - Day of Arafah
    '1447-12-10': '2025-06-04', // Dhul Hijjah 10, 1447 - Eid al-Adha
    '1447-12-11': '2025-06-05', // Dhul Hijjah 11, 1447 - Days of Tashreeq

    // 1448 AH (2026-2027)
    '1448-01-01': '2026-06-15', // Muharram 1, 1448 - Islamic New Year
    '1448-01-10': '2026-06-24', // Muharram 10, 1448 - Ashura
    '1448-03-12': '2026-08-21', // Rabi' al-Awwal 12, 1448 - Mawlid al-Nabi
    '1448-07-27': '2026-01-05', // Rajab 27, 1448 - Isra and Mi'raj
    '1448-08-15': '2026-02-02', // Sha'ban 15, 1448 - Laylat al-Bara'ah
    '1448-09-01': '2026-02-18', // Ramadan 1, 1448 - Start of Ramadan
    '1448-09-27': '2026-03-16', // Ramadan 27, 1448 - Laylat al-Qadr
    '1448-10-01': '2026-03-20', // Shawwal 1, 1448 - Eid al-Fitr
    '1448-10-02': '2026-03-21', // Shawwal 2, 1448 - Six Fasts of Shawwal
    '1448-12-01': '2026-05-15', // Dhul Hijjah 1, 1448 - Start of Dhul Hijjah
    '1448-12-09': '2026-05-23', // Dhul Hijjah 9, 1448 - Day of Arafah
    '1448-12-10': '2026-05-24', // Dhul Hijjah 10, 1448 - Eid al-Adha
    '1448-12-11': '2026-05-25', // Dhul Hijjah 11, 1448 - Days of Tashreeq
  };

  // Generate comprehensive Islamic events for multiple years
  const generateComprehensiveEvents = (): IslamicEvent[] => {
    const events: IslamicEvent[] = [];
    
    // Generate events for 1447 AH (2025-2026) and 1448 AH (2026-2027)
    const years = [1447, 1448];
    
    years.forEach(hijriYear => {
      islamicEventsData.forEach(monthData => {
        const monthIndex = hijriMonths.findIndex(m => m.en === monthData.month);
        if (monthIndex === -1) return;
        
        monthData.events.forEach(event => {
          // Create Hijri date key
          const hijriDateKey = `${hijriYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(event.day).padStart(2, '0')}`;
          
          // Get accurate Gregorian date
          const gregorianDateStr = accurateHijriDates[hijriDateKey];
          
          if (gregorianDateStr) {
            const gregorianDate = new Date(gregorianDateStr);
            
            events.push({
              name: event.title,
              date: gregorianDateStr,
              hijriDate: `${event.day} ${hijriMonths[monthIndex].ar} ${hijriYear}`,
              description: event.description,
              icon: getIconForEvent(event.title),
              hijriDay: event.day,
              hijriMonth: monthIndex + 1,
              hijriYear: hijriYear
            });
          }
        });
      });
    });
    
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Get icon for event based on title
  const getIconForEvent = (title: string): string => {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('new year')) return 'calendar.badge.plus';
    if (lowerTitle.includes('ashura')) return 'heart.fill';
    if (lowerTitle.includes('mawlid')) return 'star.fill';
    if (lowerTitle.includes('isra') || lowerTitle.includes('mi\'raj')) return 'moon.stars.fill';
    if (lowerTitle.includes('bara\'ah')) return 'sparkles';
    if (lowerTitle.includes('ramadan')) return 'moon.fill';
    if (lowerTitle.includes('qadr')) return 'sparkles';
    if (lowerTitle.includes('eid al-fitr')) return 'party.popper.fill';
    if (lowerTitle.includes('shawwal')) return 'circle.grid.3x3.fill';
    if (lowerTitle.includes('hijjah')) return 'building.2.fill';
    if (lowerTitle.includes('arafah')) return 'sun.max.fill';
    if (lowerTitle.includes('eid al-adha')) return 'gift.fill';
    if (lowerTitle.includes('tashreeq')) return 'speaker.wave.2.fill';
    
    return 'calendar';
  };

  // Fetch Islamic events using comprehensive data
  const fetchIslamicEvents = async () => {
    try {
      console.log('🔄 Generating comprehensive Islamic events...');
      
      // Use comprehensive events data instead of API
      const events = generateComprehensiveEvents();
      
      // Debug: Log all generated events
      console.log('📅 Generated events:');
      events.forEach(event => {
        console.log(`  ${event.date} - ${event.name} (${event.hijriDate})`);
      });
      
      console.log(`✅ Generated ${events.length} Islamic events`);
      return events;
    } catch (error) {
      console.error('Error generating Islamic events:', error);
      return getFallbackEvents();
    }
  };

  // Fallback events if comprehensive data fails
  const getFallbackEvents = (): IslamicEvent[] => {
    return [
      {
        name: 'Islamic New Year',
        date: '2025-06-26',
        hijriDate: '1 محرم 1447',
        description: 'First day of the Hijri year',
        icon: 'calendar.badge.plus',
        hijriDay: 1,
        hijriMonth: 1,
        hijriYear: 1447
      },
      {
        name: 'Start of Ramadan',
        date: '2026-02-18',
        hijriDate: '1 رمضان 1448',
        description: 'Beginning of the fasting month',
        icon: 'moon.fill',
        hijriDay: 1,
        hijriMonth: 9,
        hijriYear: 1448
      },
      {
        name: 'Eid al-Fitr',
        date: '2026-03-20',
        hijriDate: '1 شوال 1448',
        description: 'Festival marking the end of Ramadan',
        icon: 'party.popper.fill',
        hijriDay: 1,
        hijriMonth: 10,
        hijriYear: 1448
      },
      {
        name: 'Eid al-Adha',
        date: '2026-05-24',
        hijriDate: '10 ذو الحجة 1448',
        description: 'Festival of Sacrifice',
        icon: 'gift.fill',
        hijriDay: 10,
        hijriMonth: 12,
        hijriYear: 1448
      },
    ];
  };

  // Fetch today's Hijri date from API
  const fetchTodaysHijriDate = async (): Promise<HijriDate> => {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      
      // Using Aladhan API for accurate Hijri date
      const response = await fetch(`https://api.aladhan.com/v1/gToH?date=${day}-${month}-${year}`);
      const data = await response.json();
      
      if (data.code === 200 && data.data) {
        const hijri = data.data.hijri;
        const monthIndex = parseInt(hijri.month.number) - 1;
        
        return {
          day: parseInt(hijri.day),
          month: parseInt(hijri.month.number),
          year: parseInt(hijri.year),
          monthName: hijriMonths[monthIndex].ar,
          monthNameEn: hijriMonths[monthIndex].en,
          gregorianDate: today
        };
      } else {
        throw new Error('Failed to fetch Hijri date');
      }
    } catch (error) {
      console.error('Error fetching Hijri date:', error);
      // Fallback to approximation
      const fallbackHijri = gregorianToHijri(new Date());
      return {
        ...fallbackHijri,
        gregorianDate: new Date()
      };
    }
  };

  // Convert Gregorian to Hijri (simplified approximation - fallback)
  const gregorianToHijri = (date: Date): { day: number; month: number; year: number; monthName: string; monthNameEn: string } => {
    // This is a simplified conversion - for production use a proper library
    const gregorianYear = date.getFullYear();
    const startOfHijriYear = new Date(gregorianYear - 622, 2, 22); // Approximate start
    const daysDiff = Math.floor((date.getTime() - startOfHijriYear.getTime()) / (1000 * 60 * 60 * 24));
    
    const hijriYear = Math.floor(daysDiff / 354) + 1;
    const remainingDays = daysDiff % 354;
    const hijriMonth = Math.floor(remainingDays / 29.5) + 1;
    const hijriDay = Math.floor(remainingDays % 29.5) + 1;

    const monthIndex = Math.max(0, Math.min(hijriMonths.length - 1, hijriMonth - 1));
    
    return {
      day: Math.max(1, Math.min(30, hijriDay)),
      month: hijriMonth,
      year: hijriYear,
      monthName: hijriMonths[monthIndex].ar,
      monthNameEn: hijriMonths[monthIndex].en
    };
  };

  // Generate calendar days for current month
  const generateCalendarDays = (month: Date, events: IslamicEvent[]) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    
    // Get first day of month and last day
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    
    // Get first day of week (0 = Sunday) and total days
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      // Fetch Hijri date for this day
      const hijriInfo = gregorianToHijri(currentDate);
      
      // Check if this day has events
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === currentDate.toDateString();
      });
      
      // Debug logging
      if (dayEvents.length > 0) {
        console.log(`📅 Found ${dayEvents.length} events for ${currentDate.toDateString()}:`, dayEvents.map(e => e.name));
      }
      
      days.push({
        hijriDay: hijriInfo.day,
        gregorianDay: currentDate.getDate(),
        isToday: currentDate.toDateString() === today.toDateString(),
        isCurrentMonth: currentDate.getMonth() === monthIndex,
        hasEvent: dayEvents.length > 0,
        events: dayEvents,
        gregorianDate: currentDate
      });
    }
    
    return days;
  };


  // Render list view of Islamic events
  const renderListView = () => {
    const currentYear = new Date().getFullYear();
    const upcomingYearEvents = allEvents.filter(event => {
      const eventYear = new Date(event.date).getFullYear();
      return eventYear >= currentYear;
    }).slice(0, 20); // Show next 20 events

    return (
      <View style={styles.listViewContainer}>
        <Text style={[styles.listViewTitle, { color: colors.text }]}>
          Upcoming Islamic Events
        </Text>
        
        {upcomingYearEvents.map((event, index) => {
          const eventDate = new Date(event.date);
          const today = new Date();
          const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <View key={index} style={[styles.listEventItem, { borderLeftColor: colors.tint }]}>
              <View style={styles.listEventContent}>
                <View style={styles.listEventHeader}>
                  <IconSymbol name={event.icon as any} size={18} color={colors.tint} />
                  <Text style={[styles.listEventName, { color: colors.text }]}>
                    {event.name}
                  </Text>
                  {daysUntil >= 0 && daysUntil <= 7 && (
                    <View style={[styles.daysUntilBadge, { backgroundColor: colors.tint }]}>
                      <Text style={styles.daysUntilText}>
                        {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d`}
                      </Text>
                    </View>
                  )}
                </View>
                
                <Text style={[styles.listEventDate, { color: colors.secondaryText }]}>
                  {eventDate.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} • {event.hijriDate}
                </Text>
                
                <Text style={[styles.listEventDescription, { color: colors.secondaryText }]}>
                  {event.description}
                </Text>
                
                {/* Add recommendations based on event type */}
                {getEventRecommendation(event.name) && (
                  <View style={[styles.recommendationBox, { backgroundColor: colors.cardBackground }]}>
                    <Text style={[styles.recommendationText, { color: colors.tint }]}>
                      💡 {getEventRecommendation(event.name)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  // Get recommendations for specific events
  const getEventRecommendation = (eventName: string): string | null => {
    const lowerName = eventName.toLowerCase();
    
    if (lowerName.includes('ashura')) {
      return 'Sunnah to fast on 9th and 10th or 10th and 11th Muharram';
    } else if (lowerName.includes('arafah')) {
      return 'Sunnah to fast for non-pilgrims on this blessed day';
    } else if (lowerName.includes('ramadan')) {
      return 'Prepare for the holy month - set intentions and goals';
    } else if (lowerName.includes('qadr')) {
      return 'Spend in worship and supplication - better than 1000 months';
    } else if (lowerName.includes('shawwal')) {
      return 'Fast 6 days in Shawwal for complete year\'s fasting reward';
    } else if (lowerName.includes('tashreeq')) {
      return 'Continue Takbeer after every prayer until 13th Dhul Hijjah';
    } else if (lowerName.includes('hijjah')) {
      return 'First 10 days are the best days of the year - increase good deeds';
    }
    
    return null;
  };



  // Schedule notification for an event
  const scheduleEventNotification = async (event: IslamicEvent) => {
    try {
      const eventDate = new Date(event.date);
      const now = new Date();
      const timeUntilEvent = eventDate.getTime() - now.getTime();
      
      // Only schedule if event is in the future
      if (timeUntilEvent > 0) {
        // Schedule notification 1 day before the event
        const notificationTime = new Date(eventDate.getTime() - (24 * 60 * 60 * 1000));
        
        // Don't schedule if the notification time has passed
        if (notificationTime > now) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: '📅 Islamic Event Reminder',
              body: `${event.name} is tomorrow! ${event.description}`,
              data: { eventName: event.name, eventDate: event.date },
            },
            trigger: {
              date: notificationTime,
            },
          });
        }
        
        // Also schedule a same-day notification
        const sameDayTime = new Date(eventDate);
        sameDayTime.setHours(8, 0, 0, 0); // 8 AM on the event day
        
        if (sameDayTime > now) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: '🌟 Today\'s Islamic Event',
              body: `Today is ${event.name}! ${event.description}`,
              data: { eventName: event.name, eventDate: event.date },
            },
            trigger: {
              date: sameDayTime,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error scheduling notification for event:', event.name, error);
    }
  };

  // Enable notifications and schedule all upcoming events
  const enableEventReminders = async () => {
    setIsRequestingPermission(true);
    
    try {
      // Request notification permissions
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status === 'granted') {
        setNotificationsEnabled(true);
        
        // Cancel all existing notifications
        await Notifications.cancelAllScheduledNotificationsAsync();
        
        // Schedule notifications for all upcoming events
        const upcomingEventsToNotify = allEvents.filter(event => {
          const eventDate = new Date(event.date);
          const now = new Date();
          const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return daysUntil > 0 && daysUntil <= 30; // Only next 30 days
        });
        
        let scheduledCount = 0;
        for (const event of upcomingEventsToNotify) {
          try {
            await scheduleEventNotification(event);
            scheduledCount++;
          } catch (error) {
            console.error('Failed to schedule notification for:', event.name, error);
          }
        }
        
        Alert.alert(
          'Notifications Enabled! 📅',
          `You'll receive reminders for ${scheduledCount} upcoming Islamic events.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Permission Denied',
          'Please enable notifications in your device settings to receive event reminders.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      Alert.alert(
        'Error',
        'Failed to enable notifications. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsRequestingPermission(false);
    }
  };

  // Check if notifications are enabled
  const checkNotificationStatus = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationsEnabled(status === 'granted');
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      setNotificationsEnabled(false);
    }
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  // Navigate to next month
  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  // Get today's events and upcoming events from fetched data
  const getEventsForToday = (events: IslamicEvent[]) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const todayEventsList = events.filter(event => event.date === todayStr);
    const upcomingEventsList = events.filter(event => {
      const eventDate = new Date(event.date);
      const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil > 0 && daysUntil <= 90; // Next 90 days
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { todayEventsList, upcomingEventsList };
  };

  useEffect(() => {
    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Set up Android notification channel
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      }).catch(error => {
        console.error('Error setting up notification channel:', error);
      });
    }

    // Fetch today's Hijri date from API
    const loadHijriDate = async () => {
      try {
        const hijri = await fetchTodaysHijriDate();
        setHijriDate(hijri);
      } catch (error) {
        console.error('Error loading Hijri date:', error);
      }
    };

    // Fetch Islamic events from API
    const loadEvents = async () => {
      setIsLoadingEvents(true);
      try {
        console.log('🔄 Fetching Islamic events from Aladhan API...');
        const events = await fetchIslamicEvents();
        setAllEvents(events);
        
        // Get today's and upcoming events
        const { todayEventsList, upcomingEventsList } = getEventsForToday(events);
        setTodayEvents(todayEventsList);
        setUpcomingEvents(upcomingEventsList);
        
        // Generate calendar days
        const days = generateCalendarDays(currentMonth, events);
        setCalendarDays(days);
        
        console.log(`✅ Loaded ${events.length} Islamic events from API`);
      } catch (error) {
        console.error('Error loading events:', error);
        // Use fallback events
        const fallbackEvents = getFallbackEvents();
        setAllEvents(fallbackEvents);
        const { todayEventsList, upcomingEventsList } = getEventsForToday(fallbackEvents);
        setTodayEvents(todayEventsList);
        setUpcomingEvents(upcomingEventsList);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    // Check notification status
    const loadNotificationStatus = async () => {
      try {
        await checkNotificationStatus();
      } catch (error) {
        console.error('Error checking notification status:', error);
      }
    };

    // Load all data
    loadHijriDate();
    loadEvents();
    loadNotificationStatus();
  }, []);

  // Regenerate calendar when month changes
  useEffect(() => {
    if (allEvents.length > 0) {
      const days = generateCalendarDays(currentMonth, allEvents);
      setCalendarDays(days);
    }
  }, [currentMonth, allEvents]);

  if (!hijriDate || isLoadingEvents) {
    return (
      <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
          {!hijriDate ? 'Loading Hijri date...' : 'Loading Islamic events...'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.cardBackground }]}>
      {/* Today's Hijri Date */}
      <View style={styles.dateSection}>
        <View style={styles.dateHeader}>
          <IconSymbol name="calendar" size={20} color={colors.tint} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Today's Hijri Date
          </Text>
        </View>
        
        <View style={styles.dateContent}>
          <Text style={[styles.hijriDate, { color: colors.text }]}>
            {hijriDate.day} {hijriDate.monthName}
          </Text>
          <Text style={[styles.hijriYear, { color: colors.secondaryText }]}>
            {hijriDate.year} AH
          </Text>
          <Text style={[styles.hijriEnglish, { color: colors.secondaryText }]}>
            {hijriDate.day} {hijriDate.monthNameEn} {hijriDate.year}
          </Text>
        </View>
      </View>

      {/* Calendar Section */}
      <View style={styles.calendarSection}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={[styles.monthYear, { color: colors.text }]}>
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          
          <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
            <IconSymbol name="chevron.right" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Day Headers */}
        <View style={styles.dayHeaders}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Text key={day} style={[styles.dayHeader, { color: colors.secondaryText }]}>
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {calendarDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                {
                  backgroundColor: day.isToday ? colors.tint : 'transparent',
                  borderColor: day.isCurrentMonth ? colors.border : 'transparent',
                }
              ]}
            >
              <Text style={[
                styles.gregorianDay,
                {
                  color: day.isToday ? '#fff' : day.isCurrentMonth ? colors.text : colors.secondaryText,
                  fontWeight: day.isToday ? 'bold' : 'normal'
                }
              ]}>
                {day.gregorianDay}
              </Text>
              <Text style={[
                styles.hijriDay,
                {
                  color: day.isToday ? '#fff' : colors.secondaryText,
                  fontSize: 10
                }
              ]}>
                {day.hijriDay}
              </Text>
              {day.isToday && !day.hasEvent && (
                <View style={[styles.todayIndicator, { backgroundColor: '#fff' }]} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* List View Section */}
      <View style={styles.listSection}>
        {renderListView()}
      </View>


      {/* Today's Events */}
      {todayEvents.length > 0 && (
        <View style={styles.eventsSection}>
          <View style={styles.dateHeader}>
            <IconSymbol name="star.fill" size={20} color="#FFD700" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Today's Islamic Event
            </Text>
          </View>
          {todayEvents.map((event, index) => (
            <View key={index} style={[styles.eventItem, { borderLeftColor: colors.tint }]}>
              <View style={styles.eventContent}>
                <View style={styles.eventHeader}>
                  <IconSymbol name={event.icon as any} size={16} color={colors.tint} />
                  <Text style={[styles.eventName, { color: colors.text }]}>
                    {event.name}
                  </Text>
                </View>
                <Text style={[styles.eventDescription, { color: colors.secondaryText }]}>
                  {event.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <View style={styles.eventsSection}>
          <View style={styles.dateHeader}>
            <IconSymbol name="clock" size={20} color={colors.tint} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Upcoming Events
            </Text>
          </View>
          {upcomingEvents.slice(0, 5).map((event, index) => {
            const eventDate = new Date(event.date);
            const today = new Date();
            const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <View key={index} style={[styles.eventItem, { borderLeftColor: colors.tint }]}>
                <View style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    <IconSymbol name={event.icon as any} size={16} color={colors.secondaryText} />
                    <Text style={[styles.eventName, { color: colors.text }]}>
                      {event.name}
                    </Text>
                    <Text style={[styles.daysUntil, { color: colors.tint }]}>
                      {daysUntil}d
                    </Text>
                  </View>
                  <Text style={[styles.eventDate, { color: colors.secondaryText }]}>
                    {eventDate.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })} • {event.hijriDate}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
      
      {/* Notifications & Reminders Section */}
      <View style={styles.notificationsSection}>
        <View style={styles.notificationsHeader}>
          <IconSymbol name="bell.fill" size={20} color={colors.tint} />
          <Text style={[styles.notificationsTitle, { color: colors.text }]}>
            Reminders & Notifications
          </Text>
        </View>
        
        <View style={[styles.notificationCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.notificationText, { color: colors.secondaryText }]}>
            💡 Enable notifications to receive reminders for upcoming Islamic events like:
          </Text>
          <View style={styles.notificationList}>
            <Text style={[styles.notificationItem, { color: colors.text }]}>
              • "Tomorrow is the Day of Arafah - Sunnah to fast"
            </Text>
            <Text style={[styles.notificationItem, { color: colors.text }]}>
              • "Ramadan begins tomorrow - prepare for fasting"
            </Text>
            <Text style={[styles.notificationItem, { color: colors.text }]}>
              • "Laylat al-Qadr is tonight - increase worship"
            </Text>
            <Text style={[styles.notificationItem, { color: colors.text }]}>
              • "Eid al-Fitr tomorrow - prepare for celebration"
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.enableNotificationsButton, 
              { 
                backgroundColor: notificationsEnabled ? '#4CAF50' : colors.tint,
                opacity: isRequestingPermission ? 0.6 : 1
              }
            ]}
            onPress={enableEventReminders}
            disabled={isRequestingPermission}
          >
            <IconSymbol 
              name={notificationsEnabled ? "bell.fill" : "bell"} 
              size={16} 
              color="#fff" 
            />
            <Text style={styles.enableNotificationsText}>
              {isRequestingPermission 
                ? 'Enabling...' 
                : notificationsEnabled 
                  ? 'Notifications Enabled ✓' 
                  : 'Enable Event Reminders'
              }
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dateSection: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  dateContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  hijriDate: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  hijriYear: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  hijriEnglish: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  
  // Calendar Styles
  calendarSection: {
    marginBottom: 30,
    paddingHorizontal: 15,
  },
  listSection: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    position: 'relative',
    paddingTop: 4,
  },
  gregorianDay: {
    fontSize: 14,
    fontWeight: '500',
  },
  hijriDay: {
    fontSize: 10,
    marginTop: 2,
  },
  todayIndicator: {
    position: 'absolute',
    bottom: 2,
    left: '50%',
    marginLeft: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  
  // List View Styles
  listViewContainer: {
    marginTop: 10,
  },
  listViewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(46, 125, 50, 0.3)',
  },
  listEventItem: {
    borderLeftWidth: 4,
    paddingLeft: 15,
    marginBottom: 16,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  listEventContent: {
    flex: 1,
  },
  listEventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  listEventName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
  },
  daysUntilBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  daysUntilText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listEventDate: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  listEventDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  recommendationBox: {
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
  },
  recommendationText: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  
  
  // Events Styles
  eventsSection: {
    marginBottom: 16,
    paddingHorizontal: 15,
  },
  eventItem: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    marginBottom: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventName: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  daysUntil: {
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  eventDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 12,
    opacity: 0.8,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 14,
    padding: 20,
  },
  
  // Notifications Styles
  notificationsSection: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  notificationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  notificationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  notificationCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  notificationText: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  notificationList: {
    marginBottom: 16,
  },
  notificationItem: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
    paddingLeft: 4,
  },
  enableNotificationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  enableNotificationsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default HijriCalendar;
