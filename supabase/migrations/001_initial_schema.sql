-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for text search improvements (optional but recommended)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- articles table
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  title_ja TEXT,
  authors TEXT[] DEFAULT '{}',
  journal TEXT,
  source TEXT NOT NULL CHECK (source IN ('pubmed', 'jaaos', 'radiology', 'eur_radiology', 'rsna')),
  source_id TEXT UNIQUE NOT NULL,
  source_url TEXT,
  published_at TIMESTAMPTZ,
  abstract TEXT,
  summary_en TEXT,
  summary_ja TEXT,
  categories TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_rt_relevant BOOLEAN DEFAULT false,
  trend_score FLOAT DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for articles
CREATE INDEX idx_articles_source ON articles(source);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_is_rt_relevant ON articles(is_rt_relevant);
CREATE INDEX idx_articles_categories ON articles USING GIN(categories);
CREATE INDEX idx_articles_tags ON articles USING GIN(tags);

-- Full text search index for articles
CREATE INDEX idx_articles_fts ON articles
  USING GIN(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(abstract, '') || ' ' || COALESCE(summary_en, '')));

-- categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_ja TEXT NOT NULL,
  icon TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for categories
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);

-- trend_keywords table
CREATE TABLE trend_keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword_en TEXT NOT NULL,
  keyword_ja TEXT,
  count INT DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for trend_keywords
CREATE INDEX idx_trend_keywords_period ON trend_keywords(period_start, period_end);
CREATE INDEX idx_trend_keywords_count ON trend_keywords(count DESC);

-- collection_logs table
CREATE TABLE collection_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL,
  status TEXT DEFAULT 'running' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  articles_found INT DEFAULT 0,
  articles_new INT DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Index for collection_logs
CREATE INDEX idx_collection_logs_started_at ON collection_logs(started_at DESC);
CREATE INDEX idx_collection_logs_status ON collection_logs(status);

-- admin_settings table
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for admin_settings
CREATE INDEX idx_admin_settings_key ON admin_settings(key);

-- updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Public read policies (published articles only)
CREATE POLICY "Public can read published articles"
  ON articles FOR SELECT
  USING (status = 'published');

CREATE POLICY "Public can read categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Public can read trends"
  ON trend_keywords FOR SELECT
  USING (true);

-- Service role can do everything (for Edge Functions)
-- These policies are applied when using service_role key
CREATE POLICY "Service role can manage articles"
  ON articles FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can manage categories"
  ON categories FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can manage trends"
  ON trend_keywords FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can manage collection logs"
  ON collection_logs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can manage admin settings"
  ON admin_settings FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Comment for documentation
COMMENT ON TABLE articles IS 'Stores orthopedic radiology articles collected from various sources';
COMMENT ON TABLE categories IS 'Article categories for organizing content';
COMMENT ON TABLE trend_keywords IS 'Trending keywords for analytics';
COMMENT ON TABLE collection_logs IS 'Logs for data collection jobs';
COMMENT ON TABLE admin_settings IS 'Application settings stored as JSONB';
