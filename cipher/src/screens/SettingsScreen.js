/**
 * Settings — defaults, Style Profile readout, Freshness Guard, My Taste
 * Protection, Traffic Light timezone display, Artist Decoder browse +
 * suggest form, free-tier usage.
 */
import React, { useState } from 'react';
import { View, Text, TextInput, Switch, StyleSheet } from 'react-native';
import { colors, fonts, spacing, radius } from '../theme/index.js';
import {
  Screen,
  SectionTitle,
  Card,
  Label,
  Body,
  Row,
  Chip,
  GhostButton,
  PrimaryButton,
  Mono,
} from '../components/ui.js';
import PlatformSelector from '../components/PlatformSelector.js';
import { useSettingsStore, DAILY_FREE_LIMIT } from '../store/useSettingsStore.js';
import { useDecoderStore } from '../store/useDecoderStore.js';
import { suggestArtist } from '../services/artistDecoder.js';
import { cetHour } from '../engine/trafficLight.js';

export default function SettingsScreen({ navigation }) {
  const settings = useSettingsStore();
  const styleProfile = settings.styleProfile();
  const decoderSource = useDecoderStore((s) => s.source);
  const entryCount = useDecoderStore((s) => s.entries.length);

  const [suggestName, setSuggestName] = useState('');
  const [suggestEra, setSuggestEra] = useState('');
  const [suggestState, setSuggestState] = useState(null); // 'sent' | 'error'

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'unknown';

  const submitSuggestion = async () => {
    try {
      await suggestArtist({ artistName: suggestName.trim(), eraHint: suggestEra.trim() });
      setSuggestState('sent');
      setSuggestName('');
      setSuggestEra('');
    } catch {
      setSuggestState('error');
    }
  };

  return (
    <Screen>
      <SectionTitle>Settings</SectionTitle>

      <Card>
        <Label>Default platform output</Label>
        <PlatformSelector
          value={settings.defaultPlatform}
          onChange={settings.setDefaultPlatform}
        />
      </Card>

      <Card>
        <Label>Style Profile</Label>
        {styleProfile ? (
          <>
            <Row style={{ justifyContent: 'space-between' }}>
              <Body dim>Home BPM range</Body>
              <Mono color={colors.accent}>
                {styleProfile.bpmRange ? `${styleProfile.bpmRange[0]}–${styleProfile.bpmRange[1]}` : '—'}
              </Mono>
            </Row>
            <Row style={{ justifyContent: 'space-between', marginTop: 6 }}>
              <Body dim>Preferred key</Body>
              <Mono color={colors.accent}>{styleProfile.preferredKey ?? '—'}</Mono>
            </Row>
            <Row style={{ justifyContent: 'space-between', marginTop: 6 }}>
              <Body dim>Home region</Body>
              <Mono color={colors.accent}>{styleProfile.homeRegion ?? '—'}</Mono>
            </Row>
            <Body dim style={{ fontSize: 11, marginTop: spacing.sm }}>
              Learned from your last {styleProfile.promptCount} prompts — used as Build It
              smart defaults.
            </Body>
          </>
        ) : (
          <Body dim>
            Learns automatically after 10 prompts: your home BPM range, preferred keys
            and region become Build It smart defaults. ({settings.promptHistory.length}/10)
          </Body>
        )}
      </Card>

      <Card>
        <Label>Freshness Guard</Label>
        <Body dim style={{ marginBottom: spacing.sm }}>Memory window (prompts compared)</Body>
        <Row style={{ flexWrap: 'wrap' }}>
          {[5, 10, 20].map((n) => (
            <Chip
              key={n}
              label={String(n)}
              selected={settings.freshnessWindow === n}
              onPress={() => settings.setFreshnessWindow(n)}
            />
          ))}
        </Row>
        <Row style={{ marginTop: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Body>My Taste Protection</Body>
            <Body dim style={{ fontSize: 11, marginTop: 2 }}>
              Warns at Yellow instead of Red. Suno's My Taste feature permanently learns
              repeated descriptors on your account.
            </Body>
          </View>
          <Switch
            value={settings.myTasteProtection}
            onValueChange={settings.setMyTasteProtection}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={colors.text}
          />
        </Row>
      </Card>

      <Card>
        <Label>Traffic Light</Label>
        <Row style={{ justifyContent: 'space-between' }}>
          <Body dim>Your timezone (auto-detected)</Body>
          <Mono color={colors.text}>{timezone}</Mono>
        </Row>
        <Row style={{ justifyContent: 'space-between', marginTop: 6 }}>
          <Body dim>Current CET hour</Body>
          <Mono color={colors.text}>{String(cetHour()).padStart(2, '0')}:00</Mono>
        </Row>
      </Card>

      <Card>
        <Label>Artist Decoder</Label>
        <Row style={{ justifyContent: 'space-between', marginBottom: spacing.sm }}>
          <Body dim>{entryCount} artist-era entries</Body>
          <Mono>{decoderSource === 'network' ? 'LIVE' : decoderSource === 'cache' ? 'CACHED' : 'BUNDLED'}</Mono>
        </Row>
        <GhostButton
          title="BROWSE DATABASE"
          onPress={() => navigation.navigate('ArtistBrowser')}
          style={{ marginBottom: spacing.md }}
        />
        <Label>Suggest an artist</Label>
        <TextInput
          style={styles.input}
          placeholder="Artist name"
          placeholderTextColor={colors.textDim}
          value={suggestName}
          onChangeText={setSuggestName}
        />
        <TextInput
          style={styles.input}
          placeholder="Era (optional) — e.g. 'mixtape run 2009-2011'"
          placeholderTextColor={colors.textDim}
          value={suggestEra}
          onChangeText={setSuggestEra}
        />
        <PrimaryButton
          title={suggestState === 'sent' ? '✓ SENT' : 'SUGGEST'}
          onPress={submitSuggestion}
          disabled={!suggestName.trim() || suggestState === 'sent'}
        />
        {suggestState === 'error' && (
          <Text style={styles.error}>Couldn't send — check your connection.</Text>
        )}
      </Card>

      <Card>
        <Label>Usage</Label>
        <Row style={{ justifyContent: 'space-between' }}>
          <Body dim>AI generations remaining today</Body>
          <Mono color={settings.aiRemaining() > 0 ? colors.accent : colors.danger}>
            {settings.aiRemaining()}/{DAILY_FREE_LIMIT}
          </Mono>
        </Row>
        <Body dim style={{ fontSize: 11, marginTop: spacing.sm }}>
          Build It and Blend It are deterministic and always unlimited.
        </Body>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 14,
    backgroundColor: colors.body,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  error: { color: colors.danger, fontFamily: fonts.body, fontSize: 12, marginTop: spacing.sm },
});
