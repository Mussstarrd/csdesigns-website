/** Home / Create — three entry-point cards + Recent Prompts strip. */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { colors, fonts, spacing } from '../theme/index.js';
import { Screen, Card, Body, Label, GhostButton, Row } from '../components/ui.js';
import { useVaultStore } from '../store/useVaultStore.js';

const ENTRY_POINTS = [
  {
    key: 'DescribeIt',
    icon: '✏️',
    title: 'DESCRIBE IT',
    subtitle: 'Type what you hear in your head — CIPHER translates it into rule-compliant tags.',
  },
  {
    key: 'BuildIt',
    icon: '🎛️',
    title: 'BUILD IT',
    subtitle: 'Pick artist sounds, regions, vibes. Instant, offline, unlimited.',
  },
  {
    key: 'BlendIt',
    icon: '⚡',
    title: 'BLEND IT',
    subtitle: 'Foundation drums + Texture melody. Two sounds, one coherent prompt.',
  },
];

export default function HomeScreen({ navigation }) {
  const recent = useVaultStore((s) => s.recentVersions(3));

  return (
    <Screen>
      <Text style={styles.logo}>CIPHER</Text>
      <Text style={styles.tagline}>PROMPT ENGINEERING, DECODED</Text>

      {ENTRY_POINTS.map((entry) => (
        <Card key={entry.key} onPress={() => navigation.navigate(entry.key)}>
          <Row>
            <Text style={styles.icon}>{entry.icon}</Text>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.cardTitle}>{entry.title}</Text>
              <Body dim style={{ marginTop: 2 }}>{entry.subtitle}</Body>
            </View>
          </Row>
        </Card>
      ))}

      {recent.length > 0 && (
        <View style={{ marginTop: spacing.md }}>
          <Label>Recent Prompts</Label>
          {recent.map(({ session, version }) => {
            const text = version.suno?.stylePrompt ?? version.mureka?.musicStyle ?? '';
            return (
              <Card key={version.id} style={{ paddingVertical: spacing.sm }}>
                <Body numberOfLines={2} dim>{text}</Body>
                <Row style={{ marginTop: spacing.sm }}>
                  <Body dim style={{ fontSize: 11, flex: 1 }}>{session.label}</Body>
                  <GhostButton
                    title="COPY"
                    onPress={() => Clipboard.setStringAsync(text)}
                    style={{ paddingVertical: 6, paddingHorizontal: 12 }}
                  />
                </Row>
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 34,
    letterSpacing: 8,
    marginTop: spacing.md,
  },
  tagline: {
    color: colors.accent,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 3,
    marginBottom: spacing.lg,
  },
  icon: { fontSize: 28 },
  cardTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 16,
    letterSpacing: 1.5,
  },
});
