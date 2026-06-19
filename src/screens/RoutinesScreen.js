import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen, IconButton, Flame, openDrawer } from '../components/UI';
import { useApp } from '../state/AppContext';
import { formatShort } from '../utils/date';
import { spacing, radius, font } from '../theme';

const translations = {
  English: {
    routines: 'Routines',
    currentStreak: 'CURRENT STREAK',
    days: 'days',
    total: 'TOTAL',
    today: 'TODAY',
    allRoutines: 'ALL ROUTINES',
    addNew: 'Add new routine',
    hint: 'Only morning routine completion may require a puzzle',
    morning: 'Morning',
    tasks: 'tasks',
    dayStreak: 'day streak'
  },
  Türkçe: {
    routines: 'Rutinler',
    currentStreak: 'MEVCUT SERİ',
    days: 'gün',
    total: 'TOPLAM',
    today: 'BUGÜN',
    allRoutines: 'TÜM RUTİNLER',
    addNew: 'Yeni rutin ekle',
    hint: 'Sadece sabah rutinleri bulmaca gerektirebilir',
    morning: 'Sabah',
    tasks: 'görev',
    dayStreak: 'günlük seri'
  }
};

// Helper function to format time based on user preference
const formatTime = (timeStr, format) => {
  if (!timeStr) return '';
  if (format === '12-hour') {
    const [hoursStr, minutesStr] = timeStr.split(':');
    if (!hoursStr || !minutesStr) return timeStr; // Fallback for malformed data
    
    let h = parseInt(hoursStr, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12; // Convert 0 to 12, 13 to 1, etc.
    return `${h}:${minutesStr} ${ampm}`;
  }
  return timeStr; // Default is 24-hour format
};

export default function RoutinesScreen({ navigation }) {
  const { colors: c, state, dispatch } = useApp();
  const today = new Date();
  const isWakeUpTask = (task) => task.title?.trim().toLowerCase() === 'wake up';
  
  const currentLang = state.prefs?.language === 'Türkçe' ? 'Türkçe' : 'English';
  const t = translations[currentLang];
  
  // Get time format preference (default to 24-hour if not set)
  const timeFormatPref = state.prefs?.timeFormat || '24-hour';

  // --- DYNAMIC CALCULATIONS ---
  const routines = state.routines || [];
  
  // Highest active streak among all routines
  const dynamicCurrentStreak = routines.length > 0 
    ? Math.max(...routines.map(r => r.currentStreak || 0)) 
    : 0;

  // Sum of all best streaks across routines
  const dynamicTotalFlames = routines.reduce((total, r) => total + (r.bestStreak || 0), 0);

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <IconButton name="menu" onPress={() => openDrawer(navigation)} />
        <Text style={[styles.headerTitle, { color: c.text }]}>{t.routines}</Text>
        <IconButton name="flame-outline" lib="ion" onPress={() => navigation.navigate('Streaks')} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 40 }}>
        {/* Streak summary */}
        <View style={[styles.streakCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.streakSide}>
            <Text style={[styles.streakLabel, { color: c.textMuted }]}>{t.currentStreak}</Text>
            <View style={styles.streakValue}>
              <MaterialCommunityIcons name="fire" size={26} color={c.flame} />
              <Text style={[styles.streakNum, { color: c.text }]}>{dynamicCurrentStreak} {t.days}</Text>
            </View>
          </View>
          <View style={[styles.streakDivider, { backgroundColor: c.border }]} />
          <View style={[styles.streakSide, { alignItems: 'flex-end' }]}>
            <Text style={[styles.streakLabel, { color: c.textMuted }]}>{t.total}</Text>
            <View style={styles.streakValue}>
              <Text style={[styles.streakNum, { color: c.text }]}>{dynamicTotalFlames}</Text>
              <MaterialCommunityIcons name="fire" size={26} color={c.flame} />
            </View>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: c.textMuted }]}>
          {t.today} — {formatShort(today).toUpperCase()}
        </Text>

        {routines.map((r) => (
          <RoutineCard
            key={r.id}
            routine={r}
            c={c}
            t={t}
            timeFormatPref={timeFormatPref}
            onOpen={() => navigation.navigate('RoutineDetails', { routineId: r.id })}
            onCheck={() => {
              if (r.completedToday) return;
              if (!r.isMorningRoutine) {
                dispatch({ type: 'COMPLETE_ROUTINE', id: r.id });
                return;
              }
              const wakeUpCompleted = r.tasks.some((task) => isWakeUpTask(task) && task.done);
              if (wakeUpCompleted) {
                dispatch({ type: 'COMPLETE_ROUTINE', id: r.id });
                return;
              }
              navigation.navigate('Puzzle', { routineId: r.id });
            }}
          />
        ))}

        <Text style={[styles.sectionLabel, { color: c.textMuted, marginTop: spacing.lg }]}>{t.allRoutines}</Text>

        <Pressable
          onPress={() => navigation.navigate('AddRoutine')}
          style={({ pressed }) => [styles.addRoutine, { borderColor: c.primary }, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="add" size={22} color={c.primary} />
          <Text style={[styles.addRoutineText, { color: c.primary }]}>{t.addNew}</Text>
        </Pressable>

        <View style={styles.hint}>
          <MaterialCommunityIcons name="puzzle-outline" size={16} color={c.textMuted} />
          <Text style={[styles.hintText, { color: c.textMuted }]}>{t.hint}</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

function RoutineCard({ routine: r, c, t, timeFormatPref, onOpen, onCheck }) {
  const displayTime = formatTime(r.time, timeFormatPref);

  return (
    <Pressable
      onPress={onOpen}
      style={({ pressed }) => [styles.routineCard, { backgroundColor: r.color }, pressed && { opacity: 0.92 }]}
    >
      <View style={styles.routineIcon}>
        <Text style={{ fontSize: 22 }}>{r.emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.routineTitleRow}>
          <Text style={styles.routineTitle}>{r.title}</Text>
          {r.isMorningRoutine && (
            <View style={styles.morningBadge}>
              <Ionicons name="sunny-outline" size={12} color="#fff" />
              <Text style={styles.morningBadgeText}>{t.morning}</Text>
            </View>
          )}
        </View>
        <Text style={styles.routineMeta}>
          {displayTime} — {r.tasks.length} {t.tasks}
        </Text>
        <View style={styles.routineStreak}>
          <MaterialCommunityIcons name="fire" size={14} color="#fff" />
          <Text style={styles.routineStreakText}>{r.currentStreak} {t.dayStreak}</Text>
        </View>
      </View>
      <Pressable onPress={onCheck} hitSlop={10}>
        <View style={[styles.checkCircle, r.completedToday && styles.checkCircleDone]}>
          {r.completedToday && <Ionicons name="checkmark" size={18} color="#fff" />}
        </View>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  headerTitle: { fontSize: font.h3, fontWeight: '800' },
  streakCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.sm },
  streakSide: { flex: 1, gap: 6 },
  streakDivider: { width: 1, height: 40, marginHorizontal: spacing.md },
  streakLabel: { fontSize: font.tiny, fontWeight: '700', letterSpacing: 0.6 },
  streakValue: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  streakNum: { fontSize: font.h3, fontWeight: '800' },
  sectionLabel: { fontSize: font.small, fontWeight: '800', letterSpacing: 0.6, marginTop: spacing.xl, marginBottom: spacing.md },
  routineCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md },
  routineIcon: { width: 46, height: 46, borderRadius: radius.md, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  routineTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  routineTitle: { color: '#fff', fontSize: font.title, fontWeight: '800' },
  routineMeta: { color: 'rgba(255,255,255,0.9)', fontSize: font.small, marginTop: 2 },
  routineStreak: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  routineStreakText: { color: '#fff', fontSize: font.tiny, fontWeight: '600' },
  morningBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.24)' },
  morningBadgeText: { color: '#fff', fontSize: font.tiny, fontWeight: '700' },
  checkCircle: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.15)' },
  checkCircleDone: { backgroundColor: 'rgba(0,0,0,0.35)', borderColor: 'rgba(0,0,0,0.35)' },
  addRoutine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderStyle: 'dashed', borderRadius: radius.lg, paddingVertical: spacing.lg },
  addRoutineText: { fontSize: font.title, fontWeight: '700' },
  hint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: spacing.lg },
  hintText: { fontSize: font.small },
});