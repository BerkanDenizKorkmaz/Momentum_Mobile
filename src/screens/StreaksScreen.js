import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen, Header } from '../components/UI';
import { useApp } from '../state/AppContext';
import { spacing, radius, font } from '../theme';

const translations = {
  English: {
    title: 'Streaks',
    days: 'days',
    currentOverall: 'Current overall streak',
    best: 'Best',
    totalFlames: 'Total flames',
    streakByRoutine: 'STREAK BY ROUTINE',
    note: 'Each streak has its own color, shaped as a flame.',
    bestLower: 'best'
  },
  Türkçe: {
    title: 'Seriler',
    days: 'gün',
    currentOverall: 'Mevcut genel seri',
    best: 'En İyi',
    totalFlames: 'Toplam alev',
    streakByRoutine: 'RUTİNE GÖRE SERİ',
    note: 'Her serinin alev şeklinde kendi rengi vardır.',
    bestLower: 'en iyi'
  }
};

export default function StreaksScreen({ navigation }) {
  const { colors: c, state } = useApp();
  const currentLang = state.prefs?.language === 'Türkçe' ? 'Türkçe' : 'English';
  const t = translations[currentLang];

  // --- DİNAMİK HESAPLAMALAR ---
  const routines = state.routines || [];
  
  // 1. Mevcut Genel Seri: Tüm rutinler arasındaki en yüksek aktif seri (currentStreak)
  const dynamicCurrentStreak = routines.length > 0 
    ? Math.max(...routines.map(r => r.currentStreak || 0)) 
    : 0;

  // 2. En İyi Seri: Tüm rutinler arasında şimdiye kadar ulaşılmış en yüksek seri (bestStreak)
  const dynamicBestStreak = routines.length > 0 
    ? Math.max(...routines.map(r => r.bestStreak || 0)) 
    : 0;

  // 3. Toplam Alev: Tüm rutinlerdeki serilerin veya tamamlamaların toplamı. 
  // (Burada tüm rutinlerdeki bestStreak'lerin toplamını baz alıyoruz, istersen currentStreak toplamı da yapabilirsin)
  const dynamicTotalFlames = routines.reduce((total, r) => total + (r.bestStreak || 0), 0);

  return (
    <Screen edges={['top']}>
      <Header title={t.title} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}>
        
        {/* Summary */}
        <View style={[styles.summary, { backgroundColor: c.primarySoft }]}>
          <MaterialCommunityIcons name="fire" size={48} color={c.flame} />
          
          {/* Dinamik Current Streak */}
          <Text style={[styles.summaryNum, { color: c.text }]}>
            {dynamicCurrentStreak} {t.days}
          </Text>
          <Text style={[styles.summaryLabel, { color: c.textMuted }]}>{t.currentOverall}</Text>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              {/* Dinamik Best Streak */}
              <Text style={[styles.summaryItemNum, { color: c.text }]}>{dynamicBestStreak}</Text>
              <Text style={[styles.summaryItemLabel, { color: c.textMuted }]}>{t.best}</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: c.border }]} />
            <View style={styles.summaryItem}>
              {/* Dinamik Total Flames */}
              <Text style={[styles.summaryItemNum, { color: c.text }]}>{dynamicTotalFlames}</Text>
              <Text style={[styles.summaryItemLabel, { color: c.textMuted }]}>{t.totalFlames}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: c.textMuted }]}>{t.streakByRoutine}</Text>
        <Text style={[styles.note, { color: c.textMuted }]}>{t.note}</Text>

        <View style={styles.grid}>
          {routines.map((r) => (
            <View key={r.id} style={[styles.tile, { borderColor: c.border, backgroundColor: c.card }]}>
              <View style={[styles.flameBadge, { backgroundColor: r.color }]}>
                <MaterialCommunityIcons name="fire" size={30} color="#fff" />
              </View>
              <Text style={[styles.tileNum, { color: c.text }]}>{r.currentStreak}</Text>
              <Text style={[styles.tileName, { color: c.textMuted }]} numberOfLines={1}>{r.title}</Text>
              <Text style={[styles.tileBest, { color: c.textFaint }]}>{t.bestLower} {r.bestStreak}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { alignItems: 'center', borderRadius: radius.xl, padding: spacing.xl, gap: 4 },
  summaryNum: { fontSize: font.h1, fontWeight: '800', marginTop: spacing.sm },
  summaryLabel: { fontSize: font.body },
  summaryRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg, gap: spacing.xl },
  summaryItem: { alignItems: 'center' },
  summaryItemNum: { fontSize: font.h3, fontWeight: '800' },
  summaryItemLabel: { fontSize: font.small },
  summaryDivider: { width: 1, height: 32 },
  sectionLabel: { fontSize: font.small, fontWeight: '800', letterSpacing: 0.6, marginTop: spacing.xl },
  note: { fontSize: font.small, marginTop: 4, marginBottom: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  tile: { width: '47%', flexGrow: 1, borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', gap: 4 },
  flameBadge: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  tileNum: { fontSize: font.h1, fontWeight: '800' },
  tileName: { fontSize: font.body, fontWeight: '700' },
  tileBest: { fontSize: font.small },
});