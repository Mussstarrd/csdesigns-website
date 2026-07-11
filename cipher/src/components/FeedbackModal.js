/**
 * "How did it come out?" — the Learning System's input surface.
 * Rate the real generation (🔥/😐/🗑); on a bad result, tag what went wrong
 * and optionally name the element that showed up uninvited. That last field
 * is the strongest evidence class for trigger discovery.
 */
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { colors, fonts, spacing, radius } from '../theme/index.js';
import { ISSUE_TAGS } from '../engine/feedbackAttribution.js';
import { Body, Label, Chip, Row, PrimaryButton, GhostButton } from './ui.js';

const RATING_OPTIONS = [
  { key: 'fire', glyph: '🔥', label: 'Fire' },
  { key: 'ok', glyph: '😐', label: 'Okay' },
  { key: 'trash', glyph: '🗑', label: 'Trash' },
];

export default function FeedbackModal({ visible, onClose, onSubmit }) {
  const [rating, setRating] = useState(null);
  const [issues, setIssues] = useState([]);
  const [unwantedText, setUnwantedText] = useState('');

  const reset = () => {
    setRating(null);
    setIssues([]);
    setUnwantedText('');
  };

  const toggleIssue = (id) =>
    setIssues((list) => (list.includes(id) ? list.filter((i) => i !== id) : [...list, id]));

  const submit = () => {
    onSubmit({ rating, issues, unwantedText });
    reset();
    onClose();
  };

  const showIssues = rating != null && rating !== 'fire';
  const showUnwanted = issues.includes('unwanted_element');

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>HOW DID IT COME OUT?</Text>
          <Body dim style={{ marginBottom: spacing.md }}>
            Rate the actual generation — CIPHER learns which words trigger, gate,
            or scramble the output.
          </Body>

          <Row style={{ gap: spacing.sm, marginBottom: spacing.md }}>
            {RATING_OPTIONS.map((opt) => (
              <Pressable
                key={opt.key}
                onPress={() => setRating(opt.key)}
                style={[styles.rating, rating === opt.key && styles.ratingSelected]}
              >
                <Text style={styles.ratingGlyph}>{opt.glyph}</Text>
                <Text
                  style={[styles.ratingLabel, rating === opt.key && { color: colors.accent }]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </Row>

          {showIssues && (
            <>
              <Label>What went wrong?</Label>
              <Row style={{ flexWrap: 'wrap', marginBottom: spacing.sm }}>
                {ISSUE_TAGS.map((tag) => (
                  <Chip
                    key={tag.id}
                    label={tag.label}
                    selected={issues.includes(tag.id)}
                    onPress={() => toggleIssue(tag.id)}
                  />
                ))}
              </Row>
            </>
          )}

          {showUnwanted && (
            <>
              <Label>What showed up that shouldn't have?</Label>
              <TextInput
                style={styles.input}
                placeholder="e.g. saxophone, cowbell, random chanting…"
                placeholderTextColor={colors.textDim}
                value={unwantedText}
                onChangeText={setUnwantedText}
              />
            </>
          )}

          <PrimaryButton title="SUBMIT" onPress={submit} disabled={rating == null} />
          <GhostButton title="SKIP" onPress={() => { reset(); onClose(); }} style={{ marginTop: spacing.sm }} />
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
  },
  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 15,
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  rating: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  ratingSelected: { borderColor: colors.accent, backgroundColor: '#00E5A014' },
  ratingGlyph: { fontSize: 26 },
  ratingLabel: {
    color: colors.textDim,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    marginTop: 4,
  },
  input: {
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
});
