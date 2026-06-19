import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, TextInput } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen, IconButton } from '../components/UI';
import { BottomMenu } from './CalendarScreen';
import { useApp } from '../state/AppContext';
import { spacing, radius, font } from '../theme';

const translations = {
  English: {
    notFound: 'Routine not found.',
    schedule: 'SCHEDULE',
    current: 'current',
    best: 'best',
    tasks: 'TASKS',
    addTask: 'Add task',
    progress: "TODAY'S PROGRESS",
    options: 'Routine options',
    edit: 'Edit',
    rename: 'Rename',
    delete: 'Delete',
    renameRoutine: 'Rename routine',
    cancel: 'Cancel',
    save: 'Save',
    addNewTask: 'Add new task',
    taskName: 'Task name',
    minutes: 'Minutes'
  },
  Türkçe: {
    notFound: 'Rutin bulunamadı.',
    schedule: 'PROGRAM',
    current: 'mevcut',
    best: 'en iyi',
    tasks: 'GÖREVLER',
    addTask: 'Görev ekle',
    progress: 'BUGÜNKÜ İLERLEME',
    options: 'Rutin seçenekleri',
    edit: 'Düzenle',
    rename: 'Yeniden adlandır',
    delete: 'Sil',
    renameRoutine: 'Rutini yeniden adlandır',
    cancel: 'İptal',
    save: 'Kaydet',
    addNewTask: 'Yeni görev ekle',
    taskName: 'Görev adı',
    minutes: 'Dakika'
  }
};

export default function RoutineDetailsScreen({ navigation, route }) {
  const { colors: c, state, dispatch } = useApp();
  const routine = state.routines.find((r) => r.id === route.params?.routineId);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [name, setName] = useState(routine?.title || '');
  const [taskName, setTaskName] = useState('');
  const [taskMinutes, setTaskMinutes] = useState('5');

  const currentLang = state.prefs?.language === 'Türkçe' ? 'Türkçe' : 'English';
  const t = translations[currentLang];

  if (!routine) {
    return (
      <Screen>
        <IconButton name="chevron-back" onPress={() => navigation.goBack()} />
        <Text style={{ color: c.text, textAlign: 'center', marginTop: 40 }}>{t.notFound}</Text>
      </Screen>
    );
  }

  const doneCount = routine.tasks.filter((tsk) => tsk.done).length;
  const progress = routine.tasks.length ? doneCount / routine.tasks.length : 0;
  const isWakeUpTask = (task) => task.title?.trim().toLowerCase() === 'wake up';

  const addTask = () => {
    const minutes = parseInt(taskMinutes, 10);
    const safeMinutes = Number.isFinite(minutes) && minutes > 0 ? minutes : 5;
    const title = taskName.trim();
    if (!title) return;

    dispatch({
      type: 'ADD_ROUTINE_TASK',
      routineId: routine.id,
      task: { id: 'rt' + Date.now(), title, duration: `${safeMinutes} min`, done: false },
    });
    setTaskName('');
    setTaskMinutes('5');
    setAddTaskOpen(false);
  };

  const toggleTask = (task) => {
    const isMorning = Boolean(routine.isMorningRoutine);
    const wakeUpDoneBefore = routine.tasks.some((tsk) => isWakeUpTask(tsk) && tsk.done);
    const willBeDone = !task.done;
    const willDoneCount = doneCount + (task.done ? -1 : 1);
    const willCompleteRoutine = routine.tasks.length > 0 && willDoneCount === routine.tasks.length;

    dispatch({ type: 'TOGGLE_ROUTINE_TASK', routineId: routine.id, taskId: task.id });

    if (!isMorning || routine.completedToday || !willBeDone) return;

    const shouldRedirectToPuzzle = isWakeUpTask(task) || (willCompleteRoutine && !wakeUpDoneBefore);
    if (shouldRedirectToPuzzle) {
      navigation.navigate('Puzzle', {
        routineId: routine.id,
        cancelAction: { type: 'toggle_routine_task', routineId: routine.id, taskId: task.id },
      });
    }
  };

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <IconButton name="chevron-back" onPress={() => navigation.goBack()} />
        <Text style={[styles.headerTitle, { color: c.text }]} numberOfLines={1}>{routine.title}</Text>
        <IconButton name="ellipsis-horizontal" onPress={() => setMenuOpen(true)} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}>
        {/* Schedule */}
        <View style={[styles.scheduleCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
            <View style={[styles.scheduleIcon, { backgroundColor: routine.color }]}>
              <Ionicons name="time-outline" size={20} color="#fff" />
            </View>
            <View>
              <Text style={[styles.scheduleLabel, { color: c.textMuted }]}>{t.schedule}</Text>
              <Text style={[styles.scheduleValue, { color: c.text }]}>{routine.time}</Text>
              <Text style={[styles.scheduleDays, { color: c.textMuted }]}>{routine.days}</Text>
            </View>
          </View>
          <View style={{ gap: 6 }}>
            <View style={styles.flameRow}>
              <MaterialCommunityIcons name="fire" size={18} color={c.flame} />
              <Text style={[styles.flameText, { color: c.text }]}>{routine.currentStreak} {t.current}</Text>
            </View>
            <View style={styles.flameRow}>
              <MaterialCommunityIcons name="trophy-outline" size={18} color={c.textMuted} />
              <Text style={[styles.flameText, { color: c.text }]}>{routine.bestStreak} {t.best}</Text>
            </View>
          </View>
        </View>

        {/* Tasks header */}
        <View style={styles.tasksHeader}>
          <Text style={[styles.tasksTitle, { color: c.text }]}>{t.tasks} — {routine.tasks.length}</Text>
        </View>

        {routine.tasks.map((tsk) => (
          <Pressable key={tsk.id} onPress={() => toggleTask(tsk)} style={[styles.taskRow, { backgroundColor: c.card, borderColor: c.border }]}>
            <Ionicons name={tsk.done ? 'checkmark-circle' : 'ellipse-outline'} size={26} color={tsk.done ? c.success : c.textFaint} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.taskTitle, { color: c.text }, tsk.done && { color: c.textMuted, textDecorationLine: 'line-through' }]}>
                {tsk.title}
              </Text>
              <Text style={[styles.taskDuration, { color: c.textMuted }]}>{tsk.duration}</Text>
            </View>
          </Pressable>
        ))}

        <Pressable onPress={() => setAddTaskOpen(true)} style={[styles.addTask, { borderColor: c.border }]}>
          <Ionicons name="add" size={20} color={c.textMuted} />
          <Text style={[styles.addTaskText, { color: c.textMuted }]}>{t.addTask}</Text>
        </Pressable>

        {/* Progress */}
        <Text style={[styles.progressLabel, { color: c.text }]}>{t.progress}</Text>
        <View style={styles.progressRow}>
          <View style={[styles.progressTrack, { backgroundColor: c.cardAlt }]}>
            <View style={[styles.progressFill, { backgroundColor: routine.color, width: `${progress * 100}%` }]} />
          </View>
          <Text style={[styles.progressText, { color: c.text }]}>{doneCount}/{routine.tasks.length}</Text>
        </View>
      </ScrollView>

      {/* Edit / Delete / Rename popup */}
      <BottomMenu visible={menuOpen} onClose={() => setMenuOpen(false)} title={t.options} c={c}>
        <MenuItem icon="create-outline" label={t.edit} c={c} onPress={() => { setMenuOpen(false); navigation.navigate('AddRoutine', { routineId: routine.id }); }} />
        <MenuItem icon="text-outline" label={t.rename} c={c} onPress={() => { setMenuOpen(false); setName(routine.title); setRenameOpen(true); }} />
        <MenuItem icon="trash-outline" label={t.delete} color={c.danger} c={c} onPress={() => { setMenuOpen(false); dispatch({ type: 'DELETE_ROUTINE', id: routine.id }); navigation.goBack(); }} />
      </BottomMenu>

      {/* Rename modal */}
      <Modal visible={renameOpen} transparent animationType="fade" onRequestClose={() => setRenameOpen(false)}>
        <Pressable style={[styles.overlay, { backgroundColor: c.overlay }]} onPress={() => setRenameOpen(false)}>
          <Pressable style={[styles.renameCard, { backgroundColor: c.surface }]} onPress={() => {}}>
            <Text style={[styles.renameTitle, { color: c.text }]}>{t.renameRoutine}</Text>
            <TextInput value={name} onChangeText={setName} autoFocus style={[styles.renameInput, { color: c.text, borderColor: c.border, backgroundColor: c.inputBg }]} />
            <View style={styles.renameActions}>
              <Pressable onPress={() => setRenameOpen(false)}><Text style={[styles.renameCancel, { color: c.textMuted }]}>{t.cancel}</Text></Pressable>
              <Pressable onPress={() => { dispatch({ type: 'UPDATE_ROUTINE', id: routine.id, patch: { title: name } }); setRenameOpen(false); }}>
                <Text style={[styles.renameSave, { color: c.primary }]}>{t.save}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Add Task Modal */}
      <Modal visible={addTaskOpen} transparent animationType="fade" onRequestClose={() => setAddTaskOpen(false)}>
        <Pressable style={[styles.overlay, { backgroundColor: c.overlay }]} onPress={() => setAddTaskOpen(false)}>
          <Pressable style={[styles.renameCard, { backgroundColor: c.surface }]} onPress={() => {}}>
            <Text style={[styles.renameTitle, { color: c.text }]}>{t.addNewTask}</Text>
            <TextInput value={taskName} onChangeText={setTaskName} autoFocus placeholder={t.taskName} placeholderTextColor={c.textFaint} style={[styles.renameInput, { color: c.text, borderColor: c.border, backgroundColor: c.inputBg }]} />
            <TextInput value={taskMinutes} onChangeText={setTaskMinutes} keyboardType="numeric" maxLength={3} placeholder={t.minutes} placeholderTextColor={c.textFaint} style={[styles.renameInput, { color: c.text, borderColor: c.border, backgroundColor: c.inputBg, marginTop: spacing.sm }]} />
            <View style={styles.renameActions}>
              <Pressable onPress={() => setAddTaskOpen(false)}><Text style={[styles.renameCancel, { color: c.textMuted }]}>{t.cancel}</Text></Pressable>
              <Pressable onPress={addTask}><Text style={[styles.renameSave, { color: c.primary }]}>{t.save}</Text></Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

function MenuItem({ icon, label, color, c, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.menuItem, pressed && { backgroundColor: c.cardAlt }]}>
      <Ionicons name={icon} size={22} color={color || c.text} />
      <Text style={[styles.menuItemText, { color: color || c.text }]}>{label}</Text>
    </Pressable>
  );
}

// ... styles remain the same
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: font.h3, fontWeight: '800' },
  scheduleCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg },
  scheduleIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  scheduleLabel: { fontSize: font.tiny, fontWeight: '700', letterSpacing: 0.6 },
  scheduleValue: { fontSize: font.h3, fontWeight: '800' },
  scheduleDays: { fontSize: font.small },
  flameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  flameText: { fontSize: font.small, fontWeight: '600' },
  tasksHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.md },
  tasksTitle: { fontSize: font.title, fontWeight: '800' },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  taskTitle: { fontSize: font.body, fontWeight: '600' },
  taskDuration: { fontSize: font.small, marginTop: 2 },
  addTask: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderStyle: 'dashed', borderRadius: radius.md, paddingVertical: spacing.md, marginTop: spacing.xs },
  addTaskText: { fontSize: font.body, fontWeight: '600' },
  progressLabel: { fontSize: font.small, fontWeight: '800', marginTop: spacing.xl, marginBottom: spacing.sm },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  progressTrack: { flex: 1, height: 14, borderRadius: 7, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 7 },
  progressText: { fontSize: font.body, fontWeight: '800' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.sm, borderRadius: radius.md },
  menuItemText: { fontSize: font.title, fontWeight: '600' },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  renameCard: { width: '100%', borderRadius: radius.lg, padding: spacing.lg },
  renameTitle: { fontSize: font.title, fontWeight: '800', marginBottom: spacing.md },
  renameInput: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, height: 48, fontSize: font.body },
  renameActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.xl, marginTop: spacing.lg },
  renameCancel: { fontSize: font.title, fontWeight: '600' },
  renameSave: { fontSize: font.title, fontWeight: '800' },
});