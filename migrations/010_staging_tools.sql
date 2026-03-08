-- Migration: 010_staging_tools
-- Description: Creates tables required for the Staging Test Toolkit (V1).
-- This ensures that environments can safely log actions without affecting real users.

CREATE TABLE IF NOT EXISTS staging_mail_sink (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id INTEGER REFERENCES auth_users(id) ON DELETE CASCADE,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body_text TEXT,
    body_html TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_staging_mail_sink_tenant ON staging_mail_sink(tenant_id);
CREATE INDEX idx_staging_mail_sink_recipient ON staging_mail_sink(recipient_email);
