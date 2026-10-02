<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class MenuCatalogController extends Controller
{
    public function index(): JsonResponse
    {
        $catalog = Cache::remember('menu-catalog:v1', now()->addMinutes(30), function () {
            return Brand::query()
                ->select(['id', 'name', 'slug'])
                ->with(['categories' => function ($query) {
                    $query->select(['id', 'brand_id', 'name', 'slug'])
                        ->orderBy('name')
                        ->with(['deviceModels' => function ($query) {
                            $query->select(['id', 'category_id', 'name', 'slug'])
                                ->orderBy('name');
                        }]);
                }])
                ->orderBy('name')
                ->get()
                ->map(fn (Brand $brand) => [
                    'id' => $brand->slug,
                    'slug' => $brand->slug,
                    'name' => $brand->name,
                    'sections' => $brand->categories->map(fn ($category) => [
                        'slug' => $category->slug,
                        'title' => $category->name,
                        'items' => $category->deviceModels->map(fn ($model) => [
                            'name' => $model->name,
                            'slug' => $model->slug,
                        ])->values(),
                    ])->values(),
                ])
                ->values();
        });

        return response()->json([
            'data' => $catalog,
            'success' => true,
            'message' => 'Menu catalog loaded successfully.',
        ]);
    }
}
