<?php

namespace App\Http\Requests\mentorship_groups;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CreateOrUpdateMentorshipGroupRequest extends FormRequest
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
            'course_id' => 'required|string|exists:courses,id',
            'mentorship_id' => 'required|string|exists:mentorships,id',
            'price' => 'required|numeric',
            'price_promotional' => 'required|numeric',
            'purchase_deadline' => 'required|date',
            'expiration_date' => 'required|date',
            'type' => 'required|string|in:group,single',
        ];
    }
}
