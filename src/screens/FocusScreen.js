import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Modal, ScrollView, Platform, StatusBar } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { Screen, IconButton, openDrawer } from '../components/UI';
import { BottomMenu } from './CalendarScreen';
import { useApp } from '../state/AppContext';
import { spacing, radius, font, ROUTINE_COLORS } from '../theme';

const translations = {
  English: {
    modes: { f1: 'Deep Work', f2: 'Pomodoro', f3: 'Short Break', f4: 'Reading' },
    done: 'Done!',
    focusing: 'Focusing...',
    ready: 'Ready',
    sessions: 'Sessions today',
    focusTime: 'Focus time',
    options: 'Focus mode options',
    rename: 'Rename',
    changeTime: 'Change time',
    delete: 'Delete',
    renameMode: 'Rename focus mode',
    cancel: 'Cancel',
    save: 'Save',
    changeTimeMins: 'Change time (minutes)'
  },
  Türkçe: {
    modes: { f1: 'Derin Çalışma', f2: 'Pomodoro', f3: 'Kısa Mola', f4: 'Okuma' },
    done: 'Bitti!',
    focusing: 'Odaklanılıyor...',
    ready: 'Hazır',
    sessions: 'Bugünkü oturumlar',
    focusTime: 'Odak süresi',
    options: 'Odak modu seçenekleri',
    rename: 'Yeniden adlandır',
    changeTime: 'Süreyi değiştir',
    delete: 'Sil',
    renameMode: 'Odak modunu yeniden adlandır',
    cancel: 'İptal',
    save: 'Kaydet',
    changeTimeMins: 'Süreyi değiştir (dakika)'
  }
};

const getModes = (t) => [
  { id: 'f1', name: t.modes.f1, icon: 'brain', minutes: 30, color: ROUTINE_COLORS[2] },
  { id: 'f2', name: t.modes.f2, icon: 'timer', minutes: 25, color: ROUTINE_COLORS[0] },
  { id: 'f3', name: t.modes.f3, icon: 'coffee', minutes: 5, color: ROUTINE_COLORS[1] },
  { id: 'f4', name: t.modes.f4, icon: 'book-open-variant', minutes: 20, color: ROUTINE_COLORS[3] },
];

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function FocusScreen({ navigation }) {
  const { colors: c, state } = useApp();
  const currentLang = state.prefs?.language === 'Türkçe' ? 'Türkçe' : 'English';
  const t = translations[currentLang];
  
  const [modes, setModes] = useState(getModes(t));
  const [activeId, setActiveId] = useState('f1');
  const active = modes.find((m) => m.id === activeId) || modes[0];

  const [remaining, setRemaining] = useState(active.minutes * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameVal, setRenameVal] = useState('');
  const [timeOpen, setTimeOpen] = useState(false);
  const [timeVal, setTimeVal] = useState('');
  
  const intervalRef = useRef(null);

  useEffect(() => {
    setRunning(false);
    setRemaining(active.minutes * 60);
  }, [activeId]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            setSessions((s) => s + 1);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const total = active.minutes * 60;
  const progress = total > 0 ? remaining / total : 0; 
  const strokeWidth = 12; 
  const circleRadius = (RING - strokeWidth) / 2; 
  const circumference = circleRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <Screen edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.header, { marginTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 0 }]}>
          <IconButton name="menu" onPress={() => openDrawer(navigation)} />
          <View style={styles.headerCenter}>
            <View style={[styles.headerLogo, { backgroundColor: active.color }]}>
              <MaterialCommunityIcons name={active.icon} size={16} color="#fff" />
            </View>
            <Text style={[styles.headerTitle, { color: c.text }]}>{active.name}</Text>
          </View>
          <IconButton name="ellipsis-horizontal" onPress={() => setMenuOpen(true)} />
        </View>

        <View style={styles.chipsRow}>
          {modes.map((m) => {
            const sel = m.id === activeId;
            return (
              <Pressable key={m.id} onPress={() => setActiveId(m.id)} style={[styles.chip, { backgroundColor: sel ? m.color : c.cardAlt, borderColor: sel ? m.color : c.border }]}>
                <MaterialCommunityIcons name={m.icon} size={15} color={sel ? '#fff' : c.textMuted} />
                <Text style={[styles.chipText, { color: sel ? '#fff' : c.text }]}>{m.name}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.timerWrap}>
          <View style={styles.ringContainer}>
            <Svg width={RING} height={RING} style={styles.svgRing}>
              <Circle cx={RING / 2} cy={RING / 2} r={circleRadius} stroke={c.border} strokeWidth={strokeWidth} fill="none" />
              <Circle cx={RING / 2} cy={RING / 2} r={circleRadius} stroke={active.color} strokeWidth={strokeWidth} fill="none" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
            </Svg>
            <View style={styles.timeTextContainer}>
              <Text style={[styles.time, { color: c.text }]}>{fmt(remaining)}</Text>
              <Text style={[styles.timeSub, { color: c.textMuted }]}>
                {remaining === 0 ? t.done : running ? t.focusing : t.ready}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.controls}>
          <Pressable onPress={() => { setRunning(false); setRemaining(total); }} style={[styles.smallBtn, { backgroundColor: c.cardAlt }]}><Ionicons name="refresh" size={22} color={c.text} /></Pressable>
          <Pressable onPress={() => setRunning((v) => !v)} style={[styles.playBtn, { backgroundColor: active.color }]}><Ionicons name={running ? 'pause' : 'play'} size={32} color="#fff" /></Pressable>
          <Pressable onPress={() => setRemaining((r) => r + 300)} style={[styles.smallBtn, { backgroundColor: c.cardAlt }]}><Ionicons name="add" size={24} color={c.text} /></Pressable>
        </View>

        <View style={[styles.stats, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: c.text }]}>{sessions}</Text>
            <Text style={[styles.statLabel, { color: c.textMuted }]}>{t.sessions}</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: c.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: c.text }]}>{sessions * active.minutes}m</Text>
            <Text style={[styles.statLabel, { color: c.textMuted }]}>{t.focusTime}</Text>
          </View>
        </View>
      </ScrollView> 

      <BottomMenu visible={menuOpen} onClose={() => setMenuOpen(false)} title={t.options} c={c}>
        <MenuItem icon="text-outline" label={t.rename} c={c} onPress={() => { setMenuOpen(false); setRenameVal(active.name); setRenameOpen(true); }} />
        <MenuItem icon="time-outline" label={t.changeTime} c={c} onPress={() => { setMenuOpen(false); setTimeVal(String(active.minutes)); setTimeOpen(true); }} />
        <MenuItem icon="trash-outline" label={t.delete} color={c.danger} c={c} onPress={() => {
          setMenuOpen(false);
          if (modes.length <= 1) return;
          const rest = modes.filter((m) => m.id !== activeId);
          setModes(rest);
          setActiveId(rest[0].id);
        }} />
      </BottomMenu>

      <Modal visible={renameOpen} transparent animationType="fade" onRequestClose={() => setRenameOpen(false)}>
        <Pressable style={[styles.overlay, { backgroundColor: c.overlay }]} onPress={() => setRenameOpen(false)}>
          <Pressable style={[styles.renameCard, { backgroundColor: c.surface }]} onPress={() => {}}>
            <Text style={[styles.renameTitle, { color: c.text }]}>{t.renameMode}</Text>
            <TextInput value={renameVal} onChangeText={setRenameVal} autoFocus style={[styles.renameInput, { color: c.text, borderColor: c.border, backgroundColor: c.inputBg }]} />
            <View style={styles.renameActions}>
              <Pressable onPress={() => setRenameOpen(false)}><Text style={{ color: c.textMuted, fontSize: font.title, fontWeight: '600' }}>{t.cancel}</Text></Pressable>
              <Pressable onPress={() => { setModes((ms) => ms.map((m) => m.id === activeId ? { ...m, name: renameVal || m.name } : m)); setRenameOpen(false); }}><Text style={{ color: c.primary, fontSize: font.title, fontWeight: '800' }}>{t.save}</Text></Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={timeOpen} transparent animationType="fade" onRequestClose={() => setTimeOpen(false)}>
        <Pressable style={[styles.overlay, { backgroundColor: c.overlay }]} onPress={() => setTimeOpen(false)}>
          <Pressable style={[styles.renameCard, { backgroundColor: c.surface }]} onPress={() => {}}>
            <Text style={[styles.renameTitle, { color: c.text }]}>{t.changeTimeMins}</Text>
            <TextInput value={timeVal} onChangeText={setTimeVal} autoFocus keyboardType="numeric" maxLength={3} style={[styles.renameInput, { color: c.text, borderColor: c.border, backgroundColor: c.inputBg }]} />
            <View style={styles.renameActions}>
              <Pressable onPress={() => setTimeOpen(false)}><Text style={{ color: c.textMuted, fontSize: font.title, fontWeight: '600' }}>{t.cancel}</Text></Pressable>
              <Pressable onPress={() => {
                const newMins = parseInt(timeVal, 10);
                if (!isNaN(newMins) && newMins > 0) {
                  setModes((ms) => ms.map((m) => m.id === activeId ? { ...m, minutes: newMins } : m));
                  setRemaining(newMins * 60); 
                  setRunning(false); 
                }
                setTimeOpen(false);
              }}><Text style={{ color: c.primary, fontSize: font.title, fontWeight: '800' }}>{t.save}</Text></Pressable>
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

const RING = 260;
// ... keep existing styles object unchanged
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerLogo: { width: 26, height: 26, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: font.title, fontWeight: '800' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.lg, justifyContent: 'center', marginTop: spacing.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1 },
  chipText: { fontSize: font.small, fontWeight: '700' },
  timerWrap: { alignItems: 'center', justifyContent: 'center', marginTop: spacing.xxl },
  ringContainer: { width: RING, height: RING, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  svgRing: { position: 'absolute', transform: [{ rotate: '-90deg' }] },
  timeTextContainer: { alignItems: 'center', justifyContent: 'center' },
  time: { fontSize: 56, fontWeight: '800', letterSpacing: 1 },
  timeSub: { fontSize: font.body, marginTop: 4 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xl, marginTop: spacing.xxl },
  smallBtn: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  playBtn: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  stats: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.lg, marginTop: spacing.xxl, borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: 1, height: 36 },
  statNum: { fontSize: font.h2, fontWeight: '800' },
  statLabel: { fontSize: font.small },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.sm, borderRadius: radius.md },
  menuItemText: { fontSize: font.title, fontWeight: '600' },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  renameCard: { width: '100%', borderRadius: radius.lg, padding: spacing.lg },
  renameTitle: { fontSize: font.title, fontWeight: '800', marginBottom: spacing.md },
  renameInput: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, height: 48, fontSize: font.body },
  renameActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.xl, marginTop: spacing.lg },
});