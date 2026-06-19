import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen, Header, Input, Button } from '../../components/UI';
import { useApp } from '../../state/AppContext';
import { spacing, font } from '../../theme';

export default function ForgotPasswordScreen({ navigation }) {
  const { colors: c } = useApp();
  const [email, setEmail] = useState('');

  return (
    <Screen>
      <Header onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.body}>
          <View style={[styles.logoBox, { backgroundColor: c.primarySoft }]}>
            <MaterialCommunityIcons name="lock-reset" size={40} color={c.primary} />
          </View>
          <Text style={[styles.title, { color: c.text }]}>Enter your email</Text>
          <Text style={[styles.sub, { color: c.textMuted }]}>
            Enter the email address to get the verification code.
          </Text>

          <Input
            label="Email address"
            icon="mail-outline"
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={{ marginBottom: spacing.xl, marginTop: spacing.lg }}
          />

          <Button
            title="Send Code"
            onPress={() =>
              navigation.navigate('VerifyCode', {
                email: email || 'you@example.com',
                mode: 'reset',
              })
            }
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: spacing.xl, alignItems: 'stretch', paddingTop: spacing.xxl },
  logoBox: {
    width: 84, height: 84, borderRadius: 42, alignSelf: 'center',
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl,
  },
  title: { fontSize: font.h2, fontWeight: '800', textAlign: 'center' },
  sub: { fontSize: font.body, textAlign: 'center', marginTop: spacing.sm, lineHeight: 21 },
});
