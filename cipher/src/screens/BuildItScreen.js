/**
 * Build It — the fully deterministic sound picker. Chip selections map
 * directly to DNA entries; the assembler builds from them with NO Claude
 * call. This is the unlimited free-tier path and must feel instant.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../theme/index.js';
import {
  Screen,
  SectionTitle,
  Label,
  Body,
  PrimaryButton,
  Chip,
  Row,
} from '../components/ui.js';
import PlatformSelector from '../components/PlatformSelector.js';
import SeedAudioToggle from '../components/SeedAudioToggle.js';
import FineTuneOverrides from '../components/FineTuneOverrides.js';
import DecoderPickerModal from '../components/DecoderPickerModal.js';
import { REGION_ERA_CHIPS, VIBE_CHIPS, PRODUCTION_STYLE_CHIPS } from '../data/vibes.js';
import { buildFromChips } from '../engine/chipBuilder.js';
import { usePromptStore } from '../store/usePromptStore.js';
import { useSettingsStore } from '../store/useSettingsStore.js';

export default function BuildItScreen({ navigation }) {
  const styleProfile = useSettingsStore((s) => s.styleProfile());
  const [artistDna, setArtistDna] = useState(null);
  const [regionChip, setRegionChip] = useState(null);
  const [vibeChip, setVibeChip] = useState(null);
  const [productionChip, setProductionChip] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [platform, setPlatform] = useState(useSettingsStore.getState().defaultPlatform);
  const [seedAudio, setSeedAudio] = useState({ enabled: false, contains: [] });
  // Style Profile becomes the smart default once learned (10+ prompts).
  const [overrides, setOverrides] = useState({
    bpm: null,
    key: styleProfile?.preferredKey ?? null,
    energy: 3,
    instrumental: true,
    vocalPocket: false,
  });

  const runBuild = usePromptStore((s) => s.runBuild);
  const canBuild = artistDna || regionChip || vibeChip || productionChip;

  const onBuild = () => {
    const chips = { artistDna, regionChip, vibeChip, productionChip };
    const interpretation = buildFromChips(chips, overrides);
    runBuild({
      source: { type: 'build', chips, overrides },
      interpretation,
      seedAudio,
      platform,
      energy: overrides.energy,
    });
    navigation.navigate('Output');
  };

  const toggle = (current, setter) => (chip) =>
    setter(current?.id === chip.id ? null : chip);

  return (
    <Screen>
      <SectionTitle>🎛️ Build It</SectionTitle>
      <Body dim style={{ marginBottom: spacing.md }}>
        Deterministic — no AI call, unlimited, works offline.
      </Body>

      <Label>Artist Sound</Label>
      <Row style={{ flexWrap: 'wrap', marginBottom: spacing.sm }}>
        <Chip
          label={artistDna ? `${artistDna.artist_name} · ${artistDna.era_label}` : '+ Pick an artist-era'}
          selected={!!artistDna}
          onPress={() => (artistDna ? setArtistDna(null) : setPickerOpen(true))}
        />
      </Row>

      <Label>Region-Era</Label>
      <Row style={{ flexWrap: 'wrap', marginBottom: spacing.sm }}>
        {REGION_ERA_CHIPS.map((chip) => (
          <Chip
            key={chip.id}
            label={chip.label}
            selected={regionChip?.id === chip.id}
            onPress={() => toggle(regionChip, setRegionChip)(chip)}
          />
        ))}
      </Row>

      <Label>Vibe</Label>
      <Row style={{ flexWrap: 'wrap', marginBottom: spacing.sm }}>
        {VIBE_CHIPS.map((chip) => (
          <Chip
            key={chip.id}
            label={chip.label}
            selected={vibeChip?.id === chip.id}
            onPress={() => toggle(vibeChip, setVibeChip)(chip)}
          />
        ))}
      </Row>

      <Label>Production Style</Label>
      <Row style={{ flexWrap: 'wrap', marginBottom: spacing.md }}>
        {PRODUCTION_STYLE_CHIPS.map((chip) => (
          <Chip
            key={chip.id}
            label={chip.label}
            selected={productionChip?.id === chip.id}
            onPress={() => toggle(productionChip, setProductionChip)(chip)}
          />
        ))}
      </Row>

      <FineTuneOverrides value={overrides} onChange={setOverrides} />
      <SeedAudioToggle value={seedAudio} onChange={setSeedAudio} />

      <Label>Platform</Label>
      <View style={{ marginBottom: spacing.md }}>
        <PlatformSelector value={platform} onChange={setPlatform} />
      </View>

      <PrimaryButton title="BUILD PROMPT →" onPress={onBuild} disabled={!canBuild} />
      {styleProfile && (
        <Text style={styles.profileNote}>
          Style Profile active: defaults tuned to your last {styleProfile.promptCount} builds
        </Text>
      )}

      <DecoderPickerModal
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={setArtistDna}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileNote: {
    color: colors.textDim,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
