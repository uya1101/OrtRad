# OrtRad 本番環境デプロイガイド

このドキュメントは、OrtRadプロジェクトを本番環境にデプロイするための完全な手順を説明しています。

## 目次

1. [前提条件](#前提条件)
2. [Vercel デプロイ](#vercel-デプロイ)
3. [Supabase 本番設定](#supabase-本番設定)
4. [環境変数の設定](#環境変数の設定)
5. [ドメイン設定](#ドメイン設定)
6. [モニタリング](#モニタリング)
7. [動作確認](#動作確認)
8. [トラブルシューティング](#トラブルシューティング)

---

## 前提条件

- Node.js 18+ と npm がインストールされている
- GitHubアカウント
- Vercelアカウント
- Supabaseアカウント
- Clerkアカウント（Phase 7実装後）

---

## Vercel デプロイ

### 1. GitHubリポジトリへのプッシュ

```bash
# 変更をコミット
git add .
git commit -m "本番環境デプロイの準備完了"

# GitHubにプッシュ
git push origin main
```

### 2. Vercelへのプロジェクト接続

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. 「Add New Project」をクリック
3. 「Import Git Repository」からGitHubリポジトリを選択
4. 以下の設定でデプロイ:

| 設定項目 | 値 |
|---------|-----|
| Framework Preset | Vite |
| Root Directory | ./ |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

5. 「Deploy」をクリック

### 3. 環境変数の設定

Vercelプロジェクト設定 → Environment Variables から以下を追加:

```bash
# Supabase 設定
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>

# Clerk 設定（Phase 7実装後）
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxx

# アプリケーションURL
VITE_APP_URL=https://ortrad.com

# 管理者パスワード（Phase 6簡易認証用）
VITE_ADMIN_PASSWORD=<your-admin-password>

# Gemini API Key（AI要約用、Edge Functionsのみで使用）
GEMINI_API_KEY=<your-gemini-api-key>
```

※ `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` はSupabase Dashboard → Settings → API から取得できます。

### 4. ドメイン設定

#### カスタムドメインの追加

1. Vercelプロジェクト → Settings → Domains
2. 「Add Domain」をクリック
3. `ortrad.com` と入力して追加
4. VercelがDNSレコードを自動設定

#### DNSレコードの手動設定（必要な場合）

Vercelが提供するDNSレコードをドメインレジストラで設定:

| タイプ | 名前 | 値 |
|-------|------|-----|
| CNAME | @ | cname.vercel-dns.com |
| CNAME | www | cname.vercel-dns.com |

SSL証明書はLet's Encryptによって自動的に発行・更新されます。

---

## Supabase 本番設定

詳細は `docs/SUPABASE_DEPLOYMENT.md` を参照してください。

### 主な手順:

1. **Edge Functionsのデプロイ**:
   ```bash
   supabase link --project-ref <your-project-ref>
   supabase functions deploy collect-pubmed
   supabase functions deploy collect-rss
   supabase functions deploy summarize-articles
   supabase functions deploy generate-trends
   supabase functions deploy run-daily-pipeline
   ```

2. **シークレットの設定**:
   ```bash
   supabase secrets set GEMINI_API_KEY=<your-key>
   supabase secrets set ADMIN_PASSWORD=<your-password>
   ```

3. **Cronジョブの設定**:
   Supabase SQL Editorで毎日0:00 JSTにパイプラインを実行するジョブを作成

4. **マイグレーションの適用**:
   ```bash
   supabase db push
   ```

---

## 環境変数の設定

### .env.local.example の使用

`.env.local.example` ファイルをベースにローカル開発環境をセットアップ:

```bash
cp .env.local.example .env.local
```

`.env.local` に実際の値を入力:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>

# Gemini API Configuration
VITE_GEMINI_API_KEY=<your-gemini-api-key>

# Clerk Authentication Configuration
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxx

# Admin Configuration
VITE_ADMIN_PASSWORD=<your-admin-password>
```

### 重要: セキュリティ

- **絶対に** `.env.local` ファイルをコミットしないでください
- `.gitignore` に含まれていることを確認してください
- シークレットはVercelのEnvironment Variablesで管理してください

---

## ドメイン設定

### DNS設定の確認

1. Vercel Dashboard → Settings → Domains
2. `ortrad.com` が「Valid Configuration」になっているか確認
3. SSL証明書が発行されているか確認（通常は自動）

### リダイレクト設定

wwwありなしを統一する場合、Vercel設定でリダイレクトを設定:

```json
{
  "redirects": [
    {
      "source": "/:path*",
      "has": [
        {
          "type": "host",
          "value": "www.ortrad.com"
        }
      ],
      "destination": "https://ortrad.com/:path*",
      "permanent": true
    }
  ]
}
```

---

## モニタリング

### Vercel Analytics（無料）

1. Vercel Dashboard → Analytics → 「Enable Analytics」
2. パフォーマンスとユーザー行動を監視

### Supabase Dashboard

- **Realtime**: データベース変更のリアルタイム監視
- **Logs**: APIリクエストとエラーログ
- **Performance**: クエリパフォーマンス
- **Database Stats**: ストレージと接続数

### Edge Functions のログ

```bash
supabase functions logs <function-name>
```

またはSupabase Dashboard → Edge Functions → Functionsから確認

### 収集パイプラインの監視

`collection_logs` テーブルで収集結果を監視:

```sql
-- 最新の収集ログを確認
SELECT * FROM collection_logs
ORDER BY created_at DESC
LIMIT 10;

-- 成功率の集計
SELECT
  status,
  COUNT(*) as count,
  AVG(fetched_count) as avg_fetched,
  AVG(new_count) as avg_new
FROM collection_logs
GROUP BY status;
```

---

## 動作確認

### 1. フロントエンドの動作確認

```
https://ortrad.com/
```

以下を確認:
- [ ] ページが正常に読み込まれる
- [ ] スタイルが正しく表示される
- [ ] サイバーテーマのアニメーションが動作する

### 2. Supabase Edge Functions の手動実行

```bash
# デイリーパイプラインを実行
supabase functions invoke run-daily-pipeline
```

### 3. ダッシュボードの確認

- [ ] 論文が一覧表示される
- [ ] 各論文の要約が表示される
- [ ] カテゴリやタグでフィルタリングができる

### 4. 検索機能の確認

- [ ] キーワード検索が動作する
- [ ] オートコンプリートが表示される
- [ ] 詳細フィルタが機能する
- [ ] URL同期が動作する

### 5. 多言語切替の確認

- [ ] 日本語と英語の切替が動作する
- [ ] 各言語で適切な翻訳が表示される
- [ ] 言語切替がブラウザに保存される

### 6. 管理画面の確認

```
https://ortrad.com/admin/dashboard
```

- [ ] 認証が動作する（Clerkサインイン）
- [ ] ダッシュボードに統計が表示される
- [ ] 記事管理機能が動作する
- [ ] ソース管理機能が動作する
- [ ] ログビューアーが機能する
- [ ] 設定画面が表示される

### 7. モバイルでの確認

- [ ] レスポンシブデザインが機能する
- [ ] モバイルメニューが動作する
- [ ] タッチ操作がスムーズ
- [ ] 画像が適切にサイズ調整される

### 8. Cron ジョブの確認

翌日、以下を確認:
- [ ] Cronジョブが実行されたか
- [ ] 新しい論文が収集されたか
- [ ] `collection_logs` に成功記録があるか

---

## トラブルシューティング

### デプロイが失敗する場合

**症状**: Vercelでビルドエラーが発生

**解決方法**:
1. ローカルで `npm run build` を実行して成功するか確認
2. Node.jsのバージョンを確認（18+が必要）
3. 依存関係を更新: `npm install`
4. キャッシュをクリアして再デプロイ

### 環境変数が読み込まれない場合

**症状**: Supabase APIエラー「URL or Anon Key is missing」

**解決方法**:
1. Vercel Environment Variables で変数名を確認（大文字小文字）
2. 変数名に `VITE_` プレフィックスが付いているか確認
3. デプロイを再実行して環境変数を再読み込み

### CORSエラーが発生する場合

**症状**: APIリクエストがブロックされる

**解決方法**:
1. Supabase Dashboard → API → CORS
2. `https://ortrad.com` を許可オリジンに追加
3. 適切なメソッドとヘッダーを許可

### Cronジョブが実行されない場合

**症状**: デイリーパイプラインが自動実行されない

**解決方法**:
1. pg_cron拡張機能が有効か確認: `SELECT * FROM pg_extension WHERE extname = 'pg_cron';`
2. ジョブが登録されているか確認: `SELECT * FROM cron.job;`
3. タイムゾーン設定を確認（UTCとJSTの違いに注意）

### モバイルでレイアウトが崩れる場合

**症状**: スマホで表示がおかしい

**解決方法**:
1. メタビューポートタグを確認
2. CSSのメディアクエリを確認
3. 画像サイズがレスポンシブ対応しているか確認

---

## セキュリティチェックリスト

デプロイ前に以下を確認してください:

- [ ] `.env.local` が `.gitignore` に含まれている
- [ ] 環境変数にハードコードされたシークレットがない
- [ ] Supabase RLSポリシーが正しく設定されている
- [ ] CORS設定が `ortrad.com` のみ許可している
- [ ] サービスロールキーがフロントエンドで使用されていない
- [ ] APIレート制限が設定されている
- [ ] HTTPSが強制されている
- [ ] セキュリティヘッダーが設定されている（vercel.json）

---

## 次のステップ

デプロイ完了後:

1. **ユーザー招待**: チームメンバーにVercelプロジェクトを共有
2. **ドキュメント更新**: デプロイ状況とトラブルシューティングを記録
3. **定期的なバックアップ**: データベースバックアップの手順を確立
4. **監視アラート**: SupabaseとVercelでアラートを設定
5. **ロードマップ**: 新機能の開発とリリースを計画

---

## サポート

問題が発生した場合:

- **Vercel**: [Vercel Dashboard](https://vercel.com/dashboard)
- **Supabase**: [Supabase Dashboard](https://app.supabase.com)
- **Clerk**: [Clerk Dashboard](https://dashboard.clerk.com)
- **プロジェクトドキュメント**: `/docs` ディレクトリ

---

© 2025 OrtRad. All rights reserved.
