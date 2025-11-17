-- Allow authenticated users to create their own Google link rows
-- Needed for client-side OAuth workflow that writes to google_account_links
DROP POLICY IF EXISTS "Users can insert own google links" ON google_account_links;
CREATE POLICY "Users can insert own google links"
ON google_account_links
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
