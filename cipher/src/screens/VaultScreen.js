/**
 * The Vault — saved prompts with session grouping. Regenerations from the
 * same input stack as versions on one session card ("v4"); tapping expands
 * the chain; each version shows its freshness at creation; the user can
 * star the winner.
 */
import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { colors, fonts, spacing, radius } from '../theme/index.js';
import { Screen, SectionTitle, Body, Chip, Row, GhostButton } from '../components/ui.js';
import FreshnessBadge from '../components/FreshnessBadge.js';
import { useVaultStore } from '../store/useVaultStore.js';
import { usePromptStore } from '../store/usePromptStore.js';
import { useFeedbackStore } from '../store/useFeedbackStore.js';
import FeedbackModal from '../components/FeedbackModal.js';

const FILTERS = ['all', 'suno', 'mureka'];
const SORTS = ['recent', 'freshness'];

export default function VaultScreen({ navigation }) {
  const sessions = useVaultStore((s) => s.sessions);
  const loadSaved = usePromptStore((s) => s.loadSaved);
  const starVersion = useVaultStore((s) => s.starVersion);
  const deleteVersion = useVaultStore((s) => s.deleteVersion);
  const deleteSession = useVaultStore((s) => s.deleteSession);

  const recordFeedback = useFeedbackStore((s) => s.record);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('recent');
  const [expanded, setExpanded] = useState(null);
  const [ratingVersion, setRatingVersion] = useState(null);

  const visible = useMemo(() => {
    let list = sessions;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) =>
          s.label?.toLowerCase().includes(q) ||
          s.versions.some(
            (v) =>
              v.suno?.stylePrompt?.toLowerCase().includes(q) ||
              v.mureka?.musicStyle?.toLowerCase().includes(q)
          )
      );
    }
    if (filter !== 'all') {
      list = list.filter((s) =>
        s.versions.some((v) => v.platform === filter || v.platform === 'both')
      );
    }
    if (sort === 'freshness') {
      list = [...list].sort(
        (a, b) =>
          (b.versions[0]?.freshness?.score ?? 0) - (a.versions[0]?.freshness?.score ?? 0)
      );
    }
    return list;
  }, [sessions, query, filter, sort]);

  const copyVersion = (v) => {
    const text = v.suno?.stylePrompt ?? v.mureka?.musicStyle ?? '';
    Clipboard.setStringAsync(text);
  };

  if (sessions.length === 0) {
    return (
      <Screen>
        <SectionTitle>Vault</SectionTitle>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🗄️</Text>
          <Body dim style={{ textAlign: 'center' }}>
            Nothing saved yet. Build a prompt and hit SAVE TO VAULT — then copy it
            tonight during the green window.
          </Body>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <SectionTitle>Vault</SectionTitle>
      <TextInput
        style={styles.search}
        placeholder="Search prompts…"
        placeholderTextColor={colors.textDim}
        value={query}
        onChangeText={setQuery}
      />
      <Row style={{ marginBottom: spacing.sm, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => (
          <Chip key={f} label={f.toUpperCase()} selected={filter === f} onPress={() => setFilter(f)} />
        ))}
        <View style={{ flex: 1 }} />
        {SORTS.map((s) => (
          <Chip key={s} label={s === 'recent' ? '↓ RECENT' : '↓ FRESH'} selected={sort === s} onPress={() => setSort(s)} />
        ))}
      </Row>

      {visible.map((session) => {
        const isOpen = expanded === session.sessionKey;
        const head = session.versions[0];
        return (
          <View key={session.sessionKey} style={styles.sessionCard}>
            <Pressable onPress={() => setExpanded(isOpen ? null : session.sessionKey)}>
              <Row>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sessionLabel}>{session.label}</Text>
                  <Text style={styles.sessionMeta}>
                    v{session.versions.length} · {new Date(head.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <FreshnessBadge freshness={head.freshness} />
                <Text style={styles.caret}>{isOpen ? '▾' : '▸'}</Text>
              </Row>
            </Pressable>

            {isOpen &&
              session.versions.map((v, i) => (
                <View key={v.id} style={styles.version}>
                  <Row style={{ marginBottom: spacing.xs }}>
                    <Pressable onPress={() => starVersion(session.sessionKey, v.id)}>
                      <Text style={[styles.star, v.starred && { color: colors.warn }]}>
                        {v.starred ? '★' : '☆'}
                      </Text>
                    </Pressable>
                    <Text style={styles.versionLabel}>
                      v{session.versions.length - i}
                    </Text>
                    <View style={{ marginLeft: 'auto' }}>
                      <FreshnessBadge freshness={v.freshness} />
                    </View>
                  </Row>
                  <Body dim numberOfLines={3} style={{ fontFamily: fonts.mono, fontSize: 12 }}>
                    {v.suno?.stylePrompt ?? v.mureka?.musicStyle}
                  </Body>
                  <Row style={{ gap: spacing.sm, marginTop: spacing.sm }}>
                    <GhostButton title="COPY" onPress={() => copyVersion(v)} style={styles.miniBtn} />
                    <GhostButton
                      title="RATE"
                      color={colors.accent}
                      onPress={() => setRatingVersion(v)}
                      style={styles.miniBtn}
                    />
                    <GhostButton
                      title="EDIT"
                      onPress={() => {
                        loadSaved(v);
                        navigation.navigate('CreateTab', { screen: 'Output' });
                      }}
                      style={styles.miniBtn}
                    />
                    <GhostButton
                      title="DELETE"
                      color={colors.danger}
                      onPress={() => deleteVersion(session.sessionKey, v.id)}
                      style={styles.miniBtn}
                    />
                  </Row>
                </View>
              ))}

            {isOpen && (
              <GhostButton
                title="DELETE SESSION"
                color={colors.danger}
                onPress={() => deleteSession(session.sessionKey)}
                style={{ marginTop: spacing.sm }}
              />
            )}
          </View>
        );
      })}

      <FeedbackModal
        visible={ratingVersion != null}
        onClose={() => setRatingVersion(null)}
        onSubmit={({ rating, issues, unwantedText }) => {
          const v = ratingVersion;
          recordFeedback({
            platform: v.suno ? 'suno' : 'mureka',
            rating,
            issues,
            unwantedText,
            promptText: v.suno?.stylePrompt ?? v.mureka?.musicStyle ?? '',
          });
        }}
      />
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
    marginBottom: spacing.sm,
  },
  sessionCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sessionLabel: { color: colors.text, fontFamily: fonts.bodyMedium, fontSize: 14 },
  sessionMeta: { color: colors.textDim, fontFamily: fonts.mono, fontSize: 11, marginTop: 2 },
  caret: { color: colors.textDim, fontSize: 14, marginLeft: spacing.sm },
  version: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  versionLabel: { color: colors.textDim, fontFamily: fonts.mono, fontSize: 12, marginLeft: 8 },
  star: { color: colors.textDim, fontSize: 18 },
  miniBtn: { paddingVertical: 6, paddingHorizontal: 12, flex: 1 },
  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: spacing.lg },
  emptyIcon: { fontSize: 40, marginBottom: spacing.md },
});
