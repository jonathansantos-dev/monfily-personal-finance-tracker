'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../../../../lib/supabase/server';
import type { Account, AccountType } from '../../../../lib/types/database';

/**
 * Structured result type for all account actions.
 * Ensures consistent error handling across the application.
 */
interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Fetches all accounts for the currently authenticated user,
 * ordered by creation date ascending.
 *
 * Validates: Requirements 7.1, 7.6
 */
export async function getAccounts(): Promise<ActionResult<Account[]>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Account[] };
  } catch {
    return { success: false, error: 'Failed to fetch accounts' };
  }
}

/**
 * Creates a new account for the currently authenticated user.
 * The balance is stored in cents (integer).
 *
 * Validates: Requirements 7.1, 7.2
 */
export async function createAccount(data: {
  name: string;
  type: AccountType;
  balance_cents: number;
  color: string;
}): Promise<ActionResult<Account>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data: account, error } = await supabase
      .from('accounts')
      .insert({
        user_id: user.id,
        name: data.name,
        type: data.type,
        balance_cents: data.balance_cents,
        color: data.color,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/accounts');

    return { success: true, data: account as Account };
  } catch {
    return { success: false, error: 'Failed to create account' };
  }
}

/**
 * Updates an existing account's fields for the currently authenticated user.
 * Only provided fields will be updated.
 *
 * Validates: Requirements 7.3
 */
export async function updateAccount(
  id: string,
  data: {
    name?: string;
    type?: AccountType;
    balance_cents?: number;
    color?: string;
  }
): Promise<ActionResult<Account>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data: account, error } = await supabase
      .from('accounts')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/accounts');

    return { success: true, data: account as Account };
  } catch {
    return { success: false, error: 'Failed to update account' };
  }
}

/**
 * Deletes an account for the currently authenticated user.
 * Associated transactions are automatically deleted via ON DELETE CASCADE.
 *
 * Validates: Requirements 7.5
 */
export async function deleteAccount(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/accounts');

    return { success: true };
  } catch {
    return { success: false, error: 'Failed to delete account' };
  }
}
