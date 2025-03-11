<?php

namespace App\Http\Requests\modules;

use Illuminate\Foundation\Http\FormRequest;

class SwapOrderModuleRequest extends FormRequest
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
            'module1_id'    => 'required|exists:courses_modules,id',
            'module2_id'    => 'required|exists:courses_modules,id',
        ];
    }
}
