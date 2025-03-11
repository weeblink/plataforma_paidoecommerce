<?php

namespace App\Http\Requests\meet_schedules;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CreateOrUpdateMeetSchedulesRequest extends FormRequest
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
            'calendar_time_id' => 'required|string|exists:calendar_times,id',
            'group_id' => 'required|string|exists:groups,id',
            'title' => 'required|string',
            'description' => 'required|string'
        ];
    }
}
