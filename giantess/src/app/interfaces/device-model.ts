import { Category } from './category';

export interface DeviceModel {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  image_url?: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
  category?: Category;
}
