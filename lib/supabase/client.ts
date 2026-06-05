import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { env } from '../env';

/**
 * Creates a Supabase client for use in browser (Client Components).
 * Uses the default cookie handling provided by @supabase/ssr.
 * This client is a singleton — safe to call multiple times.
 */
export function createClient(): SupabaseClient {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
