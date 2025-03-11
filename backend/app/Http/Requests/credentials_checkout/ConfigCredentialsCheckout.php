<?php

namespace App\Http\Requests\credentials_checkout;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ConfigCredentialsCheckout extends FormRequest
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
            'app_name'      => 'required|string',
            'app_id'        => 'required|string',
            'token'         => 'nullable|string',
            'cliente_id'    => 'nullable|string',
            'cliente_secret'=> 'nullable|string',
            'expires_in'    => 'nullable|string',
            'api_key'       => 'nullable|string'
        ];
    }
}
