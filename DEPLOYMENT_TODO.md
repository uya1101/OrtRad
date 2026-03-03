# デプロイ・設定タスクリスト

このドキュメントでは、本番環境または開発環境でのセットアップに必要な手順をまとめます。

---

## 優先順位

### 🔴 優先度: 高（必須）

1. **環境変数の設定**
2. **Supabaseマイグレーションの適用**
3. **Clerk Webhookの設定**
4. **既存ユーザーの同期**

### 🟡 優先度: 中（推奨）

5. **Edge Functionsのデプロイ**
6. **Gemini APIキーの取得と設定**
7. **RLSポリシーのテスト**
8. **Clerk JWTトークンとSupabaseの連携実装**

### 🟢 優先度: 低（オプション）

9. **ビルド最適化（コード分割）**
10. **監視とログ設定**

---

## 各タスクの詳細手順

### タスク1: 環境変数の設定

#### 手順

1. `.env.local` または `.env.local.example` に必要な変数を追加
2. 各キーの値を取得して設定

#### 必要な変数

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://ddpuicuindpcxxifzzwp.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Clerk Authentication Configuration
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Clerk Webhook Secret
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key
```

#### キーの取得場所

| キー | 取得場所 |
|------|---------|
| `VITE_SUPABASE_URL` | Supabase Dashboard > Project Settings > API |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard > Project Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard > Project Settings > API |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard > API Keys > Publishable |
| `CLERK_WEBHOOK_SECRET` | Clerk Dashboard > Webhooks > Select webhook > Signing Secret |
| `GEMINI_API_KEY` | [Google AI Studio](https://makersuite.google.com/app/apikey) |

---

### タスク2: Supabaseマイグレーションの適用

#### 手順

1. プロジェクトをリンク（まだの場合）

```bash
npx supabase link --project-ref ddpuicuindpcxxifzzwp
```

2. バックアップの作成（推奨）

```bash
# Supabase Dashboard > Database > Backups からバックアップを作成
```

3. マイグレーションのドライラン

```bash
npx supabase db push --dry-run
```

4. マイグレーションの反映

```bash
npx supabase db push
```

5. 適用の確認

```bash
# usersテーブルが作成されたか確認
npx supabase db select -c "SELECT * FROM users LIMIT 1;"

# RLSポリシーを確認
npx supabase db select -c "
SELECT * FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users';
"
```

#### ドキュメント

詳細は `MIGRATION_GUIDE.md` を参照してください。

---

### タスク3: Clerk Webhookの設定

#### 手順

1. [Clerk Dashboard](https://dashboard.clerk.com/) にログイン
2. 「Webhooks」→「Add Endpoint」を選択
3. 以下の情報を入力:

   - **Endpoint URL:**
     ```
     https://ddpuicuindpcxxifzzwp.supabase.co/functions/v1/sync-clerk-user
     ```
   - **Events:** `user.created`, `user.updated`, `user.deleted`
   - **Description:** `Sync user data with Supabase`

4. Webhookを作成
5. 「Signing Secret」をコピー
6. `.env.local` の `CLERK_WEBHOOK_SECRET` に貼り付け

#### テスト

Webhookをテストするには：

1. Clerk DashboardのWebhookページで「Resend」を選択
2. テストイベントを選択（例: `user.created`）
3. 「Send」をクリック
4. Supabaseの `users` テーブルでデータが作成されたか確認

---

### タスク4: 既存ユーザーの同期

#### 手順

1. Clerk Secret Key を取得

   - Clerk Dashboard > API Keys > Secret Key をコピー

2. 同期スクリプトを実行

```bash
# ローカルで実行
npx supabase functions serve sync-existing-users --env-file .env.local

# またはcurlで直接呼び出し
curl -X POST http://127.0.0.1:54321/functions/v1/sync-existing-users \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "clerkApiKey": "your_clerk_secret_key",
    "limit": 100
  }'
```

3. 結果を確認

```bash
# 同期されたユーザー数を確認
npx supabase db select -c "SELECT COUNT(*) FROM users;"
```

#### 注意

- 本番環境で実行する場合、関数をデプロイする必要があります
- 大規模なユーザー数の場合、`limit` を調整してください

---

### タスク5: Edge Functionsのデプロイ

#### 手順

```bash
# 全関数をデプロイ
npx supabase functions deploy

# または個別にデプロイ
npx supabase functions deploy sync-clerk-user
npx supabase functions deploy sync-existing-users
npx supabase functions deploy collect-pubmed
npx supabase functions deploy collect-rss
npx supabase functions deploy summarize-articles
npx supabase functions deploy generate-trends
npx supabase functions deploy run-daily-pipeline
```

#### ドキュメント

詳細は `EDGE_FUNCTIONS_GUIDE.md` を参照してください。

---

### タスク6: Gemini APIキーの取得と設定

#### 手順

1. [Google AI Studio](https://makersuite.google.com/app/apikey) にアクセス
2. プロジェクトを作成（まだの場合）
3. 「Create API Key」をクリック
4. APIキーをコピー
5. `.env.local` の `GEMINI_API_KEY` に貼り付け

#### テスト

```bash
# 環境変数が設定されているか確認
echo $GEMINI_API_KEY

# summarize-articles関数をテスト
curl -X POST "$SUPABASE_URL/functions/v1/summarize-articles" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

---

### タスク7: RLSポリシーのテスト

#### 手順

1. [RLSテストガイド](./RLS_TESTING_GUIDE.md) に従って各テストを実行
2. すべてのテストが成功することを確認

#### 主要テスト

- ✅ ユーザーは自分のデータを読み取れる
- ✅ ユーザーは他ユーザーのデータを読み取れない
- ✅ 認証済みユーザーはpublished記事を読み取れる
- ✅ 認証済みユーザーはdraft記事を読み取れない
- ✅ Service Roleは全データにアクセスできる

---

### タスク8: Clerk JWTトークンとSupabaseの連携実装

#### 背景

現在、ClerkとSupabaseは完全に分離しています。RLSポリシーを正しく動作させるには、ClerkのJWTトークンをSupabaseに渡す必要があります。

#### オプションA: SupabaseクライアントでJWTを設定

**実装方法:**

```typescript
// AuthContext.tsx または適切な場所に追加
import { useEffect } from 'react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId, session, getToken } = useClerkAuth();

  useEffect(() => {
    async function syncClerkTokenToSupabase() {
      if (userId && session) {
        try {
          const token = await getToken();
          if (token) {
            await supabase.auth.setSession({
              access_token: token,
              refresh_token: token,
            });
            console.log('Clerk token synced to Supabase');
          }
        } catch (error) {
          console.error('Failed to sync Clerk token:', error);
        }
      }
    }

    syncClerkTokenToSupabase();
  }, [userId, session, getToken]);

  // ... 既存のコード
}
```

#### オプションB: Supabase Custom JWT認証（推奨）

**実装方法:**

1. ClerkのJWTをSupabaseのCustom JWTとして設定
2. Supabase Dashboard > Authentication > Providers で「Custom JWT」を追加
3. ClerkのJWT issuer URLとJWKS endpointを設定

---

### タスク9: ビルド最適化（コード分割）

#### 背景

現在のビルドで、メインチャンクが 814.8 kB で 500 kB を超えています。これは初期ロード時間に影響を与える可能性があります。

#### 対策

**1. React.lazy() で動的インポート**

```typescript
// App.tsx または routes の定義ファイルに追加
import { lazy, Suspense } from 'react';

const HomePage = lazy(() => import('./pages/HomePage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminArticles = lazy(() => import('./pages/admin/AdminArticles'));
// ... その他のページ

// 使用時
<Route path="/" element={
  <Suspense fallback={<LoadingSpinner />}>
    <HomePage />
  </Suspense>
} />
```

**2. vite.config.ts の設定**

```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', '@clerk/clerk-react', '@supabase/supabase-js'],
          'clerk': ['@clerk/clerk-react'],
        },
      },
      chunkSizeWarningLimit: 1000, // 警告を緩和
    },
  },
  // ... 既存の設定
});
```

**3. ルート分割**

```typescript
// 機能ごとにルートを分割
// 例: admin ルートを別チャンクに
```

---

### タスク10: 監視とログ設定

#### 手順

1. Supabase Dashboardでログ設定を確認
2. Edge Functionsのログを有効にする
3. エラーアラートを設定（推奨）

#### ログ確認

```bash
# 全関数のログを表示
npx supabase functions logs --tail

# 特定の関数のログを表示
npx supabase functions logs sync-clerk-user --tail
```

---

## クイックスタート

**最小限の設定で動かす場合は:**

```bash
# 1. 環境変数を設定
cp .env.local.example .env.local
# エディタで必要なキーを入力

# 2. ローカルSupabaseを起動
npx supabase start

# 3. マイグレーションを適用
npx supabase db reset

# 4. アプリケーションを起動
npm run dev

# 5. Clerkでユーザー登録
# http://localhost:5173 にアクセスしてユーザー登録
```

---

## チェックリスト

### 本番環境へデプロイする前に確認

- [ ] 全環境変数が設定されている
- [ ] マイグレーションが適用されている
- [ ] Clerk Webhookが設定されている
- [ ] Edge Functionsがデプロイされている
- [ ] RLSポリシーがテスト済み
- [ ] 既存ユーザーが同期されている（必要な場合）
- [ ] Gemini APIキーが設定されている
- [ ] バックアップが作成されている

### 機能テスト

- [ ] ユーザー登録が正常に動作する
- [ ] ログインが正常に動作する
- [ ] ユーザー情報がSupabaseに同期される
- [ ] 記事の閲覧が正常に動作する
- [ ] 管理者ページにアクセスできる
- [ ] Edge Functionsが正常に実行される

---

## サポート

問題が発生した場合:

1. **Supabaseドキュメント:** https://supabase.com/docs
2. **Clerkドキュメント:** https://clerk.com/docs
3. **Edge Functionsログ:** `npx supabase functions logs --tail`
4. **RLSテストガイド:** `RLS_TESTING_GUIDE.md`
5. **マイグレーションガイド:** `MIGRATION_GUIDE.md`
6. **Edge Functionsガイド:** `EDGE_FUNCTIONS_GUIDE.md`
