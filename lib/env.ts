/**
 * Environment variable validation.
 * Ensures required Supabase configuration is present at build time.
 * Import this module early in the application to fail fast if env vars are missing.
 */

function getRequiredEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `Please check your .env.local file. See .env.local.example for reference.`
    );
  }
  return value;
}

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
} as const;
