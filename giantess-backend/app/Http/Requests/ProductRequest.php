<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('product')?->id;

        return [
            'device_model_id' => ['required', 'exists:device_models,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('products')->ignore($productId)],
            'image' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,gif,svg,webp', 'max:2048'],
            'images' => ['sometimes', 'nullable', 'array'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,gif,svg,webp', 'max:4096'],
            'part_number' => ['required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock_count' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
