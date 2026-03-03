# RLS（Row Level Security）ポリシーテストガイド

このドキュメントでは、SupabaseのRow Level Securityポリシーが正しく動作しているかを確認する手順を説明します。

---

## 前提条件

- Supabase CLI がインストールされている
- プロジェクトがリンクされている (`supabase link` 済み)
- マイグレーション `002_create_users_table.sql` が適用されている
- Clerkでテストユーザーが登録されている

---

## RLSポリシーの概要

### users テーブルのRLSポリシー

```sql
-- ユーザーは自分のプロフィールのみ読み取り可能
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

-- ユーザーは自分のプロフィールのみ更新可能
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- service_role は全操作可能
CREATE POLICY "Service role can manage users"
  ON users FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
```

### articles テーブルのRLSポリシー

```sql
-- 認証済みユーザーはpublishedステータスの記事を読み取り可能
CREATE POLICY "Public can read published articles"
  ON articles FOR SELECT
  USING (status = 'published');

-- service_role は全操作可能
CREATE POLICY "Service role can manage articles"
  ON articles FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
```

---

## テストシナリオ

### テスト1: 認証済みユーザーが自分のデータを読み取れる

**目的:** ユーザーが自分の `users` レコードを読み取れることを確認

**手順:**

1. Clerkでログインする
2. ブラウザのDevToolsを開き、Consoleで以下を実行:

```javascript
// ClerkからJWTトークンを取得
const token = await window.Clerk.session.getToken();

// Supabaseクライアントで認証
const { data, error } = await supabase.auth.setSession({
  access_token: token,
  refresh_token: token, // Clerkはリフレッシュトークンを提供しないため
});

// 自分のユーザーデータを取得
const { data: user, error } = await supabase
  .from('users')
  .select('*')
  .single();

console.log('User data:', user);
console.log('Error:', error);
```

**期待される結果:**
- ✅ 自分のユーザーデータが取得できる
- ✅ エラーがない

---

### テスト2: 認証済みユーザーが他ユーザーのデータを読み取れない

**目的:** ユーザーが他ユーザーの `users` レコードを読み取れないことを確認

**手順:**

1. ClerkでユーザーAとしてログインする
2. ユーザーBのIDを取得（データベースから確認）
3. Consoleで以下を実行:

```javascript
// 他ユーザーのデータを取得しようとする
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', 'user_b_id'); // ユーザーBのID
  .single();

console.log('Data:', data);
console.log('Error:', error);
```

**期待される結果:**
- ✅ `data` は `null` または空
- ✅ `error` にはRLS拒否エラーが含まれる
- ✅ ログに `permission denied` または類似のエラー

---

### テスト3: 認証済みユーザーがpublished記事を読み取れる

**目的:** 認証済みユーザーがpublishedステータスの記事を読み取れることを確認

**手順:**

1. Clerkでログインする
2. Consoleで以下を実行:

```javascript
const { data, error } = await supabase
  .from('articles')
  .select('*')
  .eq('status', 'published')
  .limit(5);

console.log('Published articles:', data);
console.log('Error:', error);
```

**期待される結果:**
- ✅ publishedステータスの記事が取得できる
- ✅ エラーがない

---

### テスト4: 認証済みユーザーがdraft記事を読み取れない

**目的:** 認証済みユーザーがdraftステータスの記事を読み取れないことを確認

**手順:**

1. Clerkでログインする
2. Consoleで以下を実行:

```javascript
const { data, error } = await supabase
  .from('articles')
  .select('*')
  .eq('status', 'draft')
  .limit(5);

console.log('Draft articles:', data);
console.log('Error:', error);
```

**期待される結果:**
- ✅ `data` は `null` または空
- ✅ `error` にはRLS拒否エラーが含まれる

---

### テスト5: Service Roleによる全アクセス

**目的:** Service Roleキーを使用して全データにアクセスできることを確認

**手順:**

```bash
# サービスロールキーを使用してデータ取得
export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 全ユーザーを取得
psql "$DATABASE_URL" -c "SELECT * FROM users LIMIT 5;"

# 全記事を取得（含むdraft）
psql "$DATABASE_URL" -c "SELECT * FROM articles LIMIT 5;"
```

または、Supabase SQL Editorで:

```sql
-- 全ユーザーを取得（service_roleとして実行）
SELECT * FROM users LIMIT 5;

-- 全記事を取得（含むdraft）
SELECT * FROM articles LIMIT 5;
```

**期待される結果:**
- ✅ 全ユーザーデータが取得できる
- ✅ 全記事データ（draft含む）が取得できる
- ✅ エラーがない

---

## 自動テストスクリプト

以下のSQLスクリプトでRLSポリシーをテストできます：

```sql
-- RLSテストスクリプト
DO $$
DECLARE
  test_user_id TEXT := 'test_user_123';
  test_user_email TEXT := 'test@example.com';
  other_user_id TEXT := 'other_user_456';
BEGIN
  -- テストユーザーを作成（service_roleで実行）
  RAISE NOTICE 'Creating test users...';
  INSERT INTO users (id, email, email_verified, created_at, updated_at)
  VALUES (test_user_id, test_user_email, true, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO users (id, email, email_verified, created_at, updated_at)
  VALUES (other_user_id, 'other@example.com', true, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  -- テスト1: ユーザーは自分のデータを読み取れる
  RAISE NOTICE 'Test 1: User can read own data';
  PERFORM set_config('request.jwt.claim.sub', test_user_id, false);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', false);

  IF EXISTS (
    SELECT 1 FROM users WHERE id = test_user_id
  ) THEN
    RAISE NOTICE '✅ Test 1 PASSED: User can read own data';
  ELSE
    RAISE NOTICE '❌ Test 1 FAILED: User cannot read own data';
  END IF;

  -- テスト2: ユーザーは他ユーザーのデータを読み取れない
  RAISE NOTICE 'Test 2: User cannot read other users data';
  PERFORM set_config('request.jwt.claim.sub', test_user_id, false);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', false);

  IF NOT EXISTS (
    SELECT 1 FROM users WHERE id = other_user_id
  ) THEN
    RAISE NOTICE '✅ Test 2 PASSED: User cannot read other users data';
  ELSE
    RAISE NOTICE '❌ Test 2 FAILED: User can read other users data';
  END IF;

  -- クリーンアップ
  DELETE FROM users WHERE id IN (test_user_id, other_user_id);

  RAISE NOTICE 'RLS testing completed';
END $$;
```

---

## トラブルシューティング

### 問題: RLSポリシーが適用されない

**原因:** RLSが有効になっていない、またはポリシーが正しく定義されていない

**解決策:**

```sql
-- RLSが有効になっているか確認
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- ポリシーを確認
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 問題: 認証情報が `auth.uid()` に渡されない

**原因:** SupabaseクライアントでJWTトークンが設定されていない

**解決策:**

```javascript
// ClerkのJWTトークンをSupabaseに設定
const token = await window.Clerk.session.getToken();
await supabase.auth.setSession({
  access_token: token,
  refresh_token: token,
});
```

### 問題: Service Roleでもアクセス拒否される

**原因:** Service Roleキーが正しくない、またはRLSポリシーの優先順位の問題

**解決策:**

```sql
-- Service Roleのポリシーを確認
SELECT * FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'users'
  AND permissive = true
  AND qual LIKE '%service_role%';
```

---

## RLSポリシーの確認コマンド

### ポリシー一覧を表示

```bash
npx supabase db select -c "
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
"
```

### 特定テーブルのポリシーを確認

```bash
# usersテーブル
npx supabase db select -c "
SELECT * FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users';
"

# articlesテーブル
npx supabase db select -c "
SELECT * FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'articles';
"
```

### RLSステータスを確認

```bash
npx supabase db select -c "
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
"
```

---

## 次のステップ

すべてのテストが成功したら：

1. **Clerk JWTトークンをSupabaseに渡す実装を追加**
   - `DebugCheck.tsx` でトークン設定を確認
   - 必要に応じて `AuthContext.tsx` を拡張

2. **自動テストの導入**
   - Supabaseのテスト機能を使用
   - CI/CDパイプラインにRLSテストを追加

3. **監視の設定**
   - Supabase DashboardでRLS違反のログを監視
   - 異常なアクセスパターンを検知
