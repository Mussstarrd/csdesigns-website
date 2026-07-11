/**
 * Blend It — Foundation + Texture constraint hierarchy (NOT a percentage
 * blender). Foundation contributes drums/low-end/BPM/exclusions; Texture
 * contributes lead/room/feeling. Fully deterministic when both sources are
 * DB entries.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, fonts, spacing, radius } from '../theme/index.js';
import {
  Screen,
  SectionTitle,
  Label,
  Body,
  PrimaryButton,
  Card,
  Row,
} from '../components/ui.js';
import PlatformSelector from '../components/PlatformSelector.js';
import SeedAudioToggle from '../components/SeedAudioToggle.js';
import FineTuneOverrides from '../components/FineTuneOverrides.js';
import DecoderPickerModal from '../components/DecoderPickerModal.js';
import { blendDna } from '../engine/blend.js';
import { usePromptStore } from '../store/usePromptStore.js';
import { useSettingsStore } from '../store/useSettingsStore.js';

export default function BlendItScreen({ navigation }) {
  const [foundation, setFoundation] = useState(null);
  const [texture, setTexture] = useState(null);
  const [pickerFor, setPickerFor] = useState(null); // 'foundation' | 'texture'
  const [flavor, setFlavor] = useState(0.3); // texture share 0.10-0.40
  const [platform, setPlatform] = useState(useSettingsStore.getState().defaultPlatform);
  const [seedAudio, setSeedAudio] = useState({ enabled: false, contains: [] });
  const [overrides, setOverrides] = useState({
    bpm: null,
    key: null,
    energy: 3,
    instrumental: true,
    vocalPocket: false,
  });

  const runBuild = usePromptStore((s) => s.runBuild);

  const onBuild = () => {
    const interpretation = blendDna(foundation, texture, flavor, overrides);
    runBuild({
      source: { type: 'blend', foundation, texture, flavor, overrides },
      interpretation,
      seedAudio,
      platform,
      energy: overrides.energy,
    });
    navigation.navigate('Output');
  };

  const slot = (label, sub, value, key) => (
    <Card onPress={() => setPickerFor(key)} style={value ? { borderColor: colors.accent } : null}>
      <Label>{label}</Label>
      {value ? (
        <>
          <Body>{value.artist_name} — {value.era_label}</Body>
          <Text style={styles.slotMeta}>
            {value.bpm_min}-{value.bpm_max} BPM · {value.key_preference}
          </Text>
        </>
      ) : (
        <Body dim>{sub}</Body>
      )}
    </Card>
  );

  const foundationPct = Math.round((1 - flavor) * 100);

  return (
    <Screen>
      <SectionTitle>⚡ Blend It</SectionTitle>
      <Body dim style={{ marginBottom: spacing.md }}>
        Foundation sets the skeleton. Texture paints over it. No incoherent soup.
      </Body>

      {slot('FOUNDATION (drums + low end)', 'Tap to pick the rhythmic skeleton…', foundation, 'foundation')}
      {slot('TEXTURE (melody + vibe)', 'Tap to pick the color on top…', texture, 'texture')}

      <Card>
        <Row>
          <Label style={{ marginBottom: 0, flex: 1 }}>Flavor</Label>
          <Text style={styles.flavorReadout}>
            {foundationPct}/{100 - foundationPct}
          </Text>
        </Row>
        <Slider
          minimumValue={0.1}
          maximumValue={0.4}
          step={0.05}
          value={flavor}
          onValueChange={setFlavor}
          minimumTrackTintColor={colors.accent}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.accent}
        />
        <Body dim style={{ fontSize: 11 }}>
          More texture = more of its melody/room/feeling language. Structure (BPM,
          drums, low end, exclusions) always comes from the Foundation.
        </Body>
      </Card>

      <FineTuneOverrides value={overrides} onChange={setOverrides} />
      <SeedAudioToggle value={seedAudio} onChange={setSeedAudio} />

      <Label>Platform</Label>
      <View style={{ marginBottom: spacing.md }}>
        <PlatformSelector value={platform} onChange={setPlatform} />
      </View>

      <PrimaryButton
        title="BUILD BLEND →"
        onPress={onBuild}
        disabled={!foundation || !texture}
      />

      <DecoderPickerModal
        visible={pickerFor != null}
        title={pickerFor === 'foundation' ? 'FOUNDATION (drums + low end)' : 'TEXTURE (melody + vibe)'}
        onClose={() => setPickerFor(null)}
        onSelect={(row) => (pickerFor === 'foundation' ? setFoundation(row) : setTexture(row))}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  slotMeta: { color: colors.textDim, fontFamily: fonts.mono, fontSize: 11, marginTop: 4 },
  flavorReadout: { color: colors.accent, fontFamily: fonts.mono, fontSize: 13, letterSpacing: 1 },
});
