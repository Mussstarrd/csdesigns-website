/**
 * Suno slider starting points per build type (D6 of docs/V2_SPEC.md).
 * Static at launch, explicitly labeled as unverified starting points —
 * same epistemic tier as everything the Learning System hasn't confirmed.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing, radius } from '../theme/index.js';
import { SLIDER_DEFAULTS } from '../data/recipes.js';
import { Label, Row } from './ui.js';

function Meter({ label, value }) {
  return (
    <View style={{ flex: 1 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text style={styles.meterLabel}>{label}</Text>
        <Text style={styles.meterValue}>{value}%</Text>
      </Row>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${value}%` }]} />
      </View>
    </View>
  );
}

export default function SliderRecs({ grooveStyle, sliders }) {
  const rec = sliders ?? SLIDER_DEFAULTS[grooveStyle] ?? SLIDER_DEFAULTS.default;
  return (
    <View style={styles.wrap}>
      <Label>Suno slider starting points</Label>
      <Row style={{ gap: spacing.md }}>
        <Meter label="WEIRDNESS" value={rec.weirdness} />
        <Meter label="STYLE INFLUENCE" value={rec.styleInfluence} />
      </Row>
      <Text style={styles.note}>
        Starting points, not gospel — set in Custom Mode → Advanced Options,
        nudge one at a time. Rate your generations and these get smarter.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  meterLabel: { color: colors.textDim, fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1 },
  meterValue: { color: colors.accent, fontFamily: fonts.mono, fontSize: 11 },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.body,
    marginTop: 4,
    overflow: 'hidden',
  },
  fill: { height: 6, borderRadius: 3, backgroundColor: colors.accent },
  note: {
    color: colors.textDim,
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
    marginTop: spacing.sm,
  },
});
