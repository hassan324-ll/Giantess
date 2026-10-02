<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'image',
        'description',
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function categories()
    {
        return $this->hasMany(Category::class);
    }
}
