-- Migration: Create transactions table with type CHECK, amount CHECK, foreign keys, and RLS policies
-- Requirements: 5.1 (transaction management), 5.2 (amounts in cents), 11.1 (RLS on all tables), 11.2 (scoped to auth.uid())

-- Create the transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only manage their own transactions
CREATE POLICY "Users can manage own transactions"
  ON transactions
  FOR ALL
  USING (auth.uid() = user_id);

-- Index on account_id for efficient account-based queries
CREATE INDEX idx_transactions_account_id ON transactions (account_id);

-- Index on category_id for efficient category-based queries
CREATE INDEX idx_transactions_category_id ON transactions (category_id);

-- Composite index on (user_id, date) for efficient date-range filtering per user
CREATE INDEX idx_transactions_user_id_date ON transactions (user_id, date);
