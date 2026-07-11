/**
 * Shared UI primitives — studio-equipment aesthetic: dark panels, precise
 * monospace readouts, LED accents. Dark theme only.
 */
import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, spacing, radius } from '../theme/index.js';

export function Screen({ children, scroll = true, style }) {
  const content = scroll ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.scrollContent, style]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.scrollContent, { flex: 1 }, style]}>{children}</View>
  );
  return <SafeAreaView style={styles.safe} edges={['top']}>{content}</SafeAreaView>;
}

export function Card({ children, style, onPress }) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed, style]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children, style }) {
  return <Text style={[styles.sectionTitle, style]}>{children}</Text>;
}

export function Label({ children, style }) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

export function Body({ children, dim, style, ...rest }) {
  return (
    <Text style={[styles.body, dim && { color: colors.textDim }, style]} {...rest}>
      {children}
    </Text>
  );
}

export function Mono({ children, color, style }) {
  return (
    <Text style={[styles.mono, color ? { color } : null, style]}>{children}</Text>
  );
}

export function PrimaryButton({ title, onPress, disabled, style }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryBtn,
        pressed && { opacity: 0.85 },
        disabled && { opacity: 0.35 },
        style,
      ]}
    >
      <Text style={styles.primaryBtnText}>{title}</Text>
    </Pressable>
  );
}

export function GhostButton({ title, onPress, color = colors.textDim, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.ghostBtn, pressed && { opacity: 0.7 }, style]}
    >
      <Text style={[styles.ghostBtnText, { color }]}>{title}</Text>
    </Pressable>
  );
}

export function Chip({ label, selected, onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export function Row({ children, style }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

export function Led({ color, size = 10 }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        shadowColor: color,
        shadowOpacity: 0.9,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 0 },
        elevation: 2,
      }}
    />
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.body },
  scroll: { flex: 1, backgroundColor: colors.body },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardPressed: { backgroundColor: colors.cardRaised },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 20,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.textDim,
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  body: { color: colors.text, fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  mono: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  primaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#04150E',
    fontFamily: fonts.display,
    fontSize: 15,
    letterSpacing: 1,
  },
  ghostBtn: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  ghostBtnText: { fontFamily: fonts.bodyMedium, fontSize: 13, letterSpacing: 0.5 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipSelected: { borderColor: colors.accent, backgroundColor: '#00E5A014' },
  chipText: { color: colors.textDim, fontFamily: fonts.bodyMedium, fontSize: 13 },
  chipTextSelected: { color: colors.accent },
  row: { flexDirection: 'row', alignItems: 'center' },
});
