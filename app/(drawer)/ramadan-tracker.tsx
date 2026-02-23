import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const STORAGE_KEY = 'deenify_ramadan_missed';
const STORAGE_KEY_MADE_UP = 'deenify_ramadan_made_up';
const STORAGE_KEY_RAMADAN_START = 'deenify_ramadan_start';
const RAMADAN_DAYS = 30; // typical Ramadan length

function dateToYMD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(ymd: string, days: number): string {
  const d = new Date(ymd + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return dateToYMD(d);
}

function daysBetween(fromYMD: string, toYMD: string): number {
  const from = new Date(fromYMD + 'T12:00:00').getTime();
  const to = new Date(toYMD + 'T12:00:00').getTime();
  return Math.max(0, Math.round((to - from) / (24 * 60 * 60 * 1000)) + 1);
}

function isDateInRange(ymd: string, start: string, end: string): boolean {
  return ymd >= start && ymd <= end;
}

/** Fetch 1 Ramadan Gregorian date (current or next Hijri year). Uses RamadanService with API + offline fallback. */
async function fetchAutoRamadanStart(): Promise<string | null> {
  try {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    let hijriYear: number;
    try {
      const d = String(today.getDate()).padStart(2, '0');
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const gToHRes = await fetch(`https://api.aladhan.com/v1/gToH?date=${d}-${m}-${today.getFullYear()}`);
      const gToHData = await gToHRes.json();
      if (gToHData.code === 200 && gToHData.data?.hijri) {
        const h = gToHData.data.hijri;
        hijriYear = parseInt(h.year, 10);
        const hijriMonth = parseInt(h.month?.number ?? '1', 10);
        const hijriDay = parseInt(h.day ?? '1', 10);
        const target = hijriMonth > 9 || (hijriMonth === 9 && hijriDay > 1) ? hijriYear + 1 : hijriYear;
        return (await import('@/services/RamadanService')).getRamadanStartGregorian(target);
      }
    } catch (_) {}
    try {
      const ummahRes = await fetch(`https://www.ummahapi.com/api/hijri-date?date=${dateStr}`);
      const ummahJson = await ummahRes.json();
      const hijri = ummahJson?.data?.hijri;
      if (hijri?.year != null && hijri?.month != null && hijri?.day != null) {
        hijriYear = parseInt(String(hijri.year), 10);
        const hijriMonth = parseInt(String(hijri.month), 10);
        const hijriDay = parseInt(String(hijri.day), 10);
        const target = hijriMonth > 9 || (hijriMonth === 9 && hijriDay > 1) ? hijriYear + 1 : hijriYear;
        return (await import('@/services/RamadanService')).getRamadanStartGregorian(target);
      }
    } catch (_) {}

    const gy = today.getFullYear();
    const targetYear = Math.round(1446 + (gy - 2025));
    return (await import('@/services/RamadanService')).getRamadanStartGregorian(targetYear);
  } catch {
    return null;
  }
}

export type MissedFastReason =
  | 'menstruation'
  | 'pregnancy_nursing'
  | 'illness'
  | 'travel'
  | 'other';

export interface MissedFastEntry {
  id: string;
  date: string; // YYYY-MM-DD
  reason: MissedFastReason;
}

const REASON_LABELS: Record<MissedFastReason, string> = {
  menstruation: 'Menstruation',
  pregnancy_nursing: 'Pregnancy / Nursing',
  illness: 'Illness',
  travel: 'Travel',
  other: 'Other',
};

const REASONS: MissedFastReason[] = [
  'menstruation',
  'pregnancy_nursing',
  'illness',
  'travel',
  'other',
];

function formatDisplayDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function ProgressRing({
  progress,
  size = 140,
  strokeWidth = 10,
  tintColor,
  trackColor,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  tintColor: string;
  trackColor: string;
}) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - Math.min(1, Math.max(0, progress)));
  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle
        cx={cx}
        cy={cx}
        r={r}
        stroke={trackColor}
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      <Circle
        cx={cx}
        cy={cx}
        r={r}
        stroke={tintColor}
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function RamadanTrackerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = Colors[((theme as 'light' | 'dark') ?? 'light') as 'light' | 'dark'];

  const [entries, setEntries] = useState<MissedFastEntry[]>([]);
  const [madeUpCount, setMadeUpCount] = useState(0);
  const [ramadanStartDate, setRamadanStartDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newDate, setNewDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [newReason, setNewReason] = useState<MissedFastReason>('menstruation');

  const loadEntries = useCallback(async () => {
    try {
      const [raw, rawMadeUp, rawStart] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(STORAGE_KEY_MADE_UP),
        AsyncStorage.getItem(STORAGE_KEY_RAMADAN_START),
      ]);
      if (raw) {
        const parsed = JSON.parse(raw) as MissedFastEntry[];
        setEntries(Array.isArray(parsed) ? parsed : []);
      } else {
        setEntries([]);
      }
      const n = parseInt(rawMadeUp ?? '0', 10);
      setMadeUpCount(Number.isNaN(n) ? 0 : Math.max(0, n));
      setRamadanStartDate(rawStart && /^\d{4}-\d{2}-\d{2}$/.test(rawStart) ? rawStart : null);
    } catch (e) {
      setEntries([]);
      setMadeUpCount(0);
      setRamadanStartDate(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Auto-set Ramadan start from Islamic calendar when user never set it (catch-up)
  useEffect(() => {
    if (loading || ramadanStartDate !== null) return;
    let cancelled = false;
    (async () => {
      const start = await fetchAutoRamadanStart();
      if (cancelled || !start) return;
      setRamadanStartDate(start);
      await AsyncStorage.setItem(STORAGE_KEY_RAMADAN_START, start);
    })();
    return () => { cancelled = true; };
  }, [loading, ramadanStartDate]);

  const saveEntries = useCallback(async (next: MissedFastEntry[]) => {
    setEntries(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addEntry = useCallback(() => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const entry: MissedFastEntry = { id, date: newDate, reason: newReason };
    saveEntries([...entries, entry]);
    setModalVisible(false);
    setNewReason('menstruation');
    setNewDate(new Date().toISOString().slice(0, 10));
  }, [entries, newDate, newReason, saveEntries]);

  const incrementMadeUp = useCallback(async () => {
    const next = Math.min(madeUpCount + 1, entries.length);
    setMadeUpCount(next);
    await AsyncStorage.setItem(STORAGE_KEY_MADE_UP, String(next));
  }, [madeUpCount, entries.length]);

  const removeEntry = useCallback(
    (id: string) => {
      Alert.alert(
        'Remove missed fast',
        'Remove this entry from your tracker?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              const next = entries.filter((e) => e.id !== id);
              await saveEntries(next);
              if (madeUpCount > next.length) {
                const capped = next.length;
                setMadeUpCount(capped);
                await AsyncStorage.setItem(STORAGE_KEY_MADE_UP, String(capped));
              }
            },
          },
        ]
      );
    },
    [entries, madeUpCount, saveEntries]
  );

  const todayYMD = dateToYMD(new Date());

  const ramadanEndDate = ramadanStartDate ? addDays(ramadanStartDate, RAMADAN_DAYS - 1) : null;
  const lastDaySoFar = ramadanStartDate && ramadanEndDate
    ? (todayYMD < ramadanStartDate ? null : (todayYMD > ramadanEndDate ? ramadanEndDate : todayYMD))
    : null;
  const ramadanDaysElapsed = ramadanStartDate && lastDaySoFar
    ? daysBetween(ramadanStartDate, lastDaySoFar)
    : 0;
  const missedInRange = ramadanStartDate && lastDaySoFar
    ? entries.filter((e) => isDateInRange(e.date, ramadanStartDate, lastDaySoFar)).length
    : 0;
  const completedCount = ramadanStartDate && lastDaySoFar
    ? Math.max(0, ramadanDaysElapsed - missedInRange)
    : 0;

  const ramadanNotStarted = ramadanStartDate && todayYMD < ramadanStartDate;
  const daysUntilRamadan = ramadanStartDate && ramadanNotStarted
    ? daysBetween(todayYMD, ramadanStartDate) - 1
    : null;

  const setStartDate = useCallback(async (ymd: string) => {
    setRamadanStartDate(ymd);
    await AsyncStorage.setItem(STORAGE_KEY_RAMADAN_START, ymd);
  }, []);

  const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const missedCount = entries.length;
  const toMakeUp = Math.max(0, missedCount - madeUpCount);
  const makeUpProgress = missedCount > 0 ? madeUpCount / missedCount : 1;
  const fastingProgress = ramadanDaysElapsed > 0 ? Math.min(1, completedCount / ramadanDaysElapsed) : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 56, backgroundColor: colors.background }]}>
        <View style={styles.headerSide}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(drawer)');
            }
          }}
          accessibilityLabel="Back to Home"
          accessibilityRole="button"
          >
            <IconSymbol name="chevron.left" size={26} color={colors.text} />
            <Text style={[styles.backButtonLabel, { color: colors.text }]}>Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerCenter} pointerEvents="box-none">
          <View style={styles.headerTitleBlock} pointerEvents="none">
            <Text
              style={[styles.headerTitle, { color: colors.text }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              My Ramadan Journey
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.text }]} numberOfLines={1}>
              Track your fasts and make-ups
            </Text>
          </View>
        </View>
        <View style={styles.headerSide} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress ring & stats */}
        <Text style={[styles.sectionLabel, { color: colors.text }]}>OVERVIEW</Text>
        <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          {/* Ramadan start date */}
          <View style={[styles.startDateRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.startDateLabel, { color: colors.text }]}>Ramadan starts</Text>
            {ramadanStartDate ? (
              <Text style={[styles.startDateValue, { color: colors.text }]}>{formatDisplayDate(ramadanStartDate)}</Text>
            ) : (
              <Text style={[styles.startDatePlaceholder, { color: colors.text }]}>Not set</Text>
            )}
            <TouchableOpacity
              style={[styles.setDateButton, { backgroundColor: colors.tint }]}
              onPress={() => {
                if (ramadanStartDate) {
                  Alert.alert(
                    'Change start date',
                    'Set Ramadan start to tomorrow, or clear to choose again.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Clear', onPress: async () => { setRamadanStartDate(null); await AsyncStorage.removeItem(STORAGE_KEY_RAMADAN_START); } },
                      { text: 'Set to tomorrow', onPress: () => setStartDate(addDays(todayYMD, 1)) },
                    ]
                  );
                } else {
                  setStartDate(addDays(todayYMD, 1));
                }
              }}
            >
              <Text style={styles.setDateButtonText}>{ramadanStartDate ? 'Change' : 'Set (e.g. tomorrow)'}</Text>
            </TouchableOpacity>
          </View>

          {ramadanNotStarted && daysUntilRamadan !== null && (
            <Text style={[styles.daysUntilText, { color: colors.tint }]}>
              Ramadan starts in {daysUntilRamadan} day{daysUntilRamadan !== 1 ? 's' : ''}
            </Text>
          )}

          <View style={styles.ringWrapper}>
            <ProgressRing
              progress={missedCount > 0 ? makeUpProgress : fastingProgress}
              size={140}
              strokeWidth={10}
              tintColor={missedCount > 0 ? '#F59E0B' : colors.tint}
              trackColor={colors.border}
            />
            <View style={[StyleSheet.absoluteFillObject, styles.ringCenter]} pointerEvents="none">
              <Text style={[styles.ringValue, { color: colors.text }]}>
                {loading ? '—' : missedCount > 0 ? toMakeUp : completedCount}
              </Text>
              <Text style={[styles.ringLabel, { color: colors.text }]}>
                {missedCount > 0 ? 'to make up' : ramadanNotStarted ? 'fasted' : 'fasted'}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.tint }]}>{loading ? '—' : completedCount}</Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Completed</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#E57373' }]}>{loading ? '—' : missedCount}</Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Missed</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.tint }]}>{loading ? '—' : madeUpCount}</Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Made up</Text>
            </View>
          </View>

          {missedCount > 0 && toMakeUp > 0 && (
            <TouchableOpacity
              style={[styles.madeUpButton, { backgroundColor: colors.tint }]}
              onPress={incrementMadeUp}
            >
              <IconSymbol name="checkmark.circle.fill" size={20} color="#FFFFFF" />
              <Text style={styles.madeUpButtonText}>I made up 1 fast</Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.summaryNote, { color: colors.text }]}>
            {ramadanStartDate
              ? `Completed = fasts so far (since ${formatDisplayDate(ramadanStartDate)}) minus missed.`
              : `Set "Ramadan starts" above. Completed = days elapsed in Ramadan minus missed.`}
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.text }]}>MISSED FASTS</Text>
        <View style={styles.listHeader}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.tint }]}
            onPress={() => setModalVisible(true)}
          >
            <IconSymbol name="plus" size={18} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add missed fast</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <Text style={[styles.emptyText, { color: colors.text }]}>Loading…</Text>
        ) : sortedEntries.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Text style={[styles.emptyText, { color: colors.text }]}>No missed fasts recorded</Text>
            <Text style={[styles.emptySubtext, { color: colors.text }]}>
              Tap "Add missed fast" when you need to record a day you didn't fast.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {sortedEntries.map((entry) => (
              <View
                key={entry.id}
                style={[styles.entryCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
              >
                <View style={styles.entryMain}>
                  <Text style={[styles.entryDate, { color: colors.text }]}>{formatDisplayDate(entry.date)}</Text>
                  <Text style={[styles.entryReason, { color: colors.text }]}>
                    {REASON_LABELS[entry.reason]}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeEntry(entry.id)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <IconSymbol name="trash" size={20} color="#E57373" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={[styles.modalCancel, { color: colors.tint }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add missed fast</Text>
            <TouchableOpacity onPress={addEntry}>
              <Text style={[styles.modalDone, { color: colors.tint }]}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} contentContainerStyle={styles.modalBodyContent}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Date</Text>
            <View style={[styles.dateRow, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <TouchableOpacity
                onPress={() => {
                  const d = new Date(newDate + 'T12:00:00');
                  d.setDate(d.getDate() - 1);
                  setNewDate(d.toISOString().slice(0, 10));
                }}
                style={styles.dateArrow}
              >
                <IconSymbol name="chevron.left" size={22} color={colors.tint} />
              </TouchableOpacity>
              <Text style={[styles.dateText, { color: colors.text }]}>{formatDisplayDate(newDate)}</Text>
              <TouchableOpacity
                onPress={() => {
                  const d = new Date(newDate + 'T12:00:00');
                  d.setDate(d.getDate() + 1);
                  setNewDate(d.toISOString().slice(0, 10));
                }}
                style={styles.dateArrow}
              >
                <IconSymbol name="chevron.right" size={22} color={colors.tint} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.fieldHint, { color: colors.text }]}>
              Tap arrows to pick the day you missed the fast.
            </Text>

            <Text style={[styles.fieldLabel, { color: colors.text }]}>Reason</Text>
            <View style={styles.reasonList}>
              {REASONS.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.reasonOption,
                    { backgroundColor: colors.cardBackground, borderColor: colors.border },
                    newReason === r && { borderColor: colors.tint, borderWidth: 2 },
                  ]}
                  onPress={() => setNewReason(r)}
                >
                  <Text style={[styles.reasonOptionText, { color: colors.text }]}>{REASON_LABELS[r]}</Text>
                  {newReason === r && (
                    <IconSymbol name="checkmark.circle.fill" size={22} color={colors.tint} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerSide: {
    width: 72,
    minWidth: 72,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 6,
    marginTop: -76,
  },
  backButtonLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  headerTitleBlock: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    opacity: 0.65,
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    opacity: 0.5,
    marginBottom: 10,
    marginTop: 16,
  },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
  },
  startDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  startDateLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  startDateValue: {
    flex: 1,
    fontSize: 14,
  },
  startDatePlaceholder: {
    flex: 1,
    fontSize: 14,
    opacity: 0.6,
  },
  setDateButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  setDateButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  daysUntilText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  ringWrapper: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  ringCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: {
    fontSize: 36,
    fontWeight: '800',
  },
  ringLabel: {
    fontSize: 12,
    opacity: 0.65,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 36,
  },
  madeUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  madeUpButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  summaryNote: {
    fontSize: 10,
    opacity: 0.5,
    marginTop: 12,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    gap: 10,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  entryMain: {
    flex: 1,
  },
  entryDate: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  entryReason: {
    fontSize: 13,
    opacity: 0.65,
  },
  deleteButton: {
    padding: 8,
  },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalCancel: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalDone: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalBody: {
    flex: 1,
  },
  modalBodyContent: {
    padding: 20,
    paddingBottom: 40,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  dateArrow: {
    padding: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fieldHint: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 8,
    marginBottom: 24,
  },
  reasonList: {
    gap: 10,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  reasonOptionText: {
    fontSize: 16,
  },
});
