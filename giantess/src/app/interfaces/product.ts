import { DeviceModel } from './device-model';

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number | string;
  part_number: string;
  sku?: string;
  stock_count?: number;
  image?: string;
  image_url?: string;
  optimized_image_url?: string;
  thumbnail_url?: string;
  webp_image_url?: string;
  image_urls?: string[];
  images?: Array<string | { image_url?: string; url?: string; path?: string }>;
  product_images?: Array<string | { image_url?: string; url?: string; path?: string }>;
  gallery?: Array<string | { image_url?: string; url?: string; path?: string }>;
  media?: Array<string | { image_url?: string; url?: string; path?: string }>;
  device_model_id: number;
  device_model?: DeviceModel;
  created_at?: string;
  updated_at?: string;
}
