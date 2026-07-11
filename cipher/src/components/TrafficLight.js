/**
 * Traffic Light server-load indicator — always visible on the Output screen.
 * v1 uses the client-side CET time heuristic; swap `useTrafficLight`'s data
 * source for a server-load API later without touching the render.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { trafficLightState } from '../engine/trafficLight.js';
import { colors, fonts, spacing, radius } from '../theme/index.js';
import { Led } from './ui.js';

const LED_COLORS = { red: colors.danger, yellow: colors.warn, green: colors.accent };

function useTrafficLight() {
  const [state, setState] = useState(() => trafficLightState());
  useEffect(() => {
    const timer = setInterval(() => setState(trafficLightState()), 60_000);
    return () => clearInterval(timer);
  }, []);
  return state;
}

export default function TrafficLight() {
  const { state, label, message } = useTrafficLight();
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Led color={LED_COLORS[state]} />
        <Text style={[styles.label, { color: LED_COLORS[state] }]}>{label}</Text>
        <Text style={styles.sub}>SERVER LOAD</Text>
      </View>
      <Text style={styles.message}>{message}</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  label: { fontFamily: fonts.display, fontSize: 13, letterSpacing: 1.5, marginLeft: 8 },
  sub: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    marginLeft: 'auto',
  },
  message: { color: colors.textDim, fontFamily: fonts.body, fontSize: 12, lineHeight: 17 },
});
