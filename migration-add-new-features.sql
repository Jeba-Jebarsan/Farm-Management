-- ============================================
-- MIGRATION SCRIPT: Add New Features
-- Run this in Supabase SQL Editor
-- This adds only the new columns and tables
-- ============================================

-- 1. Add renewal_date column to vehicles table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'renewal_date'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN renewal_date TEXT NOT NULL DEFAULT '';
  END IF;
END $$;

-- 2. Create inventory_items table (if not exists)
CREATE TABLE IF NOT EXISTS inventory_items (
  id TEXT PRIMARY KEY,
  item_name TEXT NOT NULL,
  inventory_number TEXT NOT NULL UNIQUE,
  date_of_purchase TEXT NOT NULL,
  value REAL NOT NULL DEFAULT 0,
  revaluation_rate REAL NOT NULL DEFAULT 0,
  location TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Active',
  custody TEXT NOT NULL DEFAULT '',
  disposal TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Equipment'
);

-- 3. Create cropping_activities table (if not exists)
CREATE TABLE IF NOT EXISTS cropping_activities (
  id TEXT PRIMARY KEY,
  season TEXT NOT NULL,              -- 'Maha' or 'Yala'
  month TEXT NOT NULL,
  crop TEXT NOT NULL,
  activity TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT ''
);

-- 4. Enable RLS for new tables (if not already enabled)
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cropping_activities ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for inventory_items (if not exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'inventory_items' AND policyname = 'Allow read access to inventory_items'
  ) THEN
    CREATE POLICY "Allow read access to inventory_items" ON inventory_items FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'inventory_items' AND policyname = 'Allow write access to inventory_items'
  ) THEN
    CREATE POLICY "Allow write access to inventory_items" ON inventory_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'inventory_items' AND policyname = 'Allow update access to inventory_items'
  ) THEN
    CREATE POLICY "Allow update access to inventory_items" ON inventory_items FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'inventory_items' AND policyname = 'Allow delete access to inventory_items'
  ) THEN
    CREATE POLICY "Allow delete access to inventory_items" ON inventory_items FOR DELETE USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- 6. Create RLS policies for cropping_activities (if not exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cropping_activities' AND policyname = 'Allow read access to cropping_activities'
  ) THEN
    CREATE POLICY "Allow read access to cropping_activities" ON cropping_activities FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cropping_activities' AND policyname = 'Allow write access to cropping_activities'
  ) THEN
    CREATE POLICY "Allow write access to cropping_activities" ON cropping_activities FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cropping_activities' AND policyname = 'Allow update access to cropping_activities'
  ) THEN
    CREATE POLICY "Allow update access to cropping_activities" ON cropping_activities FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cropping_activities' AND policyname = 'Allow delete access to cropping_activities'
  ) THEN
    CREATE POLICY "Allow delete access to cropping_activities" ON cropping_activities FOR DELETE USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Migration complete!
-- You can now use the new features in your application.
