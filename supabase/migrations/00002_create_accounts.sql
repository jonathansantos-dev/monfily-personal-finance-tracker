-- Migration: Create accounts table
-- Requirements: 7.2, 11.1, 11.2

CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'credit_card', 'wallet', 'cash', 'investment', 'other')),
  balance_cents BIGINT NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only manage their own accounts
CREATE POLICY "Users can manage own accounts" ON accounts
  FOR ALL
  USING (auth.uid() = user_id);
