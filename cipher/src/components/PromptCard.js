/**
 * A copyable, in-place-editable prompt field card. The character counter and
 * forbidden-word validation run live on every edit (wired by the parent via
 * onChangeText → store.applyEdit).
 */
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { colors, fonts, spacing, radius } from '../theme/index.js';
import { GhostButton, Label, Row } from './ui.js';
import CharCounter from './CharCounter.js';

export default function PromptCard({
  title,
  text,
  onChangeText,
  showCounter = false,
  counterLimit,
  editable = true,
  multilineHeight = 120,
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await Clipboard.setStringAsync(text ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <View style={styles.card}>
      <Row style={{ marginBottom: spacing.xs }}>
        <Label style={{ marginBottom: 0 }}>{title}</Label>
        <View style={{ marginLeft: 'auto' }}>
          {showCounter && <CharCounter count={(text ?? '').length} limit={counterLimit} />}
        </View>
      </Row>
      {editable ? (
        <TextInput
          style={[styles.input, { minHeight: multilineHeight }]}
          value={text ?? ''}
          onChangeText={onChangeText}
          multiline
          textAlignVertical="top"
          placeholderTextColor={colors.textDim}
        />
      ) : (
        <Text style={styles.static}>{text}</Text>
      )}
      <GhostButton
        title={copied ? '✓ COPIED' : 'COPY'}
        color={copied ? colors.accent : colors.text}
        onPress={copy}
        style={{ marginTop: spacing.sm }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  input: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 13,
    lineHeight: 19,
    backgroundColor: colors.body,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  static: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 13,
    lineHeight: 19,
  },
});
