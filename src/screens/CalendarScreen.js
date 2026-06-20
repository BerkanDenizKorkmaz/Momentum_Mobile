import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, TextInput } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen, IconButton, Flame, openDrawer } from '../components/UI';
import { useApp } from '../state/AppContext';
// Removed WEEKDAYS and MONTHS from import, kept the utility functions
import { getMonthMatrix, getWeekDates, toISO, sameDay, formatLong } from '../utils/date';
import { spacing, radius, font } from '../theme';

// Define localized date strings
const LOCALIZED_DATES = {
  English: {
    WEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  },
  Türkçe: {
    WEEKDAYS: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
    MONTHS: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
  }
};

const translations = {
  English: {
    searchPlaceholder: 'Search tasks...',
    todo: 'TO DO',
    noTasks: 'No tasks for this day',
    layouts: { Year: 'Year', Month: 'Month', Week: 'Week', Day: 'Day' },
    calLayout: 'Calendar layout',
    filterTasks: 'Filter tasks',
    filters: { All: 'All', Active: 'Active', Done: 'Done' },
    scheduled: 'scheduled',
    taskStr: 'task',
    tasksStr: 'tasks'
  },
  Türkçe: {
    searchPlaceholder: 'Görev ara...',
    todo: 'YAPILACAKLAR',
    noTasks: 'Bugün için görev yok',
    layouts: { Year: 'Yıl', Month: 'Ay', Week: 'Hafta', Day: 'Gün' },
    calLayout: 'Takvim görünümü',
    filterTasks: 'Görevleri filtrele',
    filters: { All: 'Tümü', Active: 'Aktif', Done: 'Tamamlanan' },
    scheduled: 'planlandı',
    taskStr: 'görev',
    tasksStr: 'görev'
  }
};

const LAYOUTS_KEYS = ['Year', 'Month', 'Week', 'Day'];
const FILTER_KEYS = ['All', 'Active', 'Done'];

export default function CalendarScreen({ navigation }) {
  const { colors: c, state, dispatch } = useApp();
  const currentLang = state.prefs?.language === 'Türkçe' ? 'Türkçe' : 'English';
  const t = translations[currentLang];
  
  // Get the localized date arrays
  const localDays = LOCALIZED_DATES[currentLang].WEEKDAYS;
  const localMonths = LOCALIZED_DATES[currentLang].MONTHS;

  const today = new Date();
  const [cursor, setCursor] = useState(new Date()); 
  const [selected, setSelected] = useState(new Date());
  const [layoutOpen, setLayoutOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All'); 

  const layout = state.calendarLayout;

  const tasksByDay = useMemo(() => {
    const map = {};
    state.tasks.forEach((tsk) => {
      (map[tsk.date] = map[tsk.date] || []).push(tsk);
    });
    return map;
  }, [state.tasks]);

  const dayTasks = useMemo(() => {
    let list = (tasksByDay[toISO(selected)] || []).slice();
    if (filter === 'Active') list = list.filter((tsk) => !tsk.done);
    if (filter === 'Done') list = list.filter((tsk) => tsk.done);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((tsk) => tsk.title.toLowerCase().includes(q));
    }
    return list.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  }, [tasksByDay, selected, filter, query]);

  const shiftMonth = (delta) => setCursor((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  const shiftDay = (delta) => {
    const d = new Date(selected);
    d.setDate(d.getDate() + delta);
    setSelected(d);
    setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const todoLabel = sameDay(selected, today) ? (currentLang === 'Türkçe' ? 'Bugün' : 'Today') : formatLong(selected);
  const highestCurrentStreak = state.routines?.length > 0 
    ? Math.max(...state.routines.map(r => r.currentStreak || 0)) 
    : 0;

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <IconButton name="menu" onPress={() => openDrawer(navigation)} />
        <View style={styles.headerRight}>
          <IconButton name="search-outline" size={22} onPress={() => setSearchOpen((v) => !v)} />
          <IconButton name="filter-outline" size={22} onPress={() => setFilterOpen(true)} />
          <IconButton name="grid-outline" size={22} onPress={() => setLayoutOpen(true)} />
          <Pressable onPress={() => navigation.navigate('Streaks')} hitSlop={8}>
            <Flame count={highestCurrentStreak} size={22} />
          </Pressable>
        </View>
      </View>

      <View style={styles.monthRow}>
        <Pressable onPress={() => shiftMonth(-1)} hitSlop={10}><Ionicons name="chevron-back" size={22} color={c.textMuted} /></Pressable>
        {/* Pass localized month array here */}
        <Text style={[styles.monthTitle, { color: c.text }]}>{localMonths[cursor.getMonth()]} {cursor.getFullYear()}</Text>
        <Pressable onPress={() => shiftMonth(1)} hitSlop={10}><Ionicons name="chevron-forward" size={22} color={c.textMuted} /></Pressable>
      </View>

      {searchOpen && (
        <View style={[styles.searchBar, { backgroundColor: c.inputBg, borderColor: c.border }]}>
          <Ionicons name="search" size={18} color={c.textMuted} />
          <TextInput autoFocus placeholder={t.searchPlaceholder} placeholderTextColor={c.textFaint} value={query} onChangeText={setQuery} style={[styles.searchInput, { color: c.text }]} />
          {query ? <Pressable onPress={() => setQuery('')} hitSlop={8}><Ionicons name="close-circle" size={18} color={c.textMuted} /></Pressable> : null}
        </View>
      )}

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <CalendarView
          layout={layout} cursor={cursor} selected={selected} today={today} tasksByDay={tasksByDay}
          onSelect={(d) => { setSelected(d); setCursor(new Date(d.getFullYear(), d.getMonth(), 1)); }}
          onPickMonth={(m) => { setCursor(new Date(cursor.getFullYear(), m, 1)); dispatch({ type: 'SET_LAYOUT', layout: 'Month' }); }}
          c={c} t={t} localDays={localDays} localMonths={localMonths} // Pass localized data down
        />

        <View style={styles.todoHeader}>
          <Text style={[styles.todoTitle, { color: c.text }]}>{t.todo}</Text>
          <View style={styles.todoNav}>
            <Pressable onPress={() => shiftDay(-1)} hitSlop={8}><Ionicons name="chevron-back" size={20} color={c.textMuted} /></Pressable>
            <Text style={[styles.todoDate, { color: c.text }]}>{todoLabel}</Text>
            <Pressable onPress={() => shiftDay(1)} hitSlop={8}><Ionicons name="chevron-forward" size={20} color={c.textMuted} /></Pressable>
          </View>
        </View>

        {dayTasks.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={40} color={c.textFaint} />
            <Text style={[styles.emptyText, { color: c.textMuted }]}>{t.noTasks}</Text>
          </View>
        ) : (
          dayTasks.map((tsk) => (
            <TaskRow key={tsk.id} task={tsk} c={c}
              onToggle={() => dispatch({ type: 'TOGGLE_TASK', id: tsk.id })}
              onPress={() => navigation.navigate('AddTask', { taskId: tsk.id })}
              onDelete={() => dispatch({ type: 'DELETE_TASK', id: tsk.id })}
            />
          ))
        )}
      </ScrollView>

      <Pressable style={[styles.fab, { backgroundColor: c.primary }]} onPress={() => navigation.navigate('AddTask', { date: toISO(selected) })}>
        <Ionicons name="add" size={30} color="#fff" />
      </Pressable>

      <BottomMenu visible={layoutOpen} onClose={() => setLayoutOpen(false)} title={t.calLayout} c={c}>
        {LAYOUTS_KEYS.map((l) => (
          <Pressable key={l} style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: c.cardAlt }]}
            onPress={() => { dispatch({ type: 'SET_LAYOUT', layout: l }); setLayoutOpen(false); }}>
            <Ionicons name={layout === l ? 'checkbox' : 'square-outline'} size={22} color={layout === l ? c.primary : c.textMuted} />
            <Text style={[styles.menuText, { color: c.text }]}>{t.layouts[l]}</Text>
          </Pressable>
        ))}
      </BottomMenu>

      <BottomMenu visible={filterOpen} onClose={() => setFilterOpen(false)} title={t.filterTasks} c={c}>
        {FILTER_KEYS.map((f) => (
          <Pressable key={f} style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: c.cardAlt }]}
            onPress={() => { setFilter(f); setFilterOpen(false); }}>
            <Ionicons name={filter === f ? 'radio-button-on' : 'radio-button-off'} size={22} color={filter === f ? c.primary : c.textMuted} />
            <Text style={[styles.menuText, { color: c.text }]}>{t.filters[f]}</Text>
          </Pressable>
        ))}
      </BottomMenu>
    </Screen>
  );
}

// Added localDays and localMonths to props
function CalendarView({ layout, cursor, selected, today, tasksByDay, onSelect, onPickMonth, c, t, localDays, localMonths }) {
  if (layout === 'Year') {
    return (
      <View style={styles.yearGrid}>
        {localMonths.map((m, i) => (
          <Pressable key={m} style={[styles.yearCell, { borderColor: c.border }]} onPress={() => onPickMonth(i)}>
            <Text style={[styles.yearCellText, { color: i === today.getMonth() && cursor.getFullYear() === today.getFullYear() ? c.primary : c.text }]}>{m.slice(0, 3)}</Text>
          </Pressable>
        ))}
      </View>
    );
  }

  if (layout === 'Day') {
    const iso = toISO(selected);
    const has = (tasksByDay[iso] || []).length;
    return (
      <View style={styles.dayView}>
        <Text style={[styles.dayBig, { color: c.primary }]}>{selected.getDate()}</Text>
        <Text style={[styles.dayWeekday, { color: c.text }]}>{localDays[selected.getDay()]}, {localMonths[selected.getMonth()]}</Text>
        <Text style={[styles.dayCount, { color: c.textMuted }]}>{has} {has === 1 ? t.taskStr : t.tasksStr} {t.scheduled}</Text>
      </View>
    );
  }

  const weeks = layout === 'Week' ? [getWeekDates(selected)] : getMonthMatrix(cursor.getFullYear(), cursor.getMonth());

  // Reorder days if your matrix starts on Monday. 
  // If getMonthMatrix uses Monday=0, we need to map the headers appropriately.
  // Assuming Monday is the first day of the week in your UI layout:
  const headerDays = [localDays[1], localDays[2], localDays[3], localDays[4], localDays[5], localDays[6], localDays[0]];

  return (
    <View style={styles.calendar}>
      <View style={styles.weekRow}>
        {headerDays.map((d, index) => (<Text key={index} style={[styles.weekday, { color: c.textMuted }]}>{d.toUpperCase()}</Text>))}
      </View>
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((cell, ci) => {
            if (!cell) return <View key={ci} style={styles.dayCell} />;
            const d = cell.date;
            const isToday = sameDay(d, today);
            const isSel = sameDay(d, selected);
            const tasks = tasksByDay[toISO(d)] || [];
            return (
              <Pressable key={ci} style={styles.dayCell} onPress={() => onSelect(d)}>
                <View style={[ styles.dayInner, isSel && { backgroundColor: c.primary }, !isSel && isToday && { borderWidth: 1.5, borderColor: c.primary } ]}>
                  <Text style={[ styles.dayNum, { color: isSel ? '#fff' : isToday ? c.primary : c.text } ]}>{d.getDate()}</Text>
                </View>
                <View style={styles.dotsRow}>
                  {tasks.slice(0, 3).map((tsk, i) => (<View key={i} style={[styles.dot, { backgroundColor: isSel ? '#fff' : tsk.color }]} />))}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function TaskRow({ task, c, onToggle, onPress, onDelete }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [ styles.taskRow, { backgroundColor: c.card, borderColor: c.border }, pressed && { opacity: 0.85 } ]}>
      <View style={[styles.taskAccent, { backgroundColor: task.color }]} />
      <Pressable onPress={onToggle} hitSlop={8}>
        <Ionicons name={task.done ? 'checkmark-circle' : 'ellipse-outline'} size={26} color={task.done ? c.success : c.textFaint} />
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={[ styles.taskTitle, { color: c.text }, task.done && { textDecorationLine: 'line-through', color: c.textMuted } ]}>
          {task.emoji ? `${task.emoji} ` : ''}{task.title}
        </Text>
        {!!task.time && <Text style={[styles.taskTime, { color: c.textMuted }]}>{task.time}</Text>}
      </View>
      <Pressable onPress={onDelete} hitSlop={8}>
        <Ionicons name="trash-outline" size={20} color={c.textFaint} />
      </Pressable>
    </Pressable>
  );
}

export function BottomMenu({ visible, onClose, title, children, c }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: c.overlay }]} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: c.surface }]} onPress={() => {}}>
          <View style={[styles.sheetHandle, { backgroundColor: c.border }]} />
          {title ? <Text style={[styles.sheetTitle, { color: c.text }]}>{title}</Text> : null}
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg, paddingVertical: spacing.sm },
  monthTitle: { fontSize: font.h3, fontWeight: '800' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: spacing.lg, paddingHorizontal: spacing.md, height: 44, borderRadius: radius.md, borderWidth: 1, marginBottom: spacing.sm },
  searchInput: { flex: 1, fontSize: font.body },
  calendar: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  weekRow: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', fontSize: font.tiny, fontWeight: '700', marginBottom: spacing.xs },
  dayCell: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  dayInner: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  dayNum: { fontSize: font.body, fontWeight: '600' },
  dotsRow: { flexDirection: 'row', gap: 2, height: 8, marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  yearGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: spacing.sm, paddingTop: spacing.sm },
  yearCell: { width: '30%', flexGrow: 1, height: 64, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  yearCellText: { fontSize: font.title, fontWeight: '700' },
  dayView: { alignItems: 'center', paddingVertical: spacing.xxl },
  dayBig: { fontSize: 72, fontWeight: '800' },
  dayWeekday: { fontSize: font.h3, fontWeight: '700', marginTop: spacing.xs },
  dayCount: { fontSize: font.body, marginTop: spacing.sm },
  todoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.md },
  todoTitle: { fontSize: font.title, fontWeight: '800', letterSpacing: 0.5 },
  todoNav: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  todoDate: { fontSize: font.small, fontWeight: '700', minWidth: 64, textAlign: 'center' },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginHorizontal: spacing.lg, marginBottom: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, overflow: 'hidden' },
  taskAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
  taskTitle: { fontSize: font.body, fontWeight: '600' },
  taskTime: { fontSize: font.small, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyText: { fontSize: font.body },
  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.xl, width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxl },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.md },
  sheetTitle: { fontSize: font.title, fontWeight: '800', marginBottom: spacing.md },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.sm, borderRadius: radius.md },
  menuText: { fontSize: font.title, fontWeight: '600' },
});