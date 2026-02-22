-- Add address column to employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS address TEXT NOT NULL DEFAULT '';
