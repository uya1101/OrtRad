# Edge Functions 動作確認手順

このドキュメントでは、Supabase Edge Functionsの動作確認方法を説明します。

---

## 概要

| 関数名 | 役割 | 依存関係 |
|--------|------|---------|
| `collect-pubmed` | PubMed APIから論文を収集 | なし |
| `collect-rss` | RSSフィードから記事を収集 | なし |
| `summarize-articles` | 記事の要約・分類（Gemini API） | collect-pubmed, collect-rss |
| `generate-trends` | トレンドキーワードを生成（Gemini API） | summarize-articles |
| `sync-clerk-user` | Clerk Webhookでユーザー同期 | なし |
| `run-daily-pipeline` | 全パイプラインを順に実行 | 全関数 |

---

## 前提条件

- Supabase CLI がインストールされている
- プロジェクトがリンクされている (`supabase link` 済み)
- 環境変数が設定されている

---

## ローカル環境での動作確認

### 1. ローカルSupabaseを起動

```bash
# ローカルSupabaseの起動
npx supabase start
```

### 2. 関数をローカルで実行

**collect-pubmed の実行**

```bash
# ローカルで実行
npx supabase functions serve collect-pubmed --env-file .env.local

# またはcurlで直接呼び出し
curl -X POST http://127.0.0.1:54321/functions/v1/collect-pubmed \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

**collect-rss の実行**

```bash
# ローカルで実行
npx supabase functions serve collect-rss --env-file .env.local

# またはcurlで直接呼び出し
curl -X POST http://127.0.0.1:54321/functions/v1/collect-rss \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

**summarize-articles の実行**

```bash
# 事前に GEMINI_API_KEY を .env.local に追加
# GEMINI_API_KEY=your_gemini_api_key_here

# ローカルで実行
npx supabase functions serve summarize-articles --env-file .env.local

# またはcurlで直接呼び出し
curl -X POST http://127.0.0.1:54321/functions/v1/summarize-articles \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

**generate-trends の実行**

```bash
# ローカルで実行
npx supabase functions serve generate-trends --env-file .env.local

# またはcurlで直接呼び出し
curl -X POST http://127.0.0.1:54321/functions/v1/generate-trends \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

**sync-clerk-user のテスト**

```bash
# 事前に CLERK_WEBHOOK_SECRET を .env.local に追加

# ローカルで実行
npx supabase functions serve sync-clerk-user --env-file .env.local

# Clerk Webhookをシミュレート
curl -X POST http://127.0.0.1:54321/functions/v1/sync-clerk-user \
  -H "Content-Type: application/json" \
  -H "svix-id:test" \
  -H "svix-timestamp:$(date +%s)" \
  -H "svix-signature:v1=test" \
  -d '{
    "type": "user.created",
    "data": {
      "id": "test_user_123",
      "email_addresses": [{"email_address": "test@example.com", "id": "id1"}],
      "first_name": "Test",
      "last_name": "User",
      "created_at": 1234567890,
      "updated_at": 1234567890,
      "public_metadata": {},
      "private_metadata": {},
      "unsafe_metadata": {}
    }
  }'
```

**run-daily-pipeline の実行**

```bash
# 全パイプラインを一括実行
npx supabase functions serve run-daily-pipeline --env-file .env.local

# またはcurlで直接呼び出し
curl -X POST http://127.0.0.1:54321/functions/v1/run-daily-pipeline \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

---

## リモート環境での実行

### 1. 関数をデプロイ

```bash
# 単一関数をデプロイ
npx supabase functions deploy collect-pubmed
npx supabase functions deploy collect-rss
npx supabase functions deploy summarize-articles
npx supabase functions deploy generate-trends
npx supabase functions deploy sync-clerk-user
npx supabase functions deploy run-daily-pipeline

# または全関数を一括デプロイ
npx supabase functions deploy

# 環境変数を指定してデプロイ
npx supabase functions deploy sync-clerk-user --env-file .env.local
```

### 2. リモート関数を実行

**注意:** リモートで実行する場合、認証が必要です。

```bash
# サービスロールキーを取得
SUPABASE_URL="https://ddpuicuindpcxxifzzwp.supabase.co"
SERVICE_KEY="your_service_role_key"

# collect-pubmed の実行
curl -X POST "$SUPABASE_URL/functions/v1/collect-pubmed" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json"

# collect-rss の実行
curl -X POST "$SUPABASE_URL/functions/v1/collect-rss" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json"

# summarize-articles の実行
curl -X POST "$SUPABASE_URL/functions/v1/summarize-articles" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json"

# generate-trends の実行
curl -X POST "$SUPABASE_URL/functions/v1/generate-trends" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json"

# run-daily-pipeline の実行
curl -X POST "$SUPABASE_URL/functions/v1/run-daily-pipeline" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json"
```

---

## 動作確認チェックリスト

### collect-pubmed

- [ ] 関数が正常に実行される
- [ ] PubMed APIから記事が取得される
- [ ] `articles` テーブルに新しいレコードが挿入される
- [ ] `collection_logs` テーブルにログが記録される
- [ ] 重複する記事がスキップされる

**確認方法:**
```bash
npx supabase db select -c "SELECT COUNT(*) FROM articles WHERE source = 'pubmed';"
npx supabase db select -c "SELECT * FROM collection_logs WHERE source = 'pubmed' ORDER BY started_at DESC LIMIT 1;"
```

### collect-rss

- [ ] 関数が正常に実行される
- [ ] RSSフィードから記事が取得される
- [ ] `articles` テーブルに新しいレコードが挿入される
- [ ] `collection_logs` テーブルにログが記録される
- [ ] 複数のフィード（jaaos, radiology, eur_radiology, rsna）からデータが収集される

**確認方法:**
```bash
npx supabase db select -c "SELECT COUNT(*) FROM articles WHERE source IN ('jaaos', 'radiology', 'eur_radiology', 'rsna');"
npx supabase db select -c "SELECT source, COUNT(*) FROM articles WHERE source IN ('jaaos', 'radiology', 'eur_radiology', 'rsna') GROUP BY source;"
```

### summarize-articles

- [ ] 関数が正常に実行される
- [ ] Gemini APIが正常に呼び出される
- [ ] draft状態の記事が処理される
- [ ] `articles` テーブルが更新される（title_ja, summary_en, summary_ja, categories, tags, is_rt_relevant）
- [ ] status が 'published' に変更される

**確認方法:**
```bash
npx supabase db select -c "SELECT id, title, status, summary_en, summary_ja FROM articles WHERE status = 'published' ORDER BY updated_at DESC LIMIT 5;"
```

### generate-trends

- [ ] 関数が正常に実行される
- [ ] Gemini APIが正常に呼び出される
- [ ] `trend_keywords` テーブルに新しいトレンドが保存される
- [ ] 期間内のキーワードが正しくカウントされる

**確認方法:**
```bash
npx supabase db select -c "SELECT * FROM trend_keywords ORDER BY period_end DESC LIMIT 10;"
```

### sync-clerk-user

- [ ] 関数が正常に実行される
- [ ] Webhook署名が検証される
- [ ] user.created イベントでユーザーが作成される
- [ ] user.updated イベントでユーザーが更新される
- [ ] user.deleted イベントでユーザーが削除される
- [ ] Clerkのメタデータが正しく保存される

**確認方法:**
```bash
# ユーザー登録後に確認
npx supabase db select -c "SELECT * FROM users ORDER BY created_at DESC LIMIT 1;"

# メタデータの確認
npx supabase db select -c "SELECT id, email, first_name, last_name, public_metadata FROM users LIMIT 1;"
```

### run-daily-pipeline

- [ ] すべての関数が順に実行される
- [ ] 各ステップの結果が正しく返される
- [ ] エラーが発生しても次のステップに進む

**確認方法:**
```bash
npx supabase functions logs run-daily-pipeline --tail
```

---

## トラブルシューティング

### エラー: "Authorization failed"

**原因:** サービスロールキーが正しくない

**解決策:**
```bash
# 環境変数を確認
echo $SUPABASE_SERVICE_ROLE_KEY

# Supabase Dashboardでキーを再発行
```

### エラー: "GEMINI_API_KEY not set"

**原因:** Gemini APIキーが設定されていない

**解決策:**
```bash
# .env.local に追加
GEMINI_API_KEY=your_gemini_api_key_here
```

### エラー: "Rate limit exceeded"

**原因:** APIレート制限を超えた

**解決策:**
- 関数内で遅延時間を長くする
- 実行頻度を下げる

### エラー: "Webhook signature verification failed"

**原因:** Clerk Webhook Secretが正しくない

**解決策:**
1. Clerk DashboardでWebhookのSigning Secretを確認
2. `.env.local` の `CLERK_WEBHOOK_SECRET` を更新
3. 関数を再デプロイ

---

## ログの確認

### ローカル環境

```bash
# ローカルSupabaseのログを表示
npx supabase functions logs --tail
```

### リモート環境

```bash
# 特定の関数のログを表示
npx supabase functions logs collect-pubmed --tail
npx supabase functions logs summarize-articles --tail

# 全関数のログを表示
npx supabase functions logs --tail
```

---

## Cronジョブの設定（本番環境）

Supabase DashboardでCronジョブを設定し、定期的に関数を実行できます。

**例: 毎日0時にパイプラインを実行**

1. Supabase Dashboard → Edge Functions に移動
2. 「New Cron Job」をクリック
3. 以下の情報を入力:
   - **Function:** `run-daily-pipeline`
   - **Cron Expression:** `0 0 * * *` （毎日0時）
   - **Payload:** `{}` （または必要なデータ）
4. 「Create」をクリック
