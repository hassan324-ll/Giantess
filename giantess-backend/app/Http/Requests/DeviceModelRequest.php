<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DeviceModelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $deviceModelId = $this->route('deviceModel')?->id;

        return [
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('device_models')->ignore($deviceModelId)],
            'image' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,gif,svg,webp', 'max:2048'],
            'description' => ['sometimes', 'nullable', 'string'],
        ];
    }
}
