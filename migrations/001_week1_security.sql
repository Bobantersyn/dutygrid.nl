-- DutyGrid Database Schema - Week 1 Additions
-- Security & Infrastructure Tables

-- ============================================
-- 1. AUDIT LOGGING
-- ============================================

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  
  -- Who
  user_id TEXT NOT NULL REFERENCES auth_users(id),
  user_email VARCHAR(255),
  user_role VARCHAR(50),
  
  -- What
  action VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'APPROVE', 'REJECT'
  entity_type VARCHAR(50) NOT NULL, -- 'shift', 'employee', 'swap', 'assignment', etc.
  entity_id TEXT,
  
  -- Changes (for UPDATE actions)
  changes JSONB, -- {"before": {...}, "after": {...}}
  
  -- Where (request info)
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- When
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast querying
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- Example audit log entry:
-- {
--   "user_id": "user_123",
--   "user_email": "planner@dutygrid.nl",
--   "user_role": "planner",
--   "action": "UPDATE",
--   "entity_type": "shift",
--   "entity_id": "456",
--   "changes": {
--     "before": {"employee_id": 10, "start_time": "08:00"},
--     "after": {"employee_id": 12, "start_time": "09:00"}
--   },
--   "ip_address": "192.168.1.1",
--   "timestamp": "2026-01-31T10:00:00Z"
-- }


-- ============================================
-- 2. TWO-FACTOR AUTHENTICATION
-- ============================================

-- Add 2FA fields to auth_users table
ALTER TABLE auth_users 
  ADD COLUMN two_factor_secret TEXT,
  ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN two_factor_backup_codes TEXT[]; -- Array of backup codes

-- 2FA verification attempts (rate limiting)
CREATE TABLE two_factor_attempts (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES auth_users(id) ON DELETE CASCADE,
  success BOOLEAN NOT NULL,
  ip_address VARCHAR(45),
  attempted_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_2fa_attempts_user ON two_factor_attempts(user_id);
CREATE INDEX idx_2fa_attempts_time ON two_factor_attempts(attempted_at DESC);


-- ============================================
-- 3. ENHANCED RBAC (Role-Based Access Control)
-- ============================================

-- Add permission fields to user_roles table
ALTER TABLE user_roles
  ADD COLUMN can_edit_own_planning BOOLEAN DEFAULT FALSE,
  ADD COLUMN can_edit_availability BOOLEAN DEFAULT TRUE,
  ADD COLUMN planning_weeks_ahead INTEGER DEFAULT 2,
  ADD COLUMN can_view_team_planning BOOLEAN DEFAULT FALSE,
  ADD COLUMN can_approve_swaps BOOLEAN DEFAULT FALSE,
  ADD COLUMN can_manage_employees BOOLEAN DEFAULT FALSE;

-- Update existing roles with default permissions
UPDATE user_roles SET
  can_edit_own_planning = FALSE,
  can_edit_availability = TRUE,
  planning_weeks_ahead = 2,
  can_view_team_planning = FALSE,
  can_approve_swaps = FALSE,
  can_manage_employees = FALSE
WHERE role = 'beveiliger';

UPDATE user_roles SET
  can_edit_own_planning = FALSE,
  can_edit_availability = TRUE,
  planning_weeks_ahead = 8,
  can_view_team_planning = TRUE,
  can_approve_swaps = TRUE,
  can_manage_employees = TRUE
WHERE role = 'planner';

UPDATE user_roles SET
  can_edit_own_planning = TRUE,
  can_edit_availability = TRUE,
  planning_weeks_ahead = 52,
  can_view_team_planning = TRUE,
  can_approve_swaps = TRUE,
  can_manage_employees = TRUE
WHERE role = 'admin';


-- ============================================
-- 4. RATE LIMITING
-- ============================================

CREATE TABLE rate_limit_violations (
  id SERIAL PRIMARY KEY,
  
  -- Who
  user_id TEXT REFERENCES auth_users(id) ON DELETE SET NULL,
  ip_address VARCHAR(45) NOT NULL,
  
  -- What
  endpoint VARCHAR(200) NOT NULL,
  request_count INTEGER NOT NULL,
  limit_type VARCHAR(50) NOT NULL, -- 'per_minute', 'per_hour', 'per_day'
  
  -- When
  window_start TIMESTAMP NOT NULL,
  blocked_until TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rate_limit_ip ON rate_limit_violations(ip_address);
CREATE INDEX idx_rate_limit_user ON rate_limit_violations(user_id);
CREATE INDEX idx_rate_limit_time ON rate_limit_violations(created_at DESC);


-- ============================================
-- 5. SYSTEM SETTINGS
-- ============================================

CREATE TABLE system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  data_type VARCHAR(20) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
  updated_by TEXT REFERENCES auth_users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Default system settings
INSERT INTO system_settings (key, value, description, data_type) VALUES
  ('default_travel_cost_per_km', '0.23', 'Standaard reiskostenvergoeding per kilometer', 'number'),
  ('min_rest_hours', '12', 'Minimum aantal uur rust tussen diensten', 'number'),
  ('planning_auto_save', 'true', 'Automatisch opslaan van planning wijzigingen', 'boolean'),
  ('notification_email_enabled', 'true', 'Email notificaties ingeschakeld', 'boolean'),
  ('max_login_attempts', '5', 'Maximum aantal login pogingen voor blokkering', 'number'),
  ('session_timeout_hours', '24', 'Sessie timeout in uren', 'number');


-- ============================================
-- 6. EMPLOYEE PERMISSIONS (per medewerker)
-- ============================================

-- Add permission fields to employees table
ALTER TABLE employees
  ADD COLUMN can_edit_availability BOOLEAN DEFAULT TRUE,
  ADD COLUMN custom_travel_cost_per_km DECIMAL(5,2),
  ADD COLUMN notes_internal TEXT; -- Interne notities (alleen voor planners/admin)


-- ============================================
-- 7. CLEANUP & MAINTENANCE
-- ============================================

-- Function to clean old audit logs (auto-delete after 1 year)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM audit_logs 
  WHERE timestamp < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Function to clean old 2FA attempts (auto-delete after 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_2fa_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM two_factor_attempts 
  WHERE attempted_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Function to clean expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM auth_sessions 
  WHERE expires < NOW();
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'audit_logs',
    'two_factor_attempts',
    'rate_limit_violations',
    'system_settings'
  )
ORDER BY table_name;

-- Check if all columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'auth_users' 
  AND column_name LIKE 'two_factor%';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_roles' 
  AND column_name LIKE 'can_%';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'employees' 
  AND column_name IN ('can_edit_availability', 'custom_travel_cost_per_km', 'notes_internal');
