export interface TrendKeyword {
  id: string;
  keyword_en: string;
  keyword_ja: string;
  count: number;
  period_start: string;
  period_end: string;
}

export interface CreateTrendKeywordInput {
  keyword_en: string;
  keyword_ja: string;
  count?: number;
  period_start: string;
  period_end: string;
}

export interface UpdateTrendKeywordInput extends Partial<CreateTrendKeywordInput> {
  id: string;
}
