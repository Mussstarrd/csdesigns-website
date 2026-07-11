/**
 * Live character counter — monospace, LED-color-coded.
 * green <900 · yellow 900-970 · red 970-990 (hard ceiling).
 */
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { charCountBand } from '../engine/validator.js';
import { SUNO_HARD_CEILING } from '../engine/promptAssembler.js';
import { colors, fonts } from '../theme/index.js';

const BAND_COLORS = { green: colors.accent, yellow: colors.warn, red: colors.danger };

export default function CharCounter({ count, limit = SUNO_HARD_CEILING }) {
  const band = charCountBand(count);
  return (
    <Text style={[styles.counter, { color: BAND_COLORS[band] }]}>
      {String(count).padStart(3, '0')}/{limit}
    </Text>
  );
}

const styles = StyleSheet.create({
  counter: { fontFamily: fonts.mono, fontSize: 12, letterSpacing: 1 },
});
