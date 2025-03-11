<?php

namespace App\Http\Requests\email_marketing;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class EmailMarketingSendRequest extends FormRequest
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
            'subject'       => 'required|string',
            'message'       => 'required|string',
            'type_action'   => 'required|string',
            'link'          => 'nullable|string',
            'file'          => 'nullable|file|max:10240|mimes:jpeg,jpg,png,gif,webp,pdf,doc,docx,xml,xlsx,csv',
            'scheduled'     => 'required|boolean',
            'schedule_time' => 'nullable|date_format:Y-m-d H:i',
        ];
    }
}
