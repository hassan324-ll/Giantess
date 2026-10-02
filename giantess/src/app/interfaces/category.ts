import { Brand } from './brand';

export interface Category {
  id: number;
  brand_id: number;
  name: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
  brand?: Brand;
}
