-- Migration: SaaS Onboarding Fields
-- Adds KVK, company size, and free email detection fields to auth_users

ALTER TABLE auth_users
ADD COLUMN IF NOT EXISTS kvk_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS company_size VARCHAR(50),
ADD COLUMN IF NOT EXISTS is_free_email BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS low_priority_support BOOLEAN DEFAULT false;
