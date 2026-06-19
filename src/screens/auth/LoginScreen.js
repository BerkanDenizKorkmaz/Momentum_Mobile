import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Screen, Input, Button, IconButton } from '../../components/UI';
import Logo from '../../components/Logo';
import { useApp } from '../../state/AppContext';
import { spacing, font } from '../../theme';

export default function LoginScreen({ navigation }) {
  const { colors: c, login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hide, setHide] = useState(true);

  const onLogin = () => {
    const name = email.includes('@') ? email.split('@')[0] : email || 'Guest';
    login({ fullName: name.charAt(0).toUpperCase() + name.slice(1), email: email || 'guest@momentum.app' });
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.body}>
          <View style={styles.logo}>
            <Logo size={28} />
          </View>
          <Text style={[styles.title, { color: c.text }]}>Log In</Text>

          <Input
            label="Email or username"
            icon="person-outline"
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={{ marginBottom: spacing.lg }}
          />
          <Input
            label="Password"
            icon="lock-closed-outline"
            placeholder="••••••••"
            secureTextEntry={hide}
            rightIcon={hide ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setHide((v) => !v)}
            value={password}
            onChangeText={setPassword}
            style={{ marginBottom: spacing.sm }}
          />

          <Pressable
            onPress={() => navigation.navigate('ForgotPassword')}
            style={{ alignSelf: 'flex-end', marginBottom: spacing.xl }}
          >
            <Text style={[styles.link, { color: c.primary }]}>Forgot Password?</Text>
          </Pressable>

          <Button title="Log In" onPress={onLogin} />
        </View>

        <View style={styles.footer}>
          <Text style={{ color: c.textMuted, fontSize: font.body }}>Don't have an account? </Text>
          <Pressable onPress={() => navigation.navigate('SignUp')}>
            <Text style={[styles.link, { color: c.primary }]}>Sign Up</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: spacing.xl, justifyContent: 'center' },
  logo: { alignItems: 'center', marginBottom: spacing.xl },
  title: { fontSize: font.h1, fontWeight: '800', textAlign: 'center', marginBottom: spacing.xxl },
  link: { fontSize: font.body, fontWeight: '700' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
});
