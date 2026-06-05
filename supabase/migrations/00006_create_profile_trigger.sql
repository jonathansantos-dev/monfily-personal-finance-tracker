-- Migration: Create triggers for auto-creating profile on user signup and seeding default categories
-- Requirements: 1.1 (user registration creates profile), 13.1, 13.2, 13.3 (default category seeding)

-- Trigger function: Auto-create a profile row when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Fire after a new row is inserted into auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger function: Seed 7 default categories when a new profile is created
CREATE OR REPLACE FUNCTION seed_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO categories (user_id, name, icon, color) VALUES
    (NEW.id, 'Food', '🍔', '#f97316'),
    (NEW.id, 'Transport', '🚗', '#3b82f6'),
    (NEW.id, 'Housing', '🏠', '#8b5cf6'),
    (NEW.id, 'Health', '💊', '#10b981'),
    (NEW.id, 'Entertainment', '🎬', '#ec4899'),
    (NEW.id, 'Income', '💰', '#22c55e'),
    (NEW.id, 'Other', '📦', '#6b7280');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Fire after a new profile row is inserted
CREATE TRIGGER on_profile_created_seed_categories
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION seed_default_categories();
