'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../../../../lib/supabase/server';
import type { Transaction, TransactionType } from '../../../../lib/types/database';

/**
 * Structured result type for all transaction actions.
 * Ensures consistent error handling across the application.
 */
interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Transaction with joined account and category data for display purposes.
 */
export interface TransactionWithRelations extends Transaction {
  accounts: { id: string; name: string; color: string } | null;
  categories: { id: string; name: string; icon: string; color: string } | null;
}

/**
 * Filters for querying transactions.
 */
interface TransactionFilters {
  type?: 'income' | 'expense' | 'all';
  startDate?: string;
  endDate?: string;
}

/**
 * Calculates the balance adjustment for a given transaction type and amount.
 * Income adds to the balance; expense subtracts from it.
 */
function calculateAdjustment(type: TransactionType, amountCents: number): number {
  return type === 'income' ? amountCents : -amountCents;
}

/**
 * Fetches transactions for the currently authenticated user with optional filters.
 * Includes related account and category data. Ordered by date descending.
 *
 * Validates: Requirements 5.1, 6.1, 6.2, 6.3
 */
export async function getTransactions(
  filters?: TransactionFilters
): Promise<ActionResult<TransactionWithRelations[]>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    let query = supabase
      .from('transactions')
      .select('*, accounts(id, name, color), categories(id, name, icon, color)')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (filters?.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }

    if (filters?.startDate) {
      query = query.gte('date', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('date', filters.endDate);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as TransactionWithRelations[] };
  } catch {
    return { success: false, error: 'Failed to fetch transactions' };
  }
}

/**
 * Creates a new transaction and adjusts the associated account balance.
 * Income increases the balance; expense decreases it.
 *
 * Validates: Requirements 5.1, 5.3
 */
export async function createTransaction(data: {
  account_id: string;
  category_id: string;
  type: TransactionType;
  amount_cents: number;
  description?: string;
  date: string;
}): Promise<ActionResult<Transaction>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data: transaction, error: insertError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        account_id: data.account_id,
        category_id: data.category_id,
        type: data.type,
        amount_cents: data.amount_cents,
        description: data.description ?? null,
        date: data.date,
      })
      .select()
      .single();

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    // Adjust account balance: income adds, expense subtracts
    const adjustment = calculateAdjustment(data.type, data.amount_cents);

    const { error: rpcError } = await supabase.rpc('adjust_account_balance', {
      p_account_id: data.account_id,
      p_adjustment: adjustment,
    });

    if (rpcError) {
      return { success: false, error: rpcError.message };
    }

    revalidatePath('/transactions');
    revalidatePath('/accounts');

    return { success: true, data: transaction as Transaction };
  } catch {
    return { success: false, error: 'Failed to create transaction' };
  }
}

/**
 * Updates an existing transaction and recalculates account balances.
 * Handles account changes, type changes, and amount changes atomically.
 *
 * Validates: Requirements 5.3, 5.5
 */
export async function updateTransaction(
  id: string,
  data: {
    account_id?: string;
    category_id?: string;
    type?: TransactionType;
    amount_cents?: number;
    description?: string;
    date?: string;
  }
): Promise<ActionResult<Transaction>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Fetch the existing transaction to calculate balance differences
    const { data: oldTransaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !oldTransaction) {
      return { success: false, error: fetchError?.message ?? 'Transaction not found' };
    }

    const oldTx = oldTransaction as Transaction;
    const newType = data.type ?? oldTx.type;
    const newAmountCents = data.amount_cents ?? oldTx.amount_cents;
    const newAccountId = data.account_id ?? oldTx.account_id;

    // Reverse the old adjustment on the old account
    const oldAdjustment = calculateAdjustment(oldTx.type, oldTx.amount_cents);
    const { error: reverseError } = await supabase.rpc('adjust_account_balance', {
      p_account_id: oldTx.account_id,
      p_adjustment: -oldAdjustment,
    });

    if (reverseError) {
      return { success: false, error: reverseError.message };
    }

    // Apply the new adjustment on the (possibly new) account
    const newAdjustment = calculateAdjustment(newType, newAmountCents);
    const { error: applyError } = await supabase.rpc('adjust_account_balance', {
      p_account_id: newAccountId,
      p_adjustment: newAdjustment,
    });

    if (applyError) {
      return { success: false, error: applyError.message };
    }

    // Update the transaction record
    const { data: updated, error: updateError } = await supabase
      .from('transactions')
      .update({
        ...(data.account_id !== undefined && { account_id: data.account_id }),
        ...(data.category_id !== undefined && { category_id: data.category_id }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.amount_cents !== undefined && { amount_cents: data.amount_cents }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.date !== undefined && { date: data.date }),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath('/transactions');
    revalidatePath('/accounts');

    return { success: true, data: updated as Transaction };
  } catch {
    return { success: false, error: 'Failed to update transaction' };
  }
}

/**
 * Deletes a transaction and reverses its balance adjustment.
 * Income deletion decreases the balance; expense deletion increases it.
 *
 * Validates: Requirements 5.4, 5.5
 */
export async function deleteTransaction(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Fetch the transaction to determine the balance reversal
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !transaction) {
      return { success: false, error: fetchError?.message ?? 'Transaction not found' };
    }

    const tx = transaction as Transaction;

    // Reverse the balance: income reversal subtracts, expense reversal adds
    const reversal = -calculateAdjustment(tx.type, tx.amount_cents);

    const { error: rpcError } = await supabase.rpc('adjust_account_balance', {
      p_account_id: tx.account_id,
      p_adjustment: reversal,
    });

    if (rpcError) {
      return { success: false, error: rpcError.message };
    }

    // Delete the transaction
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    revalidatePath('/transactions');
    revalidatePath('/accounts');

    return { success: true };
  } catch {
    return { success: false, error: 'Failed to delete transaction' };
  }
}
