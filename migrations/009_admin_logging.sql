-- Admin Logging and Compliance Tables

-- Audit Log for recording all Super Admin actions
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES auth_users(id) ON DELETE SET NULL,
  tenant_id INTEGER REFERENCES auth_users(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  target_table VARCHAR(100),
  target_id INTEGER,
  changes_json JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscription Events (upgrades, downgrades, trial extensions)
CREATE TABLE IF NOT EXISTS subscription_events (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES auth_users(id) ON DELETE CASCADE,
  admin_id INTEGER REFERENCES auth_users(id) ON DELETE SET NULL,
  old_plan VARCHAR(50),
  new_plan VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity Log for tracing tenant actions (useful for the Activity tab)
CREATE TABLE IF NOT EXISTS activity_log (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES auth_users(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES auth_users(id) ON DELETE SET NULL,
  action_type VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast querying in the Admin dashboard
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_id ON audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_id ON audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_tenant_id ON subscription_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_tenant_id ON activity_log(tenant_id);
