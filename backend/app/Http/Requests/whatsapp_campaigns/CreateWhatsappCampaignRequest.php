<?php

namespace App\Http\Requests\whatsapp_campaigns;

use Illuminate\Foundation\Http\FormRequest;

class CreateWhatsappCampaignRequest extends FormRequest
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
            'groups_id'         => 'required|array',
            'groups_id.*'       => 'string|exists:whatsapp_groups,id',
            'title'             => 'required|string|max:255',
            'msg1'              => 'required|string',
            'msg2'              => 'required|string',
            'msg3'              => 'required|string',
            'msg4'              => 'required|string',
            'msg5'              => 'required|string',
        ];
    }
}
