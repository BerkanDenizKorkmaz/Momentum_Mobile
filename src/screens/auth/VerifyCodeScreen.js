import React, { useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen, Header, Button } from '../../components/UI';
import { useApp } from '../../state/AppContext';
import { spacing, font, radius } from '../../theme';

const LENGTH = 6;

export default function VerifyCodeScreen({ navigation, route }) {
  const { colors: c, login } = useApp();
  const { email = 'you@example.com', mode = 'signup', fullName } = route.params || {};
  const [digits, setDigits] = useState(Array(LENGTH).fill(''));
  const inputs = useRef([]);

  const onChange = (text, i) => {
    const v = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < LENGTH - 1) inputs.current[i + 1]?.focus();
  };

  const onKey = (e, i) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const onVerify = () => {
    if (mode === 'reset') {
      navigation.navigate('ResetPassword', { email });
    } else {
      login({ fullName: fullName || 'New User', email });
    }
  };

  const filled = digits.every((d) => d !== '');

  return (
    <Screen>
      <Header onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.body}>
          <View style={[styles.logoBox, { backgroundColor: c.primarySoft }]}>
            <MaterialCommunityIcons name="email-check-outline" size={38} color={c.primary} />
          </View>
          <Text style={[styles.title, { color: c.text }]}>Verify your email</Text>
          <Text style={[styles.sub, { color: c.textMuted }]}>
            Enter the 6-digit verification code sent to{'\n'}
            <Text style={{ fontWeight: '700', color: c.text }}>{email}</Text>
          </Text>

          <View style={styles.codeRow}>
            {digits.map((d, i) => (
              <TextInput
                key={i}
                ref={(el) => (inputs.current[i] = el)}
                value={d}
                onChangeText={(t) => onChange(t, i)}
                onKeyPress={(e) => onKey(e, i)}
                keyboardType="number-pad"
                maxLength={1}
                style={[
                  styles.codeBox,
                  { borderColor: d ? c.primary : c.border, color: c.text, backgroundColor: c.inputBg },
                ]}
              />
            ))}
          </View>

          <Button title="Verify Code" onPress={onVerify} disabled={!filled} style={{ marginTop: spacing.xl }} />

          <View style={styles.resendRow}>
            <Text style={{ color: c.textMuted, fontSize: font.small }}>Didn't receive any code? </Text>
            <Pressable>
              <Text style={[styles.link, { color: c.primary }]}>Resend Code</Text>
            </Pressable>
          </View>
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
  sub: { fontSize: font.body, textAlign: 'center', marginTop: spacing.sm, lineHeight: 21 },
  codeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xxl, gap: spacing.sm },
  codeBox: {
    flex: 1, height: 56, borderWidth: 1.5, borderRadius: radius.md,
    textAlign: 'center', fontSize: font.h3, fontWeight: '700',
  },
  resendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  link: { fontSize: font.small, fontWeight: '700' },
});
