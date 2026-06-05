-- Migration: Create categories table
-- Requirements: 8.1, 11.1, 11.2

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only manage their own categories
CREATE POLICY "Users can manage own categories"
  ON categories
  FOR ALL
  USING (auth.uid() = user_id);
