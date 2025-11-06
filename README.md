# CULTURIA

**Discover Authentic Cultural Content from Around the World**

CULTURIA is an interactive web application that allows users to explore cultural content from every country through curated YouTube videos. Users can discover inspirational speeches, music, comedy, cooking, and street interviews from around the globe.

## Features

### Core Features
- 🗺️ **Interactive World Map** - Click any country to explore its cultural content
- 🎬 **5 Content Categories per Country**:
  - Inspiration (speeches and talks)
  - Music (traditional and popular songs)
  - Comedy (jokes and humor)
  - Cooking (local cuisine)
  - Street Voices (vox pop and interviews)
- 📹 **Random Video Selection** - Each category shows random videos from an approved pool
- ⏭️ **Next Button** - Jump to another video in the same category
- 🔄 **Auto-play Next** - Automatically plays the next video when current one ends

### User Submission System
- ✅ **Email Verification Required** - Users must verify email before submitting
- 📤 **One Video Per Category Per Country** - Users can submit/edit one video per category
- ⏳ **Approval Workflow** - All submissions reviewed by admins before going live
- 🚩 **Flag System** - Users can report broken or inappropriate videos
- 🔍 **Duplicate Detection** - Prevents the same video from being submitted multiple times

### Admin Panel
- 👀 **Review Submissions** - Approve, reject, or mark pending
- 🔎 **Filtering** - Filter by status (pending, approved, rejected, flagged)
- ✏️ **Edit/Delete** - Full control over all submissions
- 🚩 **Flagged Videos** - See user-reported issues
- 👥 **Multi-Admin Support** - Add multiple admin users

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Map**: react-simple-maps
- **Video**: react-youtube (YouTube embeds)
- **Deployment**: Vercel

## Setup Instructions

### 1. Database Setup

1. Go to your Supabase project: https://xqgrwqeaqqpjxsdcmcqt.supabase.co
2. Navigate to SQL Editor
3. Run the SQL migration file: `supabase-schema.sql`
4. This will create:
   - `video_submissions` table
   - `video_flags` table
   - `admin_users` table
   - Row Level Security policies
   - Necessary indexes and triggers

### 2. Admin Account Setup

After running the SQL migration:

1. Sign up for an account at your app using: **slmxyz@gmail.com**
2. Verify your email
3. The SQL script automatically grants admin access to this email

To add more admins later, run:
```sql
INSERT INTO admin_users (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'new-admin@example.com';
```

### 3. Environment Variables

Your `.env.local` file is already configured with:
```
NEXT_PUBLIC_SUPABASE_URL=https://xqgrwqeaqqpjxsdcmcqt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-key>
ADMIN_EMAIL=slmxyz@gmail.com
```

**⚠️ Important**: Never commit `.env.local` to Git (it's already in `.gitignore`)

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Build for Production

```bash
npm run build
npm run start
```

## Deployment

The app is already configured for Vercel deployment.

### Deploying to Vercel:

1. Push your code to GitHub
2. Connect your Vercel project to the repository
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_EMAIL`
4. Deploy!

Vercel will automatically deploy on every push to your main branch.

## Usage Guide

### For Regular Users

1. **Browse Content**:
   - Click any country on the map
   - Sidebar shows 5 content categories
   - Click a category to watch a random video
   - Use "Next" button to see more videos

2. **Submit Videos**:
   - Click "Submit Videos" in sidebar
   - Sign up / Log in
   - Select category
   - Paste YouTube URL
   - Submit for review

3. **Report Issues**:
   - While watching a video, click "Report Issue"
   - Select reason (broken, wrong category, inappropriate, other)
   - Your report is sent to admins

### For Admins

1. **Access Admin Panel**:
   - Go to `/admin`
   - Log in with admin credentials

2. **Review Submissions**:
   - Filter by: All, Pending, Approved, Rejected, Flagged
   - Watch videos on YouTube
   - Approve, reject, or mark pending
   - Delete submissions if needed

3. **Handle Flagged Videos**:
   - Click "Flagged" filter
   - See flag count and reasons
   - Take appropriate action

## Content Guidelines

Videos should meet these criteria:
- ✅ 1 million+ views (quality indicator)
- ✅ English subtitles available
- ✅ Culturally authentic
- ✅ Appropriate content
- ❌ No hate speech
- ❌ No violence
- ❌ No misleading content

## Database Schema

### video_submissions
- `id` - UUID primary key
- `country_code` - ISO 3166-1 alpha-3 (e.g., "PSE", "USA")
- `category` - inspiration | music | comedy | cooking | street_voices
- `youtube_url` - Full YouTube URL
- `youtube_video_id` - Extracted video ID
- `title` - Optional title
- `status` - pending | approved | rejected
- `user_id` - References auth.users
- `user_email` - User's email
- `flagged` - Boolean
- `flag_count` - Number of flags
- `flag_reasons` - Array of reasons
- `created_at` - Timestamp
- `updated_at` - Timestamp

**Unique Constraint**: One submission per user per category per country

### video_flags
- `id` - UUID primary key
- `submission_id` - References video_submissions
- `user_id` - References auth.users
- `reason` - broken | wrong_category | inappropriate | other
- `note` - Optional text
- `created_at` - Timestamp

**Unique Constraint**: One flag per user per submission

### admin_users
- `id` - References auth.users
- `email` - Admin email
- `role` - admin | super_admin
- `created_at` - Timestamp

## Performance Optimizations

- **ISR (Incremental Static Regeneration)**: Content cached and revalidated
- **Client-side caching**: Reduced Supabase queries
- **Optimized queries**: Indexes on frequently queried columns
- **Lazy loading**: Videos loaded only when needed

## Troubleshooting

### Build Errors
- Run `npm install --legacy-peer-deps` if peer dependency conflicts
- Clear `.next` folder: `rm -rf .next`
- Check Node.js version (requires 18+)

### Supabase Errors
- Verify RLS policies are enabled
- Check environment variables are correct
- Ensure admin user exists in `admin_users` table

### Map Not Loading
- Check network connectivity
- world-atlas CDN may be slow/blocked
- Consider self-hosting the map JSON file

## Project Structure

```
culturia/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Main landing page with map
│   │   ├── layout.tsx               # Root layout
│   │   ├── globals.css              # Global styles
│   │   ├── admin/
│   │   │   ├── page.tsx            # Admin login
│   │   │   └── dashboard/page.tsx  # Admin dashboard
│   │   └── terms/page.tsx          # Terms of Service
│   ├── components/
│   │   ├── WorldMap.tsx            # Interactive world map
│   │   ├── CountrySidebar.tsx      # Country content sidebar
│   │   ├── VideoPlayer.tsx         # YouTube video player
│   │   ├── AuthModal.tsx           # Login/signup modal
│   │   └── SubmissionForm.tsx      # Video submission form
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # Supabase client (browser)
│   │   │   └── server.ts           # Supabase admin (server)
│   │   ├── countries.ts            # Country data utilities
│   │   └── youtube.ts              # YouTube utilities
│   └── types/
│       └── index.ts                # TypeScript interfaces
├── supabase-schema.sql             # Database schema
├── .env.local                       # Environment variables (gitignored)
└── README.md                        # This file
```

## Support

For issues or questions:
- Check the code comments
- Review Supabase documentation
- Check Next.js 16 documentation
- Contact: slmxyz@gmail.com

---

**Built with ❤️ for cultural discovery**
