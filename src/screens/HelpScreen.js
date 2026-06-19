import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, IconButton, openDrawer } from '../components/UI';
import { useApp } from '../state/AppContext';
import { spacing, radius, font } from '../theme';

const translations = {
  English: {
    help: 'Help',
    searchHelp: 'Search help topic...',
    quickStart: 'Quick Start',
    gettingStarted: 'Getting Started',
    learnIn5: 'Learn in 5 steps',
    faqTitle: 'Frequently Asked Questions',
    noTopics: 'No topics found.',
    seeAll: 'See all questions ›',
    version: 'Version 1.0.0',
    faq: [
      { q: 'How to add a new task?', a: 'Open the calendar, tap the + button, fill in the title, day, time and color, then tap Save.' },
      { q: 'How to set a reminder?', a: 'When adding or editing a task, set a Time. Enable Notifications in Settings to receive reminders.' },
      { q: 'How to back up my data?', a: 'Go to Settings → Data → Backup & Synchronization to sync your data to the cloud.' },
      { q: 'Managing notifications', a: 'Toggle notifications in Settings → Preferences → Notifications at any time.' },
      { q: 'How do streaks work?', a: 'Complete a routine every day to grow its streak. Each routine has its own flame and color.' },
    ]
  },
  Türkçe: {
    help: 'Yardım',
    searchHelp: 'Yardım konusu ara...',
    quickStart: 'Hızlı Başlangıç',
    gettingStarted: 'Başlarken',
    learnIn5: '5 adımda öğrenin',
    faqTitle: 'Sıkça Sorulan Sorular',
    noTopics: 'Konu bulunamadı.',
    seeAll: 'Tüm soruları gör ›',
    version: 'Sürüm 1.0.0',
    faq: [
      { q: 'Yeni bir görev nasıl eklenir?', a: 'Takvimi açın, + butonuna basın, başlık, gün, zaman ve rengi doldurup Kaydet\'e basın.' },
      { q: 'Nasıl hatırlatıcı kurarım?', a: 'Görev eklerken veya düzenlerken bir Zaman belirleyin. Hatırlatıcı almak için Ayarlar\'dan Bildirimler\'i açın.' },
      { q: 'Verilerimi nasıl yedeklerim?', a: 'Verilerinizi buluta senkronize etmek için Ayarlar → Veri → Yedekleme ve Senkronizasyon bölümüne gidin.' },
      { q: 'Bildirimleri yönetme', a: 'Bildirimleri istediğiniz zaman Ayarlar → Tercihler → Bildirimler bölümünden açıp kapatabilirsiniz.' },
      { q: 'Seriler nasıl çalışır?', a: 'Seriyi büyütmek için rutini her gün tamamlayın. Her rutinin kendi alevi ve rengi vardır.' },
    ]
  }
};

export default function HelpScreen({ navigation }) {
  const { colors: c, state } = useApp();
  const currentLang = state.prefs?.language === 'Türkçe' ? 'Türkçe' : 'English';
  const t = translations[currentLang];

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(null);

  const filtered = t.faq.filter((f) => f.q.toLowerCase().includes(query.toLowerCase()));

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <IconButton name="menu" onPress={() => openDrawer(navigation)} />
        <Text style={[styles.headerTitle, { color: c.text }]}>{t.help}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}>
        {/* Search */}
        <View style={[styles.search, { backgroundColor: c.inputBg, borderColor: c.border }]}>
          <Ionicons name="search" size={18} color={c.textMuted} />
          <TextInput
            placeholder={t.searchHelp}
            placeholderTextColor={c.textFaint}
            value={query}
            onChangeText={setQuery}
            style={[styles.searchInput, { color: c.text }]}
          />
        </View>

        {/* Quick start */}
        <Text style={[styles.sectionTitle, { color: c.text }]}>{t.quickStart}</Text>
        <Pressable style={[styles.quickCard, { backgroundColor: c.primarySoft }]}>
          <View style={[styles.quickIcon, { backgroundColor: c.primary }]}>
            <Ionicons name="rocket-outline" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.quickTitle, { color: c.text }]}>{t.gettingStarted}</Text>
            <Text style={[styles.quickSub, { color: c.textMuted }]}>{t.learnIn5}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={c.primary} />
        </Pressable>

        {/* FAQ */}
        <Text style={[styles.sectionTitle, { color: c.text }]}>{t.faqTitle}</Text>
        <View style={[styles.faqCard, { backgroundColor: c.card, borderColor: c.border }]}>
          {filtered.map((f, i) => (
            <View key={f.q} style={i !== filtered.length - 1 ? { borderBottomWidth: 1, borderBottomColor: c.border } : null}>
              <Pressable
                style={styles.faqRow}
                onPress={() => setOpen((o) => (o === f.q ? null : f.q))}
              >
                <Text style={[styles.faqQ, { color: c.text }]}>{f.q}</Text>
                <Ionicons name={open === f.q ? 'chevron-down' : 'chevron-forward'} size={18} color={c.textMuted} />
              </Pressable>
              {open === f.q && <Text style={[styles.faqA, { color: c.textMuted }]}>{f.a}</Text>}
            </View>
          ))}
          {filtered.length === 0 && (
            <Text style={[styles.faqA, { color: c.textMuted, paddingVertical: spacing.md }]}>{t.noTopics}</Text>
          )}
        </View>

        <Pressable style={styles.seeAll}>
          <Text style={[styles.seeAllText, { color: c.primary }]}>{t.seeAll}</Text>
        </Pressable>

        <Text style={[styles.version, { color: c.textFaint }]}>{t.version}</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  headerTitle: { fontSize: font.h3, fontWeight: '800' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing.lg, height: 50 },
  searchInput: { flex: 1, fontSize: font.body },
  sectionTitle: { fontSize: font.title, fontWeight: '800', marginTop: spacing.xl, marginBottom: spacing.md },
  quickCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radius.lg, padding: spacing.lg },
  quickIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  quickTitle: { fontSize: font.title, fontWeight: '700' },
  quickSub: { fontSize: font.small, marginTop: 2 },
  faqCard: { borderWidth: 1, borderRadius: radius.lg, paddingHorizontal: spacing.lg, overflow: 'hidden' },
  faqRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.lg },
  faqQ: { flex: 1, fontSize: font.body, fontWeight: '600' },
  faqA: { fontSize: font.small, lineHeight: 20, paddingBottom: spacing.lg, marginTop: -4 },
  seeAll: { alignItems: 'center', paddingVertical: spacing.lg },
  seeAllText: { fontSize: font.body, fontWeight: '700' },
  version: { fontSize: font.small, textAlign: 'center', marginTop: spacing.md },
});