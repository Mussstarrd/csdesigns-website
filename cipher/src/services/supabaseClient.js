import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/** Null when env is not configured — every caller degrades to offline mode. */
export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: { storage: AsyncStorage, persistSession: true, autoRefreshToken: true },
      })
    : null;

export function supabaseConfigured() {
  return supabase != null;
}
