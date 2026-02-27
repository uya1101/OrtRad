import { supabase } from './supabase-client.ts';
import { CollectionLogStatus } from './constants.ts';

export async function startCollectionLog(source: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('collection_logs')
      .insert({
        source,
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating collection log:', error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Error creating collection log:', error);
    return null;
  }
}

export async function updateCollectionLog(
  logId: string,
  updates: {
    status?: CollectionLogStatus;
    articles_found?: number;
    articles_new?: number;
    error_message?: string | null;
    completed_at?: string;
  }
): Promise<void> {
  try {
    const { error } = await supabase
      .from('collection_logs')
      .update({
        ...updates,
        completed_at: updates.completed_at || new Date().toISOString(),
      })
      .eq('id', logId);

    if (error) {
      console.error('Error updating collection log:', error);
    }
  } catch (error) {
    console.error('Error updating collection log:', error);
  }
}

export async function logCollectionResult(
  source: string,
  status: 'completed' | 'failed',
  articlesFound: number,
  articlesNew: number,
  errorMessage?: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('collection_logs')
      .insert({
        source,
        status,
        articles_found: articlesFound,
        articles_new: articlesNew,
        error_message: errorMessage || null,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error creating collection log:', error);
    }
  } catch (error) {
    console.error('Error creating collection log:', error);
  }
}
