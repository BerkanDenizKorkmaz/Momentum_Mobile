import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, IconButton, openDrawer } from '../components/UI';
import { BottomMenu } from './CalendarScreen';
import { useApp } from '../state/AppContext';
import { spacing, radius, font } from '../theme';

const THEME_OPTIONS = ['light', 'dark', 'system'];
const LANGS = ['English', 'Türkçe']; // Removed Deutsch and Español
const TIME_FORMATS = ['12-hour', '24-hour'];

// Basic localization dictionary
const translations = {
  English: {
    settings: 'Settings',
    guest: 'Guest User',
    viewProfile: 'View profile ›',
    account: 'Account',
    editProfile: 'Edit Profile',
    changePassword: 'Change Password',
    preferences: 'Preferences',
    notifications: 'Notifications',
    theme: 'Theme',
    language: 'Language',
    timeFormat: 'Time format',
    data: 'Data',
    backup: 'Backup & Synchronization',
    export: 'Export Data',
    other: 'Other',
    logout: 'Logout',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System'
  },
  Türkçe: {
    settings: 'Ayarlar',
    guest: 'Misafir Kullanıcı',
    viewProfile: 'Profili görüntüle ›',
    account: 'Hesap',
    editProfile: 'Profili Düzenle',
    changePassword: 'Şifreyi Değiştir',
    preferences: 'Tercihler',
    notifications: 'Bildirimler',
    theme: 'Tema',
    language: 'Dil',
    timeFormat: 'Saat formatı',
    data: 'Veri',
    backup: 'Yedekleme ve Senkronizasyon',
    export: 'Veriyi Dışa Aktar',
    other: 'Diğer',
    logout: 'Çıkış Yap',
    themeLight: 'Açık',
    themeDark: 'Koyu',
    themeSystem: 'Sistem'
  }
};

export default function SettingsScreen({ navigation }) {
  const { colors: c, state, dispatch, logout, setTheme } = useApp();
  const user = state.user || {};
  const [picker, setPicker] = useState(null); // 'theme' | 'language' | 'time'

  // Get current language dictionary (Fallback to English if not set)
  const currentLang = state.prefs?.language === 'Türkçe' ? 'Türkçe' : 'English';
  const t = translations[currentLang];

  const initials = (user.fullName || 'User').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  
  // Get translated theme label for the menu row
  const themeLabelMap = {
    light: t.themeLight,
    dark: t.themeDark,
    system: t.themeSystem
  };
  const themeLabel = themeLabelMap[state.themeMode] || t.themeSystem;

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <IconButton name="menu" onPress={() => openDrawer(navigation)} />
        <Text style={[styles.headerTitle, { color: c.text }]}>{t.settings}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}>
        {/* Profile */}
        <View style={[styles.profile, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={[styles.avatar, { backgroundColor: c.primarySoft }]}>
            <Text style={[styles.avatarText, { color: c.primary }]}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: c.text }]}>{user.fullName || t.guest}</Text>
            <Text style={[styles.email, { color: c.textMuted }]}>{user.email || 'guest@momentum.app'}</Text>
            <Text style={[styles.viewProfile, { color: c.primary }]}>{t.viewProfile}</Text>
          </View>
        </View>

        <Section title={t.account} c={c}>
          <Row icon="person-outline" label={t.editProfile} c={c} />
          <Row icon="key-outline" label={t.changePassword} c={c} last />
        </Section>

        <Section title={t.preferences} c={c}>
          <Row
            icon="notifications-outline"
            label={t.notifications}
            c={c}
            right={
              <Switch
                value={state.prefs.notifications}
                onValueChange={(v) => dispatch({ type: 'SET_PREF', key: 'notifications', value: v })}
                trackColor={{ true: c.primary, false: c.border }}
                thumbColor="#fff"
              />
            }
          />
          <Row icon="color-palette-outline" label={t.theme} value={themeLabel} c={c} onPress={() => setPicker('theme')} />
          <Row icon="language-outline" label={t.language} value={state.prefs.language} c={c} onPress={() => setPicker('language')} />
          <Row icon="time-outline" label={t.timeFormat} value={state.prefs.timeFormat} c={c} onPress={() => setPicker('time')} last />
        </Section>

        <Section title={t.data} c={c}>
          <Row icon="cloud-upload-outline" label={t.backup} c={c} />
          <Row icon="download-outline" label={t.export} c={c} last />
        </Section>

        <Section title={t.other} c={c}>
          <Pressable onPress={logout} style={styles.row}>
            <Ionicons name="log-out-outline" size={22} color={c.danger} />
            <Text style={[styles.rowLabel, { color: c.danger }]}>{t.logout}</Text>
          </Pressable>
        </Section>
      </ScrollView>

      {/* Theme picker */}
      <BottomMenu visible={picker === 'theme'} onClose={() => setPicker(null)} title={t.theme} c={c}>
        {THEME_OPTIONS.map((val) => {
          const active = state.themeMode === val;
          return (
            <PickerRow 
              key={val} 
              label={themeLabelMap[val]} 
              active={active} 
              c={c} 
              onPress={() => { setTheme(val); setPicker(null); }} 
            />
          );
        })}
      </BottomMenu>

      {/* Language picker */}
      <BottomMenu visible={picker === 'language'} onClose={() => setPicker(null)} title={t.language} c={c}>
        {LANGS.map((opt) => (
          <PickerRow 
            key={opt} 
            label={opt} 
            active={state.prefs.language === opt} 
            c={c}
            onPress={() => { dispatch({ type: 'SET_PREF', key: 'language', value: opt }); setPicker(null); }} 
          />
        ))}
      </BottomMenu>

      {/* Time format picker */}
      <BottomMenu visible={picker === 'time'} onClose={() => setPicker(null)} title={t.timeFormat} c={c}>
        {TIME_FORMATS.map((opt) => (
          <PickerRow 
            key={opt} 
            label={opt} 
            active={state.prefs.timeFormat === opt} 
            c={c}
            onPress={() => { dispatch({ type: 'SET_PREF', key: 'timeFormat', value: opt }); setPicker(null); }} 
          />
        ))}
      </BottomMenu>
    </Screen>
  );
}

function Section({ title, children, c }) {
  return (
    <View style={{ marginTop: spacing.lg }}>
      <Text style={[styles.sectionTitle, { color: c.textMuted }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: c.card, borderColor: c.border }]}>{children}</View>
    </View>
  );
}

function Row({ icon, label, value, right, onPress, last, c }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !last && { borderBottomWidth: 1, borderBottomColor: c.border },
        pressed && onPress && { backgroundColor: c.cardAlt },
      ]}
    >
      <Ionicons name={icon} size={22} color={c.text} />
      <Text style={[styles.rowLabel, { color: c.text }]}>{label}</Text>
      <View style={styles.rowRight}>
        {value ? <Text style={[styles.rowValue, { color: c.textMuted }]}>{value}</Text> : null}
        {right || (onPress ? <Ionicons name="chevron-forward" size={18} color={c.textFaint} /> : value ? null : <Ionicons name="chevron-forward" size={18} color={c.textFaint} />)}
      </View>
    </Pressable>
  );
}

function PickerRow({ label, active, onPress, c }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.pickerRow, pressed && { backgroundColor: c.cardAlt }]}>
      <Text style={[styles.pickerLabel, { color: c.text }]}>{label}</Text>
      {active && <Ionicons name="checkmark" size={22} color={c.primary} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  headerTitle: { fontSize: font.h3, fontWeight: '800' },

  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: font.h3, fontWeight: '800' },
  name: { fontSize: font.title, fontWeight: '800' },
  email: { fontSize: font.small, marginTop: 2 },
  viewProfile: { fontSize: font.small, fontWeight: '700', marginTop: 4 },

  sectionTitle: { fontSize: font.small, fontWeight: '800', marginBottom: spacing.sm, marginLeft: 2 },
  sectionCard: { borderWidth: 1, borderRadius: radius.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  rowLabel: { flex: 1, fontSize: font.body, fontWeight: '600' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowValue: { fontSize: font.body },

  pickerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, paddingHorizontal: spacing.sm, borderRadius: radius.md },
  pickerLabel: { fontSize: font.title, fontWeight: '600' },
});