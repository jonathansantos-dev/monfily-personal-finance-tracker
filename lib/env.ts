/**
 * Environment variable configuration.
 *
 * IMPORTANT: Next.js only inlines NEXT_PUBLIC_ variables when they are
 * referenced directly (e.g., process.env.NEXT_PUBLIC_SUPABASE_URL).
 * Dynamic access like process.env[key] does NOT work client-side.
 */

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
} as const;
