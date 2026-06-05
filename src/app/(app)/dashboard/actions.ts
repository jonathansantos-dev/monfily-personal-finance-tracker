'use server';

import { createClient } from '../../../../lib/supabase/server';
import type { Transaction } from '../../../../lib/types/database';

/**
 * Structured result type for dashboard queries.
 */
interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Transaction with joined account and category data for display in recent transactions.
 */
export interface DashboardTransaction extends Transaction {
  accounts: { id: string; name: string; color: string } | null;
  categories: { id: string; name: string; icon: string; color: string } | null;
}

/**
 * Monthly chart data aggregating income and expenses in cents.
 */
export interface MonthlyChartData {
  income: number;
  expenses: number;
}

/**
 * Fetches the total balance across all accounts for the currently authenticated user.
 * Returns the sum of balance_cents for all user accounts.
 *
 * Validates: Requirements 4.1, 4.4
 */
export async function getTotalBalance(): Promise<ActionResult<number>> {
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
      .select('balance_cents')
      .eq('user_id', user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    const totalCents = (data ?? []).reduce(
      (sum: number, account: { balance_cents: number }) => sum + account.balance_cents,
      0
    );

    return { success: true, data: totalCents };
  } catch {
    return { success: false, error: 'Failed to fetch total balance' };
  }
}

/**
 * Fetches aggregated income and expenses for the current calendar month.
 * Groups transactions by type and sums the amounts in cents.
 *
 * Validates: Requirements 4.2, 4.5
 */
export async function getMonthlyChartData(): Promise<ActionResult<MonthlyChartData>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0];

    const { data, error } = await supabase
      .from('transactions')
      .select('type, amount_cents')
      .eq('user_id', user.id)
      .gte('date', startOfMonth)
      .lte('date', endOfMonth);

    if (error) {
      return { success: false, error: error.message };
    }

    const transactions = data as { type: string; amount_cents: number }[];

    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount_cents, 0);

    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount_cents, 0);

    return { success: true, data: { income, expenses } };
  } catch {
    return { success: false, error: 'Failed to fetch monthly chart data' };
  }
}

/**
 * Fetches the 10 most recent transactions for the currently authenticated user.
 * Includes joined account and category data for display.
 * Ordered by date descending, then by created_at descending.
 *
 * Validates: Requirements 4.3
 */
export async function getRecentTransactions(): Promise<ActionResult<DashboardTransaction[]>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*, accounts(id, name, color), categories(id, name, icon, color)')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as DashboardTransaction[] };
  } catch {
    return { success: false, error: 'Failed to fetch recent transactions' };
  }
}
