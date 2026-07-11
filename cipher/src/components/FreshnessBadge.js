/**
 * Freshness score badge. Green 80-100 · Yellow 50-79 · Red <50.
 * "approximate" marks the Jaccard fallback (embeddings unreachable).
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme/index.js';
import { Led } from './ui.js';

const BAND_COLORS = { green: colors.accent, yellow: colors.warn, red: colors.danger };

export default function FreshnessBadge({ freshness }) {
  if (!freshness) return null;
  const color = BAND_COLORS[freshness.band] ?? colors.textDim;
  return (
    <View style={styles.wrap}>
      <Led color={color} size={8} />
      <Text style={[styles.score, { color }]}>{freshness.score}</Text>
      <Text style={styles.caption}>
        FRESH{freshness.approximate ? ' (approx.)' : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  score: { fontFamily: fonts.mono, fontSize: 14, fontWeight: '700' },
  caption: { color: colors.textDim, fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1 },
});
