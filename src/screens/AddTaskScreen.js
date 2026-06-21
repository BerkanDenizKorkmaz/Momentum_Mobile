import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/UI';
import { useApp } from '../state/AppContext';
import { ROUTINE_COLORS, spacing, radius, font } from '../theme';

// Helper to ensure we always have a valid date string
const toISO = (date) => date.toISOString().slice(0, 10);

// Fallbacks to prevent crashes if imports are missing
import { WEEKDAYS as IMPORTED_WEEKDAYS, MONTHS as IMPORTED_MONTHS } from '../utils/date';
const WEEKDAYS = IMPORTED_WEEKDAYS || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = IMPORTED_MONTHS || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const translations = {
  English: {
    editTask: 'Edit Task',
    addTask: 'Add Task',
    save: 'Save',
    addTitle: 'Add Title',
    taskDesc: 'Task Description',
    addDetails: 'Add details...',
    taskDay: 'Task Day',
    time: 'Time',
    timeHint: 'e.g. 14:30',
    color: 'Color'
  },
  Türkçe: {
    editTask: 'Görevi Düzenle',
    addTask: 'Görev Ekle',
    save: 'Kaydet',
    addTitle: 'Başlık Ekle',
    taskDesc: 'Görev Açıklaması',
    addDetails: 'Detayları ekle...',
    taskDay: 'Görev Günü',
    time: 'Zaman',
    timeHint: 'örn. 14:30',
    color: 'Renk'
  }
};

const EMOJIS = ['📝', '👥', '🏋️', '📚', '💼', '🛒', '☕', '🎯', '📞', '🎨'];

export default function AddTaskScreen({ navigation, route }) {
  const { colors: c, state, dispatch } = useApp();
  
  // Safe param access
  const taskId = route?.params?.taskId;
  const editing = taskId ? state.tasks.find((t) => t.id === taskId) : null;

  const currentLang = state.prefs?.language === 'Türkçe' ? 'Türkçe' : 'English';
  const t = translations[currentLang];

  const [title, setTitle] = useState(editing?.title || '');
  const [emoji, setEmoji] = useState(editing?.emoji || '📝');
  const [desc, setDesc] = useState(editing?.description || '');
  const [date, setDate] = useState(editing?.date || route?.params?.date || toISO(new Date()));
  const [time, setTime] = useState(editing?.time || '');
  const [color, setColor] = useState(editing?.color || ROUTINE_COLORS[0]);
  const [emojiOpen, setEmojiOpen] = useState(false);

  const upcoming = useMemo(() => {
    const start = new Date();
    return Array.from({ length: 21 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, []);

  const onSave = () => {
    if (!title.trim()) {
      navigation.goBack();
      return;
    }
    if (editing) {
      dispatch({
        type: 'UPDATE_TASK',
        id: editing.id,
        patch: { title, emoji, description: desc, date, time, color },
      });
    } else {
      dispatch({
        type: 'ADD_TASK',
        task: {
          id: 'k' + Date.now(),
          title,
          emoji,
          description: desc,
          date,
          time,
          color,
          done: false,
        },
      });
    }
    navigation.goBack();
  };

  return (
    <Screen>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="close" size={28} color={c.text} />
        </Pressable>
        <Text style={[styles.topTitle, { color: c.text }]}>
          {editing ? t.editTask : t.addTask}
        </Text>
        <Pressable
          onPress={onSave}
          style={[styles.saveBtn, { backgroundColor: c.primary }]}
        >
          <Text style={styles.saveText}>{t.save}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 60 }}>
        {/* Title & Emoji */}
        <View style={[styles.titleRow, { backgroundColor: c.inputBg, borderColor: c.border }]}>
          <Pressable
            onPress={() => setEmojiOpen((v) => !v)}
            style={[styles.emojiBtn, { borderColor: c.border }]}
          >
            <Text style={{ fontSize: 22 }}>{emoji}</Text>
          </Pressable>
          <TextInput
            placeholder={t.addTitle}
            placeholderTextColor={c.textFaint}
            value={title}
            onChangeText={setTitle}
            style={[styles.titleInput, { color: c.text }]}
          />
        </View>
        
        {emojiOpen ? (
          <View style={styles.emojiPicker}>
            {EMOJIS.map((e) => (
              <Pressable
                key={e}
                onPress={() => { setEmoji(e); setEmojiOpen(false); }}
                style={[styles.emojiOption, { backgroundColor: emoji === e ? c.primarySoft : c.cardAlt }]}
              >
                <Text style={{ fontSize: 22 }}>{e}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <Field label={t.taskDesc} c={c}>
          <TextInput
            placeholder={t.addDetails}
            placeholderTextColor={c.textFaint}
            value={desc}
            onChangeText={setDesc}
            multiline
            style={[styles.fieldInput, { color: c.text, minHeight: 60, textAlignVertical: 'top' }]}
          />
        </Field>

        <Text style={[styles.label, { color: c.textMuted }]}>{t.taskDay}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
          <View style={{ flexDirection: 'row', gap: spacing.sm, paddingRight: spacing.lg }}>
            {upcoming.map((d) => {
              const iso = toISO(d);
              const active = iso === date;
              return (
                <Pressable
                  key={iso}
                  onPress={() => setDate(iso)}
                  style={[
                    styles.dayChip,
                    { backgroundColor: active ? c.primary : c.cardAlt, borderColor: active ? c.primary : c.border },
                  ]}
                >
                  <Text style={[styles.dayChipDow, { color: active ? '#fff' : c.textMuted }]}>
                    {WEEKDAYS[(d.getDay() + 6) % 7].toUpperCase()}
                  </Text>
                  <Text style={[styles.dayChipNum, { color: active ? '#fff' : c.text }]}>{d.getDate()}</Text>
                  <Text style={[styles.dayChipMon, { color: active ? '#fff' : c.textMuted }]}>
                    {MONTHS[d.getMonth()].slice(0, 3)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <Field label={t.time} c={c} icon="time-outline">
          <TextInput
            placeholder={t.timeHint}
            placeholderTextColor={c.textFaint}
            value={time}
            onChangeText={setTime}
            style={[styles.fieldInput, { color: c.text }]}
          />
        </Field>

        <Text style={[styles.label, { color: c.textMuted }]}>{t.color}</Text>
        <View style={styles.colorRow}>
          {ROUTINE_COLORS.map((col) => (
            <Pressable key={col} onPress={() => setColor(col)} style={styles.colorWrap}>
              <View style={[styles.colorSwatch, { backgroundColor: col }]}>
                {color === col ? <Ionicons name="checkmark" size={18} color="#fff" /> : null}
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

function Field({ label, icon, children, c }) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={[styles.label, { color: c.textMuted }]}>{label}</Text>
      <View style={[styles.field, { backgroundColor: c.inputBg, borderColor: c.border }]}>
        {icon ? <Ionicons name={icon} size={20} color={c.textMuted} style={{ marginRight: 8 }} /> : null}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  topTitle: { fontSize: font.h3, fontWeight: '800' },
  saveBtn: { paddingHorizontal: spacing.lg, paddingVertical: 8, borderRadius: radius.pill },
  saveText: { color: '#fff', fontWeight: '700', fontSize: font.body },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderRadius: radius.md, padding: spacing.sm },
  emojiBtn: { width: 44, height: 44, borderRadius: radius.sm, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  titleInput: { flex: 1, fontSize: font.title, fontWeight: '600' },
  emojiPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  emojiOption: { width: 46, height: 46, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: font.small, fontWeight: '700', marginBottom: spacing.sm, marginTop: spacing.md },
  field: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, minHeight: 52 },
  fieldInput: { flex: 1, fontSize: font.body, paddingVertical: spacing.md },
  dayChip: { width: 60, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, alignItems: 'center' },
  dayChipDow: { fontSize: font.tiny, fontWeight: '700' },
  dayChipNum: { fontSize: font.h3, fontWeight: '800', marginVertical: 2 },
  dayChipMon: { fontSize: font.tiny, fontWeight: '600' },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.xs },
  colorSwatch: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});