# Supabase Edge Functions - Data Collection Pipeline

This document describes the OrtRad data collection pipeline implemented as Supabase Edge Functions using Deno runtime.

## Architecture

```
Daily Pipeline (Cron Trigger)
    ↓
run-daily-pipeline
    ├── collect-pubmed (PubMed E-utilities API)
    └── collect-rss (RSS/Atom Feeds)
        ↓
    Articles stored in Supabase (status='draft')
```

## Functions

### 1. collect-pubmed

Fetches orthopedic radiology articles from PubMed E-utilities API.

**Features:**
- Reads search keywords from `admin_settings` table
- Searches PubMed for articles from the last 7 days
- Fetches article details in batches (10 per batch)
- Implements rate limiting (400ms delay between batches)
- Deduplicates articles by PMID
- Stores articles with `status='draft'`

**Rate Limiting:**
- PubMed API limit: 3 requests per second
- Implementation: 400ms delay between batches

**Environment Variables:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for full database access

### 2. collect-rss

Fetches articles from RSS/Atom feeds.

**Supported Feeds:**
- JAAOS (Journal of the American Academy of Orthopaedic Surgeons)
- Radiology (RSNA)
- European Radiology
- RSNA News

**Features:**
- Processes both RSS 2.0 and Atom formats
- Generates `source_id` from URL hash or GUID
- Timeout per feed: 10 seconds
- Continues processing even if one feed fails
- Logs results for each feed individually

**Environment Variables:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for full database access

### 3. run-daily-pipeline

Orchestrates the daily data collection pipeline.

**Pipeline Steps:**
1. Call `collect-pubmed`
2. Call `collect-rss`
3. (Future) `summarize-articles` - to be implemented in Phase 3
4. (Future) `generate-trends` - to be implemented in Phase 3

**Features:**
- Sequential execution of pipeline steps
- Continues to next step even if current step fails
- Aggregates results from all steps
- Returns detailed summary with duration

**Environment Variables:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for function authorization

## Deployment Steps

### 1. Install Supabase CLI

```bash
npm install -g supabase
# or
yarn global add supabase
# or
brew install supabase/tap/supabase
```

### 2. Link to Your Project

```bash
cd /Users/uya/Desktop/OrtRad
supabase link --project-ref YOUR_PROJECT_REF
```

### 3. Deploy Functions

```bash
# Deploy all functions
supabase functions deploy --no-verify-jwt

# Deploy specific function
supabase functions deploy collect-pubmed --no-verify-jwt
supabase functions deploy collect-rss --no-verify-jwt
supabase functions deploy run-daily-pipeline --no-verify-jwt
```

### 4. Set Environment Variables

For each function, set the required environment variables:

```bash
# For collect-pubmed
supabase secrets set --env-file ./supabase/functions/collect-pubmed/.env.example

# For collect-rss
supabase secrets set --env-file ./supabase/functions/collect-rss/.env.example

# For run-daily-pipeline
supabase secrets set --env-file ./supabase/functions/run-daily-pipeline/.env.example
```

Or set them individually:

```bash
supabase secrets set SUPABASE_URL=https://your-project-ref.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 5. Set Up Cron Job

Run the following SQL in Supabase SQL Editor:

```sql
SELECT cron.schedule(
  'daily-collection',
  '0 18 * * *',  -- Every day at 18:00 UTC = 3:00 JST
  $$
  SELECT net.http_post(
    url := 'https://your-project-ref.supabase.co/functions/v1/run-daily-pipeline',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
```

**Note:** You need to store your service role key as a database setting for the cron job to use it:

```sql
-- First, store the service role key securely
-- This should be done manually and the key should be kept secret
INSERT INTO admin_settings (key, value) VALUES
  ('service_role_key', '{"key": "YOUR_SERVICE_ROLE_KEY_HERE"}');
```

Alternatively, you can use Supabase Dashboard to set up the cron job:

1. Go to **Edge Functions** → **Cron Jobs**
2. Click **New Cron Job**
3. Configure:
   - **Name**: `daily-collection`
   - **Schedule**: `0 18 * * *` (3:00 JST)
   - **Function**: `run-daily-pipeline`
   - **HTTP Method**: `POST`
   - **Payload**: `{}`

## Manual Testing

### Test Individual Functions

```bash
# Test collect-pubmed
curl -X POST https://your-project-ref.supabase.co/functions/v1/collect-pubmed \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'

# Test collect-rss
curl -X POST https://your-project-ref.supabase.co/functions/v1/collect-rss \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'

# Test run-daily-pipeline
curl -X POST https://your-project-ref.supabase.co/functions/v1/run-daily-pipeline \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Test Locally

```bash
# Start Supabase local development environment
supabase start

# Run function locally
supabase functions serve collect-pubmed --env-file ./supabase/functions/collect-pubmed/.env.example
```

## Database Schema Requirements

Ensure the following tables exist in your Supabase database:

- `articles` - Stores collected articles
- `categories` - Article categories
- `trend_keywords` - Trending keywords
- `collection_logs` - Logs for data collection jobs
- `admin_settings` - Application settings

Run the migration file if not already done:
```bash
supabase db push
```

## Configuration

### PubMed Search Keywords

Default keywords are used if not configured:

```typescript
['orthopedic surgery', 'musculoskeletal imaging', 'orthopedic radiology',
 'fracture classification', 'fracture management', 'bone density',
 'osteoporosis imaging', 'artificial intelligence orthopedic',
 'deep learning radiology']
```

To customize, update the `pubmed_keywords` setting in the `admin_settings` table:

```sql
UPDATE admin_settings
SET value = '{"queries": ["your", "custom", "keywords"]}'::jsonb
WHERE key = 'pubmed_keywords';
```

### RSS Feed Configuration

Feeds are configured in `_shared/constants.ts`. To add or modify feeds, update the `RSS_FEEDS` array and redeploy the functions.

## Monitoring

### View Collection Logs

```sql
SELECT *
FROM collection_logs
ORDER BY started_at DESC
LIMIT 20;
```

### View Collected Articles

```sql
SELECT source, COUNT(*) as count, status
FROM articles
GROUP BY source, status
ORDER BY count DESC;
```

### View Recent Articles

```sql
SELECT title, source, published_at, status
FROM articles
WHERE published_at IS NOT NULL
ORDER BY published_at DESC
LIMIT 20;
```

## Error Handling

All functions include comprehensive error handling:

- **Timeout**: RSS feeds have 10-second timeout per feed
- **Rate Limiting**: PubMed API includes 400ms delays
- **Authorization**: All functions require service role key
- **Logging**: All errors are logged to `collection_logs` table
- **Graceful Degradation**: Pipeline continues even if individual steps fail

## Security

- Service role key is required for all function calls
- Cron jobs use service role authentication
- No public access without authorization
- Input validation on all endpoints

## Future Enhancements (Phase 3)

- `summarize-articles` - AI-powered article summarization using Gemini API
- `generate-trends` - Trend keyword analysis from collected articles
- Email notifications on collection completion
- Retry logic for failed collections
