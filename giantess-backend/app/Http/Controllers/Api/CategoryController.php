<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Traits\HandlesImageUploads;
use App\Http\Requests\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Brand;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    use HandlesImageUploads;

    public function index(Brand $brand): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $categories = $brand->categories()->withCount('deviceModels')->paginate(15);

        return CategoryResource::collection($categories)->additional([
            'success' => true,
            'message' => 'Categories retrieved successfully.',
        ]);
    }

    public function show(Category $category): CategoryResource
    {
        return (new CategoryResource($category->load('brand', 'deviceModels')))->additional([
            'success' => true,
            'message' => 'Category loaded successfully.',
        ]);
    }

    public function store(CategoryRequest $request): CategoryResource
    {
        $data = $request->validated();
        $data['image'] = $this->uploadImage($request->file('image'), 'categories');

        $category = Category::create($data);
        Cache::forget('menu-catalog:v1');

        return (new CategoryResource($category))->additional([
            'success' => true,
            'message' => 'Category created successfully.',
        ]);
    }

    public function update(CategoryRequest $request, Category $category): CategoryResource
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $this->uploadImage($request->file('image'), 'categories');
        }

        $category->update($data);
        Cache::forget('menu-catalog:v1');

        return (new CategoryResource($category))->additional([
            'success' => true,
            'message' => 'Category updated successfully.',
        ]);
    }

    public function destroy(Category $category): JsonResponse
    {
        $category->delete();
        Cache::forget('menu-catalog:v1');

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully.',
        ]);
    }
}
