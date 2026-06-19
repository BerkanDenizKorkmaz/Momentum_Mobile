import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, IconButton, Button, openDrawer } from '../components/UI';
import { useApp } from '../state/AppContext';
import { spacing, radius, font } from '../theme';

const translations = {
  English: {
    premium: 'Premium',
    heroTitle: 'Choose a plan that fits how you work.',
    heroSubtitle: 'Upgrade for more automation, deeper analytics, and team-ready controls. Start free, grow when you need it.',
    mo: ' /mo',
    activeAlert: 'is already your active plan.',
    selectedAlert: 'plan selected (demo).',
    currentPlanBtn: 'Current plan',
    getStartedBtn: 'Get started',
    plans: [
      {
        key: 'starter', name: 'Starter', price: '$0',
        features: ['Up to 3 routines', 'Pomodoro Timer at default settings', 'Weekly Analytics', 'Email support', 'Community access'],
      },
      {
        key: 'pro', name: 'Pro', price: '$14.99', featured: true, badge: 'Most popular',
        features: ['Up to 10 routines', '1 Year analytics', 'Customizable Focus Mode', 'Priority support', 'Focus Mode presets'],
      },
      {
        key: 'enterprise', name: 'Premium', price: '$29.99',
        features: ['Unlimited routines', 'Customizable Focus Mode', 'Shared workspaces', 'Dedicated onboarding', 'Advanced security'],
      }
    ]
  },
  Türkçe: {
    premium: 'Premium',
    heroTitle: 'Çalışma tarzınıza uygun bir plan seçin.',
    heroSubtitle: 'Daha fazla otomasyon, derin analizler ve ekip kontrolleri için yükseltin. Ücretsiz başlayın, ihtiyacınız olduğunda büyüyün.',
    mo: ' /ay',
    activeAlert: 'zaten mevcut planınız.',
    selectedAlert: 'planı seçildi (demo).',
    currentPlanBtn: 'Mevcut plan',
    getStartedBtn: 'Hemen Başla',
    plans: [
      {
        key: 'starter', name: 'Başlangıç', price: '$0',
        features: ['3 rutine kadar', 'Varsayılan ayarlarla Pomodoro', 'Haftalık Analizler', 'E-posta desteği', 'Topluluk erişimi'],
      },
      {
        key: 'pro', name: 'Pro', price: '$14.99', featured: true, badge: 'En popüler',
        features: ['10 rutine kadar', '1 Yıllık analizler', 'Özelleştirilebilir Odak Modu', 'Öncelikli destek', 'Odak Modu ön ayarları'],
      },
      {
        key: 'enterprise', name: 'Premium', price: '$29.99',
        features: ['Sınırsız rutin', 'Özelleştirilebilir Odak Modu', 'Ortak çalışma alanları', 'Özel başlangıç desteği', 'Gelişmiş güvenlik'],
      }
    ]
  }
};

export default function PremiumScreen({ navigation }) {
  const { colors: c, state, dispatch } = useApp();
  const currentLang = state.prefs?.language === 'Türkçe' ? 'Türkçe' : 'English';
  const t = translations[currentLang];
  
  // 1. Determine the active plan from state (defaulting to starter)
  const currentPlanKey = state.prefs?.plan || 'starter';

  const onSelect = (plan) => {
    // 2. Check dynamically against the current plan
    if (plan.key === currentPlanKey) {
      Alert.alert(plan.name, `${plan.name} ${t.activeAlert}`);
    } else {
      dispatch({ type: 'UPDATE_PLAN', plan: plan.key });
      Alert.alert(plan.name, `${plan.name} ${t.selectedAlert}`);
    }
  };

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <IconButton name="menu" onPress={() => openDrawer(navigation)} />
        <Text style={[styles.headerTitle, { color: c.text }]}>{t.premium}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: c.primarySoft, borderColor: c.border }]}>
          <View style={styles.eyebrow}>
            <Ionicons name="diamond" size={16} color={c.primary} />
            <Text style={[styles.eyebrowText, { color: c.primary }]}>{t.premium.toUpperCase()}</Text>
          </View>
          <Text style={[styles.heroTitle, { color: c.text }]}>{t.heroTitle}</Text>
          <Text style={[styles.heroSubtitle, { color: c.textMuted }]}>{t.heroSubtitle}</Text>
        </View>

        {t.plans.map((plan) => {
          const featured = !!plan.featured;
          
          // 3. Dynamically set UI properties based on if this card is the active plan
          const isCurrent = plan.key === currentPlanKey;
          const buttonTitle = isCurrent ? t.currentPlanBtn : t.getStartedBtn;
          const buttonVariant = isCurrent ? 'ghost' : 'primary';

          return (
            <View
              key={plan.key}
              style={[
                styles.card,
                { backgroundColor: c.card, borderColor: featured ? c.primary : c.border },
                featured && styles.cardFeatured,
                isCurrent && styles.cardCurrent // Optional: Add a subtle style if it's the current plan
              ]}
            >
              {plan.badge ? (
                <View style={[styles.badge, { backgroundColor: c.primarySoft }]}>
                  <Text style={[styles.badgeText, { color: c.primary }]}>{plan.badge.toUpperCase()}</Text>
                </View>
              ) : null}

              {/* Optional: Add an "Active" indicator dot next to the name */}
              <View style={styles.planHeaderRow}>
                <Text style={[styles.planName, { color: c.text }]}>{plan.name}</Text>
                {isCurrent && (
                  <View style={[styles.activeDot, { backgroundColor: c.success }]} />
                )}
              </View>

              <View style={styles.priceRow}>
                <Text style={[styles.price, { color: c.text }]}>{plan.price}</Text>
                <Text style={[styles.period, { color: c.textMuted }]}>{t.mo}</Text>
              </View>

              <View style={styles.features}>
                {plan.features.map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={18} color={c.primary} />
                    <Text style={[styles.featureText, { color: c.textMuted }]}>{f}</Text>
                  </View>
                ))}
              </View>

              <Button
                title={buttonTitle}
                variant={buttonVariant}
                onPress={() => onSelect(plan)}
                style={styles.action}
              />
            </View>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  headerTitle: { fontSize: font.h3, fontWeight: '800' },
  hero: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  eyebrowText: { fontSize: font.tiny, fontWeight: '800', letterSpacing: 1.2 },
  heroTitle: { fontSize: font.h2, fontWeight: '800', letterSpacing: -0.5, marginBottom: spacing.sm },
  heroSubtitle: { fontSize: font.body, lineHeight: 22 },
  card: { position: 'relative', borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  cardFeatured: { borderWidth: 1.5, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  cardCurrent: { opacity: 0.95 }, // Slightly dim the active card if desired
  badge: { position: 'absolute', top: spacing.md, right: spacing.md, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill },
  badgeText: { fontSize: font.tiny, fontWeight: '800', letterSpacing: 0.5 },
  planHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  activeDot: { width: 8, height: 8, borderRadius: 4 },
  planName: { fontSize: font.h3, fontWeight: '800' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: spacing.lg },
  price: { fontSize: font.h1, fontWeight: '900', letterSpacing: -1 },
  period: { fontSize: font.body, fontWeight: '700' },
  features: { gap: spacing.md, marginBottom: spacing.lg },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  featureText: { flex: 1, fontSize: font.body, lineHeight: 20 },
  action: { marginTop: spacing.xs },
});