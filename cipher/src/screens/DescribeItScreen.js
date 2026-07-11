/**
 * Describe It — free-text input → Claude interpretation (via Edge Function)
 * → deterministic assembly. Includes the short-input interception flow and
 * the 🎲 Surprise Me path (deterministic, no LLM).
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, fonts, spacing, radius } from '../theme/index.js';
import {
  Screen,
  SectionTitle,
  Label,
  Body,
  PrimaryButton,
  GhostButton,
  Card,
  Row,
} from '../components/ui.js';
import PlatformSelector from '../components/PlatformSelector.js';
import SeedAudioToggle from '../components/SeedAudioToggle.js';
import { usePromptStore } from '../store/usePromptStore.js';
import { useSettingsStore, DAILY_FREE_LIMIT } from '../store/useSettingsStore.js';
import { useDecoderStore } from '../store/useDecoderStore.js';
import {
  interpretDescription,
  needsInterception,
  DailyLimitError,
} from '../services/claudeInterpreter.js';
import { findArtistInText, describeDna } from '../services/artistDecoder.js';
import { surpriseMe } from '../engine/surpriseMe.js';

const GHOST_EXAMPLES = [
  'e.g., gritty 90s boom bap, vinyl crackle, sparse piano loop, heavy kick...',
  'e.g., dark halftime trap, sliding 808s, eerie music-box melody...',
  'e.g., chopped soul sample, dusty drums, triumphant strings...',
  'e.g., icy minimal drill, skippy kick pattern, cold night air...',
];

export default function DescribeItScreen({ navigation }) {
  const [input, setInput] = useState('');
  const [ghostIndex, setGhostIndex] = useState(0);
  const [platform, setPlatform] = useState(useSettingsStore.getState().defaultPlatform);
  const [seedAudio, setSeedAudio] = useState({ enabled: false, contains: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [interception, setInterception] = useState(null); // {artist, expanded}

  const entries = useDecoderStore((s) => s.entries);
  const runBuild = usePromptStore((s) => s.runBuild);
  const recordAiUsage = useSettingsStore((s) => s.recordAiUsage);
  const aiRemaining = useSettingsStore((s) => s.aiRemaining());

  // Cycling ghost text.
  const timer = useRef(null);
  useEffect(() => {
    timer.current = setInterval(
      () => setGhostIndex((i) => (i + 1) % GHOST_EXAMPLES.length),
      3500
    );
    return () => clearInterval(timer.current);
  }, []);

  const goToOutput = (interpretation, sourceExtra = {}) => {
    runBuild({
      source: { type: 'describe', normalized: input.trim().toLowerCase(), ...sourceExtra },
      interpretation,
      seedAudio,
      platform,
      energy: 3,
    });
    navigation.navigate('Output');
  };

  const buildViaLlm = async (finalInput, context = '') => {
    setLoading(true);
    setError(null);
    try {
      const { interpretation, cached, remaining } = await interpretDescription(
        finalInput,
        context
      );
      if (!cached) recordAiUsage(remaining);
      goToOutput(interpretation);
    } catch (e) {
      if (e instanceof DailyLimitError) {
        navigation.navigate('Paywall');
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const onBuild = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    // Short-input interception: expand via the Artist Decoder and confirm.
    const artist = findArtistInText(trimmed, entries);
    if (needsInterception(trimmed, artist) && artist) {
      setInterception({ artist, expanded: describeDna(artist) });
      return;
    }
    if (needsInterception(trimmed, artist)) {
      setError('Give me a little more — at least a few words about drums, mood, or era.');
      return;
    }
    buildViaLlm(trimmed);
  };

  const onSurprise = () => {
    const interpretation = surpriseMe();
    runBuild({
      source: { type: 'surprise', comboRegion: interpretation._surprise?.region },
      interpretation,
      seedAudio,
      platform,
      energy: 3,
    });
    navigation.navigate('Output');
  };

  return (
    <Screen>
      <SectionTitle>✏️ Describe It</SectionTitle>
      <Body dim style={{ marginBottom: spacing.md }}>
        {aiRemaining}/{DAILY_FREE_LIMIT} AI generations left today · Build It is always free
      </Body>

      <TextInput
        style={styles.input}
        multiline
        textAlignVertical="top"
        placeholder={GHOST_EXAMPLES[ghostIndex]}
        placeholderTextColor={colors.textDim}
        value={input}
        onChangeText={(t) => {
          setInput(t);
          setInterception(null);
          setError(null);
        }}
      />

      {interception && (
        <Card style={{ borderColor: colors.accent }}>
          <Label>Did you mean</Label>
          <Body style={{ marginBottom: spacing.sm }}>
            {interception.artist.era_label}: {interception.expanded}
          </Body>
          <Row style={{ gap: spacing.sm }}>
            <PrimaryButton
              title="YES, BUILD IT"
              style={{ flex: 1 }}
              onPress={() =>
                buildViaLlm(
                  `${input.trim()} — expanded: ${interception.expanded}`,
                  `Sonic DNA for "${interception.artist.era_label}": ${JSON.stringify({
                    bpm: [interception.artist.bpm_min, interception.artist.bpm_max],
                    key: interception.artist.key_preference,
                    percussion: interception.artist.percussion_dna,
                    low_end: interception.artist.low_end_dna,
                    lead: interception.artist.lead_dna,
                    room: interception.artist.room_dna,
                    energy: interception.artist.energy_dna,
                    avoid: interception.artist.avoid_list,
                    anchors: interception.artist.anchor_tokens,
                  })}`
                )
              }
            />
            <GhostButton
              title="LET ME EDIT"
              style={{ flex: 1 }}
              onPress={() => setInterception(null)}
            />
          </Row>
        </Card>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <Label style={{ marginTop: spacing.sm }}>Platform</Label>
      <View style={{ marginBottom: spacing.md }}>
        <PlatformSelector value={platform} onChange={setPlatform} />
      </View>

      <SeedAudioToggle value={seedAudio} onChange={setSeedAudio} />

      {loading ? (
        <ActivityIndicator color={colors.accent} size="large" style={{ marginVertical: 20 }} />
      ) : (
        <>
          <PrimaryButton title="BUILD PROMPT →" onPress={onBuild} disabled={!input.trim()} />
          <GhostButton
            title="🎲 SURPRISE ME"
            onPress={onSurprise}
            style={{ marginTop: spacing.sm }}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: 140,
    marginBottom: spacing.md,
  },
  error: {
    color: colors.danger,
    fontFamily: fonts.body,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
});
