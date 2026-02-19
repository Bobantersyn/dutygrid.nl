-- Migration: 002_schema_alignment
-- Purpose: Align database with OVERDRACHT_DATABASE.js documentation

-- 1. Create saved_availability_patterns table (was missing)
CREATE TABLE IF NOT EXISTS saved_availability_patterns (
  id SERIAL PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  pattern_name TEXT NOT NULL,
  pattern_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Align shift_swaps to shift_swap_requests
ALTER TABLE IF EXISTS shift_swaps RENAME TO shift_swap_requests;

-- Now modify columns to match spec
ALTER TABLE shift_swap_requests 
  RENAME COLUMN from_employee_id TO requesting_employee_id;

ALTER TABLE shift_swap_requests 
  RENAME COLUMN to_employee_id TO target_employee_id;

ALTER TABLE shift_swap_requests
  ADD COLUMN IF NOT EXISTS swap_type TEXT DEFAULT 'takeover' CHECK (swap_type IN ('swap', 'takeover')),
  ADD COLUMN IF NOT EXISTS approved_by_user_id INT REFERENCES auth_users(id),
  ADD COLUMN IF NOT EXISTS response_message TEXT;

-- Drop constraints if needed to ensuring pure alignment?
-- For now, we trust the renames.

-- Ensure status check constraint matches docs
ALTER TABLE shift_swap_requests DROP CONSTRAINT IF EXISTS shift_swaps_status_check; -- Drop old if exists
ALTER TABLE shift_swap_requests ADD CONSTRAINT shift_swap_requests_status_check 
  CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'));
