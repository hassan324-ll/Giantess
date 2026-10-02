<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Traits\HandlesImageUploads;
use App\Http\Requests\ProductRequest;
use App\Http\Resources\ProductCardResource;
use App\Http\Resources\ProductResource;
use App\Models\DeviceModel;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    use HandlesImageUploads;

    public function index(Request $request, DeviceModel $deviceModel): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $products = $deviceModel->products()
            ->select(['id', 'device_model_id', 'name', 'slug', 'image', 'part_number', 'description', 'price', 'stock_count', 'created_at', 'updated_at'])
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = trim((string) $request->query('search'));

                $query->where(function ($query) use ($search) {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('part_number', 'like', "%{$search}%");
                });
            })
            ->latest('id')
            ->paginate(16);

        return ProductCardResource::collection($products)->additional([
            'success' => true,
            'message' => 'Products retrieved successfully.',
        ]);
    }

    public function show(Product $product): ProductResource
    {
        return (new ProductResource($product->load('deviceModel.category.brand', 'images')))->additional([
            'success' => true,
            'message' => 'Product loaded successfully.',
        ]);
    }

    public function store(ProductRequest $request): ProductResource
    {
        $data = $request->validated();
        unset($data['images']);
        $this->normalizeStockCount($request, $data);

        $uploadedImages = $request->file('images', []);
        $primaryImage = $request->file('image') ?: ($uploadedImages[0] ?? null);
        $data['image'] = $this->uploadImage($primaryImage, 'products');

        $product = Product::create($data);
        $this->storeGalleryImages($product, $uploadedImages ?: [$primaryImage]);

        return (new ProductResource($product->load('images')))->additional([
            'success' => true,
            'message' => 'Product created successfully.',
        ]);
    }

    public function update(ProductRequest $request, Product $product): ProductResource
    {
        $data = $request->validated();
        unset($data['images']);
        $this->normalizeStockCount($request, $data);

        $uploadedImages = $request->file('images', []);
        $primaryImage = $request->file('image') ?: ($uploadedImages[0] ?? null);

        if ($primaryImage) {
            $this->deleteImage($product->image);
            $data['image'] = $this->uploadImage($primaryImage, 'products');
        }

        $product->update($data);

        if ($uploadedImages) {
            $this->replaceGalleryImages($product, $uploadedImages);
        }

        return (new ProductResource($product->load('images')))->additional([
            'success' => true,
            'message' => 'Product updated successfully.',
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $this->deleteImage($product->image);
        $this->replaceGalleryImages($product, []);
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully.',
        ]);
    }

    private function storeGalleryImages(Product $product, array $images): void
    {
        foreach (array_values(array_filter($images)) as $index => $image) {
            $product->images()->create([
                'image' => $this->uploadImage($image, 'products'),
                'sort_order' => $index,
            ]);
        }
    }

    private function replaceGalleryImages(Product $product, array $images): void
    {
        $product->loadMissing('images');

        foreach ($product->images as $image) {
            $this->deleteImage($image->image);
        }

        $product->images()->delete();
        $this->storeGalleryImages($product, $images);
    }

    private function deleteImage(?string $image): void
    {
        if ($image) {
            Storage::disk('public')->delete($image);
        }
    }

    private function normalizeStockCount(ProductRequest $request, array &$data): void
    {
        if ($request->has('stock_count')) {
            $data['stock_count'] = (int) $request->input('stock_count', 0);
        }
    }
}
