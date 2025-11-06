-- Add User Favorites Table
-- Run this in your Supabase SQL Editor

-- User Favorites Table
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES video_submissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One favorite per user per video
  UNIQUE(user_id, submission_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_submission ON user_favorites(submission_id);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert their own favorites
CREATE POLICY "Users can add favorites"
ON user_favorites FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites"
ON user_favorites FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete own favorites"
ON user_favorites FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE user_favorites IS 'Stores user favorite videos';
