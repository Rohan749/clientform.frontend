import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
  console.error(
    "Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copy frontend/.env.example to frontend/.env.",
  );
}

/**
 * Browser Supabase client. Only ever uses the public anon key — used for auth,
 * avatar uploads (guarded by storage RLS) and signed-URL uploads. All data access
 * goes through the backend API.
 */
export const supabase = createClient(url || "http://localhost:54321", anonKey || "missing-anon-key", {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
