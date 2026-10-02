<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Traits\HandlesImageUploads;
use App\Http\Requests\BrandRequest;
use App\Http\Resources\BrandResource;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class BrandController extends Controller
{
    use HandlesImageUploads;

    public function index(): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $brands = Brand::withCount('categories')->paginate(15);

        return BrandResource::collection($brands)->additional([
            'success' => true,
            'message' => 'Brands retrieved successfully.',
        ]);
    }

    public function show(Brand $brand): BrandResource
    {
        return (new BrandResource($brand->load('categories')))->additional([
            'success' => true,
            'message' => 'Brand loaded successfully.',
        ]);
    }

    public function store(BrandRequest $request): BrandResource
    {
        $data = $request->validated();
        $data['image'] = $this->uploadImage($request->file('image'), 'brands');

        $brand = Brand::create($data);
        Cache::forget('menu-catalog:v1');

        return (new BrandResource($brand))->additional([
            'success' => true,
            'message' => 'Brand created successfully.',
        ]);
    }

    public function update(BrandRequest $request, Brand $brand): BrandResource
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $this->uploadImage($request->file('image'), 'brands');
        }

        $brand->update($data);
        Cache::forget('menu-catalog:v1');

        return (new BrandResource($brand))->additional([
            'success' => true,
            'message' => 'Brand updated successfully.',
        ]);
    }

    public function destroy(Brand $brand): JsonResponse
    {
        $brand->delete();
        Cache::forget('menu-catalog:v1');

        return response()->json([
            'success' => true,
            'message' => 'Brand deleted successfully.',
        ]);
    }
}
