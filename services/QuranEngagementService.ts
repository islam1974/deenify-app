import { sanitizeEngagementCopy } from '@/constants/EngagementCopyRules';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'quran_engagement_events_v2';
const MAX_EVENTS = 2000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type EngagementEventType =
  | 'AYAH_READ'
  | 'AYAH_READ_SESSION'
  | 'TRANSLATION_VIEWED'
  | 'AUDIO_PLAYED'
  | 'REFLECTION_WRITTEN'
  | 'MEMORIZATION_REP'
  | 'AYAH_REVISITED';

export type EngagementEvent = {
  type: EngagementEventType;
  timestamp: number;
  chapterId?: number;
  verseNumber?: number;
};

type StoredData = {
  events: EngagementEvent[];
};

function getDateKey(timestamp: number): string {
  const d = new Date(timestamp);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getWeekStart(timestamp: number): number {
  const d = new Date(timestamp);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

async function readData(): Promise<StoredData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { events: [] };
    const parsed = JSON.parse(raw) as StoredData;
    return { events: Array.isArray(parsed.events) ? parsed.events : [] };
  } catch {
    return { events: [] };
  }
}

async function writeData(data: StoredData): Promise<void> {
  try {
    let events = data.events;
    if (events.length > MAX_EVENTS) {
      events = events.slice(-MAX_EVENTS);
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ events }));
  } catch (e) {
    console.warn('QuranEngagementService: failed to persist', e);
  }
}

/** Record an engagement event. Call from Quran reader, audio, etc. */
async function recordEvent(event: Omit<EngagementEvent, 'timestamp'>): Promise<void> {
  const fullEvent: EngagementEvent = { ...event, timestamp: Date.now() };
  const data = await readData();
  data.events.push(fullEvent);
  await writeData(data);
}

/** Get events within the last N days (including today). */
async function getEventsInLastDays(days: number): Promise<EngagementEvent[]> {
  const data = await readData();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return data.events.filter((e) => e.timestamp >= cutoff);
}

/** Count of unique days with any engagement in the last 7 days. */
async function getUniqueDaysEngaged(): Promise<number> {
  const events = await getEventsInLastDays(7);
  const days = new Set<string>();
  events.forEach((e) => days.add(getDateKey(e.timestamp)));
  return days.size;
}

/** Count of REFLECTION_WRITTEN events this week. */
async function getReflectionsCount(): Promise<number> {
  const events = await getEventsInLastDays(7);
  return events.filter((e) => e.type === 'REFLECTION_WRITTEN').length;
}

/** Count of AYAH_READ_SESSION events this week (reading sessions). */
async function getReadingSessions(): Promise<number> {
  const events = await getEventsInLastDays(7);
  return events.filter((e) => e.type === 'AYAH_READ_SESSION').length;
}

/** Count of AUDIO_PLAYED events this week (listening sessions). */
async function getListeningSessions(): Promise<number> {
  const events = await getEventsInLastDays(7);
  const audioEvents = events.filter((e) => e.type === 'AUDIO_PLAYED');
  const sessionsByDay = new Map<string, number>();
  audioEvents.forEach((e) => {
    const key = getDateKey(e.timestamp);
    sessionsByDay.set(key, (sessionsByDay.get(key) ?? 0) + 1);
  });
  return audioEvents.length; // total plays as "sessions" for simplicity
}

/** Count of AYAH_REVISITED events this week. */
async function getRevisitCount(): Promise<number> {
  const events = await getEventsInLastDays(7);
  return events.filter((e) => e.type === 'AYAH_REVISITED').length;
}

export type WeeklyReflectionSummary = {
  uniqueDaysEngaged: number;
  reflectionsCount: number;
  readingSessions: number;
  listeningSessions: number;
  revisitCount: number;
  /** Emotionally framed copy for UI. Never guilt-based. */
  lines: string[];
};

/**
 * Generate a weekly reflection summary with gentle, presence-focused copy.
 * Avoids: missed, failed, only, streak lost.
 * Emphasizes presence over productivity.
 */
async function generateWeeklyReflectionSummary(_userId?: string): Promise<WeeklyReflectionSummary> {
  const [uniqueDaysEngaged, reflectionsCount, readingSessions, listeningSessions, revisitCount] = await Promise.all([
    getUniqueDaysEngaged(),
    getReflectionsCount(),
    getReadingSessions(),
    getListeningSessions(),
    getRevisitCount(),
  ]);

  const lines: string[] = [];

  if (uniqueDaysEngaged > 0) {
    lines.push('You returned — and that matters.');
  }

  if (reflectionsCount > 0) {
    lines.push('You paused to reflect.');
  }

  if (readingSessions > 0) {
    lines.push('You sat with the words.');
  }

  if (listeningSessions > 0) {
    lines.push('You listened when you needed stillness.');
  }

  if (revisitCount > 0) {
    lines.push('You came back to verses you love.');
  }

  if (lines.length === 0) {
    lines.push('Your space is here when you’re ready.');
  }

  const sanitizedLines = lines.map(sanitizeEngagementCopy);

  return {
    uniqueDaysEngaged,
    reflectionsCount,
    readingSessions,
    listeningSessions,
    revisitCount,
    lines: sanitizedLines,
  };
}

/** Reset all engagement events. Use when user chooses "Start from beginning". */
async function resetStats(): Promise<void> {
  await writeData({ events: [] });
}

// ============ Legacy compatibility (for quran.tsx session handling)
// These are no-ops in the new event-based model. Events are recorded explicitly.
function startSession(): void {}
function stopSession(): void {}

const QuranEngagementService = {
  recordEvent,
  getUniqueDaysEngaged,
  getReflectionsCount,
  getReadingSessions,
  getListeningSessions,
  getRevisitCount,
  generateWeeklyReflectionSummary,
  resetStats,
  startSession,
  stopSession,
};

export default QuranEngagementService;
