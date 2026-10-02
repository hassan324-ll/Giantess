<?php
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\DeviceModelController;
use App\Http\Controllers\Api\EmailVerificationController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\MenuCatalogController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

Route::post('login', [AuthController::class, 'login']);
Route::post('register', [AuthController::class, 'register']);
Route::post('admin/register', [AuthController::class, 'adminRegister']);
Route::post('auth/send-verification-code', [EmailVerificationController::class, 'sendVerificationCode']);
Route::post('auth/verify-code', [EmailVerificationController::class, 'verifyCode']);
Route::post('contact', [ContactController::class, 'store']);

Route::get('brands', [BrandController::class, 'index']);
Route::get('menu-catalog', [MenuCatalogController::class, 'index']);
Route::get('brands/{brand}', [BrandController::class, 'show']);
Route::get('categories/{brand}', [CategoryController::class, 'index']);
Route::get('models/{category}', [DeviceModelController::class, 'index']);
Route::get('products/{deviceModel}', [ProductController::class, 'index']);
Route::get('product/{product}', [ProductController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);

    Route::get('cart', [CartController::class, 'index']);
    Route::post('cart/items', [CartController::class, 'store']);
    Route::patch('cart/items/{product}', [CartController::class, 'update']);
    Route::delete('cart/items/{product}', [CartController::class, 'destroy']);

    Route::get('favorites', [FavoriteController::class, 'index']);
    Route::post('favorites', [FavoriteController::class, 'store']);
    Route::delete('favorites/{product}', [FavoriteController::class, 'destroy']);

    Route::middleware('admin')->group(function () {
        Route::put('admin/profile', [AuthController::class, 'updateAdmin']);

        Route::apiResource('admin/brands', BrandController::class)->except(['index', 'show']);
        Route::apiResource('admin/categories', CategoryController::class)->except(['index', 'show']);
        Route::apiResource('admin/models', DeviceModelController::class)
            ->parameter('models', 'deviceModel')
            ->except(['index', 'show']);
        Route::apiResource('admin/products', ProductController::class)->except(['index', 'show']);
    });
});
