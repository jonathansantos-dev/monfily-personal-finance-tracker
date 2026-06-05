-- Migration: Create adjust_account_balance PostgreSQL function
-- Requirements: 5.1 (create transaction updates balance), 5.3 (edit recalculates balance),
--               5.4 (delete recalculates balance), 5.5 (account change recalculates both)
--
-- This function atomically adjusts an account's balance by a given amount (in cents).
-- It is called via Supabase RPC when creating, editing, or deleting transactions.
-- SECURITY DEFINER allows it to bypass RLS for the atomic balance update.

CREATE OR REPLACE FUNCTION adjust_account_balance(
  p_account_id UUID,
  p_adjustment BIGINT
) RETURNS void AS $$
BEGIN
  UPDATE accounts
  SET balance_cents = balance_cents + p_adjustment,
      updated_at = now()
  WHERE id = p_account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
