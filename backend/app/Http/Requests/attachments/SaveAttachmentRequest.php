<?php

namespace App\Http\Requests\attachments;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SaveAttachmentRequest extends FormRequest
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
            'file'      => 'required|file|max:10240|mimes:jpeg,jpg,png,gif,webp,pdf,doc,docx,xml,xlsx,csv',
            'title'     => 'required|string|max:255',
        ];
    }
}
