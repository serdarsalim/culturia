# Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- Supabase account
- Vercel account (for deployment)

## Step-by-Step Setup

### 1. Run Database Migration (IMPORTANT - Do this first!)

1. Open Supabase Dashboard: https://xqgrwqeaqqpjxsdcmcqt.supabase.co
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy and paste the entire contents of `supabase-schema.sql`
5. Click **Run** or press `Cmd/Ctrl + Enter`
6. Wait for "Success. No rows returned" message

This creates all necessary tables, policies, and functions.

### 2. Install Dependencies

```bash
npm install
```

### 3. Test Locally

```bash
npm run dev
```

Open http://localhost:3000

### 4. Create Your Admin Account

1. Go to http://localhost:3000
2. Click "Sign In" in top right
3. Click "Don't have an account? Sign up"
4. Use email: **slmxyz@gmail.com**
5. Use password: **HudTefekkur4!**
6. Check your email and verify

### 5. Access Admin Panel

1. Go to http://localhost:3000/admin
2. Log in with your credentials
3. You should see the admin dashboard

### 6. Test the System

1. **As a regular user**:
   - Click on a country
   - Try to submit a video
   - It should ask you to sign in/up

2. **As admin**:
   - Go to /admin/dashboard
   - You should see any pending submissions
   - Test approve/reject functions

### 7. Deploy to Vercel

1. Push code to GitHub (if not already done)
2. Go to https://vercel.com
3. Import your repository
4. Add environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xqgrwqeaqqpjxsdcmcqt.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-key>
   ADMIN_EMAIL=slmxyz@gmail.com
   ```
5. Deploy!

## Common Issues

### "Could not find admin user" error
- Make sure you ran the SQL migration
- Make sure you signed up with the exact email: slmxyz@gmail.com
- Check the admin_users table in Supabase

### Build fails
- Run `npm install --legacy-peer-deps`
- Delete `.next` folder and rebuild
- Check Node.js version: `node -v` (should be 18+)

### Videos not loading
- Check that submissions are marked as "approved" in database
- Verify YouTube video IDs are correct
- Check browser console for errors

### Map not showing countries
- Check browser console for errors
- Try refreshing the page
- Check network tab for failed requests

## Next Steps

1. Customize the design/colors in components
2. Add more content by approving user submissions
3. Monitor the admin panel for new submissions
4. Share the site with potential contributors
5. Set up Google Analytics (optional)

## Important Files

- `supabase-schema.sql` - Database schema (run this in Supabase)
- `.env.local` - Environment variables (keep secret!)
- `README.md` - Full documentation
- `src/app/page.tsx` - Main application
- `src/app/admin/dashboard/page.tsx` - Admin panel

## Need Help?

- Read the full README.md
- Check Supabase documentation
- Check Next.js documentation
- Email: slmxyz@gmail.com

---

**You're all set! Start exploring and curating cultural content!**
