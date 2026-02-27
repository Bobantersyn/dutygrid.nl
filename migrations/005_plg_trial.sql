-- Product-Led Growth Transition: Free Trial Logic
-- Adds fields to the auth_users table to support a 14-day free trial.

ALTER TABLE auth_users
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS trial_starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'trialing';

-- Automatically calculate 14 days later if not specified on insert
CREATE OR REPLACE FUNCTION set_trial_ends_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.trial_ends_at IS NULL THEN
        NEW.trial_ends_at = CURRENT_TIMESTAMP + INTERVAL '14 days';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_trial_ends_at ON auth_users;

CREATE TRIGGER trg_set_trial_ends_at
BEFORE INSERT ON auth_users
FOR EACH ROW
WHEN (NEW.subscription_status = 'trialing')
EXECUTE FUNCTION set_trial_ends_at();
