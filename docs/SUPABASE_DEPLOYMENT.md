# Supabase 本番環境デプロイ手順

このドキュメントは、OrtRadプロジェクトのSupabase本番環境をセットアップする手順を説明しています。

## 前提条件

- Supabaseアカウントの作成
- Supabase CLIのインストール: `npm install -g supabase`
- Supabaseプロジェクトの作成

## 1. Edge Functionsのデプロイ

### Supabase CLIを使用したデプロイ

まず、Supabaseプロジェクトにログインします:

```bash
supabase login
```

プロジェクトにリンクします:

```bash
supabase link --project-ref <your-project-ref>
```

各Edge Functionをデプロイします:

```bash
# PubMed収集機能
supabase functions deploy collect-pubmed

# RSS収集機能
supabase functions deploy collect-rss

# 記事の要約機能
supabase functions deploy summarize-articles

# トレンド生成機能
supabase functions deploy generate-trends

# デイリーパイプライン実行機能
supabase functions deploy run-daily-pipeline
```

## 2. 環境変数（シークレット）の設定

### シークレットの設定

各関数に必要なシークレットを設定します:

```bash
# Gemini API Key (AI要約用)
supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here

# 管理者パスワード（簡易認証用）
supabase secrets set ADMIN_PASSWORD=your_admin_password_here
```

### 重要: シークレット管理

- **絶対に**シークレットをコードリポジトリにコミットしないでください
- `.env.local` ファイルは `.gitignore` に含まれています
- Supabase Dashboardでシークレットを確認・管理できます

## 3. Cron ジョブの設定

### pg_cron 拡張機能の有効化

Supabase SQL Editorで以下を実行:

```sql
-- pg_cron 拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

### Cronジョブの作成

以下のSQLを実行して、毎日日本時間0:00にパイプラインを実行するジョブを作成します:

```sql
-- デイリーパイプライン実行ジョブ（毎日0:00 JST）
SELECT cron.schedule(
  'daily-pipeline',
  '0 0 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://<your-project-ref>.supabase.co/functions/v1/run-daily-pipeline',
      headers := jsonb_build_object(
        'Authorization', 'Bearer <your-anon-key>',
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    );
  $$
);
```

### Cronジョブの管理

```sql
-- すべてのcronジョブを表示
SELECT * FROM cron.job;

-- 特定のcronジョブを削除
SELECT cron.unschedule('daily-pipeline');

-- cronジョブを更新（既存のジョブを削除して再作成）
SELECT cron.unschedule('daily-pipeline');
-- 次に上記のCREATE文を再実行
```

## 4. データベースマイグレーション

マイグレーションを実行してデータベース構造を適用します:

```bash
supabase db push
```

または、Supabase DashboardからSQL Editorで以下のマイグレーションを実行:

### 1. articlesテーブル
```sql
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_ja TEXT,
  summary TEXT,
  summary_ja TEXT,
  content TEXT,
  source TEXT NOT NULL,
  source_url TEXT UNIQUE,
  published_at TIMESTAMP WITH TIME ZONE,
  categories TEXT[],
  tags TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  trend_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_trend_score ON articles(trend_score DESC);
```

### 2. collection_logsテーブル
```sql
CREATE TABLE IF NOT EXISTS collection_logs (
  id SERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  fetched_count INTEGER DEFAULT 0,
  new_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collection_logs_source ON collection_logs(source);
CREATE INDEX IF NOT EXISTS idx_collection_logs_status ON collection_logs(status);
CREATE INDEX IF NOT EXISTS idx_collection_logs_created_at ON collection_logs(created_at DESC);
```

### 3. rss_sourcesテーブル
```sql
CREATE TABLE IF NOT EXISTS rss_sources (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  source_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. admin_settingsテーブル
```sql
CREATE TABLE IF NOT EXISTS admin_settings (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 初期設定値の挿入
INSERT INTO admin_settings (key, value) VALUES
  ('collection_limit', '100'),
  ('schedule_time', '"00:00"'),
  ('gemini_temperature', '0.7'),
  ('pubmed_keywords', '["orthopedic surgery", "radiology", "medical imaging"]')
ON CONFLICT (key) DO NOTHING;
```

### 5. RLS (Row Level Security) ポリシー

```sql
-- RLSを有効化
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- 読み取りは誰でも可能
CREATE POLICY "Anyone can read articles" ON articles
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read collection_logs" ON collection_logs
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read rss_sources" ON rss_sources
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read admin_settings" ON admin_settings
  FOR SELECT USING (true);

-- 書き込みは認証済みユーザーのみ
CREATE POLICY "Authenticated users can insert articles" ON articles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update articles" ON articles
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert collection_logs" ON collection_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update collection_logs" ON collection_logs
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert rss_sources" ON rss_sources
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update rss_sources" ON rss_sources
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert admin_settings" ON admin_settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update admin_settings" ON admin_settings
  FOR UPDATE USING (auth.role() = 'authenticated');
```

## 5. バックアップ設定

### プロプランでの自動バックアップ

Supabase Proプラン（$25/月）を利用すると、以下のバックアップ機能が利用できます:
- 自動デイリーバックアップ
- ポイントインタイムリカバリ（最大30日間）
- 物理バックアップのダウンロード

### 無料プランでの手動バックアップ

無料プランの場合、以下の方法で手動バックアップを取得できます:

```bash
# 全データベースのダンプ
pg_dump "postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres" > backup.sql
```

または、Supabase Dashboardから:
1. プロジェクト設定 → データベース → バックアップ
2. 「バックアップをダウンロード」を選択

## 6. モニタリングとログ

### Edge Functionsのログを確認

```bash
# 特定の関数のログを確認
supabase functions logs collect-pubmed
supabase functions logs collect-rss
supabase functions logs summarize-articles
supabase functions logs generate-trends
supabase functions logs run-daily-pipeline

# 最新のログをリアルタイムで確認
supabase functions logs --follow
```

### Supabase Dashboardでの監視

- **Realtime**: データベースの変更をリアルタイムで監視
- **Logs**: APIリクエストとエラーログを確認
- **Performance**: データベースのクエリパフォーマンスを分析
- **Database Stats**: ストレージ使用量、接続数などを確認

## 7. 本番環境URLの設定

フロントエンドのVercel環境変数を更新:

```bash
# Vercelプロジェクト設定
VITE_APP_URL=https://ortrad.com
```

CORS設定を更新（Supabase Dashboard → API → CORS）:

```
Allowed origins: https://ortrad.com
Allowed methods: GET, POST, PUT, DELETE
Allowed headers: Authorization, Content-Type, apikey
```

## 8. トラブルシューティング

### Edge Functionsがデプロイされない場合

```bash
# Supabaseのステータスを確認
supabase status

# プロジェクトとの接続を確認
supabase link --project-ref <your-project-ref>

-- プロジェクト参照を確認
supabase projects list
```

### Cronジョブが実行されない場合

```sql
-- pg_cron拡張機能が有効か確認
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- ジョブが登録されているか確認
SELECT * FROM cron.job;

-- 実行ログを確認（必要に応じてlogテーブルを作成）
```

### データベース接続エラーの場合

1. Supabase DashboardでAPI URLとanon keyを確認
2. ネットワーク設定とファイアウォールを確認
3. 接続制限（Max Connections）を確認

## 9. セキュリティチェックリスト

- [ ] `.env.local` が `.gitignore` に含まれている
- [ ] シークレットキーがコードにハードコードされていない
- [ ] RLSポリシーが適切に設定されている
- [ ] CORSが `ortrad.com` のみ許可されている
- [ ] サービスロールキーがフロントエンドで使用されていない
- [ ] APIレート制限が設定されている（Supabase Proプラン）

## 10. デプロイ後の初期セットアップ

1. **初期データの挿入**:
   ```sql
   -- RSSソースの初期データ
   INSERT INTO rss_sources (name, url, source_type) VALUES
     ('Radiology RSNA', 'https://pubs.rsna.org/rss/curr', 'rss'),
     ('Orthopedic News', 'https://orthopedicnews.com/feed/', 'rss')
   ON CONFLICT (url) DO NOTHING;
   ```

2. **手動でパイプラインを実行**:
   ```bash
   supabase functions invoke run-daily-pipeline
   ```

3. **結果を確認**:
   - 記事が `articles` テーブルに保存されている
   - `collection_logs` テーブルに成功ログがある

---

このドキュメントはOrtRadプロジェクトの本番環境デプロイを支援するものです。不明点がある場合は、Supabase公式ドキュメントを参照してください。
