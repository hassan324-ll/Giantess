<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductCardResource extends JsonResource
{
    public function toArray($request): array
    {
        $imageUrl = $this->image ? Storage::disk('public')->url($this->image) : null;

        return [
            'id' => $this->id,
            'device_model_id' => $this->device_model_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'image_url' => $imageUrl,
            'thumbnail_url' => $imageUrl,
            'webp_image_url' => $imageUrl,
            'optimized_image_url' => $imageUrl,
            'part_number' => $this->part_number,
            'sku' => $this->part_number,
            'description' => $this->description,
            'price' => $this->price,
            'stock_count' => (int) $this->stock_count,
        ];
    }
}
