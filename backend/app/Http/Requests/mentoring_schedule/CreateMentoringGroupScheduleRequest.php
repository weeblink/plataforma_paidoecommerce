<?php

namespace App\Http\Requests\mentoring_schedule;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CreateMentoringGroupScheduleRequest extends FormRequest
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
            '*.title' => ['required', 'string', 'max:255'],
            '*.description' => ['nullable', 'string'],
            '*.group_id' => ['required', 'uuid'],
            '*.date' => ['required', 'date_format:d/m/Y'],
            '*.start_time' => ['required', 'date_format:H:i'],
            '*.end_time' => ['required', 'date_format:H:i', 'after:start_time'],
        ];
    }
}
