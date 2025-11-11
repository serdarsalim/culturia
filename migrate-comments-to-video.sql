-- Migration: Change comments from country-based to video-based
-- This migration updates the country_comments table to tie comments to videos instead of countries

-- Step 1: Drop existing policies and constraints
DROP POLICY IF EXISTS "Public can view all comments" ON country_comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON country_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON country_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON country_comments;
DROP POLICY IF EXISTS "Admins can delete any comment" ON country_comments;

-- Step 2: DELETE all existing comments (since we can't map them to specific videos)
-- WARNING: This will permanently delete all existing comments!
-- If you want to preserve comments, you need a custom migration script to map them to videos.
DELETE FROM country_comments;

-- Step 3: Rename the table to reflect its new purpose
ALTER TABLE country_comments RENAME TO video_comments;

-- Step 4: Add the new video_id column (NOT NULL since table is now empty)
ALTER TABLE video_comments
ADD COLUMN video_id UUID NOT NULL REFERENCES video_submissions(id) ON DELETE CASCADE;

-- Step 5: Drop the old country_code unique constraint
ALTER TABLE video_comments DROP CONSTRAINT IF EXISTS country_comments_user_id_country_code_key;

-- Step 6: Update the unique constraint to be per user per video
ALTER TABLE video_comments
ADD CONSTRAINT video_comments_user_video_unique UNIQUE(user_id, video_id);

-- Step 7: Drop the country_code column
ALTER TABLE video_comments DROP COLUMN country_code;

-- Step 8: Update indexes
DROP INDEX IF EXISTS idx_country_comments_country;
DROP INDEX IF EXISTS idx_country_comments_user;
DROP INDEX IF EXISTS idx_country_comments_updated;

CREATE INDEX IF NOT EXISTS idx_video_comments_video ON video_comments(video_id);
CREATE INDEX IF NOT EXISTS idx_video_comments_user ON video_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_video_comments_updated ON video_comments(updated_at DESC);

-- Step 9: Update the trigger name
DROP TRIGGER IF EXISTS update_country_comments_updated_at ON video_comments;

CREATE TRIGGER update_video_comments_updated_at
  BEFORE UPDATE ON video_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 10: Recreate RLS policies for the renamed table
ALTER TABLE video_comments ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can view all comments
CREATE POLICY "Public can view all comments"
ON video_comments FOR SELECT
USING (true);

-- Authenticated users can insert comments
CREATE POLICY "Authenticated users can insert comments"
ON video_comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
ON video_comments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
ON video_comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can delete any comment
CREATE POLICY "Admins can delete any comment"
ON video_comments FOR DELETE
TO authenticated
USING (public.is_admin());

-- Step 11: Update table comment
COMMENT ON TABLE video_comments IS 'Stores user comments/perspectives for each video (one comment per user per video)';
