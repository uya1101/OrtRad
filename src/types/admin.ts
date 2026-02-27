export type CollectionStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface CollectionLog {
  id: string;
  source: string;
  status: CollectionStatus;
  articles_found: number;
  articles_new: number;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface CreateCollectionLogInput {
  source: string;
  status?: CollectionStatus;
  articles_found?: number;
  articles_new?: number;
  error_message?: string | null;
  started_at?: string;
  completed_at?: string | null;
}

export interface AdminSetting {
  id: string;
  key: string;
  value: Record<string, any>;
  updated_at: string;
}

export interface CreateAdminSettingInput {
  key: string;
  value: Record<string, any>;
}

export interface UpdateAdminSettingInput extends Partial<CreateAdminSettingInput> {
  id: string;
}
