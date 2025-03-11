<?php

namespace App\Http\Requests\mentoring_schedule;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateMentoringScheduleRequest extends FormRequest
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
            'date' => 'required|date_format:d/m/Y',
            'times' => 'required|array',
            'times.*.start_time' => 'required|string|date_format:H:i',
            'times.*.end_time' => 'required|string|date_format:H:i|after:times.*.start_time',
        ];
    }
}
