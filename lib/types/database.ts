/**
 * Database types matching the Supabase PostgreSQL schema.
 * All types are exported for use throughout the codebase.
 *
 * Requirements: 5.2 (amounts in cents), 7.1 (account management),
 * 12.2 (cent-to-dollar conversion), 12.3 (dollar-to-cent conversion)
 */

/** Valid account types matching the CHECK constraint on the accounts table */
export type AccountType =
  | 'checking'
  | 'savings'
  | 'credit_card'
  | 'wallet'
  | 'cash'
  | 'investment'
  | 'other';

/** Valid transaction types matching the CHECK constraint on the transactions table */
export type TransactionType = 'income' | 'expense';

/** User profile extending Supabase auth.users */
export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  dark_mode: boolean;
  created_at: string;
  updated_at: string;
}

/** Financial account with running balance stored in cents */
export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  balance_cents: number;
  color: string;
  created_at: string;
  updated_at: string;
}

/** User-defined category for organizing transactions */
export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
}

/** Financial transaction record linked to an account and category */
export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string;
  type: TransactionType;
  amount_cents: number;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string;
}
