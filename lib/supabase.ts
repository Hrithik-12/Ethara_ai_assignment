import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Lazy: don't blow up at module-evaluation time (Next does static analysis on
// route handlers). Throw the friendly message only when something actually
// tries to query.
let cached: SupabaseClient | null = null;

function makeClient(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Newer Supabase dashboards call this "publishable key"; older ones called
  // it "anon key". Accept either — they're the same value.
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase env missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or _PUBLISHABLE_KEY) in .env.local."
    );
  }
  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}

// Keep the existing call-site shape (`supabase.from(...)`).
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(makeClient(), prop, receiver);
  },
});
