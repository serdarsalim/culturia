-- Enable Row Level Security for YouTube tables
-- Run this in Supabase SQL Editor

-- Enable RLS on youtube_tokens table
ALTER TABLE youtube_tokens ENABLE ROW LEVEL SECURITY;

-- Enable RLS on youtube_playlists table
ALTER TABLE youtube_playlists ENABLE ROW LEVEL SECURITY;

-- Enable RLS on youtube_sync_logs table
ALTER TABLE youtube_sync_logs ENABLE ROW LEVEL SECURITY;

-- ========================================
-- POLICIES FOR youtube_tokens
-- ========================================

-- Only service role or admin can view tokens (sensitive data)
CREATE POLICY "Service role can view all tokens"
ON youtube_tokens FOR SELECT
TO service_role
USING (true);

-- Only service role or admin can insert tokens
CREATE POLICY "Service role can insert tokens"
ON youtube_tokens FOR INSERT
TO service_role
WITH CHECK (true);

-- Only service role or admin can update tokens
CREATE POLICY "Service role can update tokens"
ON youtube_tokens FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Only service role or admin can delete tokens
CREATE POLICY "Service role can delete tokens"
ON youtube_tokens FOR DELETE
TO service_role
USING (true);

-- ========================================
-- POLICIES FOR youtube_playlists
-- ========================================

-- Anyone can view playlists (public data)
CREATE POLICY "Anyone can view playlists"
ON youtube_playlists FOR SELECT
USING (true);

-- Only service role can insert playlists
CREATE POLICY "Service role can insert playlists"
ON youtube_playlists FOR INSERT
TO service_role
WITH CHECK (true);

-- Only service role can update playlists
CREATE POLICY "Service role can update playlists"
ON youtube_playlists FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Only service role can delete playlists
CREATE POLICY "Service role can delete playlists"
ON youtube_playlists FOR DELETE
TO service_role
USING (true);

-- ========================================
-- POLICIES FOR youtube_sync_logs
-- ========================================

-- Anyone can view sync logs (for transparency)
CREATE POLICY "Anyone can view sync logs"
ON youtube_sync_logs FOR SELECT
USING (true);

-- Only service role can insert sync logs
CREATE POLICY "Service role can insert sync logs"
ON youtube_sync_logs FOR INSERT
TO service_role
WITH CHECK (true);

-- Only service role can update sync logs
CREATE POLICY "Service role can update sync logs"
ON youtube_sync_logs FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Only service role can delete sync logs
CREATE POLICY "Service role can delete sync logs"
ON youtube_sync_logs FOR DELETE
TO service_role
USING (true);

COMMENT ON POLICY "Service role can view all tokens" ON youtube_tokens IS 'OAuth tokens are sensitive - only service role can access';
COMMENT ON POLICY "Anyone can view playlists" ON youtube_playlists IS 'Playlist data is public and can be viewed by anyone';
COMMENT ON POLICY "Anyone can view sync logs" ON youtube_sync_logs IS 'Sync logs are public for transparency';
