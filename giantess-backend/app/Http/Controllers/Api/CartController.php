<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $items = CartItem::with('product')
            ->where('user_id', $request->user()->id)
            ->get()
            ->filter(fn ($item) => $item->product !== null)
            ->values();

        return response()->json([
            'items' => $items->map(fn ($item) => [
                'product' => [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'slug' => $item->product->slug,
                    'price' => $item->product->price,
                    'image' => $item->product->image,
                ],
                'quantity' => $item->quantity,
                'subtotal' => number_format($item->quantity * $item->product->price, 2, '.', ''),
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $item = CartItem::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'product_id' => $validated['product_id'],
            ],
            ['quantity' => $validated['quantity']]
        );

        $item->load('product');

        return response()->json([
            'item' => [
                'product' => [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'slug' => $item->product->slug,
                    'price' => $item->product->price,
                    'image' => $item->product->image,
                ],
                'quantity' => $item->quantity,
                'subtotal' => number_format($item->quantity * $item->product->price, 2, '.', ''),
            ],
        ], 201);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $item = CartItem::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->first();

        if (! $item) {
            return response()->json(['message' => 'Cart item not found.'], 404);
        }

        $item->update(['quantity' => $validated['quantity']]);
        $item->load('product');

        return response()->json([
            'item' => [
                'product' => [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'slug' => $item->product->slug,
                    'price' => $item->product->price,
                    'image' => $item->product->image,
                ],
                'quantity' => $item->quantity,
                'subtotal' => number_format($item->quantity * $item->product->price, 2, '.', ''),
            ],
        ]);
    }

    public function destroy(Request $request, Product $product)
    {
        $deleted = CartItem::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->delete();

        if (! $deleted) {
            return response()->json(['message' => 'Cart item not found.'], 404);
        }

        return response()->json(['message' => 'Cart item removed successfully.']);
    }
}
