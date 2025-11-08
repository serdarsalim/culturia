-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all submissions" ON video_submissions;
DROP POLICY IF EXISTS "Admins can update any submission" ON video_submissions;
DROP POLICY IF EXISTS "Admins can delete any submission" ON video_submissions;

-- Allow admins to view ALL video submissions (not just their own)
CREATE POLICY "Admins can view all submissions"
ON video_submissions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
  )
);

-- Allow admins to UPDATE any video submission (for moderation)
CREATE POLICY "Admins can update any submission"
ON video_submissions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
  )
);

-- Allow admins to DELETE any video submission
CREATE POLICY "Admins can delete any submission"
ON video_submissions FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
  )
);
