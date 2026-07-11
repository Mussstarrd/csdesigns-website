/**
 * Exclusion-conflict warning card — [Remove] drops the exclusion,
 * [Keep anyway] dismisses the warning.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing, radius } from '../theme/index.js';
import { GhostButton, Row } from './ui.js';

export default function ConflictWarning({ conflict, onRemove, onKeep }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>⚠ EXCLUSION CONFLICT</Text>
      <Text style={styles.message}>{conflict.message}</Text>
      <Row style={{ marginTop: spacing.sm, gap: spacing.sm }}>
        <GhostButton
          title="REMOVE"
          color={colors.danger}
          onPress={() => onRemove(conflict)}
          style={{ flex: 1 }}
        />
        <GhostButton
          title="KEEP ANYWAY"
          onPress={() => onKeep(conflict)}
          style={{ flex: 1 }}
        />
      </Row>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#FF4D6D14',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.danger,
    fontFamily: fonts.display,
    fontSize: 12,
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  message: { color: colors.text, fontFamily: fonts.body, fontSize: 13, lineHeight: 19 },
});
