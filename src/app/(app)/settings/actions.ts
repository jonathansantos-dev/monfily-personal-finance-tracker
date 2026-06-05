'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../../../../lib/supabase/server';

/**
 * Structured result type for settings actions.
 */
interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Updates the dark mode preference for the current user.
 * Persists the preference in the profiles table and revalidates
 * the layout so the DarkModeScript applies the new theme.
 *
 * Validates: Requirements 10.3
 */
export async function updateDarkMode(darkMode: boolean): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        dark_mode: darkMode,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/settings');
    revalidatePath('/');

    return { success: true };
  } catch {
    return { success: false, error: 'Failed to update dark mode preference' };
  }
}
