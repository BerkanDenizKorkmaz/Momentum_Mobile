import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import Logo from '../components/Logo';
import { spacing, radius, font } from '../theme';

const translations = {
  English: {
    guest: 'Guest User',
    home: 'Home',
    focus: 'Focus',
    routines: 'Routines',
    analytics: 'Analytics',
    premium: 'Premium',
    settings: 'Settings',
    help: 'Help',
    logout: 'Log out'
  },
  Türkçe: {
    guest: 'Misafir Kullanıcı',
    home: 'Ana Sayfa',
    focus: 'Odak',
    routines: 'Rutinler',
    analytics: 'Analizler',
    premium: 'Premium',
    settings: 'Ayarlar',
    help: 'Yardım',
    logout: 'Çıkış Yap'
  }
};

export default function DrawerContent({ navigation, state }) {
  const { colors: c, state: app, logout } = useApp();
  const currentLang = app.prefs?.language === 'Türkçe' ? 'Türkçe' : 'English';
  const t = translations[currentLang];

  const ITEMS = [
    { label: t.home, route: 'Home', icon: 'calendar-outline' },
    { label: t.focus, route: 'Focus', icon: 'timer-outline' },
    { label: t.routines, route: 'Routines', icon: 'repeat-outline' },
    { label: t.analytics, route: 'Analytics', icon: 'stats-chart-outline' },
    { label: t.premium, route: 'Premium', icon: 'diamond-outline' },
    { label: t.settings, route: 'Settings', icon: 'settings-outline' },
    { label: t.help, route: 'Help', icon: 'help-circle-outline' },
  ];

  const activeRoute = state.routeNames[state.index];
  const user = app.user || {};
  const initials = (user.fullName || 'User').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.surface }]} edges={['top', 'bottom']}>
      <View style={styles.logoRow}><Logo size={20} /></View>

      <View style={[styles.profile, { borderColor: c.border }]}>
        <View style={[styles.avatar, { backgroundColor: c.primarySoft }]}>
          <Text style={[styles.avatarText, { color: c.primary }]}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>{user.fullName || t.guest}</Text>
          <Text style={[styles.email, { color: c.textMuted }]} numberOfLines={1}>{user.email || 'guest@momentum.app'}</Text>
        </View>
      </View>

      <View style={{ flex: 1, marginTop: spacing.md }}>
        {ITEMS.map((item) => {
          const active = activeRoute === item.route;
          return (
            <Pressable key={item.route} onPress={() => navigation.navigate(item.route)}
              style={({ pressed }) => [styles.item, active && { backgroundColor: c.primarySoft }, pressed && { opacity: 0.7 }]}>
              <Ionicons name={item.icon} size={22} color={active ? c.primary : c.textMuted} />
              <Text style={[styles.itemText, { color: active ? c.primary : c.text }]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable onPress={logout} style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}>
        <MaterialCommunityIcons name="logout" size={22} color={c.danger} />
        <Text style={[styles.itemText, { color: c.danger }]}>{t.logout}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  logoRow: { paddingHorizontal: spacing.sm, paddingTop: spacing.md, paddingBottom: spacing.lg },
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderWidth: 1, borderRadius: radius.lg },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800', fontSize: font.title },
  name: { fontSize: font.body, fontWeight: '700' },
  email: { fontSize: font.small, marginTop: 2 },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderRadius: radius.md },
  itemText: { fontSize: font.title, fontWeight: '600' },
});