-- Migration: Rename categories to match new schema
-- 1. 'cooking' -> 'daily_life'
-- 2. 'street_voices' -> 'talks'
-- This updates all existing category entries in video_submissions table

BEGIN;

-- Update all cooking category entries to daily_life
UPDATE video_submissions
SET category = 'daily_life'
WHERE category = 'cooking';

-- Update all street_voices category entries to talks
UPDATE video_submissions
SET category = 'talks'
WHERE category = 'street_voices';

-- If you have a CHECK constraint on the category column, you'll need to:
-- 1. Drop the old constraint
-- 2. Add a new constraint with the updated values

-- Drop existing check constraint (if it exists)
ALTER TABLE video_submissions
DROP CONSTRAINT IF EXISTS video_submissions_category_check;

-- Add new check constraint with updated category values
ALTER TABLE video_submissions
ADD CONSTRAINT video_submissions_category_check
CHECK (category IN ('inspiration', 'music', 'comedy', 'daily_life', 'talks'));

COMMIT;

-- Verification query (run this separately to check the migration)
-- SELECT category, COUNT(*) FROM video_submissions GROUP BY category;
