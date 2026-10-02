<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BrandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $brandId = $this->route('brand')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('brands')->ignore($brandId)],
            'image' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,gif,svg,webp', 'max:2048'],
            'description' => ['sometimes', 'nullable', 'string'],
        ];
    }
}
