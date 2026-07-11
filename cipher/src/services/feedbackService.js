/**
 * Learning System client — submits generation feedback (best-effort, with an
 * offline queue) and fetches confirmed dynamic kill-list rules on launch.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient.js';
import { getDeviceId } from './deviceId.js';
import { extractTerms, isBadOutcome } from '../engine/feedbackAttribution.js';
import { setDynamicRules } from '../engine/bannedWords.js';

const RULES_CACHE_KEY = 'cipher.dynamicRules.v1';
const RULES_TTL_MS = 24 * 60 * 60 * 1000;

/** Shape one feedback event for both local storage and the server. */
export function buildFeedbackEvent({ platform, rating, issues, unwantedText, promptText }) {
  return {
    platform,
    rating,
    issues: issues ?? [],
    unwantedText: unwantedText?.trim() || null,
    promptText,
    createdAt: Date.now(),
  };
}

/** Submit to Supabase. Returns true on success; caller queues on failure. */
export async function submitFeedback(event) {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('prompt_feedback').insert({
      device_id: await getDeviceId(),
      platform: event.platform,
      rating: event.rating,
      issues: event.issues,
      unwanted_text: event.unwantedText,
      prompt_text: event.promptText,
      terms: extractTerms(event.promptText),
      is_bad: isBadOutcome({ ...event, unwantedText: event.unwantedText }),
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Fetch confirmed dynamic rules (24h cache, offline falls back to cache)
 * and install them into the banned-word filter. Never throws.
 */
export async function loadDynamicRules({ force = false } = {}) {
  let cached = null;
  try {
    const raw = await AsyncStorage.getItem(RULES_CACHE_KEY);
    if (raw) cached = JSON.parse(raw);
  } catch {
    cached = null;
  }

  const fresh = cached && Date.now() - cached.fetchedAt < RULES_TTL_MS;
  if (cached && fresh && !force) {
    setDynamicRules(cached.rules);
    return { rules: cached.rules, source: 'cache' };
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('dynamic_rules')
        .select('word, substitute')
        .eq('status', 'confirmed');
      if (!error && Array.isArray(data)) {
        await AsyncStorage.setItem(
          RULES_CACHE_KEY,
          JSON.stringify({ rules: data, fetchedAt: Date.now() })
        );
        setDynamicRules(data);
        return { rules: data, source: 'network' };
      }
    } catch {
      // fall through
    }
  }

  const rules = cached?.rules ?? [];
  setDynamicRules(rules);
  return { rules, source: cached ? 'cache' : 'none' };
}
