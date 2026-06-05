'use server';

import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';

/**
 * Signs out the current user, terminates their Supabase session,
 * and redirects to the login page.
 *
 * Validates: Requirements 3.1, 3.2, 3.3
 */
export async function logout(): Promise<never> {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect('/login');
}
