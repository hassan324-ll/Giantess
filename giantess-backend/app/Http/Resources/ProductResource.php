<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductResource extends JsonResource
{
    public function toArray($request): array
    {
        $images = $this->whenLoaded('images', function () {
            return $this->images->map(fn ($image) => [
                'id' => $image->id,
                'url' => Storage::disk('public')->url($image->image),
                'sort_order' => $image->sort_order,
            ]);
        });

        return [
            'id' => $this->id,
            'device_model_id' => $this->device_model_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'image_url' => $this->image ? Storage::disk('public')->url($this->image) : null,
            'thumbnail_url' => $this->image ? Storage::disk('public')->url($this->image) : null,
            'webp_image_url' => $this->image ? Storage::disk('public')->url($this->image) : null,
            'optimized_image_url' => $this->image ? Storage::disk('public')->url($this->image) : null,
            'images' => $images,
            'part_number' => $this->part_number,
            'sku' => $this->part_number,
            'description' => $this->description,
            'price' => $this->price,
            'stock_count' => (int) $this->stock_count,
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
            'device_model' => new DeviceModelResource($this->whenLoaded('deviceModel')),
        ];
    }
}
