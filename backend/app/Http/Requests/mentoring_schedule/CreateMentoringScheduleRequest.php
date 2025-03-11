<?php

namespace App\Http\Requests\mentoring_schedule;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CreateMentoringScheduleRequest extends FormRequest
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
            'dates.*.date' => 'required|string|date_format:d/m/Y',
            'dates.*.times' => 'required|array',
            'dates.*.times.*.start_time' => 'required|date_format:H:i',
            'dates.*.times.*.end_time' => 'required|date_format:H:i',
        ];
    }
}
