<?php

namespace App\Http\Requests\extra_management;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CreateOrUpdateExtraRequest extends FormRequest
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
            'price'                 => 'nullable|numeric|min:0',
            'promotional_price'     => "nullable|numeric|min:0",
            'image_url'             => "nullable|image|mimes:jpeg,jpg,png,webp|max:10240",
            'file_url'              => "nullable|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,zip,rar|max:10240",
        ];
    }
}
