import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen, Header, Input, Button } from '../../components/UI';
import { useApp } from '../../state/AppContext';
import { spacing, font } from '../../theme';

export default function ResetPasswordScreen({ navigation }) {
  const { colors: c } = useApp();
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [hide, setHide] = useState(true);
  const [hide2, setHide2] = useState(true);

  const valid = pw.length >= 4 && pw === confirm;

  return (
    <Screen>
      <Header onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.body}>
          <View style={[styles.logoBox, { backgroundColor: c.primarySoft }]}>
            <MaterialCommunityIcons name="lock-check-outline" size={38} color={c.primary} />
          </View>
          <Text style={[styles.title, { color: c.text }]}>Reset password</Text>
          <Text style={[styles.sub, { color: c.textMuted }]}>Enter a new password</Text>

          <Input
            label="New password"
            icon="lock-closed-outline"
            placeholder="••••••••"
            secureTextEntry={hide}
            rightIcon={hide ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setHide((v) => !v)}
            value={pw}
            onChangeText={setPw}
            style={{ marginTop: spacing.xl, marginBottom: spacing.lg }}
          />
          <Input
            label="Re-enter password"
            icon="lock-closed-outline"
            placeholder="••••••••"
            secureTextEntry={hide2}
            rightIcon={hide2 ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setHide2((v) => !v)}
            value={confirm}
            onChangeText={setConfirm}
            style={{ marginBottom: spacing.xl }}
          />

          <Button
            title="Change password"
            disabled={!valid}
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xxl },
  logoBox: {
    width: 84, height: 84, borderRadius: 42, alignSelf: 'center',
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl,
  },
  title: { fontSize: font.h2, fontWeight: '800', textAlign: 'center' },
  sub: { fontSize: font.body, textAlign: 'center', marginTop: spacing.sm },
});
