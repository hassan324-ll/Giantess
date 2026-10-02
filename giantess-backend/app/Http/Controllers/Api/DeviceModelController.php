<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Traits\HandlesImageUploads;
use App\Http\Requests\DeviceModelRequest;
use App\Http\Resources\DeviceModelResource;
use App\Models\Category;
use App\Models\DeviceModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class DeviceModelController extends Controller
{
    use HandlesImageUploads;

    public function index(Category $category): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $models = $category->deviceModels()->withCount('products')->paginate(15);

        return DeviceModelResource::collection($models)->additional([
            'success' => true,
            'message' => 'Models retrieved successfully.',
        ]);
    }

    public function show(DeviceModel $deviceModel): DeviceModelResource
    {
        return (new DeviceModelResource($deviceModel->load('category.brand', 'products')))->additional([
            'success' => true,
            'message' => 'Model loaded successfully.',
        ]);
    }

    public function store(DeviceModelRequest $request): DeviceModelResource
    {
        $data = $request->validated();
        $data['image'] = $this->uploadImage($request->file('image'), 'device-models');

        $model = DeviceModel::create($data);
        Cache::forget('menu-catalog:v1');

        return (new DeviceModelResource($model))->additional([
            'success' => true,
            'message' => 'Model created successfully.',
        ]);
    }

    public function update(DeviceModelRequest $request, DeviceModel $deviceModel): DeviceModelResource
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $this->uploadImage($request->file('image'), 'device-models');
        }

        $deviceModel->update($data);
        Cache::forget('menu-catalog:v1');

        return (new DeviceModelResource($deviceModel))->additional([
            'success' => true,
            'message' => 'Model updated successfully.',
        ]);
    }

    public function destroy(DeviceModel $deviceModel): JsonResponse
    {
        $deviceModel->delete();
        Cache::forget('menu-catalog:v1');

        return response()->json([
            'success' => true,
            'message' => 'Model deleted successfully.',
        ]);
    }
}
