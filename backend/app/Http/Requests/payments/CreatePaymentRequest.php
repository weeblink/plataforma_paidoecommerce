<?php

namespace App\Http\Requests\payments;

use App\Classes\Payments\DocumentValidator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

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
     */
    public function rules(): array
    {
        return [
            // Informações do cliente
            'first_name' => ['required', 'string', 'min:2', 'max:50'],
            'last_name' => ['required', 'string', 'min:2', 'max:50'],
            'phone' => ['required', 'string', 'min:10', 'max:15'],
            'email' => ['required', 'email', 'max:255'],
            'document_type' => ['required', 'in:cpf,cnpj'],
            'document_number' => ['required', 'string', 'min:11', 'max:18'],

            // Informações do pedido
            'order' => ['required', 'array'],
            'order.type_product' => ['required', 'in:course,extra,mentorship'],
            'order.product_id' => ['required', 'string'],
            'order.discount_value' => ['required', 'numeric', 'min:0'],
            'order.shipping_value' => ['required', 'numeric', 'min:0'],
            'order.type_payment' => ['required', 'in:credit_card,invoice,pix'],

            // Informações do endereço
            'address' => ['required', 'array'],
            'address.postcode' => ['required', 'string', 'size:8'],
            'address.street' => ['required', 'string', 'min:3', 'max:255'],
            'address.number' => ['required', 'string', 'max:20'],
            'address.complement' => ['nullable', 'string', 'max:255'],
            'address.district' => ['required', 'string', 'min:2', 'max:100'],
            'address.city' => ['required', 'string', 'min:2', 'max:100'],
            'address.state' => ['required', 'string', 'size:2'],

            // Informações do cartão (condicional)
            'card' => ['nullable', 'array'],
            'card.number' => ['required_if:order.type_payment,credit_card', 'nullable', 'string', 'min:13', 'max:19'],
            'card.cvv' => ['required_if:order.type_payment,credit_card', 'nullable', 'string', 'min:3', 'max:4'],
            'card.expiration_month' => ['required_if:order.type_payment,credit_card', 'nullable', 'string', 'size:2'],
            'card.expiration_year' => ['required_if:order.type_payment,credit_card', 'nullable', 'string', 'size:2'],
            'card.holder_document_number' => ['required_if:order.type_payment,credit_card', 'nullable', 'string', 'min:11', 'max:14'],
            'card.holder_name' => ['required_if:order.type_payment,credit_card', 'nullable', 'string', 'min:3', 'max:100'],
            'card.installments' => ['required_if:order.type_payment,credit_card', 'nullable', 'integer', 'min:1', 'max:12'],
        ];
    }

    /**
     * Get custom validation messages
     */
    public function messages(): array
    {
        return [
            // Cliente
            'first_name.required' => 'O nome é obrigatório',
            'first_name.min' => 'O nome deve ter no mínimo 2 caracteres',
            'last_name.required' => 'O sobrenome é obrigatório',
            'last_name.min' => 'O sobrenome deve ter no mínimo 2 caracteres',
            'phone.required' => 'O telefone é obrigatório',
            'email.required' => 'O email é obrigatório',
            'email.email' => 'Email inválido',
            'document_type.required' => 'O tipo de documento é obrigatório',
            'document_type.in' => 'Tipo de documento inválido',
            'document_number.required' => 'O número do documento é obrigatório',

            // Pedido
            'order.required' => 'Informações do pedido são obrigatórias',
            'order.type_product.required' => 'O tipo de produto é obrigatório',
            'order.type_product.in' => 'Tipo de produto inválido',
            'order.product_id.required' => 'O ID do produto é obrigatório',
            'order.type_payment.required' => 'O tipo de pagamento é obrigatório',
            'order.type_payment.in' => 'Tipo de pagamento inválido',

            // Endereço
            'address.required' => 'O endereço é obrigatório',
            'address.postcode.required' => 'O CEP é obrigatório',
            'address.postcode.size' => 'CEP inválido',
            'address.street.required' => 'A rua é obrigatória',
            'address.number.required' => 'O número é obrigatório',
            'address.district.required' => 'O bairro é obrigatório',
            'address.city.required' => 'A cidade é obrigatória',
            'address.state.required' => 'O estado é obrigatório',
            'address.state.size' => 'Estado inválido',

            // Cartão
            'card.number.required_if' => 'O número do cartão é obrigatório',
            'card.cvv.required_if' => 'O CVV é obrigatório',
            'card.expiration_month.required_if' => 'O mês de expiração é obrigatório',
            'card.expiration_year.required_if' => 'O ano de expiração é obrigatório',
            'card.holder_document_number.required_if' => 'O CPF do titular é obrigatório',
            'card.holder_name.required_if' => 'O nome do titular é obrigatório',
            'card.installments.required_if' => 'O número de parcelas é obrigatório',
            'card.installments.min' => 'Número mínimo de parcelas é 1',
            'card.installments.max' => 'Número máximo de parcelas é 12',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            // Validar documento
            if ($this->has('document_number') && $this->has('document_type')) {
                if (!DocumentValidator::validate($this->document_number, $this->document_type)) {
                    $validator->errors()->add(
                        'document_number',
                        'O número do documento informado é inválido'
                    );
                }
            }

            // Validar CPF do titular do cartão (se cartão de crédito)
            if ($this->input('order.type_payment') === 'credit_card') {
                $holderDoc = $this->input('card.holder_document_number');
                if ($holderDoc && !DocumentValidator::validate($holderDoc, 'cpf')) {
                    $validator->errors()->add(
                        'card.holder_document_number',
                        'O CPF do titular do cartão é inválido'
                    );
                }

                // Validar data de expiração
                $month = $this->input('card.expiration_month');
                $year = $this->input('card.expiration_year');

                if ($month && $year) {
                    $currentYear = (int) date('y');
                    $currentMonth = (int) date('m');
                    $expYear = (int) $year;
                    $expMonth = (int) $month;

                    if ($expMonth < 1 || $expMonth > 12) {
                        $validator->errors()->add('card.expiration_month', 'Mês de expiração inválido');
                    }

                    if ($expYear < $currentYear || ($expYear === $currentYear && $expMonth < $currentMonth)) {
                        $validator->errors()->add('card.expiration_month', 'Cartão expirado');
                    }
                }

                // Validar Luhn para número do cartão
                $cardNumber = $this->input('card.number');
                if ($cardNumber && !$this->validateLuhn(preg_replace('/\D/', '', $cardNumber))) {
                    $validator->errors()->add('card.number', 'Número do cartão inválido');
                }
            }

            // Validar CEP (formato brasileiro)
            $postcode = $this->input('address.postcode');
            if ($postcode && !preg_match('/^\d{8}$/', $postcode)) {
                $validator->errors()->add('address.postcode', 'CEP inválido');
            }

            // Validar telefone
            $phone = $this->input('phone');
            if ($phone) {
                $cleanPhone = preg_replace('/\D/', '', $phone);
                if (strlen($cleanPhone) < 10 || strlen($cleanPhone) > 11) {
                    $validator->errors()->add('phone', 'Telefone inválido');
                }
            }
        });
    }

    /**
     * Algoritmo de Luhn para validar número do cartão
     */
    private function validateLuhn(string $number): bool
    {
        $sum = 0;
        $numDigits = strlen($number);
        $parity = $numDigits % 2;

        for ($i = 0; $i < $numDigits; $i++) {
            $digit = (int) $number[$i];

            if ($i % 2 == $parity) {
                $digit *= 2;
            }

            if ($digit > 9) {
                $digit -= 9;
            }

            $sum += $digit;
        }

        return $sum % 10 === 0;
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        $errors = $validator->errors()->all();
        $firstError = $errors[0] ?? 'Dados inválidos';

        throw new HttpResponseException(
            response()->json([
                'error' => $firstError,
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}