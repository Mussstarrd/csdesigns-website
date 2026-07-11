/**
 * Collapsible Fine-Tune Overrides: BPM (number or Auto), Key dropdown,
 * Energy 1-5, Vocal pocket toggle, Instrumental toggle.
 */
import React, { useState } from 'react';
import { View, Text, TextInput, Switch, Pressable, StyleSheet } from 'react-native';
import { colors, fonts, spacing, radius } from '../theme/index.js';
import { KEY_OPTIONS } from '../data/vibes.js';
import { Body, Label, Row, Chip } from './ui.js';

export default function FineTuneOverrides({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [keysOpen, setKeysOpen] = useState(false);
  const set = (patch) => onChange({ ...value, ...patch });

  return (
    <View style={styles.wrap}>
      <Pressable onPress={() => setOpen(!open)} style={styles.header}>
        <Label style={{ marginBottom: 0 }}>Fine-Tune Overrides</Label>
        <Text style={styles.caret}>{open ? '▾' : '▸'}</Text>
      </Pressable>

      {open && (
        <View style={{ marginTop: spacing.sm }}>
          <Row style={{ marginBottom: spacing.sm }}>
            <Label style={{ flex: 1, marginBottom: 0 }}>BPM</Label>
            <TextInput
              style={styles.bpmInput}
              keyboardType="number-pad"
              placeholder="Auto"
              placeholderTextColor={colors.textDim}
              value={value.bpm != null ? String(value.bpm) : ''}
              onChangeText={(t) => {
                const n = parseInt(t, 10);
                set({ bpm: Number.isFinite(n) ? n : null });
              }}
            />
          </Row>

          <Pressable onPress={() => setKeysOpen(!keysOpen)}>
            <Row style={{ marginBottom: spacing.sm }}>
              <Label style={{ flex: 1, marginBottom: 0 }}>Key</Label>
              <Text style={styles.keyValue}>{value.key ?? 'Auto'} {keysOpen ? '▾' : '▸'}</Text>
            </Row>
          </Pressable>
          {keysOpen && (
            <Row style={{ flexWrap: 'wrap', marginBottom: spacing.sm }}>
              {KEY_OPTIONS.map((k) => (
                <Chip
                  key={k}
                  label={k}
                  selected={(value.key ?? 'Auto') === k}
                  onPress={() => {
                    set({ key: k === 'Auto' ? null : k });
                    setKeysOpen(false);
                  }}
                />
              ))}
            </Row>
          )}

          <Label>Energy</Label>
          <Row style={{ marginBottom: spacing.sm }}>
            {[1, 2, 3, 4, 5].map((level) => (
              <Pressable
                key={level}
                onPress={() => set({ energy: level })}
                style={[styles.energyDot, (value.energy ?? 3) >= level && styles.energyDotOn]}
              >
                <Text
                  style={[
                    styles.energyText,
                    (value.energy ?? 3) >= level && { color: '#04150E' },
                  ]}
                >
                  {level}
                </Text>
              </Pressable>
            ))}
          </Row>

          <Row style={{ marginBottom: spacing.sm }}>
            <Body style={{ flex: 1 }}>Instrumental</Body>
            <Switch
              value={value.instrumental !== false}
              onValueChange={(v) => set({ instrumental: v })}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={colors.text}
            />
          </Row>

          {value.instrumental === false && (
            <Row>
              <Body style={{ flex: 1 }}>Vocal pocket (tucked behind the beat)</Body>
              <Switch
                value={value.vocalPocket === true}
                onValueChange={(v) => set({ vocalPocket: v })}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.text}
              />
            </Row>
          )}
        </View>
      )}
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  caret: { color: colors.textDim, fontSize: 14 },
  bpmInput: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 14,
    backgroundColor: colors.body,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 80,
    textAlign: 'center',
  },
  keyValue: { color: colors.text, fontFamily: fonts.mono, fontSize: 13 },
  energyDot: {
    width: 40,
    height: 32,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    backgroundColor: colors.body,
  },
  energyDotOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  energyText: { color: colors.textDim, fontFamily: fonts.mono, fontSize: 13 },
});
