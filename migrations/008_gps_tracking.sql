-- GPS & Geofencing Migration
-- Add location coordinates and geofence radius to assignments
ALTER TABLE assignments
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS geofence_radius_meters INTEGER DEFAULT 100;

-- Add clock-in / clock-out coordinates and flags to shifts
ALTER TABLE shifts
ADD COLUMN IF NOT EXISTS clock_in_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS clock_in_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS clock_out_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS clock_out_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS is_geofence_violation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS geofence_violation_details TEXT;
