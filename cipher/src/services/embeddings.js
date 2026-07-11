/**
 * Embeddings client for the Freshness Score. On any failure returns null —
 * the caller falls back to Jaccard word overlap and labels the score
 * "approximate".
 */
import { supabase } from './supabaseClient.js';

export async function embedText(text) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.functions.invoke('embed', {
      body: { text },
    });
    if (error || !Array.isArray(data?.vector)) return null;
    return data.vector;
  } catch {
    return null;
  }
}
