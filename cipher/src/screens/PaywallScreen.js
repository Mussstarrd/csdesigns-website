/**
 * Pro paywall — STUB. v1 builds the counter and the gate, not payments.
 * The deterministic paths stay unlimited; only Describe It is metered.
 */
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../theme/index.js';
import { Screen, Card, Body, PrimaryButton, GhostButton } from '../components/ui.js';
import { DAILY_FREE_LIMIT } from '../store/useSettingsStore.js';

export default function PaywallScreen({ navigation }) {
  return (
    <Screen>
      <Text style={styles.title}>DAILY LIMIT REACHED</Text>
      <Body dim style={{ marginBottom: spacing.lg }}>
        You've used all {DAILY_FREE_LIMIT} free AI generations today. They reset at
        midnight — or go Pro for unlimited.
      </Body>

      <Card style={{ borderColor: colors.accent }}>
        <Text style={styles.pro}>CIPHER PRO</Text>
        <Body style={{ marginBottom: 4 }}>· Unlimited AI (Describe It) generations</Body>
        <Body style={{ marginBottom: 4 }}>· Priority access to new Artist Decoder entries</Body>
        <Body style={{ marginBottom: spacing.md }}>· Early access to new platform rulesets</Body>
        <PrimaryButton title="COMING SOON" disabled onPress={() => {}} />
      </Card>

      <Body dim style={{ marginBottom: spacing.md }}>
        Meanwhile: Build It and Blend It are deterministic — no AI call, no limit,
        and they work offline.
      </Body>
      <GhostButton
        title="→ USE BUILD IT INSTEAD"
        color={colors.accent}
        onPress={() => navigation.navigate('BuildIt')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.danger,
    fontFamily: fonts.display,
    fontSize: 22,
    letterSpacing: 2,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  pro: {
    color: colors.accent,
    fontFamily: fonts.display,
    fontSize: 16,
    letterSpacing: 3,
    marginBottom: spacing.sm,
  },
});
