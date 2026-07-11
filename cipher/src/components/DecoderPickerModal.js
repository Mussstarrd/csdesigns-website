/**
 * Unified search modal over artist-eras (plus region chips) — used by the
 * Build It ARTIST SOUND row and both Blend slots. Multi-era artists expand
 * into an era picker.
 */
import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import { colors, fonts, spacing, radius } from '../theme/index.js';
import { useDecoderStore } from '../store/useDecoderStore.js';
import { searchDecoder } from '../services/artistDecoder.js';
import { GhostButton } from './ui.js';

export default function DecoderPickerModal({ visible, onClose, onSelect, title = 'ARTIST SOUND' }) {
  const entries = useDecoderStore((s) => s.entries);
  const [query, setQuery] = useState('');
  const [expandedArtist, setExpandedArtist] = useState(null);

  const results = useMemo(() => {
    const filtered = searchDecoder(query, entries);
    // Group by artist for the era-picker behavior.
    const byArtist = new Map();
    for (const row of filtered) {
      if (!byArtist.has(row.artist_name)) byArtist.set(row.artist_name, []);
      byArtist.get(row.artist_name).push(row);
    }
    return [...byArtist.entries()].map(([name, eras]) => ({ name, eras }));
  }, [query, entries]);

  const pick = (row) => {
    setExpandedArtist(null);
    setQuery('');
    onSelect(row);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <TextInput
            style={styles.search}
            placeholder="Search artists, eras, regions, vibes…"
            placeholderTextColor={colors.textDim}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          <FlatList
            data={results}
            keyExtractor={(item) => item.name}
            keyboardShouldPersistTaps="handled"
            style={{ flexGrow: 0 }}
            renderItem={({ item }) => {
              const multiEra = item.eras.length > 1;
              const expanded = expandedArtist === item.name;
              return (
                <View>
                  <Pressable
                    style={styles.rowItem}
                    onPress={() =>
                      multiEra
                        ? setExpandedArtist(expanded ? null : item.name)
                        : pick(item.eras[0])
                    }
                  >
                    <Text style={styles.artist}>{item.name}</Text>
                    <Text style={styles.meta}>
                      {multiEra
                        ? `${item.eras.length} eras ${expanded ? '▾' : '▸'}`
                        : item.eras[0].era_label}
                    </Text>
                  </Pressable>
                  {multiEra &&
                    expanded &&
                    item.eras.map((era) => (
                      <Pressable
                        key={era.era_label}
                        style={styles.eraItem}
                        onPress={() => pick(era)}
                      >
                        <Text style={styles.eraLabel}>{era.era_label}</Text>
                        <Text style={styles.eraMeta}>
                          {era.bpm_min}-{era.bpm_max} BPM · {era.key_preference}
                        </Text>
                      </Pressable>
                    ))}
                </View>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.empty}>
                No matches. Suggest this artist from Settings → Artist Decoder.
              </Text>
            }
          />
          <GhostButton title="CLOSE" onPress={onClose} style={{ marginTop: spacing.sm }} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#000000AA', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.body,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    maxHeight: '80%',
  },
  title: {
    color: colors.textDim,
    fontFamily: fonts.display,
    fontSize: 12,
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  search: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 14,
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  rowItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  artist: { color: colors.text, fontFamily: fonts.bodyMedium, fontSize: 15 },
  meta: { color: colors.textDim, fontFamily: fonts.body, fontSize: 12 },
  eraItem: {
    paddingVertical: 10,
    paddingLeft: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  eraLabel: { color: colors.accent, fontFamily: fonts.bodyMedium, fontSize: 13 },
  eraMeta: { color: colors.textDim, fontFamily: fonts.mono, fontSize: 11, marginTop: 2 },
  empty: {
    color: colors.textDim,
    fontFamily: fonts.body,
    fontSize: 13,
    paddingVertical: spacing.lg,
    textAlign: 'center',
  },
});
