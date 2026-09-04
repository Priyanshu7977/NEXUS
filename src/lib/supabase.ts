import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Support standard Vite env variables and optional fallback variables
const supabaseUrl: string =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.NEXT_PUBLIC_SUPABASE_URL) ||
  '';

const supabaseAnonKey: string =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('example_key_here')
);

if (!isSupabaseConfigured) {
  console.info(
    '%c[NEXUS Auth Notice]%c Supabase credentials not detected in .env. Running in simulated local authentication mode for rapid evaluation. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to connect to live Supabase.',
    'color: #7C5CFC; font-weight: bold;',
    'color: inherit;'
  );
}

// Fallback dummy URL and anon key to prevent createClient from throwing during initialization
const safeUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const safeKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key-000000000000000000000000';

export const supabase = createClient<Database>(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});
