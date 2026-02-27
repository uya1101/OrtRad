export interface Category {
  id: string;
  slug: string;
  name_en: string;
  name_ja: string;
  icon: string | null;
  sort_order: number;
}

export interface CreateCategoryInput {
  slug: string;
  name_en: string;
  name_ja: string;
  icon?: string | null;
  sort_order?: number;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string;
}
