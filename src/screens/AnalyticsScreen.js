import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen, IconButton, openDrawer } from '../components/UI';
import { useApp } from '../state/AppContext';
import { spacing, radius, font } from '../theme';

const translations = {
  English: {
    analytics: 'Analytics',
    tabs: { Week: 'Week', Month: 'Month', Year: 'Year' },
    streak: 'STREAK',
    completion: 'COMPLETION',
    flames: 'FLAMES',
    routineCompTitle: 'ROUTINE COMPLETION',
    lastStr: 'Last',
    calUsageTitle: 'CALENDAR USAGE TIME',
    minutes: 'minutes',
    focusStatsTitle: 'FOCUS STATS',
    seeInFocus: 'See in focus tab',
    daysStr: 'days',
    lockedAnalytics: 'Monthly and yearly analytics unlock in Pro & Premium.' // Added translation
  },
  Türkçe: {
    analytics: 'Analizler',
    tabs: { Week: 'Hafta', Month: 'Ay', Year: 'Yıl' },
    streak: 'SERİ',
    completion: 'TAMAMLAMA',
    flames: 'ALEVLER',
    routineCompTitle: 'RUTİN TAMAMLAMA',
    lastStr: 'Son',
    calUsageTitle: 'TAKVİM KULLANIM SÜRESİ',
    minutes: 'dakika',
    focusStatsTitle: 'ODAK İSTATİSTİKLERİ',
    seeInFocus: 'Odak sekmesinde gör',
    daysStr: 'gün',
    lockedAnalytics: 'Aylık ve yıllık analizler Pro ve Premium planda açılır.' // Added translation
  }
};

const DATA = {
  Week: {
    completion: [80, 55, 90, 70, 85, 40, 100],
    usage: [25, 40, 30, 50, 35, 45, 55],
    labels: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
    streak: 7, rate: 82, flames: 142,
  },
  Month: {
    completion: [70, 85, 60, 95],
    usage: [30, 42, 38, 50],
    labels: ['W1', 'W2', 'W3', 'W4'],
    streak: 7, rate: 78, flames: 142,
  },
  Year: {
    completion: [60, 72, 80, 65, 90, 88, 75, 82, 70, 95, 85, 78],
    usage: [20, 30, 35, 40, 45, 50, 48, 52, 38, 60, 55, 50],
    labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
    streak: 7, rate: 84, flames: 142,
  },
};

export default function AnalyticsScreen({ navigation }) {
  const { colors: c, state } = useApp();
  const currentLang = state.prefs?.language === 'Türkçe' ? 'Türkçe' : 'English';
  const t = translations[currentLang];

  // Get current plan to determine if tabs should be locked
  const currentPlan = state.prefs?.plan || 'starter';
  const isStarter = currentPlan === 'starter';

  const [tab, setTab] = useState('Week');
  const d = DATA[tab];

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <IconButton name="menu" onPress={() => openDrawer(navigation)} />
        <Text style={[styles.headerTitle, { color: c.text }]}>{t.analytics}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}>
        {/* Tabs */}
        <View style={[styles.tabs, { backgroundColor: c.cardAlt }]}>
          {['Week', 'Month', 'Year'].map((tKey) => {
            // Lock Month and Year if the user is on the starter plan
            const isLocked = isStarter && tKey !== 'Week';

            return (
              <Pressable 
                key={tKey} 
                onPress={() => {
                  if (!isLocked) setTab(tKey);
                }} 
                style={[
                  styles.tab, 
                  tab === tKey && { backgroundColor: c.surface },
                  isLocked && { opacity: 0.5 } // Dim the locked tabs
                ]}
              >
                <View style={styles.tabContent}>
                  {isLocked && <Ionicons name="lock-closed" size={12} color={c.textMuted} />}
                  <Text style={[styles.tabText, { color: tab === tKey ? c.primary : c.textMuted }]}>
                    {t.tabs[tKey]}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Lock Warning Text */}
        {isStarter && (
          <Text style={[styles.lockedText, { color: c.textMuted }]}>
            {t.lockedAnalytics}
          </Text>
        )}

        {/* Stat cards */}
        <View style={styles.statRow}>
          <StatCard icon="fire" lib="mc" label={t.streak} value={`${d.streak} ${t.daysStr}`} color={c.flame} c={c} />
          <StatCard icon="checkmark-done" label={t.completion} value={`${d.rate}%`} color={c.success} c={c} />
          <StatCard icon="fire" lib="mc" label={t.flames} value={`${d.flames}`} color={c.primary} c={c} />
        </View>

        <Text style={[styles.chartTitle, { color: c.text }]}>{t.routineCompTitle}</Text>
        <Text style={[styles.chartSub, { color: c.textMuted }]}>{t.lastStr} {t.tabs[tab].toLowerCase()}</Text>
        <View style={[styles.chartCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <BarChart values={d.completion} labels={d.labels} max={100} color={c.primary} c={c} unit="%" />
        </View>

        <Text style={[styles.chartTitle, { color: c.text }]}>{t.calUsageTitle}</Text>
        <Text style={[styles.chartSub, { color: c.textMuted }]}>{t.minutes}</Text>
        <View style={[styles.chartCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <LineChart values={d.usage} labels={d.labels} max={60} color={c.success} c={c} />
        </View>

      </ScrollView>
    </Screen>
  );
}

function StatCard({ icon, lib, label, value, color, c }) {
  const Icon = lib === 'mc' ? MaterialCommunityIcons : Ionicons;
  return (
    <View style={[styles.statCard, { backgroundColor: c.card, borderColor: c.border }]}>
      <Icon name={icon} size={20} color={color} />
      <Text style={[styles.statValue, { color: c.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: c.textMuted }]}>{label}</Text>
    </View>
  );
}

function BarChart({ values, labels, max, color, c, unit = '' }) {
  return (
    <View>
      <View style={styles.barArea}>
        {values.map((v, i) => (
          <View key={i} style={styles.barCol}>
            <Text style={[styles.barValue, { color: c.textMuted }]}>{v}{unit}</Text>
            <View style={[styles.barTrack, { backgroundColor: c.cardAlt }]}>
              <View style={[styles.barFill, { height: `${(v / max) * 100}%`, backgroundColor: color }]} />
            </View>
            <Text style={[styles.barLabel, { color: c.textMuted }]}>{labels[i]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function LineChart({ values, labels, max, color, c }) {
  const W = 280;
  const H = 120;
  const n = values.length;
  const stepX = W / (n - 1);
  const pts = values.map((v, i) => ({
    x: i * stepX,
    y: H - (v / max) * H,
  }));

  return (
    <View>
      <View style={{ height: H, width: '100%' }}>
        {[0, 0.5, 1].map((g) => (
          <View key={g} style={[styles.grid, { top: H * g, backgroundColor: c.border }]} />
        ))}
        {pts.slice(0, -1).map((p, i) => {
          const q = pts[i + 1];
          const dx = q.x - p.x;
          const dy = q.y - p.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
          const leftPct = (p.x / W) * 100;
          const widthPct = (len / W) * 100;
          return (
            <View
              key={i}
              style={{
                position: 'absolute', left: `${leftPct}%`, top: p.y, width: `${widthPct}%`,
                height: 3, backgroundColor: color, borderRadius: 2,
                transform: [{ translateY: -1.5 }, { rotateZ: `${angle}deg` }],
                transformOrigin: 'left center',
              }}
            />
          );
        })}
        {pts.map((p, i) => (
          <View
            key={i}
            style={{
              position: 'absolute', left: `${(p.x / W) * 100}%`, top: p.y,
              width: 8, height: 8, borderRadius: 4, backgroundColor: color,
              transform: [{ translateX: -4 }, { translateY: -4 }],
            }}
          />
        ))}
      </View>
      <View style={styles.lineLabels}>
        {labels.map((l, i) => (
          <Text key={i} style={[styles.barLabel, { color: c.textMuted, flex: 1, textAlign: 'center' }]}>{l}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  headerTitle: { fontSize: font.h3, fontWeight: '800' },
  tabs: { flexDirection: 'row', borderRadius: radius.md, padding: 4, marginBottom: spacing.md }, // Changed bottom margin to fit the warning text
  tab: { flex: 1, paddingVertical: 8, borderRadius: radius.sm, alignItems: 'center' },
  tabContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tabText: { fontSize: font.body, fontWeight: '700' },
  lockedText: { fontSize: font.small, textAlign: 'center', marginBottom: spacing.lg, fontWeight: '500' },
  statRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flex: 1, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', gap: 4 },
  statValue: { fontSize: font.title, fontWeight: '800' },
  statLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  chartTitle: { fontSize: font.body, fontWeight: '800', marginTop: spacing.md },
  chartSub: { fontSize: font.small, marginBottom: spacing.sm },
  chartCard: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg },
  barArea: { flexDirection: 'row', alignItems: 'flex-end', height: 140, gap: 4 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  barValue: { fontSize: 9, fontWeight: '600' },
  barTrack: { width: '70%', height: 100, borderRadius: radius.sm, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: radius.sm },
  barLabel: { fontSize: font.tiny, fontWeight: '600' },
  grid: { position: 'absolute', left: 0, right: 0, height: 1 },
  lineLabels: { flexDirection: 'row', marginTop: spacing.sm },
  focusCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg },
  focusTitle: { fontSize: font.body, fontWeight: '800' },
  focusSub: { fontSize: font.small, marginTop: 2 },
});