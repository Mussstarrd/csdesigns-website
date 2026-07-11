/** Browse the Artist Decoder database — read-only DNA inspector. */
import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, fonts, spacing, radius } from '../theme/index.js';
import { Screen, SectionTitle, Card, Label, Body, Row, Mono } from '../components/ui.js';
import { useDecoderStore } from '../store/useDecoderStore.js';
import { searchDecoder } from '../services/artistDecoder.js';

export default function ArtistBrowserScreen() {
  const entries = useDecoderStore((s) => s.entries);
  const [query, setQuery] = useState('');
  const [openEra, setOpenEra] = useState(null);

  const results = useMemo(() => searchDecoder(query, entries), [query, entries]);

  return (
    <Screen>
      <SectionTitle>Artist Decoder</SectionTitle>
      <TextInput
        style={styles.search}
        placeholder="Search the database…"
        placeholderTextColor={colors.textDim}
        value={query}
        onChangeText={setQuery}
      />
      {results.map((row) => {
        const key = `${row.artist_name}::${row.era_label}`;
        const open = openEra === key;
        return (
          <Card key={key} onPress={() => setOpenEra(open ? null : key)}>
            <Row>
              <View style={{ flex: 1 }}>
                <Body>{row.artist_name}</Body>
                <Text style={styles.era}>{row.era_label}</Text>
              </View>
              <Mono>
                {row.bpm_min}-{row.bpm_max} BPM
              </Mono>
            </Row>
            {open && (
              <View style={{ marginTop: spacing.sm }}>
                <Label>Feel</Label>
                <Body dim style={styles.dna}>{row.feel}</Body>
                <Label style={{ marginTop: spacing.sm }}>Percussion DNA</Label>
                {row.percussion_dna?.map((d) => (
                  <Body dim key={d} style={styles.dna}>· {d}</Body>
                ))}
                <Label style={{ marginTop: spacing.sm }}>Low End DNA</Label>
                {row.low_end_dna?.map((d) => (
                  <Body dim key={d} style={styles.dna}>· {d}</Body>
                ))}
                <Label style={{ marginTop: spacing.sm }}>Lead DNA</Label>
                {row.lead_dna?.map((d) => (
                  <Body dim key={d} style={styles.dna}>· {d}</Body>
                ))}
                <Label style={{ marginTop: spacing.sm }}>Avoids</Label>
                <Body dim style={styles.dna}>{(row.avoid_list ?? []).join(', ')}</Body>
              </View>
            )}
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 14,
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  era: { color: colors.accent, fontFamily: fonts.mono, fontSize: 11, marginTop: 2 },
  dna: { fontSize: 12, lineHeight: 18 },
});
