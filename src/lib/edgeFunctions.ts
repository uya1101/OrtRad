import { supabase } from './supabase';

interface EdgeFunctionResponse<T = unknown> {
  data?: T;
  error?: string;
  success: boolean;
}

/**
 * 管理画面用のEdge Function呼び出し
 * カスタムヘッダーで認証
 */
export async function invokeAdminFunction<T = unknown>(
  functionName: string,
  payload?: Record<string, unknown>
): Promise<EdgeFunctionResponse<T>> {
  try {
    // Get admin password for authentication
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (!adminPassword) {
      return {
        success: false,
        error: 'Admin password not configured',
      };
    }

    // Call edge function with admin credentials
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload,
      headers: {
        'X-Admin-Password': adminPassword,
      },
    });

    if (error) {
      console.error(`Edge function error (${functionName}):`, error);
      return {
        success: false,
        error: error.message || 'Edge function call failed',
      };
    }

    // Check for authentication errors from the function
    if (data && typeof data === 'object' && 'error' in data) {
      return {
        success: false,
        error: (data as { error: string }).error,
      };
    }

    return {
      success: true,
      data: data as T,
    };
  } catch (err) {
    console.error(`Edge function exception (${functionName}):`, err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * 手動収集実行
 */
export async function runCollectionPipeline(): Promise<EdgeFunctionResponse<{ status: string }>> {
  return invokeAdminFunction<{ status: string }>('run-daily-pipeline');
}

/**
 * AI要約実行
 */
export async function runSummarization(): Promise<EdgeFunctionResponse<{ processed: number; failed: number }>> {
  return invokeAdminFunction<{ processed: number; failed: number }>('summarize-articles');
}

/**
 * トレンド生成実行
 */
export async function runTrendGeneration(): Promise<EdgeFunctionResponse<{ generated: number }>> {
  return invokeAdminFunction<{ generated: number }>('generate-trends');
}

/**
 * PubMed収集
 */
export async function runPubMedCollection(
  keywords?: string
): Promise<EdgeFunctionResponse<{ collected: number; new: number }>> {
  return invokeAdminFunction<{ collected: number; new: number }>('collect-pubmed', { keywords });
}

/**
 * RSS収集
 */
export async function runRSSCollection(): Promise<EdgeFunctionResponse<{ collected: number; new: number }>> {
  return invokeAdminFunction<{ collected: number; new: number }>('collect-rss');
}

/**
 * 記事ステータス更新
 */
export async function updateArticleStatus(
  articleId: string,
  status: 'draft' | 'published' | 'archived'
): Promise<EdgeFunctionResponse> {
  return invokeAdminFunction('update-article-status', { articleId, status });
}

/**
 * 記事削除
 */
export async function deleteArticle(articleId: string): Promise<EdgeFunctionResponse> {
  return invokeAdminFunction('delete-article', { articleId });
}

/**
 * 一括ステータス更新
 */
export async function bulkUpdateArticleStatus(
  articleIds: string[],
  status: 'draft' | 'published' | 'archived'
): Promise<EdgeFunctionResponse<{ updated: number }>> {
  return invokeAdminFunction<{ updated: number }>('bulk-update-article-status', { articleIds, status });
}

/**
 * RSSソース追加
 */
export async function addRSSSource(
  source: { name: string; url: string; slug: string }
): Promise<EdgeFunctionResponse> {
  return invokeAdminFunction('add-rss-source', source);
}

/**
 * RSSソース削除
 */
export async function deleteRSSSource(sourceId: string): Promise<EdgeFunctionResponse> {
  return invokeAdminFunction('delete-rss-source', { sourceId });
}

/**
 * 設定更新
 */
export async function updateSetting(
  key: string,
  value: unknown
): Promise<EdgeFunctionResponse> {
  return invokeAdminFunction('update-setting', { key, value });
}
