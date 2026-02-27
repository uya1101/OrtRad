# Supabase Database Setup Guide

This guide walks you through setting up the OrtRad database on Supabase.

## Prerequisites

- A Supabase account ([https://supabase.com](https://supabase.com))
- A created Supabase project

## Setup Steps

### 1. Access SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query** to create a new query tab

### 2. Run Migration (001_initial_schema.sql)

1. Open `supabase/migrations/001_initial_schema.sql` in your editor
2. Copy the entire content
3. Paste it into the SQL Editor
4. Click **Run** (or press `Cmd+R` / `Ctrl+R`)

This will create:
- `articles` table with full-text search indexes
- `categories` table
- `trend_keywords` table
- `collection_logs` table
- `admin_settings` table
- Row Level Security (RLS) policies
- Triggers for automatic `updated_at` timestamps

**Expected Output:**
```
Success. No rows returned
```

### 3. Run Seed Data (seed.sql)

1. Open `supabase/seed.sql` in your editor
2. Copy the entire content
3. Create a new query tab in SQL Editor
4. Paste the content
5. Click **Run** (or press `Cmd+R` / `Ctrl+R`)

This will populate:
- 8 initial categories
- 4 admin settings (collection schedule, PubMed keywords, limits, app config)

**Expected Output:**
```
Categories seeded: | 8
Admin settings seeded: | 4
```

### 4. Verify Tables Created

Navigate to **Table Editor** in the left sidebar. You should see:
- `articles`
- `categories`
- `trend_keywords`
- `collection_logs`
- `admin_settings`

### 5. Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Gemini API Configuration (for AI summaries)
VITE_GEMINI_API_KEY=your-gemini-api-key-here
```

You can find these values in your Supabase project:
- Go to **Project Settings** → **API**
- Copy the **Project URL** as `VITE_SUPABASE_URL`
- Copy the **anon public** key as `VITE_SUPABASE_ANON_KEY`

### 6. Test Connection

Run the development server:

```bash
npm run dev
```

The app should now be able to connect to your Supabase database.

## Database Schema Overview

### articles
Stores orthopedic radiology articles collected from PubMed and other sources.

**Key Features:**
- Full-text search index for English content
- GIN indexes for array fields (categories, tags)
- Row Level Security (public users can only see published articles)
- Status workflow: draft → published → archived

### categories
Article categories with bilingual support (English/Japanese).

### trend_keywords
Trending keywords for analytics and recommendations.

### collection_logs
Logs for automated data collection jobs (via Edge Functions).

### admin_settings
Application configuration stored as JSONB for flexibility.

## Row Level Security (RLS)

The database uses Row Level Security with the following policies:

**Public Access:**
- Can read `published` articles only
- Can read all categories
- Can read all trend keywords

**Service Role (Edge Functions):**
- Full access to all tables (CRUD operations)
- Used by backend services for data collection and management

## UTF-8 Support

The database uses UTF-8 encoding to support Japanese text content (abstracts, summaries, etc.).

## Performance Optimization

Indexes are created for:
- Source and status filtering
- Date-based sorting (published_at)
- Array searches (categories, tags) via GIN indexes
- Full-text search via `to_tsvector`

## Troubleshooting

### Migration Fails

If you encounter errors during migration:

1. Check the error message in the SQL Editor
2. Ensure you're running each SQL file in a fresh query tab
3. Verify you have the correct Supabase project selected

### Seed Data Not Appearing

1. Verify the migration ran successfully first
2. Run `SELECT * FROM categories;` to check if data exists
3. If data exists but not appearing in Table Editor, try refreshing the page

### Permission Errors

If you see permission errors in your application:

1. Verify RLS policies are enabled: `SELECT * FROM pg_policies WHERE tablename = 'articles';`
2. Check the service role key is configured correctly for backend operations
3. Ensure environment variables are set correctly

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Full Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
