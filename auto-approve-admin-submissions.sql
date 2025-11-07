-- Auto-approve admin users' own submissions
-- Run this in Supabase SQL Editor

-- Function: if the current auth user is an admin and is inserting/updating
-- their own row in video_submissions, force status to 'approved'.
CREATE OR REPLACE FUNCTION auto_approve_admin_submission()
RETURNS TRIGGER AS $$
BEGIN
  -- Only auto-approve when the actor is submitting/updating their OWN row
  -- and the actor is an admin (exists in admin_users)
  IF auth.uid() IS NOT NULL
     AND NEW.user_id = auth.uid()
     AND EXISTS (SELECT 1 FROM admin_users a WHERE a.id = auth.uid()) THEN
    NEW.status := 'approved';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: fire on insert or update to catch both new and resubmitted videos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_auto_approve_admin_submission'
  ) THEN
    CREATE TRIGGER trg_auto_approve_admin_submission
      BEFORE INSERT OR UPDATE ON video_submissions
      FOR EACH ROW
      EXECUTE FUNCTION auto_approve_admin_submission();
  END IF;
END $$;

