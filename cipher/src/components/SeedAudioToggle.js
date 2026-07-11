/**
 * Seed Audio Context — "I'm uploading audio to the platform" toggle plus the
 * contents multi-select. When categories are selected, the assembler omits
 * the corresponding DNA and adds complement language instead.
 */
import React from 'react';
import { View, Switch, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme/index.js';
import { SEED_AUDIO_CATEGORIES, SEED_AUDIO_LABELS } from '../engine/seedAudio.js';
import { Body, Label, Chip, Row } from './ui.js';

export default function SeedAudioToggle({ value, onChange }) {
  const { enabled, contains } = value;

  const toggleCategory = (cat) => {
    const next = contains.includes(cat)
      ? contains.filter((c) => c !== cat)
      : [...contains, cat];
    onChange({ enabled, contains: next });
  };

  return (
    <View style={styles.wrap}>
      <Row>
        <Body style={{ flex: 1 }}>I'm uploading audio to the platform</Body>
        <Switch
          value={enabled}
          onValueChange={(v) => onChange({ enabled: v, contains: v ? contains : [] })}
          trackColor={{ false: colors.border, true: colors.accent }}
          thumbColor={colors.text}
        />
      </Row>
      {enabled && (
        <View style={{ marginTop: spacing.sm }}>
          <Label>What does your audio contain?</Label>
          <Row style={{ flexWrap: 'wrap' }}>
            {SEED_AUDIO_CATEGORIES.map((cat) => (
              <Chip
                key={cat}
                label={SEED_AUDIO_LABELS[cat]}
                selected={contains.includes(cat)}
                onPress={() => toggleCategory(cat)}
              />
            ))}
          </Row>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
});
