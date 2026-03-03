# Supabase マイグレーション反映手順

このドキュメントでは、ローカルのスキーマ変更をリモートのSupabaseプロジェクトに反映する手順を説明します。

---

## 前提条件

- Supabase CLI がインストールされている (`npm install -g supabase`)
- Supabaseプロジェクト: `ddpuicuindpcxxifzzwp`
- `.env.local` に環境変数が設定されている

---

## 手順

### 1. プロジェクトのリンク

まだリンクしていない場合は、まずプロジェクトをリンクします。

```bash
# プロジェクトIDを指定してリンク
npx supabase link --project-ref ddpuicuindpcxxifzzwp

# または、対話モードでプロジェクトを選択
npx supabase link
```

### 2. マイグレーションのドライラン（推奨）

本番環境への変更を適用する前に、適用される変更を確認します。

```bash
# 変更内容を確認のみ（適用しない）
npx supabase db push --dry-run

# または、SQLスクリプトを表示
npx supabase db diff --use-migra
```

### 3. バックアップの作成（推奨）

本番環境で変更を適用する前に、データベースのバックアップを作成します。

**方法A: Supabase Dashboard から**

1. [Supabase Dashboard](https://supabase.com/dashboard/project/ddpuicuindpcxxifzzwp/database) にアクセス
2. 「Settings」→「Database」→「Backups」に移動
3. 「Create backup」をクリックしてバックアップを作成

**方法B: SQLでエクスポート**

```sql
-- Supabase SQL Editor で実行
-- （大規模なデータベースの場合はDashboardから行うことを推奨）
```

### 4. マイグレーションの反映

バックアップが完了したら、マイグレーションを反映します。

```bash
# マイグレーションを反映
npx supabase db push

# 出力例:
# Applying migration 002_create_users_table.sql...
# Done.
```

### 5. 反映後の確認

マイグレーションが正常に適用されたことを確認します。

**方法A: Supabase CLI で確認**

```bash
# users テーブルが作成されたか確認
npx supabase db select -c "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;"

# RLSポリシーを確認
npx supabase db select -c "SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename = 'users';"

# 既存テーブルの状態を確認
npx supabase db select -c "SELECT * FROM articles LIMIT 1;"
```

**方法B: Supabase Dashboard で確認**

1. [Supabase Dashboard](https://supabase.com/dashboard/project/ddpuicuindpcxxifzzwp/database/tables) にアクセス
2. `users` テーブルが存在することを確認
3. テーブル構造（カラム、インデックス、RLSポリシー）を確認

**方法C: SQL Editor で確認**

```sql
-- テーブルが作成されたか確認
SELECT * FROM information_schema.tables WHERE table_name = 'users';

-- users テーブルのカラム確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- RLSポリシー確認
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users';
```

---

## トラブルシューティング

### エラー: "Migration failed"

**原因:** 既存のデータと競合している、またはスキーマに問題がある

**解決策:**
1. `--dry-run` で生成されるSQLを確認
2. 問題のあるカラム名や制約を特定
3. マイグレーションファイルを修正して再実行

### エラー: "Connection refused"

**原因:** Supabaseプロジェクトが一時的にダウンしている、またはネットワーク問題

**解決策:**
1. Supabase Dashboardでプロジェクトのステータスを確認
2. 数分待ってから再実行

### エラー: "Migration already applied"

**原因:** マイグレーションが既に適用されている

**解決策:**
- マイグレーション番号を変更して新しいファイルを作成

---

## ロールバック

マイグレーションを取り消す必要がある場合：

**注意:** データは削除されます。

```bash
# マイグレーションをロールバック
npx supabase db reset --local

# リモートのマイグレーション履歴を確認
npx supabase migrations list
```

---

## 次のステップ

マイグレーションが正常に適用されたら：

1. **Edge Functions のデプロイ**:
   ```bash
   npx supabase functions deploy sync-clerk-user
   ```

2. **Clerk Webhook の設定**: Clerk DashboardでWebhookエンドポイントを登録

3. **動作確認**: DebugCheckコンポーネントでユーザー同期を確認
