/** SUNO | MUREKA | BOTH segmented selector (default BOTH). */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fonts, radius } from '../theme/index.js';

const OPTIONS = [
  { key: 'suno', label: 'SUNO' },
  { key: 'mureka', label: 'MUREKA' },
  { key: 'both', label: 'BOTH' },
];

export default function PlatformSelector({ value, onChange }) {
  return (
    <View style={styles.wrap}>
      {OPTIONS.map((opt) => {
        const selected = value === opt.key;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={[styles.segment, selected && styles.segmentSelected]}
          >
            <Text style={[styles.text, selected && styles.textSelected]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
  },
  segment: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: radius.sm - 2 },
  segmentSelected: { backgroundColor: '#00E5A01F' },
  text: { color: colors.textDim, fontFamily: fonts.display, fontSize: 12, letterSpacing: 1 },
  textSelected: { color: colors.accent },
});
