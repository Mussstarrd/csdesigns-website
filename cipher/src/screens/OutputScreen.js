/**
 * Prompt Output — Traffic Light, freshness badge, live character counter,
 * SUNO/MUREKA tabs, in-place editing with live validation, conflict
 * warnings, REGENERATE and SAVE TO VAULT.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fonts, spacing, radius } from '../theme/index.js';
import { Screen, Body, Label, PrimaryButton, GhostButton, Row } from '../components/ui.js';
import TrafficLight from '../components/TrafficLight.js';
import FreshnessBadge from '../components/FreshnessBadge.js';
import CharCounter from '../components/CharCounter.js';
import PromptCard from '../components/PromptCard.js';
import ConflictWarning from '../components/ConflictWarning.js';
import FeedbackModal from '../components/FeedbackModal.js';
import { useFeedbackStore } from '../store/useFeedbackStore.js';
import { usePromptStore } from '../store/usePromptStore.js';
import { useVaultStore } from '../store/useVaultStore.js';
import { useSettingsStore } from '../store/useSettingsStore.js';
import { computeFreshness, shouldWarnFreshness } from '../engine/freshness.js';
import { formatExclusions } from '../engine/exclusions.js';
import { embedText } from '../services/embeddings.js';

export default function OutputScreen({ navigation }) {
  const { result, platform, interpretation, regenerate, applyEdit, sessionKey, source } =
    usePromptStore();
  const saveVersion = useVaultStore((s) => s.saveVersion);
  const recentEntries = useVaultStore((s) => s.recentEntries);
  const freshnessWindow = useSettingsStore((s) => s.freshnessWindow);
  const myTasteProtection = useSettingsStore((s) => s.myTasteProtection);
  const recordPrompt = useSettingsStore((s) => s.recordPrompt);

  const tabs = platform === 'both' ? ['suno', 'mureka'] : [platform];
  const [tab, setTab] = useState(tabs[0]);
  const [dismissedConflicts, setDismissedConflicts] = useState([]);
  const [freshness, setFreshness] = useState(null);
  const [vector, setVector] = useState(null);
  const [saved, setSaved] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const recordFeedback = useFeedbackStore((s) => s.record);

  const styleText = result?.suno?.stylePrompt ?? result?.mureka?.musicStyle ?? '';

  // Keep the active tab valid when a new build changes the platform choice.
  useEffect(() => {
    if (!tabs.includes(tab)) setTab(tabs[0]);
  }, [platform]); // eslint-disable-line react-hooks/exhaustive-deps

  // Freshness: try embeddings, fall back to Jaccard ("approximate").
  useEffect(() => {
    let cancelled = false;
    setSaved(false);
    setFreshness(null);
    (async () => {
      const recent = recentEntries(freshnessWindow);
      const v = await embedText(styleText);
      if (cancelled) return;
      setVector(v);
      setFreshness(computeFreshness({ text: styleText, vector: v }, recent, freshnessWindow));
    })();
    return () => {
      cancelled = true;
    };
    // Recompute per generated prompt, not per keystroke.
  }, [styleText]);

  const conflicts = useMemo(() => {
    const list = result?.suno?.conflicts ?? [];
    return list.filter((c) => !dismissedConflicts.includes(c.exclusion));
  }, [result, dismissedConflicts]);

  if (!result) {
    return (
      <Screen>
        <Body dim>Nothing built yet. Start from the Create tab.</Body>
      </Screen>
    );
  }

  const removeConflictedExclusion = (conflict) => {
    const items = result.suno.excludeField
      .split(',')
      .map((s) => s.trim().replace(/^no\s+/i, ''))
      .filter((el) => el && el !== conflict.exclusion);
    applyEdit('suno', 'excludeField', formatExclusions(items).text);
  };

  const onSave = () => {
    const label =
      source?.type === 'describe'
        ? `“${(source.normalized ?? '').slice(0, 60)}”`
        : source?.type === 'blend'
          ? `${source.foundation?.artist_name} × ${source.texture?.artist_name}`
          : source?.type === 'build'
            ? [
                source.chips?.artistDna?.artist_name,
                source.chips?.regionChip?.label,
                source.chips?.vibeChip?.label,
              ]
                .filter(Boolean)
                .join(' · ') || 'Custom build'
            : 'Surprise Me';
    saveVersion({
      sessionKey: sessionKey(),
      label,
      version: {
        platform,
        suno: result.suno
          ? { stylePrompt: result.suno.stylePrompt, excludeField: result.suno.excludeField }
          : null,
        mureka: result.mureka
          ? {
              musicStyle: result.mureka.musicStyle,
              vocalDirection: result.mureka.vocalDirection,
              structureBlock: result.mureka.structureBlock,
              tempoFeel: result.mureka.tempoFeel,
            }
          : null,
        freshness,
        vector,
      },
    });
    recordPrompt({
      bpm: interpretation?.bpm ?? null,
      key: interpretation?.key ?? null,
      region: source?.chips?.regionChip?.label ?? source?.comboRegion ?? null,
    });
    setSaved(true);
  };

  const freshnessWarning =
    freshness && shouldWarnFreshness(freshness.score, myTasteProtection);

  return (
    <Screen>
      <TrafficLight />

      <Row style={{ marginBottom: spacing.md }}>
        <FreshnessBadge freshness={freshness} />
        {result.suno && (
          <View style={{ marginLeft: 'auto' }}>
            <CharCounter count={result.suno.charCount} />
          </View>
        )}
      </Row>

      {freshnessWarning && (
        <View style={styles.freshWarn}>
          <Text style={styles.freshWarnText}>
            {myTasteProtection
              ? 'My Taste Protection: this prompt repeats descriptors from your recent builds. Suno\'s My Taste feature permanently learns repeated language on your account — consider a regenerate.'
              : 'This prompt is very close to your recent builds — descriptor recycling gets penalized.'}
          </Text>
        </View>
      )}

      {tabs.length > 1 && (
        <Row style={styles.tabs}>
          {tabs.map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tab, tab === t && styles.tabActive]}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </Row>
      )}

      {tab === 'suno' && result.suno ? (
        <>
          {conflicts.map((c) => (
            <ConflictWarning
              key={c.exclusion}
              conflict={c}
              onRemove={removeConflictedExclusion}
              onKeep={(conflict) =>
                setDismissedConflicts((d) => [...d, conflict.exclusion])
              }
            />
          ))}
          {result.sunoValidation?.errors?.map((err) => (
            <Text key={err} style={styles.validationError}>✕ {err}</Text>
          ))}
          <PromptCard
            title="STYLE PROMPT"
            text={result.suno.stylePrompt}
            showCounter
            onChangeText={(t) => applyEdit('suno', 'stylePrompt', t)}
          />
          <PromptCard
            title="EXCLUDE FIELD"
            text={result.suno.excludeField}
            multilineHeight={60}
            onChangeText={(t) => applyEdit('suno', 'excludeField', t)}
          />
        </>
      ) : result.mureka ? (
        <>
          {result.murekaValidation?.errors?.map((err) => (
            <Text key={err} style={styles.validationError}>✕ {err}</Text>
          ))}
          <View style={styles.tempoLine}>
            <Label style={{ marginBottom: 0 }}>Tempo Feel</Label>
            <Text style={styles.tempoText}>{result.mureka.tempoFeel}</Text>
          </View>
          <PromptCard
            title="MUSIC STYLE"
            text={result.mureka.musicStyle}
            onChangeText={(t) => applyEdit('mureka', 'musicStyle', t)}
          />
          <PromptCard
            title="VOCAL DIRECTION"
            text={result.mureka.vocalDirection ?? '(instrumental — no vocal direction)'}
            editable={result.mureka.vocalDirection != null}
            multilineHeight={60}
            onChangeText={(t) => applyEdit('mureka', 'vocalDirection', t)}
          />
          <PromptCard
            title="STRUCTURE BLOCK"
            text={result.mureka.structureBlock}
            multilineHeight={150}
            onChangeText={(t) => applyEdit('mureka', 'structureBlock', t)}
          />
        </>
      ) : null}

      <Row style={{ gap: spacing.sm, marginTop: spacing.sm }}>
        <GhostButton
          title="↻ REGENERATE"
          color={colors.text}
          style={{ flex: 1 }}
          onPress={() => {
            regenerate();
            setDismissedConflicts([]);
          }}
        />
        <PrimaryButton
          title={saved ? '✓ SAVED' : 'SAVE TO VAULT'}
          style={{ flex: 1 }}
          onPress={onSave}
          disabled={saved}
        />
      </Row>

      <GhostButton
        title="⚑ RATE THE GENERATION (after you run it)"
        color={colors.textDim}
        onPress={() => setRatingOpen(true)}
        style={{ marginTop: spacing.sm }}
      />

      <FeedbackModal
        visible={ratingOpen}
        onClose={() => setRatingOpen(false)}
        onSubmit={({ rating, issues, unwantedText }) =>
          recordFeedback({
            platform: tab,
            rating,
            issues,
            unwantedText,
            promptText:
              tab === 'suno'
                ? result.suno?.stylePrompt ?? ''
                : result.mureka?.musicStyle ?? '',
          })
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: {
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
    marginBottom: spacing.md,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radius.sm - 2 },
  tabActive: { backgroundColor: '#00E5A01F' },
  tabText: { color: colors.textDim, fontFamily: fonts.display, fontSize: 13, letterSpacing: 2 },
  tabTextActive: { color: colors.accent },
  validationError: {
    color: colors.danger,
    fontFamily: fonts.body,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  freshWarn: {
    backgroundColor: '#FFC24D14',
    borderWidth: 1,
    borderColor: colors.warn,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  freshWarnText: { color: colors.warn, fontFamily: fonts.body, fontSize: 12, lineHeight: 17 },
  tempoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  tempoText: { color: colors.accent, fontFamily: fonts.mono, fontSize: 12 },
});
