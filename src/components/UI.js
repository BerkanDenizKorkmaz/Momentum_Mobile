import React from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../state/AppContext';
import { radius, spacing, font } from '../theme';

// Opens the drawer whether the screen is a direct drawer child (navigation
// has openDrawer) or nested inside a stack (the parent drawer has it).
export const openDrawer = (navigation) =>
  navigation.openDrawer ? navigation.openDrawer() : navigation.getParent()?.openDrawer?.();

// --- Screen wrapper -------------------------------------------------------
export function Screen({ children, style, edges = ['top', 'bottom'], scroll }) {
  const c = useColors();
  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: c.bg }, style]}>
      {children}
    </SafeAreaView>
  );
}

// --- Top bar / header -----------------------------------------------------
export function Header({ title, onBack, onMenu, right, center }) {
  const c = useColors();
  return (
    <View style={styles.header}>
      <View style={styles.headerSide}>
        {onBack && (
          <IconButton name="chevron-back" onPress={onBack} />
        )}
        {onMenu && (
          <IconButton name="menu" onPress={onMenu} />
        )}
      </View>
      <View style={styles.headerCenter}>
        {center || <Text style={[styles.headerTitle, { color: c.text }]}>{title}</Text>}
      </View>
      <View style={[styles.headerSide, { alignItems: 'flex-end' }]}>{right}</View>
    </View>
  );
}

export function IconButton({ name, onPress, color, size = 24, bg, style, lib = 'ion' }) {
  const c = useColors();
  const Icon = lib === 'mc' ? MaterialCommunityIcons : Ionicons;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.iconBtn,
        bg && { backgroundColor: bg },
        pressed && { opacity: 0.6 },
        style,
      ]}
    >
      <Icon name={name} size={size} color={color || c.text} />
    </Pressable>
  );
}

// --- Button ---------------------------------------------------------------
export function Button({ title, onPress, variant = 'primary', icon, loading, disabled, style }) {
  const c = useColors();
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';
  const isOutline = variant === 'outline';

  const bg = isPrimary ? c.primary : isOutline ? 'transparent' : c.cardAlt;
  const fg = isPrimary ? '#fff' : isGhost || isOutline ? c.primary : c.text;

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: isGhost ? 'transparent' : bg },
        isOutline && { borderWidth: 1.5, borderColor: c.primary },
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.buttonInner}>
          {icon && <Ionicons name={icon} size={18} color={fg} />}
          <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

// --- Text input -----------------------------------------------------------
export function Input({ label, icon, iconLib, rightIcon, onRightIconPress, style, ...props }) {
  const c = useColors();
  return (
    <View style={style}>
      {label ? <Text style={[styles.inputLabel, { color: c.textMuted }]}>{label}</Text> : null}
      <View style={[styles.inputWrap, { backgroundColor: c.inputBg, borderColor: c.border }]}>
        {icon && (
          (iconLib === 'mc' ? (
            <MaterialCommunityIcons name={icon} size={20} color={c.textMuted} />
          ) : (
            <Ionicons name={icon} size={20} color={c.textMuted} />
          ))
        )}
        <TextInput
          placeholderTextColor={c.textFaint}
          style={[styles.input, { color: c.text }]}
          {...props}
        />
        {rightIcon && (
          <Pressable onPress={onRightIconPress} hitSlop={8}>
            <Ionicons name={rightIcon} size={20} color={c.textMuted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

// --- Card -----------------------------------------------------------------
export function Card({ children, style, onPress }) {
  const c = useColors();
  const inner = (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, style]}>
      {children}
    </View>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.85 }}>
        {inner}
      </Pressable>
    );
  }
  return inner;
}

// --- Flame badge ----------------------------------------------------------
export function Flame({ count, size = 18, color }) {
  const c = useColors();
  return (
    <View style={styles.flame}>
      <MaterialCommunityIcons name="fire" size={size} color={color || c.flame} />
      {count != null && (
        <Text style={[styles.flameText, { color: c.text, fontSize: size * 0.78 }]}>{count}</Text>
      )}
    </View>
  );
}

export function SectionLabel({ children, style }) {
  const c = useColors();
  return (
    <Text style={[styles.sectionLabel, { color: c.textMuted }, style]}>{children}</Text>
  );
}

export function Divider() {
  const c = useColors();
  return <View style={{ height: 1, backgroundColor: c.border }} />;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 52,
  },
  headerSide: { width: 80, justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: font.h3, fontWeight: '700' },
  iconBtn: { padding: 4 },

  button: {
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  buttonInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText: { fontSize: font.title, fontWeight: '700' },

  inputLabel: { fontSize: font.small, fontWeight: '600', marginBottom: 6, marginLeft: 2 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  input: { flex: 1, fontSize: font.body, paddingVertical: 0 },

  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },

  flame: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  flameText: { fontWeight: '700' },

  sectionLabel: {
    fontSize: font.small,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
});
