<?php

namespace App\Http\Requests\banners;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CreateOrUpdateBannerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string',
            'alt' => 'required|string',
            'link_action' => 'required|string',
            'image_url' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:10240',
        ];
    }
}
