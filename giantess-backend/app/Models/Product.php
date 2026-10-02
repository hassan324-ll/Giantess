<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_model_id',
        'name',
        'slug',
        'image',
        'part_number',
        'description',
        'price',
        'stock_count',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock_count' => 'integer',
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function resolveRouteBinding($value, $field = null): ?self
    {
        $query = $this->where($field ?? 'slug', $value);

        if ($field === null && ctype_digit((string) $value)) {
            $query->orWhereKey($value);
        }

        return $query->first();
    }

    public function deviceModel()
    {
        return $this->belongsTo(DeviceModel::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }
}
