<?php

namespace App\Http\Requests\payments;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CreatePaymentRequest extends FormRequest
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
            'first_name'        => 'required|string',
            'last_name'         => 'required|string',
            'phone'             => 'required|string|max:15|min:15',
            'email'             => 'required|string|email|max:255|exists:users,email',
            'document_type'     => 'required|string|in:cpf,cnpj',
            'document_number'   => 'required|string',

            // Order
            'order'                 => 'required|array',
            'order.product_id'      => 'required|string',
            'order.discount_value'  => 'required|numeric',
            'order.shipping_value'  => 'required|numeric',
            'order.type_payment'    => 'required|string|in:credit_card,invoice,pix',
            'order.type_product'    => 'required|string|in:course,extra,mentorship',

            // Card
            'card'                          => 'nullable|array',
            'card.number'                   => 'required_with:card|string|min:16|max:16',
            'card.cvv'                      => 'required_with:card|string|min:3|max:3',
            'card.expiration_month'         => 'required_with:card|string|min:2|max:2',
            'card.expiration_year'          => 'required_with:card|string|min:2|max:2',
            'card.holder_document_number'   => 'required_with:card|string|min:11|max:14',
            'card.holder_name'              => 'required_with:card|string',
            'card.installments'             => 'required_with:card|numeric|min:1|max:12',

            // Address
            'address'               => 'required|array',
            'address.postcode'      => 'required|string|min:8|max:8',
            'address.street'        => 'required|string',
            'address.number'        => 'required|string',
            'address.complement'    => 'nullable|string',
            'address.district'      => 'required|string',
            'address.city'          => 'required|string',
            'address.state'         => 'required|string|max:2',
        ];
    }
}
