<?php

namespace App\Http\Requests\courses_management;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CreateOrUpdateCourseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function prepareForValidation()
    {
        $this->merge([
            'is_pay' => filter_var($this->is_pay, FILTER_VALIDATE_BOOLEAN),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'hs_identifier'         => "nullable|string",
            'title'                 => "required|string|max:100",
            'price'                 => 'nullable|numeric|min:0',
            'promotional_price'     => "nullable|numeric|min:0",
            'thumbnail'             => "nullable|image|mimes:jpeg,jpg,png,webp|max:10240",
            'link_buy'              => 'nullable|url',
            'is_pay'                => 'required|boolean',
        ];
    }
}
