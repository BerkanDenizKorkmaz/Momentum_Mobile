import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Input, Button } from '../../components/UI';
import Logo from '../../components/Logo';
import { useApp } from '../../state/AppContext';
import { spacing, font, radius } from '../../theme';

export default function SignUpScreen({ navigation }) {
  const { colors: c } = useApp();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [agree, setAgree] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const onSignUp = () => {
    // Go through email verification, carrying the new account forward.
    navigation.navigate('VerifyCode', {
      email: form.email || 'you@example.com',
      fullName: form.name || 'New User',
      mode: 'signup',
    });
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <View style={styles.logo}>
            <Logo size={24} />
          </View>
          <Text style={[styles.title, { color: c.text }]}>Sign Up</Text>

          <Input label="Full Name" icon="person-outline" placeholder="Jane Doe"
            value={form.name} onChangeText={set('name')} style={{ marginBottom: spacing.md }} />
          <Input label="Email" icon="mail-outline" placeholder="you@example.com"
            autoCapitalize="none" keyboardType="email-address"
            value={form.email} onChangeText={set('email')} style={{ marginBottom: spacing.md }} />
          <Input label="Password" icon="lock-closed-outline" placeholder="••••••••"
            secureTextEntry value={form.password} onChangeText={set('password')}
            style={{ marginBottom: spacing.md }} />
          <Input label="Confirm Password" icon="lock-closed-outline" placeholder="••••••••"
            secureTextEntry value={form.confirm} onChangeText={set('confirm')}
            style={{ marginBottom: spacing.lg }} />

          <Pressable style={styles.agreeRow} onPress={() => setAgree((v) => !v)}>
            <View style={[styles.checkbox, { borderColor: c.border }, agree && { backgroundColor: c.primary, borderColor: c.primary }]}>
              {agree && <Ionicons name="checkmark" size={15} color="#fff" />}
            </View>
            <Text style={[styles.agreeText, { color: c.textMuted }]}>
              I have read and agree to the{' '}
              <Text style={{ color: c.primary, fontWeight: '700' }}>Terms of Service</Text> and{' '}
              <Text style={{ color: c.primary, fontWeight: '700' }}>Privacy Policy</Text>.
            </Text>
          </Pressable>

          <Button title="Sign Up" onPress={onSignUp} disabled={!agree} />

          <View style={styles.footer}>
            <Text style={{ color: c.textMuted, fontSize: font.body }}>Already have an account? </Text>
            <Pressable onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.link, { color: c.primary }]}>Log In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.xl, paddingVertical: spacing.xl, flexGrow: 1, justifyContent: 'center' },
  logo: { alignItems: 'center', marginBottom: spacing.lg },
  title: { fontSize: font.h1, fontWeight: '800', textAlign: 'center', marginBottom: spacing.xl },
  agreeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl, alignItems: 'flex-start' },
  checkbox: {
    width: 22, height: 22, borderRadius: radius.sm, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  agreeText: { flex: 1, fontSize: font.small, lineHeight: 19 },
  link: { fontSize: font.body, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.xl },
});
