# 環境変数の設定ガイド

このプロジェクトでは、以下の2種類の環境変数ファイルがあります：

| ファイル | 対象 | プレフィックス |
|----------|------|----------|
| `.env.local` | フロントエンド（Vite） | `VITE_` |
| Edge Functions `.env.example` | サーバーサイド（Deno） | プレフィックスなし |

---

## フロントエンド用環境変数（`.env.local`）

### 変数一覧

| 変数名 | 必須 | 取得場所 |
|---------|------|---------|
| `VITE_SUPABASE_URL` | ✅ 必須 | Supabase Dashboard |
| `VITE_SUPABASE_ANON_KEY` | ✅ 必須 | Supabase Dashboard |
| `VITE_CLERK_PUBLISHABLE_KEY` | ✅ 必須 | Clerk Dashboard |
| `GEMINI_API_KEY` | ❌ 不必要 | Edge Functions用 |

### 重要な点

- フロントエンド（Vite）では、環境変数は必ず `VITE_` プレフィックスで始める必要があります
- `GEMINI_API_KEY` は**Edge Functionsのみ**で使用されます（`summarize-articles`, `generate-trends`）
- フロントエンド側でGemini APIを直接呼び出す場合は `VITE_GEMINI_API_KEY` を追加する必要がありますが、現在のアーキテクチャでは不要です

---

## Edge Functions用環境変数

### 変数一覧

| 変数名 | 対象関数 | 必須 |
|---------|----------|------|
| `SUPABASE_URL` | 全関数 | ✅ 必須 |
| `SUPABASE_SERVICE_ROLE_KEY` | 全関数 | ✅ 必須 |
| `CLERK_WEBHOOK_SECRET` | `sync-clerk-user` | ✅ 必須 |
| `GEMINI_API_KEY` | `summarize-articles`, `generate-trends` | ✅ 必須 |

### 各関数の環境変数ファイル

| 関数 | `.env.example` の場所 |
|--------|----------------------|
| `collect-pubmed` | `supabase/functions/collect-pubmed/.env.example` |
| `collect-rss` | `supabase/functions/collect-rss/.env.example` |
| `summarize-articles` | `supabase/functions/summarize-articles/.env.example` |
| `generate-trends` | `supabase/functions/generate-trends/.env.example` |
| `run-daily-pipeline` | `supabase/functions/run-daily-pipeline/.env.example` |
| `sync-clerk-user` | `supabase/functions/sync-clerk-user/.env.example` |
| `sync-existing-users` | `supabase/functions/sync-existing-users/.env.example` |

---

## 設定方法

### ローカル開発環境

#### フロントエンド

1. `.env.local` に各キーの値を入力
2. `npm run dev` で起動

#### Edge Functions（ローカル）

**方法A: プロジェクトルートの `.env.local` を使用**

```bash
# .env.local を指定して起動
npx supabase start

# または関数ごとに環境変数ファイルを指定
npx supabase functions serve collect-pubmed --env-file .env.local
```

**方法B: 各関数ディレクトリの `.env` ファイルを作成**

各関数ディレクトリ（例: `supabase/functions/collect-pubmed/`）に `.env` ファイルを作成：

```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=AIzaSyC83ahRlsC9XR1N8HFzv0t1ZEji56w6N4Y
```

#### Edge Functions（リモート）

**方法A: Supabase Dashboard で設定**

1. Supabase Dashboard → Edge Functions に移動
2. 関数を選択 → 「Environment Variables」
3. 以下の変数を追加:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CLERK_WEBHOOK_SECRET` （sync-clerk-user用）
   - `GEMINI_API_KEY` （summarize-articles, generate-trends用）

**方法B: CLIでデプロイ時に指定**

```bash
# 環境変数を含めてデプロイ
npx supabase functions deploy summarize-articles --no-verify-jwt

# 注意: 環境変数はDashboardで設定することを推奨
```

---

## キーの取得場所

| キー | 取得場所 | 使用箇所 |
|------|---------|----------|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Project Settings → API | フロントエンド |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API | フロントエンド |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API | Edge Functions |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys → Publishable | フロントエンド |
| `CLERK_WEBHOOK_SECRET` | Clerk Dashboard → Webhooks → Signing Secret | Edge Functions |
| `GEMINI_API_KEY` | [Google AI Studio](https://makersuite.google.com/app/apikey) | Edge Functions |

---

## トラブルシューティング

### Q: Edge Functionsで環境変数が読み取れない

**A:** 以下を確認してください:

1. 変数名にプレフィックスをつけていない（Edge Functionsはプレフィックス不要）
2. `.env` ファイルが正しいディレクトリにある
3. デプロイ時に環境変数が設定されている

### Q: フロントエンドで環境変数が `undefined` になる

**A:** 以下を確認してください:

1. 変数名に `VITE_` プレフィックスがついている
2. `.env.local` がプロジェクトルートにある
3. 開発サーバーを再起動する（`npm run dev`）

### Q: `GEMINI_API_KEY` はどこで使用されていますか？

**A:** Edge Functions内でのみ使用されます：

- `summarize-articles`: Gemini APIで記事を要約
- `generate-trends`: Gemini APIでトレンドを生成

フロントエンド（ブラウザ）からGemini APIを直接呼び出す設計ではありません。セキュリティの観点からも、APIキーをフロントエンドに暴露しない方が安全です。

---

## チェックリスト

### 開発環境

- [ ] `.env.local` に全ての必須キーが設定されている
- [ ] Edge Functions用の `.env` ファイルが設定されている
- [ ] `npm run dev` でアプリが起動できる
- [ ] `npx supabase start` でローカルSupabaseが起動できる

### 本番環境

- [ ] Supabase Dashboardに環境変数が設定されている
- [ ] Edge Functionsがデプロイされている
- [ ] Clerk Webhookが設定されている
- [ ] 全ての関数が正常に実行できる

---

## 参照

- [環境変数設定ガイド](./ENV_VARIABLES_GUIDE.md) （このドキュメント）
- [デプロイタスクリスト](./DEPLOYMENT_TODO.md)
- [RLSテストガイド](./RLS_TESTING_GUIDE.md)
- [マイグレーションガイド](./MIGRATION_GUIDE.md)
- [Edge Functionsガイド](./EDGE_FUNCTIONS_GUIDE.md)
