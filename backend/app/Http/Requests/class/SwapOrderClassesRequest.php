<?php

namespace App\Http\Requests\class;

use Illuminate\Foundation\Http\FormRequest;

class SwapOrderClassesRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'class1_id'     => 'required|exists:class,id',
            'class2_id'     => 'required|exists:class,id',
        ];
    }
}
