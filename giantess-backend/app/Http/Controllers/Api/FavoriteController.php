<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FavoriteProduct;
use App\Models\Product;
use App\Http\Resources\ProductResource;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::whereIn(
            'id',
            FavoriteProduct::where('user_id', $request->user()->id)->pluck('product_id')
        )->get();

        return response()->json([
            'favorites' => ProductResource::collection($products),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
        ]);

        FavoriteProduct::firstOrCreate([
            'user_id' => $request->user()->id,
            'product_id' => $validated['product_id'],
        ]);

        $product = Product::find($validated['product_id']);

        return response()->json(['favorite' => new ProductResource($product)], 201);
    }

    public function destroy(Request $request, Product $product)
    {
        $deleted = FavoriteProduct::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->delete();

        if (! $deleted) {
            return response()->json(['message' => 'Favorite product not found.'], 404);
        }

        return response()->json(['message' => 'Favorite removed successfully.']);
    }
}
