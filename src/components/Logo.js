import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../state/AppContext';

// MOMENTUM wordmark: a calendar-with-check glyph next to the name,
// matching the logo drawn on the Sign Up / Log In prototype screens.
export default function Logo({ size = 26, showText = true }) {
  const c = useColors();
  return (
    <View style={styles.row}>
      <MaterialCommunityIcons name="calendar-check" size={size + 4} color={c.primary} />
      {showText && (
        <Text style={[styles.text, { fontSize: size, color: c.text }]}>MOMENTUM</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { fontWeight: '800', letterSpacing: 1 },
});
