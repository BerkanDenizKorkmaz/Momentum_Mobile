import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/UI';
import { useApp } from '../state/AppContext';
import { ROUTINE_COLORS, spacing, radius, font } from '../theme';
import { WEEKDAYS } from '../utils/date';
import { useSubscription } from '../state/AppContext'; 

const translations = {
  English: {
    editRoutine: 'Edit Routine',
    addRoutine: 'Add Routine',
    save: 'Save',
    addTitle: 'Add Title',
    routineDays: 'Routine Days',
    everyDay: 'Every day',
    selectDays: 'Select days',
    morningRoutine: 'Morning routine',
    markAsMorning: 'Mark as morning routine',
    morningExists: 'Morning routine already exists',
    onlyOneMorning: 'Only one morning routine can be added.',
    morningHintTrue: 'A morning routine already exists.',
    morningHintFalse: 'Turn this on to make this the one morning routine.',
    time: 'Time',
    timeHint: 'e.g. 07:00',
    color: 'Color',
    wakeUp: 'Wake Up',
    limitMessage: 'Plan limit reached. Upgrade to add more.',
    buyPremium: 'Buy Premium'
  },
  Türkçe: {
    editRoutine: 'Rutini Düzenle',
    addRoutine: 'Rutin Ekle',
    save: 'Kaydet',
    addTitle: 'Başlık Ekle',
    routineDays: 'Rutin Günleri',
    everyDay: 'Her gün',
    selectDays: 'Gün seç',
    morningRoutine: 'Sabah rutini',
    markAsMorning: 'Sabah rutini olarak işaretle',
    morningExists: 'Sabah rutini zaten mevcut',
    onlyOneMorning: 'Sadece bir sabah rutini eklenebilir.',
    morningHintTrue: 'Bir sabah rutini zaten var.',
    morningHintFalse: 'Bunu tek sabah rutini yapmak için açın.',
    time: 'Zaman',
    timeHint: 'örn. 07:00',
    color: 'Renk',
    wakeUp: 'Uyan',
    limitMessage: 'Plan sınırına ulaşıldı. Daha fazlası için yükseltin.',
    buyPremium: 'Premium Al'
  }
};

const EMOJIS = ['🌅', '💪', '🌙', '🧘', '📖', '🏃', '🥗', '🎯', '💧', '🛏️'];

export default function AddRoutineScreen({ navigation, route }) {
  const { colors: c, state, dispatch } = useApp();
  const { canAddRoutine } = useSubscription();
  const currentLang = state.prefs?.language === 'Türkçe' ? 'Türkçe' : 'English';
  const t = translations[currentLang];

  const editing = route.params?.routineId ? state.routines.find((r) => r.id === route.params.routineId) : null;
  const hasMorningRoutine = state.routines.some((r) => r.isMorningRoutine && r.id !== editing?.id);

  const [title, setTitle] = useState(editing?.title || '');
  const [emoji, setEmoji] = useState(editing?.emoji || '🌅');
  const [time, setTime] = useState(editing?.time || '');
  const [color, setColor] = useState(editing?.color || ROUTINE_COLORS[0]);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [isMorningRoutine, setIsMorningRoutine] = useState(Boolean(editing?.isMorningRoutine));
  
  // Gizli metin uyarısı için state
  const [showPremiumWarning, setShowPremiumWarning] = useState(false);
  
  const [days, setDays] = useState(() => {
    if (!editing) return [];
    if (editing.days === 'Every day' || editing.days === 'Her gün') return [...WEEKDAYS];
    return editing.days.split(',').map((d) => d.trim());
  });

  const toggleDay = (d) => setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));
  const daysLabel = days.length === 7 ? t.everyDay : days.length ? days.join(', ') : t.selectDays;

  const onSave = () => {
    if (!title.trim()) { navigation.goBack(); return; }
    
    // Abonelik Limit Kontrolü - Alert yerine gizli metni gösterir
    if (!editing) {
      if (!canAddRoutine(state.routines.length)) {
        setShowPremiumWarning(true);
        // İsteğe bağlı: Uyarıyı 5 saniye sonra ekrandan silmek istersen
        setTimeout(() => setShowPremiumWarning(false), 5000);
        return;
      }
    }
    
    const patch = {
      title, emoji, time: time || '08:00', color,
      days: (daysLabel === 'Select days' || daysLabel === 'Gün seç') ? t.everyDay : daysLabel,
      isMorningRoutine: editing ? Boolean(editing.isMorningRoutine) : isMorningRoutine,
    };

    if (editing) {
      dispatch({ type: 'UPDATE_ROUTINE', id: editing.id, patch });
    } else {
      const now = Date.now();
      dispatch({
        type: 'ADD_ROUTINE',
        routine: {
          id: 'r' + now, ...patch, currentStreak: 0, bestStreak: 0, completedToday: false,
          tasks: isMorningRoutine ? [{ id: `rt${now}-wake`, title: t.wakeUp, duration: '15 min', done: false }] : [],
        },
      });
    }
    navigation.goBack();
  };

  return (
    <Screen>
      {/* Header */}
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="close" size={28} color={c.text} />
        </Pressable>
        <Text style={[styles.topTitle, { color: c.text }]}>{editing ? t.editRoutine : t.addRoutine}</Text>
        <Pressable onPress={onSave} style={[styles.saveBtn, { backgroundColor: c.primary }]}>
          <Text style={styles.saveText}>{t.save}</Text>
        </Pressable>
      </View>

      {/* Kaydet butonuna basıldığında limit aşıldıysa beliren gizli metin */}
      {showPremiumWarning && (
        <Pressable 
          style={[styles.warningBanner, { backgroundColor: c.flame + '1A', borderColor: c.flame }]}
          onPress={() => navigation.navigate('Premium')}
        >
          <Text style={[styles.warningText, { color: c.flame }]}>
            {t.limitMessage}{' '}
            <Text style={{ fontWeight: '800', textDecorationLine: 'underline' }}>{t.buyPremium}</Text>
          </Text>
        </Pressable>
      )}

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 60 }}>
        {/* Title & Emoji */}
        <View style={[styles.titleRow, { backgroundColor: c.inputBg, borderColor: c.border }]}>
          <Pressable onPress={() => setEmojiOpen((v) => !v)} style={[styles.emojiBtn, { borderColor: c.border }]}>
            <Text style={{ fontSize: 22 }}>{emoji}</Text>
          </Pressable>
          <TextInput placeholder={t.addTitle} placeholderTextColor={c.textFaint} value={title} onChangeText={setTitle} style={[styles.titleInput, { color: c.text }]} />
        </View>
        
        {emojiOpen && (
          <View style={styles.emojiPicker}>
            {EMOJIS.map((e) => (
              <Pressable key={e} onPress={() => { setEmoji(e); setEmojiOpen(false); }} style={[styles.emojiOption, { backgroundColor: emoji === e ? c.primarySoft : c.cardAlt }]}>
                <Text style={{ fontSize: 22 }}>{e}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Days Selection */}
        <Text style={[styles.label, { color: c.textMuted }]}>{t.routineDays}</Text>
        <View style={styles.daysRow}>
          {WEEKDAYS.map((d) => {
            const active = days.includes(d);
            return (
              <Pressable key={d} onPress={() => toggleDay(d)} style={[styles.dayDot, { backgroundColor: active ? c.primary : c.cardAlt, borderColor: active ? c.primary : c.border }]}>
                <Text style={[styles.dayDotText, { color: active ? '#fff' : c.textMuted }]}>{d[0]}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={[styles.daysLabel, { color: c.text }]}>{daysLabel}</Text>

        {/* Morning Routine Toggle */}
        {!editing && (
          <>
            <Text style={[styles.label, { color: c.textMuted }]}>{t.morningRoutine}</Text>
            <Pressable
              onPress={() => {
                // Not: Burada da istersen alert yerine custom bir uyarı ekleyebilirsin
                if (hasMorningRoutine) return;
                setIsMorningRoutine((v) => !v);
              }}
              style={[ styles.toggleRow, { backgroundColor: c.inputBg, borderColor: c.border, opacity: hasMorningRoutine ? 0.65 : 1 } ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.toggleTitle, { color: c.text }]}>{t.markAsMorning}</Text>
                <Text style={[styles.toggleHint, { color: c.textMuted }]}>{hasMorningRoutine ? t.morningHintTrue : t.morningHintFalse}</Text>
              </View>
              <Switch
                value={isMorningRoutine}
                onValueChange={(value) => {
                  if (hasMorningRoutine) return;
                  setIsMorningRoutine(value);
                }}
                disabled={hasMorningRoutine} trackColor={{ false: c.border, true: c.primarySoft }} thumbColor={isMorningRoutine ? c.primary : '#f4f4f4'}
              />
            </Pressable>
          </>
        )}

        {/* Time & Color */}
        <Text style={[styles.label, { color: c.textMuted }]}>{t.time}</Text>
        <View style={[styles.field, { backgroundColor: c.inputBg, borderColor: c.border }]}>
          <Ionicons name="time-outline" size={20} color={c.textMuted} />
          <TextInput placeholder={t.timeHint} placeholderTextColor={c.textFaint} value={time} onChangeText={setTime} style={[styles.fieldInput, { color: c.text }]} />
        </View>

        <Text style={[styles.label, { color: c.textMuted }]}>{t.color}</Text>
        <View style={styles.colorRow}>
          {ROUTINE_COLORS.map((col) => (
            <Pressable key={col} onPress={() => setColor(col)}>
              <View style={[styles.colorSwatch, { backgroundColor: col }]}>
                {color === col && <Ionicons name="checkmark" size={18} color="#fff" />}
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  topTitle: { fontSize: font.h3, fontWeight: '800' },
  saveBtn: { paddingHorizontal: spacing.lg, paddingVertical: 8, borderRadius: radius.pill },
  saveText: { color: '#fff', fontWeight: '700', fontSize: font.body },
  
  // Uyarı Kutusu Stilleri
  warningBanner: { 
    marginHorizontal: spacing.lg, 
    paddingVertical: spacing.sm, 
    paddingHorizontal: spacing.md, 
    borderRadius: radius.md, 
    borderWidth: 1, 
    marginBottom: spacing.xs,
    alignItems: 'center' 
  },
  warningText: { 
    fontSize: font.small, 
    fontWeight: '600', 
    textAlign: 'center' 
  },

  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderRadius: radius.md, padding: spacing.sm },
  emojiBtn: { width: 44, height: 44, borderRadius: radius.sm, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  titleInput: { flex: 1, fontSize: font.title, fontWeight: '600' },
  emojiPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  emojiOption: { width: 46, height: 46, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: font.small, fontWeight: '700', marginBottom: spacing.sm, marginTop: spacing.xl },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayDot: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  dayDotText: { fontSize: font.body, fontWeight: '700' },
  daysLabel: { fontSize: font.small, fontWeight: '600', marginTop: spacing.sm },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, marginTop: spacing.xs },
  toggleTitle: { fontSize: font.body, fontWeight: '700' },
  toggleHint: { fontSize: font.small, marginTop: 2 },
  field: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, height: 52 },
  fieldInput: { flex: 1, fontSize: font.body },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.xs },
  colorSwatch: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});