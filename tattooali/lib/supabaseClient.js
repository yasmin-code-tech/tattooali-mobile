import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export function isSupabaseConfigured() {
  return Boolean(url && anonKey);
}

/** Cliente Supabase com JWT do login TattooAli (REST + Storage + Realtime). */
export function createSupabaseAuthed(accessToken) {
  if (!url || !anonKey) {
    throw new Error('Defina EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY');
  }
  const supabase = createClient(url, anonKey, {
    accessToken: async () => accessToken,
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  if (supabase.realtime?.setAuth) {
    void supabase.realtime.setAuth(accessToken);
  }
  return supabase;
}

export async function ensureSupabaseAuth(supabase, accessToken) {
  if (!accessToken || !supabase?.realtime?.setAuth) return;
  await supabase.realtime.setAuth(accessToken);
}
