-- Titan Fleet Management System - Supabase Schema
-- Run this SQL in your Supabase project's SQL Editor (https://supabase.com/dashboard)

-- ============================================
-- 1. VEHICLES TABLE
-- ============================================
CREATE TABLE vehicles (
  id TEXT PRIMARY KEY,                    -- Internal ID: TR-0001, LR-0001, etc.
  legal_plate_no TEXT NOT NULL,
  province_code TEXT NOT NULL,
  type TEXT NOT NULL,
  make_model TEXT NOT NULL,
  year TEXT NOT NULL,
  engine_no TEXT NOT NULL,
  chassis_no TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  joined_date TEXT NOT NULL,
  renewal_date TEXT NOT NULL DEFAULT ''  -- License/Insurance renewal date
);

-- ============================================
-- 2. FUEL LOGS TABLE
-- ============================================
CREATE TABLE fuel_logs (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id),
  legal_plate_no TEXT NOT NULL,
  date TEXT NOT NULL,
  quantity REAL NOT NULL DEFAULT 0,
  cost REAL NOT NULL DEFAULT 0,
  mileage REAL NOT NULL DEFAULT 0,
  supplier TEXT NOT NULL DEFAULT ''
);

-- ============================================
-- 3. MAINTENANCE LOGS TABLE
-- ============================================
CREATE TABLE maintenance_logs (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id),
  date TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Regular',
  odometer REAL NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  cost REAL NOT NULL DEFAULT 0,
  next_due_date TEXT NOT NULL DEFAULT ''
);

-- ============================================
-- 4. REPAIR LOGS TABLE
-- ============================================
CREATE TABLE repair_logs (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id),
  date TEXT NOT NULL,
  issue TEXT NOT NULL DEFAULT '',
  action_taken TEXT NOT NULL DEFAULT '',
  parts_used TEXT NOT NULL DEFAULT '',
  cost REAL NOT NULL DEFAULT 0,
  downtime_days REAL NOT NULL DEFAULT 0
);

-- ============================================
-- 5. INSURANCE LOGS TABLE
-- ============================================
CREATE TABLE insurance_logs (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id),
  legal_plate_no TEXT NOT NULL,
  policy_no TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT '',
  premium REAL NOT NULL DEFAULT 0
);

-- ============================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. RLS POLICIES (read = anyone, write = authenticated only)
-- ============================================

-- Vehicles
CREATE POLICY "Allow read access to vehicles" ON vehicles FOR SELECT USING (true);
CREATE POLICY "Allow write access to vehicles" ON vehicles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update access to vehicles" ON vehicles FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow delete access to vehicles" ON vehicles FOR DELETE USING (auth.role() = 'authenticated');

-- Fuel Logs
CREATE POLICY "Allow read access to fuel_logs" ON fuel_logs FOR SELECT USING (true);
CREATE POLICY "Allow write access to fuel_logs" ON fuel_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update access to fuel_logs" ON fuel_logs FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow delete access to fuel_logs" ON fuel_logs FOR DELETE USING (auth.role() = 'authenticated');

-- Maintenance Logs
CREATE POLICY "Allow read access to maintenance_logs" ON maintenance_logs FOR SELECT USING (true);
CREATE POLICY "Allow write access to maintenance_logs" ON maintenance_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update access to maintenance_logs" ON maintenance_logs FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow delete access to maintenance_logs" ON maintenance_logs FOR DELETE USING (auth.role() = 'authenticated');

-- Repair Logs
CREATE POLICY "Allow read access to repair_logs" ON repair_logs FOR SELECT USING (true);
CREATE POLICY "Allow write access to repair_logs" ON repair_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update access to repair_logs" ON repair_logs FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow delete access to repair_logs" ON repair_logs FOR DELETE USING (auth.role() = 'authenticated');

-- Insurance Logs
CREATE POLICY "Allow read access to insurance_logs" ON insurance_logs FOR SELECT USING (true);
CREATE POLICY "Allow write access to insurance_logs" ON insurance_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update access to insurance_logs" ON insurance_logs FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow delete access to insurance_logs" ON insurance_logs FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- 8. ITEM MASTER TABLE (Store & Stock)
-- ============================================
CREATE TABLE item_master (
  item_code TEXT PRIMARY KEY,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  unit TEXT NOT NULL DEFAULT 'Nos',
  reorder_level INTEGER NOT NULL DEFAULT 0,
  unit_price REAL NOT NULL DEFAULT 0,
  opening_stock REAL NOT NULL DEFAULT 0
);

-- ============================================
-- 9. STOCK IN TABLE
-- ============================================
CREATE TABLE stock_in (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  item_code TEXT NOT NULL REFERENCES item_master(item_code),
  qty REAL NOT NULL DEFAULT 0,
  supplier TEXT NOT NULL DEFAULT '',
  grn_no TEXT NOT NULL DEFAULT ''
);

-- ============================================
-- 10. STOCK OUT TABLE
-- ============================================
CREATE TABLE stock_out (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  item_code TEXT NOT NULL REFERENCES item_master(item_code),
  qty REAL NOT NULL DEFAULT 0,
  issued_to TEXT NOT NULL DEFAULT '',
  purpose TEXT NOT NULL DEFAULT ''
);

-- ============================================
-- 11. RLS FOR STOCK TABLES
-- ============================================
ALTER TABLE item_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_in ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_out ENABLE ROW LEVEL SECURITY;

-- Item Master
CREATE POLICY "Allow read access to item_master" ON item_master FOR SELECT USING (true);
CREATE POLICY "Allow write access to item_master" ON item_master FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update access to item_master" ON item_master FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow delete access to item_master" ON item_master FOR DELETE USING (auth.role() = 'authenticated');

-- Stock In
CREATE POLICY "Allow read access to stock_in" ON stock_in FOR SELECT USING (true);
CREATE POLICY "Allow write access to stock_in" ON stock_in FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update access to stock_in" ON stock_in FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow delete access to stock_in" ON stock_in FOR DELETE USING (auth.role() = 'authenticated');

-- Stock Out
CREATE POLICY "Allow read access to stock_out" ON stock_out FOR SELECT USING (true);
CREATE POLICY "Allow write access to stock_out" ON stock_out FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update access to stock_out" ON stock_out FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow delete access to stock_out" ON stock_out FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- 12. EMPLOYEES TABLE (HR Management)
-- ============================================
CREATE TABLE employees (
  emp_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  designation TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  join_date TEXT NOT NULL,
  wage_per_day REAL NOT NULL DEFAULT 0,
  emp_type TEXT NOT NULL DEFAULT 'Permanent',
  increment_date TEXT NOT NULL DEFAULT '',
  profile_pic TEXT NOT NULL DEFAULT ''
);

-- ============================================
-- 13. LEAVE RECORDS TABLE
-- ============================================
CREATE TABLE leave_records (
  id TEXT PRIMARY KEY,
  emp_id TEXT NOT NULL REFERENCES employees(emp_id),
  leave_type TEXT NOT NULL DEFAULT 'Annual',
  from_date TEXT NOT NULL,
  to_date TEXT NOT NULL,
  days REAL NOT NULL DEFAULT 0,
  approved TEXT NOT NULL DEFAULT 'Pending'
);

-- ============================================
-- 14. OVERTIME RECORDS TABLE
-- ============================================
CREATE TABLE overtime_records (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  emp_id TEXT NOT NULL REFERENCES employees(emp_id),
  ot_hours REAL NOT NULL DEFAULT 0,
  rate REAL NOT NULL DEFAULT 0,
  amount REAL NOT NULL DEFAULT 0
);

-- ============================================
-- 15. RLS FOR HR TABLES
-- ============================================
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE overtime_records ENABLE ROW LEVEL SECURITY;

-- Employees
CREATE POLICY "Allow read access to employees" ON employees FOR SELECT USING (true);
CREATE POLICY "Allow write access to employees" ON employees FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update access to employees" ON employees FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow delete access to employees" ON employees FOR DELETE USING (auth.role() = 'authenticated');

-- Leave Records
CREATE POLICY "Allow read access to leave_records" ON leave_records FOR SELECT USING (true);
CREATE POLICY "Allow write access to leave_records" ON leave_records FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update access to leave_records" ON leave_records FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow delete access to leave_records" ON leave_records FOR DELETE USING (auth.role() = 'authenticated');

-- Overtime Records
CREATE POLICY "Allow read access to overtime_records" ON overtime_records FOR SELECT USING (true);
CREATE POLICY "Allow write access to overtime_records" ON overtime_records FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update access to overtime_records" ON overtime_records FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow delete access to overtime_records" ON overtime_records FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- 16. DAILY VEHICLE LOGS TABLE
-- ============================================
CREATE TABLE daily_vehicle_logs (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id),
  driver TEXT NOT NULL DEFAULT '',
  purpose TEXT NOT NULL DEFAULT '',
  km_start REAL NOT NULL DEFAULT 0,
  km_end REAL NOT NULL DEFAULT 0,
  distance REAL NOT NULL DEFAULT 0,
  fuel_used REAL NOT NULL DEFAULT 0,
  remarks TEXT NOT NULL DEFAULT ''
);

ALTER TABLE daily_vehicle_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to daily_vehicle_logs" ON daily_vehicle_logs FOR SELECT USING (true);
CREATE POLICY "Allow write access to daily_vehicle_logs" ON daily_vehicle_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update access to daily_vehicle_logs" ON daily_vehicle_logs FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow delete access to daily_vehicle_logs" ON daily_vehicle_logs FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- 17. INVENTORY ITEMS TABLE
-- ============================================
CREATE TABLE inventory_items (
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

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to inventory_items" ON inventory_items FOR SELECT USING (true);
CREATE POLICY "Allow write access to inventory_items" ON inventory_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update access to inventory_items" ON inventory_items FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow delete access to inventory_items" ON inventory_items FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- 18. CROPPING ACTIVITIES TABLE
-- ============================================
CREATE TABLE cropping_activities (
  id TEXT PRIMARY KEY,
  season TEXT NOT NULL,              -- 'Maha' or 'Yala'
  month TEXT NOT NULL,
  crop TEXT NOT NULL,
  activity TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT ''
);

ALTER TABLE cropping_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to cropping_activities" ON cropping_activities FOR SELECT USING (true);
CREATE POLICY "Allow write access to cropping_activities" ON cropping_activities FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update access to cropping_activities" ON cropping_activities FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow delete access to cropping_activities" ON cropping_activities FOR DELETE USING (auth.role() = 'authenticated');
