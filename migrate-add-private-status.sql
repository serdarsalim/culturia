BEGIN;

-- FIRST: Drop the unique constraint that limited one video per user/country/category
ALTER TABLE video_submissions
DROP CONSTRAINT IF EXISTS video_submissions_user_id_country_code_category_key;

-- SECOND: Drop existing status check constraint
ALTER TABLE video_submissions
DROP CONSTRAINT IF EXISTS video_submissions_status_check;

-- THIRD: Add new check constraint with 'private' status
ALTER TABLE video_submissions
ADD CONSTRAINT video_submissions_status_check
CHECK (status IN ('private', 'pending', 'approved', 'rejected'));

-- FOURTH: Add was_approved column to track if video was ever approved
ALTER TABLE video_submissions
ADD COLUMN IF NOT EXISTS was_approved BOOLEAN DEFAULT FALSE;

-- FIFTH: Set was_approved = true for all currently approved videos
UPDATE video_submissions
SET was_approved = TRUE
WHERE status = 'approved';

COMMIT;
