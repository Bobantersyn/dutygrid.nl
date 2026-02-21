-- Migration: 004_phase5_schema
-- Purpose: Add new employee fields (pass_type, flex, profile_photo, split names), drop cao_type, and create object_labels.

-- 1. Modify employees table
ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS pass_type VARCHAR(50) DEFAULT 'geen' CHECK (pass_type IN ('groen', 'grijs', 'geen')),
  ADD COLUMN IF NOT EXISTS is_flex BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS profile_photo TEXT;

-- Safely drop cao_type if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'cao_type') THEN
    ALTER TABLE employees DROP COLUMN cao_type;
  END IF;
END $$;

-- Update existing names if first_name/last_name are empty
-- split the existing 'name' into first_name and last_name for existing records as best effort
UPDATE employees 
SET 
  first_name = split_part(name, ' ', 1),
  last_name = SUBSTRING(name FROM length(split_part(name, ' ', 1)) + 2)
WHERE first_name IS NULL;

-- 2. Create object_labels for shift swap validation
CREATE TABLE IF NOT EXISTS object_labels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Link employees to object labels
CREATE TABLE IF NOT EXISTS employee_object_labels (
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    object_label_id INTEGER REFERENCES object_labels(id) ON DELETE CASCADE,
    PRIMARY KEY (employee_id, object_label_id)
);

-- Link assignments to object labels
CREATE TABLE IF NOT EXISTS assignment_object_labels (
    assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
    object_label_id INTEGER REFERENCES object_labels(id) ON DELETE CASCADE,
    PRIMARY KEY (assignment_id, object_label_id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_employee_object_labels_emp ON employee_object_labels(employee_id);
CREATE INDEX IF NOT EXISTS idx_assignment_object_labels_ass ON assignment_object_labels(assignment_id);
